/**
 * Venue query helpers for packages/db
 * Provides typed data access for venue-related operations
 */
import type { Venue, MenuCategory, MenuItem } from '../types';

// Permissive client type for cross-app compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

// Re-export for convenience
export type { Venue, MenuCategory, MenuItem };

/**
 * Get venue by slug
 * @param client - Supabase client instance
 * @param slug - Venue URL slug (e.g., 'kigali-social')
 * @returns Venue data or null if not found
 */
export async function getVenueBySlug(
    client: SupabaseClient,
    slug: string
): Promise<Venue | null> {
    const { data, error } = await client
        .from('vendors')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !data) {
        console.error('Error fetching venue:', error?.message);
        return null;
    }

    return data as Venue;
}

/**
 * Get menu categories for a venue, ordered by sort_order
 * @param client - Supabase client instance
 * @param venueId - Venue UUID
 * @returns Array of categories, empty if none found
 */
export async function getCategories(
    client: SupabaseClient,
    venueId: string
): Promise<MenuCategory[]> {
    const { data, error } = await client
        .from('menu_categories')
        .select('*')
        .eq('venue_id', venueId)
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching categories:', error.message);
        return [];
    }

    return (data ?? []) as MenuCategory[];
}

/**
 * Get menu items for a venue, ordered by category and sort_order
 * @param client - Supabase client instance
 * @param venueId - Venue UUID
 * @param onlyAvailable - If true, filter to available items only (default: true)
 * @returns Array of menu items, empty if none found
 */
export async function getMenuItems(
    client: SupabaseClient,
    venueId: string,
    onlyAvailable = true
): Promise<MenuItem[]> {
    let query = client
        .from('menu_items')
        .select('*')
        .eq('venue_id', venueId)
        .order('category_id', { ascending: true })
        .order('sort_order', { ascending: true });

    if (onlyAvailable) {
        query = query.eq('available', true);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching menu items:', error.message);
        return [];
    }

    return (data ?? []) as MenuItem[];
}

/**
 * Get full menu with categories and items for a venue
 * @param client - Supabase client instance
 * @param venueId - Venue UUID
 * @returns Object with categories and items arrays
 */
export async function getFullMenu(
    client: SupabaseClient,
    venueId: string
): Promise<{ categories: MenuCategory[]; items: MenuItem[] }> {
    const [categories, items] = await Promise.all([
        getCategories(client, venueId),
        getMenuItems(client, venueId),
    ]);

    return { categories, items };
}

export interface PaginatedResult<T> {
    data: T[];
    venues: T[]; // Alias for convenience
    hasMore: boolean;
    page: number;
}

/**
 * Get venues for a country with pagination
 * @param client - Supabase client instance
 * @param country - Country code ('RW' or 'MT')
 * @param page - Page number (1-indexed, default: 1)
 * @param pageSize - Items per page (default: 10)
 * @returns Paginated venues list
 */
export async function getVenuesForCountry(
    client: SupabaseClient,
    country: 'RW' | 'MT',
    page = 1,
    pageSize = 10
): Promise<PaginatedResult<Venue>> {
    const offset = (page - 1) * pageSize;

    const { data, error, count } = await client
        .from('vendors')
        .select('id, name, slug, country, ai_image_url, rating, price_level, description, city, created_at', { count: 'exact' })
        .eq('country', country)
        .order('rating', { ascending: false, nullsFirst: false })
        .order('name', { ascending: true })
        .range(offset, offset + pageSize - 1);

    if (error) {
        console.error('Error fetching venues:', error.message);
        return { data: [], venues: [], hasMore: false, page };
    }

    const totalCount = count ?? 0;
    const hasMore = offset + pageSize < totalCount;
    const venues = (data ?? []) as Venue[];

    return {
        data: venues,
        venues,
        hasMore,
        page,
    };
}
