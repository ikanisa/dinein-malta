/**
 * Performance Utilities
 * Core Web Vitals reporting and performance monitoring
 */

import type { Metric } from 'web-vitals';

// Track reported metrics to avoid duplicates
const reportedMetrics = new Set<string>();

/**
 * Report Web Vitals metric to analytics
 */
export const reportWebVitals = (metric: Metric): void => {
    // Avoid duplicate reports
    const metricKey = `${metric.name}-${metric.id}`;
    if (reportedMetrics.has(metricKey)) return;
    reportedMetrics.add(metricKey);

    // Log in development
    if (import.meta.env.DEV) {
        console.log(`[Web Vitals] ${metric.name}:`, {
            value: Math.round(metric.value),
            rating: metric.rating,
            navigationType: metric.navigationType,
        });
    }

    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', metric.name, {
            value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
            event_category: 'Web Vitals',
            event_label: metric.id,
            non_interaction: true,
        });
    }
};

/**
 * Initialize Web Vitals monitoring
 * Call this once in your app entry point
 */
export const initWebVitalsMonitoring = async (): Promise<void> => {
    if (typeof window === 'undefined') return;

    try {
        // web-vitals v4+ uses onINP instead of onFID
        const { onCLS, onFCP, onLCP, onTTFB, onINP } = await import('web-vitals');

        // Core Web Vitals
        onCLS(reportWebVitals);
        onLCP(reportWebVitals);
        onINP(reportWebVitals);

        // Additional metrics
        onFCP(reportWebVitals);
        onTTFB(reportWebVitals);
    } catch (error) {
        console.warn('[Performance] Failed to initialize Web Vitals:', error);
    }
};

/**
 * Measure component render time
 */
export const measureRender = (componentName: string): (() => void) => {
    const startTime = performance.now();

    return () => {
        const duration = performance.now() - startTime;
        if (import.meta.env.DEV && duration > 16) {
            console.warn(`[Performance] Slow render: ${componentName} took ${duration.toFixed(2)}ms`);
        }
    };
};

/**
 * Preload critical resources
 */
export const preloadResource = (href: string, as: 'script' | 'style' | 'image' | 'font'): void => {
    if (typeof document === 'undefined') return;

    // Check if already preloaded
    const existing = document.querySelector(`link[rel="preload"][href="${href}"]`);
    if (existing) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (as === 'font') {
        link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
};

/**
 * Performance budget thresholds (in ms)
 */
export const PERFORMANCE_BUDGET = {
    LCP: 2500,
    FID: 100,
    CLS: 0.1,
    TTFB: 600,
    FCP: 1800,
} as const;
