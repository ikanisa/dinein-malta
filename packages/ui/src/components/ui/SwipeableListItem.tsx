import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { ReactNode, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

export interface SwipeableListItemProps {
    children: ReactNode;
    /** Content revealed on left swipe (e.g., delete action) */
    revealedContent?: ReactNode;
    /** Called when user swipes past threshold */
    onSwipeAction?: () => void;
    /** Threshold in pixels to trigger action (default: 80) */
    threshold?: number;
    /** Additional class names */
    className?: string;
    /** Disable swipe interactions */
    disabled?: boolean;
}

/**
 * A swipeable list item that reveals action content on left swipe.
 * Mobile-first gesture wrapper with accessibility fallback.
 */
export function SwipeableListItem({
    children,
    revealedContent,
    onSwipeAction,
    threshold = 80,
    className,
    disabled = false,
}: SwipeableListItemProps) {
    const x = useMotionValue(0);
    const [isSwiped, setIsSwiped] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Transform opacity based on drag distance
    const revealOpacity = useTransform(x, [-threshold, 0], [1, 0]);
    const backgroundScale = useTransform(x, [-threshold, 0], [1, 0.8]);

    const handleDragEnd = (_: unknown, info: PanInfo) => {
        if (disabled) return;

        if (info.offset.x < -threshold) {
            setIsSwiped(true);
            onSwipeAction?.();
        } else {
            setIsSwiped(false);
        }
    };

    const handleClick = () => {
        if (isSwiped) {
            setIsSwiped(false);
        }
    };

    return (
        <div
            ref={containerRef}
            className={cn("relative overflow-hidden rounded-xl", className)}
            onClick={handleClick}
        >
            {/* Revealed content (action buttons) */}
            {revealedContent && (
                <motion.div
                    className="absolute inset-y-0 right-0 flex items-center justify-end pr-4"
                    style={{ opacity: revealOpacity, scale: backgroundScale }}
                >
                    {revealedContent}
                </motion.div>
            )}

            {/* Main content - draggable */}
            <motion.div
                drag={disabled ? false : "x"}
                dragConstraints={{ left: -threshold * 1.5, right: 0 }}
                dragElastic={0.1}
                style={{ x }}
                onDragEnd={handleDragEnd}
                animate={{ x: isSwiped ? -threshold : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="relative z-10 bg-background touch-pan-y"
            >
                {children}
            </motion.div>
        </div>
    );
}
