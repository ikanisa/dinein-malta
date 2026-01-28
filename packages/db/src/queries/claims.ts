/**
 * Venue claims query helpers for packages/db
 * Uses venue_claims table to track claim status and details
 */

import type { Database } from '../database.types';

// Permissive client type for cross-app compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

export type VenueClaim = Database['public']['Tables']['venue_claims']['Row'];
export type ClaimStatus = 'pending' | 'approved' | 'rejected';

/**
 * Create a new venue claim
 */
export async function createVenueClaim(
    client: SupabaseClient,
    claim: {
        venue_id: string;
        email: string;
        submitted_by: string; // auth_user_id
        momo_code?: string;
        revolut_link?: string;
        whatsapp?: string;
    }
): Promise<{ success: boolean; data?: VenueClaim; error?: string }> {
    // First check if there's already a pending claim for this venue
    const { data: existing } = await client
        .from('venue_claims')
        .select('id')
        .eq('venue_id', claim.venue_id)
        .eq('status', 'pending')
        .single();

    if (existing) {
        return { success: false, error: 'A pending claim already exists for this venue.' };
    }

    const { data, error } = await client
        .from('venue_claims')
        .insert({
            venue_id: claim.venue_id,
            email: claim.email,
            submitted_by: claim.submitted_by,
            momo_code: claim.momo_code,
            revolut_link: claim.revolut_link,
            whatsapp: claim.whatsapp,
            status: 'pending'
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating venue claim:', error.message);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

/**
 * Get claim status for a user and venue
 */
export async function getClaimStatus(
    client: SupabaseClient,
    userId: string,
    venueId: string
): Promise<VenueClaim | null> {
    const { data, error } = await client
        .from('venue_claims')
        .select('*')
        .eq('submitted_by', userId)
        .eq('venue_id', venueId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching claim status:', error.message);
    }

    return data;
}

/**
 * Get all pending claims (Admin only)
 */
export async function getPendingClaims(
    client: SupabaseClient
): Promise<(VenueClaim & { venue: { name: string; slug: string } })[]> {
    const { data, error } = await client
        .from('venue_claims')
        .select('*, venue:venues(name, slug)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching pending claims:', error.message);
        return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []) as any;
}
