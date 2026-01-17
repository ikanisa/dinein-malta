/**
 * Virtual Order List Component
 * Efficiently renders large order lists using windowing (react-window)
 */

import React from 'react';

// Using dynamic import with relaxed typing to avoid type conflicts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let FixedSizeList: React.ComponentType<any> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let AutoSizer: React.ComponentType<any> | null = null;

// Lazy load the windowing libraries
const loadVirtualizationLibs = async () => {
    if (!FixedSizeList) {
        const reactWindow = await import('react-window');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        FixedSizeList = (reactWindow as any).FixedSizeList;
    }
    if (!AutoSizer) {
        const autoSizer = await import('react-virtualized-auto-sizer');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        AutoSizer = (autoSizer as any).default || autoSizer;
    }
};

export interface Order {
    id: string;
    status: string;
    total: number;
    created_at: string;
    customer_name?: string;
    items?: Array<{ name: string; quantity: number }>;
}

interface VirtualOrderListProps {
    orders: Order[];
    onOrderClick: (order: Order) => void;
    itemHeight?: number;
}

// Separated OrderCard for reuse
interface OrderCardProps {
    order: Order;
    onClick: () => void;
}

const OrderCard: React.FC<OrderCardProps> = React.memo(({ order, onClick }) => {
    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        preparing: 'bg-blue-100 text-blue-800',
        ready: 'bg-green-100 text-green-800',
        completed: 'bg-gray-100 text-gray-800',
        cancelled: 'bg-red-100 text-red-800',
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <button
            onClick={onClick}
            className="w-full bg-white dark:bg-white/5 rounded-xl shadow-sm border border-border p-4 cursor-pointer hover:shadow-md transition-shadow text-left"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm truncate">
                            #{order.id.slice(0, 8)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status] || 'bg-gray-100'}`}>
                            {order.status}
                        </span>
                    </div>
                    {order.customer_name && (
                        <p className="text-xs text-muted truncate">{order.customer_name}</p>
                    )}
                    {order.items && order.items.length > 0 && (
                        <p className="text-xs text-muted truncate mt-1">
                            {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        </p>
                    )}
                </div>
                <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm">€{order.total.toFixed(2)}</p>
                    <p className="text-xs text-muted">{formatTime(order.created_at)}</p>
                </div>
            </div>
        </button>
    );
});

OrderCard.displayName = 'OrderCard';

/**
 * Simple order list - renders all items
 * Use this for lists under 50 items
 */
export const SimpleOrderList: React.FC<VirtualOrderListProps> = ({
    orders,
    onOrderClick,
}) => {
    return (
        <div className="space-y-3">
            {orders.map((order) => (
                <OrderCard key={order.id} order={order} onClick={() => onOrderClick(order)} />
            ))}
        </div>
    );
};

/**
 * Virtual order list - uses windowing for large lists
 * Falls back to SimpleOrderList for small lists or if loading fails
 */
export const VirtualOrderList: React.FC<VirtualOrderListProps> = ({
    orders,
    onOrderClick,
    itemHeight = 100,
}) => {
    const [libsLoaded, setLibsLoaded] = React.useState(false);

    React.useEffect(() => {
        loadVirtualizationLibs().then(() => setLibsLoaded(true)).catch(() => {
            // Fallback to simple list if loading fails
            console.warn('[VirtualOrderList] Failed to load virtualization libs');
        });
    }, []);

    // Don't use virtualization for small lists
    if (orders.length < 50 || !libsLoaded || !FixedSizeList || !AutoSizer) {
        return <SimpleOrderList orders={orders} onOrderClick={onOrderClick} />;
    }

    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const order = orders[index];
        return (
            <div style={{ ...style, paddingRight: 16, paddingBottom: 8 }}>
                <OrderCard order={order} onClick={() => onOrderClick(order)} />
            </div>
        );
    };

    // Assign to local constants after null guard passes
    const List = FixedSizeList;
    const Sizer = AutoSizer;

    return (
        <div className="h-full min-h-[400px]">
            <Sizer>
                {({ height, width }: { height: number; width: number }) => (
                    <List
                        height={height}
                        itemCount={orders.length}
                        itemSize={itemHeight}
                        width={width}
                        overscanCount={5}
                    >
                        {Row}
                    </List>
                )}
            </Sizer>
        </div>
    );
};
