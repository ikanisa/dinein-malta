import { badgeVariants, cn } from '@dinein/ui'
import { MenuCategory } from '@dinein/db'

interface MenuHeaderProps {
    categories: MenuCategory[]
    activeCategory?: string
    onSelectCategory: (id: string) => void
}

export function MenuHeader({ categories, activeCategory, onSelectCategory }: MenuHeaderProps) {
    return (
        <div className="sticky top-0 z-10 -mx-4 overflow-x-auto bg-background/80 px-4 py-2 backdrop-blur-md">
            <div className="flex gap-2" role="tablist" aria-label="Menu Categories">
                {categories.map((category) => {
                    const isActive = activeCategory === category.id;
                    return (
                        <button
                            key={category.id}
                            role="tab"
                            aria-selected={isActive}
                            aria-controls="menu-items-panel"
                            id={`tab-${category.id}`}
                            tabIndex={isActive ? 0 : -1}
                            className={cn(
                                badgeVariants({ variant: isActive ? 'default' : 'outline' }),
                                "cursor-pointer whitespace-nowrap px-4 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                isActive ? "scale-105 shadow-sm" : "hover:bg-muted"
                            )}
                            onClick={() => onSelectCategory(category.id)}
                        >
                            {category.name}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
