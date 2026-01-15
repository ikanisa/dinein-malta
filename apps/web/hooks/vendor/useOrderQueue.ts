import { useEffect, useState, useCallback } from 'react';
import { Order, OrderStatus } from '../../types';
import { supabase } from '../../services/supabase';
import { getOrdersForVenue, updateOrderStatus, toOrderStatus, toPaymentStatus } from '../../services/databaseService';
import { toast } from 'react-hot-toast';

interface UseOrderQueueOptions {
  venueId: string | null;
  tables: Array<{ id: string; label: string; code: string }>;
}

interface UseOrderQueueReturn {
  orders: Order[];
  isConnected: boolean;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  acceptOrder: (orderId: string) => Promise<void>;
  markReady: (orderId: string) => Promise<void>;
  completeOrder: (orderId: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  refreshOrders: () => Promise<void>;
}

/**
 * Generate a simple notification tone using Web Audio API
 * Fallback if audio file is not available
 */
const generateNotificationTone = (): void => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Create a pleasant two-tone chime
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    console.warn('Web Audio API not available:', e);
  }
};

const playNotificationSound = () => {
  // Check if sound alerts are enabled
  const soundAlertsEnabled = localStorage.getItem('vendor_sound_alerts') !== 'false';
  
  if (!soundAlertsEnabled) {
    // Still vibrate if sound is disabled
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
    return;
  }

  // Try to play audio file first
  try {
    const audio = new Audio('/sounds/new-order.mp3');
    audio.volume = 0.7;
    
    // Check if file loaded (if 404, fallback to generated tone)
    audio.addEventListener('error', (_e) => {
      console.warn('Audio file not found, using generated tone');
      generateNotificationTone();
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    });

    audio.play().catch((e) => {
      // Autoplay may be blocked, fallback to generated tone
      console.warn('Audio play failed, using generated tone:', e);
      generateNotificationTone();
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    });
  } catch (e) {
    // If Audio constructor fails, use generated tone
    console.warn('Audio not available, using generated tone:', e);
    generateNotificationTone();
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  }
};

const sendPushNotification = (order: Order) => {
  // Check if push notifications are enabled
  const pushNotificationsEnabled = localStorage.getItem('vendor_push_notifications') !== 'false';
  
  if (!pushNotificationsEnabled) return;
  
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification('New Order!', {
        body: `Table ${order.tableNumber} - ${order.items.length} items - €${order.totalAmount.toFixed(2)}`,
        icon: '/icons/icon-192x192.png',
        tag: `order-${order.id}`,
        requireInteraction: true,
      });
    } catch (e) {
      console.error('Push notification failed:', e);
    }
  }
};

export const useOrderQueue = ({ venueId, tables }: UseOrderQueueOptions): UseOrderQueueReturn => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isConnected, setIsConnected] = useState(true);

  const resolveTableLabel = useCallback((tableId?: string | null) => {
    if (!tableId) return 'N/A';
    const table = tables.find((t) => t.id === tableId);
    return table?.label || table?.code || 'N/A';
  }, [tables]);

  const mapRealtimeOrder = useCallback((row: any): Order => {
    // Map order_items if present in payload
    let items: Order['items'] = [];
    if (row.order_items && Array.isArray(row.order_items)) {
      items = row.order_items.map((oi: any) => ({
        item: {
          id: oi.id || '',
          name: oi.name_snapshot || '',
          description: '',
          price: parseFloat(oi.price_snapshot || 0),
          category: '',
          available: true,
        },
        quantity: oi.qty || 1,
        selectedOptions: oi.modifiers_json ? (Array.isArray(oi.modifiers_json) ? oi.modifiers_json : []) : undefined,
      }));
    } else if (row.items && Array.isArray(row.items)) {
      // Fallback to items if present
      items = row.items;
    }

    return {
      id: row.id,
      venueId: row.vendor_id,
      tableNumber: resolveTableLabel(row.table_id),
      orderCode: row.order_code,
      items,
      totalAmount: Number(row.total_amount || 0),
      currency: row.currency || 'EUR',
      status: toOrderStatus(row.status),
      paymentStatus: toPaymentStatus(row.payment_status),
      timestamp: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
      customerNote: row.notes || undefined,
      createdAt: row.created_at,
    };
  }, [resolveTableLabel]);

  const refreshOrders = useCallback(async () => {
    if (!venueId) return;
    
    try {
      const allOrders = await getOrdersForVenue(venueId);
      // Filter to only active orders (not completed or cancelled)
      const activeOrders = allOrders.filter(
        o => o.status !== OrderStatus.COMPLETED && 
             o.status !== OrderStatus.CANCELLED &&
             o.status !== OrderStatus.SERVED // Legacy
      );
      // Sort by timestamp (newest first) - will be re-sorted by OrderQueue component
      setOrders(activeOrders.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Failed to refresh orders:', error);
      toast.error('Failed to load orders');
    }
  }, [venueId]);

  useEffect(() => {
    if (!venueId) return;

    refreshOrders();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`vendor:${venueId}:orders`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `vendor_id=eq.${venueId}`,
        },
        (payload) => {
          const newOrder = mapRealtimeOrder(payload.new);
          
          // Only add if it's a new order (not completed/cancelled)
          if (newOrder.status !== OrderStatus.COMPLETED && 
              newOrder.status !== OrderStatus.CANCELLED &&
              newOrder.status !== OrderStatus.SERVED) {
            setOrders((prev) => {
              // Check if order already exists
              if (prev.find(o => o.id === newOrder.id)) {
                return prev;
              }
              return [newOrder, ...prev];
            });

            // Play sound and send notification
            playNotificationSound();
            sendPushNotification(newOrder);
            toast.success(`New Order! Table ${newOrder.tableNumber}`, { icon: '🔔' });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `vendor_id=eq.${venueId}`,
        },
        (payload) => {
          const updatedOrder = mapRealtimeOrder(payload.new);
          
          setOrders((prev) => {
            const existingIndex = prev.findIndex(o => o.id === updatedOrder.id);
            
            // Remove if completed or cancelled
            if (updatedOrder.status === OrderStatus.COMPLETED || 
                updatedOrder.status === OrderStatus.CANCELLED ||
                updatedOrder.status === OrderStatus.SERVED) {
              return prev.filter(o => o.id !== updatedOrder.id);
            }
            
            // Update existing or add new
            if (existingIndex >= 0) {
              const updated = [...prev];
              updated[existingIndex] = updatedOrder;
              return updated;
            }
            
            return [updatedOrder, ...prev];
          });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') {
          refreshOrders(); // Refresh when connected
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [venueId, mapRealtimeOrder, refreshOrders]);

  const handleUpdateStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    // Optimistic update
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
    );

    try {
      await updateOrderStatus(orderId, status);
      
      // If completed or cancelled, remove from list
      if (status === OrderStatus.COMPLETED || status === OrderStatus.CANCELLED) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      }
    } catch (error) {
      // Revert optimistic update on error
      refreshOrders();
      throw error;
    }
  }, [refreshOrders]);

  const acceptOrder = useCallback(
    (orderId: string) => handleUpdateStatus(orderId, OrderStatus.PREPARING),
    [handleUpdateStatus]
  );

  const markReady = useCallback(
    (orderId: string) => handleUpdateStatus(orderId, OrderStatus.READY),
    [handleUpdateStatus]
  );

  const completeOrder = useCallback(
    (orderId: string) => handleUpdateStatus(orderId, OrderStatus.COMPLETED),
    [handleUpdateStatus]
  );

  const cancelOrder = useCallback(
    (orderId: string) => handleUpdateStatus(orderId, OrderStatus.CANCELLED),
    [handleUpdateStatus]
  );

  return {
    orders,
    isConnected,
    updateOrderStatus: handleUpdateStatus,
    acceptOrder,
    markReady,
    completeOrder,
    cancelOrder,
    refreshOrders,
  };
};
