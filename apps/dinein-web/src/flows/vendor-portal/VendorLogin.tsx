import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/shared/services/supabase';

interface VendorLoginProps {
    onLogin: () => void;
    onBack: () => void;
}

export function VendorLogin({ onLogin, onBack }: VendorLoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Success
            onLogin();
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 animate-fade-in">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4 animate-bounce-once">🍽️</div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Vendor Login</h1>
                    <p className="text-slate-600">Access your restaurant dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl font-medium border border-red-100 animate-fade-in">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-900">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="vendor@restaurant.com"
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-900">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
                            <span className="text-slate-600 font-medium">Remember me</span>
                        </label>
                        <button type="button" className="text-indigo-600 font-bold hover:text-indigo-700">
                            Forgot password?
                        </button>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 text-base bg-gradient-to-br from-indigo-600 to-purple-600 hover:shadow-indigo-500/30 disabled:opacity-70"
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={onBack}
                        className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        ← Back to Client App
                    </button>
                </div>
            </div>
        </div>
    );
}
