import * as React from 'react';
import { motion } from 'framer-motion';
import { Tag, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { getAccessibleVariants, spring } from '../lib/motion';

export interface PromoCardProps {
    /** Promo title */
    title: string;
    /** Promo description (keep minimal) */
    description?: string;
    /** Discount/offer text (e.g., "20% OFF") */
    highlight?: string;
    /** Optional expiry date/time */
    expiresAt?: Date | string;
    /** Click handler */
    onClick?: () => void;
    /** Gradient variant */
    variant?: 'warm' | 'ocean' | 'sunset' | 'gold';
    /** Additional className */
    className?: string;
}

const gradientStyles: Record<NonNullable<PromoCardProps['variant']>, string> = {
    warm: 'from-orange-500/20 to-red-500/20 border-orange-500/30',
    ocean: 'from-blue-500/20 to-purple-500/20 border-blue-500/30',
    sunset: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    gold: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30',
};

const highlightStyles: Record<NonNullable<PromoCardProps['variant']>, string> = {
    warm: 'bg-orange-500 text-white',
    ocean: 'bg-blue-500 text-white',
    sunset: 'bg-purple-500 text-white',
    gold: 'bg-amber-500 text-black',
};

/**
 * PromoCard
 * Promotional card with gradient border and optional expiry.
 * Minimal copy, visually striking.
 */
export function PromoCard({
    title,
    description,
    highlight,
    expiresAt,
    onClick,
    variant = 'warm',
    className,
}: PromoCardProps) {
    const scaleVariants = getAccessibleVariants({
        initial: { scale: 0.98, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
    });

    // Format expiry if provided
    const expiryText = React.useMemo(() => {
        if (!expiresAt) return null;

        const date = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
        const now = new Date();
        const diffMs = date.getTime() - now.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMs < 0) return 'Expired';
        if (diffHours < 24) return `${diffHours}h left`;
        if (diffDays < 7) return `${diffDays}d left`;
        return date.toLocaleDateString();
    }, [expiresAt]);

    const isInteractive = !!onClick;
    const Component = isInteractive ? motion.button : motion.div;

    return (
        <Component
            variants={scaleVariants}
            initial="initial"
            animate="animate"
            transition={spring.default}
            whileHover={isInteractive ? { scale: 1.02 } : undefined}
            whileTap={isInteractive ? { scale: 0.98 } : undefined}
            onClick={onClick}
            type={isInteractive ? 'button' : undefined}
            className={cn(
                'relative overflow-hidden rounded-2xl border-2 p-4',
                'bg-gradient-to-br backdrop-blur-sm',
                gradientStyles[variant],
                isInteractive && 'cursor-pointer',
                className
            )}
        >
            {/* Gradient glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            <div className="relative flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    {/* Highlight badge */}
                    {highlight && (
                        <span
                            className={cn(
                                'inline-block px-2 py-0.5 rounded-md text-xs font-bold mb-2',
                                highlightStyles[variant]
                            )}
                        >
                            {highlight}
                        </span>
                    )}

                    {/* Title */}
                    <h3 className="font-semibold text-foreground text-sm leading-tight">
                        {title}
                    </h3>

                    {/* Description */}
                    {description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {description}
                        </p>
                    )}

                    {/* Expiry */}
                    {expiryText && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{expiryText}</span>
                        </div>
                    )}
                </div>

                {/* Icon */}
                <div
                    className={cn(
                        'flex-shrink-0 p-2 rounded-xl',
                        highlightStyles[variant]
                    )}
                >
                    <Tag className="h-5 w-5" />
                </div>
            </div>
        </Component>
    );
}
