import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import type { User } from '@supabase/supabase-js';
import { errorTracker } from '../services/errorTracking';

export type UserRole = 'client' | 'manager' | 'admin';

export interface AuthUser {
  user: User | null;
  role: UserRole;
  vendorId: string | null;
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
  // vendorRole removed - all vendor users are now 'manager'
  const [loading, setLoading] = useState(true);

  const checkRole = async (authUser: User | null): Promise<void> => {
    if (!authUser) {
      setRole('client');
      setVendorId(null);
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
        return;
      }

      // Check vendor (Mapped to MANAGER role)
      const { data: vendorData } = await supabase
        .from('vendor_users')
        .select('vendor_id')
        .eq('auth_user_id', authUser.id)
        .eq('is_active', true)
        .single();

      if (vendorData) {
        setRole('manager');
        setVendorId(vendorData.vendor_id);
        return;
      }

      // Default to client
      setRole('client');
      setVendorId(null);
    } catch (error) {
      console.error('Error checking role:', error);
      setRole('client');
      setVendorId(null);
    }
  };

  const refreshRole = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    await checkRole(authUser);
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        await checkRole(session.user);
      }
      // Skip anonymous auth - it's optional and may not be enabled
      // Client features work without auth, only premium features require it
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authUser = session?.user ?? null;
      setUser(authUser);
      await checkRole(authUser);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      errorTracker.setUser(user.id, user.email ?? undefined, {
        role,
        vendorId,
      });
    } else {
      errorTracker.clearUser();
    }
  }, [user, role, vendorId]);

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
    const { error } = await supabase.auth.signInWithOAuth({
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
  };

  const value: AuthContextType = {
    user,
    role,
    vendorId,
    loading,
    signInAnonymously,
    signInWithEmail,
    signInWithOAuth,
    signOut,
    refreshRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
