/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Spinner } from '../components/Loading';
import { ErrorState } from '../components/common/ErrorState';
import { supabase } from '../services/supabase';
import { toast } from 'react-hot-toast';
import Input from '../components/ui/Input';

interface AdminData {
  id: string;
  auth_user_id: string;
  email: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

const AdminUsers = () => {
  const [admins, setAdmins] = useState<AdminData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase.functions.invoke('admin_user_management', {
        body: { action: 'list_admins' }
      });
      if (fetchError) throw fetchError;
      setAdmins(data.admins || []);
    } catch (err) {
      console.error('Failed to load admins:', err);
      setError(err instanceof Error ? err : new Error('Failed to load admins'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (admin: AdminData) => {
    const newStatus = !admin.is_active;
    if (!window.confirm(`Are you sure you want to ${newStatus ? 'ACTIVATE' : 'DEACTIVATE'} this admin?`)) return;

    setProcessing(admin.id);
    try {
      const { error: updateError } = await supabase.functions.invoke('admin_user_management', {
        body: { action: 'toggle_admin_status', admin_id: admin.id, is_active: newStatus }
      });
      if (updateError) throw updateError;
      toast.success(`Admin ${newStatus ? 'activated' : 'deactivated'}`);
      await loadData();
    } catch (err) {
      toast.error('Failed to update admin status');
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Email and Password are required');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      const { error: createError } = await supabase.functions.invoke('admin_user_management', {
        body: { action: 'create_admin', email, password }
      });
      if (createError) throw createError;
      toast.success('Admin created successfully');
      setShowAddModal(false);
      setEmail('');
      setPassword('');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create admin');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 pb-24 space-y-6 animate-fade-in pt-safe-top">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Users</h1>
          <p className="text-muted text-sm">Manage administrator access</p>
        </div>
        <button
          onClick={() => { setEmail(''); setPassword(''); setShowAddModal(true); }}
          className="px-4 py-2 bg-primary-500 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
        >
          + Add Admin
        </button>
      </header>

      <div className="space-y-4">
        {/* Error State */}
        {error && (
          <ErrorState
            error={error}
            onRetry={loadData}
            className="py-10"
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-10">
            <Spinner className="w-8 h-8" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && admins.length === 0 && (
          <div className="text-center text-muted py-10 animate-fade-in">
            <span className="text-4xl block mb-3">👤</span>
            No admins found. Click &ldquo;Add Admin&rdquo; to get started.
          </div>
        )}

        {/* Admin List */}
        {!isLoading && admins.map(admin => (
          <GlassCard key={admin.id} className="flex justify-between items-center animate-slide-up-fade">
            <div className="flex-1 min-w-0">
              <div className="font-bold text-foreground">{admin.email || 'No email'}</div>
              <div className="flex gap-2 mt-1 flex-wrap items-center">
                <span className="text-xs text-muted bg-surface-highlight px-2 py-0.5 rounded uppercase">
                  {admin.role}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${admin.is_active
                  ? 'bg-green-500/20 text-green-500'
                  : 'bg-red-500/20 text-red-500'
                  }`}>
                  {admin.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleToggleStatus(admin)}
              disabled={!!processing}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 ${admin.is_active
                ? 'bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30'
                : 'bg-green-500/20 text-green-500 border border-green-500/30 hover:bg-green-500/30'
                }`}
            >
              {processing === admin.id ? <Spinner className="w-4 h-4" /> : (admin.is_active ? 'Deactivate' : 'Activate')}
            </button>
          </GlassCard>
        ))}
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <GlassCard className="w-full max-w-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Add New Admin</h2>
              <button onClick={() => setShowAddModal(false)} aria-label="Close modal" className="text-muted hover:text-foreground text-2xl">×</button>
            </div>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <Input
                label="Email *"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                fullWidth
                variant="glass"
                placeholder="admin@example.com"
              />
              <Input
                label="Password *"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                fullWidth
                variant="glass"
                placeholder="Min 6 characters"
              />

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-surface-highlight text-foreground font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 bg-primary-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                  {submitting ? <Spinner className="w-4 h-4" /> : 'Create Admin'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;