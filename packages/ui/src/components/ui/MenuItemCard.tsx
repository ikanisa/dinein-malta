import { Button } from './Button';
import { Card } from './Card';
import { Plus, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatCurrency } from '../../lib/utils';

export interface MenuItemCardProps {
    name: string;
    description?: string;
    price: number;
    currency: string;
    qty?: number;
    onAdd?: () => void;
    onIncrement?: () => void;
    onDecrement?: () => void;
    className?: string;
}

export function MenuItemCard({
    name,
    description,
    price,
    currency,
    qty = 0,
    onAdd,
    onIncrement,
    onDecrement,
    className
}: MenuItemCardProps) {
    return (
        <Card className={cn("flex flex-row items-center justify-between p-4 shadow-sm border-muted/40 transition-colors hover:border-primary/20", className)}>
            <div className="flex-1 pr-4">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{name}</h3>
                {description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1 leading-snug">{description}</p>
                )}
                <div className="mt-2 text-sm font-bold text-primary">
                    {formatCurrency(price, currency)}
                </div>
            </div>

            <div className="flex shrink-0 items-center">
                {qty === 0 ? (
                    <Button
                        size="sm"
                        variant="secondary"
                        className="h-9 rounded-full px-5 font-semibold active:scale-95 transition-transform"
                        onClick={onAdd}
                        aria-label={`Add ${name} to cart`}
                    >
                        Add
                    </Button>
                ) : (
                    <div className="flex items-center gap-3 rounded-full bg-secondary/60 p-1 ring-1 ring-border/50">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-full bg-background shadow-sm hover:bg-background/90"
                            onClick={onDecrement}
                            aria-label={`Decrease quantity of ${name}`}
                        >
                            <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="w-5 text-center text-sm font-bold tabular-nums" aria-hidden="true">{qty}</span>
                        <span className="sr-only">{qty} in cart</span>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-full bg-background shadow-sm hover:bg-background/90"
                            onClick={onIncrement}
                            aria-label={`Increase quantity of ${name}`}
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
}
