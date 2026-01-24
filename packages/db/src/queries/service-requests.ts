/**
 * Service request (bell/waiter calls) query helpers for packages/db
 * Provides typed data access for service request management
 */
import { createClient } from '@supabase/supabase-js';
import type { ServiceRequest } from '../types';

// Re-export for convenience
export type { ServiceRequest };

/**
 * Get pending service requests for a venue
 * @param client - Supabase client instance
 * @param venueId - Venue UUID
 * @returns Array of pending requests, oldest first
 */
export async function getPendingServiceRequests(
    client: ReturnType<typeof createClient>,
    venueId: string
): Promise<ServiceRequest[]> {
    const { data, error } = await client
        .from('service_requests')
        .select('*')
        .eq('venue_id', venueId)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching service requests:', error.message);
        return [];
    }

    return (data ?? []) as ServiceRequest[];
}

/**
 * Resolve a service request
 * @param client - Supabase client instance
 * @param requestId - Request UUID
 * @returns Updated request or null on error
 */
export async function resolveServiceRequest(
    client: ReturnType<typeof createClient>,
    requestId: string
): Promise<ServiceRequest | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (client as any)
        .from('service_requests')
        .update({ status: 'resolved' })
        .eq('id', requestId)
        .select()
        .single();

    if (error) {
        console.error('Error resolving service request:', error.message);
        return null;
    }

    return data as ServiceRequest;
}

/**
 * Create a service request (customer rings bell)
 * @param client - Supabase client instance
 * @param venueId - Venue UUID
 * @param tableNo - Table number
 * @returns Created request or null on error
 */
export async function createServiceRequest(
    client: ReturnType<typeof createClient>,
    venueId: string,
    tableNo: string
): Promise<ServiceRequest | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (client as any)
        .from('service_requests')
        .insert({
            venue_id: venueId,
            table_no: tableNo,
            status: 'pending',
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating service request:', error.message);
        return null;
    }

    return data as ServiceRequest;
}

/**
 * Subscribe to new service requests for a venue (realtime)
 * @param client - Supabase client instance
 * @param venueId - Venue UUID
 * @param onNewRequest - Callback when new request comes in
 * @returns Cleanup function to unsubscribe
 */
export function subscribeToServiceRequests(
    client: ReturnType<typeof createClient>,
    venueId: string,
    onNewRequest: (request: ServiceRequest) => void
): () => void {
    const channel = client
        .channel(`service-requests:${venueId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'service_requests',
                filter: `venue_id=eq.${venueId}`,
            },
            (payload) => {
                onNewRequest(payload.new as ServiceRequest);
            }
        )
        .subscribe();

    return () => {
        channel.unsubscribe();
    };
}
