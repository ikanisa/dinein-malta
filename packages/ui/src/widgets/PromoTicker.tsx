import { motion } from 'framer-motion';
import { getAccessibleVariants } from '../lib/motion';

export interface PromoTickerProps {
    /** Array of promo messages */
    promos: string[];
    /** Additional className */
    className?: string;
}

/**
 * Promo Ticker - subtle rotating promo strip
 * No autoplay distraction; slow rotation or manual swipe
 */
export function PromoTicker({ promos, className }: PromoTickerProps) {
    if (!promos.length) return null;

    const slideVariants = getAccessibleVariants({
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
    });

    return (
        <div className={className}>
            <motion.div
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                className="text-xs text-muted-foreground text-center py-2 px-4 bg-muted/30 rounded-lg"
            >
                <span className="mr-2">🎉</span>
                {promos[0]}
            </motion.div>
        </div>
    );
}
