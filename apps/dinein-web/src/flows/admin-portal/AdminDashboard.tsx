import { Store, Users, ShoppingBag, DollarSign, Activity, ChevronRight, AlertTriangle, Plus, BarChart3, Bell } from 'lucide-react';

// Platform stats
const PLATFORM_STATS = [
    { label: 'Total Vendors', value: '47', change: '+3', icon: Store, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Active Users', value: '1,284', change: '+89', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: "Today's Orders", value: '342', change: '+12%', icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Revenue (MTD)', value: '$48.2K', change: '+18%', icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-100' },
];

// Recent activity with simplified structure
const RECENT_ACTIVITY = [
    { type: 'vendor', message: 'New vendor registered: Ocean Breeze Bistro', time: '5 min ago' },
    { type: 'order', message: '152 orders completed today', time: '1 hour ago' },
    { type: 'alert', message: 'High traffic detected in St. Julian\'s', time: '2 hours ago' },
    { type: 'user', message: '12 new user registrations', time: '3 hours ago' },
];

const PENDING_APPROVALS = [
    { id: '1', name: 'Sunrise Café', type: 'New Vendor', submitted: '2 days ago' },
    { id: '2', name: 'Mountain View Restaurant', type: 'New Vendor', submitted: '3 days ago' },
];

export function AdminDashboard() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28 animate-fade-in font-sans">
            {/* Sticky Glass Header */}
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-0.5">Admin Console</p>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
                            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                        </button>
                        <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
                            A
                        </div>
                    </div>
                </div>
            </header>

            <main className="p-6 space-y-8">
                {/* Platform Health Card */}
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-5 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl transform translate-x-10 -translate-y-10 group-hover:translate-x-5 transition-transform duration-700" />

                    <div className="relative flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-indigo-100 text-sm font-medium">System Status</p>
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-bold">All Systems Operational</p>
                                <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {PLATFORM_STATS.map((stat) => (
                        <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className={`w-10 h-10 ${stat.bg} ${stat.color} dark:bg-opacity-10 dark:text-opacity-90 rounded-xl flex items-center justify-center mb-3`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{stat.label}</span>
                                <span className={`text-xs font-bold ${stat.change.includes('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pending Approvals */}
                {PENDING_APPROVALS.length > 0 && (
                    <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <div className="flex items-center justify-between mb-3 px-1">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Attention Needed</h2>
                        </div>
                        <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                                </div>
                                <span className="text-xs font-bold text-amber-700 dark:text-amber-500">Pending Approvals ({PENDING_APPROVALS.length})</span>
                            </div>

                            {PENDING_APPROVALS.map((item) => (
                                <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-amber-100/50 dark:border-amber-900/20 flex items-center justify-between group cursor-pointer hover:border-amber-200 dark:hover:border-amber-800 transition-colors">
                                    <div>
                                        <p className="text-slate-900 dark:text-white font-bold text-sm">{item.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{item.type} • {item.submitted}</p>
                                    </div>
                                    <button className="px-3 py-1.5 bg-slate-900 dark:bg-indigo-600 text-white text-xs rounded-lg font-bold shadow-lg shadow-slate-900/10 dark:shadow-indigo-900/20 active:scale-95 transition-transform">
                                        Review
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide px-1">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 rounded-2xl text-left shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 active:scale-[0.98] transition-all group">
                            <div className="absolute top-0 right-0 p-8 bg-white/10 rounded-full blur-xl transform translate-x-4 -translate-y-4 group-hover:translate-x-2 transition-transform" />
                            <Plus className="w-6 h-6 text-white mb-2" />
                            <p className="font-bold text-white text-sm">Add Vendor</p>
                            <p className="text-[10px] text-indigo-100 font-medium">Register new</p>
                        </button>
                        <button className="relative overflow-hidden bg-white dark:bg-slate-800 p-4 rounded-2xl text-left shadow-md border border-slate-100 dark:border-slate-700 active:scale-[0.98] transition-all group hover:border-slate-200 dark:hover:border-slate-600">
                            <div className="absolute top-0 right-0 p-8 bg-slate-50 dark:bg-slate-700 rounded-full blur-xl transform translate-x-4 -translate-y-4" />
                            <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mb-2" />
                            <p className="font-bold text-slate-900 dark:text-white text-sm">Analytics</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">View reports</p>
                        </button>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="pb-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Recent Activity</h2>
                        <button className="text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-0.5 hover:underline">
                            View All <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-1 shadow-sm border border-slate-100 dark:border-slate-700">
                        {RECENT_ACTIVITY.map((activity, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-2xl transition-colors border-b border-slate-50 last:border-0 last:pb-2">
                                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${activity.type === 'vendor' ? 'bg-purple-100 text-purple-600' :
                                    activity.type === 'order' ? 'bg-emerald-100 text-emerald-600' :
                                        activity.type === 'alert' ? 'bg-amber-100 text-amber-600' :
                                            'bg-blue-100 text-blue-600'
                                    }`}>
                                    {activity.type === 'vendor' ? <Store className="w-3.5 h-3.5" /> :
                                        activity.type === 'order' ? <ShoppingBag className="w-3.5 h-3.5" /> :
                                            activity.type === 'alert' ? <AlertTriangle className="w-3.5 h-3.5" /> :
                                                <Users className="w-3.5 h-3.5" />}
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <p className="text-slate-800 text-xs font-semibold leading-relaxed line-clamp-2">{activity.message}</p>
                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}


