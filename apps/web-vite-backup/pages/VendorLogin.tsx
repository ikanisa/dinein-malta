/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserType } from '../types';
import { GlassCard } from '../components/GlassCard';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import Input from '../components/ui/Input';

const VendorLogin = () => {
    const navigate = useNavigate();
    const { signInWithEmail, role, user } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Redirect if already logged in as manager/admin
    React.useEffect(() => {
        if (user && (role === UserType.MANAGER || role === UserType.ADMIN)) {
            navigate('/manager/live', { replace: true });
        }
    }, [user, role, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signInWithEmail(email, password);
            // Auth context will update role, then useEffect will redirect
            toast.success('Logged in successfully');
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
            toast.error(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background relative flex flex-col px-6 overflow-hidden transition-colors duration-500">
            {/* Background Image with Gradient Overlay */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
            {/* The gradient fades from the background color (opaque) to transparent, blending the image */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none"></div>

            {/* Subtle animated glow */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="z-10 flex-1 flex flex-col justify-end pb-12 w-full max-w-md mx-auto animate-slide-up">

                {/* Brand Header */}
                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-highlight border border-border backdrop-blur-md mb-4 shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">Vendor Portal</span>
                    </div>
                    <h1 className="text-5xl font-bold text-foreground tracking-tighter mb-3 leading-[1.1]">
                        Run your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">venue smarter.</span>
                    </h1>
                    <p className="text-muted text-lg max-w-xs font-medium leading-relaxed">
                        Access your vendor dashboard. Contact admin to create an account.
                    </p>
                </div>

                {/* Action Card */}
                <GlassCard className="p-2 bg-glass border-glassBorder backdrop-blur-xl shadow-2xl">
                    <form onSubmit={handleLogin} className="p-4 space-y-4">
                        <div>
                            <Input
                                label="Email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="vendor@example.com"
                                variant="glass"
                                fullWidth
                            />
                        </div>
                        <div>
                            <Input
                                label="Password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                variant="glass"
                                fullWidth
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-red-500 text-xs text-center">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            loading={loading}
                            variant="gradient"
                            className="w-full py-4 font-bold"
                        >
                            Sign In
                        </Button>
                    </form>

                    {/* Features Mini-Grid */}
                    <div className="grid grid-cols-3 gap-2 mt-2 px-2 pb-2">
                        <FeatureItem icon="🔔" label="Live Orders" />
                        <FeatureItem icon="✨" label="Smart Menu" />
                        <FeatureItem icon="🏁" label="Tables" />
                    </div>
                </GlassCard>

                <button onClick={() => navigate('/')} className="mt-8 text-center text-muted text-xs font-medium hover:text-foreground transition-colors">
                    Not a vendor? Open Customer App
                </button>
            </div>
        </div>
    );
};

const FeatureItem = ({ icon, label }: { icon: string, label: string }) => (
    <div className="bg-surface-highlight rounded-lg p-3 flex flex-col items-center justify-center text-center gap-1 border border-border hover:bg-secondary-500/10 dark:hover:bg-white/10 transition-colors">
        <span className="text-xl filter drop-shadow-md">{icon}</span>
        <span className="text-[10px] text-muted font-bold uppercase tracking-wider">{label}</span>
    </div>
);

export default VendorLogin;
