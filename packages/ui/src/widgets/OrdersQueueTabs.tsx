import { cn } from '../lib/utils';

export interface OrderStatus {
    id: 'placed' | 'received' | 'served' | 'cancelled';
    label: string;
    count: number;
}

export interface OrdersQueueTabsProps {
    /** Status tabs with counts */
    statuses: OrderStatus[];
    /** Currently active status */
    activeStatus: string;
    /** Callback when tab is selected */
    onStatusChange: (status: string) => void;
    /** Additional className */
    className?: string;
}

/**
 * Orders Queue Tabs - horizontal tabs with count badges
 * Shows Placed/Received/Served/Cancelled with counts
 */
export function OrdersQueueTabs({
    statuses,
    activeStatus,
    onStatusChange,
    className,
}: OrdersQueueTabsProps) {
    return (
        <div className={cn('flex gap-2 overflow-x-auto pb-2 scrollbar-hide', className)}>
            {statuses.map(status => {
                const isActive = activeStatus === status.id;
                const isNew = status.id === 'placed' && status.count > 0;

                return (
                    <button
                        key={status.id}
                        onClick={() => onStatusChange(status.id)}
                        className={cn(
                            'relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                            isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                        )}
                    >
                        {status.label}
                        {status.count > 0 && (
                            <span
                                className={cn(
                                    'flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-bold',
                                    isActive
                                        ? 'bg-white/20 text-primary-foreground'
                                        : isNew
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted-foreground/20 text-muted-foreground'
                                )}
                            >
                                {status.count}
                            </span>
                        )}
                        {isNew && !isActive && (
                            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
