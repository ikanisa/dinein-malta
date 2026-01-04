'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { requireAdmin } from '../../../lib/auth';

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  actor: string;
  created_at: string;
}

export default function AdminSystem() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'logs' | 'admins'>('logs');

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (tab === 'logs' && !loading) {
      loadLogs();
    }
  }, [tab, loading]);

  const checkAuth = async () => {
    try {
      const isAdmin = await requireAdmin();
      if (!isAdmin) {
        router.push('/login');
        return;
      }
      setLoading(false);
      if (tab === 'logs') {
        loadLogs();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    }
  };

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('id, action, entity_type, actor, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header>
          <h1 className="text-4xl font-bold text-white mb-2">System</h1>
          <p className="text-gray-400">Security & Logs</p>
        </header>

        <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 mb-6">
          <button
            onClick={() => setTab('logs')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
              tab === 'logs' ? 'bg-white/10 text-white' : 'text-gray-400'
            }`}
          >
            Audit Logs
          </button>
          <button
            onClick={() => setTab('admins')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
              tab === 'admins' ? 'bg-white/10 text-white' : 'text-gray-400'
            }`}
          >
            Admin Users
          </button>
        </div>

        {tab === 'logs' && (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-white mb-1">{log.action}</div>
                    <div className="text-gray-400 text-sm">{log.entity_type}</div>
                    <div className="text-gray-500 text-xs mt-1">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-gray-400 text-xs">{log.actor?.substring(0, 8)}...</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'admins' && (
          <div className="text-center text-gray-400 py-12">
            Admin users management coming soon
          </div>
        )}
      </div>
    </div>
  );
}


