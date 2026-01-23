
'use client';

import { AIVenueCategories } from '@/hooks/useAICategorization';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Utensils, DollarSign, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface CategoryBadgesProps {
    categories: AIVenueCategories | null;
    isLoading: boolean;
}

export function CategoryBadges({ categories, isLoading }: CategoryBadgesProps) {
    if (isLoading) {
        return (
            <div className="flex flex-wrap gap-2 mt-2 animate-pulse">
                <div className="h-6 w-20 bg-muted rounded-full" />
                <div className="h-6 w-24 bg-muted rounded-full" />
                <div className="h-6 w-16 bg-muted rounded-full" />
            </div>
        );
    }

    if (!categories) return null;

    const {
        primary_category,
        cuisine_types = [],
        ambiance_tags = [],
        price_range,
    } = categories;

    return (
        <div className="flex flex-wrap gap-2 mt-3 items-center">
            {/* Primary Category */}
            {primary_category && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        {primary_category}
                    </Badge>
                </motion.div>
            )}

            {/* Price Range */}
            {price_range && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <Badge variant="outline" className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {price_range}
                    </Badge>
                </motion.div>
            )}

            {/* Cuisine Types */}
            {cuisine_types.slice(0, 3).map((cuisine, idx) => (
                <motion.div
                    key={cuisine}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 + (idx * 0.05) }}
                >
                    <Badge variant="secondary" className="flex items-center gap-1">
                        <Utensils className="w-3 h-3 text-muted-foreground" />
                        {cuisine}
                    </Badge>
                </motion.div>
            ))}

            {/* Ambiance - First one only to save space */}
            {ambiance_tags.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    <Badge variant="secondary" className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        {ambiance_tags[0]}
                    </Badge>
                </motion.div>
            )}
        </div>
    );
}
