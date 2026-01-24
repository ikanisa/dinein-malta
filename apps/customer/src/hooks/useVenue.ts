import { useState, useEffect } from 'react'
import { Venue, getVenueBySlug } from '@dinein/db'
import { supabase } from '../shared/services/supabase'

export function useVenue(slug: string | undefined): { venue: Venue | null; loading: boolean; error: Error | null } {
    const [venue, setVenue] = useState<Venue | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!slug) {
            setLoading(false)
            return
        }

        const fetchVenue = async () => {
            setLoading(true)
            try {
                const found = await getVenueBySlug(supabase, slug)

                if (found) {
                    setVenue(found)
                    // Set active country in localStorage as per requirements
                    localStorage.setItem('dinein_active_country', found.country)
                } else {
                    setError(new Error('Venue not found'))
                }
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Unknown error'))
            } finally {
                setLoading(false)
            }
        }

        fetchVenue()
    }, [slug])

    return { venue, loading, error }
}
