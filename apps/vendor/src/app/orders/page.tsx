'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { getVenueByOwner, getOrdersForVenue, updateOrderStatus, updatePaymentStatus, Order } from '../../../lib/database';

export default function VendorOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [venueId, setVenueId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    subscribeToOrders();
  }, [venueId]);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const venue = await getVenueByOwner(user.id);
      if (!venue) {
        router.push('/onboarding');
        return;
      }

      setVenueId(venue.id);
      const ordersData = await getOrdersForVenue(venue.id);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToOrders = () => {
    if (!venueId) return;

    const channel = supabase
      .channel('orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `venue_id=eq.${venueId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order;
            setOrders(prev => [newOrder, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new as Order : o));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleStatusChange = async (orderId: string, status: 'served' | 'cancelled') => {
    try {
      await updateOrderStatus(orderId, status);
      await loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update order status');
    }
  };

  const handlePaymentUpdate = async (orderId: string) => {
    try {
      await updatePaymentStatus(orderId);
      await loadData();
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Failed to update payment status');
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
      <div className="max-w-4xl mx-auto space-y-4">
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Orders</h1>
          <p className="text-gray-400">Manage live orders</p>
        </header>

        {orders.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            No active orders
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className={`bg-white/5 hover:bg-white/10 border-l-4 rounded-xl p-6 transition-colors ${
                order.status === 'served' ? 'border-green-500 opacity-60' : 'border-blue-500'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    Table {order.table_number || 'N/A'}
                  </h3>
                  <div className="text-xs text-gray-400 flex items-center gap-2">
                    <span className="font-mono text-blue-300">#{order.order_code}</span>
                    <span>•</span>
                    <span>
                      {Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000)}m ago
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white mb-1">
                    €{parseFloat(order.total_amount.toString()).toFixed(2)}
                  </div>
                  <button
                    onClick={() => handlePaymentUpdate(order.id)}
                    className={`text-xs px-3 py-1 rounded font-bold border ${
                      order.payment_status === 'paid'
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
                    }`}
                  >
                    {order.payment_status === 'paid' ? 'PAID' : 'UNPAID'}
                  </button>
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="mb-4 space-y-2">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm text-gray-300">
                      <span>{item.quantity}x {item.name}</span>
                      <span>€{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {order.customer_note && (
                <div className="mb-4 text-sm text-gray-400 italic">
                  Note: {order.customer_note}
                </div>
              )}

              <div className="flex gap-2">
                {order.status === 'received' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(order.id, 'served')}
                      className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors"
                    >
                      Mark as Served
                    </button>
                    <button
                      onClick={() => handleStatusChange(order.id, 'cancelled')}
                      className="flex-1 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-bold rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {order.status === 'served' && (
                  <div className="flex-1 py-2 bg-green-500/20 text-green-400 text-center font-bold rounded-lg">
                    Served
                  </div>
                )}
                {order.status === 'cancelled' && (
                  <div className="flex-1 py-2 bg-red-500/20 text-red-400 text-center font-bold rounded-lg">
                    Cancelled
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
