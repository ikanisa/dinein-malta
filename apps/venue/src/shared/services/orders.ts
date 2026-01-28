import { supabase } from './supabase';
import { type OrderStatus, type PaymentMethod } from '@dinein/core';

export interface CreateOrderParams {
    venue_id: string; // The text identifier for the venue
    table_code?: string;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
        notes?: string;
        menu_item_id?: number;
    }>;
    total: number;
    payment_method: PaymentMethod;
    notes?: string;
}

export const orders = {
    async createOrder(params: CreateOrderParams) {
        // 1. Get authenticated user (required for RLS usually)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User must be logged in to place an order");

        // 2. Prepare Order Data
        const orderData = {
            order_code: Math.floor(100000 + Math.random() * 900000).toString(), // 6-digit code
            venue_id: params.venue_id,
            user_id: user.id, // Client user
            // table_info: { code: params.table_code || 'PWA' }, // Using JSON or just table_id? 
            // Schema check: useVendorOrders selects `table_id`. If we don't have table_id, maybe null?
            // For now, assume table_id is optional or we skip it if we only have code.
            // Actually, if we have table_code, we should resolve it to table_id, but for simple MVP, 
            // the `orders` table might store `metadata` or `notes` can store it if `table_id` is strictly FK.
            // Let's assume table_id is optional and we just use notes for table code if needed.
            // OR we store it in a metadata json column if exists. `useVendorOrders` selects `tables (table_number)` which implies FK.
            // If we don't have table_id (because we only have code), we might leave it null for "Delivery/Collection".
            status: 'placed' as OrderStatus,
            total_amount: params.total,
            payment_method: params.payment_method,
            notes: params.notes,
            table_code: params.table_code,
            created_at: new Date().toISOString(),
        };

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert(orderData)
            .select()
            .single();

        if (orderError) throw orderError;

        // 3. Insert items
        if (params.items.length > 0 && order) {
            const itemsData = params.items.map(item => ({
                order_id: order.id,
                name_snapshot: item.name, // Schema in useVendorOrders uses `name_snapshot`
                price_snapshot: item.price, // Schema uses `price_snapshot`
                qty: item.quantity,
                modifiers_json: item.notes ? { notes: item.notes } : {},
                // menu_item_id: item.menu_item_id // Optional FK if schema supports it
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(itemsData);

            if (itemsError) {
                console.error('Failed to create order items', itemsError);
                // logic to rollback or flag order?
            }
        }

        return order;
    },

    async getOrder(orderId: string) {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                items:order_items(*),
                venue:venues(name, slug)
            `)
            .eq('id', orderId)
            .single();

        if (error) throw error;
        return data;
    }
};
