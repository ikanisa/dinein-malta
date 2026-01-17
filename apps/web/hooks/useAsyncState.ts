import { useCallback, useEffect, useState, useRef } from 'react';

interface UseAsyncStateOptions<T> {
    /** Function to fetch data */
    fetcher: () => Promise<T>;
    /** Timeout in milliseconds (default 15000ms) */
    timeout?: number;
    /** Dependencies array - refetch when these change */
    deps?: readonly unknown[];
    /** Whether to fetch immediately (default true) */
    immediate?: boolean;
}

interface UseAsyncStateResult<T> {
    /** The fetched data */
    data: T | null;
    /** Whether data is currently loading */
    isLoading: boolean;
    /** Error from the fetch operation */
    error: Error | null;
    /** Whether the request timed out */
    isTimedOut: boolean;
    /** Function to manually trigger a refetch */
    refetch: () => Promise<void>;
}

/**
 * Custom hook for async operations with timeout support
 * 
 * Features:
 * - Automatic timeout handling (default 15s)
 * - Loading, error, and data states
 * - Manual refetch capability
 * - Dependency-based auto-refetch
 */
export function useAsyncState<T>({
    fetcher,
    timeout = 15000,
    deps = [],
    immediate = true,
}: UseAsyncStateOptions<T>): UseAsyncStateResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(immediate);
    const [error, setError] = useState<Error | null>(null);
    const [isTimedOut, setIsTimedOut] = useState(false);

    // Track if component is mounted to prevent state updates after unmount
    const isMounted = useRef(true);
    // Track the current fetch to cancel stale requests
    const fetchId = useRef(0);

    const fetchData = useCallback(async () => {
        const currentFetchId = ++fetchId.current;

        setIsLoading(true);
        setError(null);
        setIsTimedOut(false);

        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
                reject(new Error('Request timed out'));
            }, timeout);
        });

        try {
            // Race between fetch and timeout
            const result = await Promise.race([
                fetcher(),
                timeoutPromise,
            ]);

            // Only update state if this is still the current fetch and component is mounted
            if (currentFetchId === fetchId.current && isMounted.current) {
                setData(result);
                setIsLoading(false);
            }
        } catch (err) {
            // Only update state if this is still the current fetch and component is mounted
            if (currentFetchId === fetchId.current && isMounted.current) {
                const errorObj = err instanceof Error ? err : new Error(String(err));

                if (errorObj.message === 'Request timed out') {
                    setIsTimedOut(true);
                }

                setError(errorObj);
                setIsLoading(false);
            }
        }
    }, [fetcher, timeout]);

    // Effect to handle immediate fetch and dependency changes
    useEffect(() => {
        if (immediate) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, immediate]);

    // Cleanup on unmount
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const refetch = useCallback(async () => {
        await fetchData();
    }, [fetchData]);

    return {
        data,
        isLoading,
        error,
        isTimedOut,
        refetch,
    };
}

export default useAsyncState;
