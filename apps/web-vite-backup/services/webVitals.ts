/**
 * Web Vitals Monitoring
 * Tracks Core Web Vitals and reports to analytics and Sentry.
 * Includes performance budget alerts for production monitoring.
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals';
import { trackEvent } from './analytics';
import * as Sentry from '@sentry/react';

export interface WebVitalMetric {
  name: string;
  value: number;
  id: string;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

/**
 * Performance Budget Thresholds
 * Based on Google's Core Web Vitals recommendations
 * https://web.dev/articles/vitals
 */
export const PERFORMANCE_BUDGETS = {
  // Largest Contentful Paint (ms)
  LCP: {
    good: 2500,
    poor: 4000,
    budget: 2500, // Target for alerts
  },
  // First Contentful Paint (ms)
  FCP: {
    good: 1800,
    poor: 3000,
    budget: 2000,
  },
  // Cumulative Layout Shift (ratio)
  CLS: {
    good: 0.1,
    poor: 0.25,
    budget: 0.1,
  },
  // Interaction to Next Paint (ms)
  INP: {
    good: 200,
    poor: 500,
    budget: 200,
  },
  // Time to First Byte (ms)
  TTFB: {
    good: 800,
    poor: 1800,
    budget: 1000,
  },
} as const;

/**
 * Check if metric exceeds performance budget
 */
function checkBudget(metric: Metric): { exceeded: boolean; budget: number; delta: number } {
  const budget = PERFORMANCE_BUDGETS[metric.name as keyof typeof PERFORMANCE_BUDGETS];
  if (!budget) return { exceeded: false, budget: 0, delta: 0 };

  const exceeded = metric.value > budget.budget;
  return {
    exceeded,
    budget: budget.budget,
    delta: metric.value - budget.budget,
  };
}

/**
 * Report Web Vitals to analytics and Sentry
 */
export function reportWebVitals(metric: Metric) {
  const metricData = {
    name: metric.name,
    value: Math.round(metric.value),
    metric_id: metric.id,
    metric_value: metric.value,
    metric_delta: metric.delta,
    metric_rating: metric.rating,
    navigation_type: metric.navigationType,
  };

  // Check performance budget
  const budgetCheck = checkBudget(metric);

  // Send to analytics
  trackEvent('web_vital', {
    ...metricData,
    budget_exceeded: budgetCheck.exceeded,
    budget_delta: budgetCheck.delta,
  });

  // Send to Sentry as measurement (for performance monitoring)
  if (import.meta.env.PROD && typeof window !== 'undefined') {
    try {
      Sentry.metrics.distribution(metric.name, metric.value, {
        unit: metric.name === 'CLS' ? 'ratio' : 'millisecond',
        tags: {
          rating: metric.rating,
          navigationType: metric.navigationType || 'unknown',
          budgetExceeded: String(budgetCheck.exceeded),
        },
      });

      // Log poor ratings or budget violations as breadcrumbs for debugging
      if (metric.rating === 'poor' || budgetCheck.exceeded) {
        Sentry.addBreadcrumb({
          category: 'web-vital',
          message: budgetCheck.exceeded
            ? `${metric.name} exceeded budget by ${Math.round(budgetCheck.delta)}${metric.name === 'CLS' ? '' : 'ms'}`
            : `${metric.name} is poor: ${Math.round(metric.value)}${metric.name === 'CLS' ? '' : 'ms'}`,
          level: budgetCheck.exceeded ? 'error' : 'warning',
          data: { ...metricData, budgetCheck },
        });
      }

      // Send alert for severe budget violations (>50% over budget)
      if (budgetCheck.exceeded && budgetCheck.delta > budgetCheck.budget * 0.5) {
        Sentry.captureMessage(`Performance budget severely exceeded: ${metric.name}`, {
          level: 'warning',
          tags: {
            metric: metric.name,
            rating: metric.rating,
          },
          extra: {
            value: metric.value,
            budget: budgetCheck.budget,
            delta: budgetCheck.delta,
            url: window.location.href,
          },
        });
      }
    } catch (error) {
      // Silently fail if Sentry is not initialized
      console.warn('Failed to send Web Vital to Sentry:', error);
    }
  }

  // Log to console in development
  if (import.meta.env.DEV) {
    const budgetStatus = budgetCheck.exceeded
      ? `⚠️ OVER BUDGET by ${Math.round(budgetCheck.delta)}${metric.name === 'CLS' ? '' : 'ms'}`
      : '✅ Within budget';

    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      budget: budgetCheck.budget,
      status: budgetStatus,
      navigationType: metric.navigationType,
    });
  }
}

/**
 * Initialize Web Vitals monitoring
 */
export async function initWebVitals() {
  if (typeof window === 'undefined') return;

  try {
    // Use the Metric type from web-vitals
    onCLS(reportWebVitals);
    onFCP(reportWebVitals);
    onLCP(reportWebVitals);
    onTTFB(reportWebVitals);
    onINP(reportWebVitals);

    if (import.meta.env.DEV) {
      console.log('[Web Vitals] Monitoring initialized with budgets:', PERFORMANCE_BUDGETS);
    }
  } catch (error) {
    console.warn('Failed to initialize Web Vitals monitoring:', error);
  }
}

/**
 * Get current performance budget configuration
 */
export function getPerformanceBudgets() {
  return PERFORMANCE_BUDGETS;
}

// Initialize on load
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    initWebVitals();
  });
}

