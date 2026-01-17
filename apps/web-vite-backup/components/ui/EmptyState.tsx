import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Button } from '../common/Button';

export interface EmptyStateProps {
    /** Icon emoji or React node */
    icon?: React.ReactNode;
    /** Title text */
    title: string;
    /** Description text */
    description?: string;
    /** Action button props */
    action?: {
        label: string;
        onClick: () => void;
        variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    };
    /** Custom className */
    className?: string;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
    sm: {
        iconSize: 'text-4xl',
        titleSize: 'text-lg',
        descSize: 'text-sm',
        padding: 'py-8 px-4',
    },
    md: {
        iconSize: 'text-6xl',
        titleSize: 'text-xl',
        descSize: 'text-base',
        padding: 'py-12 px-6',
    },
    lg: {
        iconSize: 'text-7xl',
        titleSize: 'text-2xl',
        descSize: 'text-lg',
        padding: 'py-16 px-8',
    },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon = '📭',
    title,
    description,
    action,
    className,
    size = 'md',
}) => {
    const config = sizeConfig[size];

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={clsx(
                'flex flex-col items-center justify-center text-center',
                config.padding,
                className
            )}
            data-testid="empty-state"
        >
            {/* Icon */}
            <div className={clsx('mb-4', config.iconSize)}>
                {typeof icon === 'string' ? (
                    <span role="img" aria-hidden="true">{icon}</span>
                ) : (
                    icon
                )}
            </div>

            {/* Title */}
            <h3 className={clsx('font-bold text-foreground mb-2', config.titleSize)}>
                {title}
            </h3>

            {/* Description */}
            {description && (
                <p className={clsx('text-muted max-w-md mb-6', config.descSize)}>
                    {description}
                </p>
            )}

            {/* Action */}
            {action && (
                <Button
                    variant={action.variant || 'primary'}
                    onClick={action.onClick}
                    size={size === 'sm' ? 'sm' : 'md'}
                >
                    {action.label}
                </Button>
            )}
        </motion.div>
    );
};

export default EmptyState;
