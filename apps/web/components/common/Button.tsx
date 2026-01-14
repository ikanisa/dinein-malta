import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { hapticButton } from '@/utils/haptics';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    hapticFeedback?: boolean;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    hapticFeedback = true,
    className,
    onClick,
    disabled,
    children,
    ...props
}) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (hapticFeedback && !disabled && !loading) {
            hapticButton();
        }
        onClick?.(e);
    };

    const baseClasses = 'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
        primary: 'bg-primary text-white hover:bg-primary-600 focus:ring-primary-500 shadow-lg shadow-primary/25',
        secondary: 'bg-secondary text-white hover:bg-secondary-600 focus:ring-secondary-500',
        outline: 'border-2 border-border text-foreground hover:bg-surface-highlight focus:ring-primary-500 backdrop-blur-sm',
        ghost: 'text-foreground hover:bg-surface-highlight focus:ring-primary-500'
    };

    const sizeClasses = {
        sm: 'text-sm px-3 py-1.5 min-h-[36px]',
        md: 'text-base px-4 py-2.5 min-h-touch',
        lg: 'text-lg px-6 py-3 min-h-[52px]'
    };

    return (
        <motion.button
            whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
            whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
            className={clsx(
                baseClasses,
                variantClasses[variant],
                sizeClasses[size],
                className
            )}
            onClick={handleClick}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )}
            {children}
        </motion.button>
    );
};

export default Button;
