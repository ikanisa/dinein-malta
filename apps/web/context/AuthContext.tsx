import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import type { User } from '@supabase/supabase-js';
import { errorTracker } from '../services/errorTracking';

export type UserRole = 'client' | 'vendor' | 'admin';

export interface AuthUser {
  user: User | null;
  role: UserRole;
  vendorId: string | null;
  vendorRole: 'owner' | 'manager' | 'staff' | null;
  loading: boolean;
}

interface AuthContextType extends AuthUser {
  signInAnonymously: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithOAuth: (provider: 'google') => Promise<void>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('client');
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [vendorRole, setVendorRole] = useState<'owner' | 'manager' | 'staff' | null>(null);
  const [loading, setLoading] = useState(true);

  const checkRole = async (authUser: User | null): Promise<void> => {
    if (!authUser) {
      setRole('client');
      setVendorId(null);
      setVendorRole(null);
      return;
    }

    try {
      // Check admin first
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('id')
        .eq('auth_user_id', authUser.id)
        .eq('is_active', true)
        .single();

      if (adminData) {
        setRole('admin');
        setVendorId(null);
        setVendorRole(null);
        return;
      }

      // Check vendor
      const { data: vendorData } = await supabase
        .from('vendor_users')
        .select('vendor_id, role')
        .eq('auth_user_id', authUser.id)
        .eq('is_active', true)
        .single();

      if (vendorData) {
        setRole('vendor');
        setVendorId(vendorData.vendor_id);
        setVendorRole(vendorData.role as 'owner' | 'manager' | 'staff');
        return;
      }

      // Default to client
      setRole('client');
      setVendorId(null);
      setVendorRole(null);
    } catch (error) {
      console.error('Error checking role:', error);
      setRole('client');
      setVendorId(null);
      setVendorRole(null);
    }
  };

  const refreshRole = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    await checkRole(authUser);
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        // If no session, initialize anonymous auth for client routes
        // This allows RLS policies to work correctly
        try {
          const { data: anonData } = await supabase.auth.signInAnonymously();
          if (anonData.user) {
            setUser(anonData.user);
            await checkRole(anonData.user);
          }
        } catch (error) {
          console.warn('Failed to initialize anonymous auth:', error);
          // Continue without anonymous auth - some features may not work
        }
      } else {
        setUser(session.user);
        await checkRole(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const authUser = session?.user ?? null;
      setUser(authUser);
      await checkRole(authUser);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      errorTracker.setUser(user.id, user.email ?? undefined);
    } else {
      errorTracker.clearUser();
    }
  }, [user]);

  const signInAnonymously = async () => {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    if (data.user) {
      setUser(data.user);
      await checkRole(data.user);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    if (data.user) {
      setUser(data.user);
      await checkRole(data.user);
    }
  };

  const signInWithOAuth = async (provider: 'google') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/admin/dashboard`,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setRole('client');
    setVendorId(null);
    setVendorRole(null);
  };

  const value: AuthContextType = {
    user,
    role,
    vendorId,
    vendorRole,
    loading,
    signInAnonymously,
    signInWithEmail,
    signInWithOAuth,
    signOut,
    refreshRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
