import { Bell as BellIcon } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';
import { forwardRef } from 'react';

export interface BellProps extends React.ComponentProps<typeof Button> {
    hasNotifications?: boolean;
    active?: boolean;
}

export const Bell = forwardRef<HTMLButtonElement, BellProps>(({ hasNotifications, active, className, ...props }, ref) => {
    return (
        <Button
            ref={ref}
            variant="ghost"
            size="icon"
            className={cn("relative", className)}
            {...props}
        >
            <BellIcon className={cn(
                "h-5 w-5 transition-colors",
                (hasNotifications || active) ? 'text-primary animate-pulse-soft' : 'text-muted-foreground'
            )} />

            {hasNotifications && (
                <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                </span>
            )}
            <span className="sr-only">Notifications</span>
        </Button>
    );
});

Bell.displayName = "Bell";
