
import { useState, useCallback } from 'react';
import { GeminiService, VenueCategory, MenuItem, MenuCategorization } from '../services/gemini';

interface UseGeminiReturn {
    loading: boolean;
    error: string | null;
    categorizeVenue: (name: string, address: string, description?: string, lat?: number, lng?: number) => Promise<VenueCategory | null>;
    categorizeMenu: (items: MenuItem[], venueName?: string) => Promise<MenuCategorization | null>;
    generateImage: (prompt: string, modelPreference?: 'quality' | 'fast') => Promise<string | null>;
    generateAsset: (entityId: string, table: 'vendors' | 'menu_items', prompt: string) => Promise<{ success: boolean; url: string } | null>;
}

export function useGemini(): UseGeminiReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const wrapAsync = useCallback(async <T>(fn: () => Promise<T>): Promise<T | null> => {
        setLoading(true);
        setError(null);
        try {
            const result = await fn();
            return result;
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const categorizeVenue = useCallback((name: string, address: string, description?: string, lat?: number, lng?: number) => {
        return wrapAsync(() => GeminiService.categorizeVenue(name, address, description, lat, lng));
    }, [wrapAsync]);

    const categorizeMenu = useCallback((items: MenuItem[], venueName?: string) => {
        return wrapAsync(() => GeminiService.categorizeMenu(items, venueName));
    }, [wrapAsync]);

    const generateImage = useCallback((prompt: string, modelPreference?: 'quality' | 'fast') => {
        return wrapAsync(() => GeminiService.generateImage(prompt, modelPreference));
    }, [wrapAsync]);

    const generateAsset = useCallback((entityId: string, table: 'vendors' | 'menu_items', prompt: string) => {
        return wrapAsync(() => GeminiService.generateAsset(entityId, table, prompt));
    }, [wrapAsync]);

    return {
        loading,
        error,
        categorizeVenue,
        categorizeMenu,
        generateImage,
        generateAsset,
    };
}
