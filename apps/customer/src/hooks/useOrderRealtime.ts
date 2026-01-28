/**
 * useOrderRealtime - Subscribe to order status updates via Supabase Realtime
 */

import { useEffect, useState } from 'react';
import { supabase } from '../shared/services/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type OrderStatus = 'placed' | 'received' | 'served' | 'cancelled';

interface OrderUpdate {
    orderId: string;
    status: OrderStatus;
    updatedAt: string;
}

interface UseOrderRealtimeOptions {
    orderId: string;
    enabled?: boolean;
}

interface UseOrderRealtimeResult {
    status: OrderStatus | null;
    lastUpdate: string | null;
    isConnected: boolean;
}

export function useOrderRealtime({ orderId, enabled = true }: UseOrderRealtimeOptions): UseOrderRealtimeResult {
    const [status, setStatus] = useState<OrderStatus | null>(null);
    const [lastUpdate, setLastUpdate] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!enabled || !orderId) return;

        let channel: RealtimeChannel | null = null;

        const subscribe = async () => {
            // Subscribe to order changes
            channel = supabase
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
                        const update = payload.new as { status: OrderStatus; updated_at: string };
                        setStatus(update.status);
                        setLastUpdate(update.updated_at);
                    }
                )
                .subscribe((status) => {
                    setIsConnected(status === 'SUBSCRIBED');
                });
        };

        subscribe();

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [orderId, enabled]);

    return { status, lastUpdate, isConnected };
}

/**
 * Subscribe to multiple orders (for order history page)
 */
export function useOrdersRealtime(orderIds: string[]): Map<string, OrderUpdate> {
    const [updates, setUpdates] = useState<Map<string, OrderUpdate>>(new Map());

    useEffect(() => {
        if (orderIds.length === 0) return;

        const channels: RealtimeChannel[] = [];

        orderIds.forEach((orderId) => {
            const channel = supabase
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
                        const update = payload.new as { id: string; status: OrderStatus; updated_at: string };
                        setUpdates((prev) => {
                            const next = new Map(prev);
                            next.set(update.id, {
                                orderId: update.id,
                                status: update.status,
                                updatedAt: update.updated_at,
                            });
                            return next;
                        });
                    }
                )
                .subscribe();

            channels.push(channel);
        });

        return () => {
            channels.forEach((channel) => supabase.removeChannel(channel));
        };
    }, [orderIds.join(',')]);

    return updates;
}
