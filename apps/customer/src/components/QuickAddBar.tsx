import { MenuItem } from '@dinein/db'
import { Button } from '@dinein/ui'
import { Plus } from 'lucide-react'

interface QuickAddBarProps {
    title: string
    items: MenuItem[]
    onAdd: (item: MenuItem) => void
    currency: string
}

export function QuickAddBar({ title, items, onAdd, currency }: QuickAddBarProps) {
    if (!items.length) return null

    return (
        <div className="py-4 space-y-3">
            <div className="px-4 flex items-center justify-between">
                <h3 className="font-bold text-lg text-foreground">{title}</h3>
            </div>

            <div className="flex overflow-x-auto px-4 gap-3 pb-4 [&::-webkit-scrollbar]:hidden snap-x">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="flex-none w-36 snap-start bg-card dark:bg-card/50 rounded-2xl p-3 border border-border/50 shadow-sm hover:border-primary/50 transition-colors"
                    >
                        <div className="h-20 w-full bg-secondary/80 rounded-xl mb-3 flex items-center justify-center text-xl font-bold text-primary/40 backdrop-blur-sm">
                            {item.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-medium text-sm line-clamp-1 leading-tight">{item.name}</h4>
                            <div className="flex items-center justify-between pt-1">
                                <span className="text-xs font-bold text-muted-foreground">
                                    {currency} {item.price.toLocaleString()}
                                </span>
                                <Button
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all active:scale-95"
                                    onClick={() => onAdd(item)}
                                >
                                    <Plus size={16} strokeWidth={3} />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
