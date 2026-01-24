import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Store, Settings, ShieldAlert, Map } from 'lucide-react';
import { clsx } from 'clsx';
import { ThemeToggle } from '@dinein/ui';

export function AdminLayout() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 flex">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl h-screen sticky top-0">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                        Admin
                    </span>
                    <ThemeToggle />
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <AdminSidebarItem to="/admin" icon={LayoutDashboard} label="Overview" end />
                    <AdminSidebarItem to="/admin/vendors" icon={Store} label="Vendors" />
                    <AdminSidebarItem to="/admin/users" icon={Users} label="Users" />
                    <AdminSidebarItem to="/admin/roadmap" icon={Map} label="Roadmap" />
                    <AdminSidebarItem to="/admin/system" icon={ShieldAlert} label="System" />
                    <AdminSidebarItem to="/admin/settings" icon={Settings} label="Settings" />
                </nav>
            </aside>

            {/* Mobile Header (visible only on small screens) */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50 flex items-center justify-between px-4">
                <span className="font-bold text-slate-900 dark:text-white">Admin Portal</span>
                <ThemeToggle />
            </header>

            {/* Main Content */}
            <main className="flex-1 pt-20 md:pt-6 px-4 md:px-8 max-w-7xl mx-auto w-full">
                <Outlet />
            </main>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- LucideIcon type
function AdminSidebarItem({ to, icon: Icon, label, end }: { to: string, icon: any, label: string, end?: boolean }) {
    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) => clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm",
                isActive
                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
            )}
        >
            <Icon size={18} />
            {label}
        </NavLink>
    )
}
