import { motion } from 'framer-motion';
import { Button } from './Button';
import { fadeInVariants, getAccessibleVariants } from '../../lib/motion';
import { cn } from '../../lib/utils';

interface ErrorStateProps {
    /** Error message to display */
    message: string;
    /** Primary retry action */
    retryAction?: {
        label: string;
        onClick: () => void;
    };
    /** Optional secondary action (e.g., "Back") */
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
    /** Additional CSS classes */
    className?: string;
}

// Error illustration (red/rose theme)
const ErrorIllustration = () => (
    <svg viewBox="0 0 120 120" fill="none" className="w-24 h-24">
        <circle cx="60" cy="60" r="50" className="fill-rose-100 dark:fill-rose-900/30" />
        <circle cx="60" cy="60" r="30" className="stroke-rose-400 dark:stroke-rose-500" strokeWidth="4" fill="none" />
        <path d="M60 45v20" className="stroke-rose-400 dark:stroke-rose-500" strokeWidth="4" strokeLinecap="round" />
        <circle cx="60" cy="75" r="3" className="fill-rose-400 dark:fill-rose-500" />
    </svg>
);

/**
 * Error state component for failed data loads or operations.
 * Provides retry action and optional secondary action.
 * Built with glassmorphism styling and entrance animations.
 */
export function ErrorState({
    message,
    retryAction,
    secondaryAction,
    className,
}: ErrorStateProps) {
    const variants = getAccessibleVariants(fadeInVariants);

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
            <motion.div
                className="mb-6"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 25 }}
            >
                <ErrorIllustration />
            </motion.div>

            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs mb-6">
                {message}
            </p>

            {(retryAction || secondaryAction) && (
                <div className="flex flex-col sm:flex-row gap-3">
                    {retryAction && (
                        <Button onClick={retryAction.onClick} size="default">
                            {retryAction.label}
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
