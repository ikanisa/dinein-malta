import { Badge } from '@dinein/ui'
import { cn } from '@dinein/ui'
import { MenuCategory } from '@dinein/db'

interface MenuHeaderProps {
    categories: MenuCategory[]
    activeCategory?: string
    onSelectCategory: (id: string) => void
}

export function MenuHeader({ categories, activeCategory, onSelectCategory }: MenuHeaderProps) {
    return (
        <div className="sticky top-0 z-10 -mx-4 overflow-x-auto bg-background/80 px-4 py-2 backdrop-blur-md">
            <div className="flex gap-2">
                {categories.map((category) => (
                    <Badge
                        key={category.id}
                        variant={activeCategory === category.id ? 'default' : 'outline'}
                        className={cn(
                            "cursor-pointer whitespace-nowrap px-4 py-2 text-sm transition-all",
                            activeCategory === category.id ? "scale-105 shadow-sm" : "hover:bg-muted"
                        )}
                        onClick={() => onSelectCategory(category.id)}
                    >
                        {category.name}
                    </Badge>
                ))}
            </div>
        </div>
    )
}
