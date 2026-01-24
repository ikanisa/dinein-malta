/**
 * VendorDashboard - Rich Widget UI
 * - Soft Liquid Glass design
 * - Interactive Charts
 * - Premium feel
 */
import { Bell, Check, ChevronRight, DollarSign, ShoppingBag, Clock, Activity } from 'lucide-react';
import { useVendorProfile } from '../../hooks/useVendorProfile';
import { useVendorOrders } from '../../hooks/useVendorOrders';
import { useWaiterRings } from '../../hooks/useWaiterRings';
import { StatsWidget } from '../../components/widgets/StatsWidget';
import { ChartWidget } from '../../components/widgets/ChartWidget';
import { ListWidget } from '../../components/widgets/ListWidget';
import { GlassCard } from '../../components/widgets/GlassCard';

export function VendorDashboard() {
    const { profile, loading: profileLoading } = useVendorProfile();
    const { orders, loading: ordersLoading, updateOrderStatus } = useVendorOrders();
    const { pendingRings, resolveRing } = useWaiterRings();

    const loading = profileLoading || ordersLoading;

    // Stats
    const revenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const ordersCount = orders.length;
    const newOrders = orders.filter(o => o.status === 'new');
    const preparingOrders = orders.filter(o => o.status === 'preparing');

    // Mock Chart Data (should be real in prod)
    const chartData = [
        { name: '10am', value: 400 },
        { name: '11am', value: 300 },
        { name: '12pm', value: 800 },
        { name: '1pm', value: 1200 },
        { name: '2pm', value: 900 },
        { name: '3pm', value: 600 },
        { name: '4pm', value: 400 },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 pb-28 animate-fade-in">
                {/* Skeleton */}
                <header className="bg-white px-4 py-6 border-b border-slate-100 mb-6">
                    <div className="h-6 w-40 bg-slate-200 rounded-lg animate-pulse" />
                </header>
                <div className="px-4 grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-28">
            {/* Glassy Header */}
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100/50 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">{profile?.name || 'Dashboard'}</h1>
                        <p className="text-xs text-slate-500 font-medium">Real-time Overview</p>
                    </div>
                </div>
            </header>

            <div className="p-4 space-y-6 max-w-7xl mx-auto">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatsWidget
                        label="Revenue"
                        value={`$${revenue.toFixed(2)}`}
                        icon={DollarSign}
                        trend="+12%"
                        trendUp={true}
                        color="indigo"
                        delay={0}
                    />
                    <StatsWidget
                        label="Orders"
                        value={ordersCount.toString()}
                        subValue={`${newOrders.length} new`}
                        icon={ShoppingBag}
                        color="coral"
                        delay={100}
                    />
                    <StatsWidget
                        label="Avg Prep"
                        value="14m"
                        subValue="Target: 15m"
                        icon={Clock}
                        trend="-2m"
                        trendUp={true}
                        color="amber"
                        delay={200}
                    />
                    <StatsWidget
                        label="Active"
                        value={preparingOrders.length.toString()}
                        subValue="Kitchen Busy"
                        icon={Activity}
                        color="emerald"
                        delay={300}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Chart Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <ChartWidget
                            title="Revenue Trend"
                            description="Today's performance vs yesterday"
                            data={chartData}
                            dataKey="value"
                            height={300}
                            color="#6366f1"
                            className="w-full"
                        />

                        {/* New Orders Feed */}
                        <ListWidget title="Incoming Orders" actionLabel="View All" onAction={() => { }}>
                            {newOrders.length === 0 ? (
                                <div className="p-12 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                                    <Check className="w-10 h-10 mb-3 opacity-20" />
                                    <p className="text-sm font-medium">All caught up!</p>
                                    <p className="text-xs opacity-70">Waiting for new orders...</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {newOrders.map(order => (
                                        <div key={order.id} className="group relative bg-white border border-slate-100 rounded-2xl p-4 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-3 w-3 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)] animate-pulse" />
                                                    <h3 className="font-bold text-slate-900 text-lg">#{order.order_code}</h3>
                                                    <span className="px-2 py-1 bg-slate-100 rounded-md text-xs font-bold text-slate-600">Table {order.tables?.table_number}</span>
                                                </div>
                                                <span className="font-bold text-indigo-600 text-lg">${order.total_amount?.toFixed(2)}</span>
                                            </div>

                                            <p className="text-xs text-slate-500 mb-4 pl-6 border-l-2 border-slate-100 ml-1.5">
                                                {order.order_items.length} items • {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>

                                            <div className="pl-0">
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                                                    className="w-full py-3 bg-slate-900 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-slate-200 hover:shadow-indigo-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                                                >
                                                    Accept Order <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ListWidget>
                    </div>

                    {/* Sidebar / Secondary Column */}
                    <div className="space-y-6">
                        {/* Waiter Rings */}
                        <ListWidget title="Service Requests">
                            {pendingRings.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-slate-100">
                                    <p className="text-sm">No rings active</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {pendingRings.map(ring => (
                                        <div key={ring.id} className="flex items-center justify-between p-4 bg-amber-50/80 border border-amber-100/50 rounded-2xl backdrop-blur-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shadow-inner">
                                                    <Bell className="w-5 h-5 text-amber-600 animate-wiggle" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">Table {ring.table_number}</p>
                                                    <p className="text-xs text-amber-700 font-medium">{ring.reason || 'Assistance needed'}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => resolveRing(ring.id)}
                                                className="px-3 py-1.5 bg-white border border-amber-200 shadow-sm rounded-lg text-xs font-bold text-amber-700 hover:bg-amber-50 transition-colors"
                                            >
                                                Resolve
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ListWidget>

                        <GlassCard className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-xl shadow-indigo-200">
                            <div className="relative z-10">
                                <h3 className="font-bold text-lg mb-2">Pro Tip</h3>
                                <p className="text-indigo-100 text-sm mb-4">You can manage your menu items directly from the Quick Actions menu.</p>
                                <button className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-xs font-bold transition-colors border border-white/20">
                                    Open Menu Settings
                                </button>
                            </div>
                            {/* Decoration */}
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
                            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-purple-500/30 blur-2xl" />
                        </GlassCard>
                    </div>
                </div>
            </div>
        </div>
    );
}

