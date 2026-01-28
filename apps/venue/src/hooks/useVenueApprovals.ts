/**
 * useVenueApprovals - Hook for venue-scoped approval requests
 * 
 * Fetches approval requests related to the current venue (menu/promo publish).
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../shared/services/supabase';
import { useOwner } from '../context/OwnerContext';

export type ApprovalStatus = 'pending' | 'approved' | 'denied' | 'expired';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface VenueApproval {
    id: string;
    action: string;
    request_type: string;
    risk_level: RiskLevel;
    status: ApprovalStatus;
    requested_by: string;
    requested_at: string;
    entity_id: string;
    entity_type: string;
    notes: string | null;
    resolution_notes: string | null;
    resolved_by: string | null;
    resolved_at: string | null;
    evidence_bundle?: Record<string, unknown>;
}

interface UseVenueApprovalsResult {
    approvals: VenueApproval[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    approve: (id: string, notes: string) => Promise<boolean>;
    deny: (id: string, notes: string) => Promise<boolean>;
}

export function useVenueApprovals(statusFilter?: ApprovalStatus): UseVenueApprovalsResult {
    const { venue, isAuthenticated } = useOwner();
    const [approvals, setApprovals] = useState<VenueApproval[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchApprovals = useCallback(async () => {
        if (!venue) return;

        setLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('approval_requests')
                .select('*')
                .eq('venue_id', venue.id)
                .order('created_at', { ascending: false });

            if (statusFilter) {
                query = query.eq('status', statusFilter);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            // Map to VenueApproval format
            const mapped: VenueApproval[] = (data || []).map(row => ({
                id: row.id,
                action: row.request_type,
                request_type: row.request_type,
                risk_level: (row.risk_level as RiskLevel) || 'low',
                status: row.status as ApprovalStatus,
                requested_by: row.requested_by,
                requested_at: row.created_at,
                entity_id: row.entity_id,
                entity_type: row.entity_type,
                notes: row.notes,
                resolution_notes: row.resolution_notes,
                resolved_by: row.resolved_by,
                resolved_at: row.resolved_at,
                evidence_bundle: row.evidence_bundle,
            }));

            setApprovals(mapped);
        } catch (err) {
            console.error('Error fetching approvals:', err);
            setError(err instanceof Error ? err.message : 'Failed to load approvals');
        } finally {
            setLoading(false);
        }
    }, [venue, statusFilter]);

    useEffect(() => {
        fetchApprovals();
    }, [fetchApprovals]);

    const approve = useCallback(async (id: string, notes: string): Promise<boolean> => {
        if (!isAuthenticated) {
            setError('Only venue owners can approve requests');
            return false;
        }

        try {
            const { error: updateError } = await supabase
                .from('approval_requests')
                .update({
                    status: 'approved',
                    resolved_by: (await supabase.auth.getUser()).data.user?.id,
                    resolved_at: new Date().toISOString(),
                    resolution_notes: notes,
                })
                .eq('id', id);

            if (updateError) throw updateError;

            await fetchApprovals();
            return true;
        } catch (err) {
            console.error('Error approving:', err);
            setError(err instanceof Error ? err.message : 'Failed to approve');
            return false;
        }
    }, [isAuthenticated, fetchApprovals]);

    const deny = useCallback(async (id: string, notes: string): Promise<boolean> => {
        if (!isAuthenticated) {
            setError('Only venue owners can deny requests');
            return false;
        }

        if (!notes.trim()) {
            setError('Reason is required when denying');
            return false;
        }

        try {
            const { error: updateError } = await supabase
                .from('approval_requests')
                .update({
                    status: 'denied',
                    resolved_by: (await supabase.auth.getUser()).data.user?.id,
                    resolved_at: new Date().toISOString(),
                    resolution_notes: notes,
                })
                .eq('id', id);

            if (updateError) throw updateError;

            await fetchApprovals();
            return true;
        } catch (err) {
            console.error('Error denying:', err);
            setError(err instanceof Error ? err.message : 'Failed to deny');
            return false;
        }
    }, [isAuthenticated, fetchApprovals]);

    return {
        approvals,
        loading,
        error,
        refresh: fetchApprovals,
        approve,
        deny,
    };
}
