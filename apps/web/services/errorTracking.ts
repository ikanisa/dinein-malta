/**
 * Error Tracking Service
 * Integrates with Sentry for error monitoring and performance.
 */

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export interface ErrorContext {
  userId?: string;
  venueId?: string;
  orderId?: string;
  userAgent?: string;
  url?: string;
  [key: string]: any;
}

class ErrorTracker {
  private initialized = false;
  private sentryDSN: string | null = null;
  private sentryEnabled = false;

  /**
   * Initialize error tracking (Sentry)
   */
  init(dsn?: string) {
    if (this.initialized) return;

    this.sentryDSN = dsn || import.meta.env.VITE_SENTRY_DSN || null;

    if (this.sentryDSN) {
      const tracesSampleRate = Number(
        import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || '0.1'
      );

      Sentry.init({
        dsn: this.sentryDSN,
        integrations: [new BrowserTracing()],
        tracesSampleRate: Number.isNaN(tracesSampleRate) ? 0.1 : tracesSampleRate,
        environment: import.meta.env.MODE,
      });
      this.sentryEnabled = true;
    }

    this.initialized = true;
  }

  /**
   * Capture an error
   */
  captureError(error: Error, context?: ErrorContext) {
    console.error('Error captured:', error, context);

    if (this.initialized && this.sentryEnabled) {
      Sentry.captureException(error, { extra: context });
    }

    // For now, log to console and potentially send to backend
    this.logError(error, context);
  }

  /**
   * Capture a message
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext) {
    console.log(`[${level.toUpperCase()}]`, message, context);

    if (this.initialized && this.sentryEnabled) {
      Sentry.captureMessage(message, { level, extra: context });
    }
  }

  /**
   * Set user context
   */
  setUser(userId: string, email?: string, metadata?: Record<string, any>) {
    if (this.initialized && this.sentryEnabled) {
      Sentry.setUser({ id: userId, email, ...metadata });
    }
  }

  /**
   * Clear user context
   */
  clearUser() {
    if (this.initialized && this.sentryEnabled) {
      Sentry.setUser(null);
    }
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(message: string, category?: string, level: 'info' | 'warning' | 'error' = 'info', data?: Record<string, any>) {
    if (this.initialized && this.sentryEnabled) {
      Sentry.addBreadcrumb({ message, category, level, data });
    }
  }

  /**
   * Log error to backend (fallback if Sentry not available)
   */
  private async logError(error: Error, context?: ErrorContext) {
    try {
      // Optionally send to your backend for logging
      const errorLog = {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // Uncomment to send to your backend
      // await fetch('/api/log-error', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorLog),
      // });
    } catch (e) {
      console.error('Failed to log error to backend:', e);
    }
  }
}

export const errorTracker = new ErrorTracker();

// Initialize on import (can be disabled in dev)
if (import.meta.env.PROD) {
  errorTracker.init();
}


