import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { pageVariants, getAccessibleVariants } from '@/lib/motion';

interface PageTransitionProps {
    children: ReactNode;
    /** Use simple fade instead of slide-fade */
    fadeOnly?: boolean;
    /** Additional CSS class for the wrapper */
    className?: string;
}

/**
 * Wraps page content with smooth enter/exit animations.
 * Uses route location as key for AnimatePresence.
 */
export function PageTransition({ children, className, fadeOnly: _fadeOnly }: PageTransitionProps) {
    const location = useLocation();
    const variants = getAccessibleVariants(pageVariants);

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={className}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
