import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../shared/services/supabase';
import { useOwner } from '../context/OwnerContext';


export interface VendorStats {
    activeOrders: number;
    totalRevenue: number;
    tableOccupancy: number; // Not yet implemented (requires live session tracking)
    trends: {
        revenue: string;
        orders: string;
    }
}

export function useVendorStats() {
    const { venue } = useOwner();
    const [stats, setStats] = useState<VendorStats>({
        activeOrders: 0,
        totalRevenue: 0,
        tableOccupancy: 0,
        trends: { revenue: '+0%', orders: '+0%' } // Defaults
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        if (!venue) return;
        setLoading(true);

        try {
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

            // 1. Active Orders (placed, received)
            const { count: activeCount } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('venue_id', venue.id)
                .in('status', ['placed', 'received']);

            // 2. Today's Revenue (served orders today)
            const { data: todayOrders } = await supabase
                .from('orders')
                .select('total_amount')
                .eq('venue_id', venue.id)
                .gte('created_at', startOfDay);

            const revenue = (todayOrders || []).reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

            // 3. Trends (Simulated for this slice as we don't have historical aggregation yet)
            // Implementation: Simple comparison logic would go here

            setStats(prev => ({
                ...prev,
                activeOrders: activeCount || 0,
                totalRevenue: revenue,
                // Table occupancy not yet tracked (requires live session management)
                tableOccupancy: 0
            }));

        } catch (err) {
            console.error('Error loading vendor stats', err);
        } finally {
            setLoading(false);
        }
    }, [venue]);

    useEffect(() => {
        fetchStats();

        // Subscribe to real-time changes if needed?
        // For MVP slice, fetch on mount is okay.
    }, [fetchStats]);

    return { stats, loading, refresh: fetchStats };
}
