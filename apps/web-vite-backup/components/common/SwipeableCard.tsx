import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { hapticButton } from '../../utils/haptics';

interface SwipeableCardProps {
    children: React.ReactNode;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    threshold?: number;
    className?: string;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
    children,
    onSwipeLeft,
    onSwipeRight,
    threshold = 100,
    className = ''
}) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const opacity = useTransform(x, [-200, -threshold, 0, threshold, 200], [0.5, 1, 1, 1, 0.5]);
    const scale = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95]);

    const constraintsRef = useRef(null);

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;

        // Faster swipes need less distance
        const swipeThreshold = threshold - Math.min(Math.abs(velocity) * 0.1, 50);

        if (offset > swipeThreshold && onSwipeRight) {
            hapticButton();
            onSwipeRight();
        } else if (offset < -swipeThreshold && onSwipeLeft) {
            hapticButton();
            onSwipeLeft();
        }
    };

    return (
        <div ref={constraintsRef} className="relative overflow-hidden">
            <motion.div
                style={{ x, rotate, opacity, scale }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDragEnd={handleDragEnd}
                whileTap={{ cursor: 'grabbing' }}
                className={`touch-pan-y ${className}`}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default SwipeableCard;
