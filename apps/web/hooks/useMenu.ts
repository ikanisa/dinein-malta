import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getVenueBySlugOrId } from '../services/databaseService';
import { Venue, MenuItem } from '../types';

interface UseMenuResult {
  venue: Venue | null;
  menu: MenuItem[];
  categories: string[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Optimized hook for fetching menu data with caching and offline support
 * Fetches venue and menu in a single optimized query with React Query caching
 */
export const useMenu = (venueSlugOrId: string | undefined, _tableCode?: string): UseMenuResult => {
  const [categories, setCategories] = useState<string[]>(['All']);

  const {
    data: venue,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['venue-menu', venueSlugOrId],
    queryFn: async () => {
      if (!venueSlugOrId) return null;
      return await getVenueBySlugOrId(venueSlugOrId);
    },
    enabled: !!venueSlugOrId,
    staleTime: 60 * 60 * 1000, // 1 hour - menu data doesn't change frequently
    gcTime: 2 * 60 * 60 * 1000, // 2 hours cache time
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  // Extract categories from menu when venue loads
  useEffect(() => {
    if (venue?.menu) {
      const uniqueCategories = Array.from(new Set(venue.menu.map(item => item.category)));
      setCategories(['All', ...uniqueCategories.sort()]);
    } else {
      setCategories(['All']);
    }
  }, [venue?.menu]);

  const menu = venue?.menu || [];

  return {
    venue: venue || null,
    menu,
    categories,
    isLoading,
    error: error as Error | null,
  };
};
