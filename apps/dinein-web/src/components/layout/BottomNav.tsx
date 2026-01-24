import { Home, Search, Receipt, User } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type TabId = 'home' | 'discover' | 'reservations' | 'profile';

interface BottomNavProps {
    activeTab?: TabId;
    onTabChange?: (t: TabId) => void;
    cartCount?: number;
    onCartClick?: () => void;
}

const NAV_ITEMS = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'discover', label: 'Explore', icon: Search },
    { id: 'reservations', label: 'Orders', icon: Receipt },
    { id: 'profile', label: 'Profile', icon: User },
] as const;

export function BottomNav({ activeTab = 'home', onTabChange }: BottomNavProps) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-t border-indigo-50/50 shadow-[0_-4px_20px_-4px_rgba(99,102,241,0.1)]" />

            <div className="relative flex justify-around items-center h-[60px] max-w-md mx-auto px-2">
                {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
                    const isActive = activeTab === id;

                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => onTabChange?.(id)}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 active:scale-95",
                                "tap-highlight-transparent outline-none focus:outline-none",
                                isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <div className={cn(
                                "relative p-1.5 rounded-xl transition-all duration-300",
                                isActive && "bg-indigo-50"
                            )}>
                                <Icon
                                    size={24}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={cn("transition-transform duration-300", isActive && "-translate-y-0.5")}
                                />
                                {isActive && (
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full" />
                                )}
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium tracking-wide transition-colors",
                                isActive ? "text-indigo-900" : "text-slate-400"
                            )}>
                                {label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
