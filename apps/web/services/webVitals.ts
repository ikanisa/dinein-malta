/**
 * Web Vitals Monitoring
 * Tracks Core Web Vitals and reports to analytics.
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';
import { trackEvent } from './analytics';

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
  trackEvent('web_vital', {
    name: metric.name,
    value: Math.round(metric.value),
    metric_id: metric.id,
    metric_value: metric.value,
    metric_delta: metric.delta,
    metric_rating: metric.rating,
  });

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
  const handler = (metric: WebVitalMetric) => reportWebVitals(metric);
  onCLS(handler);
  onFCP(handler);
  onLCP(handler);
  onTTFB(handler);
  onINP(handler);
}

// Initialize on load
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    initWebVitals();
  });
}
