import { ChevronRight, Globe, Bell, Shield, Database, Mail, CreditCard, Palette, LogOut } from 'lucide-react';

export function SystemSettings() {
    const platformSettings = [
        { icon: Globe, label: 'Platform Name', value: 'DineIn Rwanda', action: () => { } },
        { icon: Palette, label: 'Branding', value: 'Custom theme', action: () => { } },
        { icon: Mail, label: 'Email Templates', value: '5 templates', action: () => { } },
        { icon: CreditCard, label: 'Payment Gateway', value: 'Stripe + MTN MoMo', action: () => { } },
    ];

    const notificationSettings = [
        { icon: Bell, label: 'Admin Alerts', value: 'Email + Push', action: () => { } },
        { icon: Bell, label: 'Vendor Notifications', value: 'All enabled', action: () => { } },
    ];

    const securitySettings = [
        { icon: Shield, label: 'Two-Factor Auth', value: 'Required for admins', action: () => { } },
        { icon: Database, label: 'Data Backup', value: 'Daily automatic', action: () => { } },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 pb-28 animate-fade-in">
            {/* Header */}
            <div className="px-6 pt-6 pb-6">
                <div>
                    <p className="text-slate-400 text-sm">Administration</p>
                    <h1 className="text-2xl font-bold text-white">Settings</h1>
                </div>
            </div>

            <div className="px-6 space-y-4">
                {/* Platform Settings */}
                <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                    <h3 className="font-semibold text-white px-4 py-3 bg-slate-700/50 text-sm">
                        Platform
                    </h3>
                    {platformSettings.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={idx}
                                onClick={item.action}
                                className="w-full flex items-center justify-between p-4 border-b border-slate-700 last:border-b-0 hover:bg-slate-700/50 active:bg-slate-700 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                        <Icon className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div className="text-left">
                                        <span className="font-medium text-white block text-sm">{item.label}</span>
                                        <span className="text-xs text-slate-400">{item.value}</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-500" />
                            </button>
                        );
                    })}
                </div>

                {/* Notification Settings */}
                <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                    <h3 className="font-semibold text-white px-4 py-3 bg-slate-700/50 text-sm">
                        Notifications
                    </h3>
                    {notificationSettings.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={idx}
                                onClick={item.action}
                                className="w-full flex items-center justify-between p-4 border-b border-slate-700 last:border-b-0 hover:bg-slate-700/50 active:bg-slate-700 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                        <Icon className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div className="text-left">
                                        <span className="font-medium text-white block text-sm">{item.label}</span>
                                        <span className="text-xs text-slate-400">{item.value}</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-500" />
                            </button>
                        );
                    })}
                </div>

                {/* Security Settings */}
                <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                    <h3 className="font-semibold text-white px-4 py-3 bg-slate-700/50 text-sm">
                        Security
                    </h3>
                    {securitySettings.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={idx}
                                onClick={item.action}
                                className="w-full flex items-center justify-between p-4 border-b border-slate-700 last:border-b-0 hover:bg-slate-700/50 active:bg-slate-700 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                        <Icon className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div className="text-left">
                                        <span className="font-medium text-white block text-sm">{item.label}</span>
                                        <span className="text-xs text-slate-400">{item.value}</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-500" />
                            </button>
                        );
                    })}
                </div>

                {/* Logout */}
                <button className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 font-medium active:scale-[0.98] transition-transform">
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>

                <p className="text-center text-xs text-slate-500 pt-2 pb-4">
                    DineIn Admin v1.0.0
                </p>
            </div>
        </div>
    );
}
