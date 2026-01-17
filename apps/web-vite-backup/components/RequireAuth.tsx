import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserType } from '../types';
import { Spinner } from './Loading';

interface RequireAuthProps {
  children: React.ReactNode;
  requiredRole?: UserType;
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
      // Admin can access staff routes, but staff cannot access admin
      if (requiredRole === UserType.ADMIN) {
        // Only admin can access admin routes
        navigate(redirectTo || '/admin/login', { replace: true });
      } else if (requiredRole === UserType.MANAGER && role !== UserType.ADMIN) {
        // Manager routes: only manager or admin can access
        navigate(redirectTo || '/manager/login', { replace: true });
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

  // Require authentication for manager/admin routes
  if (!user) {
    return null; // Will redirect
  }

  // Check role
  if (requiredRole === UserType.MANAGER && role !== UserType.MANAGER && role !== UserType.ADMIN) {
    return null; // Will redirect
  }

  if (requiredRole === UserType.ADMIN && role !== UserType.ADMIN) {
    return null; // Will redirect
  }

  return <>{children}</>;
};

