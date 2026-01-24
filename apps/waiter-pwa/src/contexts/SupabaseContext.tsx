import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient, SupabaseClient, User } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

interface SupabaseContextType {
    supabase: SupabaseClient
    user: User | null
    userId: string | null
    session: any
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)

            // If no session, sign in anonymously
            if (!session) {
                signInAnonymously()
            }
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signInAnonymously = async () => {
        try {
            const { error } = await supabase.auth.signInAnonymously()
            if (error) console.error('Error signing in anonymously:', error)
        } catch (err) {
            console.error('SignIn error:', err)
        }
    }

    const value = {
        supabase,
        user,
        userId: user?.id ?? null,
        session
    }

    return (
        <SupabaseContext.Provider value={value}>
            {!loading ? children : <div className="min-h-screen flex items-center justify-center">Loading...</div>}
        </SupabaseContext.Provider>
    )
}

export const useSupabase = () => {
    const context = useContext(SupabaseContext)
    if (context === undefined) {
        throw new Error('useSupabase must be used within a SupabaseProvider')
    }
    return context
}
