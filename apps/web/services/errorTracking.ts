/**
 * Error Tracking Service
 * Integrates with error tracking service (Sentry-ready)
 */

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

  /**
   * Initialize error tracking (Sentry)
   */
  init(dsn?: string) {
    if (this.initialized) return;

    this.sentryDSN = dsn || import.meta.env.VITE_SENTRY_DSN || null;

    if (this.sentryDSN) {
      // In production, initialize Sentry here
      // import * as Sentry from "@sentry/react";
      // Sentry.init({ dsn: this.sentryDSN, ... });
      console.log('Error tracking initialized');
    }

    this.initialized = true;
  }

  /**
   * Capture an error
   */
  captureError(error: Error, context?: ErrorContext) {
    console.error('Error captured:', error, context);

    // In production, send to Sentry
    // if (this.initialized && this.sentryDSN) {
    //   Sentry.captureException(error, { extra: context });
    // }

    // For now, log to console and potentially send to backend
    this.logError(error, context);
  }

  /**
   * Capture a message
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext) {
    console.log(`[${level.toUpperCase()}]`, message, context);

    // In production, send to Sentry
    // if (this.initialized && this.sentryDSN) {
    //   Sentry.captureMessage(message, { level, extra: context });
    // }
  }

  /**
   * Set user context
   */
  setUser(userId: string, email?: string, metadata?: Record<string, any>) {
    // In production, set Sentry user context
    // if (this.initialized && this.sentryDSN) {
    //   Sentry.setUser({ id: userId, email, ...metadata });
    // }
  }

  /**
   * Clear user context
   */
  clearUser() {
    // In production, clear Sentry user context
    // if (this.initialized && this.sentryDSN) {
    //   Sentry.setUser(null);
    // }
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(message: string, category?: string, level: 'info' | 'warning' | 'error' = 'info', data?: Record<string, any>) {
    // In production, add Sentry breadcrumb
    // if (this.initialized && this.sentryDSN) {
    //   Sentry.addBreadcrumb({ message, category, level, data });
    // }
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



