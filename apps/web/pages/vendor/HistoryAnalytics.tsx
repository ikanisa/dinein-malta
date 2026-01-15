import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendorDashboardData } from '../../hooks/useVendorDashboardData';
import { useAnalytics } from '../../hooks/vendor/useAnalytics';
import { getOrdersForVenue } from '../../services/databaseService';
import { Order } from '../../types';
import { RevenueChart } from '../../components/vendor/analytics/RevenueChart';
import { TopSellers } from '../../components/vendor/analytics/TopSellers';
import { OrderHistory } from '../../components/vendor/analytics/OrderHistory';
import { Spinner } from '../../components/Loading';
import { toast } from 'react-hot-toast';

const HistoryAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const { venue, loading: venueLoading } = useVendorDashboardData({ tab: 'orders' });

  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const selectedDateRange = useMemo(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    switch (dateRange) {
      case 'today': {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        return { start, end };
      }
      case 'week': {
        const start = new Date();
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        return { start, end };
      }
      case 'month': {
        const start = new Date();
        start.setMonth(start.getMonth() - 1);
        start.setHours(0, 0, 0, 0);
        return { start, end };
      }
      case 'custom': {
        const start = customStart ? new Date(customStart) : new Date();
        const end = customEnd ? new Date(customEnd) : new Date();
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      }
      default:
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        return { start, end };
    }
  }, [dateRange, customStart, customEnd]);

  const { data: analyticsData, loading: analyticsLoading, error } = useAnalytics({
    venueId: venue?.id || null,
    dateRange: selectedDateRange,
  });

  // Fetch orders for history
  React.useEffect(() => {
    if (!venue?.id) return;

    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const allOrders = await getOrdersForVenue(venue.id);
        const filtered = allOrders.filter(
          (order) =>
            order.timestamp >= selectedDateRange.start.getTime() &&
            order.timestamp <= selectedDateRange.end.getTime()
        );
        setOrders(filtered.sort((a, b) => b.timestamp - a.timestamp));
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [venue?.id, selectedDateRange]);

  const handleExportCSV = () => {
    if (orders.length === 0) {
      toast.error('No orders to export');
      return;
    }

    const headers = ['Order Code', 'Table', 'Status', 'Items', 'Total', 'Date'];
    const rows = orders.map((order) => [
      order.orderCode,
      order.tableNumber,
      order.status,
      order.items.length.toString(),
      `€${order.totalAmount.toFixed(2)}`,
      new Date(order.timestamp).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${selectedDateRange.start.toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('CSV exported successfully');
  };

  if (venueLoading || !venue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-safe-top pb-32 flex flex-col">
      {/* Header */}
      <div className="bg-surface border-b border-border px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <button
              onClick={() => navigate('/vendor/live')}
              className="text-muted hover:text-foreground transition-colors mb-2"
            >
              ← Back to Live
            </button>
            <h1 className="text-xl font-bold text-foreground">History & Analytics</h1>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={orders.length === 0}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors touch-target"
            aria-label="Export to CSV"
          >
            📄 Export CSV
          </button>
        </div>

        {/* Date Range Selector */}
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {(['today', 'week', 'month', 'custom'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold border transition ${
                  dateRange === range
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-surface-highlight text-muted border-border hover:text-foreground'
                }`}
              >
                {range === 'today' ? 'Today' : range === 'week' ? 'Last 7 Days' : range === 'month' ? 'Last Month' : 'Custom'}
              </button>
            ))}
          </div>
          {dateRange === 'custom' && (
            <div className="flex gap-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-surface-highlight px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-surface-highlight px-3 py-2 text-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {error && (
          <div className="bg-red-500/20 text-red-500 p-4 rounded-lg">
            Failed to load analytics: {error.message}
          </div>
        )}

        {analyticsLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="w-8 h-8" />
          </div>
        ) : analyticsData ? (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-surface-highlight rounded-xl p-4 border border-border">
                <div className="text-xs text-muted uppercase tracking-wider mb-1">Revenue</div>
                <div className="text-2xl font-bold text-green-500">€{analyticsData.revenue.toFixed(2)}</div>
              </div>
              <div className="bg-surface-highlight rounded-xl p-4 border border-border">
                <div className="text-xs text-muted uppercase tracking-wider mb-1">Orders</div>
                <div className="text-2xl font-bold text-foreground">{analyticsData.orderCount}</div>
              </div>
              <div className="bg-surface-highlight rounded-xl p-4 border border-border">
                <div className="text-xs text-muted uppercase tracking-wider mb-1">Avg Order</div>
                <div className="text-2xl font-bold text-foreground">€{analyticsData.averageOrderValue.toFixed(2)}</div>
              </div>
            </div>

            {/* Revenue Chart */}
            <RevenueChart hourlyStats={analyticsData.hourlyStats} />

            {/* Top Sellers */}
            <TopSellers sellers={analyticsData.topSellers} />

            {/* Order History */}
            {loadingOrders ? (
              <div className="flex items-center justify-center py-8">
                <Spinner className="w-6 h-6" />
              </div>
            ) : (
              <OrderHistory orders={orders.slice(0, 20)} />
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default HistoryAnalytics;
