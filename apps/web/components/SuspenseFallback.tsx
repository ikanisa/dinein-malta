import React, { useEffect, useState } from 'react';
import { Spinner } from './Loading';
import { GlassCard } from './GlassCard';

interface SuspenseFallbackProps {
    /** Timeout in milliseconds before showing timeout message (default 15000ms) */
    timeout?: number;
    /** Custom message during loading */
    message?: string;
}

/**
 * Enhanced Suspense fallback with timeout handling
 * Shows a friendly message if loading takes too long
 */
export const SuspenseFallback: React.FC<SuspenseFallbackProps> = ({
    timeout = 15000,
    message = 'Loading...',
}) => {
    const [isTimedOut, setIsTimedOut] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsTimedOut(true);
        }, timeout);

        return () => clearTimeout(timer);
    }, [timeout]);

    if (isTimedOut) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-background">
                <GlassCard className="max-w-md w-full p-6 text-center bg-surface">
                    <div className="text-5xl mb-4">⏳</div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Taking longer than expected</h3>
                    <p className="text-muted text-sm mb-4">
                        This is taking a while. Please check your connection or try refreshing.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                    >
                        Refresh Page
                    </button>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <Spinner className="w-12 h-12 mx-auto mb-4" />
                <p className="text-muted">{message}</p>
            </div>
        </div>
    );
};

export default SuspenseFallback;
