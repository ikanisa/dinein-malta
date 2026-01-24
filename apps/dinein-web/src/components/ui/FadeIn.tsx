import { motion } from 'framer-motion';
import { ReactNode, ElementType } from 'react';
import { fadeInVariants, getAccessibleVariants } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface FadeInProps {
    children: ReactNode;
    /** Element type to render (default: div) */
    as?: ElementType;
    /** Delay in seconds before animation starts */
    delay?: number;
    /** Additional CSS classes */
    className?: string;
    /** Trigger animation when entering viewport */
    whenInView?: boolean;
}

/**
 * Simple fade-in animation wrapper.
 * Use for individual elements that should animate on mount or scroll.
 */
export function FadeIn({
    children,
    as = 'div',
    delay = 0,
    className,
    whenInView = false,
}: FadeInProps) {
    const variants = getAccessibleVariants(fadeInVariants);
    const Component = motion(as as keyof JSX.IntrinsicElements);

    const animationProps = whenInView
        ? {
            initial: 'hidden',
            whileInView: 'visible',
            viewport: { once: true, margin: '-50px' },
        }
        : {
            initial: 'hidden',
            animate: 'visible',
        };

    return (
        <Component
            variants={variants}
            {...animationProps}
            transition={{ delay }}
            className={cn(className)}
        >
            {children}
        </Component>
    );
}
