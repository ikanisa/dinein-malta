import { LayoutDashboard, Store, Users, Settings } from 'lucide-react';
import type { AdminTab } from './index';

interface AdminNavProps {
    activeTab: AdminTab;
    onTabChange: (tab: AdminTab) => void;
}

const tabs = [
    { id: 'dashboard' as AdminTab, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'vendors' as AdminTab, icon: Store, label: 'Vendors' },
    { id: 'users' as AdminTab, icon: Users, label: 'Users' },
    { id: 'settings' as AdminTab, icon: Settings, label: 'Settings' },
];

export function AdminNav({ activeTab, onTabChange }: AdminNavProps) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700 z-50 safe-area-bottom">
            <div className="flex justify-around items-center py-2 px-2">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className="flex flex-col items-center gap-0.5 px-4 py-2 transition-colors"
                        >
                            <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-purple-500/20' : ''}`}>
                                <Icon
                                    className={`w-5 h-5 transition-colors ${isActive ? 'text-purple-400' : 'text-slate-500'}`}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                            </div>
                            <span className={`text-[10px] font-medium ${isActive ? 'text-purple-400' : 'text-slate-500'}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
