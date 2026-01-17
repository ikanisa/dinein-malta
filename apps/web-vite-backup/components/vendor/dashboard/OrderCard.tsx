import React from 'react';
import { Order, OrderStatus, PaymentStatus } from '../../../types';
import { StatusBadge } from '../shared/StatusBadge';
import { OrderTimer } from '../shared/OrderTimer';

interface OrderCardProps {
  order: Order;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onMarkReady?: (id: string) => void;
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
  onUpdatePayment?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onAccept,
  onReject,
  onMarkReady,
  onComplete,
  onCancel,
  onUpdatePayment,
  onViewDetails,
}) => {
  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.NEW:
      case OrderStatus.RECEIVED: // Legacy
        return 'border-red-500 bg-red-500/5';
      case OrderStatus.PREPARING:
        return 'border-yellow-500 bg-yellow-500/5';
      case OrderStatus.READY:
        return 'border-green-500 bg-green-500/5';
      case OrderStatus.COMPLETED:
      case OrderStatus.SERVED: // Legacy
        return 'border-gray-500 bg-gray-500/5 opacity-60';
      case OrderStatus.CANCELLED:
        return 'border-red-600 bg-red-600/5 opacity-50';
      default:
        return 'border-gray-500 bg-gray-500/5';
    }
  };

  const renderActions = () => {
    const status = order.status;

    // Handle legacy statuses
    if (status === OrderStatus.RECEIVED) {
      return (
        <>
          {onReject && (
            <button
              onClick={() => onReject(order.id)}
              className="flex-1 p-4 bg-red-500 hover:bg-red-600 text-white font-bold text-sm uppercase rounded-lg transition-colors min-h-[56px] touch-target"
              aria-label="Reject order"
            >
              ✕ Reject
            </button>
          )}
          {onAccept && (
            <button
              onClick={() => onAccept(order.id)}
              className="flex-1 p-4 bg-green-500 hover:bg-green-600 text-white font-bold text-sm uppercase rounded-lg transition-colors min-h-[56px] touch-target"
              aria-label="Accept order"
            >
              ✓ Accept
            </button>
          )}
        </>
      );
    }

    switch (status) {
      case OrderStatus.NEW:
        return (
          <>
            {onCancel && (
              <button
                onClick={() => onCancel(order.id)}
                className="flex-1 p-4 bg-red-500 hover:bg-red-600 text-white font-bold text-sm uppercase rounded-lg transition-colors min-h-[56px] touch-target"
                aria-label="Cancel order"
              >
                ✕ Cancel
              </button>
            )}
            {onAccept && (
              <button
                onClick={() => onAccept(order.id)}
                className="flex-1 p-4 bg-green-500 hover:bg-green-600 text-white font-bold text-sm uppercase rounded-lg transition-colors min-h-[56px] touch-target"
                aria-label="Accept order"
              >
                ✓ Accept
              </button>
            )}
          </>
        );

      case OrderStatus.PREPARING:
        return (
          <>
            {onCancel && (
              <button
                onClick={() => onCancel(order.id)}
                className="flex-1 p-4 bg-red-500 hover:bg-red-600 text-white font-bold text-sm uppercase rounded-lg transition-colors min-h-[56px] touch-target"
                aria-label="Cancel order"
              >
                ✕ Cancel
              </button>
            )}
            {onMarkReady && (
              <button
                onClick={() => onMarkReady(order.id)}
                className="flex-1 p-4 bg-green-500 hover:bg-green-600 text-white font-bold text-sm uppercase rounded-lg transition-colors min-h-[56px] touch-target"
                aria-label="Mark order as ready"
              >
                ✓ Mark Ready
              </button>
            )}
          </>
        );

      case OrderStatus.READY:
        return (
          <>
            {onComplete && (
              <button
                onClick={() => onComplete(order.id)}
                className="flex-1 p-4 bg-green-500 hover:bg-green-600 text-white font-bold text-sm uppercase rounded-lg transition-colors min-h-[56px] touch-target"
                aria-label="Complete order"
              >
                ✓ Complete
              </button>
            )}
          </>
        );

      case OrderStatus.COMPLETED:
      case OrderStatus.SERVED:
        return (
          <div className="col-span-2 p-4 text-center text-green-500 bg-surface font-bold text-sm uppercase rounded-lg">
            Completed
          </div>
        );

      case OrderStatus.CANCELLED:
        return (
          <div className="col-span-2 p-4 text-center text-red-500 bg-surface font-bold text-sm uppercase rounded-lg">
            Cancelled
          </div>
        );

      default:
        return null;
    }
  };

  const statusColorClass = getStatusColor(order.status);

  return (
    <div
      className={`rounded-xl overflow-hidden border-l-4 shadow-lg ${statusColorClass} ${
        order.status === OrderStatus.NEW || order.status === OrderStatus.RECEIVED
          ? 'animate-pulse'
          : ''
      }`}
      role="article"
      aria-label={`Order ${order.orderCode} for table ${order.tableNumber}`}
    >
      {/* Header */}
      <div className="p-4 flex justify-between items-start bg-surface-highlight">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-2xl font-bold text-foreground">#{order.orderCode}</h3>
            <StatusBadge status={order.status} size="sm" />
          </div>
          <div className="flex items-center gap-3 text-sm text-muted">
            <span className="font-semibold">Table {order.tableNumber}</span>
            <span>•</span>
            <OrderTimer timestamp={order.timestamp} />
          </div>
        </div>
        <div className="text-right ml-4">
          <div className="font-bold text-xl text-foreground mb-2">
            €{order.totalAmount.toFixed(2)}
          </div>
          {onUpdatePayment && (
            <button
              onClick={() => onUpdatePayment(order.id)}
              className={`text-[10px] px-2 py-1 rounded font-bold border transition-colors ${
                order.paymentStatus === PaymentStatus.PAID
                  ? 'bg-green-500/20 text-green-500 border-green-500/30'
                  : 'bg-red-500/20 text-red-500 border-red-500/30 animate-pulse'
              }`}
              aria-label={
                order.paymentStatus === PaymentStatus.PAID
                  ? 'Payment received'
                  : 'Payment pending'
              }
            >
              {order.paymentStatus === PaymentStatus.PAID ? 'PAID' : 'UNPAID'}
            </button>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="p-4 border-t border-border space-y-2 bg-surface">
        {order.items.length > 0 ? (
          order.items.map((line, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <span className="font-bold text-secondary-600 w-6">{line.quantity}x</span>
              <span className="text-foreground">{line.item.name}</span>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted">No items found</div>
        )}
        {order.customerNote && (
          <div className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 p-2 rounded text-xs mt-2">
            <span className="font-semibold">Note:</span> {order.customerNote}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 p-4 bg-surface-highlight">
        {renderActions()}
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(order.id)}
            className="col-span-2 mt-2 p-3 bg-transparent border border-border text-muted hover:text-foreground hover:bg-surface rounded-lg font-semibold text-sm transition-colors min-h-[48px] touch-target"
            aria-label="View order details"
          >
            👁️ Details
          </button>
        )}
      </div>
    </div>
  );
};
