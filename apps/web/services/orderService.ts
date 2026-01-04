/**
 * Order Service with Offline Support
 * Handles order creation with background sync for offline scenarios
 */

import { createOrder as dbCreateOrder } from './databaseService';
import { type Order } from '../types';
import { queueRequest } from './offlineQueue';
import { supabase } from './supabase';

export interface CreateOrderInput {
  venueId: string;
  tablePublicCode?: string;
  tableNumber?: string;
  items: Array<{ item: any; quantity: number; selectedOptions?: string[] }>;
  totalAmount?: number;
  notes?: string;
}

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
    const queuedOrders = JSON.parse(localStorage.getItem('queued_orders') || '[]');
    queuedOrders.push({
      id: tempOrderId,
      orderData,
      timestamp: Date.now(),
    });
    localStorage.setItem('queued_orders', JSON.stringify(queuedOrders));

    // Register background sync
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        // @ts-ignore
        await registration.sync.register(`sync-order-${tempOrderId}`);
      } catch (error) {
        console.warn('Background sync registration failed:', error);
      }
    }

    // Return a temporary order object for UI
    const tempOrder: Order = {
      id: tempOrderId,
      venueId: input.venueId,
      tableNumber: input.tableNumber || input.tablePublicCode || '',
      orderCode: 'PENDING',
      status: 'received' as any,
      paymentStatus: 'unpaid' as any,
      totalAmount: input.totalAmount || 0,
      items: orderData.items as any,
      currency: 'EUR',
      timestamp: Date.now(),
      createdAt: new Date().toISOString(),
      customerNote: orderData.notes || ''
    };

    return tempOrder;
  }

  // Online - create order normally
  try {
    return await dbCreateOrder(input);
  } catch (error) {
    // If creation fails and we're still online, throw the error
    // The UI should handle it appropriately
    throw error;
  }
}

/**
 * Get queued orders from localStorage
 */
export function getQueuedOrders(): Array<{ id: string; orderData: any; timestamp: number }> {
  try {
    return JSON.parse(localStorage.getItem('queued_orders') || '[]');
  } catch {
    return [];
  }
}

/**
 * Process queued orders (called when back online)
 */
export async function processQueuedOrders(): Promise<{ success: number; failed: number }> {
  const queued = getQueuedOrders();
  if (queued.length === 0) return { success: 0, failed: 0 };

  const results = { success: 0, failed: 0 };
  const remaining: typeof queued = [];

  for (const queuedOrder of queued) {
    try {
      await supabase.functions.invoke('order_create', {
        body: queuedOrder.orderData,
      });
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
  localStorage.setItem('queued_orders', JSON.stringify(remaining));

  return results;
}

/**
 * Clear queued orders (after successful sync)
 */
export function clearQueuedOrders(orderIds: string[]): void {
  const queued = getQueuedOrders();
  const remaining = queued.filter(q => !orderIds.includes(q.id));
  localStorage.setItem('queued_orders', JSON.stringify(remaining));
}

