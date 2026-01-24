import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Using fallback.')
}

// Robust client creation that doesn't crash the app if env vars are missing
export const supabase: SupabaseClient = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {
        // Mock limited API to prevent immediate crash - logs error on use
        from: () => ({
            select: () => ({
                eq: () => ({
                    eq: () => ({
                        order: () => ({ data: null, error: new Error('Supabase not configured') }),
                        data: null,
                        error: new Error('Supabase not configured')
                    }),
                    order: () => ({ data: null, error: new Error('Supabase not configured') }),
                    single: () => ({ data: null, error: new Error('Supabase not configured') }),
                    data: null,
                    error: new Error('Supabase not configured')
                }),
                order: () => ({ data: null, error: new Error('Supabase not configured') }),
                data: null,
                error: new Error('Supabase not configured')
            }),
            insert: () => ({ select: () => ({ single: () => ({ data: null, error: new Error('Supabase not configured') }) }), error: new Error('Supabase not configured') }),
            update: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: null, error: new Error('Supabase not configured') }) }) }) }),
        }),
        auth: { getSession: async () => ({ data: { session: null } }) },
        rpc: async () => ({ data: null, error: new Error('Supabase not configured') }),
        functions: { invoke: async () => ({ data: null, error: new Error('Supabase not configured') }) },
    } as unknown as SupabaseClient;
