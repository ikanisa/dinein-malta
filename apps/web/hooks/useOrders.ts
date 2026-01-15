import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../services/api';
import { OrderStatus } from '../types';
import { hapticSuccess, hapticError } from '../utils/haptics';

// Query keys for cache management
export const orderKeys = {
    all: ['orders'] as const,
    lists: () => [...orderKeys.all, 'list'] as const,
    list: (vendorId?: string) => [...orderKeys.lists(), vendorId] as const,
};

/**
 * Fetch orders for a vendor
 */
export function useOrders(vendorId: string) {
    return useQuery({
        queryKey: orderKeys.list(vendorId),
        queryFn: () => ordersApi.getForVendor(vendorId),
        enabled: !!vendorId,
        staleTime: 30 * 1000, // 30 seconds for orders (more real-time)
    });
}

/**
 * Create a new order
 */
export function useCreateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (orderData: any) => ordersApi.create(orderData),
        onSuccess: async () => {
            await hapticSuccess();
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
        },
        onError: async () => {
            await hapticError();
        },
    });
}

/**
 * Update order status
 */
export function useUpdateOrderStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
            ordersApi.updateStatus(orderId, status),
        onSuccess: async () => {
            await hapticSuccess();
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
        },
        onError: async () => {
            await hapticError();
        },
    });
}
