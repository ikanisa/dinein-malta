import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ListRowProps {
    /** Leading content (icon, avatar, etc.) */
    leading?: React.ReactNode;
    /** Primary text */
    title: string;
    /** Secondary/subtitle text */
    subtitle?: string;
    /** Trailing content (badge, chevron, etc.) */
    trailing?: React.ReactNode;
    /** Show chevron indicator */
    showChevron?: boolean;
    /** Click handler - makes row interactive */
    onClick?: () => void;
    /** Disabled state */
    disabled?: boolean;
    /** Additional className */
    className?: string;
}

/**
 * ListRow
 * Simple list row with leading/trailing content slots.
 * Standardizes list item rendering across the app.
 */
export function ListRow({
    leading,
    title,
    subtitle,
    trailing,
    showChevron = false,
    onClick,
    disabled = false,
    className,
}: ListRowProps) {
    const isInteractive = !!onClick && !disabled;
    const Component = isInteractive ? 'button' : 'div';

    return (
        <Component
            type={isInteractive ? 'button' : undefined}
            onClick={isInteractive ? onClick : undefined}
            disabled={disabled}
            className={cn(
                'flex items-center gap-3 w-full px-4 py-3 text-left',
                'border-b border-border last:border-b-0',
                isInteractive && 'hover:bg-muted/50 active:bg-muted transition-colors',
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
        >
            {leading && (
                <div className="flex-shrink-0">{leading}</div>
            )}

            <div className="flex-1 min-w-0">
                <p className={cn(
                    'text-sm font-medium text-foreground truncate',
                    subtitle && 'mb-0.5'
                )}>
                    {title}
                </p>
                {subtitle && (
                    <p className="text-xs text-muted-foreground truncate">
                        {subtitle}
                    </p>
                )}
            </div>

            {trailing && (
                <div className="flex-shrink-0">{trailing}</div>
            )}

            {showChevron && isInteractive && (
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
        </Component>
    );
}

export interface ListCardProps {
    /** Card title */
    title: string;
    /** Card subtitle */
    subtitle?: string;
    /** Description text */
    description?: string;
    /** Leading content (icon, image, etc.) */
    leading?: React.ReactNode;
    /** Trailing content (badge, action, etc.) */
    trailing?: React.ReactNode;
    /** Footer content */
    footer?: React.ReactNode;
    /** Click handler */
    onClick?: () => void;
    /** Disabled state */
    disabled?: boolean;
    /** Additional className */
    className?: string;
}

/**
 * ListCard
 * Card-style list item with more visual weight.
 * Good for items that need more prominence.
 */
export function ListCard({
    title,
    subtitle,
    description,
    leading,
    trailing,
    footer,
    onClick,
    disabled = false,
    className,
}: ListCardProps) {
    const isInteractive = !!onClick && !disabled;
    const Component = isInteractive ? 'button' : 'div';

    return (
        <Component
            type={isInteractive ? 'button' : undefined}
            onClick={isInteractive ? onClick : undefined}
            disabled={disabled}
            className={cn(
                'w-full text-left p-4 rounded-xl border border-border bg-surface',
                'transition-all duration-200',
                isInteractive && 'hover:border-primary/30 hover:shadow-sm active:scale-[0.99]',
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
        >
            <div className="flex items-start gap-3">
                {leading && (
                    <div className="flex-shrink-0">{leading}</div>
                )}

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                                {title}
                            </p>
                            {subtitle && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                        {trailing && (
                            <div className="flex-shrink-0">{trailing}</div>
                        )}
                    </div>

                    {description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            {footer && (
                <div className="mt-3 pt-3 border-t border-border">
                    {footer}
                </div>
            )}
        </Component>
    );
}
