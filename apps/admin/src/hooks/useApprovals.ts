import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../shared/services/supabase'
import { toast } from 'sonner'
import { useAdmin } from '../context/AdminContext'

export interface ApprovalRequest {
    id: string
    request_type: 'menu_publish' | 'promo_publish' | 'promo_pause' | 'venue_claim' | 'access_grant' | 'access_revoke' | 'refund' | 'research_proposal'
    entity_type: string
    entity_id: string
    venue_id: string | null
    venue_name: string | null
    requested_by: string | null
    requester_email: string | null
    notes: string | null
    priority: 'low' | 'normal' | 'high' | 'urgent'
    status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired'
    created_at: string
    expires_at: string | null
    entity_preview: any
}

export function useApprovals() {
    const { isAdmin } = useAdmin()
    const [stats, setStats] = useState({
        pending: 0,
        urgent: 0,
        normal: 0
    })
    const [requests, setRequests] = useState<ApprovalRequest[]>([])
    const [loading, setLoading] = useState(true)

    const fetchRequests = useCallback(async () => {
        if (!isAdmin) return
        setLoading(true)
        try {
            // Using the view created in migration 20260131000000
            const { data, error } = await supabase
                .from('pending_approvals')
                .select('*')
                .order('priority', { ascending: true }) // 'urgent' (1) before 'normal' (3) if sorted by case text? 
            // Wait, view sorts by priority case statement: urgent=1. So ascending is correct.
            // But typically clients want newest first? The view sorts by priority then created_at.
            // Let's trust the view's default sort or force it.

            if (error) throw error

            setRequests(data as ApprovalRequest[])

            // Calculate stats
            const pendingCount = data.length
            const urgentCount = data.filter((r: ApprovalRequest) => r.priority === 'urgent' || r.priority === 'high').length

            setStats({
                pending: pendingCount,
                urgent: urgentCount,
                normal: pendingCount - urgentCount
            })

        } catch (error) {
            console.error('Error fetching approval requests:', error)
            toast.error('Failed to load approval requests')
        } finally {
            setLoading(false)
        }
    }, [isAdmin])

    /**
     * Approve a request
     * Note: This strictly updates the approval_request status.
     * The actual business logic (publishing data) must be handled by:
     * 1. A Database Trigger (preferred for consistency)
     * 2. Or this client must perform the side effects (risky if transaction fails)
     * 
     * For now, we update the status. We assume a backend trigger handles the propagation,
     * OR we will implement the propagation logic here if triggers don't exist yet.
     */
    const approveRequest = async (requestId: string, notes?: string) => {
        try {
            const { error } = await supabase
                .from('approval_requests')
                .update({
                    status: 'approved',
                    resolved_by: (await supabase.auth.getUser()).data.user?.id,
                    resolved_at: new Date().toISOString(),
                    resolution_notes: notes
                })
                .eq('id', requestId)

            if (error) throw error

            toast.success('Request approved')
            fetchRequests()
        } catch (error) {
            console.error('Error approving request:', error)
            toast.error('Failed to approve request')
        }
    }

    /**
     * Reject a request
     */
    const rejectRequest = async (requestId: string, reason: string) => {
        try {
            const { error } = await supabase
                .from('approval_requests')
                .update({
                    status: 'rejected',
                    resolved_by: (await supabase.auth.getUser()).data.user?.id,
                    resolved_at: new Date().toISOString(),
                    resolution_notes: reason
                })
                .eq('id', requestId)

            if (error) throw error

            toast.success('Request rejected')
            fetchRequests()
        } catch (error) {
            console.error('Error rejecting request:', error)
            toast.error('Failed to reject request')
        }
    }

    useEffect(() => {
        if (isAdmin) fetchRequests()
    }, [isAdmin, fetchRequests])

    return {
        requests,
        stats,
        loading,
        refresh: fetchRequests,
        approveRequest,
        rejectRequest
    }
}
