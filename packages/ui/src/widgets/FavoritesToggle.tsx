import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';

export interface FavoritesToggleProps {
    isFavorite: boolean;
    onToggle: (newState: boolean) => void;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

/**
 * Favorites Toggle
 * Heart icon that toggles filled/outline state with a bouncy animation and haptic feedback.
 */
export function FavoritesToggle({
    isFavorite,
    onToggle,
    className,
    size = 'md'
}: FavoritesToggleProps) {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card clicks
        e.preventDefault();

        const newState = !isFavorite;

        // Haptic feedback (best effort)
        if (newState && typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(10);
        }

        setIsAnimating(true);
        onToggle(newState);

        // Reset animation state
        setTimeout(() => setIsAnimating(false), 300);
    };

    const iconSizes = {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6"
    };

    return (
        <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleToggle}
            className={cn(
                "rounded-full p-2 hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20",
                className
            )}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
            <motion.div
                initial={false}
                animate={{ scale: isAnimating ? [1, 1.4, 1] : 1 }}
                transition={{ duration: 0.3 }}
            >
                <Heart
                    className={cn(
                        iconSizes[size],
                        "transition-colors duration-300",
                        isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
                    )}
                />
            </motion.div>
        </motion.button>
    );
}
