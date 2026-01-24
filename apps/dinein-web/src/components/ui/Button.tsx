import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'coral' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    fullWidth?: boolean;
    loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', fullWidth = false, loading = false, children, disabled, ...props }, ref) => {

        const baseStyles = "relative inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none touch-manipulation";

        const variants = {
            primary: "btn-primary text-white", // Uses CSS class from index.css for complex gradient
            coral: "btn-coral text-white",     // Uses CSS class
            secondary: "btn-secondary",        // Uses CSS class
            ghost: "bg-transparent text-slate-600 hover:bg-slate-100/50 hover:text-slate-900",
            outline: "bg-transparent border-2 border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-600",
        };

        const sizes = {
            sm: "h-9 px-4 text-xs",
            md: "h-11 px-6 text-sm", // Min 44px target (11 * 4 = 44px)
            lg: "h-14 px-8 text-base",
            icon: "h-11 w-11 p-0",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    fullWidth && "w-full",
                    className
                )}
                disabled={disabled || loading}
                {...props}
            >
                {loading && (
                    <span className="absolute inset-0 flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </span>
                )}
                <span className={cn(loading && "invisible", "flex items-center gap-2")}>
                    {children}
                </span>
            </button>
        );
    }
);

Button.displayName = 'Button';
