import React, { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'framer-motion';
import { clsx } from 'clsx';

export interface BottomSheetProps {
    /** Whether the sheet is open */
    isOpen: boolean;
    /** Callback when sheet should close */
    onClose: () => void;
    /** Sheet title */
    title?: string;
    /** Sheet content */
    children: React.ReactNode;
    /** Height variant - 'auto' fits content, others are fixed */
    height?: 'auto' | 'half' | 'full';
    /** Show drag handle indicator */
    showHandle?: boolean;
    /** Whether dragging down closes the sheet */
    swipeToClose?: boolean;
    /** Custom className */
    className?: string;
}

const heightClasses = {
    auto: 'max-h-[85vh]',
    half: 'h-[50vh]',
    full: 'h-[90vh]',
};

export const BottomSheet: React.FC<BottomSheetProps> = ({
    isOpen,
    onClose,
    title,
    children,
    height = 'auto',
    showHandle = true,
    swipeToClose = true,
    className,
}) => {
    const sheetRef = useRef<HTMLDivElement>(null);
    const controls = useAnimation();
    const [isDragging, setIsDragging] = useState(false);

    // Prevent body scroll when sheet is open
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

    // Escape key handler
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const handleDragEnd = useCallback(
        (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
            setIsDragging(false);

            if (!swipeToClose) {
                controls.start({ y: 0 });
                return;
            }

            const shouldClose = info.velocity.y > 300 || info.offset.y > 100;

            if (shouldClose) {
                onClose();
            } else {
                controls.start({ y: 0 });
            }
        },
        [swipeToClose, onClose, controls]
    );

    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-modal flex items-end justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={handleBackdropClick}
                        aria-hidden="true"
                    />

                    {/* Sheet */}
                    <motion.div
                        ref={sheetRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={title ? 'sheet-title' : undefined}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{
                            type: 'spring',
                            damping: 30,
                            stiffness: 400,
                        }}
                        drag={swipeToClose ? 'y' : false}
                        dragConstraints={{ top: 0 }}
                        dragElastic={{ top: 0, bottom: 0.5 }}
                        onDragStart={() => setIsDragging(true)}
                        onDragEnd={handleDragEnd}
                        className={clsx(
                            'relative w-full',
                            'bg-glass backdrop-blur-xl shadow-glass-lg',
                            'border-t border-x border-glassBorder',
                            'flex flex-col',
                            'pb-safe-bottom',
                            heightClasses[height],
                            className
                        )}
                        style={{
                            touchAction: 'none',
                            willChange: isDragging ? 'transform' : 'auto',
                        }}
                    >
                        {/* Handle */}
                        {showHandle && (
                            <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
                                <div className="w-10 h-1 rounded-full bg-border-strong" />
                            </div>
                        )}

                        {/* Header */}
                        {title && (
                            <div className="px-4 py-3 border-b border-border">
                                <h2 id="sheet-title" className="text-lg font-bold text-foreground text-center">
                                    {title}
                                </h2>
                            </div>
                        )}

                        {/* Content */}
                        <div
                            className={clsx(
                                'flex-1 overflow-y-auto scroll-container',
                                !title && showHandle ? 'pt-2' : 'p-4'
                            )}
                        >
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default BottomSheet;
