/**
 * Cart Manager for AI-Assisted Ordering
 * 
 * Handles cart operations for Moltbot guest agent:
 * - Add/remove items
 * - Get cart contents
 * - Place orders from cart
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// =============================================================================
// TYPES
// =============================================================================

export interface CartItem {
    item_id: string;
    name: string;
    quantity: number;
    unit_price: number;
    notes?: string;
    add_ons?: string[];
}

export interface Cart {
    id: string;
    user_id: string | null;
    venue_id: string;
    items: CartItem[];
    subtotal: number;
    currency: string;
    table_no?: string;
    created_at: string;
    updated_at: string;
}

export interface CartContext {
    user_id?: string;
    venue_id: string;
    table_no?: string;
}

export interface CartOperationResult {
    success: boolean;
    data?: unknown;
    error?: string;
}

// =============================================================================
// GET CART
// =============================================================================

export async function getCart(
    context: CartContext,
    supabase: SupabaseClient
): Promise<CartOperationResult> {
    try {
        const { data, error } = await supabase
            .from("user_carts")
            .select("*")
            .eq("venue_id", context.venue_id)
            .eq("user_id", context.user_id || null)
            .maybeSingle();

        if (error && error.code !== "PGRST116") {
            return { success: false, error: error.message };
        }

        if (!data) {
            return {
                success: true,
                data: {
                    items: [],
                    subtotal: 0,
                    currency: "EUR",
                    message: "Your cart is empty",
                },
            };
        }

        const items = (data.items as CartItem[]) || [];
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

        return {
            success: true,
            data: {
                cart_id: data.id,
                items,
                subtotal: data.subtotal,
                currency: data.currency,
                item_count: itemCount,
                message: items.length > 0
                    ? `You have ${itemCount} item(s) in your cart totaling ${data.currency}${data.subtotal.toFixed(2)}`
                    : "Your cart is empty",
            },
        };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to get cart" };
    }
}

// =============================================================================
// ADD TO CART
// =============================================================================

export async function addToCart(
    input: { item_id: string; quantity?: number; notes?: string; add_ons?: string[] },
    context: CartContext,
    supabase: SupabaseClient
): Promise<CartOperationResult> {
    try {
        const { item_id, quantity = 1, notes, add_ons } = input;

        // 1. Get menu item details
        const { data: menuItem, error: menuError } = await supabase
            .from("menu_items")
            .select("id, name, price, currency, available")
            .eq("id", item_id)
            .eq("venue_id", context.venue_id)
            .single();

        if (menuError || !menuItem) {
            return { success: false, error: "Menu item not found" };
        }

        if (!menuItem.available) {
            return { success: false, error: `${menuItem.name} is currently unavailable` };
        }

        // 2. Get or create cart
        let { data: cart } = await supabase
            .from("user_carts")
            .select("*")
            .eq("venue_id", context.venue_id)
            .eq("user_id", context.user_id || null)
            .maybeSingle();

        const cartItems: CartItem[] = cart ? (cart.items as CartItem[]) || [] : [];

        // 3. Check if item already in cart
        const existingIndex = cartItems.findIndex(item => item.item_id === item_id);

        const newItem: CartItem = {
            item_id,
            name: menuItem.name,
            quantity,
            unit_price: menuItem.price,
            notes,
            add_ons,
        };

        if (existingIndex >= 0) {
            // Update existing item quantity
            cartItems[existingIndex].quantity += quantity;
            if (notes) cartItems[existingIndex].notes = notes;
            if (add_ons) cartItems[existingIndex].add_ons = add_ons;
        } else {
            // Add new item
            cartItems.push(newItem);
        }

        // 4. Calculate new subtotal
        const subtotal = cartItems.reduce(
            (sum, item) => sum + item.unit_price * item.quantity,
            0
        );

        // 5. Upsert cart
        const { data: updatedCart, error: upsertError } = await supabase
            .from("user_carts")
            .upsert({
                id: cart?.id,
                user_id: context.user_id || null,
                venue_id: context.venue_id,
                items: cartItems,
                subtotal,
                currency: menuItem.currency,
                table_no: context.table_no,
            }, {
                onConflict: "user_id,venue_id",
            })
            .select()
            .single();

        if (upsertError) {
            return { success: false, error: upsertError.message };
        }

        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

        return {
            success: true,
            data: {
                cart_id: updatedCart.id,
                added_item: menuItem.name,
                quantity,
                item_count: totalItems,
                subtotal,
                currency: menuItem.currency,
                message: `Added ${quantity}x ${menuItem.name} to cart. Cart total: ${menuItem.currency}${subtotal.toFixed(2)}`,
            },
        };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to add to cart" };
    }
}

// =============================================================================
// REMOVE FROM CART
// =============================================================================

export async function removeFromCart(
    input: { item_id?: string; item_name?: string; quantity?: number },
    context: CartContext,
    supabase: SupabaseClient
): Promise<CartOperationResult> {
    try {
        const { item_id, item_name, quantity } = input;

        // 1. Get cart
        const { data: cart, error: cartError } = await supabase
            .from("user_carts")
            .select("*")
            .eq("venue_id", context.venue_id)
            .eq("user_id", context.user_id || null)
            .single();

        if (cartError || !cart) {
            return { success: false, error: "Cart not found or empty" };
        }

        let cartItems: CartItem[] = (cart.items as CartItem[]) || [];

        // 2. Find the item
        const itemIndex = cartItems.findIndex(item =>
            (item_id && item.item_id === item_id) ||
            (item_name && item.name.toLowerCase().includes(item_name.toLowerCase()))
        );

        if (itemIndex < 0) {
            return { success: false, error: "Item not found in cart" };
        }

        const removedItem = cartItems[itemIndex];
        let removedQuantity = quantity || removedItem.quantity;

        // 3. Remove or reduce quantity
        if (!quantity || quantity >= removedItem.quantity) {
            // Remove entirely
            cartItems.splice(itemIndex, 1);
            removedQuantity = removedItem.quantity;
        } else {
            // Reduce quantity
            cartItems[itemIndex].quantity -= quantity;
        }

        // 4. Calculate new subtotal
        const subtotal = cartItems.reduce(
            (sum, item) => sum + item.unit_price * item.quantity,
            0
        );

        // 5. Update cart
        const { error: updateError } = await supabase
            .from("user_carts")
            .update({
                items: cartItems,
                subtotal,
            })
            .eq("id", cart.id);

        if (updateError) {
            return { success: false, error: updateError.message };
        }

        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

        return {
            success: true,
            data: {
                removed_item: removedItem.name,
                removed_quantity: removedQuantity,
                item_count: totalItems,
                subtotal,
                currency: cart.currency,
                message: `Removed ${removedQuantity}x ${removedItem.name}. Cart total: ${cart.currency}${subtotal.toFixed(2)}`,
            },
        };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to remove from cart" };
    }
}

// =============================================================================
// CLEAR CART
// =============================================================================

export async function clearCart(
    context: CartContext,
    supabase: SupabaseClient
): Promise<CartOperationResult> {
    try {
        const { error } = await supabase
            .from("user_carts")
            .delete()
            .eq("venue_id", context.venue_id)
            .eq("user_id", context.user_id || null);

        if (error) {
            return { success: false, error: error.message };
        }

        return {
            success: true,
            data: { message: "Cart cleared" },
        };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to clear cart" };
    }
}

// =============================================================================
// PLACE ORDER
// =============================================================================

export async function placeOrder(
    input: { payment_method: string },
    context: CartContext,
    supabase: SupabaseClient
): Promise<CartOperationResult> {
    try {
        const { payment_method } = input;

        // Validate payment method
        const validMethods = ["cash", "momo_ussd", "revolut_link"];
        if (!validMethods.includes(payment_method)) {
            return {
                success: false,
                error: `Invalid payment method. Please choose: ${validMethods.join(", ")}`
            };
        }

        // 1. Get cart
        const { data: cart, error: cartError } = await supabase
            .from("user_carts")
            .select("*")
            .eq("venue_id", context.venue_id)
            .eq("user_id", context.user_id || null)
            .single();

        if (cartError || !cart) {
            return { success: false, error: "Cart is empty. Add items before placing an order." };
        }

        const cartItems: CartItem[] = (cart.items as CartItem[]) || [];
        if (cartItems.length === 0) {
            return { success: false, error: "Cart is empty" };
        }

        // 2. Create order
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
                venue_id: context.venue_id,
                user_id: context.user_id || null,
                table_number: context.table_no,
                status: "placed",
                total: cart.subtotal,
                currency: cart.currency,
                payment_method,
            })
            .select("id, status, total, currency")
            .single();

        if (orderError) {
            return { success: false, error: `Failed to create order: ${orderError.message}` };
        }

        // 3. Create order items
        const orderItems = cartItems.map(item => ({
            order_id: order.id,
            menu_item_id: item.item_id,
            name_snapshot: item.name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            notes: item.notes,
        }));

        const { error: itemsError } = await supabase
            .from("order_items")
            .insert(orderItems);

        if (itemsError) {
            // Rollback order
            await supabase.from("orders").delete().eq("id", order.id);
            return { success: false, error: `Failed to create order items: ${itemsError.message}` };
        }

        // 4. Clear cart
        await supabase
            .from("user_carts")
            .delete()
            .eq("id", cart.id);

        // 5. Build response message
        let paymentMessage = "";
        switch (payment_method) {
            case "cash":
                paymentMessage = "Please pay with cash when your order is served.";
                break;
            case "momo_ussd":
                paymentMessage = "Please use MoMo Mobile Money to complete payment.";
                break;
            case "revolut_link":
                paymentMessage = "A Revolut payment link will be sent to you.";
                break;
        }

        return {
            success: true,
            data: {
                order_id: order.id,
                status: order.status,
                total: order.total,
                currency: order.currency,
                item_count: cartItems.reduce((sum, item) => sum + item.quantity, 0),
                payment_method,
                message: `🎉 Order placed! Your order #${order.id.slice(0, 8)} for ${order.currency}${order.total.toFixed(2)} has been sent to the kitchen. ${paymentMessage}`,
            },
        };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to place order" };
    }
}
