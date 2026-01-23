'use client';

import { MenuItem, MenuItemData } from "./MenuItem"

import { useMemo } from "react"
import { motion } from "framer-motion"

interface MenuGridProps {
    items: MenuItemData[]
}

export function MenuGrid({ items }: MenuGridProps) {
    // Filter and Group items
    const groupedItems = useMemo(() => {
        const groups: Record<string, MenuItemData[]> = {};

        items.forEach(item => {
            const category = item.category || 'Other';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(item);
        });

        return groups;
    }, [items]);

    if (!items || items.length === 0) {
        return <div className="text-center py-8 text-muted-foreground">No menu items available.</div>
    }

    const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
        if (a === 'Other') return 1;
        if (b === 'Other') return -1;
        return a.localeCompare(b);
    });

    return (
        <div className="space-y-8">
            {sortedCategories.map(category => (
                <section key={category} className="space-y-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold">{category}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupedItems[category].map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <MenuItem item={item} />
                            </motion.div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    )
}
