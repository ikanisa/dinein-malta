import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../shared/services/supabase'
import { Venue } from '@dinein/db'
import { toast } from 'sonner'
import { useAdmin } from '../context/AdminContext'

/**
 * Hook for managing venue claims via vendors.claimed column
 * Admins can view unclaimed/claimed venues and manage ownership
 */
export function useVenueClaims() {
    const { isAdmin } = useAdmin()
    const [unclaimedVenues, setUnclaimedVenues] = useState<Venue[]>([])
    const [claimedVenues, setClaimedVenues] = useState<Venue[]>([])
    const [loading, setLoading] = useState(true)

    const fetchVenues = useCallback(async () => {
        if (!isAdmin) return
        setLoading(true)
        try {
            // Fetch unclaimed venues
            const { data: unclaimed, error: unclaimedError } = await supabase
                .from('vendors')
                .select('*')
                .eq('claimed', false)
                .order('name', { ascending: true })

            if (unclaimedError) throw unclaimedError

            // Fetch claimed venues
            const { data: claimed, error: claimedError } = await supabase
                .from('vendors')
                .select('*')
                .eq('claimed', true)
                .order('name', { ascending: true })

            if (claimedError) throw claimedError

            setUnclaimedVenues(unclaimed || [])
            setClaimedVenues(claimed || [])
        } catch (error) {
            console.error('Error fetching venues:', error)
            toast.error('Failed to load venues')
        } finally {
            setLoading(false)
        }
    }, [isAdmin])

    /**
     * Approve a claim by setting claimed = true
     * (For venues that were already marked but need admin confirmation)
     */
    const approveClaim = async (venueId: string) => {
        try {
            const { error } = await supabase
                .from('vendors')
                .update({ claimed: true })
                .eq('id', venueId)

            if (error) throw error

            toast.success('Venue claim approved')
            // Move from unclaimed to claimed
            const venue = unclaimedVenues.find(v => v.id === venueId)
            if (venue) {
                setUnclaimedVenues(prev => prev.filter(v => v.id !== venueId))
                setClaimedVenues(prev => [...prev, { ...venue, claimed: true }])
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Error approving claim:', error)
            toast.error('Approval failed: ' + error.message)
        }
    }

    /**
     * Revoke a claim by setting claimed = false
     */
    const revokeClaim = async (venueId: string) => {
        try {
            const { error } = await supabase
                .from('vendors')
                .update({ claimed: false })
                .eq('id', venueId)

            if (error) throw error

            toast.success('Venue claim revoked')
            // Move from claimed to unclaimed
            const venue = claimedVenues.find(v => v.id === venueId)
            if (venue) {
                setClaimedVenues(prev => prev.filter(v => v.id !== venueId))
                setUnclaimedVenues(prev => [...prev, { ...venue, claimed: false }])
            }
        } catch (error) {
            console.error('Error revoking claim:', error)
            toast.error('Revoke failed')
        }
    }

    useEffect(() => {
        if (isAdmin) fetchVenues()
    }, [isAdmin, fetchVenues])

    return {
        unclaimedVenues,
        claimedVenues,
        // Legacy alias for backward compatibility
        claims: unclaimedVenues,
        loading,
        approveClaim,
        rejectClaim: revokeClaim,
        revokeClaim,
        refresh: fetchVenues
    }
}
