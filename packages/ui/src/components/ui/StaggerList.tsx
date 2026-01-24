import { motion } from 'framer-motion';
import { ReactNode, Children } from 'react';
import { staggerContainerVariants, staggerItemVariants, getAccessibleVariants } from '../../lib/motion';
import { cn } from '../../lib/utils';

interface StaggerListProps {
    children: ReactNode;
    /** Additional CSS classes for the container */
    className?: string;
    /** Animate when entering viewport (default: false, animates on mount) */
    whenInView?: boolean;
    /** Custom stagger delay between items in seconds */
    staggerDelay?: number;
}

/**
 * Animates a list of children with staggered entry.
 * Each direct child will fade and slide in sequentially.
 */
export function StaggerList({
    children,
    className,
    whenInView = false,
    staggerDelay,
}: StaggerListProps) {
    const containerVariants = getAccessibleVariants({
        ...staggerContainerVariants,
        visible: {
            ...staggerContainerVariants.visible,
            transition: {
                staggerChildren: staggerDelay ?? 0.08,
                delayChildren: 0.1,
            },
        },
    });
    const itemVariants = getAccessibleVariants(staggerItemVariants);

    const animationProps = whenInView
        ? {
            initial: 'hidden',
            whileInView: 'visible',
            viewport: { once: true, margin: '-30px' },
        }
        : {
            initial: 'hidden',
            animate: 'visible',
        };

    return (
        <motion.div
            variants={containerVariants}
            {...animationProps}
            className={cn(className)}
        >
            {Children.map(children, (child) => (
                <motion.div variants={itemVariants}>{child}</motion.div>
            ))}
        </motion.div>
    );
}
