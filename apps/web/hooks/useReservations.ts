import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationsApi } from '../services/api';
import { hapticSuccess, hapticError } from '../utils/haptics';

// Query keys for cache management
export const reservationKeys = {
    all: ['reservations'] as const,
    lists: () => [...reservationKeys.all, 'list'] as const,
    list: (vendorId?: string) => [...reservationKeys.lists(), vendorId] as const,
};

/**
 * Fetch reservations for a vendor
 */
export function useReservations(vendorId: string) {
    return useQuery({
        queryKey: reservationKeys.list(vendorId),
        queryFn: () => reservationsApi.getForVendor(vendorId),
        enabled: !!vendorId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

/**
 * Create a new reservation
 */
export function useCreateReservation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reservationData: any) => reservationsApi.create(reservationData),
        onSuccess: async () => {
            await hapticSuccess();
            queryClient.invalidateQueries({ queryKey: reservationKeys.all });
        },
        onError: async () => {
            await hapticError();
        },
    });
}
