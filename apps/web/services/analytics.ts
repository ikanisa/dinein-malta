/**
 * Analytics Service
 * Google Analytics 4 integration
 */

export interface AnalyticsEvent {
  event_name: string;
  event_params?: Record<string, any>;
}

class Analytics {
  private initialized = false;
  private measurementId: string | null = null;

  /**
   * Initialize Google Analytics 4
   */
  init(measurementId?: string) {
    if (this.initialized) return;

    this.measurementId = measurementId || process.env.VITE_GA_MEASUREMENT_ID || null;

    if (this.measurementId && typeof window !== 'undefined') {
      // Load Google Analytics script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
      document.head.appendChild(script);

      // Initialize gtag
      (window as any).dataLayer = (window as any).dataLayer || [];
      if (!(window as any).gtag) {
        const gtag = (...args: any[]) => {
          (window as any).dataLayer.push(args);
        };
        (window as any).gtag = gtag;
      }

      (window as any).gtag('js', new Date());
      (window as any).gtag('config', this.measurementId, {
        page_path: window.location.pathname,
      });

      this.initialized = true;
    }
  }

  /**
   * Track an event
   */
  trackEvent(eventName: string, eventParams?: Record<string, any>) {
    if (!this.initialized || !this.measurementId) {
      console.log('[Analytics]', eventName, eventParams);
      return;
    }

    try {
      (window as any).gtag('event', eventName, eventParams);
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  /**
   * Track page view
   */
  trackPageView(path: string, title?: string) {
    if (!this.initialized || !this.measurementId) {
      console.log('[Analytics] Page view:', path);
      return;
    }

    try {
      (window as any).gtag('config', this.measurementId, {
        page_path: path,
        page_title: title || document.title,
      });
    } catch (error) {
      console.error('Analytics page view error:', error);
    }
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, any>) {
    if (!this.initialized || !this.measurementId) {
      return;
    }

    try {
      (window as any).gtag('set', 'user_properties', properties);
    } catch (error) {
      console.error('Analytics set user properties error:', error);
    }
  }

  /**
   * Set user ID
   */
  setUserId(userId: string | null) {
    if (!this.initialized || !this.measurementId) {
      return;
    }

    try {
      (window as any).gtag('config', this.measurementId, {
        user_id: userId,
      });
    } catch (error) {
      console.error('Analytics set user ID error:', error);
    }
  }
}

export const analytics = new Analytics();

// Track common events
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  analytics.trackEvent(eventName, params);
};

export const trackOrderPlaced = (orderId: string, venueId: string, total: number) => {
  trackEvent('order_placed', {
    order_id: orderId,
    venue_id: venueId,
    value: total,
    currency: 'EUR',
  });
};

export const trackVenueViewed = (venueId: string, venueName: string) => {
  trackEvent('venue_viewed', {
    venue_id: venueId,
    venue_name: venueName,
  });
};

export const trackSearch = (query: string, resultCount: number) => {
  trackEvent('search', {
    search_term: query,
    result_count: resultCount,
  });
};
