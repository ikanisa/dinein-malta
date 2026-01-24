import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Button, ButtonProps } from './Button';

interface StickyCTAProps extends ButtonProps {
    show?: boolean;
    label: string;
    secondaryAction?: React.ReactNode;
    withBottomNav?: boolean;
}

export function StickyCTA({
    show = true,
    label,
    secondaryAction,
    withBottomNav = true,
    className,
    onClick,
    ...props
}: StickyCTAProps) {
    return (
        <AnimatePresence>
            {show && (
                <div
                    className={cn(
                        "fixed left-0 right-0 z-40 px-4 pointer-events-none",
                        withBottomNav
                            ? "bottom-[calc(80px+env(safe-area-inset-bottom,16px))]" // Sits above BottomNav
                            : "bottom-safe-bottom pb-4" // Sits at bottom of screen
                    )}
                >
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="max-w-md mx-auto pointer-events-auto"
                    >
                        <div className="flex gap-3">
                            {secondaryAction && (
                                <div className="shrink-0">
                                    {secondaryAction}
                                </div>
                            )}
                            <Button
                                variant="default"
                                size="lg"
                                className={cn(
                                    "w-full shadow-xl shadow-brand-primary/25 rounded-2xl text-lg font-bold",
                                    className
                                )}
                                onClick={onClick}
                                {...props}
                            >
                                {label}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
