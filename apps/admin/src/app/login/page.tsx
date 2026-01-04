'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkIsAdmin = async (userId: string): Promise<boolean> => {
    // Check if the authenticated user exists in admin_users table
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, is_active')
      .eq('auth_user_id', userId)
      .eq('is_active', true)
      .single();
    
    return !error && !!data;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Step 1: Authenticate with Supabase Auth using email/password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (authError) {
        setError(authError.message || 'Invalid email or password');
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError('Authentication failed. Please try again.');
        setLoading(false);
        return;
      }

      // Step 2: Check if the authenticated user is an admin
      const isAdmin = await checkIsAdmin(authData.user.id);
      
      if (!isAdmin) {
        // Sign out the user if they're not an admin
        await supabase.auth.signOut();
        setError('Access Denied: This email is not on the admin allowlist.');
        setLoading(false);
        return;
      }

      // Step 3: Success - redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center px-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-red-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="z-10 w-full max-w-md mx-auto space-y-8">
        <div className="text-center">
          <div className="inline-block p-4 rounded-full bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 mb-6 backdrop-blur-md">
            <span className="text-4xl">🛡️</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Admin Portal</h1>
          <p className="text-gray-400">Restricted access for authorized personnel only.</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 space-y-6 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Admin Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 mt-2 focus:outline-none focus:border-red-500 text-white transition-all placeholder-gray-500"
                placeholder="admin@dinein.mt"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 mt-2 focus:outline-none focus:border-red-500 text-white transition-all placeholder-gray-500"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-red-400 text-xs text-center">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

