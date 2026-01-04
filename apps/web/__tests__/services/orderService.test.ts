/**
 * Tests for orderService
 */

import { getQueuedOrders, clearQueuedOrders } from '../../services/orderService';

describe('orderService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getQueuedOrders', () => {
    it('returns empty array when no queued orders', () => {
      expect(getQueuedOrders()).toEqual([]);
    });

    it('returns queued orders from localStorage', () => {
      const queued = [
        { id: 'order-1', orderData: {}, timestamp: Date.now() },
        { id: 'order-2', orderData: {}, timestamp: Date.now() },
      ];
      localStorage.setItem('queued_orders', JSON.stringify(queued));
      expect(getQueuedOrders()).toHaveLength(2);
    });

    it('handles invalid JSON gracefully', () => {
      localStorage.setItem('queued_orders', 'invalid json');
      expect(getQueuedOrders()).toEqual([]);
    });
  });

  describe('clearQueuedOrders', () => {
    it('removes specified orders from queue', () => {
      const queued = [
        { id: 'order-1', orderData: {}, timestamp: Date.now() },
        { id: 'order-2', orderData: {}, timestamp: Date.now() },
        { id: 'order-3', orderData: {}, timestamp: Date.now() },
      ];
      localStorage.setItem('queued_orders', JSON.stringify(queued));

      clearQueuedOrders(['order-1', 'order-3']);

      const remaining = getQueuedOrders();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe('order-2');
    });

    it('handles clearing non-existent orders', () => {
      const queued = [{ id: 'order-1', orderData: {}, timestamp: Date.now() }];
      localStorage.setItem('queued_orders', JSON.stringify(queued));

      clearQueuedOrders(['non-existent']);

      expect(getQueuedOrders()).toHaveLength(1);
    });
  });
});

