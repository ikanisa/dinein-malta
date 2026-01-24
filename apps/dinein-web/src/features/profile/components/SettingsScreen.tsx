// Settings Screen Component
import { ChevronRight, User, Package, Heart, CreditCard, Bell, Moon, HelpCircle, LogOut, Globe, Shield } from 'lucide-react';
import { CountrySelector } from '@/shared/components/CountrySelector';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { supabase } from '@/shared/services/supabase';
import { useNavigate } from 'react-router-dom';

export function SettingsScreen() {
    const navigate = useNavigate();
    const [selectedCountry, setSelectedCountry] = useState(() => localStorage.getItem('dinein_country_code') || 'MT');
    const [user, setUser] = useState<{ name: string; email: string; initials: string; memberSince: string }>({
        name: 'Loading...',
        email: '',
        initials: '',
        memberSince: '',
    });

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                const email = session.user.email || '';
                const name = session.user.user_metadata?.full_name || email.split('@')[0];
                const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                const memberSince = new Date(session.user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                setUser({ name, email, initials, memberSince });
            }
        });
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const onCountryChange = (code: string) => {
        setSelectedCountry(code);
        localStorage.setItem('dinein_country_code', code);
        window.dispatchEvent(new Event('country-change'));
    };

    const accountItems = [
        { icon: User, label: 'Edit Profile', subtitle: 'Name, email, phone', action: () => { } },
        { icon: Package, label: 'Order History', subtitle: '12 orders', action: () => { } },
        { icon: Heart, label: 'Favorites', subtitle: '5 saved restaurants', action: () => { } },
        { icon: CreditCard, label: 'Payment Methods', subtitle: 'Add or manage cards', action: () => { } },
    ];

    const preferencesItems = [
        { icon: Bell, label: 'Notifications', subtitle: 'Push, email, SMS', action: () => { } },
        { icon: Moon, label: 'Appearance', subtitle: 'Light mode', action: () => { } },
        { icon: Globe, label: 'Language', subtitle: 'English', action: () => { } },
    ];

    const supportItems = [
        { icon: HelpCircle, label: 'Help & Support', action: () => { } },
        { icon: Shield, label: 'Privacy Policy', action: () => { } },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 pb-28 animate-fade-in text-slate-900">
            {/* Simple Header */}
            <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-indigo-100 px-5 pt-safe pb-4">
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            </div>

            <div className="px-5 pt-6 space-y-8">
                {/* Profile Card */}
                <GlassCard className="p-4 flex items-center gap-4 shadow-sm border border-indigo-100/50" gradient="indigo">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-indigo-600 text-xl font-bold shadow-sm">
                        {user.initials}
                    </div>
                    <div className="flex-1">
                        <h2 className="font-bold text-lg text-slate-900">{user.name}</h2>
                        <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="bg-white/50">
                        <ChevronRight className="w-5 h-5 text-indigo-400" />
                    </Button>
                </GlassCard>

                {/* Account Section */}
                <section>
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 ml-2">
                        Account
                    </h3>
                    <GlassCard className="overflow-hidden divide-y divide-indigo-50/50 p-0">
                        {accountItems.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={idx}
                                    onClick={item.action}
                                    className="w-full flex items-center justify-between p-4 hover:bg-indigo-50/30 active:bg-indigo-50/60 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                            <Icon className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <div className="text-left">
                                            <span className="font-medium text-slate-900 block">{item.label}</span>
                                            <span className="text-xs text-slate-500">{item.subtitle}</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300" />
                                </button>
                            );
                        })}
                    </GlassCard>
                </section>

                {/* Region Section */}
                <section>
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 ml-2">
                        Preferences
                    </h3>
                    <div className="mb-4">
                        <CountrySelector
                            value={selectedCountry}
                            onChange={onCountryChange}
                            variant="light"
                        />
                    </div>

                    <GlassCard className="overflow-hidden divide-y divide-indigo-50/50 p-0">
                        {preferencesItems.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={idx}
                                    onClick={item.action}
                                    className="w-full flex items-center justify-between p-4 hover:bg-indigo-50/30 active:bg-indigo-50/60 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                            <Icon className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <div className="text-left">
                                            <span className="font-medium text-slate-900 block">{item.label}</span>
                                            <span className="text-xs text-slate-500">{item.subtitle}</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300" />
                                </button>
                            );
                        })}
                    </GlassCard>
                </section>

                {/* Support Section */}
                <section>
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 ml-2">
                        Support
                    </h3>
                    <GlassCard className="overflow-hidden divide-y divide-indigo-50/50 p-0">
                        {supportItems.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={idx}
                                    onClick={item.action}
                                    className="w-full flex items-center justify-between p-4 hover:bg-indigo-50/30 active:bg-indigo-50/60 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                            <Icon className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <span className="font-medium text-slate-900">{item.label}</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300" />
                                </button>
                            );
                        })}
                    </GlassCard>
                </section>

                {/* Logout */}
                <Button variant="coral" className="w-full justify-center gap-2" size="lg" onClick={handleSignOut}>
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </Button>

                {/* App Info */}
                <div className="text-center pt-2 pb-4">
                    <p className="text-sm text-slate-400">DineIn v1.0.0</p>
                    <p className="text-xs text-slate-300 mt-1">Made with ❤️ for great dining</p>
                </div>
            </div>
        </div>
    );
}
