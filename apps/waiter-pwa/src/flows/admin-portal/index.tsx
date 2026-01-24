import { useState } from 'react';
import { AdminDashboard } from './AdminDashboard';
import { VendorManagement } from './VendorManagement';
import { UserManagement } from './UserManagement';
import { SystemSettings } from './SystemSettings';
import { AdminNav } from './AdminNav';
import { useAdminGuard } from '@/hooks/useAdminGuard';

export type AdminTab = 'dashboard' | 'vendors' | 'users' | 'settings';

export default function AdminPortalFlow() {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const { isAuthorized } = useAdminGuard();

    const renderScreen = () => {
        switch (activeTab) {
            case 'dashboard':
                return <AdminDashboard />;
            case 'vendors':
                return <VendorManagement />;
            case 'users':
                return <UserManagement />;
            case 'settings':
                return <SystemSettings />;
            default:
                return <AdminDashboard />;
        }
    };

    if (isAuthorized === null) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
    }

    if (isAuthorized === false) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">🔒</span>
                </div>
                <h1 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h1>
                <p className="text-slate-500 mb-6 text-sm">You do not have permission to view this area.</p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform"
                >
                    Go Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {renderScreen()}
            <AdminNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
}
