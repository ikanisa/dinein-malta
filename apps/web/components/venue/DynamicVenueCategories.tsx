'use client';

import { useAICategorization } from '@/hooks/useAICategorization';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, MapPin, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DynamicVenueCategoriesProps {
    venueId: string;
    venueName: string;
    venueAddress: string;
    className?: string;
}

export function DynamicVenueCategories({
    venueId,
    venueName,
    venueAddress,
    className
}: DynamicVenueCategoriesProps) {
    const { venueCategories, isLoadingVenue } = useAICategorization(venueId, venueName, venueAddress);
    const [isExpanded, setIsExpanded] = useState(false);

    if (isLoadingVenue && !venueCategories) {
        return <CategorySkeleton />;
    }

    if (!venueCategories) {
        return null;
    }

    return (
        <div className={cn("space-y-4", className)}>
            {/* Primary Header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    {venueCategories.primary_category && (
                        <Badge variant="default" className="text-base px-4 py-1.5 bg-primary/90 hover:bg-primary backdrop-blur-md shadow-sm border-0">
                            {venueCategories.primary_category}
                        </Badge>
                    )}
                    {venueCategories.price_range && (
                        <Badge variant="outline" className="text-sm border-muted-foreground/20 text-muted-foreground">
                            {venueCategories.price_range}
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/30 px-2 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        Live Context
                    </span>
                    <Badge variant="outline" className="gap-1 bg-background/50 backdrop-blur-sm border-primary/20 text-primary">
                        <Sparkles className="w-3 h-3" />
                        AI Enhanced
                    </Badge>
                </div>
            </div>

            {/* Main Tags */}
            <div className="flex flex-wrap gap-2">
                {venueCategories.cuisine_types?.map((cuisine) => (
                    <Badge key={cuisine} variant="secondary" className="bg-secondary/50 hover:bg-secondary/70 backdrop-blur-sm transition-colors">
                        {cuisine}
                    </Badge>
                ))}
                {venueCategories.ambiance_tags?.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="border-muted-foreground/10 text-muted-foreground/80">
                        {tag}
                    </Badge>
                ))}

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto"
                >
                    {isExpanded ? 'Show Less' : 'More Insights'}
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
            </div>

            {/* Expanded Insights */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            {/* Ambiance Extended */}
                            {venueCategories.ambiance_tags && venueCategories.ambiance_tags.length > 3 && (
                                <Card className="p-4 bg-background/50 border-border/50 backdrop-blur-sm">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Extended Ambiance</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {venueCategories.ambiance_tags.slice(3).map(tag => (
                                            <Badge key={tag} variant="outline" className="text-xs bg-muted/30">{tag}</Badge>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {/* Highlights */}
                            {venueCategories.highlights && (
                                <Card className="p-4 bg-primary/5 border-primary/10 backdrop-blur-sm">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" /> Highlights
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {venueCategories.highlights.map(h => (
                                            <span key={h} className="text-xs text-foreground/80 flex items-center gap-1">
                                                • {h}
                                            </span>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {/* Competitor Context */}
                            {venueCategories.competitor_context && (
                                <Card className="p-4 md:col-span-2 bg-muted/20 border-border/50">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> Local Context
                                    </h4>
                                    <p className="text-sm text-foreground/80 italic leading-relaxed">
                                        {venueCategories.competitor_context}
                                    </p>
                                </Card>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function CategorySkeleton() {
    return (
        <div className="space-y-3 p-1">
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-32 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
        </div>
    );
}
