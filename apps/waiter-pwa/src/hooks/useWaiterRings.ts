import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../shared/services/supabase';
import { useVendorProfile } from './useVendorProfile';

export interface WaiterRing {
    id: string;
    vendor_id: string;
    table_number: number;
    reason: 'ready_to_order' | 'need_help' | 'check_please' | 'other' | null;
    status: 'pending' | 'acknowledged' | 'resolved';
    created_at: string;
    acknowledged_at: string | null;
    acknowledged_by: string | null;
    resolved_at: string | null;
}

interface UseWaiterRingsReturn {
    rings: WaiterRing[];
    pendingRings: WaiterRing[];
    loading: boolean;
    error: string | null;
    acknowledgeRing: (ringId: string) => Promise<void>;
    resolveRing: (ringId: string) => Promise<void>;
    newRingReceived: WaiterRing | null;
    clearNewRing: () => void;
}

export function useWaiterRings(): UseWaiterRingsReturn {
    const { profile } = useVendorProfile();
    const [rings, setRings] = useState<WaiterRing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newRingReceived, setNewRingReceived] = useState<WaiterRing | null>(null);

    const vendorId = profile?.id;

    // Fetch initial rings
    useEffect(() => {
        if (!vendorId) {
            setLoading(false);
            return;
        }

        const fetchRings = async () => {
            setLoading(true);
            try {
                const { data, error: fetchError } = await supabase
                    .from('waiter_rings')
                    .select('*')
                    .eq('vendor_id', vendorId)
                    .in('status', ['pending', 'acknowledged'])
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (fetchError) throw fetchError;
                setRings(data || []);
            } catch (err) {
                console.error('Failed to fetch rings:', err);
                setError('Failed to load rings');
            } finally {
                setLoading(false);
            }
        };

        fetchRings();
    }, [vendorId]);

    // Subscribe to realtime updates
    useEffect(() => {
        if (!vendorId) return;

        const channel = supabase
            .channel(`waiter_rings_${vendorId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'waiter_rings',
                    filter: `vendor_id=eq.${vendorId}`
                },
                (payload: { new: WaiterRing }) => {
                    const newRing = payload.new;
                    setRings(prev => [newRing, ...prev]);
                    setNewRingReceived(newRing);

                    // Trigger notifications
                    playRingSound();
                    triggerHaptic();
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'waiter_rings',
                    filter: `vendor_id=eq.${vendorId}`
                },
                (payload: { new: WaiterRing }) => {
                    const updatedRing = payload.new;
                    setRings(prev =>
                        prev.map(r => r.id === updatedRing.id ? updatedRing : r)
                            .filter(r => r.status !== 'resolved')
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [vendorId]);

    const acknowledgeRing = useCallback(async (ringId: string) => {
        try {
            const { error: updateError } = await supabase
                .from('waiter_rings')
                .update({
                    status: 'acknowledged',
                    acknowledged_at: new Date().toISOString(),
                    acknowledged_by: (await supabase.auth.getUser()).data.user?.id
                })
                .eq('id', ringId);

            if (updateError) throw updateError;

            // Optimistic update
            setRings(prev =>
                prev.map(r => r.id === ringId
                    ? { ...r, status: 'acknowledged' as const, acknowledged_at: new Date().toISOString() }
                    : r
                )
            );
        } catch (err) {
            console.error('Failed to acknowledge ring:', err);
        }
    }, []);

    const resolveRing = useCallback(async (ringId: string) => {
        try {
            const { error: updateError } = await supabase
                .from('waiter_rings')
                .update({
                    status: 'resolved',
                    resolved_at: new Date().toISOString()
                })
                .eq('id', ringId);

            if (updateError) throw updateError;

            // Remove from list
            setRings(prev => prev.filter(r => r.id !== ringId));
        } catch (err) {
            console.error('Failed to resolve ring:', err);
        }
    }, []);

    const clearNewRing = useCallback(() => {
        setNewRingReceived(null);
    }, []);

    const pendingRings = rings.filter(r => r.status === 'pending');

    return {
        rings,
        pendingRings,
        loading,
        error,
        acknowledgeRing,
        resolveRing,
        newRingReceived,
        clearNewRing
    };
}

// Notification utilities
function playRingSound() {
    try {
        // Create audio context for bell sound
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Bell-like frequency pattern
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

        // Volume envelope
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (err) {
        console.warn('Failed to play ring sound:', err);
    }
}

function triggerHaptic() {
    if ('vibrate' in navigator) {
        // Pattern: long vibration for attention
        navigator.vibrate([200, 100, 200, 100, 300]);
    }
}
