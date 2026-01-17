/**
 * Tests for orderService
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { getQueuedOrders, clearQueuedOrders } from '../../services/orderService';

// Create a real localStorage mock for this test file
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    length: 0,
    key: () => null,
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('orderService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getQueuedOrders', () => {
    it('returns empty array when no queued orders', async () => {
      const result = await getQueuedOrders();
      expect(result).toEqual([]);
    });

    it('returns queued orders from localStorage', async () => {
      const queued = [
        { id: 'order-1', orderData: {}, timestamp: Date.now() },
        { id: 'order-2', orderData: {}, timestamp: Date.now() },
      ];
      localStorage.setItem('queued_orders', JSON.stringify(queued));
      const result = await getQueuedOrders();
      expect(result).toHaveLength(2);
    });

    it('handles invalid JSON gracefully', async () => {
      localStorage.setItem('queued_orders', 'invalid json');
      const result = await getQueuedOrders();
      expect(result).toEqual([]);
    });
  });

  describe('clearQueuedOrders', () => {
    it('removes specified orders from queue', async () => {
      const queued = [
        { id: 'order-1', orderData: {}, timestamp: Date.now() },
        { id: 'order-2', orderData: {}, timestamp: Date.now() },
        { id: 'order-3', orderData: {}, timestamp: Date.now() },
      ];
      localStorage.setItem('queued_orders', JSON.stringify(queued));

      await clearQueuedOrders(['order-1', 'order-3']);

      const remaining = await getQueuedOrders();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe('order-2');
    });

    it('handles clearing non-existent orders', async () => {
      const queued = [{ id: 'order-1', orderData: {}, timestamp: Date.now() }];
      localStorage.setItem('queued_orders', JSON.stringify(queued));

      await clearQueuedOrders(['non-existent']);

      const result = await getQueuedOrders();
      expect(result).toHaveLength(1);
    });
  });
});
