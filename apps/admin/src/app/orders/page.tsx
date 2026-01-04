'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { getAllOrders, Order } from '../../../lib/database';
import { requireAdmin } from '../../../lib/auth';

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
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
      loadOrders();
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    }
  };

  const loadOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
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
      <div className="max-w-7xl mx-auto space-y-6">
        <header>
          <h1 className="text-4xl font-bold text-white mb-2">Global Orders</h1>
          <p className="text-gray-400">Live order feed</p>
        </header>

        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="text-center text-gray-400 py-10">No orders recorded today.</div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white/5 hover:bg-white/10 border-l-4 border-blue-500 rounded-xl p-6 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-lg text-white mb-1">
                      €{parseFloat(order.total_amount.toString()).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-2">
                      <span className="font-mono text-blue-300">#{order.order_code}</span>
                      <span>•</span>
                      <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">Venue: {order.venue_id.substring(0, 8)}...</div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-xs font-bold uppercase mb-1 ${
                        order.status === 'served' ? 'text-green-400' : 'text-blue-400'
                      }`}
                    >
                      {order.status}
                    </div>
                    <div
                      className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                        order.payment_status === 'paid'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {order.payment_status.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

