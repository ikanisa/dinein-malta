'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type SmartFilterType = 'dietary' | 'taste' | 'smart_category' | 'meal_period';

export interface SmartFilterOption {
    id: string;
    label: string;
    type: SmartFilterType;
    icon?: React.ReactNode;
}

interface SmartMenuFilterProps {
    activeFilters: string[];
    onToggleFilter: (filterId: string) => void;
    availableFilters: SmartFilterOption[];
    onClear: () => void;
}

export function SmartMenuFilter({
    activeFilters,
    onToggleFilter,
    availableFilters,
    onClear
}: SmartMenuFilterProps) {
    if (availableFilters.length === 0) return null;

    return (
        <div className="w-full space-y-3 mb-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    Smart Filters
                </h3>
                {activeFilters.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClear}
                        className="h-6 text-xs text-muted-foreground hover:text-foreground px-2"
                    >
                        Clear All <X className="w-3 h-3 ml-1" />
                    </Button>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                    {availableFilters.map((filter) => {
                        const isActive = activeFilters.includes(filter.id);
                        return (
                            <motion.button
                                key={filter.id}
                                onClick={() => onToggleFilter(filter.id)}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileTap={{ scale: 0.95 }}
                                className={cn(
                                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                                    isActive
                                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                        : "bg-background/50 hover:bg-background border-border/50 text-muted-foreground hover:text-foreground backdrop-blur-sm"
                                )}
                            >
                                {filter.icon}
                                {filter.label}
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
