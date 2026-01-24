import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '@/shared/services/supabase';
import { Session } from '@supabase/supabase-js';

interface ProtectedRouteProps {
    allowedRoles?: ('admin' | 'vendor' | 'client')[];
    children?: React.ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps = {}) {
    const [session, setSession] = useState<Session | null>(null);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        let subscription: any;

        const checkAuth = async () => {
            try {
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                setSession(currentSession);

                if (!currentSession) {
                    setLoading(false);
                    return;
                }

                // If no specific roles required, we are done
                if (!allowedRoles || allowedRoles.length === 0) {
                    setIsAuthorized(true);
                    setLoading(false);
                    return;
                }

                // Role checks
                let authorized = false;

                // Check Admin Check
                if (allowedRoles.includes('admin')) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', currentSession.user.id)
                        .single();
                    if (profile?.role === 'admin') authorized = true;
                }

                // Check Vendor Check (if not already authorized)
                if (!authorized && allowedRoles.includes('vendor')) {
                    const { data: vendorUser } = await supabase
                        .from('vendor_users')
                        .select('id')
                        .eq('auth_user_id', currentSession.user.id)
                        .maybeSingle();
                    if (vendorUser) authorized = true;
                }

                // Client check (default authorized if logged in)
                if (!authorized && allowedRoles.includes('client')) {
                    authorized = true;
                }

                setIsAuthorized(authorized);

            } catch (err) {
                console.error('Auth check failed:', err);
                setIsAuthorized(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();

        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user.id !== session?.user.id) {
                // Re-run check on user change, for now just reload
                window.location.reload();
            }
        });
        subscription = data.subscription;

        return () => {
            subscription?.unsubscribe();
        };
    }, [allowedRoles]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && isAuthorized === false) {
        // Redirect to appropriate home based on what they ARE allowed to see, or login
        return <Navigate to="/" replace />;
    }

    return children ? <>{children}</> : <Outlet />;
}
