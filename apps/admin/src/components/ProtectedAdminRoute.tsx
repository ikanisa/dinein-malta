import { Navigate, useLocation } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { toast } from 'sonner'

interface ProtectedAdminRouteProps {
    children: React.ReactNode
}

/**
 * Route guard that ensures only authenticated admin users can access protected routes.
 * 
 * Behavior:
 * - Loading: Shows spinner
 * - Not authenticated: Redirects to login
 * - Authenticated but not admin: Redirects to login with error toast
 * - Admin: Renders children
 */
export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
    const { user, loading, isAdmin, isAuthenticated } = useAdmin()
    const location = useLocation()

    // Show unauthorized toast when authenticated but not admin
    useEffect(() => {
        if (!loading && isAuthenticated && !isAdmin) {
            toast.error('Access denied. Admin privileges required.')
        }
    }, [loading, isAuthenticated, isAdmin])

    // Loading state
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Verifying access...</p>
                </div>
            </div>
        )
    }

    // Not authenticated - redirect to login
    if (!user) {
        return <Navigate to="/" state={{ from: location }} replace />
    }

    // Authenticated but not admin - redirect to login with state
    if (!isAdmin) {
        return <Navigate to="/" state={{ from: location, unauthorized: true }} replace />
    }

    // Admin user - render protected content
    return <>{children}</>
}
