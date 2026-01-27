import { motion, AnimatePresence } from 'framer-motion';
import { Download } from 'lucide-react';
import { cn } from '../lib/utils';

export interface InstallHintChipProps {
    isVisible: boolean;
    onInstall: () => void;
    className?: string;
    /** For iOS vs Android hints */
    platform?: 'ios' | 'android' | 'desktop' | 'unknown';
}

/**
 * Install Hint Chip
 * Small chip prompting user to add to home screen.
 * Intentionally subtle to avoid annoyance.
 */
export function InstallHintChip({
    isVisible,
    onInstall,
    className,
    // platform = 'unknown' // In a future iteration, we might show different icons/text
}: InstallHintChipProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={onInstall}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20",
                        className
                    )}
                >
                    <Download className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Install App</span>
                </motion.button>
            )}
        </AnimatePresence>
    );
}
