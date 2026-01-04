/**
 * Tests for analytics service
 */

import { analytics, trackOrderPlaced, trackVenueViewed, trackSearch } from '../../services/analytics';

describe('Analytics Service', () => {
  beforeEach(() => {
    // Mock gtag
    (window as any).gtag = jest.fn();
  });

  afterEach(() => {
    delete (window as any).gtag;
  });

  describe('init', () => {
    it('should initialize with measurement ID', () => {
      analytics.init('G-TEST123');
      expect(analytics).toBeDefined();
    });
  });

  describe('trackEvent', () => {
    it('should track event when initialized', () => {
      analytics.init('G-TEST123');
      analytics.trackEvent('test_event', { param: 'value' });
      expect((window as any).gtag).toHaveBeenCalledWith('event', 'test_event', { param: 'value' });
    });

    it('should log to console when not initialized', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      analytics.trackEvent('test_event');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('trackOrderPlaced', () => {
    it('should track order placed event', () => {
      analytics.init('G-TEST123');
      trackOrderPlaced('order-123', 'venue-456', 25.50);
      expect((window as any).gtag).toHaveBeenCalledWith('event', 'order_placed', {
        order_id: 'order-123',
        venue_id: 'venue-456',
        value: 25.50,
        currency: 'EUR',
      });
    });
  });

  describe('trackVenueViewed', () => {
    it('should track venue viewed event', () => {
      analytics.init('G-TEST123');
      trackVenueViewed('venue-123', 'Test Venue');
      expect((window as any).gtag).toHaveBeenCalledWith('event', 'venue_viewed', {
        venue_id: 'venue-123',
        venue_name: 'Test Venue',
      });
    });
  });

  describe('trackSearch', () => {
    it('should track search event', () => {
      analytics.init('G-TEST123');
      trackSearch('pizza', 10);
      expect((window as any).gtag).toHaveBeenCalledWith('event', 'search', {
        search_term: 'pizza',
        result_count: 10,
      });
    });
  });
});



