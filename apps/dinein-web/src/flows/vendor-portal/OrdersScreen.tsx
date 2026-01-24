/**
 * OrdersScreen - Toast POS inspired
 * - Color-coded status left border
 * - Big touch targets
 * - One-tap status change
 * - Minimal decoration
 */
import { useState, useMemo } from 'react';
import { Search, Clock, Loader2 } from 'lucide-react';
import { useVendorOrders, type OrderStatus } from '../../hooks/useVendorOrders';

const STATUS_CONFIG: Record<OrderStatus, {
    label: string;
    text: string;
    bg: string;
    dot: string;
    action: string | null;
    nextStatus: OrderStatus | null;
}> = {
    new: { label: 'New', text: 'text-rose-700', bg: 'bg-rose-50', dot: 'bg-rose-500', action: 'Accept', nextStatus: 'preparing' },
    received: { label: 'Received', text: 'text-violet-700', bg: 'bg-violet-50', dot: 'bg-violet-500', action: 'Prepare', nextStatus: 'preparing' },
    preparing: { label: 'Prep', text: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500', action: 'Ready', nextStatus: 'ready' },
    ready: { label: 'Ready', text: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500', action: 'Complete', nextStatus: 'completed' },
    served: { label: 'Served', text: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500', action: 'Complete', nextStatus: 'completed' },
    completed: { label: 'Done', text: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-500', action: null, nextStatus: null },
    cancelled: { label: 'Cancelled', text: 'text-slate-500', bg: 'bg-slate-50', dot: 'bg-slate-400', action: null, nextStatus: null },
    paid: { label: 'Paid', text: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500', action: null, nextStatus: null },
};

const TABS: { id: OrderStatus | 'all'; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'new', label: 'New' },
    { id: 'preparing', label: 'Prep' },
    { id: 'ready', label: 'Ready' },
];

export function OrdersScreen() {
    const { orders, loading, error, updateOrderStatus } = useVendorOrders();
    const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            if (activeTab !== 'all' && order.status !== activeTab) return false;
            if (searchQuery && !order.order_code.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        });
    }, [orders, activeTab, searchQuery]);

    const newCount = orders.filter(o => o.status === 'new').length;

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 pb-28">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Orders</h1>
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === tab.id
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                    }`}
                            >
                                {tab.label}
                                {tab.id === 'new' && newCount > 0 && (
                                    <span className="ml-1.5 text-rose-600 dark:text-rose-400 font-bold">{newCount}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Filter by order ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Orders List */}
            <main className="px-4 py-4 space-y-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-500" />
                        <p className="text-sm">Loading orders...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-16 text-red-500">
                        <p>{error}</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                        </div>
                        <p className="text-slate-400 dark:text-slate-500 font-medium">No orders found</p>
                    </div>
                ) : (
                    <div className="border border-slate-100 dark:border-slate-800 rounded-lg divide-y divide-slate-50 dark:divide-slate-800">
                        {filteredOrders.map((order, idx) => {
                            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.completed;
                            const time = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                            return (
                                <div
                                    key={order.id}
                                    className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors animate-fade-in group"
                                    style={{ animationDelay: `${idx * 30}ms` }}
                                >
                                    <div className="flex items-start justify-between">
                                        {/* Left Side */}
                                        <div className="flex gap-4">
                                            <div className="w-16 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-1.5 h-14">
                                                <span className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">Table</span>
                                                <span className="text-lg font-bold text-slate-900 dark:text-white leading-none">
                                                    {order.tables?.table_number || '?'}
                                                </span>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">#{order.order_code}</span>
                                                    <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text} dark:bg-opacity-20`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                                                        {config.label}
                                                    </span>
                                                </div>

                                                <div className="text-sm text-slate-600 dark:text-slate-300 mb-1">
                                                    {order.order_items.map(i => `${i.qty}× ${i.name_snapshot}`).join(', ')}
                                                </div>

                                                <div className="flex items-center gap-3 text-xs text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {time}
                                                    </span>
                                                    {order.notes && (
                                                        <span className="text-amber-600 dark:text-amber-500 font-medium px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/30 rounded">
                                                            Note included
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side */}
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="font-mono font-bold text-slate-900 dark:text-white">${order.total_amount.toFixed(2)}</span>
                                            {config.action && config.nextStatus && (
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, config.nextStatus!)}
                                                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 text-xs font-bold rounded shadow-sm transition-all active:scale-95"
                                                >
                                                    {config.action}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
