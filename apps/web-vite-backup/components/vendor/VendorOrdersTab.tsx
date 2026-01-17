import React from 'react';
import { PullToRefresh } from '../PullToRefresh';
import { Order, OrderStatus, PaymentStatus } from '../../types';

interface VendorOrdersTabProps {
  orders: Order[];
  onRefresh: () => Promise<void>;
  onUpdateOrder: (id: string, status: OrderStatus) => Promise<void> | void;
  onUpdatePayment: (id: string) => Promise<void> | void;
  scrollContainerId?: string;
}

const OrderCard: React.FC<{
  order: Order;
  onUpdateOrder: VendorOrdersTabProps['onUpdateOrder'];
  onUpdatePayment: VendorOrdersTabProps['onUpdatePayment'];
}> = ({ order, onUpdateOrder, onUpdatePayment }) => {
  const minutesAgo = Math.floor((Date.now() - order.timestamp) / 60000);

  return (
    <div
      className={`bg-surface rounded-xl overflow-hidden border-l-4 shadow-lg ${
        order.status === OrderStatus.SERVED
          ? 'border-green-500 opacity-60'
          : 'border-primary-500'
      }`}
    >
      <div className="p-4 flex justify-between items-start bg-surface-highlight">
        <div>
          <h3 className="text-2xl font-bold text-foreground">{order.tableNumber}</h3>
          <div className="text-xs text-muted">
            #{order.orderCode} • {minutesAgo}m ago
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-xl text-foreground">€{order.totalAmount.toFixed(2)}</div>
          <button
            onClick={() => onUpdatePayment(order.id)}
            className={`text-[10px] px-2 py-1 rounded font-bold border mt-1 ${
              order.paymentStatus === PaymentStatus.PAID
                ? 'bg-green-500/20 text-green-500 border-green-500/30'
                : 'bg-red-500/20 text-red-500 border-red-500/30 animate-pulse'
            }`}
          >
            {order.paymentStatus === PaymentStatus.PAID ? 'PAID' : 'UNPAID'}
          </button>
        </div>
      </div>
      <div className="p-4 border-t border-border space-y-2">
        {order.items.map((line, i) => (
          <div key={i} className="flex gap-3 text-sm">
            <span className="font-bold text-secondary-600 w-6">{line.quantity}x</span>
            <span className="text-muted">{line.item.name}</span>
          </div>
        ))}
        {order.customerNote ? (
          <div className="bg-yellow-500/20 text-yellow-500 p-2 rounded text-xs mt-2">
            Note: {order.customerNote}
          </div>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-px bg-border">
        {order.status === OrderStatus.RECEIVED ? (
          <>
            <button
              onClick={() => onUpdateOrder(order.id, OrderStatus.CANCELLED)}
              className="p-3 bg-red-900/10 text-red-500 hover:bg-red-900/20 font-bold text-sm uppercase"
            >
              Cancel
            </button>
            <button
              onClick={() => onUpdateOrder(order.id, OrderStatus.SERVED)}
              className="p-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm uppercase"
            >
              Mark Served
            </button>
          </>
        ) : null}

        {order.status === OrderStatus.SERVED ? (
          <div className="col-span-2 p-3 text-center text-green-500 bg-surface font-bold text-sm uppercase">
            Completed (Served)
          </div>
        ) : null}
        {order.status === OrderStatus.CANCELLED ? (
          <div className="col-span-2 p-3 text-center text-red-500 bg-surface font-bold text-sm uppercase">
            Cancelled
          </div>
        ) : null}
      </div>
    </div>
  );
};

export const VendorOrdersTab: React.FC<VendorOrdersTabProps> = ({
  orders,
  onRefresh,
  onUpdateOrder,
  onUpdatePayment,
  scrollContainerId = 'vendor-scroll',
}) => {
  return (
    <PullToRefresh onRefresh={onRefresh} scrollContainerId={scrollContainerId}>
      <div className="p-4 space-y-4 min-h-[50vh]">
        {orders.length === 0 ? (
          <div className="text-center text-muted mt-10">No active orders</div>
        ) : null}
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onUpdateOrder={onUpdateOrder}
            onUpdatePayment={onUpdatePayment}
          />
        ))}
      </div>
    </PullToRefresh>
  );
};
