'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import { getAllVenues, getAllOrders } from '../../../lib/database';
import { requireAdmin } from '../../../lib/auth';

interface Stats {
  activeVenues: number;
  pendingVenues: number;
  todayOrders: number;
  todayRevenue: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    activeVenues: 0,
    pendingVenues: 0,
    todayOrders: 0,
    todayRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAdmin = await requireAdmin();
      if (!isAdmin) {
        router.push('/login');
        return;
      }
      // User is authenticated and is admin - load stats
      loadStats();
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const loadStats = async () => {
    try {
      const [venues, ordersData] = await Promise.all([getAllVenues(), getAllOrders()]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = ordersData.filter(o => new Date(o.created_at) >= today);

      const active = venues.filter(v => v.status === 'active').length;
      const pending = venues.filter(v => v.status === 'pending' || v.status === 'pending_claim').length;
      const todayOrdersCount = todayOrders.length;
      const revenue = todayOrders.reduce((sum, o) => sum + parseFloat(o.total_amount.toString()), 0);

      setStats({ activeVenues: active, pendingVenues: pending, todayOrders: todayOrdersCount, todayRevenue: revenue });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">System overview and management</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold rounded-lg transition-colors"
          >
            Logout
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active Venues" value={stats.activeVenues} icon="🏪" color="blue" />
          <StatCard label="Pending Claims" value={stats.pendingVenues} icon="⏳" color="orange" />
          <StatCard label="Today's Orders" value={stats.todayOrders} icon="🧾" color="green" />
          <StatCard label="Today's Revenue" value={`€${stats.todayRevenue.toFixed(2)}`} icon="💰" color="purple" />
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/vendors" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-6 flex flex-col items-center gap-3 transition-colors">
              <span className="text-3xl">🏪</span>
              <span className="text-sm font-bold text-gray-300">Vendors</span>
            </Link>
            <Link href="/orders" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-6 flex flex-col items-center gap-3 transition-colors">
              <span className="text-3xl">🧾</span>
              <span className="text-sm font-bold text-gray-300">Orders</span>
            </Link>
            <Link href="/system" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-6 flex flex-col items-center gap-3 transition-colors">
              <span className="text-3xl">⚙️</span>
              <span className="text-sm font-bold text-gray-300">System</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-6 backdrop-blur-md`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-gray-400 uppercase tracking-wider">{label}</div>
    </div>
  );
}

