import React from 'react';
import { GlassCard } from '../GlassCard';

interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

/**
 * Generic empty state component for when data is empty
 * Provides a friendly message and optional action
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
    icon = '📭',
    title,
    description,
    action,
    className = '',
}) => {
    return (
        <div className={`flex items-center justify-center p-6 ${className}`}>
            <GlassCard className="max-w-md w-full p-8 text-center bg-surface border-dashed border-border">
                <div className="text-5xl mb-4">{icon}</div>
                <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
                {description && (
                    <p className="text-muted text-sm mb-4">{description}</p>
                )}
                {action && (
                    <button
                        onClick={action.onClick}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                    >
                        {action.label}
                    </button>
                )}
            </GlassCard>
        </div>
    );
};

export default EmptyState;
