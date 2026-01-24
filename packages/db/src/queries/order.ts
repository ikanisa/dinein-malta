/**
 * Order query helpers for packages/db
 * Provides typed data access for order-related operations
 */
import { createClient } from '@supabase/supabase-js';
import type { Order, OrderItem } from '../types';

// Re-export for convenience
export type { Order, OrderItem };

/**
 * Order creation payload (what the customer provides)
 */
export interface CreateOrderPayload {
    venue_id: string;
    table_no?: string;
    payment_method: 'cash' | 'momo' | 'revolut';
    items: Array<{
        menu_item_id: string;
        name: string;
        quantity: number;
        price: number;
        currency: 'RWF' | 'EUR';
    }>;
}

/**
 * Create an order via the order_create edge function
 * @param client - Supabase client instance
 * @param payload - Order details
 * @returns Created order or null on error
 */
export async function createOrder(
    client: ReturnType<typeof createClient>,
    payload: CreateOrderPayload
): Promise<Order | null> {
    // Calculate total from items
    const total_amount = payload.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    // Determine currency from first item (all items should have same currency per venue)
    const currency = payload.items[0]?.currency ?? 'RWF';

    const { data, error } = await client.functions.invoke('order_create', {
        body: {
            venue_id: payload.venue_id,
            table_no: payload.table_no,
            payment_method: payload.payment_method,
            total_amount,
            currency,
            items: payload.items,
        },
    });

    if (error) {
        console.error('Error creating order:', error.message);
        return null;
    }

    return data as Order;
}

/**
 * Get order by ID
 * @param client - Supabase client instance
 * @param orderId - Order UUID
 * @returns Order with items or null if not found
 */
export async function getOrder(
    client: ReturnType<typeof createClient>,
    orderId: string
): Promise<Order | null> {
    const { data, error } = await client
        .from('orders')
        .select(`
            *,
            items:order_items(*)
        `)
        .eq('id', orderId)
        .single();

    if (error || !data) {
        console.error('Error fetching order:', error?.message);
        return null;
    }

    return data as Order;
}

/**
 * Get orders for a customer (anonymous, by session/device)
 * Note: This queries recent orders without auth, scoped by venue
 * @param client - Supabase client instance
 * @param venueId - Venue UUID
 * @param limit - Max orders to return (default: 10)
 * @returns Array of orders, newest first
 */
export async function getRecentOrders(
    client: ReturnType<typeof createClient>,
    venueId: string,
    limit = 10
): Promise<Order[]> {
    const { data, error } = await client
        .from('orders')
        .select('*')
        .eq('venue_id', venueId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching orders:', error.message);
        return [];
    }

    return (data ?? []) as Order[];
}

/**
 * Subscribe to order status changes (realtime)
 * @param client - Supabase client instance
 * @param orderId - Order UUID to watch
 * @param onUpdate - Callback when order status changes
 * @returns Cleanup function to unsubscribe
 */
export function subscribeToOrder(
    client: ReturnType<typeof createClient>,
    orderId: string,
    onUpdate: (order: Order) => void
): () => void {
    const channel = client
        .channel(`order:${orderId}`)
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `id=eq.${orderId}`,
            },
            (payload) => {
                onUpdate(payload.new as Order);
            }
        )
        .subscribe();

    return () => {
        channel.unsubscribe();
    };
}
