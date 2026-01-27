import { ReactNode, useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface PullToRefreshProps {
    /** Content to wrap */
    children: ReactNode;
    /** Callback when refresh is triggered */
    onRefresh: () => Promise<void> | void;
    /** Whether currently refreshing */
    isRefreshing?: boolean;
    /** Pull threshold in pixels (default: 80) */
    threshold?: number;
    /** Additional className */
    className?: string;
    /** Disable pull gesture */
    disabled?: boolean;
}

/**
 * Pull-to-refresh wrapper component.
 * Shows a spinner when pulled down past threshold.
 * Always pair with a visible refresh button for accessibility.
 */
export function PullToRefresh({
    children,
    onRefresh,
    isRefreshing = false,
    threshold = 80,
    className,
    disabled = false,
}: PullToRefreshProps) {
    const prefersReducedMotion = useReducedMotion();
    const [isPulling, setIsPulling] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const y = useMotionValue(0);

    // Transform for spinner visibility and rotation
    const spinnerOpacity = useTransform(y, [0, threshold * 0.5, threshold], [0, 0.5, 1]);
    const spinnerRotation = useTransform(y, [0, threshold], [0, 180]);
    const spinnerScale = useTransform(y, [0, threshold * 0.5, threshold], [0.5, 0.8, 1]);

    const handleDragStart = useCallback(() => {
        // Only allow pull if at top of scroll container
        if (containerRef.current && containerRef.current.scrollTop === 0) {
            setIsPulling(true);
        }
    }, []);

    const handleDrag = useCallback(
        (_: unknown, info: PanInfo) => {
            // Only allow downward pull when at top
            if (info.offset.y < 0) {
                y.set(0);
                setIsPulling(false);
            }
        },
        [y]
    );

    const handleDragEnd = useCallback(
        async (_: unknown, info: PanInfo) => {
            setIsPulling(false);

            if (info.offset.y >= threshold && !isRefreshing && !disabled) {
                await onRefresh();
            }

            // Animate back to top
            y.set(0);
        },
        [threshold, isRefreshing, disabled, onRefresh, y]
    );

    if (disabled || prefersReducedMotion) {
        // Fallback: no gesture, just render children
        return <div className={className}>{children}</div>;
    }

    return (
        <div
            ref={containerRef}
            className={cn('relative overflow-hidden', className)}
        >
            {/* Pull indicator */}
            <motion.div
                className="absolute left-1/2 top-0 -translate-x-1/2 z-10 pointer-events-none"
                style={{
                    opacity: isPulling || isRefreshing ? 1 : spinnerOpacity,
                    y: isPulling ? y : 0,
                }}
            >
                <motion.div
                    className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-full',
                        'bg-background shadow-lg border border-border mt-2'
                    )}
                    style={{
                        scale: isRefreshing ? 1 : spinnerScale,
                    }}
                >
                    <motion.div
                        style={{
                            rotate: isRefreshing ? undefined : spinnerRotation,
                        }}
                        animate={isRefreshing ? { rotate: 360 } : undefined}
                        transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : undefined}
                    >
                        <RefreshCw className="h-5 w-5 text-muted-foreground" />
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* Draggable content */}
            <motion.div
                drag={!isRefreshing ? 'y' : false}
                dragConstraints={{ top: 0, bottom: threshold * 1.2 }}
                dragElastic={{ top: 0, bottom: 0.5 }}
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                style={{ y: isPulling ? y : 0 }}
                className="touch-pan-x"
            >
                {children}
            </motion.div>
        </div>
    );
}
