import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../shared/services/supabase';
import { ServiceRequest } from '@dinein/db';
import { useOwner } from '../context/OwnerContext';
import { toast } from 'sonner';
// import dingSound from '../assets/sounds/ding.mp3'; // Future: Add sound file or use browser synth

export function useServiceRequests() {
    const { venue } = useOwner();
    const [requests, setRequests] = useState<ServiceRequest[]>([]);

    // Fetch pending requests
    const fetchRequests = useCallback(async () => {
        if (!venue) return;

        try {
            const { data, error } = await supabase
                .from('service_requests')
                .select('*')
                .eq('venue_id', venue.id)
                .eq('status', 'pending')
                .order('created_at', { ascending: true });

            if (error) throw error;
            setRequests(data || []);
        } catch (error) {
            console.error('Error fetching service requests:', error);
        }
    }, [venue]);

    // Resolve request
    const resolveRequest = async (id: string) => {
        try {
            // Optimistic update
            setRequests(prev => prev.filter(r => r.id !== id));

            const { error } = await supabase
                .from('service_requests')
                .update({ status: 'resolved' })
                .eq('id', id);

            if (error) throw error;
            toast.success('Request resolved');
        } catch (error) {
            console.error('Error resolving request:', error);
            fetchRequests(); // Revert on error
            toast.error('Failed to resolve');
        }
    };

    // Realtime subscription
    useEffect(() => {
        if (!venue) return;

        fetchRequests();

        const channel = supabase
            .channel('service-requests')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'service_requests',
                    filter: `venue_id=eq.${venue.id}`
                },
                (payload) => {
                    // New request incoming!
                    const newRequest = payload.new as ServiceRequest;
                    setRequests(prev => [...prev, newRequest]);
                    toast.info(`Table ${newRequest.table_no} is calling!`);
                    // Play sound here in future
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [venue, fetchRequests]);

    return {
        requests,
        resolveRequest,
        refresh: fetchRequests
    };
}
