import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { getAdminUsers, getAuditLogs } from '../services/databaseService';
import { AdminUser, AuditLog } from '../types';

const AdminSystem = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [tab, setTab] = useState<'users' | 'logs'>('logs');

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

      <div className="flex p-1 bg-surface-highlight rounded-xl border border-border mb-6">
          <button onClick={() => setTab('logs')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${tab === 'logs' ? 'bg-foreground text-background shadow-md' : 'text-muted'}`}>Audit Logs</button>
          <button onClick={() => setTab('users')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${tab === 'users' ? 'bg-foreground text-background shadow-md' : 'text-muted'}`}>Admin Users</button>
      </div>

      {tab === 'users' && (
          <div className="space-y-3">
              <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl mb-4">
                  <h3 className="text-sm font-bold text-blue-500">Allowlist Enforced</h3>
                  <p className="text-xs text-blue-500/70 mt-1">Only emails listed below can access this portal.</p>
              </div>
              {admins.map(admin => (
                  <GlassCard key={admin.id} className="flex justify-between items-center">
                      <div>
                          <div className="font-bold text-foreground">{admin.email}</div>
                          <div className="text-xs text-muted capitalize">{admin.role}</div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${admin.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                  </GlassCard>
              ))}
          </div>
      )}

      {tab === 'logs' && (
          <div className="space-y-2">
              {logs.map(log => (
                  <div key={log.id} className="bg-surface-highlight border border-border p-3 rounded-lg text-xs">
                      <div className="flex justify-between mb-1">
                          <span className="font-bold text-foreground">{log.action}</span>
                          <span className="text-muted">{new Date(log.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-muted font-mono">
                          {log.entityType} : {log.entityId}
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default AdminSystem;