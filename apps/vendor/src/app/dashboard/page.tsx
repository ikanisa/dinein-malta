'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';

export default function VendorDashboard() {
  const router = useRouter();
  const [venueId, setVenueId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Get user's venue
      const { data: vendorUser } = await supabase
        .from('vendor_users')
        .select('vendor_id')
        .eq('auth_user_id', user.id)
        .single();

      if (vendorUser) {
        setVenueId(vendorUser.vendor_id);
      } else {
        router.push('/onboarding');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/login');
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
        <header>
          <h1 className="text-4xl font-bold text-white mb-2">Vendor Dashboard</h1>
          <p className="text-gray-400">Manage your venue</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/orders" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-6 flex flex-col items-center gap-3 transition-colors">
            <span className="text-3xl">🔔</span>
            <span className="text-sm font-bold text-gray-300">Orders</span>
          </Link>
          <Link href="/menu" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-6 flex flex-col items-center gap-3 transition-colors">
            <span className="text-3xl">🍽️</span>
            <span className="text-sm font-bold text-gray-300">Menu</span>
          </Link>
          <Link href="/tables" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-6 flex flex-col items-center gap-3 transition-colors">
            <span className="text-3xl">🪑</span>
            <span className="text-sm font-bold text-gray-300">Tables</span>
          </Link>
        </div>
      </div>
    </div>
  );
}



