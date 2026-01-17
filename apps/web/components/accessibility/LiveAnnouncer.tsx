/**
 * LiveAnnouncer Component
 * Provides screen reader announcements for dynamic content updates
 * Uses ARIA live regions for accessibility
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

type Politeness = 'polite' | 'assertive';

interface Announcement {
    message: string;
    politeness: Politeness;
    id: number;
}

interface LiveAnnouncerContextType {
    /** Announce a message to screen readers */
    announce: (message: string, politeness?: Politeness) => void;
    /** Announce cart updates */
    announceCartUpdate: (action: 'add' | 'remove', itemName: string, quantity?: number) => void;
    /** Announce order status changes */
    announceOrderStatus: (orderId: string, status: string) => void;
    /** Announce navigation */
    announceNavigation: (pageName: string) => void;
}

const LiveAnnouncerContext = createContext<LiveAnnouncerContextType | undefined>(undefined);

/**
 * LiveAnnouncer Provider
 * Wraps app to provide screen reader announcement capabilities
 */
export const LiveAnnouncerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [politeAnnouncements, setPoliteAnnouncements] = useState<Announcement[]>([]);
    const [assertiveAnnouncements, setAssertiveAnnouncements] = useState<Announcement[]>([]);
    const announcementIdRef = useRef(0);

    // Clear announcements after they've been read
    useEffect(() => {
        if (politeAnnouncements.length > 0) {
            const timer = setTimeout(() => {
                setPoliteAnnouncements([]);
            }, 1000);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [politeAnnouncements]);

    useEffect(() => {
        if (assertiveAnnouncements.length > 0) {
            const timer = setTimeout(() => {
                setAssertiveAnnouncements([]);
            }, 1000);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [assertiveAnnouncements]);

    const announce = useCallback((message: string, politeness: Politeness = 'polite') => {
        const id = ++announcementIdRef.current;
        const announcement: Announcement = { message, politeness, id };

        if (politeness === 'assertive') {
            setAssertiveAnnouncements(prev => [...prev, announcement]);
        } else {
            setPoliteAnnouncements(prev => [...prev, announcement]);
        }
    }, []);

    const announceCartUpdate = useCallback((action: 'add' | 'remove', itemName: string, quantity = 1) => {
        const message = action === 'add'
            ? `Added ${quantity} ${itemName} to cart`
            : `Removed ${itemName} from cart`;
        announce(message, 'polite');
    }, [announce]);

    const announceOrderStatus = useCallback((orderId: string, status: string) => {
        const message = `Order ${orderId.slice(0, 8)} status: ${status}`;
        announce(message, 'assertive');
    }, [announce]);

    const announceNavigation = useCallback((pageName: string) => {
        announce(`Navigated to ${pageName}`, 'polite');
    }, [announce]);

    return (
        <LiveAnnouncerContext.Provider value={{ announce, announceCartUpdate, announceOrderStatus, announceNavigation }}>
            {children}

            {/* Polite announcements - for non-urgent updates */}
            <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
            >
                {politeAnnouncements.map(a => (
                    <span key={a.id}>{a.message}</span>
                ))}
            </div>

            {/* Assertive announcements - for urgent updates */}
            <div
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                className="sr-only"
            >
                {assertiveAnnouncements.map(a => (
                    <span key={a.id}>{a.message}</span>
                ))}
            </div>
        </LiveAnnouncerContext.Provider>
    );
};

/**
 * Hook to access live announcer
 */
export const useLiveAnnouncer = (): LiveAnnouncerContextType => {
    const context = useContext(LiveAnnouncerContext);
    if (!context) {
        throw new Error('useLiveAnnouncer must be used within a LiveAnnouncerProvider');
    }
    return context;
};

/**
 * Standalone live region component for inline usage
 */
export const LiveRegion: React.FC<{
    message: string;
    politeness?: Politeness;
    clearAfterMs?: number;
}> = ({ message, politeness = 'polite', clearAfterMs = 1000 }) => {
    const [currentMessage, setCurrentMessage] = useState(message);

    useEffect(() => {
        setCurrentMessage(message);
        if (message && clearAfterMs > 0) {
            const timer = setTimeout(() => setCurrentMessage(''), clearAfterMs);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [message, clearAfterMs]);

    return (
        <div
            role={politeness === 'assertive' ? 'alert' : 'status'}
            aria-live={politeness}
            aria-atomic="true"
            className="sr-only"
        >
            {currentMessage}
        </div>
    );
};

export default LiveAnnouncerProvider;
