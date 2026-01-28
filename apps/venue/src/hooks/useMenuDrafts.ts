import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../shared/services/supabase'
import { useOwner } from '../context/OwnerContext'
import { toast } from 'sonner'

export interface MenuDraft {
    id: string
    venue_id: string
    category_id: string | null
    name: string
    description: string | null
    price: number
    status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'published'
    rejection_reason?: string
    created_at: string
}

export function useMenuDrafts() {
    const { venue } = useOwner()
    const [drafts, setDrafts] = useState<MenuDraft[]>([])
    const [loading, setLoading] = useState(true)

    const fetchDrafts = useCallback(async () => {
        if (!venue) return
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('menu_item_drafts')
                .select('*')
                .eq('venue_id', venue.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setDrafts(data || [])
        } catch (error) {
            console.error('Error fetching drafts:', error)
            toast.error('Failed to load drafts')
        } finally {
            setLoading(false)
        }
    }, [venue])

    const createDraft = async (item: Omit<MenuDraft, 'id' | 'created_at' | 'status' | 'venue_id'>) => {
        if (!venue) return
        try {
            const { error } = await supabase.from('menu_item_drafts').insert({
                ...item,
                venue_id: venue.id,
                status: 'draft'
            })

            if (error) throw error
            toast.success('Draft created')
            fetchDrafts()
        } catch (error) {
            console.error('Error creating draft:', error)
            toast.error('Failed to create draft')
        }
    }

    const deleteDraft = async (id: string) => {
        try {
            const { error } = await supabase.from('menu_item_drafts').delete().eq('id', id)
            if (error) throw error
            toast.success('Draft deleted')
            fetchDrafts()
        } catch (error) {
            console.error('Error deleting draft:', error)
            toast.error('Failed to delete draft')
        }
    }

    const submitForApproval = async (draft: MenuDraft) => {
        if (!venue) return
        try {
            // Transaction-like updates:
            // 1. Update draft status
            const { error: draftError } = await supabase
                .from('menu_item_drafts')
                .update({ status: 'pending_approval' })
                .eq('id', draft.id)

            if (draftError) throw draftError

            // 2. Create approval request
            const { error: requestError } = await supabase
                .from('approval_requests')
                .insert({
                    request_type: 'menu_publish',
                    entity_type: 'menu_item_draft',
                    entity_id: draft.id,
                    venue_id: venue.id,
                    requested_by: (await supabase.auth.getUser()).data.user?.id,
                    notes: `Publish ${draft.name}`,
                    priority: 'normal',
                    status: 'pending'
                })

            if (requestError) {
                // If request creation fails, rollback draft status (manual compensation)
                await supabase
                    .from('menu_item_drafts')
                    .update({ status: 'draft' })
                    .eq('id', draft.id)
                throw requestError
            }

            toast.success('Submitted for approval')
            fetchDrafts()
        } catch (error) {
            console.error('Error submitting draft:', error)
            toast.error('Failed to submit for approval')
        }
    }

    useEffect(() => {
        fetchDrafts()
    }, [fetchDrafts])

    return {
        drafts,
        loading,
        createDraft,
        deleteDraft,
        submitForApproval,
        refresh: fetchDrafts
    }
}
