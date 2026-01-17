import React from 'react';
import { motion } from 'framer-motion';

export interface AICategories {
    primary_category?: string;
    cuisine_types?: string[];
    ambiance_tags?: string[];
    price_range?: string;
    highlights?: string[];
    dietary_friendly?: string[];
}

interface Props {
    categories: AICategories | null;
    isLoading: boolean;
}

export const CategoryBadges: React.FC<Props> = ({ categories, isLoading }) => {
    if (isLoading) {
        return (
            <div className="flex gap-2 flex-wrap items-center mt-3 px-6 animate-pulse">
                <div className="h-6 w-24 bg-white/20 rounded-full" />
                <div className="h-6 w-16 bg-white/10 rounded-full" />
                <div className="h-5 w-20 bg-white/10 rounded-full" />
            </div>
        );
    }

    if (!categories) return null;

    const { primary_category, cuisine_types, ambiance_tags, price_range } = categories;

    // Combine relevant tags for display
    const tags: Array<{ label: string; type: 'primary' | 'cuisine' | 'price' | 'mood' }> = [];

    if (primary_category) tags.push({ label: primary_category, type: 'primary' });
    if (price_range) tags.push({ label: price_range, type: 'price' });
    (cuisine_types || []).slice(0, 2).forEach(t => tags.push({ label: t, type: 'cuisine' }));
    (ambiance_tags || []).slice(0, 1).forEach(t => tags.push({ label: t, type: 'mood' }));

    if (tags.length === 0) return null;

    return (
        <div className="flex gap-2 flex-wrap px-6 mt-3 relative z-30">
            {tags.map((tag, index) => (
                <motion.span
                    key={`${tag.label}-${index}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`px-3 py-1 text-[11px] font-bold rounded-full backdrop-blur-md shadow-lg border uppercase tracking-wider ${tag.type === 'primary'
                        ? 'bg-secondary-500/80 text-white border-secondary-400/50'
                        : tag.type === 'price'
                            ? 'bg-green-500/20 text-green-100 border-green-500/30'
                            : 'bg-black/40 text-gray-100 border-white/10'
                        }`}
                >
                    {tag.label}
                </motion.span>
            ))}
            {/* AI Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-1 ml-auto text-[9px] text-white/50 px-2 py-1 bg-black/20 rounded"
            >
                ✨ AI
            </motion.div>
        </div>
    );
};
