/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendorDashboardData } from '../../hooks/useVendorDashboardData';
import { useOrderQueue } from '../../hooks/vendor/useOrderQueue';
import { updatePaymentStatus } from '../../services/databaseService';
import { PaymentStatus } from '../../types';
import { toast } from 'react-hot-toast';
import { OrderQueue } from '../../components/vendor/dashboard/OrderQueue';
import { TodayStats } from '../../components/vendor/dashboard/TodayStats';
import { QuickActions } from '../../components/vendor/dashboard/QuickActions';
import { TableStatus } from '../../components/vendor/dashboard/TableStatus';
import { ConnectionIndicator } from '../../components/vendor/shared/ConnectionIndicator';
import { Spinner } from '../../components/Loading';

const LiveDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Use vendor dashboard data to get venue, tables, etc.
  const {
    venue,
    tables,
    loading: venueLoading,
  } = useVendorDashboardData({ tab: 'live' });

  // Use order queue for real-time order management
  const {
    orders,
    isConnected,
    acceptOrder,
    markReady,
    completeOrder,
    cancelOrder,
    refreshOrders,
  } = useOrderQueue({
    venueId: venue?.id || null,
    tables: tables || [],
  });

  // Calculate today's statistics
  const todayStats = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartTimestamp = todayStart.getTime();

    const todayOrders = orders.filter((order) => order.timestamp >= todayStartTimestamp);

    const revenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const orderCount = todayOrders.length;
    const averageOrderValue = orderCount > 0 ? revenue / orderCount : 0;

    return {
      revenue,
      orderCount,
      averageOrderValue,
    };
  }, [orders]);

  const handleUpdatePayment = async (orderId: string) => {
    try {
      await updatePaymentStatus(orderId, PaymentStatus.PAID);
      toast.success('Payment marked as received');
      refreshOrders();
    } catch (error) {
      toast.error('Failed to update payment status');
    }
  };

  const handle86Item = () => {
    navigate('/vendor/menu');
  };

  const handleViewMenu = () => {
    navigate('/vendor/menu');
  };

  const handleTodayStats = () => {
    navigate('/vendor/history');
  };

  const handlePrintQR = () => {
    navigate('/vendor/dashboard/tables');
  };

  const handleTableClick = (table: any) => {
    // Could navigate to table details or filter orders
    console.log('Table clicked:', table);
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
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold text-foreground">{venue.name}</h1>
            <ConnectionIndicator isConnected={isConnected} className="mt-1" />
          </div>
          <button
            onClick={() => navigate('/vendor/settings')}
            className="p-2 rounded-lg hover:bg-surface-highlight transition-colors touch-target min-w-[44px] min-h-[44px]"
            aria-label="Settings"
          >
            ⚙️
          </button>
        </div>
        <TodayStats
          revenue={todayStats.revenue}
          orderCount={todayStats.orderCount}
          averageOrderValue={todayStats.averageOrderValue}
          className="mt-4"
        />
      </div>

      {/* Main Content */}
      <div id="vendor-scroll" className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Quick Actions */}
          <QuickActions
            on86Item={handle86Item}
            onViewMenu={handleViewMenu}
            onTodayStats={handleTodayStats}
            onPrintQR={handlePrintQR}
          />

          {/* Order Queue */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Incoming Orders</h2>
              <button
                onClick={refreshOrders}
                className="text-sm text-muted hover:text-foreground transition-colors"
                aria-label="Refresh orders"
              >
                ⟳ Refresh
              </button>
            </div>
            <OrderQueue
              orders={orders}
              onRefresh={refreshOrders}
              onAccept={acceptOrder}
              onCancel={cancelOrder}
              onMarkReady={markReady}
              onComplete={completeOrder}
              onUpdatePayment={handleUpdatePayment}
              scrollContainerId="vendor-scroll"
            />
          </div>

          {/* Table Status */}
          {tables && tables.length > 0 && (
            <TableStatus
              tables={tables}
              orders={orders}
              onTableClick={handleTableClick}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveDashboard;
