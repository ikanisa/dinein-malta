import { useState } from 'react';
import { RefreshCcw, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils'; // Keep import consistent

export interface ReorderButtonProps {
    /** Callback to add items to cart */
    onReorder: () => Promise<void> | void;
    isLoading?: boolean;
    className?: string;
    /** If verification needed, maybe show "Add X items to cart?" */
    itemCount?: number;
}

/**
 * Reorder Button
 * Appears in Order History. Adds strict items from a past order to the active cart.
 * Never auto-submits.
 */
export function ReorderButton({ onReorder, isLoading = false, className, itemCount }: ReorderButtonProps) {
    const [internalLoading, setInternalLoading] = useState(false);

    const handleClick = async () => {
        setInternalLoading(true);
        try {
            await onReorder();
        } finally {
            setInternalLoading(false);
        }
    };

    const loading = isLoading || internalLoading;

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={loading}
            className={cn("gap-2", className)}
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <RefreshCcw className="h-4 w-4" />
            )}
            Reorder {itemCount ? `(${itemCount})` : ''}
        </Button>
    );
}
