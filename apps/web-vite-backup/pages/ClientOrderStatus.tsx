import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { Spinner } from '../components/Loading';
import { Button } from '../components/ui';
import { PageHeader } from '../components/common/PageHeader';
import { getOrderById } from '../services/databaseService';
import { Order, OrderStatus, PaymentStatus } from '../types';
import { toast } from 'react-hot-toast';

const ClientOrderStatus = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(true);

  const loadOrder = useCallback(async () => {
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
  }, [id, navigate]);

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
  }, [id, polling, order, navigate, loadOrder]);



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
          <Button
            onClick={() => navigate('/')}
            variant="primary"
            size="lg"
          >
            Go Home
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-24" role="main" aria-label="Order status">
      {/* Header using PageHeader component */}
      <PageHeader
        title="Order Status"
        leftAction="back"
        rightAction="home"
      />

      {/* Spacer for fixed header */}
      <div className="h-20" />

      <div className="max-w-md mx-auto p-6 space-y-6">

        {/* ... existing code ... */}

        {/* Actions */}
        <div className="space-y-3">
          {(order.paymentStatus === PaymentStatus.UNPAID) && (
            <Button
              onClick={() => {
                toast('Payment options coming soon', { icon: 'ℹ️' });
              }}
              variant="primary"
              size="lg"
              className="w-full"
            >
              Pay Now
            </Button>
          )}
          <Button
            onClick={() => order?.venueId ? navigate(`/v/${order.venueId}`) : navigate('/')}
            variant="outline"
            size="lg"
            className="w-full"
          >
            <span className="mr-2">🍽️</span>
            Back to Menu
          </Button>
        </div>

        {/* Polling Indicator */}
        {polling && (
          <div className="text-center text-xs text-muted">
            <span className="inline-block w-2 h-2 bg-primary-500 rounded-full animate-pulse mr-2"></span>
            Auto-updating...
          </div>
        )}
      </div>
    </main>
  );
};

export default ClientOrderStatus;
