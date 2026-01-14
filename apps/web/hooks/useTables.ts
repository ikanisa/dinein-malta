import { useQuery } from '@tanstack/react-query';
import { tablesApi } from '../services/api';

// Query keys for cache management
export const tableKeys = {
    all: ['tables'] as const,
    lists: () => [...tableKeys.all, 'list'] as const,
    list: (vendorId: string) => [...tableKeys.lists(), vendorId] as const,
};

/**
 * Fetch tables for a vendor
 */
export function useTables(vendorId: string) {
    return useQuery({
        queryKey: tableKeys.list(vendorId),
        queryFn: () => tablesApi.getForVendor(vendorId),
        enabled: !!vendorId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
