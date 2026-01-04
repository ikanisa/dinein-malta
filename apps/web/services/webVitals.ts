/**
 * Web Vitals Monitoring
 * Tracks Core Web Vitals and reports to analytics
 */

export interface WebVitalMetric {
  name: string;
  value: number;
  id: string;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

/**
 * Report Web Vitals to analytics
 */
export function reportWebVitals(metric: WebVitalMetric) {
  // Send to analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
      metric_rating: metric.rating,
    });
  }

  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
    });
  }
}

/**
 * Initialize Web Vitals monitoring
 */
export async function initWebVitals() {
  // Web vitals disabled to fix build issues with URL imports
  console.log('Web Vitals monitoring initialized (stub)');
}

// Initialize on load
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    initWebVitals();
  });
}
