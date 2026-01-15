import React from 'react';
import { GlassCard } from '../GlassCard';

interface ErrorStateProps {
    error: Error | string;
    onRetry?: () => void;
    showDetails?: boolean;
    className?: string;
}

/**
 * Generic error state component with retry capability
 * Surfaces the error reason and provides a retry action
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
    error,
    onRetry,
    showDetails = import.meta.env.DEV,
    className = '',
}) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'object' ? error.stack : undefined;

    return (
        <div className={`flex items-center justify-center p-6 ${className}`}>
            <GlassCard className="max-w-md w-full p-6 text-center bg-surface border-red-500/20">
                <div className="text-5xl mb-4">⚠️</div>
                <h3 className="text-lg font-bold text-red-500 mb-2">Something went wrong</h3>
                <p className="text-muted text-sm mb-4">{errorMessage}</p>

                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                    >
                        Try Again
                    </button>
                )}

                {showDetails && errorStack && (
                    <details className="mt-4 text-left">
                        <summary className="cursor-pointer text-xs text-muted mb-2">
                            Error Details (Dev Only)
                        </summary>
                        <pre className="text-xs bg-black/5 dark:bg-white/5 p-3 rounded overflow-auto max-h-32">
                            {errorStack}
                        </pre>
                    </details>
                )}
            </GlassCard>
        </div>
    );
};

export default ErrorState;
