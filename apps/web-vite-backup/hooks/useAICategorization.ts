import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Venue } from '../types';

export interface AICategories {
    primary_category?: string;
    cuisine_types?: string[];
    ambiance_tags?: string[];
    price_range?: string;
    highlights?: string[];
    dietary_friendly?: string[];
    menu_grouping?: Record<string, {
        dietary_tags?: string[];
        flavor_profile?: string[];
        smart_category?: string;
    }>;
}

const CACHE_KEY_PREFIX = 'ai_categories_v1_';

export function useAICategorization(venue: Venue | undefined) {
    const [categories, setCategories] = useState<AICategories | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!venue?.id) return;

        const cacheKey = `${CACHE_KEY_PREFIX}${venue.id}`;
        const cached = sessionStorage.getItem(cacheKey);

        if (cached) {
            try {
                setCategories(JSON.parse(cached));
                return;
            } catch (e) {
                sessionStorage.removeItem(cacheKey);
            }
        }

        const fetchCategories = async () => {
            setIsCalculating(true);
            setError(null);

            try {
                // 1. Venue Categorization
                const { data: venueData, error: venueError } = await supabase.functions.invoke('gemini-features', {
                    body: {
                        action: 'categorize-venue',
                        payload: {
                            name: venue.name,
                            address: venue.address,
                            description: venue.description
                        }
                    }
                });

                if (venueError) throw venueError;

                // 2. Menu Categorization (only if menu items exist)
                let menuData = {};
                if (venue.menu && venue.menu.length > 0) {
                    const { data: mData, error: mError } = await supabase.functions.invoke('gemini-features', {
                        body: {
                            action: 'categorize-menu',
                            payload: {
                                items: venue.menu.map(i => ({ id: i.id, name: i.name, description: i.description })),
                                venueName: venue.name
                            }
                        }
                    });

                    if (!mError && mData?.data) {
                        menuData = mData.data;
                    }
                }

                const combined: AICategories = {
                    ...(venueData?.data || {}),
                    menu_grouping: menuData
                };

                setCategories(combined);
                sessionStorage.setItem(cacheKey, JSON.stringify(combined));

            } catch (err: any) {
                console.error('AI Categorization failed:', err);
                setError(err.message);
                // Fallback to basic venue tags if available
                if (venue.tags && venue.tags.length > 0) {
                    setCategories({
                        primary_category: venue.tags[0],
                        highlights: venue.tags.slice(1)
                    });
                }
            } finally {
                setIsCalculating(false);
            }
        };

        fetchCategories();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [venue?.id, venue?.name]); // Re-run if venue ID or name changes

    return { categories, isCalculating, error };
}
