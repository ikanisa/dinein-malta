/**
 * Tests for Badge API service
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setBadge, clearBadge, isBadgeAPISupported } from '../../services/badgeAPI';

describe('Badge API Service', () => {
  beforeEach(() => {
    // Mock navigator.setAppBadge and clearAppBadge
    (navigator as any).setAppBadge = vi.fn().mockResolvedValue(undefined);
    (navigator as any).clearAppBadge = vi.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    delete (navigator as any).setAppBadge;
    delete (navigator as any).clearAppBadge;
  });

  describe('isBadgeAPISupported', () => {
    it('should return true when Badge API is supported', () => {
      expect(isBadgeAPISupported()).toBe(true);
    });

    it('should return false when Badge API is not supported', () => {
      delete (navigator as any).setAppBadge;
      expect(isBadgeAPISupported()).toBe(false);
    });
  });

  describe('setBadge', () => {
    it('should set badge with count', async () => {
      await setBadge(5);
      expect((navigator as any).setAppBadge).toHaveBeenCalledWith(5);
    });

    it('should clear badge when count is 0', async () => {
      await setBadge(0);
      expect((navigator as any).clearAppBadge).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      (navigator as any).setAppBadge = vi.fn().mockRejectedValue(new Error('Failed'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      await setBadge(5);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('clearBadge', () => {
    it('should clear badge', async () => {
      await clearBadge();
      expect((navigator as any).clearAppBadge).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      (navigator as any).clearAppBadge = vi.fn().mockRejectedValue(new Error('Failed'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      await clearBadge();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});



