/**
 * useTelemetry - Event tracking with offline queue
 * 
 * Tracks user interactions and flushes to backend.
 * Queues events when offline and flushes on reconnect.
 */

import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '../shared/services/supabase';
import { useSession } from '../context/SessionContext';

// =============================================================================
// TYPES
// =============================================================================

export type TelemetryEventType =
    | 'impression'
    | 'click'
    | 'add_to_cart'
    | 'checkout_open'
    | 'order_submit'
    | 'chat_message'
    | 'filter_apply'
    | 'error';

interface TelemetryEvent {
    type: TelemetryEventType;
    payload: Record<string, unknown>;
    timestamp: number;
}

interface QueuedEvent extends TelemetryEvent {
    guestId: string;
    sessionKey: string | null;
    visitId: string | null;
}

// =============================================================================
// STORAGE
// =============================================================================

const QUEUE_KEY = 'dinein_telemetry_queue';

function getQueue(): QueuedEvent[] {
    try {
        const data = localStorage.getItem(QUEUE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function saveQueue(queue: QueuedEvent[]): void {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

function clearQueue(): void {
    localStorage.removeItem(QUEUE_KEY);
}

// =============================================================================
// HOOK
// =============================================================================

export function useTelemetry() {
    const { guestId, sessionKey, visitId, isOffline } = useSession();
    const flushingRef = useRef(false);

    // Track an event
    const track = useCallback((type: TelemetryEventType, payload: Record<string, unknown> = {}) => {
        const event: QueuedEvent = {
            type,
            payload,
            timestamp: Date.now(),
            guestId,
            sessionKey,
            visitId,
        };

        // Add to queue
        const queue = getQueue();
        queue.push(event);
        saveQueue(queue);

        // Try to flush if online
        if (!isOffline) {
            flushQueue();
        }
    }, [guestId, sessionKey, visitId, isOffline]);

    // Flush queue to backend
    const flushQueue = useCallback(async () => {
        if (flushingRef.current) return;

        const queue = getQueue();
        if (queue.length === 0) return;

        flushingRef.current = true;

        try {
            await supabase.functions.invoke('api', {
                body: { events: queue },
                headers: { 'x-route': '/telemetry' },
            });

            clearQueue();
        } catch (err) {
            console.error('Failed to flush telemetry:', err);
            // Keep queue for retry
        } finally {
            flushingRef.current = false;
        }
    }, []);

    // Flush on reconnect
    useEffect(() => {
        if (!isOffline) {
            flushQueue();
        }
    }, [isOffline, flushQueue]);

    // Flush on page unload
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (navigator.sendBeacon) {
                const queue = getQueue();
                if (queue.length > 0) {
                    const blob = new Blob([JSON.stringify({ events: queue })], { type: 'application/json' });
                    navigator.sendBeacon(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api/telemetry`, blob);
                    clearQueue();
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    return { track, flushQueue };
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

export function trackImpression(itemId: string, context?: Record<string, unknown>) {
    return { type: 'impression' as const, payload: { itemId, ...context } };
}

export function trackClick(actionRef: string, context?: Record<string, unknown>) {
    return { type: 'click' as const, payload: { actionRef, ...context } };
}

export function trackAddToCart(itemId: string, quantity: number) {
    return { type: 'add_to_cart' as const, payload: { itemId, quantity } };
}

export function trackError(error: string, context?: Record<string, unknown>) {
    return { type: 'error' as const, payload: { error, ...context } };
}
