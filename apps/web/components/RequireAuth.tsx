import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './Loading';

interface RequireAuthProps {
  children: React.ReactNode;
  requiredRole?: 'vendor' | 'admin';
  redirectTo?: string;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({
  children,
  requiredRole,
  redirectTo,
}) => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    // If no user, ensure anonymous session for client routes
    if (!user && !requiredRole) {
      // Client routes can work with anonymous auth
      return;
    }

    // If role is required but user is not authenticated
    if (requiredRole && !user) {
      navigate(redirectTo || `/${requiredRole}/login`, { replace: true });
      return;
    }

    // If role is required but user doesn't have the right role
    if (requiredRole && role !== requiredRole) {
      // Admin can access vendor routes, but vendor cannot access admin
      if (requiredRole === 'admin') {
        // Only admin can access admin routes
        navigate(redirectTo || '/admin/login', { replace: true });
      } else if (requiredRole === 'vendor' && role !== 'admin') {
        // Vendor routes: only vendor or admin can access
        navigate(redirectTo || '/vendor/login', { replace: true });
      }
    }
  }, [user, role, loading, requiredRole, navigate, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  // Allow client routes (no requiredRole) even without user (will use anonymous)
  if (!requiredRole) {
    return <>{children}</>;
  }

  // Require authentication for vendor/admin routes
  if (!user) {
    return null; // Will redirect
  }

  // Check role
  if (requiredRole === 'vendor' && role !== 'vendor' && role !== 'admin') {
    return null; // Will redirect
  }

  if (requiredRole === 'admin' && role !== 'admin') {
    return null; // Will redirect
  }

  return <>{children}</>;
};

