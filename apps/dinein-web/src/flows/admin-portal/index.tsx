import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminDashboard } from './AdminDashboard';
import { VendorManagement } from './VendorManagement';
import { UserManagement } from './UserManagement';
import { SystemSettings } from './SystemSettings';
import WorkflowDashboard from './WorkflowDashboard';
import { useAdminGuard } from '@/hooks/useAdminGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export type AdminTab = 'dashboard' | 'vendors' | 'users' | 'settings' | 'roadmap';

export default function AdminPortalFlow() {
    const { isAuthorized } = useAdminGuard();

    if (isAuthorized === null) {
        return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400">Loading...</div>;
    }

    if (isAuthorized === false) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">🔒</span>
                </div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">You do not have permission to view this area.</p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform"
                >
                    Go Home
                </button>
            </div>
        );
    }

    return (
        <Routes>
            <Route element={<DashboardLayout type="admin" userName="System Admin" onLogout={() => window.location.href = '/'} />}>
                <Route index element={<AdminDashboard />} />
                <Route path="vendors" element={<VendorManagement />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="settings" element={<SystemSettings />} />
                <Route path="roadmap" element={<WorkflowDashboard />} />
                <Route path="*" element={<Navigate to="." replace />} />
            </Route>
        </Routes>
    );
}
