/**
 * Tests for Share API service
 */

import { isShareSupported, share, shareVenue, shareOrder } from '../../services/shareAPI';

describe('Share API Service', () => {
  beforeEach(() => {
    // Mock navigator.share
    (navigator as any).share = jest.fn().mockResolvedValue(undefined);
    (navigator as any).clipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
  });

  afterEach(() => {
    delete (navigator as any).share;
  });

  describe('isShareSupported', () => {
    it('should return true when Share API is supported', () => {
      expect(isShareSupported()).toBe(true);
    });

    it('should return false when Share API is not supported', () => {
      delete (navigator as any).share;
      expect(isShareSupported()).toBe(false);
    });
  });

  describe('share', () => {
    it('should share when API is supported', async () => {
      const shareData = { title: 'Test', text: 'Test text', url: 'https://example.com' };
      await share(shareData);
      expect((navigator as any).share).toHaveBeenCalledWith(shareData);
    });

    it('should fallback to clipboard when API is not supported', async () => {
      delete (navigator as any).share;
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
      
      await share({ url: 'https://example.com' });
      expect((navigator as any).clipboard.writeText).toHaveBeenCalledWith('https://example.com');
      expect(alertSpy).toHaveBeenCalled();
      
      alertSpy.mockRestore();
    });

    it('should handle user cancellation gracefully', async () => {
      const error = new Error('User cancelled');
      error.name = 'AbortError';
      (navigator as any).share = jest.fn().mockRejectedValue(error);
      
      await expect(share({ title: 'Test' })).resolves.not.toThrow();
    });
  });

  describe('shareVenue', () => {
    it('should share venue with correct data', async () => {
      await shareVenue('venue-123', 'Test Venue', 'https://example.com/venue');
      expect((navigator as any).share).toHaveBeenCalledWith({
        title: 'Check out Test Venue on DineIn',
        text: 'I found this great place: Test Venue',
        url: 'https://example.com/venue',
      });
    });
  });

  describe('shareOrder', () => {
    it('should share order with correct data', async () => {
      await shareOrder('ORDER-123', 'Test Venue');
      expect((navigator as any).share).toHaveBeenCalledWith({
        title: 'My order at Test Venue',
        text: 'Order code: ORDER-123',
        url: window.location.origin,
      });
    });
  });
});



