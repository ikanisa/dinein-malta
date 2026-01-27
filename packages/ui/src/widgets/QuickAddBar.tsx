import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';

export interface QuickAddBarProps {
    /** Whether the bar is visible (e.g. user scrolled deep) */
    isVisible: boolean;
    /** Name of the last/current category being viewed */
    categoryName?: string;
    /** Callback to jump to top */
    onScrollToTop: () => void;
    /** Callback when "Add another" or category chip is clicked - maybe opens a quick selector */
    onQuickAdd?: () => void;
    className?: string;
}

/**
 * Quick Add Bar
 * Mini row that appears when user scrolls deep into the menu.
 * Offers "Scroll Top" and context-aware "Add [Category]" shortcut.
 * Designed to NOT obscure the CartPill (which is usually bottom-20).
 */
export function QuickAddBar({
    isVisible,
    categoryName = "Item",
    onScrollToTop,
    onQuickAdd,
    className
}: QuickAddBarProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className={cn(
                        "fixed bottom-36 left-0 right-0 z-30 flex justify-center pointer-events-none",
                        className
                    )}
                >
                    <div className="bg-background/80 backdrop-blur-md border border-border/50 shadow-sm rounded-full p-1 pl-3 pr-1 flex items-center gap-2 pointer-events-auto">
                        <span className="text-xs font-medium text-muted-foreground mr-1">
                            Browsing {categoryName}
                        </span>

                        {onQuickAdd && (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-7 px-3 text-xs rounded-full gap-1"
                                onClick={onQuickAdd}
                            >
                                <Plus className="h-3 w-3" />
                                Add
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full hover:bg-muted"
                            onClick={onScrollToTop}
                            aria-label="Scroll to top"
                        >
                            <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
