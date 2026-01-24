import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { cn } from '../lib/utils';
import { getAccessibleVariants, spring } from '../lib/motion';

export interface CartPillProps {
    /** Number of items in cart */
    itemCount: number;
    /** Formatted subtotal string (e.g., "RWF 5,000") */
    subtotal: string;
    /** Callback when pill is tapped */
    onClick: () => void;
    /** Additional className */
    className?: string;
}

/**
 * Sticky Cart Pill - floats above bottom nav
 * Shows count + subtotal, one-tap to open cart
 * Appears only when itemCount > 0
 */
export function CartPill({
    itemCount,
    subtotal,
    onClick,
    className,
}: CartPillProps) {
    const scaleVariants = getAccessibleVariants({
        hidden: { scale: 0.8, opacity: 0, y: 20 },
        visible: { scale: 1, opacity: 1, y: 0 },
        exit: { scale: 0.8, opacity: 0, y: 20 },
    });

    return (
        <AnimatePresence>
            {itemCount > 0 && (
                <motion.button
                    variants={scaleVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={spring.default}
                    onClick={onClick}
                    className={cn(
                        'fixed bottom-20 left-1/2 -translate-x-1/2 z-40',
                        'flex items-center gap-3 px-5 py-3 rounded-full',
                        'bg-primary text-primary-foreground shadow-lg',
                        'border border-primary/20',
                        'active:scale-95 transition-transform',
                        className
                    )}
                    aria-label={`View cart with ${itemCount} items, total ${subtotal}`}
                >
                    <div className="relative">
                        <ShoppingBag className="h-5 w-5" />
                        <motion.span
                            key={itemCount}
                            initial={{ scale: 1.3 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-primary"
                        >
                            {itemCount > 9 ? '9+' : itemCount}
                        </motion.span>
                    </div>
                    <span className="font-semibold text-sm">{subtotal}</span>
                </motion.button>
            )}
        </AnimatePresence>
    );
}
