import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../shared/services/supabase';
import { Order, OrderItem } from '@dinein/db';
import { useOwner } from '../context/OwnerContext';
import { toast } from 'sonner';

export type OrderWithItems = Order & { items: OrderItem[] };

export function useOrders() {
    const { venue } = useOwner();
    const [activeOrders, setActiveOrders] = useState<OrderWithItems[]>([]);
    const [servedOrders, setServedOrders] = useState<OrderWithItems[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = useCallback(async () => {
        if (!venue) return;
        setLoading(true);
        try {
            // Fetch Active Orders (placed, received)
            const { data: active, error: activeError } = await supabase
                .from('orders')
                .select('*, items:order_items(*)')
                .eq('venue_id', venue.id)
                .in('status', ['placed', 'received'])
                .order('created_at', { ascending: true }); // Oldest first for queue

            if (activeError) throw activeError;

            // Fetch Served Orders (served) - limit to last 20 for performance
            const { data: served, error: servedError } = await supabase
                .from('orders')
                .select('*, items:order_items(*)')
                .eq('venue_id', venue.id)
                .eq('status', 'served')
                .order('created_at', { ascending: false })
                .limit(20);

            if (servedError) throw servedError;

            setActiveOrders(active as OrderWithItems[] || []);
            setServedOrders(served as OrderWithItems[] || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            // toast.error('Failed to load orders'); // Suppress to avoid spam on mount if offline
        } finally {
            setLoading(false);
        }
    }, [venue]);

    // Update Status
    const updateOrderStatus = async (orderId: string, status: Order['status']) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', orderId);

            if (error) throw error;

            // UI Update is handled by Realtime subscription ideally, but we can optimistically update too
            // For KDS, reliable state is key, let's wait for fetch or subscription
            // Actually, we should optimistic update for snappy feel

            toast.success(`Order marked as ${status}`);
            fetchOrders();
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Failed to update order');
        }
    };

    // Realtime Subscription
    useEffect(() => {
        if (!venue) return;

        fetchOrders();

        const channel = supabase
            .channel('orders-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `venue_id=eq.${venue.id}`
                },
                () => {
                    // On any change, just refetch for simplicity and correctness (including items join)
                    // Optimization: We could handle partial updates, but fetching is safer for "Joined" data
                    fetchOrders();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [venue, fetchOrders]);

    return {
        activeOrders,
        servedOrders,
        loading,
        updateOrderStatus,
        refresh: fetchOrders
    };
}
