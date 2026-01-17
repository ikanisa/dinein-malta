/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { signInWithOAuth, role, user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in as admin
  React.useEffect(() => {
    if (user && role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, role, navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithOAuth('google');
      // OAuth will redirect, so we don't need to navigate here
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
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
          <div className="space-y-4">
            <p className="text-sm text-muted text-center">
              Admin access requires Google OAuth authentication. Only authorized administrators can access this portal.
            </p>

            <Button
              onClick={handleGoogleLogin}
              loading={loading}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 font-bold shadow-lg shadow-red-500/20 hover:shadow-red-500/40 gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </Button>
          </div>
        </GlassCard>

        <button onClick={() => navigate('/')} className="w-full text-center text-muted text-xs hover:text-foreground transition-colors">
          Return to public site
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;