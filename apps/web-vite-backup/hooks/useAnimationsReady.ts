/**
 * useAnimationsReady Hook
 * 
 * Defers animations until after first paint to reduce TBT (Total Blocking Time).
 * This hook returns false on initial render and true after the browser has had
 * time to paint, allowing components to render without animation overhead initially.
 * 
 * Usage:
 * ```tsx
 * const animationsReady = useAnimationsReady();
 * 
 * if (!animationsReady) {
 *   return <div>{content}</div>; // No animations
 * }
 * 
 * return (
 *   <motion.div animate={...}>
 *     {content}
 *   </motion.div>
 * );
 * ```
 */

import { useState, useEffect } from 'react';

/**
 * Returns true after the initial paint, allowing animations to be deferred.
 * Uses requestIdleCallback when available, with setTimeout fallback for Safari.
 * 
 * @param delay - Optional delay in ms before enabling animations (default: 100)
 * @returns boolean - true when animations can be safely enabled
 */
export function useAnimationsReady(delay: number = 100): boolean {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        // Skip if user prefers reduced motion
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            // Still set ready to true so components render properly
            setReady(true);
            return;
        }

        // Use requestIdleCallback for better performance scheduling
        if ('requestIdleCallback' in window) {
            const id = requestIdleCallback(
                () => setReady(true),
                { timeout: delay + 400 } // Give browser time but don't wait forever
            );
            return () => cancelIdleCallback(id);
        } else {
            // Fallback for Safari and older browsers
            const timeout = setTimeout(() => setReady(true), delay);
            return () => clearTimeout(timeout);
        }
    }, [delay]);

    return ready;
}

/**
 * Hook to check if user prefers reduced motion
 * Components can use this to disable animations entirely for accessibility
 */
export function usePrefersReducedMotion(): boolean {
    const [prefersReduced, setPrefersReduced] = useState(false);

    useEffect(() => {
        const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        if (!query) return;

        setPrefersReduced(query.matches);

        const handler = (event: MediaQueryListEvent) => {
            setPrefersReduced(event.matches);
        };

        query.addEventListener('change', handler);
        return () => query.removeEventListener('change', handler);
    }, []);

    return prefersReduced;
}

export default useAnimationsReady;
