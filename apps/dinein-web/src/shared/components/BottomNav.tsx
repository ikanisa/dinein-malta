import { Home, Search, User, Calendar } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

export type TabId = 'home' | 'discover' | 'reservations' | 'profile';

interface BottomNavProps {
    activeTab?: TabId;
    onTabChange?: (t: TabId) => void;
    cartCount?: number;
    onCartClick?: () => void;
}

export function BottomNav({ activeTab = 'home', onTabChange }: BottomNavProps) {
    const tabs = [
        { id: 'home' as TabId, icon: Home, label: 'Home' },
        { id: 'discover' as TabId, icon: Search, label: 'Explore' },
        { id: 'reservations' as TabId, icon: Calendar, label: 'Bookings' },
        // { id: 'cart' as TabId, icon: ShoppingCart, label: 'Cart', isCart: true }, // Hidden for now logic if needed, or keep? Let's add standard tab behavior for now.
        { id: 'profile' as TabId, icon: User, label: 'Profile' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[100]">
            {/* Gradient Fade for content behind */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent -z-10" />

            <div className="max-w-md mx-auto px-4 pb-safe pt-4">
                <GlassCard depth="2" className="flex justify-between items-center px-2 py-2 rounded-[2rem]">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const Icon = tab.icon;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                data-testid={`nav-${tab.id}`}
                                aria-label={`Navigate to ${tab.label}`}
                                onClick={() => {
                                    console.log('Nav clicked:', tab.id);
                                    onTabChange?.(tab.id);
                                }}
                                className="relative flex flex-col items-center gap-1 px-4 py-2 transition-all active:scale-90"
                            >
                                <div className={`p-2 rounded-xl transition-all duration-300 ${isActive
                                    ? 'bg-indigo-600 shadow-md shadow-indigo-500/30 translate-y-[-4px]'
                                    : 'hover:bg-indigo-50'
                                    }`}>
                                    <Icon
                                        className={`w-5 h-5 transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-400'}`}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                </div>
                                <span className={`text-[10px] font-bold transition-all duration-300 ${isActive
                                    ? 'text-indigo-600 translate-y-[-2px]'
                                    : 'text-slate-400 opacity-80'
                                    }`}>
                                    {tab.label}
                                </span>
                                {isActive && (
                                    <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-indigo-600" />
                                )}
                            </button>
                        );
                    })}
                </GlassCard>
            </div>
        </nav>
    );
}
