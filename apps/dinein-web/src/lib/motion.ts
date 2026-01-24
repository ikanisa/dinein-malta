/**
 * Centralized Framer Motion variants for consistent animations.
 * Respects reduced-motion preferences for accessibility.
 */

import { Variants, Transition } from 'framer-motion';

// ===============================================
// SPRING PHYSICS
// ===============================================
export const spring = {
    default: { type: 'spring', stiffness: 400, damping: 30 } as Transition,
    snappy: { type: 'spring', stiffness: 500, damping: 35 } as Transition,
    bouncy: { type: 'spring', stiffness: 300, damping: 20 } as Transition,
    gentle: { type: 'spring', stiffness: 200, damping: 25 } as Transition,
};

// ===============================================
// PAGE TRANSITION VARIANTS
// ===============================================
export const pageVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 20,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: [0.16, 1, 0.3, 1], // easeOutExpo
        },
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: {
            duration: 0.2,
            ease: [0.4, 0, 1, 1], // easeIn
        },
    },
};

export const pageFadeVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.25 },
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.15 },
    },
};

// ===============================================
// COMPONENT ANIMATION VARIANTS
// ===============================================
export const fadeInVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: [0.16, 1, 0.3, 1],
        },
    },
};

export const scaleInVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: spring.default,
    },
};

export const slideUpVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: spring.default,
    },
};

// ===============================================
// LIST STAGGER VARIANTS
// ===============================================
export const staggerContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

export const staggerItemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: [0.16, 1, 0.3, 1],
        },
    },
};

// ===============================================
// MICRO-INTERACTION VARIANTS
// ===============================================
export const hoverLiftVariants: Variants = {
    initial: { y: 0, scale: 1 },
    hover: { y: -4, scale: 1.02 },
    tap: { scale: 0.98 },
};

export const buttonPressVariants: Variants = {
    initial: { scale: 1 },
    tap: { scale: 0.96 },
    hover: { scale: 1.02 },
};

// ===============================================
// REDUCED MOTION SUPPORT
// ===============================================
export const reducedMotionVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

/**
 * Returns reduced motion variants if user prefers reduced motion.
 * Use as: <motion.div variants={getAccessibleVariants(pageVariants)} ... />
 */
export function getAccessibleVariants(variants: Variants): Variants {
    if (typeof window === 'undefined') return variants;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return prefersReducedMotion ? reducedMotionVariants : variants;
}
