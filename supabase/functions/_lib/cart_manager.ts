/**
 * Cart Manager for AI-Assisted Ordering
 * 
 * Handles cart operations for Moltbot guest agent:
 * - Add/remove items
 * - Get cart contents
 * - Place orders from cart
 * 
 * Uses normalized schema (carts + cart_lines) introduced in V1 backend.
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
    line_total?: number;
}

export interface Cart {
    id: string;
    user_id: string | null;
    venue_id: string;
    items: CartItem[];
    subtotal: number;
    currency: string;
    table_no?: string; // Implicit from visit or context
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
        if (!context.user_id) {
            return { success: true, data: { items: [], subtotal: 0, currency: "EUR", message: "No active user" } };
        }

        const { data: cartData, error } = await supabase
            .from("carts")
            .select(`
                id, venue_id, user_id, updated_at,
                lines:cart_lines (
                    id, item_id, qty, notes, selected_addon_ids_json, line_total_cached,
                    item:menu_items ( id, name, price, currency )
                )
            `)
            .eq("venue_id", context.venue_id)
            .eq("user_id", context.user_id)
            .maybeSingle();

        if (error && error.code !== "PGRST116") {
            return { success: false, error: error.message };
        }

        if (!cartData) {
            return {
                success: true,
                data: {
                    items: [],
                    subtotal: 0,
                    currency: "EUR", // Default or fetch from venue
                    message: "Your cart is empty",
                },
            };
        }

        // Transform to friendly format
        let currency = "EUR";
        let subtotal = 0;
        const items: CartItem[] = [];

        if (cartData.lines && Array.isArray(cartData.lines)) {
            for (const line of cartData.lines) {
                // @ts-ignore: joined data structure
                const menuItem = line.item;
                if (!menuItem) continue;

                if (!currency && menuItem.currency) currency = menuItem.currency;
                else if (menuItem.currency) currency = menuItem.currency;

                const qty = line.qty || 1;
                const price = menuItem.price || 0;
                const lineTotal = price * qty; // Simple calculation, ignores addons price for now
                subtotal += lineTotal;

                items.push({
                    item_id: menuItem.id,
                    name: menuItem.name,
                    quantity: qty,
                    unit_price: price,
                    notes: line.notes,
                    add_ons: line.selected_addon_ids_json,
                    line_total: lineTotal,
                });
            }
        }

        return {
            success: true,
            data: {
                cart_id: cartData.id,
                items,
                subtotal,
                currency,
                item_count: items.reduce((sum, i) => sum + i.quantity, 0),
                message: items.length > 0
                    ? `You have ${items.length} item(s) in your cart.`
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

        if (!context.user_id) {
            return { success: false, error: "User ID required to add to cart" };
        }

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
        let cartId: string;
        const { data: existingCart } = await supabase
            .from("carts")
            .select("id")
            .eq("venue_id", context.venue_id)
            .eq("user_id", context.user_id)
            .maybeSingle();

        if (existingCart) {
            cartId = existingCart.id;
        } else {
            // Create new cart
            const { data: newCart, error: createError } = await supabase
                .from("carts")
                .insert({
                    venue_id: context.venue_id,
                    user_id: context.user_id,
                    // visit_id should be linked here if we had it. 
                    // ideally we fetch active visit first. 
                    // for now we rely on user_id relationship.
                })
                .select("id")
                .single();

            if (createError) throw new Error(createError.message);
            cartId = newCart.id;
        }

        // 3. Upsert Line Item
        // Check if exact item exists (same notes/addons logic is complex, for MVP we check item_id)
        // If notes/addons differ, proper logic is new line. 
        // For simplicity/MVP: if item_id exists, we update qty. notes overwritten.

        const { data: existingLine } = await supabase
            .from("cart_lines")
            .select("id, qty")
            .eq("cart_id", cartId)
            .eq("item_id", item_id)
            .maybeSingle();

        if (existingLine) {
            await supabase
                .from("cart_lines")
                .update({
                    qty: existingLine.qty + quantity,
                    notes: notes || undefined, // Only update if provided
                    selected_addon_ids_json: add_ons || undefined,
                    updated_at: new Date().toISOString()
                })
                .eq("id", existingLine.id);
        } else {
            await supabase
                .from("cart_lines")
                .insert({
                    cart_id: cartId,
                    item_id: item_id,
                    qty: quantity,
                    notes,
                    selected_addon_ids_json: add_ons || [],
                    line_total_cached: menuItem.price * quantity
                });
        }

        // Return updated cart
        return await getCart(context, supabase);
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

        const { data: cartResult } = await getCart(context, supabase);
        // @ts-ignore
        if (!cartResult || !cartResult.success || !cartResult.data?.items) {
            return { success: false, error: "Cart not found" };
        }

        // @ts-ignore
        const items = cartResult.data.items as CartItem[];
        // @ts-ignore
        const cartId = cartResult.data.cart_id;

        const targetItem = items.find(i =>
            (item_id && i.item_id === item_id) ||
            (item_name && i.name.toLowerCase().includes(item_name.toLowerCase()))
        );

        if (!targetItem) {
            return { success: false, error: "Item not found in cart" };
        }

        // Logic
        let newQty = targetItem.quantity;
        if (quantity && quantity < targetItem.quantity) {
            newQty = targetItem.quantity - quantity;
            // Update line
            await supabase
                .from("cart_lines")
                .update({ qty: newQty })
                .eq("cart_id", cartId)
                .eq("item_id", targetItem.item_id);
        } else {
            // Remove line
            newQty = 0;
            await supabase
                .from("cart_lines")
                .delete()
                .eq("cart_id", cartId)
                .eq("item_id", targetItem.item_id);
        }

        return await getCart(context, supabase);

    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to remove from cart" };
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

        // Get Cart
        const cartRes = await getCart(context, supabase);
        // @ts-ignore
        if (!cartRes.success || !cartRes.data?.items.length) {
            return { success: false, error: "Cart is empty" };
        }

        // @ts-ignore
        const { items, subtotal, currency, cart_id } = cartRes.data;

        // Check Idempotency if provided
        // (For MVP, we just proceed. Real implementation needs a transaction or RPC)

        // Create Order
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
                venue_id: context.venue_id,
                user_id: context.user_id,
                table_number: context.table_no,
                status: "placed",
                total: subtotal,
                currency: currency,
                payment_method,
                // store cart_id or hash if possible to prevent dupes?
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // Create Items
        const orderItems = (items as CartItem[]).map(i => ({
            order_id: order.id,
            menu_item_id: i.item_id,
            name_snapshot: i.name,
            quantity: i.quantity,
            unit_price: i.unit_price,
            notes: i.notes,
            line_total: i.unit_price * i.quantity // simplified
        }));

        const { error: linesError } = await supabase.from("order_items").insert(orderItems);
        if (linesError) throw linesError;

        // Delete Cart
        await supabase.from("carts").delete().eq("id", cart_id);

        // Build response message
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
                message: `Order placed! #${order.id.slice(0, 8)}. ${paymentMessage}`
            }
        };

    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to place order" };
    }
}
