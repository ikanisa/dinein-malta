/**
 * Venue claims query helpers for packages/db
 * Uses vendors.claimed column to track claimed status
 * 
 * Simplified model: venues start unclaimed (claimed=false), 
 * venue owners claim them (claimed=true)
 */

// Permissive client type for cross-app compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

import type { Venue } from '../types';

/**
 * Claim result
 */
export interface ClaimApprovalResult {
    success: boolean;
    venueId?: string;
    error?: string;
}

/**
 * Get unclaimed venues (for admin review or venue owner to claim)
 * @param client - Supabase client instance
 * @returns Array of unclaimed venues
 */
export async function getUnclaimedVenues(
    client: SupabaseClient
): Promise<Venue[]> {
    const { data, error } = await client
        .from('vendors')
        .select('*')
        .eq('claimed', false)
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching unclaimed venues:', error.message);
        return [];
    }

    return (data ?? []) as Venue[];
}

/**
 * Get claimed venues
 * @param client - Supabase client instance
 * @returns Array of claimed venues
 */
export async function getClaimedVenues(
    client: SupabaseClient
): Promise<Venue[]> {
    const { data, error } = await client
        .from('vendors')
        .select('*')
        .eq('claimed', true)
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching claimed venues:', error.message);
        return [];
    }

    return (data ?? []) as Venue[];
}

/**
 * Claim a venue (set claimed = true)
 * @param client - Supabase client instance
 * @param venueId - Venue UUID to claim
 * @returns Success result
 */
export async function claimVenue(
    client: SupabaseClient,
    venueId: string
): Promise<ClaimApprovalResult> {
    const { error } = await client
        .from('vendors')
        .update({ claimed: true })
        .eq('id', venueId);

    if (error) {
        console.error('Error claiming venue:', error.message);
        return { success: false, error: error.message };
    }

    return { success: true, venueId };
}

/**
 * Unclaim a venue (set claimed = false) - admin only
 * @param client - Supabase client instance
 * @param venueId - Venue UUID to unclaim
 * @returns Success boolean
 */
export async function unclaimVenue(
    client: SupabaseClient,
    venueId: string
): Promise<boolean> {
    const { error } = await client
        .from('vendors')
        .update({ claimed: false })
        .eq('id', venueId);

    if (error) {
        console.error('Error unclaiming venue:', error.message);
        return false;
    }

    return true;
}

// Legacy aliases for backward compatibility
export const getPendingClaims = getUnclaimedVenues;
export const getClaims = getClaimedVenues;
export const approveClaim = claimVenue;
export const rejectClaim = unclaimVenue;
