import { useState, useEffect } from 'react';
import { ChevronRight, Store, MapPin, Phone, Globe, LogOut, Shield, Loader2, Save } from 'lucide-react';
import { useVendorProfile } from '../../hooks/useVendorProfile';
import { useToast } from '../../components/Toast';
import { supabase } from '../../shared/services/supabase';

export function VendorSettings() {
    const { profile, loading, saving, error, updateProfile } = useVendorProfile();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        website: ''
    });
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (profile) {
            // eslint-disable-next-line
            setFormData({
                name: profile.name || '',
                phone: profile.phone || '',
                address: profile.address || '',
                website: profile.website || ''
            });
        }
    }, [profile]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const handleSave = async () => {
        try {
            await updateProfile({
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
                website: formData.website
            });
            setIsDirty(false);
            showToast('Settings saved successfully', 'success');
        } catch {
            showToast('Failed to save settings', 'error');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-orange-50/30">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-orange-50/30 pb-28 animate-fade-in">
            {/* Header */}
            <div className="header-gradient px-6 pt-safe pb-16 rounded-b-[2.5rem] shadow-lg">
                <h1 className="text-2xl font-bold text-white mb-6 mt-2">Settings</h1>

                {/* Vendor Card */}
                <div className="glass-card p-4 flex items-center gap-4 -mb-20 relative z-10 shadow-lg">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-rose-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg shadow-orange-500/20">
                        🍽️
                    </div>
                    <div className="flex-1">
                        <h2 className="font-bold text-lg text-slate-900 line-clamp-1">{profile?.name || 'Loading...'}</h2>
                        <p className={`text-sm inline-flex items-center gap-1.5 ${profile?.status === 'active' ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                            {profile?.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                            {profile?.status ? profile.status.toUpperCase() : 'Unknown Status'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-6 pt-16 space-y-6">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                        {error}
                    </div>
                )}

                {/* Business Info Form */}
                <div className="glass-card p-2 animate-fade-in-up">
                    <h3 className="font-bold text-slate-900 px-4 py-3 text-sm flex items-center gap-2">
                        <Store className="w-4 h-4 text-orange-500" />
                        Business Information
                    </h3>

                    <div className="space-y-4 p-2">
                        <div className="bg-white/50 rounded-2xl p-3 border border-slate-100 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 transition-all">
                            <label className="text-xs font-semibold text-slate-500 ml-1 mb-1 block">Restaurant Name</label>
                            <div className="flex items-center gap-3">
                                <Store className="w-5 h-5 text-orange-400 shrink-0" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className="w-full font-medium text-slate-900 bg-transparent outline-none placeholder:text-slate-300"
                                    placeholder="Enter name"
                                />
                            </div>
                        </div>

                        <div className="bg-white/50 rounded-2xl p-3 border border-slate-100 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 transition-all">
                            <label className="text-xs font-semibold text-slate-500 ml-1 mb-1 block">Address</label>
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-orange-400 shrink-0" />
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    className="w-full font-medium text-slate-900 bg-transparent outline-none placeholder:text-slate-300"
                                    placeholder="Enter address"
                                />
                            </div>
                        </div>

                        <div className="bg-white/50 rounded-2xl p-3 border border-slate-100 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 transition-all">
                            <label className="text-xs font-semibold text-slate-500 ml-1 mb-1 block">Phone</label>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-orange-400 shrink-0" />
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    className="w-full font-medium text-slate-900 bg-transparent outline-none placeholder:text-slate-300"
                                    placeholder="+250..."
                                />
                            </div>
                        </div>

                        <div className="bg-white/50 rounded-2xl p-3 border border-slate-100 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 transition-all">
                            <label className="text-xs font-semibold text-slate-500 ml-1 mb-1 block">Website</label>
                            <div className="flex items-center gap-3">
                                <Globe className="w-5 h-5 text-orange-400 shrink-0" />
                                <input
                                    type="text"
                                    value={formData.website}
                                    onChange={(e) => handleChange('website', e.target.value)}
                                    className="w-full font-medium text-slate-900 bg-transparent outline-none placeholder:text-slate-300"
                                    placeholder="website.com"
                                />
                            </div>
                        </div>
                    </div>

                    {isDirty && (
                        <div className="p-4 pt-2">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full flex items-center justify-center gap-2 py-4 btn-primary !rounded-2xl text-base shadow-lg shadow-orange-500/20"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Save Changes
                            </button>
                        </div>
                    )}
                </div>

                {/* Security */}
                <div className="glass-card overflow-hidden">
                    <h3 className="font-bold text-slate-900 px-6 py-4 text-sm bg-slate-50/50">
                        Security
                    </h3>
                    <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-orange-600" />
                            </div>
                            <span className="font-medium text-slate-900 text-sm">Change Password</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300" />
                    </button>
                </div>

                {/* Logout */}
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 rounded-2xl text-red-600 font-bold active:scale-[0.98] transition-transform border border-red-100"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>

                <p className="text-center text-xs text-slate-400 pt-2 pb-6">
                    DineIn Vendor v1.0.0
                </p>
            </div>
        </div>
    );
}
