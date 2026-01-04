import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { getAllVenues, adminSetVendorStatus } from '../services/databaseService';
import { Venue } from '../types';
import { Spinner } from '../components/Loading';

const AdminVendors = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
      const data = await getAllVenues();
      setVenues(data);
  };

  const handleStatusChange = async (id: string, status: 'active' | 'suspended') => {
      if(!window.confirm(`Are you sure you want to ${status === 'active' ? 'ACTIVATE' : 'SUSPEND'} this vendor?`)) return;
      
      setProcessing(id);
      await adminSetVendorStatus(id, status);
      await loadData();
      setProcessing(null);
  };

  const filtered = venues.filter(v => {
      if (filter === 'all') return true;
      if (filter === 'pending') return v.status === 'pending_claim';
      return v.status === filter;
  });

  return (
    <div className="p-6 pb-24 space-y-6 animate-fade-in pt-safe-top">
      <header>
          <h1 className="text-3xl font-bold text-foreground">Vendor Management</h1>
          <p className="text-muted text-sm">Review claims & manage access</p>
      </header>

      {/* Filter Tabs */}
      <div className="flex p-1 bg-surface-highlight rounded-xl border border-border overflow-x-auto no-scrollbar">
          {['all', 'active', 'pending', 'suspended'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f as any)}
                className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${filter === f ? 'bg-foreground text-background shadow-lg' : 'text-muted hover:text-foreground'}`}
              >
                  {f}
              </button>
          ))}
      </div>

      <div className="space-y-4">
          {filtered.length === 0 && <div className="text-center text-muted py-10">No vendors found.</div>}
          
          {filtered.map(venue => (
              <GlassCard key={venue.id} className="relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3">
                          <div className="w-12 h-12 bg-surface-highlight rounded-lg overflow-hidden">
                              <img src={venue.imageUrl || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" />
                          </div>
                          <div>
                              <div className="font-bold text-lg text-foreground">{venue.name}</div>
                              <div className="text-xs text-muted">{venue.address}</div>
                              <div className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  venue.status === 'active' ? 'bg-green-500/20 text-green-500' :
                                  venue.status === 'suspended' ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'
                              }`}>
                                  {venue.status || 'active'}
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
                      {venue.status === 'pending_claim' || venue.status === 'suspended' ? (
                          <button 
                            onClick={() => handleStatusChange(venue.id, 'active')}
                            disabled={!!processing}
                            className="py-2 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-2"
                          >
                             {processing === venue.id ? <Spinner className="w-3 h-3" /> : '✅ Approve'}
                          </button>
                      ) : (
                          <button 
                            onClick={() => handleStatusChange(venue.id, 'suspended')}
                            disabled={!!processing}
                            className="py-2 bg-red-900/10 dark:bg-red-900/40 border border-red-500/30 text-red-500 hover:bg-red-500/20 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                          >
                             {processing === venue.id ? <Spinner className="w-3 h-3" /> : '⛔ Suspend'}
                          </button>
                      )}
                      <button className="py-2 bg-surface-highlight hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-xs font-bold text-muted">
                          View Profile
                      </button>
                  </div>
              </GlassCard>
          ))}
      </div>
    </div>
  );
};

export default AdminVendors;