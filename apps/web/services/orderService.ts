/**
 * Order Service with Offline Support
 * Handles order creation with background sync for offline scenarios
 */

import { createOrder as dbCreateOrder } from './databaseService';
import { type Order, OrderStatus, PaymentStatus } from '../types';
import { supabase } from './supabase';
import {
  enqueueQueuedOrder,
  getQueuedOrders as getQueuedOrdersFromStore,
  replaceQueuedOrders,
  removeQueuedOrders,
  type QueuedOrderRecord
} from './queuedOrdersStore';

export interface CreateOrderInput {
  venueId: string;
  tablePublicCode?: string;
  tableNumber?: string;
  items: Array<{ item: any; quantity: number; selectedOptions?: string[] }>;
  totalAmount?: number;
  notes?: string;
}

const ACCESS_TOKEN_REFRESH_WINDOW_MS = 60_000;

const getAuthHeaders = async (): Promise<Record<string, string> | undefined> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.access_token) {
      if (error) {
        console.warn('Failed to read auth session:', error);
      }
      return undefined;
    }

    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
    if (expiresAt && expiresAt - Date.now() < ACCESS_TOKEN_REFRESH_WINDOW_MS) {
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.warn('Failed to refresh auth session:', refreshError);
        return { Authorization: `Bearer ${session.access_token}` };
      }
      if (data.session?.access_token) {
        return { Authorization: `Bearer ${data.session.access_token}` };
      }
    }

    return { Authorization: `Bearer ${session.access_token}` };
  } catch (error) {
    console.warn('Failed to prepare auth headers:', error);
    return undefined;
  }
};

/**
 * Create an order with offline support
 * If offline, queues the order for background sync
 */
export async function createOrderWithOfflineSupport(input: CreateOrderInput): Promise<Order> {
  // Check if online
  if (!navigator.onLine) {
    // Queue for background sync using Supabase function invoke
    const orderData = {
      vendor_id: input.venueId,
      table_public_code: input.tablePublicCode || input.tableNumber || '',
      items: input.items.map(cartItem => ({
        menu_item_id: cartItem.item.id,
        qty: cartItem.quantity,
        modifiers_json: cartItem.selectedOptions || null,
      })),
      notes: input.notes || undefined,
    };

    // Store the order data for background sync
    const tempOrderId = `temp-${Date.now()}`;
    await enqueueQueuedOrder({
      id: tempOrderId,
      orderData,
      timestamp: Date.now(),
    });

    // Register background sync
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        // @ts-expect-error -- sync registration only exists in secure contexts
        await registration.sync.register(`sync-order-${tempOrderId}`);
      } catch (error) {
        console.warn('Background sync registration failed:', error);
      }
    }

    // Return a temporary order object for UI
    const tempOrder: Order & { _isQueued: true } = {
      id: tempOrderId,
      venueId: input.venueId,
      tableNumber: input.tableNumber || input.tablePublicCode || '',
      orderCode: 'PENDING',
      status: OrderStatus.RECEIVED,
      paymentStatus: PaymentStatus.UNPAID,
      totalAmount: input.totalAmount || 0,
      items: input.items.map(cartItem => ({
        item: cartItem.item,
        quantity: cartItem.quantity,
        selectedOptions: cartItem.selectedOptions
      })),
      currency: 'EUR',
      timestamp: Date.now(),
      createdAt: new Date().toISOString(),
      customerNote: orderData.notes || '',
      _isQueued: true
    };

    return tempOrder;
  }

  // Online - create order normally
  return await dbCreateOrder(input);
}

/**
 * Get queued orders from storage
 */
export async function getQueuedOrders(): Promise<QueuedOrderRecord[]> {
  return getQueuedOrdersFromStore();
}

/**
 * Process queued orders (called when back online)
 */
export async function processQueuedOrders(): Promise<{ success: number; failed: number }> {
  const queued = await getQueuedOrdersFromStore();
  if (queued.length === 0) return { success: 0, failed: 0 };

  const authHeaders = await getAuthHeaders();
  const results = { success: 0, failed: 0 };
  const remaining: typeof queued = [];

  for (const queuedOrder of queued) {
    try {
      const { data, error } = await supabase.functions.invoke('order_create', {
        body: queuedOrder.orderData,
        headers: authHeaders,
      });
      if (error) {
        throw error;
      }
      if (!data || (typeof data === 'object' && 'success' in data && !data.success)) {
        throw new Error('Order sync failed');
      }
      results.success++;
      // Order succeeded, remove from queue
    } catch (error) {
      console.error(`Failed to process queued order ${queuedOrder.id}:`, error);
      // Keep in queue for retry (could implement retry limit here)
      remaining.push(queuedOrder);
      results.failed++;
    }
  }

  // Save remaining queue
  await replaceQueuedOrders(remaining);

  return results;
}

/**
 * Clear queued orders (after successful sync)
 */
export async function clearQueuedOrders(orderIds: string[]): Promise<void> {
  await removeQueuedOrders(orderIds);
}
