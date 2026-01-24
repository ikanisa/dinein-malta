import { Outlet, Navigate, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Menu, ClipboardList, LogOut, Bell, Download } from 'lucide-react'
import { useOwner } from '../context/OwnerContext'
import { Button } from '@dinein/ui'
import { useA2HS } from '@dinein/ui'
import { toast } from 'sonner'
import { useEffect } from 'react'

const NAV_ITEMS = [
    { path: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
    { path: '/dashboard/orders', label: 'Orders', icon: ClipboardList },
    { path: '/dashboard/menu', label: 'Menu', icon: Menu },
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

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>
    if (!isAuthenticated) return <Navigate to="/" replace />

    return (
        <div className="flex h-screen bg-muted/10">
            {/* Sidebar - Desktop hidden on mobile in future, simplifed for now */}
            <aside className="hidden w-64 border-r bg-background p-4 md:flex md:flex-col">
                <div className="mb-8 flex items-center gap-2 px-2">
                    <div className="h-8 w-8 rounded-lg bg-primary" />
                    <span className="font-bold text-lg">{venue?.name}</span>
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
                                    className={`w-full justify-start gap-3 ${isActive ? 'bg-secondary font-semibold' : 'text-muted-foreground'}`}
                                >
                                    <Icon className="h-5 w-5" />
                                    {item.label}
                                </Button>
                            </Link>
                        )
                    })}
                </nav>

                <div className="border-t pt-4">
                    <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={logout}>
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header (placeholder) */}
                <header className="md:hidden flex h-16 items-center border-b px-4 justify-between bg-background">
                    <span className="font-bold">{venue?.name}</span>
                    <Button size="icon" variant="ghost"><Bell className="h-5 w-5" /></Button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <Outlet />
                </div>

                {/* Mobile Bottom Nav */}
                <nav className="md:hidden border-t bg-background flex justify-around p-2">
                    {NAV_ITEMS.map(item => {
                        const Icon = item.icon
                        const isActive = item.exact
                            ? location.pathname === item.path
                            : location.pathname.startsWith(item.path)
                        return (
                            <Link key={item.path} to={item.path} className={`flex flex-col items-center p-2 rounded-lg ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                                <Icon className="h-6 w-6" />
                                <span className="text-xs mt-1">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>
            </main>
        </div>
    )
}
