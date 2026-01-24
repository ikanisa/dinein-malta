import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { ReactNode, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DraggableBottomSheetProps {
    children: ReactNode;
    /** Whether the sheet is open */
    isOpen: boolean;
    /** Callback when sheet should close */
    onClose: () => void;
    /** Sheet header content (always visible when open) */
    header?: ReactNode;
    /** Snap points as percentages (default: [0.5, 1] = 50% and 100%) */
    snapPoints?: number[];
    /** Additional class names for the sheet */
    className?: string;
    /** Show close button in header (default: true) */
    showCloseButton?: boolean;
}

/**
 * A draggable bottom sheet with snap points.
 * Gesture-safe: handles drag, tap-outside, and escape key.
 */
export function DraggableBottomSheet({
    children,
    isOpen,
    onClose,
    header,
    snapPoints = [0.5, 1],
    className,
    showCloseButton = true,
}: DraggableBottomSheetProps) {
    const y = useMotionValue(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const sheetRef = useRef<HTMLDivElement>(null);

    // Check for reduced motion preference
    const prefersReducedMotion = typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    // Calculate snap heights based on viewport
    const getSnapHeights = () => {
        if (typeof window === 'undefined') return snapPoints.map(p => p * 500);
        return snapPoints.map(p => window.innerHeight * p);
    };

    const backdropOpacity = useTransform(
        y,
        [0, window?.innerHeight * 0.5 || 300],
        [0.5, 0]
    );

    const handleDragEnd = (_: unknown, info: PanInfo) => {
        const snapHeights = getSnapHeights();
        const velocity = info.velocity.y;
        const currentY = y.get();

        // Fast downward swipe = close
        if (velocity > 500) {
            onClose();
            return;
        }

        // Find nearest snap point
        const offsetFromTop = currentY;
        // If dragged past lowest snap point, close
        if (offsetFromTop > snapHeights[0] * 1.2) {
            onClose();
        }
    };

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 z-50 bg-black"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ opacity: backdropOpacity }}
                    />

                    {/* Sheet */}
                    <motion.div
                        ref={sheetRef}
                        className={cn(
                            "fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col",
                            className
                        )}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        drag={prefersReducedMotion ? false : "y"}
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={handleDragEnd}
                        style={{ y }}
                    >
                        {/* Drag handle */}
                        <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
                            <div className="w-10 h-1.5 bg-muted-foreground/30 rounded-full" />
                        </div>

                        {/* Header with close button */}
                        {(header || showCloseButton) && (
                            <div className="px-4 pb-3 border-b border-border flex items-center justify-between">
                                <div className="flex-1">{header}</div>
                                {showCloseButton && (
                                    <button
                                        onClick={onClose}
                                        className="p-2 -mr-2 rounded-full hover:bg-muted transition-colors"
                                        aria-label="Close"
                                    >
                                        <X className="h-5 w-5 text-muted-foreground" />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Content */}
                        <div
                            ref={containerRef}
                            className="flex-1 overflow-y-auto overscroll-contain px-4 pb-safe"
                        >
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
