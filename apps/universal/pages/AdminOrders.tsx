import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { getAllOrders } from '../services/databaseService';
import { Order } from '../types';

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllOrders().then(data => {
        setOrders(data.sort((a,b) => b.timestamp - a.timestamp));
        setLoading(false);
    });
  }, []);

  return (
    <div className="p-6 pb-24 space-y-6 animate-fade-in pt-safe-top">
      <header>
          <h1 className="text-3xl font-bold">Global Orders</h1>
          <p className="text-gray-400 text-sm">Live order feed</p>
      </header>

      <div className="space-y-3">
          {orders.map(order => (
              <GlassCard key={order.id} className="flex justify-between items-center border-l-4 border-blue-500">
                  <div>
                      <div className="font-bold text-lg">€{order.totalAmount.toFixed(2)}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-2">
                          <span className="font-mono text-blue-300">{order.orderCode}</span>
                          <span>•</span>
                          <span>{new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">{order.venueId}</div>
                  </div>
                  <div className="text-right">
                       <div className={`text-xs font-bold uppercase mb-1 ${order.status === 'SERVED' ? 'text-green-400' : 'text-blue-400'}`}>{order.status}</div>
                       <div className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${order.paymentStatus === 'PAID' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                           {order.paymentStatus}
                       </div>
                  </div>
              </GlassCard>
          ))}
          {!loading && orders.length === 0 && (
              <div className="text-center text-gray-500 py-10">No orders recorded today.</div>
          )}
      </div>
    </div>
  );
};

export default AdminOrders;