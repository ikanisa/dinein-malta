/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';

interface AnalyticsData {
  revenue: number;
  orderCount: number;
  averageOrderValue: number;
  topSellers: Array<{ name: string; quantity: number; revenue: number }>;
  hourlyStats: Array<{ hour: number; orders: number; revenue: number }>;
}

interface UseAnalyticsOptions {
  venueId: string | null;
  dateRange: { start: Date; end: Date };
}

export const useAnalytics = ({ venueId, dateRange }: UseAnalyticsOptions) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!venueId) return;

    setLoading(true);
    setError(null);

    try {
      const startDate = dateRange.start.toISOString();
      const endDate = dateRange.end.toISOString();

      // Fetch orders in date range
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          created_at,
          order_items (
            name_snapshot,
            price_snapshot,
            qty
          )
        `)
        .eq('vendor_id', venueId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Calculate revenue and order count
      const orders = ordersData || [];
      const revenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
      const orderCount = orders.length;
      const averageOrderValue = orderCount > 0 ? revenue / orderCount : 0;

      // Calculate top sellers
      const itemStats: Record<string, { quantity: number; revenue: number }> = {};
      orders.forEach((order: any) => {
        if (order.order_items && Array.isArray(order.order_items)) {
          order.order_items.forEach((item: any) => {
            const name = item.name_snapshot;
            const qty = item.qty || 1;
            const price = parseFloat(item.price_snapshot || 0);
            if (!itemStats[name]) {
              itemStats[name] = { quantity: 0, revenue: 0 };
            }
            itemStats[name].quantity += qty;
            itemStats[name].revenue += price * qty;
          });
        }
      });

      const topSellers = Object.entries(itemStats)
        .map(([name, stats]) => ({
          name,
          quantity: stats.quantity,
          revenue: stats.revenue,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Calculate hourly stats
      const hourlyStats: Record<number, { orders: number; revenue: number }> = {};
      orders.forEach((order: any) => {
        const date = new Date(order.created_at);
        const hour = date.getHours();
        if (!hourlyStats[hour]) {
          hourlyStats[hour] = { orders: 0, revenue: 0 };
        }
        hourlyStats[hour].orders += 1;
        hourlyStats[hour].revenue += parseFloat(order.total_amount || 0);
      });

      const hourlyArray = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        orders: hourlyStats[i]?.orders || 0,
        revenue: hourlyStats[i]?.revenue || 0,
      }));

      setData({
        revenue,
        orderCount,
        averageOrderValue,
        topSellers,
        hourlyStats: hourlyArray,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch analytics'));
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [venueId, dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    data,
    loading,
    error,
    refresh: fetchAnalytics,
  };
};
