import { ReactNode, HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    variant?: 'default' | 'depth-2' | 'depth-3' | 'indigo' | 'coral' | 'emerald';
    interactive?: boolean;
}

export function GlassCard({ children, className, variant = 'default', interactive, ...props }: GlassCardProps) {
    const getVariantClass = () => {
        switch (variant) {
            case 'depth-2': return 'glass-depth-2';
            case 'depth-3': return 'glass-depth-3';
            case 'indigo': return 'glass-indigo';
            case 'coral': return 'glass-coral';
            case 'emerald': return 'glass-emerald';
            default: return 'glass-card';
        }
    };

    return (
        <div
            className={cn(
                getVariantClass(),
                interactive && "cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
