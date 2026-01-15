import { Order } from '../../../types';
import { StatusBadge } from '../shared/StatusBadge';

interface OrderHistoryProps {
  orders: Order[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({
  orders,
  onLoadMore,
  hasMore = false,
  className = '',
}) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (orders.length === 0) {
    return (
      <div className={`text-center text-muted py-8 ${className}`}>
        No orders found
      </div>
    );
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-bold text-foreground mb-4">Recent Orders</h3>
      <div className="space-y-2">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-surface-highlight rounded-lg p-4 border border-border flex items-center justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-foreground">#{order.orderCode}</span>
                <StatusBadge status={order.status} size="sm" />
              </div>
              <div className="text-sm text-muted">
                Table {order.tableNumber} • {formatDate(order.timestamp)}
              </div>
              <div className="text-xs text-muted mt-1">
                {order.items.length} items
              </div>
            </div>
            <div className="text-right ml-4">
              <div className="font-bold text-foreground">€{order.totalAmount.toFixed(2)}</div>
            </div>
          </div>
        ))}
        {hasMore && onLoadMore && (
          <button
            onClick={onLoadMore}
            className="w-full p-3 bg-surface-highlight hover:bg-surface border border-border rounded-lg text-sm font-semibold transition-colors"
          >
            Load More
          </button>
        )}
      </div>
    </div>
  );
};
