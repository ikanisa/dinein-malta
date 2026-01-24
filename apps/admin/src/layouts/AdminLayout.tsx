import { Outlet, Navigate, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Store, Users, FileText, LogOut, ShieldAlert } from 'lucide-react'
import { useAdmin } from '../context/AdminContext'
import { Button } from '@dinein/ui'

const NAV_ITEMS = [
    { path: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
    { path: '/dashboard/claims', label: 'Claims', icon: ShieldAlert },
    { path: '/dashboard/venues', label: 'Venues', icon: Store },
    { path: '/dashboard/users', label: 'Users', icon: Users },
    { path: '/dashboard/audit', label: 'Audit Logs', icon: FileText },
]

export function AdminLayout() {
    const { user, loading, signOut } = useAdmin()
    const location = useLocation()

    if (loading) return <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">Loading...</div>
    if (!user) return <Navigate to="/" replace />

    return (
        <div className="flex h-screen bg-zinc-950 text-zinc-100">
            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-800 bg-zinc-900 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-zinc-800 gap-2">
                    <div className="h-6 w-6 rounded bg-red-600" />
                    <span className="font-bold text-lg tracking-tight">DineIn Admin</span>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {NAV_ITEMS.map(item => {
                        const Icon = item.icon
                        const isActive = item.exact
                            ? location.pathname === item.path
                            : location.pathname.startsWith(item.path)

                        return (
                            <Link key={item.path} to={item.path}>
                                <Button
                                    variant="ghost"
                                    className={`w-full justify-start gap-3 mb-1 ${isActive
                                        ? 'bg-zinc-800 text-white font-medium'
                                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Button>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-zinc-800">
                    <div className="mb-4 px-2">
                        <div className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Signed in as</div>
                        <div className="text-sm truncate">{user?.email}</div>
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-red-400 hover:bg-red-950/30 hover:text-red-300"
                        onClick={() => signOut()}
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-zinc-950">
                <header className="h-16 flex items-center px-8 border-b border-zinc-800 justify-between">
                    <h2 className="font-semibold text-lg">
                        {NAV_ITEMS.find(i => location.pathname === i.path || location.pathname.startsWith(i.path))?.label || 'Dashboard'}
                    </h2>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
