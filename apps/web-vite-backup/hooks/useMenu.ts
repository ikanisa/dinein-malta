import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getVenueBySlugOrId } from '../services/databaseService';
import { cacheMenu, getCachedMenu } from '../services/indexedDB';
import { Venue, MenuItem } from '../types';

interface UseMenuResult {
  venue: Venue | null;
  menu: MenuItem[];
  categories: string[];
  isLoading: boolean;
  error: Error | null;
  isOffline: boolean;
  refetch: () => void;
}

/**
 * Optimized hook for fetching menu data with caching and offline support
 * Fetches venue and menu in a single optimized query with React Query caching
 * Falls back to IndexedDB when offline or on network error
 */
export const useMenu = (venueSlugOrId: string | undefined, _tableCode?: string): UseMenuResult => {
  const [categories, setCategories] = useState<string[]>(['All']);
  const [cachedVenue, setCachedVenue] = useState<Venue | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const {
    data: venue,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['venue-menu', venueSlugOrId],
    queryFn: async () => {
      if (!venueSlugOrId) return null;

      try {
        const data = await getVenueBySlugOrId(venueSlugOrId);

        // Cache to IndexedDB on successful fetch
        if (data) {
          await cacheMenu(venueSlugOrId, data);
          setIsOffline(false);
        }

        return data;
      } catch (fetchError) {
        // Try IndexedDB fallback on network error
        console.warn('Network fetch failed, trying IndexedDB cache:', fetchError);
        const cached = await getCachedMenu(venueSlugOrId);

        if (cached) {
          setIsOffline(true);
          setCachedVenue(cached);
          return cached;
        }

        throw fetchError;
      }
    },
    enabled: !!venueSlugOrId,
    staleTime: 60 * 60 * 1000, // 1 hour - menu data doesn't change frequently
    gcTime: 2 * 60 * 60 * 1000, // 2 hours cache time
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  // Use cached venue if available and main fetch failed
  const effectiveVenue: Venue | null = (venue || cachedVenue) as Venue | null;

  // Extract categories from menu when venue loads
  useEffect(() => {
    if (effectiveVenue?.menu) {
      const uniqueCategories = Array.from(new Set(effectiveVenue.menu.map((item: MenuItem) => item.category)));
      setCategories(['All', ...uniqueCategories.sort()]);
    } else {
      setCategories(['All']);
    }
  }, [effectiveVenue?.menu]);

  const menu = effectiveVenue?.menu || [];

  return {
    venue: effectiveVenue || null,
    menu,
    categories,
    isLoading,
    error: error as Error | null,
    isOffline,
    refetch, // Return refetch function
  };
};
