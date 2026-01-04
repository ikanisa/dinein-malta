'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { getAllVenues, adminSetVendorStatus, Venue } from '../../../lib/database';
import { requireAdmin } from '../../../lib/auth';

export default function AdminVendors() {
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
  const [processing, setProcessing] = useState<string | null>(null);
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
      loadVenues();
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    }
  };

  const loadVenues = async () => {
    try {
      const data = await getAllVenues();
      setVenues(data);
    } catch (error) {
      console.error('Error loading venues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: 'active' | 'suspended') => {
    if (!confirm(`Are you sure you want to ${status === 'active' ? 'ACTIVATE' : 'SUSPEND'} this vendor?`)) return;

    setProcessing(id);
    try {
      await adminSetVendorStatus(id, status);
      await loadVenues();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update vendor status');
    } finally {
      setProcessing(null);
    }
  };

  const filtered = venues.filter(v => {
    if (filter === 'all') return true;
    if (filter === 'pending') return v.status === 'pending' || v.status === 'pending_claim';
    return v.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header>
          <h1 className="text-4xl font-bold text-white mb-2">Vendor Management</h1>
          <p className="text-gray-400">Review claims & manage access</p>
        </header>

        {/* Filter Tabs */}
        <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 overflow-x-auto">
          {['all', 'active', 'pending', 'suspended'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold uppercase transition-colors ${
                filter === f ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.length === 0 && (
            <div className="text-center text-gray-400 py-10">No vendors found.</div>
          )}

          {filtered.map((venue) => (
            <div key={venue.id} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-6 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{venue.name}</h3>
                  <p className="text-gray-400 text-sm">{venue.address}</p>
                  {venue.phone && <p className="text-gray-500 text-xs mt-1">{venue.phone}</p>}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  venue.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  venue.status === 'suspended' ? 'bg-red-500/20 text-red-400' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  {venue.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-4">
                {(venue.status === 'pending' || venue.status === 'pending_claim' || venue.status === 'suspended') ? (
                  <button
                    onClick={() => handleStatusChange(venue.id, 'active')}
                    disabled={!!processing}
                    className="py-2 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {processing === venue.id ? (
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      '✅ Approve'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange(venue.id, 'suspended')}
                    disabled={!!processing}
                    className="py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 rounded-lg text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {processing === venue.id ? (
                      <div className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                    ) : (
                      '⛔ Suspend'
                    )}
                  </button>
                )}
                <button className="py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-lg text-xs font-bold">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

