import { motion } from 'framer-motion';
import { Check, ChefHat, Clock, Utensils } from 'lucide-react';
import { cn } from '../lib/utils';


// TODO: Import from @dinein/core when available
type Status = 'placed' | 'received' | 'served' | 'cancelled';

export interface OrderProgressTimelineProps {
    status: Status;
    className?: string;
}

const STEPS = [
    { id: 'placed', label: 'Placed', icon: Clock },
    { id: 'received', label: 'Preparing', icon: ChefHat },
    { id: 'served', label: 'Served', icon: Utensils },
] as const;

/**
 * Order Progress Timeline
 * Visual status track with subtle animations.
 */
export function OrderProgressTimeline({ status, className }: OrderProgressTimelineProps) {
    if (status === 'cancelled') {
        return (
            <div className={cn("w-full p-4 bg-destructive/10 rounded-lg border border-destructive/20", className)}>
                <p className="text-destructive font-semibold text-center text-sm">Order Cancelled</p>
            </div>
        );
    }

    const currentStepIndex = STEPS.findIndex(s => s.id === status);
    // If status is unknown or not in steps (shouldn't happen for logic flow), default to -1
    const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

    return (
        <div className={cn("w-full py-4", className)}>
            <div className="relative flex items-center justify-between px-4">
                {/* Connecting Line background */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-muted z-0 mx-8" />

                {/* Active Line (progress) */}
                <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary z-0 mx-8 origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: activeIndex / (STEPS.length - 1) }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />

                {STEPS.map((step, index) => {
                    const isActive = index <= activeIndex;
                    const isCurrent = index === activeIndex;
                    const Icon = step.icon;

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isCurrent ? 1.1 : 1,
                                    backgroundColor: isActive ? 'var(--primary)' : 'var(--muted)',
                                    borderColor: isActive ? 'var(--primary)' : 'transparent',
                                }}
                                className={cn(
                                    "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors duration-300",
                                    !isActive && "bg-muted text-muted-foreground",
                                    isActive && "text-primary-foreground shadow-sm"
                                )}
                            >
                                {isActive && !isCurrent ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Icon className="h-4 w-4" />
                                )}
                            </motion.div>

                            <span
                                className={cn(
                                    "text-[10px] font-medium transition-colors duration-300",
                                    isActive ? "text-primary" : "text-muted-foreground",
                                    isCurrent ? "font-bold" : ""
                                )}
                            >
                                {step.label}
                            </span>

                            {/* Pulse effect for current step */}
                            {isCurrent && status !== 'served' && (
                                <span className="absolute inset-0 rounded-full animate-ping bg-primary/20 -z-10" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
