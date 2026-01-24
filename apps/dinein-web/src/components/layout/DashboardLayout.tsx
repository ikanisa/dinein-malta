import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, Settings, User, LayoutDashboard, UtensilsCrossed, CalendarDays, ShoppingBag, Store, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/GlassCard';

export type DashboardType = 'vendor' | 'admin';

interface SidebarItem {
    icon: React.ElementType;
    label: string;
    path: string;
}

const VENDOR_ITEMS: SidebarItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/vendor' },
    { icon: ShoppingBag, label: 'Orders', path: '/vendor/orders' },
    { icon: UtensilsCrossed, label: 'Menu', path: '/vendor/menu' },
    { icon: CalendarDays, label: 'Tables', path: '/vendor/tables' },
    { icon: Settings, label: 'Settings', path: '/vendor/settings' },
];

const ADMIN_ITEMS: SidebarItem[] = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
    { icon: Store, label: 'Vendors', path: '/admin/vendors' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: Settings, label: 'System', path: '/admin/settings' },
];

interface DashboardLayoutProps {
    type: DashboardType;
    userName?: string;
    userImage?: string;
    onLogout?: () => void;
}

export function DashboardLayout({ type, userName = "User", userImage, onLogout }: DashboardLayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const items = type === 'vendor' ? VENDOR_ITEMS : ADMIN_ITEMS;
    const accentColor = type === 'vendor' ? 'bg-indigo-600' : 'bg-rose-600';
    const accentText = type === 'vendor' ? 'text-indigo-600' : 'text-rose-600';

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex font-sans text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 p-4 shrink-0">
                <GlassCard className="h-full flex flex-col !p-0 overflow-hidden border-2 border-white/50 dark:border-white/10" depth="2">
                    {/* Brand */}
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg", accentColor)}>
                                {type === 'vendor' ? 'V' : 'A'}
                            </div>
                            <div>
                                <h1 className="font-bold text-lg leading-none">DineIn</h1>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{type}</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {items.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === (type === 'vendor' ? '/vendor' : '/admin')} // Exact match for root
                                className={({ isActive }) => cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm",
                                    isActive
                                        ? cn("bg-white dark:bg-slate-800 shadow-md", accentText)
                                        : "text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* User */}
                    <div className="p-4 border-t border-white/10 bg-white/30 dark:bg-slate-900/30">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                                {userImage ? (
                                    <img src={userImage} alt={userName} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5 text-slate-400" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{userName}</p>
                                <p className="text-xs text-muted-foreground truncate">Online</p>
                            </div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center gap-2 justify-center px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </GlassCard>
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 bottom-0 left-0 w-3/4 max-w-sm bg-white dark:bg-slate-900 z-50 p-4 shadow-2xl lg:hidden"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <span className="font-bold text-xl">Menu</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <nav className="space-y-2">
                                {items.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={({ isActive }) => cn(
                                            "flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium",
                                            isActive
                                                ? cn("bg-slate-100 dark:bg-slate-800", accentText)
                                                : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                        )}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.label}
                                    </NavLink>
                                ))}
                            </nav>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 md:pl-4 p-4 lg:p-0">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between mb-6 sticky top-4 z-30">
                    <GlassCard className="flex items-center p-2 rounded-xl" depth="1">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2">
                            <Menu className="w-6 h-6 text-slate-700 dark:text-slate-200" />
                        </button>
                    </GlassCard>
                </header>

                <div className="flex-1 lg:p-8 lg:pr-8 overflow-y-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
