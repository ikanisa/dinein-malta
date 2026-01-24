import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';
// import { Icon, IconName } from './Icon'; // Assuming Icon component exists or we map strings to icons

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string;
    // Props from spec
    color?: "info" | "primary" | "secondary" | "discovery" | "success" | "caution" | "warning" | "danger";
    variant?: "solid" | "soft" | "outline" | "ghost";
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xs" | "2xs" | "xs" | "3xl";
    pill?: boolean;
    uniform?: boolean;
    block?: boolean;
    iconStart?: string; // IconName in real impl
    iconEnd?: string;
    iconSize?: "sm" | "md" | "lg" | "xl" | "2xl";
    loading?: boolean;
    submit?: boolean;
    onClickAction?: { type: string; payload?: unknown };
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        className,
        label,
        children,
        color = 'primary',
        variant = 'solid',
        size = 'lg',
        pill = true,
        uniform = false,
        block = false,
        disabled = false,
        loading = false,
        iconStart,
        iconEnd,
        iconSize,
        submit = false,
        onClickAction,
        onClick,
        type,
        ...props
    }, ref) => {

        const baseStyles = "relative inline-flex items-center justify-center font-semibold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none touch-manipulation";

        // Detailed mapping based on the spec provided
        const colorVariants: Record<string, Record<string, string>> = {
            primary: {
                solid: "bg-primary text-primary-foreground hover:bg-primary/90",
                soft: "bg-primary/10 text-primary hover:bg-primary/20",
                outline: "border-2 border-primary text-primary hover:bg-primary/10",
                ghost: "text-primary hover:bg-primary/10",
            },
            secondary: {
                solid: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                soft: "bg-secondary/10 text-secondary hover:bg-secondary/20",
                outline: "border-2 border-secondary text-secondary hover:bg-secondary/10",
                ghost: "text-secondary hover:bg-secondary/10",
            },
            success: {
                solid: "bg-green-600 text-white hover:bg-green-700",
                soft: "bg-green-100 text-green-700 hover:bg-green-200",
                outline: "border-2 border-green-600 text-green-600 hover:bg-green-50",
                ghost: "text-green-600 hover:bg-green-50",
            },
            danger: {
                solid: "bg-red-600 text-white hover:bg-red-700",
                soft: "bg-red-100 text-red-700 hover:bg-red-200",
                outline: "border-2 border-red-600 text-red-600 hover:bg-red-50",
                ghost: "text-red-600 hover:bg-red-50",
            },
            info: {
                solid: "bg-blue-600 text-white hover:bg-blue-700",
                soft: "bg-blue-100 text-blue-700 hover:bg-blue-200",
                outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
                ghost: "text-blue-600 hover:bg-blue-50",
            },
            warning: {
                solid: "bg-yellow-500 text-white hover:bg-yellow-600",
                soft: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
                outline: "border-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50",
                ghost: "text-yellow-700 hover:bg-yellow-50",
            },
            discovery: {
                solid: "bg-purple-600 text-white hover:bg-purple-700",
                soft: "bg-purple-100 text-purple-700 hover:bg-purple-200",
                outline: "border-2 border-purple-600 text-purple-600 hover:bg-purple-50",
                ghost: "text-purple-600 hover:bg-purple-50",
            },
            caution: {
                solid: "bg-orange-500 text-white hover:bg-orange-600",
                soft: "bg-orange-100 text-orange-700 hover:bg-orange-200",
                outline: "border-2 border-orange-500 text-orange-700 hover:bg-orange-50",
                ghost: "text-orange-700 hover:bg-orange-50",
            }
        };

        const sizes = {
            "3xs": "h-[22px] text-[10px] px-2",
            "2xs": "h-[24px] text-[11px] px-2",
            xs: "h-[26px] text-xs px-2.5",
            sm: "h-[28px] text-xs px-3",
            md: "h-[32px] text-sm px-4",
            lg: "h-[36px] text-sm px-5",
            xl: "h-[40px] text-base px-6",
            "2xl": "h-[44px] text-base px-7",
            "3xl": "h-[48px] text-lg px-8",
        };

        const iconOnlySizes = {
            "3xs": "h-[22px] w-[22px] p-0",
            "2xs": "h-[24px] w-[24px] p-0",
            xs: "h-[26px] w-[26px] p-0",
            sm: "h-[28px] w-[28px] p-0",
            md: "h-[32px] w-[32px] p-0",
            lg: "h-[36px] w-[36px] p-0",
            xl: "h-[40px] w-[40px] p-0",
            "2xl": "h-[44px] w-[44px] p-0",
            "3xl": "h-[48px] w-[48px] p-0",
        }

        const resolvedVariantClass = colorVariants[color]?.[variant] || colorVariants.primary.solid;
        const resolvedSizeClass = (uniform || (!label && !children)) ? iconOnlySizes[size] : sizes[size];

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            if (disabled || loading) {
                e.preventDefault();
                return;
            }
            if (onClick) onClick(e);
            // Handle onClickAction dispatch logic here if implemented globally
        };

        // Suppress unused args by renaming or commenting logic
        const renderIcon = (_iconName: string, _className?: string) => {
            return null;
        };

        return (
            <button
                ref={ref}
                type={submit ? 'submit' : (type || 'button')}
                className={cn(
                    baseStyles,
                    resolvedVariantClass,
                    resolvedSizeClass,
                    pill && "rounded-full",
                    block && "w-full flex",
                    className
                )}
                disabled={disabled || loading}
                onClick={handleClick}
                {...props}
            >
                {loading && (
                    <span className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="animate-spin h-4 w-4" />
                    </span>
                )}
                <span className={cn(loading && "invisible", "flex items-center gap-2")}>
                    {iconStart && renderIcon(iconStart, "mr-2")}
                    {label || children}
                    {iconEnd && renderIcon(iconEnd, "ml-2")}
                </span>
            </button>
        );
    }
);

Button.displayName = 'Button';
