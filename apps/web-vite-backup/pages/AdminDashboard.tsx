/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Spinner } from '../components/Loading';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
    totalBars: number;
    activeBars: number;
    pendingBars: number;
    totalAdmins: number;
}

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats>({
        totalBars: 0,
        activeBars: 0,
        pendingBars: 0,
        totalAdmins: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch vendors stats
            const { data: vendorData } = await supabase.functions.invoke('admin_user_management', {
                body: { action: 'list_vendors' }
            });
            const vendors = vendorData?.vendors || [];

            // Fetch admins count
            const { data: adminData } = await supabase.functions.invoke('admin_user_management', {
                body: { action: 'list_admins' }
            });
            const admins = adminData?.admins || [];

            setStats({
                totalBars: vendors.length,
                activeBars: vendors.filter((v: any) => v.status === 'active').length,
                pendingBars: vendors.filter((v: any) => v.status === 'pending').length,
                totalAdmins: admins.filter((a: any) => a.is_active).length
            });
        } catch (err) {
            console.error('Failed to load dashboard:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner className="w-8 h-8" />
            </div>
        );
    }

    return (
        <div className="p-6 pb-24 space-y-8 animate-fade-in pt-safe-top">
            {/* Header */}
            <header>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted text-sm">Manage bars and admins</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <GlassCard
                    onClick={() => navigate('/admin/vendors')}
                    className="p-5 cursor-pointer active:scale-95 transition-transform"
                >
                    <div className="text-4xl font-bold text-foreground">{stats.totalBars}</div>
                    <div className="text-sm text-muted font-medium">Total Bars</div>
                </GlassCard>

                <GlassCard
                    onClick={() => navigate('/admin/vendors')}
                    className="p-5 cursor-pointer active:scale-95 transition-transform"
                >
                    <div className="text-4xl font-bold text-green-500">{stats.activeBars}</div>
                    <div className="text-sm text-muted font-medium">Active</div>
                </GlassCard>

                <GlassCard
                    onClick={() => navigate('/admin/vendors')}
                    className="p-5 cursor-pointer active:scale-95 transition-transform"
                >
                    <div className="flex items-center gap-2">
                        <div className="text-4xl font-bold text-orange-500">{stats.pendingBars}</div>
                        {stats.pendingBars > 0 && <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />}
                    </div>
                    <div className="text-sm text-muted font-medium">Pending</div>
                </GlassCard>

                <GlassCard
                    onClick={() => navigate('/admin/users')}
                    className="p-5 cursor-pointer active:scale-95 transition-transform"
                >
                    <div className="text-4xl font-bold text-foreground">{stats.totalAdmins}</div>
                    <div className="text-sm text-muted font-medium">Admins</div>
                </GlassCard>
            </div>

            {/* Quick Actions */}
            <section>
                <h2 className="text-lg font-bold mb-4 text-foreground">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                    <GlassCard
                        onClick={() => navigate('/admin/vendors')}
                        className="p-4 flex items-center gap-3 cursor-pointer active:scale-95 transition-transform"
                    >
                        <span className="text-2xl">🍺</span>
                        <div>
                            <div className="font-bold text-foreground">Manage Bars</div>
                            <div className="text-xs text-muted">Add, edit, remove</div>
                        </div>
                    </GlassCard>

                    <GlassCard
                        onClick={() => navigate('/admin/users')}
                        className="p-4 flex items-center gap-3 cursor-pointer active:scale-95 transition-transform"
                    >
                        <span className="text-2xl">👤</span>
                        <div>
                            <div className="font-bold text-foreground">Admin Users</div>
                            <div className="text-xs text-muted">Add new admins</div>
                        </div>
                    </GlassCard>

                    <GlassCard
                        onClick={() => navigate('/admin/orders')}
                        className="p-4 flex items-center gap-3 cursor-pointer active:scale-95 transition-transform"
                    >
                        <span className="text-2xl">🧾</span>
                        <div>
                            <div className="font-bold text-foreground">Orders</div>
                            <div className="text-xs text-muted">View all orders</div>
                        </div>
                    </GlassCard>

                    <GlassCard
                        onClick={() => navigate('/admin/system')}
                        className="p-4 flex items-center gap-3 cursor-pointer active:scale-95 transition-transform"
                    >
                        <span className="text-2xl">⚙️</span>
                        <div>
                            <div className="font-bold text-foreground">System</div>
                            <div className="text-xs text-muted">Audit logs</div>
                        </div>
                    </GlassCard>
                </div>
            </section>
        </div>
    );
};

export default AdminDashboard;
