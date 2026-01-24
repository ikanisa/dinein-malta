import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const CUISINES = [
    { id: 'all', name: 'All', emoji: '' },
    { id: 'maltese', name: 'Maltese', emoji: '🇲🇹' },
    { id: 'italian', name: 'Italian', emoji: '🍝' },
    { id: 'seafood', name: 'Seafood', emoji: '🦐' },
    { id: 'mediterranean', name: 'Mediterranean', emoji: '🫒' },
    { id: 'asian', name: 'Asian', emoji: '🍜' },
    { id: 'pizza', name: 'Pizza', emoji: '🍕' },
    { id: 'fine-dining', name: 'Fine Dining', emoji: '🥂' },
];

interface CategoryFilterProps {
    selectedId: string;
    onSelect: (id: string) => void;
    className?: string;
}

export function CategoryFilter({ selectedId, onSelect, className }: CategoryFilterProps) {
    return (
        <div className={cn("flex gap-2.5 overflow-x-auto no-scrollbar pb-1 snap-x pt-1", className)}>
            {CUISINES.map(cuisine => {
                const isSelected = selectedId === cuisine.id;
                return (
                    <motion.button
                        key={cuisine.id}
                        onClick={() => onSelect(cuisine.id)}
                        layout
                        initial={false}
                        animate={{
                            backgroundColor: isSelected ? "var(--brand-primary)" : "rgba(255, 255, 255, 0.6)",
                            color: isSelected ? "#ffffff" : "var(--slate-600)",
                            scale: isSelected ? 1.05 : 1
                        }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                            "snap-start shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border transition-all shadow-sm backdrop-blur-sm",
                            isSelected
                                ? "border-brand-primary shadow-md shadow-brand-primary/20"
                                : "border-white/40 dark:border-slate-700/50 dark:bg-slate-800/60 dark:text-slate-300 hover:bg-white/80"
                        )}
                    >
                        <span className="text-sm">{cuisine.emoji}</span>
                        <span>{cuisine.name}</span>
                    </motion.button>
                );
            })}
        </div>
    );
}
