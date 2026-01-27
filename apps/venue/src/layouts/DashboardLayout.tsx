import { Outlet, Navigate, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Menu, ClipboardList, LogOut, Download, Settings } from 'lucide-react'
import { useOwner } from '../context/OwnerContext'
import { Button } from '@dinein/ui'
import { useA2HS } from '@dinein/ui'
import { toast } from 'sonner'
import { useEffect } from 'react'

const NAV_ITEMS = [
    { path: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
    { path: '/dashboard/orders', label: 'Orders', icon: ClipboardList },
    { path: '/dashboard/menu', label: 'Menu', icon: Menu },
    { path: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function DashboardLayout() {
    const { isAuthenticated, loading, logout, venue } = useOwner()
    const location = useLocation()
    const { isReady, install } = useA2HS()

    useEffect(() => {
        if (isAuthenticated && isReady) {
            toast('Install Venue Portal', {
                action: { label: 'Install', onClick: install },
                icon: <Download className="h-4 w-4" />,
                duration: 10000,
            })
        }
    }, [isReady, install, isAuthenticated])

    if (loading) return <div className="flex h-screen items-center justify-center bg-background">Loading...</div>
    if (!isAuthenticated) return <Navigate to="/" replace />

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 border-r border-border bg-card/50 backdrop-blur-xl flex-col p-4">
                <div className="mb-8 flex items-center gap-3 px-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <div className="h-4 w-4 rounded-full bg-primary" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">{venue?.name || 'Venue Portal'}</span>
                </div>

                <nav className="flex-1 space-y-1">
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

                <div className="border-t border-border pt-4 mt-auto">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={logout}
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
                {/* Mobile Header */}
                <header className="md:hidden flex h-16 items-center border-b border-border px-4 justify-between bg-card/80 backdrop-blur-md sticky top-0 z-20">
                    <span className="font-bold text-lg">{venue?.name || 'Venue'}</span>
                    <Button size="icon" variant="ghost" className="text-muted-foreground" onClick={logout}>
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
                                <Icon className="h-6 w-6" />
                                <span className="text-[10px] uppercase font-bold mt-1 tracking-wide">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>
            </main>
        </div>
    )
}
