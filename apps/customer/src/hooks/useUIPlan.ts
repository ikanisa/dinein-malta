/**
 * useUIPlan - Hook for fetching UIPlan from Moltbot backend
 *
 * Handles loading, error, and caching states.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../shared/services/supabase';
import type { UIPlan } from '@dinein/core';

interface UseUIPlanOptions {
    screen: 'home' | 'search' | 'venue' | 'menu' | 'checkout' | 'orders' | 'chat_waiter';
    venueId?: string;
    categoryId?: string;
    query?: string;
    enabled?: boolean;
}

interface UseUIPlanResult {
    plan: UIPlan | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

// Simple in-memory cache
const planCache = new Map<string, { plan: UIPlan; expiresAt: number }>();

function getCacheKey(options: UseUIPlanOptions): string {
    return `${options.screen}:${options.venueId || ''}:${options.categoryId || ''}:${options.query || ''}`;
}

export function useUIPlan(options: UseUIPlanOptions): UseUIPlanResult {
    const { screen, venueId, categoryId, query, enabled = true } = options;

    const [plan, setPlan] = useState<UIPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPlan = useCallback(async () => {
        if (!enabled) return;

        const cacheKey = getCacheKey(options);

        // Check cache first
        const cached = planCache.get(cacheKey);
        if (cached && cached.expiresAt > Date.now()) {
            setPlan(cached.plan);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Get current session for actor info
            const { data: sessionData } = await supabase.auth.getSession();
            const userId = sessionData?.session?.user?.id || 'anonymous';

            // Build request payload
            const payload = {
                actor: {
                    actorType: 'guest',
                    actorId: userId,
                    locale: navigator.language,
                },
                screen: {
                    name: screen,
                    venueId,
                    categoryId,
                    query,
                },
                device: {
                    type: 'pwa',
                    viewport: {
                        width: window.innerWidth,
                        height: window.innerHeight,
                    },
                },
            };

            // Call the AI UI Plan endpoint
            const { data, error: fnError } = await supabase.functions.invoke('ai-ui-plan', {
                body: payload,
            });

            if (fnError) {
                throw new Error(fnError.message || 'Failed to fetch UI plan');
            }

            if (!data || !data.plan) {
                throw new Error('Invalid response from UI plan endpoint');
            }

            const fetchedPlan = data.plan as UIPlan;

            // Cache the plan
            const ttlSeconds = fetchedPlan.cache?.ttlSeconds || 300;
            planCache.set(cacheKey, {
                plan: fetchedPlan,
                expiresAt: Date.now() + ttlSeconds * 1000,
            });

            setPlan(fetchedPlan);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
            console.error('UIPlan fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [screen, venueId, categoryId, query, enabled]);

    useEffect(() => {
        fetchPlan();
    }, [fetchPlan]);

    return {
        plan,
        isLoading,
        error,
        refetch: fetchPlan,
    };
}

/**
 * Clear all cached UI plans
 */
export function clearUIPlanCache(): void {
    planCache.clear();
}

/**
 * Invalidate cache for a specific screen
 */
export function invalidateUIPlanCache(screen: string): void {
    for (const key of planCache.keys()) {
        if (key.startsWith(`${screen}:`)) {
            planCache.delete(key);
        }
    }
}
