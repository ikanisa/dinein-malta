import { Outlet, Navigate, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Store, Users, FileText, LogOut, ShieldAlert, Settings, UtensilsCrossed, Bot, CheckCircle2 } from 'lucide-react'
import { useAdmin } from '../context/AdminContext'
import { Button } from '@dinein/ui'
import { AdminAssistantChat } from '@/components/AdminAssistantChat'

const NAV_ITEMS = [
    { path: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
    { path: '/dashboard/claims', label: 'Claims', icon: ShieldAlert },
    { path: '/dashboard/venues', label: 'Venues', icon: Store },
    { path: '/dashboard/menus', label: 'Menus', icon: UtensilsCrossed },
    { path: '/dashboard/users', label: 'Users', icon: Users },
    { path: '/dashboard/approvals', label: 'Approvals', icon: CheckCircle2 },
    { path: '/dashboard/audit', label: 'Audit', icon: FileText },
    { path: '/dashboard/ai', label: 'AI Analytics', icon: Bot },
    { path: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function AdminLayout() {
    const { user, loading, signOut } = useAdmin()
    const location = useLocation()

    if (loading) return <div className="flex h-screen items-center justify-center bg-background text-foreground">Loading...</div>
    if (!user) return <Navigate to="/" replace />

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 border-r border-border bg-card/50 backdrop-blur-xl flex-col">
                <div className="h-16 flex items-center px-6 border-b border-border gap-3">
                    <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">DineIn Admin</span>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map(item => {
                        const Icon = item.icon
                        const isActive = item.exact
                            ? location.pathname === item.path
                            : location.pathname.startsWith(item.path)

                        return (
                            <Link key={item.path} to={item.path}>
                                <Button
                                    variant={isActive ? 'secondary' : 'ghost'}
                                    className={`w-full justify-start gap-3 mb-1 font-medium ${isActive
                                        ? 'bg-primary/10 text-primary hover:bg-primary/20'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    {item.label}
                                </Button>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-border bg-card/30">
                    <div className="mb-4 px-2">
                        <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Signed in as</div>
                        <div className="text-sm font-medium truncate">{user.email}</div>
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => signOut()}
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
                {/* Mobile Header */}
                <header className="md:hidden h-16 flex items-center px-4 border-b border-border justify-between bg-card/80 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-primary" />
                        <h2 className="font-bold text-lg">Admin</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => signOut()}>
                        <LogOut className="h-5 w-5" />
                    </Button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                    <Outlet />
                </div>

                {/* Mobile Bottom Nav */}
                <nav className="md:hidden border-t border-border bg-card/90 backdrop-blur-xl flex justify-around p-2 pb-safe-bottom safe-area-pb">
                    {NAV_ITEMS.map(item => {
                        const Icon = item.icon
                        const isActive = item.exact
                            ? location.pathname === item.path
                            : location.pathname.startsWith(item.path)
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center p-2 rounded-xl transition-all ${isActive
                                    ? 'text-primary bg-primary/10'
                                    : 'text-muted-foreground hover:bg-accent'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-[10px] uppercase font-bold mt-1 tracking-wide">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>
            </main>

            {/* AI Assistant Chat Widget */}
            <AdminAssistantChat />
        </div>
    )
}
