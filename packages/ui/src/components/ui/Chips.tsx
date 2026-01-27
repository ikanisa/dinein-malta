import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ChipProps {
    /** Chip label */
    label: string;
    /** Whether the chip is selected/active */
    active?: boolean;
    /** Icon component to display before label */
    icon?: React.ElementType;
    /** Click handler */
    onClick?: () => void;
    /** Disabled state */
    disabled?: boolean;
    /** Size variant */
    size?: 'sm' | 'md';
    /** Additional className */
    className?: string;
}

/**
 * Chip
 * Single selectable chip for filtering/categorization.
 * Supports active state, icon prefix, and disabled state.
 */
export function Chip({
    label,
    active = false,
    icon: Icon,
    onClick,
    disabled = false,
    size = 'md',
    className,
}: ChipProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary/50',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'active:scale-95',
                size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm',
                active
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-surface border-border text-foreground hover:border-primary/50 hover:bg-muted/50',
                className
            )}
            aria-pressed={active}
        >
            {Icon && <Icon className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />}
            <span className="font-medium">{label}</span>
        </button>
    );
}

export interface ChipsProps {
    /** Array of chip options */
    options: Array<{
        id: string;
        label: string;
        icon?: React.ElementType;
    }>;
    /** Currently selected chip ID(s) - single or multiple */
    value: string | string[];
    /** Callback when selection changes */
    onChange: (value: string | string[]) => void;
    /** Allow multiple selection */
    multiple?: boolean;
    /** Size variant */
    size?: 'sm' | 'md';
    /** Disabled state */
    disabled?: boolean;
    /** Additional className for container */
    className?: string;
}

/**
 * Chips
 * Group of selectable category chips.
 * Supports single or multiple selection.
 */
export function Chips({
    options,
    value,
    onChange,
    multiple = false,
    size = 'md',
    disabled = false,
    className,
}: ChipsProps) {
    const selectedIds = Array.isArray(value) ? value : [value].filter(Boolean);

    const handleClick = (id: string) => {
        if (multiple) {
            const newValue = selectedIds.includes(id)
                ? selectedIds.filter((v) => v !== id)
                : [...selectedIds, id];
            onChange(newValue);
        } else {
            onChange(id);
        }
    };

    return (
        <div
            className={cn('flex flex-wrap gap-2', className)}
            role="group"
            aria-label="Filter options"
        >
            {options.map((option) => (
                <Chip
                    key={option.id}
                    label={option.label}
                    icon={option.icon}
                    active={selectedIds.includes(option.id)}
                    onClick={() => handleClick(option.id)}
                    disabled={disabled}
                    size={size}
                />
            ))}
        </div>
    );
}
