'use client';

import { MenuItem, MenuItemData } from "./MenuItem"
import { useAICategorization } from "@/hooks/useAICategorization"
import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, Leaf, Flame, Utensils } from "lucide-react"
import { motion } from "framer-motion"
import { SmartMenuFilter, SmartFilterOption } from "./SmartMenuFilter"

interface MenuGridProps {
    items: MenuItemData[]
    venueId: string
    venueName: string
}

export function MenuGrid({ items, venueId, venueName }: MenuGridProps) {
    const {
        menuCategories,
        isLoadingMenu,
        fetchMenuCategories
    } = useAICategorization(venueId, venueName, ""); // Address not needed for menu

    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    useEffect(() => {
        if (venueId && items.length > 0) {
            fetchMenuCategories(items);
        }
    }, [venueId, items, fetchMenuCategories]);

    // Compute available filters from AI categories
    const availableFilters = useMemo(() => {
        if (!menuCategories) return [];

        const filters: SmartFilterOption[] = [];
        const uniqueTags = new Set<string>();
        const uniqueFlavors = new Set<string>();

        Object.values(menuCategories).forEach(cat => {
            cat.dietary_tags?.forEach(tag => uniqueTags.add(tag));
            if (cat.flavor_profile) uniqueFlavors.add(cat.flavor_profile);
        });

        // Add common dietary tags
        ['Vegetarian', 'Vegan', 'Gluten-Free', 'Spicy', 'Healthy'].forEach(tag => {
            if (uniqueTags.has(tag) || uniqueFlavors.has(tag)) {
                filters.push({
                    id: tag,
                    label: tag,
                    type: 'dietary',
                    icon: tag === 'Spicy' ? <Flame className="w-3 h-3" /> : <Leaf className="w-3 h-3" />
                });
            }
        });

        return filters;
    }, [menuCategories]);

    const handleToggleFilter = (id: string) => {
        setActiveFilters(prev =>
            prev.includes(id)
                ? prev.filter(f => f !== id)
                : [...prev, id]
        );
    };

    // Filter and Group items
    const groupedItems = useMemo(() => {
        const groups: Record<string, MenuItemData[]> = {};

        items.forEach(item => {
            // 1. Filter Check
            if (activeFilters.length > 0) {
                const itemAI = menuCategories?.[item.id];
                if (!itemAI) return;

                const itemTags = [
                    ...(itemAI.dietary_tags || []),
                    ...(itemAI.flavor_profile ? [itemAI.flavor_profile] : [])
                ];

                const matchesAll = activeFilters.every(filter => itemTags.includes(filter));
                if (!matchesAll) return;
            }

            let category = item.category || 'Other';

            // Override with AI category if available
            if (menuCategories && menuCategories[item.id]) {
                const aiCat = menuCategories[item.id].smart_category;
                if (aiCat) category = aiCat;
            }

            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(item);
        });

        return groups;
    }, [items, menuCategories, activeFilters]);

    if (!items || items.length === 0) {
        return <div className="text-center py-8 text-muted-foreground">No menu items available.</div>
    }

    // Sort categories - put "Other" last, maybe specific order if provided?
    // For now purely alphabetical or preserving insertion order if we iterate keys.
    const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
        if (a === 'Other') return 1;
        if (b === 'Other') return -1;
        return a.localeCompare(b);
    });

    return (
        <div className="space-y-8">
            {isLoadingMenu && !menuCategories && (
                <div className="flex items-center justify-center py-4 text-sm text-muted-foreground animate-pulse gap-2">
                    <Sparkles className="w-4 h-4" /> Organizing menu with AI...
                </div>
            )}

            {/* Smart Filters */}
            <SmartMenuFilter
                activeFilters={activeFilters}
                onToggleFilter={handleToggleFilter}
                availableFilters={availableFilters}
                onClear={() => setActiveFilters([])}
            />

            {Object.keys(groupedItems).length === 0 && activeFilters.length > 0 && (
                <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed border-muted">
                    <Utensils className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No items match your filters.</p>
                    <Button variant="link" onClick={() => setActiveFilters([])}>Clear filters</Button>
                </div>
            )}

            {sortedCategories.map(category => (
                <section key={category} className="space-y-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold">{category}</h2>
                        {menuCategories && Object.values(menuCategories).some(c => c.smart_category === category) && (
                            <Badge variant="outline" className="text-xs font-normal bg-primary/5 text-primary border-primary/20">
                                <Sparkles className="w-3 h-3 mr-1" /> Smart Group
                            </Badge>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupedItems[category].map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <MenuItem
                                    item={item}
                                    aiTags={menuCategories?.[item.id] ? {
                                        dietary: menuCategories[item.id].dietary_tags,
                                        flavor: menuCategories[item.id].flavor_profile
                                    } : undefined}
                                />
                            </motion.div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    )
}
