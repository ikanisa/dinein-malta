import { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Tabs, TabPanel } from '../components/ui';
import { getAdminUsers, getAuditLogs } from '../services/databaseService';
import { AdminUser, AuditLog } from '../types';

const TABS = [
    { id: 'logs', label: 'Audit Logs' },
    { id: 'users', label: 'Admin Users' },
];

const AdminSystem = () => {
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [tab, setTab] = useState('logs');

    useEffect(() => {
        getAdminUsers().then(setAdmins);
        getAuditLogs().then(setLogs);
    }, []);

    return (
        <div className="p-6 pb-24 space-y-6 animate-fade-in pt-safe-top">
            <header>
                <h1 className="text-3xl font-bold text-foreground">System</h1>
                <p className="text-muted text-sm">Security & Logs</p>
            </header>

            <Tabs
                tabs={TABS}
                activeTab={tab}
                onChange={setTab}
                variant="default"
                className="mb-6"
            />

            <TabPanel tabId="users" activeTab={tab}>
                <div className="space-y-3">
                    <GlassCard className="bg-secondary-500/10 border border-secondary-500/30">
                        <h3 className="text-sm font-bold text-secondary-600">Allowlist Enforced</h3>
                        <p className="text-xs text-secondary-600/80 mt-1">
                            Only emails listed below can access this portal.
                        </p>
                    </GlassCard>
                    {admins.map(admin => (
                        <GlassCard key={admin.id} className="flex justify-between items-center">
                            <div>
                                <div className="font-bold text-foreground">{admin.email}</div>
                                <div className="text-xs text-muted capitalize">{admin.role}</div>
                            </div>
                            <div className={`w-3 h-3 rounded-full ${admin.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                        </GlassCard>
                    ))}
                    {admins.length === 0 && (
                        <div className="text-center text-muted py-10">
                            <span className="text-4xl block mb-3">👤</span>
                            No admin users found.
                        </div>
                    )}
                </div>
            </TabPanel>

            <TabPanel tabId="logs" activeTab={tab}>
                <div className="space-y-2">
                    {logs.map(log => (
                        <GlassCard key={log.id} variant="inset" className="p-3">
                            <div className="flex justify-between mb-1">
                                <span className="font-bold text-sm text-foreground">{log.action}</span>
                                <span className="text-xs text-muted">
                                    {new Date(log.createdAt).toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="text-xs text-muted font-mono">
                                {log.entityType} : {log.entityId}
                            </div>
                        </GlassCard>
                    ))}
                    {logs.length === 0 && (
                        <div className="text-center text-muted py-10">
                            <span className="text-4xl block mb-3">📋</span>
                            No audit logs recorded.
                        </div>
                    )}
                </div>
            </TabPanel>
        </div>
    );
};

export default AdminSystem;

