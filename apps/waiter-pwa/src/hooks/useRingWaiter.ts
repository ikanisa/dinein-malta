import { useState, useCallback, useRef } from 'react';
import { supabase } from '../shared/services/supabase';

export type RingReason = 'ready_to_order' | 'need_help' | 'check_please' | 'other' | null;

interface UseRingWaiterReturn {
    sendRing: (vendorId: string, tableNumber: number, reason?: RingReason) => Promise<boolean>;
    loading: boolean;
    success: boolean;
    error: string | null;
    cooldownRemaining: number;
    reset: () => void;
}

const COOLDOWN_SECONDS = 30; // Rate limit: 1 ring per 30 seconds

export function useRingWaiter(): UseRingWaiterReturn {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);
    const cooldownRef = useRef<NodeJS.Timeout | null>(null);
    const lastRingTimeRef = useRef<number>(0);

    const startCooldown = useCallback(() => {
        const now = Date.now();
        lastRingTimeRef.current = now;
        setCooldownRemaining(COOLDOWN_SECONDS);

        // Clear existing interval
        if (cooldownRef.current) {
            clearInterval(cooldownRef.current);
        }

        // Count down every second
        cooldownRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - lastRingTimeRef.current) / 1000);
            const remaining = Math.max(0, COOLDOWN_SECONDS - elapsed);
            setCooldownRemaining(remaining);

            if (remaining === 0 && cooldownRef.current) {
                clearInterval(cooldownRef.current);
                cooldownRef.current = null;
            }
        }, 1000);
    }, []);

    const sendRing = useCallback(async (
        vendorId: string,
        tableNumber: number,
        reason: RingReason = null
    ): Promise<boolean> => {
        // Check cooldown
        const timeSinceLastRing = Date.now() - lastRingTimeRef.current;
        if (timeSinceLastRing < COOLDOWN_SECONDS * 1000) {
            setError(`Please wait ${Math.ceil((COOLDOWN_SECONDS * 1000 - timeSinceLastRing) / 1000)} seconds`);
            return false;
        }

        // Validate inputs
        if (!vendorId) {
            setError('Restaurant not found');
            return false;
        }
        if (!tableNumber || tableNumber < 1) {
            setError('Please enter a valid table number');
            return false;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const { error: insertError } = await supabase
                .from('waiter_rings')
                .insert({
                    vendor_id: vendorId,
                    table_number: tableNumber,
                    reason: reason,
                    status: 'pending'
                });

            if (insertError) {
                throw insertError;
            }

            setSuccess(true);
            startCooldown();

            // Trigger haptic feedback on success
            if ('vibrate' in navigator) {
                navigator.vibrate([100, 50, 100]);
            }

            return true;
        } catch (err) {
            console.error('Failed to ring waiter:', err);
            setError('Failed to send ring. Please try again.');
            return false;
        } finally {
            setLoading(false);
        }
    }, [startCooldown]);

    const reset = useCallback(() => {
        setSuccess(false);
        setError(null);
    }, []);

    return {
        sendRing,
        loading,
        success,
        error,
        cooldownRemaining,
        reset
    };
}
