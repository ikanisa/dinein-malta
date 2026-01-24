export const MOTION = {
    duration: {
        fast: '0.12s',   // 120ms
        normal: '0.18s', // 180ms
        slow: '0.24s',   // 240ms
        veryslow: '0.5s',
    },
    easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        liquid: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    }
} as const;

export const ANIMATIONS = {
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 }
    },
    slideUp: {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 10 },
        transition: { type: 'spring', warning: 15, stiffness: 200 } // Soft spring
    },
    scaleIn: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        transition: { duration: 0.15, ease: MOTION.easing.liquid }
    }
} as const;
