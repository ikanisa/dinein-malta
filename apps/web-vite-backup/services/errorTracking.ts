/* eslint-disable @typescript-eslint/no-explicit-any */
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
        integrations: [
          new BrowserTracing({
            // Trace navigation and user interactions
            tracePropagationTargets: ['localhost', /^https:\/\/.*\.supabase\.co/],
          }),
        ],
        tracesSampleRate: Number.isNaN(tracesSampleRate) ? 0.1 : tracesSampleRate,
        environment: import.meta.env.MODE,
        // Release tracking for better debugging
        release: import.meta.env.VITE_APP_VERSION || 'unknown',
        // Set sample rate for sessions (1.0 = 100%)
        sampleRate: 1.0,
        // Performance monitoring
        beforeSend(event, hint) {
          // Filter out known non-critical errors
          if (event.exception) {
            const error = hint.originalException;
            // Ignore network errors when offline
            if (error instanceof TypeError && error.message.includes('fetch')) {
              if (!navigator.onLine) {
                return null; // Don't send offline errors
              }
            }
          }
          return event;
        },
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
      Sentry.setUser({ 
        id: userId, 
        email, 
        ...metadata,
      });
      
      // Set additional context tags for filtering
      if (metadata?.role) {
        Sentry.setTag('user_role', metadata.role);
      }
      if (metadata?.vendorId) {
        Sentry.setTag('vendor_id', metadata.vendorId);
      }
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
      // Uncomment and implement when backend logging is available
      // const errorLog = {
      //   message: error.message,
      //   stack: error.stack,
      //   context,
      //   timestamp: new Date().toISOString(),
      //   userAgent: navigator.userAgent,
      //   url: window.location.href,
      // };

      // Uncomment to send to your backend
      // await fetch('/api/log-error', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorLog),
      // });
      
      // Suppress unused parameter warnings
      void error;
      void context;
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


