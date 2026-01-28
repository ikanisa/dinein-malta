import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { Venue } from '@dinein/db'
import { supabase } from '../shared/services/supabase'

interface OwnerContextType {
    venue: Venue | null
    loading: boolean
    login: (email: string, pincode: string) => Promise<void>
    logout: () => void
    isAuthenticated: boolean
    refreshVenue: () => Promise<void>
}

const OwnerContext = createContext<OwnerContextType | undefined>(undefined)

export function OwnerProvider({ children }: { children: ReactNode }) {
    const [venue, setVenue] = useState<Venue | null>(null)
    const [loading, setLoading] = useState(true)

    // Initial session check
    useEffect(() => {
        checkSession()

        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                await fetchVenueProfile()
            } else if (event === 'SIGNED_OUT') {
                setVenue(null)
            }
        })

        return () => subscription.unsubscribe()
        // eslint-disable-next-line react-hooks/exhaustive-deps -- checkSession defined below, runs once on mount
    }, [])

    const checkSession = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                await fetchVenueProfile()
            }
        } catch (error) {
            console.error('Session check failed', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchVenueProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // First try to find venue by owner_id (the proper FK relationship)
            let { data: venueData, error } = await supabase
                .from('venues')
                .select('*')
                .eq('owner_id', user.id)
                .eq('claimed', true)
                .maybeSingle()

            // Fallback: if no venue found by owner_id, try contact_email (legacy)
            if (!venueData && user.email) {
                const fallback = await supabase
                    .from('venues')
                    .select('*')
                    .eq('contact_email', user.email)
                    .eq('claimed', true)
                    .maybeSingle()

                venueData = fallback.data
                error = fallback.error
            }

            if (error) {
                console.error('Error fetching venue:', error)
                return
            }

            if (venueData) {
                setVenue(venueData)
            }
        } catch (error) {
            console.error('Error fetching venue profile', error)
        }
    }

    const login = async (email: string, pincode: string) => {
        setLoading(true)
        // Login with Magic Link (OTP) is better, but task says 'email + 4-digit password' was the legacy claim.
        // We are moving to REAL auth.
        // For this slice, we will USE PINCODE as the password for Supabase Auth (SignInWithPassword)
        // assuming accounts were created that way.

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password: pincode // Using pincode as password for the prototype -> real transition
            })

            if (error) throw error

            // onAuthStateChange will handle the rest
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- error handling
        } catch (error: any) {
            console.error('Login failed', error)
            throw new Error(error.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    const logout = async () => {
        await supabase.auth.signOut()
        setVenue(null)
    }

    const refreshVenue = async () => {
        await fetchVenueProfile()
    }

    return (
        <OwnerContext.Provider value={{ venue, loading, login, logout, isAuthenticated: !!venue, refreshVenue }}>
            {children}
        </OwnerContext.Provider>
    )
}

export function useOwner() {
    const context = useContext(OwnerContext)
    if (context === undefined) {
        throw new Error('useOwner must be used within an OwnerProvider')
    }
    return context
}
