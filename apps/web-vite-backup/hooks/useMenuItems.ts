import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuItemsApi } from '../services/api';
import { MenuItem } from '../types';
import { hapticSuccess, hapticError } from '../utils/haptics';

// Query keys for cache management
export const menuItemKeys = {
    all: ['menuItems'] as const,
    lists: () => [...menuItemKeys.all, 'list'] as const,
    list: (vendorId: string) => [...menuItemKeys.lists(), vendorId] as const,
};

/**
 * Fetch menu items for a vendor
 */
export function useMenuItems(vendorId: string) {
    return useQuery({
        queryKey: menuItemKeys.list(vendorId),
        queryFn: () => menuItemsApi.getForVendor(vendorId),
        enabled: !!vendorId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Create a new menu item
 */
export function useCreateMenuItem(vendorId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (item: Omit<MenuItem, 'id'>) => menuItemsApi.create(vendorId, item),
        onSuccess: async () => {
            await hapticSuccess();
            queryClient.invalidateQueries({ queryKey: menuItemKeys.list(vendorId) });
        },
        onError: async () => {
            await hapticError();
        },
    });
}

/**
 * Update an existing menu item
 */
export function useUpdateMenuItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ itemId, updates }: { itemId: string; updates: Partial<MenuItem> }) =>
            menuItemsApi.update(itemId, updates),
        onSuccess: async () => {
            await hapticSuccess();
            // Invalidate all menu item queries since we don't know which vendor
            queryClient.invalidateQueries({ queryKey: menuItemKeys.all });
        },
        onError: async () => {
            await hapticError();
        },
    });
}

/**
 * Delete a menu item
 */
export function useDeleteMenuItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (itemId: string) => menuItemsApi.delete(itemId),
        onSuccess: async () => {
            await hapticSuccess();
            queryClient.invalidateQueries({ queryKey: menuItemKeys.all });
        },
        onError: async () => {
            await hapticError();
        },
    });
}
