import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { MenuItemData } from '@/components/menu/MenuItem';

export type AIVenueCategories = {
    primary_category?: string;
    cuisine_types?: string[];
    ambiance_tags?: string[];
    price_range?: string;
    highlights?: string[];
    dietary_friendly?: string[];
    popular_times?: string;
    competitor_context?: string;
};

export type AIMenuCategories = Record<string, {
    dietary_tags?: string[];
    flavor_profile?: string;
    smart_category?: string;
    cuisine_style?: string;
    meal_period?: string[];
    pairing_suggestions?: string;
}>;

interface UseAICategorizationReturn {
    venueCategories: AIVenueCategories | null;
    menuCategories: AIMenuCategories | null;
    isLoadingVenue: boolean;
    isLoadingMenu: boolean;
    error: string | null;
    fetchVenueCategories: () => Promise<void>;
    fetchMenuCategories: (items: MenuItemData[]) => Promise<void>;
}

export function useAICategorization(venueId: string, venueName: string, venueAddress: string): UseAICategorizationReturn {
    const [venueCategories, setVenueCategories] = useState<AIVenueCategories | null>(null);
    const [menuCategories, setMenuCategories] = useState<AIMenuCategories | null>(null);
    const [isLoadingVenue, setIsLoadingVenue] = useState(false);
    const [isLoadingMenu, setIsLoadingMenu] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        // Load from session storage on mount
        if (!venueId) return;

        try {
            const cachedVenue = sessionStorage.getItem(`venue_categories_${venueId}`);
            if (cachedVenue) {
                setVenueCategories(JSON.parse(cachedVenue));
            }

            const cachedMenu = sessionStorage.getItem(`menu_categories_${venueId}`);
            if (cachedMenu) {
                setMenuCategories(JSON.parse(cachedMenu));
            }
        } catch (e) {
            console.warn('Failed to load categories from session storage', e);
        }
    }, [venueId]);

    const fetchVenueCategories = useCallback(async () => {
        if (isLoadingVenue || venueCategories) return;

        // Check cache (sessionStorage)
        try {
            const cachedVenue = sessionStorage.getItem(`venue_categories_${venueId}`);
            if (cachedVenue) {
                setVenueCategories(JSON.parse(cachedVenue));
                return;
            }
        } catch { /* ignore */ }

        setIsLoadingVenue(true);
        setError(null);

        try {
            // Strategy: Try Persistent API first (stores to DB), fallback to Ephemeral Edge Function
            let resultData: AIVenueCategories | null = null;
            let persistSuccess = false;

            // 1. Try Persistent API (Next.js Route -> DB)
            try {
                const response = await fetch('/api/ai/categorize-venue', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ venueId })
                });

                if (response.ok) {
                    const json = await response.json();
                    if (json.categories) {
                        resultData = json.categories;
                        persistSuccess = true;
                    }
                }
            } catch (err) {
                console.warn('Persistent categorization failed, falling back to ephemeral:', err);
            }

            // 2. Fallback to Ephemeral Edge Function if persistence failed
            if (!persistSuccess || !resultData) {
                const { data, error: apiError } = await supabase.functions.invoke('gemini-features', {
                    body: {
                        action: 'categorize-venue',
                        payload: {
                            name: venueName,
                            address: venueAddress,
                        }
                    }
                });

                if (apiError) throw apiError;
                resultData = data?.data;
            }

            if (resultData) {
                setVenueCategories(resultData);
                try {
                    sessionStorage.setItem(`venue_categories_${venueId}`, JSON.stringify(resultData));
                } catch { /* ignore */ }
            }
        } catch (err: unknown) {
            console.error('Error fetching venue categories:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
        } finally {
            setIsLoadingVenue(false);
        }
    }, [venueId, venueName, venueAddress, isLoadingVenue, venueCategories, supabase]);

    const fetchMenuCategories = useCallback(async (items: MenuItemData[]) => {
        if (isLoadingMenu || menuCategories) return;

        // Check cache again
        try {
            const cachedMenu = sessionStorage.getItem(`menu_categories_${venueId}`);
            if (cachedMenu) {
                setMenuCategories(JSON.parse(cachedMenu));
                return;
            }
        } catch { /* ignore */ }

        setIsLoadingMenu(true);
        setError(null);

        try {
            // Small optimization: only send needed fields
            const itemsPayload = items.map(item => ({
                id: item.id,
                name: item.name,
                description: item.description
            }));

            const { data, error: apiError } = await supabase.functions.invoke('gemini-features', {
                body: {
                    action: 'categorize-menu',
                    payload: {
                        items: itemsPayload,
                        venueName: venueName
                    }
                }
            });

            if (apiError) throw apiError;
            if (data?.data) {
                setMenuCategories(data.data);
                try {
                    sessionStorage.setItem(`menu_categories_${venueId}`, JSON.stringify(data.data));
                } catch { /* ignore */ }
            }
        } catch (err: unknown) {
            console.error('Error fetching menu categories:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
        } finally {
            setIsLoadingMenu(false);
        }
    }, [venueId, venueName, isLoadingMenu, menuCategories, supabase]);

    return {
        venueCategories,
        menuCategories,
        isLoadingVenue,
        isLoadingMenu,
        error,
        fetchVenueCategories,
        fetchMenuCategories
    };
}
