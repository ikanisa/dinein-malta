import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { fadeInVariants, getAccessibleVariants } from '../../lib/motion';
import { cn } from '../../lib/utils';

type EmptyStateVariant = 'no-results' | 'empty-cart' | 'no-orders' | 'error' | 'custom';

interface EmptyStateProps {
    /** Predefined illustration variant */
    variant?: EmptyStateVariant;
    /** Main heading */
    title: string;
    /** Supporting description */
    description?: string;
    /** Primary action button config */
    action?: {
        label: string;
        onClick: () => void;
    };
    /** Secondary action button config */
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
    /** Custom icon/illustration to replace default */
    icon?: ReactNode;
    /** Additional CSS classes */
    className?: string;
}

// Inline SVG illustrations matching brand colors
const illustrations: Record<EmptyStateVariant, ReactNode> = {
    'no-results': (
        <svg viewBox="0 0 120 120" fill="none" className="w-24 h-24">
            <circle cx="60" cy="60" r="50" className="fill-indigo-100 dark:fill-indigo-900/30" />
            <circle cx="52" cy="52" r="24" className="stroke-indigo-400 dark:stroke-indigo-500" strokeWidth="4" fill="none" />
            <line x1="70" y1="70" x2="90" y2="90" className="stroke-indigo-400 dark:stroke-indigo-500" strokeWidth="4" strokeLinecap="round" />
            <line x1="44" y1="52" x2="60" y2="52" className="stroke-indigo-300" strokeWidth="3" strokeLinecap="round" />
        </svg>
    ),
    'empty-cart': (
        <svg viewBox="0 0 120 120" fill="none" className="w-24 h-24">
            <circle cx="60" cy="60" r="50" className="fill-purple-100 dark:fill-purple-900/30" />
            <path
                d="M35 40h10l8 35h30l6-25H48"
                className="stroke-purple-400 dark:stroke-purple-500"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <circle cx="55" cy="85" r="5" className="fill-purple-400 dark:fill-purple-500" />
            <circle cx="80" cy="85" r="5" className="fill-purple-400 dark:fill-purple-500" />
            <line x1="60" y1="55" x2="60" y2="65" className="stroke-purple-300" strokeWidth="3" strokeLinecap="round" />
            <line x1="55" y1="60" x2="65" y2="60" className="stroke-purple-300" strokeWidth="3" strokeLinecap="round" />
        </svg>
    ),
    'no-orders': (
        <svg viewBox="0 0 120 120" fill="none" className="w-24 h-24">
            <circle cx="60" cy="60" r="50" className="fill-emerald-100 dark:fill-emerald-900/30" />
            <rect x="35" y="30" width="50" height="60" rx="6" className="stroke-emerald-400 dark:stroke-emerald-500" strokeWidth="3" fill="none" />
            <line x1="45" y1="45" x2="75" y2="45" className="stroke-emerald-300" strokeWidth="3" strokeLinecap="round" />
            <line x1="45" y1="55" x2="65" y2="55" className="stroke-emerald-300" strokeWidth="3" strokeLinecap="round" />
            <line x1="45" y1="65" x2="70" y2="65" className="stroke-emerald-300" strokeWidth="3" strokeLinecap="round" />
            <circle cx="78" cy="78" r="18" className="fill-white dark:fill-slate-800 stroke-emerald-400 dark:stroke-emerald-500" strokeWidth="3" />
            <path d="M78 70v16M70 78h16" className="stroke-emerald-400 dark:stroke-emerald-500" strokeWidth="3" strokeLinecap="round" />
        </svg>
    ),
    'error': (
        <svg viewBox="0 0 120 120" fill="none" className="w-24 h-24">
            <circle cx="60" cy="60" r="50" className="fill-rose-100 dark:fill-rose-900/30" />
            <circle cx="60" cy="60" r="30" className="stroke-rose-400 dark:stroke-rose-500" strokeWidth="4" fill="none" />
            <path d="M60 45v20" className="stroke-rose-400 dark:stroke-rose-500" strokeWidth="4" strokeLinecap="round" />
            <circle cx="60" cy="75" r="3" className="fill-rose-400 dark:fill-rose-500" />
        </svg>
    ),
    'custom': null,
};

/**
 * Premium empty state component with illustration, title, description, and optional CTA.
 * Built with glassmorphism styling and entrance animations.
 */
export function EmptyState({
    variant = 'no-results',
    title,
    description,
    action,
    secondaryAction,
    icon,
    className,
}: EmptyStateProps) {
    const variants = getAccessibleVariants(fadeInVariants);
    const illustration = icon || illustrations[variant];

    return (
        <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            className={cn(
                'flex flex-col items-center justify-center text-center py-12 px-6',
                className
            )}
        >
            {illustration && (
                <motion.div
                    className="mb-6"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 25 }}
                >
                    {illustration}
                </motion.div>
            )}

            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {title}
            </h3>

            {description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-6">
                    {description}
                </p>
            )}

            {(action || secondaryAction) && (
                <div className="flex flex-col sm:flex-row gap-3">
                    {action && (
                        <Button onClick={action.onClick} size="default">
                            {action.label}
                        </Button>
                    )}
                    {secondaryAction && (
                        <Button onClick={secondaryAction.onClick} variant="ghost" size="default">
                            {secondaryAction.label}
                        </Button>
                    )}
                </div>
            )}
        </motion.div>
    );
}
