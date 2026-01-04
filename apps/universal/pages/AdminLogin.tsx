import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { checkIsAdmin } from '../services/databaseService';
import { Spinner } from '../components/Loading';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. Check Allowlist (Server side in real app)
    const allowed = await checkIsAdmin(email);
    
    if (allowed) {
        // In a real app, we would trigger Supabase Auth Magic Link here
        // await supabase.auth.signInWithOtp({ email });
        // For demo, we just let them in
        setTimeout(() => {
            navigate('/admin-dashboard');
        }, 1000);
    } else {
        setError('Access Denied: This email is not on the admin allowlist.');
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-6 relative overflow-hidden transition-colors">
        {/* Security Background */}
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-red-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="z-10 w-full max-w-md mx-auto space-y-8 animate-slide-up">
            <div className="text-center">
                <div className="inline-block p-4 rounded-full bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 mb-6 backdrop-blur-md">
                    <span className="text-4xl">🛡️</span>
                </div>
                <h1 className="text-4xl font-bold text-foreground mb-2 tracking-tight">Admin Portal</h1>
                <p className="text-muted">Restricted access for authorized personnel only.</p>
            </div>

            <GlassCard className="space-y-6 p-8 border-red-500/20 bg-glass shadow-xl">
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-xs text-muted uppercase font-bold tracking-wider">Admin Email</label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-surface-highlight border border-border rounded-xl p-4 mt-2 focus:outline-none focus:border-red-500 text-foreground transition-all"
                            placeholder="admin@dinein.mt"
                        />
                    </div>
                    
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-red-500 text-xs text-center">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
                    >
                        {loading ? <Spinner className="w-4 h-4" /> : 'Request Access'}
                    </button>
                </form>
            </GlassCard>

            <button onClick={() => navigate('/')} className="w-full text-center text-muted text-xs hover:text-foreground transition-colors">
                Return to public site
            </button>
        </div>
    </div>
  );
};

export default AdminLogin;