import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Store, Settings, ShieldAlert, Map } from 'lucide-react';
import { clsx } from 'clsx';
import { ThemeToggle } from '@dinein/ui';

export function AdminLayout() {
    return (
        <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-card shadow-sm hidden md:flex flex-col">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                        Admin Portal
                    </span>
                    <ThemeToggle />
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <AdminSidebarItem to="/admin" icon={LayoutDashboard} label="Overview" end />
                    <AdminSidebarItem to="/admin/venues" icon={Store} label="Venues" />
                    <AdminSidebarItem to="/admin/users" icon={Users} label="Users" />
                    <AdminSidebarItem to="/admin/roadmap" icon={Map} label="Roadmap" />
                    <AdminSidebarItem to="/admin/system" icon={ShieldAlert} label="System" />
                    <AdminSidebarItem to="/admin/settings" icon={Settings} label="Settings" />
                </nav>

                <div className="p-4 border-t border-border">
                    <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                        <p className="font-medium text-foreground">DineIn Admin v1.0</p>
                        <p>Secure System</p>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-4 z-50">
                <span className="font-bold">Admin Portal</span>
                <ThemeToggle />
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-auto pt-16 md:pt-0">
                <div className="container mx-auto p-4 md:p-8 max-w-7xl animate-in fade-in duration-500">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

function AdminSidebarItem({ to, icon: Icon, label, end }: { to: string, icon: any, label: string, end?: boolean }) {
    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
                clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                    isActive
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
            }
        >
            <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
            {label}
        </NavLink>
    );
}
