import React, { forwardRef, useState, useId } from 'react';
import { clsx } from 'clsx';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /** Label text */
    label?: string;
    /** Helper text below input */
    helperText?: string;
    /** Error message (also sets error state) */
    error?: string;
    /** Success state */
    success?: boolean;
    /** Left icon/element */
    leftIcon?: React.ReactNode;
    /** Right icon/element */
    rightIcon?: React.ReactNode;
    /** Input size */
    size?: 'sm' | 'md' | 'lg';
    /** Visual variant */
    variant?: 'default' | 'glass' | 'filled';
    /** Full width */
    fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
    label,
    helperText,
    error,
    success,
    leftIcon,
    rightIcon,
    size = 'md',
    variant = 'default',
    fullWidth = true,
    className,
    id,
    disabled,
    ...props
}, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const generatedId = useId();
    const inputId = id || generatedId;
    const hasError = !!error;

    const sizeClasses = {
        sm: 'h-9 text-sm px-3',
        md: 'h-11 text-base px-4',
        lg: 'h-14 text-lg px-5',
    };

    const variantClasses = {
        default: clsx(
            'bg-surface border border-border',
            'hover:border-border-strong',
            'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
            hasError && 'border-error focus:border-error focus:ring-error/20',
            success && !hasError && 'border-success focus:border-success focus:ring-success/20'
        ),
        glass: clsx(
            'bg-glass backdrop-blur-lg border border-glassBorder',
            'hover:bg-glass-strong',
            'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
            hasError && 'border-error focus:border-error focus:ring-error/20',
            success && !hasError && 'border-success focus:border-success focus:ring-success/20'
        ),
        filled: clsx(
            'bg-surface-highlight border-transparent',
            'hover:bg-surface-highlight/80',
            'focus:bg-surface focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
            hasError && 'bg-error-bg focus:border-error focus:ring-error/20',
            success && !hasError && 'bg-success-bg focus:border-success focus:ring-success/20'
        ),
    };

    const iconSizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    return (
        <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full')}>
            {label && (
                <label
                    htmlFor={inputId}
                    className={clsx(
                        'text-sm font-medium transition-colors duration-normal',
                        hasError ? 'text-error' : 'text-foreground',
                        disabled && 'opacity-50'
                    )}
                >
                    {label}
                </label>
            )}

            <div className="relative">
                {leftIcon && (
                    <div
                        className={clsx(
                            'absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none transition-colors',
                            isFocused && 'text-primary-500',
                            hasError && 'text-error',
                            iconSizeClasses[size]
                        )}
                    >
                        {leftIcon}
                    </div>
                )}

                <input
                    ref={ref}
                    id={inputId}
                    disabled={disabled}
                    aria-invalid={hasError}
                    aria-describedby={
                        error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
                    }
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        props.onBlur?.(e);
                    }}
                    className={clsx(
                        // Base
                        'w-full rounded-xl outline-none transition-all duration-normal',
                        'text-foreground placeholder:text-muted',
                        // Size
                        sizeClasses[size],
                        // Variant
                        variantClasses[variant],
                        // Icons padding
                        leftIcon && 'pl-10',
                        rightIcon && 'pr-10',
                        // States
                        disabled && 'opacity-50 cursor-not-allowed',
                        // Custom
                        className
                    )}
                    {...props}
                />

                {rightIcon && (
                    <div
                        className={clsx(
                            'absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none transition-colors',
                            isFocused && 'text-primary-500',
                            hasError && 'text-error',
                            success && !hasError && 'text-success',
                            iconSizeClasses[size]
                        )}
                    >
                        {rightIcon}
                    </div>
                )}
            </div>

            {(error || helperText) && (
                <p
                    id={error ? `${inputId}-error` : `${inputId}-helper`}
                    className={clsx(
                        'text-xs transition-colors',
                        hasError ? 'text-error' : 'text-muted'
                    )}
                    role={hasError ? 'alert' : undefined}
                >
                    {error || helperText}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
