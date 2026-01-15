import { useEffect, useState, useCallback } from 'react';
import { GlassCard } from '../components/GlassCard';
import { DataStateWrapper } from '../components/common';
import { VendorCardSkeleton } from '../components/Loading';
import { getAllVenues, getAllOrders } from '../services/databaseService';
import { Venue } from '../types';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
    activeVenues: number;
    pendingVenues: number;
    todayOrders: number;
    todayRevenue: number;
}

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        activeVenues: 0,
        pendingVenues: 0,
        todayOrders: 0,
        todayRevenue: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const [vData, oData] = await Promise.all([getAllVenues(), getAllOrders()]);
            setVenues(vData);

            // Calculate Stats
            const active = vData.filter(v => v.status === 'active').length;
            const pending = vData.filter(v => v.status === 'pending_claim').length;
            const today = oData.filter(o => o.timestamp > Date.now() - 86400000);
            const revenue = today.reduce((sum, o) => sum + o.totalAmount, 0);

            setStats({
                activeVenues: active,
                pendingVenues: pending,
                todayOrders: today.length,
                todayRevenue: revenue
            });
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load dashboard data'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const attentionQueue = venues.filter(v => v.status === 'pending_claim');

    // Loading skeleton for the dashboard
    const DashboardSkeleton = () => (
        <div className="p-6 pb-24 space-y-6 pt-safe-top animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <div className="h-8 w-48 shimmer-enhanced rounded mb-2" />
                    <div className="h-4 w-32 shimmer-enhanced rounded" />
                </div>
                <div className="w-10 h-10 rounded-full shimmer-enhanced" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="h-24 shimmer-enhanced rounded-xl" />
                <div className="h-24 shimmer-enhanced rounded-xl" />
            </div>
            <div className="space-y-3">
                <div className="h-6 w-40 shimmer-enhanced rounded" />
                <VendorCardSkeleton />
                <VendorCardSkeleton />
            </div>
        </div>
    );

    return (
        <DataStateWrapper
            data={venues}
            isLoading={isLoading}
            error={error}
            onRetry={fetchData}
            skeleton={<DashboardSkeleton />}
            emptyState={{
                icon: '🏪',
                title: 'No venues yet',
                description: 'Venues will appear here once they register on the platform.',
            }}
        >
            {() => (
                <div className="p-6 pb-24 space-y-6 animate-fade-in pt-safe-top">
                    <header className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
                                Control Center
                            </h1>
                            <p className="text-muted text-sm">System Operations</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-surface-highlight flex items-center justify-center border border-border">
                            <span className="text-xl">👮‍♂️</span>
                        </div>
                    </header>

                    {/* KPI Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <GlassCard className="p-4 bg-gradient-to-br from-white/5 to-white/0 border-border" glow>
                            <div className="text-[10px] text-muted uppercase font-bold tracking-wider">Today&apos;s Volume</div>
                            <div className="text-3xl font-bold text-foreground mt-1">€{stats.todayRevenue.toFixed(0)}</div>
                            <div className="text-xs text-muted">{stats.todayOrders} orders processed</div>
                        </GlassCard>

                        <GlassCard
                            onClick={() => navigate('/admin/vendors')}
                            className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/5 border-orange-500/30 cursor-pointer active:scale-95 transition-transform"
                        >
                            <div className="flex justify-between items-start">
                                <div className="text-[10px] text-orange-500 uppercase font-bold tracking-wider">Attention</div>
                                {stats.pendingVenues > 0 && <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />}
                            </div>
                            <div className="text-3xl font-bold text-foreground mt-1">{stats.pendingVenues}</div>
                            <div className="text-xs text-orange-500/60">Pending Approvals</div>
                        </GlassCard>
                    </div>

                    {/* Attention Queue */}
                    <section>
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                            <span>⚠️</span> Priority Queue
                        </h2>
                        {attentionQueue.length === 0 ? (
                            <GlassCard className="p-6 text-center text-muted border-dashed border-border">
                                <span className="text-2xl block mb-2">✅</span>
                                All clear. No pending actions.
                            </GlassCard>
                        ) : (
                            <div className="space-y-3 stagger-children">
                                {attentionQueue.map(venue => (
                                    <GlassCard key={venue.id} accent="primary" className="flex justify-between items-center animate-slide-up-fade">
                                        <div>
                                            <div className="font-bold text-foreground">{venue.name}</div>
                                            <div className="text-xs text-muted">Claim Request • {venue.address}</div>
                                        </div>
                                        <button
                                            onClick={() => navigate('/admin/vendors')}
                                            className="bg-orange-500/10 text-orange-500 px-3 py-1.5 rounded-lg text-xs font-bold border border-orange-500/20 active:scale-95 transition-transform"
                                        >
                                            Review
                                        </button>
                                    </GlassCard>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Quick Links */}
                    <section>
                        <h2 className="text-lg font-bold mb-4 text-foreground">Quick Actions</h2>
                        <div className="grid grid-cols-3 gap-3">
                            <button onClick={() => navigate('/admin/vendors')} className="p-4 bg-surface-highlight rounded-xl flex flex-col items-center gap-2 active:bg-black/5 dark:active:bg-white/10 transition border border-border">
                                <span className="text-2xl">🏪</span>
                                <span className="text-[10px] font-bold text-muted">Vendors</span>
                            </button>
                            <button onClick={() => navigate('/admin/orders')} className="p-4 bg-surface-highlight rounded-xl flex flex-col items-center gap-2 active:bg-black/5 dark:active:bg-white/10 transition border border-border">
                                <span className="text-2xl">🧾</span>
                                <span className="text-[10px] font-bold text-muted">Orders</span>
                            </button>
                            <button onClick={() => navigate('/admin/system')} className="p-4 bg-surface-highlight rounded-xl flex flex-col items-center gap-2 active:bg-black/5 dark:active:bg-white/10 transition border border-border">
                                <span className="text-2xl">⚙️</span>
                                <span className="text-[10px] font-bold text-muted">System</span>
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </DataStateWrapper>
    );
};

export default AdminDashboard;
