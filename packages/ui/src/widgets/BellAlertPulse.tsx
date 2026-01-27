import { Bell } from '../components/ui/Bell';
import { cn } from '../lib/utils';

export interface BellAlertPulseProps {
    unreadCount: number;
    onClick: () => void;
    className?: string;
    /** Whether to show connection status or other indicators could be added here */
}

/**
 * Bell Alert Pulse
 * Widget for Venue Dashboard header.
 * Shows pulse when unread bell calls exist.
 */
export function BellAlertPulse({
    unreadCount,
    onClick,
    className
}: BellAlertPulseProps) {
    const hasUnread = unreadCount > 0;

    return (
        <div className={cn("relative inline-block", className)}>
            <Bell
                hasNotifications={hasUnread}
                onClick={onClick}
                className="hover:bg-muted/50"
            />
            {hasUnread && unreadCount > 1 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-destructive text-[10px] font-bold text-white border-2 border-background pointer-events-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </div>
    );
}
