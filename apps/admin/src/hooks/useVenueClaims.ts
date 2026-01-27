import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../shared/services/supabase'
import { Venue } from '@dinein/db'
import { toast } from 'sonner'
import { useAdmin } from '../context/AdminContext'

/**
 * Onboarding request from onboarding_requests table
 */
export interface OnboardingRequest {
    id: string
    vendor_id: string
    submitted_by: string
    email: string
    whatsapp?: string | null
    revolut_link?: string | null
    momo_code?: string | null
    menu_items_json?: unknown[] | null
    status: 'pending' | 'approved' | 'rejected'
    admin_notes?: string | null
    reviewed_by?: string | null
    reviewed_at?: string | null
    created_at: string
    updated_at: string
    // Joined vendor data
    vendors?: {
        id: string
        name: string
        slug: string
        country: 'RW' | 'MT'
        address?: string | null
    }
}

/**
 * Hook for managing venue claims via vendors.claimed column
 * AND formal onboarding requests from onboarding_requests table.
 * Admins can view unclaimed/claimed venues and manage ownership.
 */
export function useVenueClaims() {
    const { isAdmin } = useAdmin()
    const [unclaimedVenues, setUnclaimedVenues] = useState<Venue[]>([])
    const [claimedVenues, setClaimedVenues] = useState<Venue[]>([])
    const [pendingVenues, setPendingVenues] = useState<Venue[]>([])
    const [onboardingRequests, setOnboardingRequests] = useState<OnboardingRequest[]>([])
    const [loading, setLoading] = useState(true)

    const fetchVenues = useCallback(async () => {
        if (!isAdmin) return
        setLoading(true)
        try {
            // Fetch ALL venues with claimed logic
            const { data: allVenues, error: venuesError } = await supabase
                .from('vendors')
                .select('*')
                .order('name', { ascending: true })

            if (venuesError) throw venuesError

            const typedVenues = (allVenues || []) as Venue[]

            const unclaimed = typedVenues.filter(v => !v.claimed && !v.owner_email)
            const pending = typedVenues.filter(v => !v.claimed && v.owner_email)
            const claimed = typedVenues.filter(v => v.claimed)

            setUnclaimedVenues(unclaimed)
            setClaimedVenues(claimed)
            setPendingVenues(pending)

            // Also fetch onboarding_requests for the formal flow
            const { data: requests, error: requestsError } = await supabase
                .from('onboarding_requests')
                .select('*, vendors(id, name, slug, country, address)')
                .eq('status', 'pending')
                .order('created_at', { ascending: false })

            if (requestsError) {
                console.warn('Could not fetch onboarding requests:', requestsError)
            } else {
                setOnboardingRequests((requests || []) as OnboardingRequest[])
            }
        } catch (error) {
            console.error('Error fetching venues:', error)
            toast.error('Failed to load venues')
        } finally {
            setLoading(false)
        }
    }, [isAdmin])

    /**
     * Approve a pending venue claim (vendors.owner_email flow)
     */
    const approveClaim = async (venueId: string) => {
        try {
            const { data, error } = await supabase.functions.invoke('approve_claim', {
                body: { venue_id: venueId }
            })

            if (error) throw error
            if (!data?.success) throw new Error(data?.message || 'Approval failed')

            toast.success('Venue claim approved')
            fetchVenues()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error'
            console.error('Error approving claim:', error)
            toast.error('Approval failed: ' + message)
        }
    }

    /**
     * Approve an onboarding request (onboarding_requests table flow)
     */
    const approveOnboardingRequest = async (requestId: string, notes?: string) => {
        try {
            const { data, error } = await supabase.functions.invoke('admin_approve_onboarding', {
                body: { request_id: requestId, action: 'approve', notes }
            })

            if (error) throw error
            if (!data?.success) throw new Error(data?.message || 'Approval failed')

            toast.success('Onboarding request approved')
            fetchVenues()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error'
            console.error('Error approving onboarding:', error)
            toast.error('Approval failed: ' + message)
        }
    }

    /**
     * Reject an onboarding request with notes
     */
    const rejectOnboardingRequest = async (requestId: string, notes?: string) => {
        try {
            const { data, error } = await supabase.functions.invoke('admin_approve_onboarding', {
                body: { request_id: requestId, action: 'reject', notes }
            })

            if (error) throw error
            if (!data?.success) throw new Error(data?.message || 'Rejection failed')

            toast.success('Onboarding request rejected')
            fetchVenues()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error'
            console.error('Error rejecting onboarding:', error)
            toast.error('Rejection failed: ' + message)
        }
    }

    /**
     * Revoke an existing claim (set claimed=false, clear owner data)
     */
    const revokeClaim = async (venueId: string) => {
        try {
            const { error } = await supabase
                .from('vendors')
                .update({ claimed: false, owner_email: null, owner_pin: null, contact_email: null })
                .eq('id', venueId)

            if (error) throw error

            toast.success('Venue claim revoked')
            fetchVenues()
        } catch (error) {
            console.error('Error revoking claim:', error)
            toast.error('Revoke failed')
        }
    }

    /**
     * Reject a pending venue claim (vendors.owner_email flow) - clears owner data
     */
    const rejectClaim = async (venueId: string) => {
        try {
            const { error } = await supabase
                .from('vendors')
                .update({ owner_email: null, owner_pin: null })
                .eq('id', venueId)

            if (error) throw error

            toast.success('Claim rejected')
            fetchVenues()
        } catch (error) {
            console.error('Error rejecting claim:', error)
            toast.error('Rejection failed')
        }
    }

    useEffect(() => {
        if (isAdmin) fetchVenues()
    }, [isAdmin, fetchVenues])

    return {
        // Venue-based claim states
        unclaimedVenues,
        claimedVenues,
        pendingVenues,
        claims: pendingVenues, // Alias for backward compat

        // Onboarding requests (formal flow)
        onboardingRequests,
        pendingOnboardingCount: onboardingRequests.length,

        // Loading state
        loading,

        // Venue claim actions
        approveClaim,
        rejectClaim,
        revokeClaim,

        // Onboarding request actions
        approveOnboardingRequest,
        rejectOnboardingRequest,

        // Manual refresh
        refresh: fetchVenues
    }
}
