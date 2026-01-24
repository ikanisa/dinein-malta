import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck, UtensilsCrossed, Settings, Bell } from 'lucide-react';
import { clsx } from 'clsx';
import { ThemeToggle } from '@dinein/ui';

export function VendorLayout() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 pb-20">
            {/* Temporary Theme Toggle Placement */}
            <div className="fixed top-safe-top right-4 z-50 mt-2">
                <ThemeToggle />
            </div>

            <main className="pt-safe-top">
                <Outlet />
            </main>

            <VendorBottomNav />
        </div>
    );
}

function VendorBottomNav() {
    const location = useLocation();

    const tabs = [
        { name: 'Dashboard', path: '/vendor', icon: LayoutDashboard, exact: true },
        { name: 'Inbox', path: '/vendor/bell', icon: Bell },
        { name: 'Orders', path: '/vendor/orders', icon: CalendarCheck },
        { name: 'Menu', path: '/vendor/menu', icon: UtensilsCrossed },
        { name: 'Settings', path: '/vendor/settings', icon: Settings },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe-bottom z-50 transition-colors duration-300">
            <div className="flex items-center justify-around h-16">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    // Handle exact match for root /vendor vs /vendor/orders
                    const isActive = tab.exact
                        ? location.pathname === tab.path
                        : location.pathname.startsWith(tab.path);

                    return (
                        <NavLink
                            key={tab.path}
                            to={tab.path}
                            end={tab.exact}
                            className={clsx(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 touch-manipulation",
                                isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                            )}
                        >
                            <div className="relative">
                                <Icon
                                    size={24}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={clsx("transition-transform duration-200", isActive && "scale-105")}
                                />
                                {isActive && (
                                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                                )}
                            </div>
                            <span className="text-[10px] font-medium tracking-tight">
                                {tab.name}
                            </span>
                        </NavLink>
                    );
                })}
            </div>
            {/* Visual separator for safe area on iPhone X+ */}
            <div className="h-safe-bottom bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-300" />
        </nav>
    );
}
