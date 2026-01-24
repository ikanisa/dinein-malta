import { useEffect, useState } from 'react';
import { supabase } from '@/shared/services/supabase';
import { type OrderStatus } from '@/shared/components/StatusBadge';

export function useOrderSubscription(orderId: string, initialStatus: OrderStatus) {
    const [status, setStatus] = useState<OrderStatus>(initialStatus);

    useEffect(() => {
        if (!orderId) return;

        const channel = supabase
            .channel(`order-${orderId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `id=eq.${orderId}`
                },
                (payload) => {
                    if (payload.new && payload.new.status) {
                        setStatus(payload.new.status as OrderStatus);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [orderId]);

    // Optional: Refresh on mount to ensure freshness
    useEffect(() => {
        if (!orderId) return;

        async function fetchStatus() {
            const { data } = await supabase
                .from('orders')
                .select('status')
                .eq('id', orderId)
                .single();

            if (data?.status) {
                setStatus(data.status as OrderStatus);
            }
        }
        fetchStatus();
    }, [orderId]);

    return status;
}
