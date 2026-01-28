/**
 * SessionContext - Manages guest session state
 * 
 * Provides:
 * - guestId (anonymous UUID, persisted to localStorage)
 * - visitId (from backend visit.start, stored in sessionStorage)
 * - sessionKey (from backend, used in headers)
 * - isOffline (network status)
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../shared/services/supabase';

// =============================================================================
// TYPES
// =============================================================================

interface SessionState {
    guestId: string;
    visitId: string | null;
    sessionKey: string | null;
    venueId: string | null;
    tableNo: string | null | undefined;
    isOffline: boolean;
}

interface SessionContextValue extends SessionState {
    startVisit: (venueId: string, tableNo?: string) => Promise<void>;
    endVisit: () => Promise<void>;
    isVisitActive: boolean;
}

const SessionContext = createContext<SessionContextValue | null>(null);

// =============================================================================
// STORAGE KEYS
// =============================================================================

const GUEST_ID_KEY = 'dinein_guest_id';
const VISIT_KEY = 'dinein_active_visit';

// =============================================================================
// PROVIDER
// =============================================================================

export function SessionProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<SessionState>(() => {
        // Initialize guestId from localStorage or generate new
        let guestId = localStorage.getItem(GUEST_ID_KEY);
        if (!guestId) {
            guestId = crypto.randomUUID();
            localStorage.setItem(GUEST_ID_KEY, guestId);
        }

        // Restore active visit from sessionStorage
        const visitData = sessionStorage.getItem(VISIT_KEY);
        let visitId = null;
        let sessionKey = null;
        let venueId = null;
        let tableNo = null;

        if (visitData) {
            try {
                const parsed = JSON.parse(visitData);
                visitId = parsed.visitId;
                sessionKey = parsed.sessionKey;
                venueId = parsed.venueId;
                tableNo = parsed.tableNo;
            } catch {
                // Invalid data, ignore
            }
        }

        return {
            guestId,
            visitId,
            sessionKey,
            venueId,
            tableNo,
            isOffline: !navigator.onLine,
        };
    });

    // Listen for network status changes
    useEffect(() => {
        const handleOnline = () => {
            setState(prev => ({ ...prev, isOffline: false }));
            // Dispatch reconnection event for toast notification
            window.dispatchEvent(new CustomEvent('dinein:reconnected'));
        };
        const handleOffline = () => setState(prev => ({ ...prev, isOffline: true }));

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Start a visit (call backend)
    const startVisit = useCallback(async (venueId: string, tableNo?: string) => {
        try {
            const { data, error } = await supabase.functions.invoke('api', {
                body: { venue_id: venueId, table_no: tableNo },
                headers: { 'x-route': '/visit/start' },
            });

            if (error) throw error;

            const visitId = data?.data?.visit_id;
            const sessionKey = data?.data?.session_key || crypto.randomUUID();

            // Persist to sessionStorage
            sessionStorage.setItem(VISIT_KEY, JSON.stringify({
                visitId,
                sessionKey,
                venueId,
                tableNo: tableNo ?? null,
            }));

            setState(prev => ({
                ...prev,
                visitId,
                sessionKey,
                venueId,
                tableNo: tableNo ?? null,
            }));
        } catch (err) {
            console.error('Failed to start visit:', err);
            // Still set local context for offline support
            const offlineVisitId = `offline_${Date.now()}`;
            sessionStorage.setItem(VISIT_KEY, JSON.stringify({
                visitId: offlineVisitId,
                sessionKey: crypto.randomUUID(),
                venueId,
                tableNo: tableNo ?? null,
            }));
            setState(prev => ({
                ...prev,
                visitId: offlineVisitId,
                venueId,
                tableNo: tableNo ?? null,
            }));
        }
    }, []);

    // End visit
    const endVisit = useCallback(async () => {
        if (state.visitId && !state.visitId.startsWith('offline_')) {
            try {
                await supabase.functions.invoke('api', {
                    body: { visit_id: state.visitId },
                    headers: { 'x-route': '/visit/end' },
                });
            } catch (err) {
                console.error('Failed to end visit:', err);
            }
        }

        sessionStorage.removeItem(VISIT_KEY);
        setState(prev => ({
            ...prev,
            visitId: null,
            sessionKey: null,
            venueId: null,
            tableNo: null,
        }));
    }, [state.visitId]);

    const value: SessionContextValue = {
        ...state,
        startVisit,
        endVisit,
        isVisitActive: !!state.visitId,
    };

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
}

// =============================================================================
// HOOK
// =============================================================================

export function useSession(): SessionContextValue {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
}
