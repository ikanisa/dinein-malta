import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../shared/services/supabase';

// DB types
export type OrderStatus = 'new' | 'received' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled' | 'paid'; // Mapped from DB enum

export interface OrderItem {
    id: string;
    name_snapshot: string;
    price_snapshot: number;
    qty: number;
    modifiers_json?: Record<string, unknown>;
}

export interface Order {
    id: string;
    order_code: string;
    status: OrderStatus; // DB enum: received, served, cancelled - wait, UI has more states?
    total_amount: number;
    created_at: string;
    table_id?: string;
    notes?: string;
    // Joins
    tables?: { table_number: number; label: string };
    order_items: OrderItem[];
}

export function useVendorOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [vendorId, setVendorId] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        try {
            // 1. Auth & Vendor Lookup (similar to useVendorMenu)
            // Optimization: In a real app, we'd store vendorId in context/global state
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            // We only fetch vendor ID once if explicit, but here we re-verify or cache
            let vId = vendorId;
            if (!vId) {
                const { data: vendorUser } = await supabase
                    .from('vendor_users')
                    .select('vendor_id')
                    .eq('auth_user_id', user.id)
                    .maybeSingle();

                if (vendorUser) {
                    vId = vendorUser.vendor_id;
                    setVendorId(vId);
                } else {
                    setLoading(false);
                    return;
                }
            }

            if (!vId) return;

            // 2. Fetch Orders
            const { data, error: fetchError } = await supabase
                .from('orders')
                .select(`
                    id, order_code, status, total_amount, created_at, notes, table_id,
                    tables (table_number, label),
                    order_items (id, name_snapshot, price_snapshot, qty, modifiers_json)
                `)
                .eq('vendor_id', vId)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setOrders(data as any);
        } catch (err: unknown) {
            console.error('Error fetching orders:', err);
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [vendorId]);

    useEffect(() => {
        fetchOrders();
        // Setup polling
        const interval = setInterval(fetchOrders, 15000); // 15s refresh
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            // Optimistic update
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));

            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;
        } catch (err) {
            console.error('Failed to update status:', err);
            fetchOrders(); // Revert
        }
    };

    return {
        orders,
        loading,
        error,
        updateOrderStatus,
        refresh: fetchOrders
    };
}
