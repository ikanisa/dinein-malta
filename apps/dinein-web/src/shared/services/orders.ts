
import { supabase } from './supabase';
import { type OrderStatus } from '@/shared/components/StatusBadge';

export interface CreateOrderParams {
    venue_id: string; // Used to look up vendor_id/table
    table_code?: string;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
        notes?: string;
        menu_item_id?: number;
    }>;
    total: number;
    payment_method: string;
    notes?: string;
}

export const orders = {
    async createOrder(params: CreateOrderParams) {
        // 1. Get vendor and table info if needed (mock lookup for now or simple pass-through)
        // In real app, we might need to look up venue_id -> id

        const orderData = {
            order_code: Math.floor(1000 + Math.random() * 9000).toString(), // Simple mock code
            table_info: { code: params.table_code || 'PWA' },
            status: 'new' as OrderStatus,
            total_amount: params.total,
            payment_method: params.payment_method,
            notes: params.notes,
            created_at: new Date().toISOString(),
            // vendor_id: ... // Would need to be resolved from venue_slug
        };

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert(orderData)
            .select()
            .single();

        if (orderError) throw orderError;

        // 2. Insert items
        if (params.items.length > 0 && order) {
            const itemsData = params.items.map(item => ({
                order_id: order.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                notes: item.notes
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
    }
};
