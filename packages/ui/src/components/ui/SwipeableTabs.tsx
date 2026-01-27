import { motion, PanInfo, AnimatePresence } from 'framer-motion';
import { ReactNode, useState, useRef, useCallback, KeyboardEvent } from 'react';
import { cn } from '../../lib/utils';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { SWIPE_MIN_DELTA_PX, HORIZONTAL_DOMINANCE_RATIO } from '../../hooks/useGestureThresholds';

export interface SwipeableTabsProps {
    /** Tab items with id and content */
    tabs: Array<{
        id: string;
        label: string;
        content: ReactNode;
    }>;
    /** Currently active tab id */
    activeTab: string;
    /** Callback when tab changes */
    onTabChange: (tabId: string) => void;
    /** Custom tab header renderer (if not provided, uses default tab buttons) */
    renderTabHeader?: (props: {
        tabs: SwipeableTabsProps['tabs'];
        activeTab: string;
        onTabChange: (tabId: string) => void;
    }) => ReactNode;
    /** Additional className for content container */
    className?: string;
    /** Disable swipe gestures */
    disableSwipe?: boolean;
}

/**
 * Swipeable tabs wrapper component.
 * Allows horizontal swipe to change tabs while preserving vertical scroll.
 * Supports keyboard navigation and respects reduced-motion preference.
 */
export function SwipeableTabs({
    tabs,
    activeTab,
    onTabChange,
    renderTabHeader,
    className,
    disableSwipe = false,
}: SwipeableTabsProps) {
    const prefersReducedMotion = useReducedMotion();
    const containerRef = useRef<HTMLDivElement>(null);
    const [direction, setDirection] = useState(0);

    const currentIndex = tabs.findIndex(t => t.id === activeTab);

    const handleDragEnd = useCallback(
        (_: unknown, info: PanInfo) => {
            if (disableSwipe || prefersReducedMotion) return;

            const { offset } = info;
            const dx = Math.abs(offset.x);
            const dy = Math.abs(offset.y);

            // Only trigger if horizontal movement dominates
            if (dx < SWIPE_MIN_DELTA_PX || dy * HORIZONTAL_DOMINANCE_RATIO > dx) {
                return;
            }

            if (offset.x < 0 && currentIndex < tabs.length - 1) {
                // Swipe left -> next tab
                setDirection(1);
                onTabChange(tabs[currentIndex + 1].id);
            } else if (offset.x > 0 && currentIndex > 0) {
                // Swipe right -> previous tab
                setDirection(-1);
                onTabChange(tabs[currentIndex - 1].id);
            }
        },
        [disableSwipe, prefersReducedMotion, currentIndex, tabs, onTabChange]
    );

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                e.preventDefault();
                setDirection(-1);
                onTabChange(tabs[currentIndex - 1].id);
            } else if (e.key === 'ArrowRight' && currentIndex < tabs.length - 1) {
                e.preventDefault();
                setDirection(1);
                onTabChange(tabs[currentIndex + 1].id);
            }
        },
        [currentIndex, tabs, onTabChange]
    );

    const activeTabContent = tabs.find(t => t.id === activeTab)?.content;

    const variants = {
        enter: (d: number) => ({
            x: d > 0 ? 100 : -100,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (d: number) => ({
            x: d < 0 ? 100 : -100,
            opacity: 0,
        }),
    };

    return (
        <div className={cn('flex flex-col', className)}>
            {/* Tab header */}
            {renderTabHeader ? (
                renderTabHeader({ tabs, activeTab, onTabChange })
            ) : (
                <div
                    role="tablist"
                    className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
                    onKeyDown={handleKeyDown}
                >
                    {tabs.map((tab, index) => (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={tab.id === activeTab}
                            aria-controls={`panel-${tab.id}`}
                            id={`tab-${tab.id}`}
                            tabIndex={tab.id === activeTab ? 0 : -1}
                            onClick={() => {
                                setDirection(index > currentIndex ? 1 : -1);
                                onTabChange(tab.id);
                            }}
                            className={cn(
                                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                tab.id === activeTab
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Swipeable content area */}
            <div
                ref={containerRef}
                className="relative flex-1 overflow-hidden touch-pan-y"
            >
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={activeTab}
                        custom={direction}
                        variants={prefersReducedMotion ? undefined : variants}
                        initial={prefersReducedMotion ? false : 'enter'}
                        animate="center"
                        exit={prefersReducedMotion ? undefined : 'exit'}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        drag={disableSwipe || prefersReducedMotion ? false : 'x'}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.1}
                        onDragEnd={handleDragEnd}
                        className="w-full"
                        role="tabpanel"
                        id={`panel-${activeTab}`}
                        aria-labelledby={`tab-${activeTab}`}
                    >
                        {activeTabContent}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
