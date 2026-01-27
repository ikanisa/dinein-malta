import { SupabaseClient } from '@supabase/supabase-js'
import { Venue } from '../types'

export type UpdateVenueInput = Partial<Pick<Venue, 'name' | 'description' | 'address' | 'whatsapp' | 'revolut_link' | 'phone'>>

/**
 * Update venue details (owner only permitted via RLS)
 */
export async function updateVenue(
    client: SupabaseClient,
    venueId: string,
    updates: UpdateVenueInput
): Promise<Venue | null> {
    const { data, error } = await client
        .from('venues')
        .update(updates)
        .eq('id', venueId)
        .select()
        .single()

    if (error) {
        console.error('Error updating venue:', error)
        throw error
    }

    return data
}
