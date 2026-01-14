import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Button } from '../common/Button';

export interface ErrorStateProps {
    /** Error title */
    title?: string;
    /** Error message */
    message?: string;
    /** Retry callback */
    onRetry?: () => void;
    /** Custom className */
    className?: string;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Show error icon */
    showIcon?: boolean;
}

const sizeConfig = {
    sm: {
        iconSize: 'text-4xl',
        titleSize: 'text-lg',
        msgSize: 'text-sm',
        padding: 'py-8 px-4',
    },
    md: {
        iconSize: 'text-6xl',
        titleSize: 'text-xl',
        msgSize: 'text-base',
        padding: 'py-12 px-6',
    },
    lg: {
        iconSize: 'text-7xl',
        titleSize: 'text-2xl',
        msgSize: 'text-lg',
        padding: 'py-16 px-8',
    },
};

export const ErrorState: React.FC<ErrorStateProps> = ({
    title = 'Something went wrong',
    message = 'We couldn\'t load this content. Please try again.',
    onRetry,
    className,
    size = 'md',
    showIcon = true,
}) => {
    const config = sizeConfig[size];

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            role="alert"
            className={clsx(
                'flex flex-col items-center justify-center text-center',
                config.padding,
                className
            )}
        >
            {/* Icon */}
            {showIcon && (
                <div className={clsx('mb-4', config.iconSize)}>
                    <span role="img" aria-hidden="true">⚠️</span>
                </div>
            )}

            {/* Title */}
            <h3 className={clsx('font-bold text-foreground mb-2', config.titleSize)}>
                {title}
            </h3>

            {/* Message */}
            {message && (
                <p className={clsx('text-muted max-w-md mb-6', config.msgSize)}>
                    {message}
                </p>
            )}

            {/* Retry Action */}
            {onRetry && (
                <Button
                    variant="outline"
                    onClick={onRetry}
                    size={size === 'sm' ? 'sm' : 'md'}
                >
                    Try Again
                </Button>
            )}
        </motion.div>
    );
};

export default ErrorState;
