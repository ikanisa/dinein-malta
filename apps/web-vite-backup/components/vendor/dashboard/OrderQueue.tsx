import React, { useMemo } from 'react';
import { Order, OrderStatus } from '../../../types';
import { OrderCard } from './OrderCard';
import { PullToRefresh } from '../../PullToRefresh';

interface OrderQueueProps {
  orders: Order[];
  onRefresh: () => Promise<void>;
  onAccept?: (id: string) => void;
  onCancel?: (id: string) => void;
  onMarkReady?: (id: string) => void;
  onComplete?: (id: string) => void;
  onUpdatePayment?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  scrollContainerId?: string;
}

export const OrderQueue: React.FC<OrderQueueProps> = ({
  orders,
  onRefresh,
  onAccept,
  onCancel,
  onMarkReady,
  onComplete,
  onUpdatePayment,
  onViewDetails,
  scrollContainerId = 'vendor-scroll',
}) => {
  // Sort orders by priority: new > preparing > ready > by timestamp
  const sortedOrders = useMemo(() => {
    const priority: Record<OrderStatus, number> = {
      [OrderStatus.NEW]: 3,
      [OrderStatus.RECEIVED]: 3, // Legacy
      [OrderStatus.PREPARING]: 2,
      [OrderStatus.READY]: 1,
      [OrderStatus.COMPLETED]: 0,
      [OrderStatus.SERVED]: 0, // Legacy
      [OrderStatus.CANCELLED]: -1,
    };

    return [...orders].sort((a, b) => {
      const priorityDiff = (priority[b.status] || 0) - (priority[a.status] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return b.timestamp - a.timestamp; // Newer first
    });
  }, [orders]);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Active Orders</h3>
        <p className="text-sm text-muted text-center">
          Orders will appear here when customers place them.
        </p>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={onRefresh} scrollContainerId={scrollContainerId}>
      <div className="p-4 space-y-4">
        {sortedOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onAccept={onAccept}
            onCancel={onCancel}
            onMarkReady={onMarkReady}
            onComplete={onComplete}
            onUpdatePayment={onUpdatePayment}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </PullToRefresh>
  );
};
