import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { Spinner } from '../components/Loading';
import { getOrderById } from '../services/databaseService';
import { Order, OrderStatus, PaymentStatus } from '../types';
import { supabase } from '../services/supabase';
import { toast } from 'react-hot-toast';

const ClientOrderStatus = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    loadOrder();

    // Poll for order updates every 10 seconds if order is active
    const pollInterval = setInterval(() => {
      if (polling && order && order.status !== OrderStatus.SERVED && order.status !== OrderStatus.CANCELLED) {
        loadOrder();
      }
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [id, polling, order?.status]);

  const loadOrder = async () => {
    if (!id) return;

    try {
      const orderData = await getOrderById(id);
      if (orderData) {
        setOrder(orderData);
        // Stop polling if order is complete
        if (orderData.status === OrderStatus.SERVED || orderData.status === OrderStatus.CANCELLED) {
          setPolling(false);
        }
      } else {
        toast.error('Order not found');
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to load order:', error);
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.RECEIVED:
        return 'text-blue-500';
      case OrderStatus.SERVED:
        return 'text-green-500';
      case OrderStatus.CANCELLED:
        return 'text-red-500';
      default:
        return 'text-muted';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.RECEIVED:
        return '⏳';
      case OrderStatus.SERVED:
        return '✅';
      case OrderStatus.CANCELLED:
        return '❌';
      default:
        return '📦';
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    return (status === PaymentStatus.PAID) ? 'text-green-500' : 'text-orange-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <GlassCard className="p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Order Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold"
          >
            Go Home
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 pb-24 pt-safe-top">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-surface-highlight flex items-center justify-center text-foreground"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-foreground">Order Status</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Order Code */}
        <GlassCard className="p-6 text-center">
          <div className="text-sm text-muted mb-2">Order Code</div>
          <div className="text-3xl font-bold text-foreground font-mono">{order.orderCode}</div>
        </GlassCard>

        {/* Status */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-muted mb-1">Status</div>
              <div className={`text-2xl font-bold ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)} {order.status.toUpperCase()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted mb-1">Payment</div>
              <div className={`text-lg font-bold ${getPaymentStatusColor(order.paymentStatus)}`}>
                {order.paymentStatus.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Status Progress */}
          <div className="mt-4 space-y-2">
            <div className={`flex items-center gap-2 ${(order.status === OrderStatus.RECEIVED) ? 'text-blue-500' : 'text-muted'}`}>
              <span>{(order.status === OrderStatus.RECEIVED) ? '●' : '○'}</span>
              <span className="text-sm">Order Received</span>
            </div>
            <div className={`flex items-center gap-2 ${(order.status === OrderStatus.SERVED) ? 'text-green-500' : 'text-muted'}`}>
              <span>{(order.status === OrderStatus.SERVED) ? '●' : '○'}</span>
              <span className="text-sm">Order Served</span>
            </div>
          </div>
        </GlassCard>

        {/* Order Items */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Order Items</h2>
          <div className="space-y-3">
            {order.items?.map((item, index) => {
              // Handle both formats: { item: MenuItem, quantity, selectedOptions } and { name, price, quantity }
              const itemName = typeof item === 'object' && 'item' in item ? item.item.name : (item as any).name || 'Item';
              const itemPrice = typeof item === 'object' && 'item' in item ? item.item.price : (item as any).price || 0;
              const itemQuantity = typeof item === 'object' && 'quantity' in item ? item.quantity : (item as any).quantity || 1;

              return (
                <div key={index} className="flex justify-between items-start pb-3 border-b border-border last:border-0">
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{itemName}</div>
                    {itemQuantity > 1 && (
                      <div className="text-sm text-muted">Qty: {itemQuantity}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-foreground">
                      €{(itemPrice * itemQuantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
            <div className="text-lg font-bold text-foreground">Total</div>
            <div className="text-2xl font-bold text-foreground">€{order.totalAmount.toFixed(2)}</div>
          </div>
        </GlassCard>

        {/* Order Details */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Order Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Table</span>
              <span className="text-foreground font-medium">{order.tableNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Placed</span>
              <span className="text-foreground font-medium">
                {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
              </span>
            </div>
            {order.customerNote && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="text-muted mb-1">Note</div>
                <div className="text-foreground">{order.customerNote}</div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Actions */}
        <div className="space-y-3">
          {(order.paymentStatus === PaymentStatus.UNPAID) && (
            <button
              onClick={() => {
                // Navigate to payment or show payment options
                toast('Payment options coming soon', { icon: 'ℹ️' });
              }}
              className="w-full py-4 bg-blue-500 text-white rounded-xl font-bold"
            >
              Pay Now
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 bg-surface-highlight text-foreground rounded-xl font-bold border border-border"
          >
            Back to Home
          </button>
        </div>

        {/* Polling Indicator */}
        {polling && (
          <div className="text-center text-xs text-muted">
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></span>
            Auto-updating...
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientOrderStatus;

