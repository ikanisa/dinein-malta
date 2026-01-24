
import { ShoppingBag, MapPin, Bell } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface StatusHeaderProps extends React.HTMLAttributes<HTMLElement> {
    title?: string;
    subtitle?: string;
    showCart?: boolean;
    cartCount?: number;
    showLocation?: boolean;
    locationName?: string;
    notificationCount?: number;
    onNotificationClick?: () => void;
}

export function StatusHeader({
    title,
    subtitle,
    showCart = true,
    cartCount = 0,
    showLocation = true,
    locationName = "Table 4 • Dine-in",
    notificationCount = 0,
    onNotificationClick,
    className,
    children
}: StatusHeaderProps) {
    return (
        <header className={cn(
            "sticky top-0 z-40 w-full",
            "transition-all duration-200",
            className
        )}>
            {/* Glass Background */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-b border-indigo-50/50 shadow-sm" />

            <div className="relative px-4 h-14 max-w-md mx-auto flex items-center justify-between">

                {/* Left: Location or Title */}
                <div className="flex items-center gap-3 overflow-hidden">
                    {showLocation ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50/60 rounded-full border border-indigo-100/50">
                            <MapPin size={14} className="text-indigo-600 shrink-0" />
                            <span className="text-sm font-semibold text-indigo-900 truncate max-w-[140px]">
                                {locationName}
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {title && <h1 className="text-lg font-bold text-slate-900 leading-tight">{title}</h1>}
                            {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
                        </div>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    {children}

                    <button
                        onClick={onNotificationClick}
                        className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 active:bg-slate-100 transition-colors"
                        aria-label="View notifications"
                    >
                        <Bell size={20} className="text-slate-600" />
                        {notificationCount > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                        )}
                    </button>

                    {showCart && (
                        <button className="relative w-10 h-10 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">
                            <ShoppingBag size={20} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow ring-2 ring-white">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
