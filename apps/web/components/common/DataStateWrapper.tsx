import React, { useEffect, useState } from 'react';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';
import { Spinner } from '../Loading';

interface DataStateWrapperProps<T> {
    /** The data to render when loaded */
    data: T | null | undefined;
    /** Whether data is currently loading */
    isLoading: boolean;
    /** Error from the fetch operation */
    error: Error | null;
    /** Custom check for empty state (defaults to checking array length or null/undefined) */
    isEmpty?: boolean;
    /** Timeout in milliseconds before showing error (default 15000ms) */
    loadingTimeout?: number;
    /** Callback to retry the operation */
    onRetry?: () => void;
    /** Custom loading skeleton component */
    skeleton?: React.ReactNode;
    /** Custom empty state props */
    emptyState?: {
        icon?: string;
        title: string;
        description?: string;
        action?: { label: string; onClick: () => void };
    };
    /** Render function for when data is loaded */
    children: (data: T) => React.ReactNode;
    /** Additional className for the wrapper */
    className?: string;
}

/**
 * DataStateWrapper - Reusable component for handling loading, error, and empty states
 * 
 * Features:
 * - Configurable loading timeout (default 15s) → shows error after timeout
 * - Custom skeleton slot for loading state
 * - Custom empty state when data is empty
 * - Error state with retry button
 * - Surfaces error reason to user
 */
export function DataStateWrapper<T>({
    data,
    isLoading,
    error,
    isEmpty: isEmptyProp,
    loadingTimeout = 15000,
    onRetry,
    skeleton,
    emptyState,
    children,
    className = '',
}: DataStateWrapperProps<T>): React.ReactElement {
    const [isTimedOut, setIsTimedOut] = useState(false);

    // Track timeout for loading state
    useEffect(() => {
        if (!isLoading) {
            setIsTimedOut(false);
            return;
        }

        const timer = setTimeout(() => {
            if (isLoading) {
                setIsTimedOut(true);
            }
        }, loadingTimeout);

        return () => clearTimeout(timer);
    }, [isLoading, loadingTimeout]);

    // Determine if data is empty
    const isEmpty = isEmptyProp ?? (
        data === null ||
        data === undefined ||
        (Array.isArray(data) && data.length === 0) ||
        (typeof data === 'object' && Object.keys(data as object).length === 0)
    );

    // Handle timeout error
    if (isTimedOut && isLoading) {
        return (
            <div className={className}>
                <ErrorState
                    error="Request timed out. Please check your connection and try again."
                    onRetry={() => {
                        setIsTimedOut(false);
                        onRetry?.();
                    }}
                />
            </div>
        );
    }

    // Handle error state
    if (error) {
        return (
            <div className={className}>
                <ErrorState error={error} onRetry={onRetry} />
            </div>
        );
    }

    // Handle loading state
    if (isLoading) {
        if (skeleton) {
            return <div className={className}>{skeleton}</div>;
        }

        return (
            <div className={`flex items-center justify-center p-8 ${className}`}>
                <div className="text-center">
                    <Spinner className="w-10 h-10 mx-auto mb-3" />
                    <p className="text-muted text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    // Handle empty state
    if (isEmpty && emptyState) {
        return (
            <div className={className}>
                <EmptyState {...emptyState} />
            </div>
        );
    }

    // Render children with data
    if (data !== null && data !== undefined) {
        return <>{children(data)}</>;
    }

    // Fallback for null data without empty state config
    return (
        <div className={className}>
            <EmptyState
                title="No data available"
                description="There's nothing to show here yet."
            />
        </div>
    );
}

export default DataStateWrapper;
