/**
 * Venue orders query helpers for packages/db
 * Provides typed data access for order management (vendor view)
 */
import { createClient } from '@supabase/supabase-js';
import type { Order, OrderItem } from '../types';

// Re-export for convenience
export type { Order, OrderItem };

/**
 * Order with items included
 */
export type OrderWithItems = Order & { items: OrderItem[] };

/**
 * Get active orders for a venue (placed, received)
 * @param client - Supabase client instance
 * @param venueId - Venue UUID
 * @returns Array of orders with items, oldest first
 */
export async function getActiveOrders(
    client: ReturnType<typeof createClient>,
    venueId: string
): Promise<OrderWithItems[]> {
    const { data, error } = await client
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('venue_id', venueId)
        .in('status', ['placed', 'received'])
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching active orders:', error.message);
        return [];
    }

    return (data ?? []) as OrderWithItems[];
}

/**
 * Get served orders for a venue (completed)
 * @param client - Supabase client instance
 * @param venueId - Venue UUID
 * @param limit - Max orders to return (default: 20)
 * @returns Array of orders with items, newest first
 */
export async function getServedOrders(
    client: ReturnType<typeof createClient>,
    venueId: string,
    limit = 20
): Promise<OrderWithItems[]> {
    const { data, error } = await client
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('venue_id', venueId)
        .eq('status', 'served')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching served orders:', error.message);
        return [];
    }

    return (data ?? []) as OrderWithItems[];
}

/**
 * Update order status
 * @param client - Supabase client instance
 * @param orderId - Order UUID
 * @param status - New status
 * @returns Updated order or null on error
 */
export async function updateOrderStatus(
    client: ReturnType<typeof createClient>,
    orderId: string,
    status: Order['status']
): Promise<Order | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (client as any)
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

    if (error) {
        console.error('Error updating order status:', error.message);
        return null;
    }

    return data as Order;
}

/**
 * Subscribe to order changes for a venue (realtime)
 * @param client - Supabase client instance
 * @param venueId - Venue UUID
 * @param onInsert - Callback when new order is placed
 * @param onUpdate - Callback when order is updated
 * @returns Cleanup function to unsubscribe
 */
export function subscribeToVenueOrders(
    client: ReturnType<typeof createClient>,
    venueId: string,
    onInsert?: (order: Order) => void,
    onUpdate?: (order: Order) => void
): () => void {
    const channel = client
        .channel(`venue-orders:${venueId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'orders',
                filter: `venue_id=eq.${venueId}`,
            },
            (payload) => {
                onInsert?.(payload.new as Order);
            }
        )
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `venue_id=eq.${venueId}`,
            },
            (payload) => {
                onUpdate?.(payload.new as Order);
            }
        )
        .subscribe();

    return () => {
        channel.unsubscribe();
    };
}
