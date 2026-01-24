import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../shared/services/supabase';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AdminContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isAdmin: boolean;
    signIn: () => Promise<void>; // Simple mock login via specific email for now OR real magic link
    signOut: () => Promise<void>;
    // Aliases for compatibility
    login: () => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Define checkAdminRole BEFORE the useEffect that uses it
    const checkAdminRole = async (user: User | undefined | null) => {
        if (!user || !user.email) {
            setIsAdmin(false);
            return;
        }

        // Strict Admin Allowlist for MVP (Safety first)
        // In Prod: Use a 'roles' table or custom claims
        const ADMIN_EMAILS = ['admin@dinein.rw', 'jeanbosco@dinein.rw', 'test@admin.com'];
        const isAllowed = ADMIN_EMAILS.includes(user.email);

        setIsAdmin(isAllowed);
        if (!isAllowed) {
            console.warn('User logged in but not an admin:', user.email);
        }
    };

    useEffect(() => {
        // Initialize session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            checkAdminRole(session?.user);
            setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            checkAdminRole(session?.user);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async () => {
        // For local dev/demo: Anonymous Sign In or Magic Link
        // Using Magic Link to admin@dinein.rw for stability
        const { error } = await supabase.auth.signInWithOtp({
            email: 'admin@dinein.rw',
            options: {
                shouldCreateUser: true // Allow for dev
            }
        });
        if (error) {
            toast.error('Login failed: ' + error.message);
        } else {
            toast.success('Magic link sent to admin@dinein.rw (Check Supabase Inbucket)');
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setIsAdmin(false);
    };

    const login = signIn;
    const logout = signOut;
    const isAuthenticated = !!user;

    return (
        <AdminContext.Provider value={{
            user, session, loading, isAdmin,
            signIn, signOut,
            login, logout, isAuthenticated
        }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
}
