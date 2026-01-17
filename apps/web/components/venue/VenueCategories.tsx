'use client'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useVenueCategories } from '@/hooks/useAICategories'
import { Sparkles, UtensilsCrossed, Award } from "lucide-react"

interface VenueCategoriesProps {
    venueId: string
}

export function VenueCategories({ venueId }: VenueCategoriesProps) {
    const { data: categories, isLoading } = useVenueCategories(venueId)

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-24" />
                </div>
            </div>
        )
    }

    if (!categories) return null

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-5 w-5" />
                <h3 className="font-semibold">AI Insights</h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Primary Stats */}
                <div className="space-y-4">
                    <div>
                        <span className="text-sm text-muted-foreground mb-2 block">Primary Category</span>
                        <Badge className="text-base px-3 py-1">
                            {categories.primary_category}
                        </Badge>
                    </div>

                    <div>
                        <span className="text-sm text-muted-foreground mb-2 block flex items-center gap-1">
                            <UtensilsCrossed className="h-3 w-3" /> Cuisine
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {categories.cuisine_types.map((cuisine) => (
                                <Badge key={cuisine} variant="secondary">
                                    {cuisine}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Atmosphere & Features */}
                <div className="space-y-4">
                    <div>
                        <span className="text-sm text-muted-foreground mb-2 block flex items-center gap-1">
                            Ambiance
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {categories.ambiance_tags.map((tag) => (
                                <Badge key={tag} variant="outline">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {categories.special_features.length > 0 && (
                        <div>
                            <span className="text-sm text-muted-foreground mb-2 block flex items-center gap-1">
                                <Award className="h-3 w-3" /> Highlights
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {categories.special_features.map((feature) => (
                                    <Badge key={feature} variant="outline" className="border-primary/20 bg-primary/5">
                                        {feature}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confidence Score (Optional / Admin Only maybe?) */}
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                <span>AI Confidence Score:</span>
                <span className="font-medium">{(categories.confidence_score * 100).toFixed(0)}%</span>
            </div>
        </div>
    )
}
