import { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { OrderCardSkeleton } from '../components/Loading';
import { getAllOrders } from '../services/databaseService';
import { Order } from '../types';

const AdminOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setIsLoading(true);
        const data = await getAllOrders();
        setOrders(data.sort((a, b) => b.timestamp - a.timestamp));
        setIsLoading(false);
    };

    return (
        <div className="p-6 pb-24 space-y-6 animate-fade-in pt-safe-top">
            <header>
                <h1 className="text-3xl font-bold text-foreground">Global Orders</h1>
                <p className="text-muted text-sm">Live order feed</p>
            </header>

            <div className="space-y-3 stagger-children">
                {/* Loading State */}
                {isLoading && (
                    <>
                        {[1, 2, 3, 4, 5].map(i => (
                            <OrderCardSkeleton key={i} />
                        ))}
                    </>
                )}

                {/* Orders List */}
                {!isLoading && orders.map(order => (
                    <GlassCard
                        key={order.id}
                        className="flex justify-between items-center border-l-4 border-primary-500 animate-slide-up-fade"
                    >
                        <div>
                            <div className="font-bold text-lg text-foreground">€{order.totalAmount.toFixed(2)}</div>
                            <div className="text-xs text-muted flex items-center gap-2">
                                <span className="font-mono text-secondary-600">{order.orderCode}</span>
                                <span>•</span>
                                <span>{new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="text-[10px] text-muted mt-1">{order.venueId}</div>
                        </div>
                        <div className="text-right">
                            <div className={`text-xs font-bold uppercase mb-1 ${order.status === 'SERVED' ? 'text-green-500' : 'text-secondary-600'}`}>{order.status}</div>
                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${order.paymentStatus === 'PAID' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {order.paymentStatus}
                            </div>
                        </div>
                    </GlassCard>
                ))}

                {/* Empty State */}
                {!isLoading && orders.length === 0 && (
                    <div className="text-center text-muted py-10 animate-fade-in">
                        <span className="text-4xl block mb-3">🧾</span>
                        No orders recorded today.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;
