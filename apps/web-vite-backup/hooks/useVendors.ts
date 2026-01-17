import { useQuery } from '@tanstack/react-query';
import { vendorsApi } from '../services/api';

// Query keys for cache management
export const vendorKeys = {
    all: ['vendors'] as const,
    lists: () => [...vendorKeys.all, 'list'] as const,
    list: (filters?: { status?: string; search?: string }) =>
        [...vendorKeys.lists(), filters] as const,
    details: () => [...vendorKeys.all, 'detail'] as const,
    detail: (slug: string) => [...vendorKeys.details(), slug] as const,
};

/**
 * Fetch all vendors with optional filtering
 */
export function useVendors(filters?: { status?: string; search?: string }) {
    const query = useQuery({
        queryKey: vendorKeys.list(filters),
        queryFn: () => vendorsApi.getAll(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    return {
        ...query,
        refetch: query.refetch
    };
}

/**
 * Fetch a single vendor by slug or ID
 */
export function useVendor(slug: string) {
    return useQuery({
        queryKey: vendorKeys.detail(slug),
        queryFn: () => vendorsApi.getBySlug(slug),
        enabled: !!slug,
    });
}
