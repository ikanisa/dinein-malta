import React from 'react';
// Removed unused import

// Simplistic utils if lib/utils doesn't exist yet, I'll assume standard Shadcn-like setup: 
// But wait, I should check if lib/utils exists. 
// For safety, I'll inline the merge logic or define it here if I verify it later.
// Actually, looking at package.json `clsx` and `tailwind-merge` are dependencies.
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    depth?: '1' | '2' | '3';
    interactive?: boolean;
    className?: string;
    gradient?: 'none' | 'indigo' | 'coral' | 'emerald';
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
    ({ children, depth = '1', interactive = false, gradient = 'none', className, ...props }, ref) => {

        const depthClasses = {
            '1': 'glass-depth-1',
            '2': 'glass-depth-2',
            '3': 'glass-depth-3',
        };

        const gradientClasses = {
            'none': '',
            'indigo': 'glass-indigo',
            'coral': 'glass-coral',
            'emerald': 'glass-emerald',
        };

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (interactive && props.onClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                props.onClick(e as unknown as React.MouseEvent<HTMLDivElement, MouseEvent>);
            }
        };

        return (
            <div
                ref={ref}
                role={interactive ? 'button' : undefined}
                tabIndex={interactive ? 0 : undefined}
                onKeyDown={handleKeyDown}
                className={cn(
                    depthClasses[depth],
                    gradientClasses[gradient],
                    interactive && 'cursor-pointer hover:translate-y-[-2px] active:scale-[0.98] transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

GlassCard.displayName = 'GlassCard';
