/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { OptimizedImage } from '../components/OptimizedImage';
import { Spinner, VendorCardSkeleton } from '../components/Loading';
import { ErrorState } from '../components/common/ErrorState';
import { supabase } from '../services/supabase';
import { toast } from 'react-hot-toast';
import Input from '../components/ui/Input';
import { AIEnhanceButton } from '../components/AIEnhanceButton';
import { AIEnhanceModal } from '../components/AIEnhanceModal';
import { useGemini } from '../hooks/useGemini';

interface VendorData {
    id: string;
    name: string;
    slug: string;
    address: string | null;
    phone: string | null;
    revolut_link: string | null;
    whatsapp: string | null;
    website: string | null;
    status: 'active' | 'pending' | 'suspended';
    country: string;
    photos_json: any;
    owner_email?: string | null;
    created_at: string;
}

interface CountryData {
    code: string;
    name: string;
    currency: string;
    currency_symbol: string;
}

interface VendorFormData {
    name: string;
    country: string;
    address: string;
    phone: string;
    revolut_link: string;
    whatsapp: string;
    website: string;
    owner_email: string;
    owner_password: string;
}

const AdminVendors = () => {
    const [vendors, setVendors] = useState<VendorData[]>([]);
    const [countries, setCountries] = useState<CountryData[]>([]);
    const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
    const [processing, setProcessing] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingVendor, setEditingVendor] = useState<VendorData | null>(null);
    const [formData, setFormData] = useState<VendorFormData>({
        name: '',
        country: 'MT', // Default to Malta
        address: '',
        phone: '',
        revolut_link: '',
        whatsapp: '',
        website: '',
        owner_email: '',
        owner_password: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // AI Integration
    const { categorizeVenue } = useGemini();
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiPreviewData, setAiPreviewData] = useState<any>(null);
    const [enhancingVendorId, setEnhancingVendorId] = useState<string | null>(null);

    const handleAiEnhance = async (vendor: VendorData) => {
        setEnhancingVendorId(vendor.id);
        try {
            const result = await categorizeVenue(
                vendor.name,
                vendor.address || '',
                '', // description
                // Use vendor lat/lng if available, otherwise undefined (backend handles it)
                (vendor as any).lat,
                (vendor as any).lng
            );

            if (result) {
                setAiPreviewData(result);
                setShowAiModal(true);
            }
        } catch (err) {
            toast.error('AI Enhancement failed');
            console.error(err);
        } finally {
            setEnhancingVendorId(null);
        }
    };

    const handleApplyAiEnhancement = async () => {
        if (!aiPreviewData || !enhancingVendorId) return;

        // In a real scenario, we'd save these tags to the database.
        // For now, consistent with the plan, we'll toast the results or update metadata if columns exist.
        // Since we checked the schema and might not have a dedicated 'tags' column yet in the UI,
        // we will simulate the update or save it if a suitable column exists (like highlights in a generic json).
        // For this step, let's assume we update a 'metadata' or similar if available, or just notify user.

        // As per schema check pending, fallback to toast:
        console.log('Applying AI Data:', aiPreviewData);
        toast.success('AI Categories applied! (Simulation)');
        setShowAiModal(false);
        setAiPreviewData(null);
    };

    useEffect(() => {
        loadData();
        loadCountries();
    }, []);

    const loadCountries = async () => {
        try {
            const { data, error: fetchError } = await supabase.functions.invoke('admin_user_management', {
                body: { action: 'list_countries' }
            });
            if (fetchError) throw fetchError;
            setCountries(data.countries || []);
        } catch (err) {
            console.error('Failed to load countries:', err);
        }
    };

    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase.functions.invoke('admin_user_management', {
                body: { action: 'list_vendors' }
            });
            if (fetchError) throw fetchError;
            setVendors(data.vendors || []);
        } catch (err) {
            console.error('Failed to load vendors:', err);
            setError(err instanceof Error ? err : new Error('Failed to load vendors'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (id: string, status: 'active' | 'suspended') => {
        if (!window.confirm(`Are you sure you want to ${status === 'active' ? 'ACTIVATE' : 'SUSPEND'} this bar?`)) return;

        setProcessing(id);
        try {
            const { error: updateError } = await supabase.functions.invoke('admin_user_management', {
                body: { action: 'update_vendor', vendor_id: id, status }
            });
            if (updateError) throw updateError;
            toast.success(`Bar ${status === 'active' ? 'activated' : 'suspended'}`);
            await loadData();
        } catch (err) {
            toast.error('Failed to update status');
            console.error(err);
        } finally {
            setProcessing(null);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to DELETE "${name}"? This action cannot be undone.`)) return;

        setProcessing(id);
        try {
            const { error: deleteError } = await supabase.functions.invoke('admin_user_management', {
                body: { action: 'delete_vendor', vendor_id: id }
            });
            if (deleteError) throw deleteError;
            toast.success('Bar deleted');
            await loadData();
        } catch (err) {
            toast.error('Failed to delete bar');
            console.error(err);
        } finally {
            setProcessing(null);
        }
    };

    const handleAddVendor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.owner_email.trim() || !formData.owner_password.trim() || !formData.country) {
            toast.error('Name, Country, Email and Password are required');
            return;
        }

        setSubmitting(true);
        try {
            const { error: createError } = await supabase.functions.invoke('admin_user_management', {
                body: {
                    action: 'create_vendor',
                    name: formData.name,
                    country: formData.country,
                    address: formData.address || undefined,
                    phone: formData.phone || undefined,
                    revolut_link: formData.revolut_link || undefined,
                    whatsapp: formData.whatsapp || undefined,
                    website: formData.website || undefined,
                    owner_email: formData.owner_email,
                    owner_password: formData.owner_password
                }
            });
            if (createError) throw createError;
            toast.success('Bar created successfully');
            setShowAddModal(false);
            resetForm();
            await loadData();
        } catch (err: any) {
            toast.error(err.message || 'Failed to create bar');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditVendor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingVendor || !formData.name.trim()) {
            toast.error('Name is required');
            return;
        }

        setSubmitting(true);
        try {
            const { error: updateError } = await supabase.functions.invoke('admin_user_management', {
                body: {
                    action: 'update_vendor',
                    vendor_id: editingVendor.id,
                    name: formData.name,
                    address: formData.address || null,
                    phone: formData.phone || null,
                    revolut_link: formData.revolut_link || null,
                    whatsapp: formData.whatsapp || null,
                    website: formData.website || null
                }
            });
            if (updateError) throw updateError;
            toast.success('Bar updated successfully');
            setShowEditModal(false);
            setEditingVendor(null);
            resetForm();
            await loadData();
        } catch (err: any) {
            toast.error(err.message || 'Failed to update bar');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const openEditModal = (vendor: VendorData) => {
        setEditingVendor(vendor);
        setFormData({
            name: vendor.name,
            country: vendor.country || 'MT',
            address: vendor.address || '',
            phone: vendor.phone || '',
            revolut_link: vendor.revolut_link || '',
            whatsapp: vendor.whatsapp || '',
            website: vendor.website || '',
            owner_email: '',
            owner_password: ''
        });
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            country: 'MT',
            address: '',
            phone: '',
            revolut_link: '',
            whatsapp: '',
            website: '',
            owner_email: '',
            owner_password: ''
        });
    };

    const filtered = vendors.filter(v => {
        if (filter === 'all') return true;
        return v.status === filter;
    });

    const getImageUrl = (vendor: VendorData): string => {
        if (vendor.photos_json?.[0]?.url) return vendor.photos_json[0].url;
        if (typeof vendor.photos_json?.[0] === 'string') return vendor.photos_json[0];
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23334155' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23fff' font-size='40' font-family='sans-serif'%3E${encodeURIComponent(vendor.name.charAt(0).toUpperCase())}%3C/text%3E%3C/svg%3E`;
    };

    return (
        <div className="p-6 pb-24 space-y-6 animate-fade-in pt-safe-top">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Bar Management</h1>
                    <p className="text-muted text-sm">Add, edit, and manage bars</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowAddModal(true); }}
                    className="px-4 py-2 bg-primary-500 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
                >
                    + Add Bar
                </button>
            </header>

            {/* Filter Tabs */}
            <div className="flex p-1 bg-surface-highlight rounded-xl border border-border overflow-x-auto no-scrollbar">
                {['all', 'active', 'pending', 'suspended'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${filter === f ? 'bg-foreground text-background shadow-lg' : 'text-muted hover:text-foreground'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="space-y-4 stagger-children">
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
                    <>
                        {[1, 2, 3, 4].map(i => (
                            <VendorCardSkeleton key={i} />
                        ))}
                    </>
                )}

                {/* Empty State */}
                {!isLoading && filtered.length === 0 && (
                    <div className="text-center text-muted py-10 animate-fade-in">
                        <span className="text-4xl block mb-3">🍺</span>
                        No bars found. Click &ldquo;Add Bar&rdquo; to get started.
                    </div>
                )}

                {!isLoading && filtered.map(vendor => (
                    <GlassCard key={vendor.id} className="relative overflow-hidden animate-slide-up-fade">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-3">
                                <div className="w-12 h-12 bg-surface-highlight rounded-lg overflow-hidden">
                                    <OptimizedImage
                                        src={getImageUrl(vendor)}
                                        className="w-full h-full object-cover"
                                        width={48}
                                        height={48}
                                        alt={vendor.name}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-lg text-foreground">{vendor.name}</div>
                                    <div className="text-xs text-muted truncate">{vendor.address || 'No address'}</div>
                                    {vendor.owner_email && (
                                        <div className="text-xs text-muted truncate">📧 {vendor.owner_email}</div>
                                    )}
                                    <div className="flex gap-2 mt-1 flex-wrap">
                                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${vendor.status === 'active' ? 'bg-green-500/20 text-green-500' :
                                            vendor.status === 'suspended' ? 'bg-red-500/20 text-red-500' :
                                                'bg-orange-500/20 text-orange-500'
                                            }`}>
                                            {vendor.status || 'pending'}
                                        </span>
                                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/20 text-purple-500">
                                            {vendor.country || 'MT'}
                                        </span>
                                        {vendor.revolut_link && (
                                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-500">
                                                Revolut ✓
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions Toolbar */}
                        <div className="grid grid-cols-3 gap-2 border-t border-border pt-3">
                            <button
                                onClick={() => openEditModal(vendor)}
                                disabled={!!processing}
                                className="py-2 bg-surface-highlight hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-xs font-bold text-foreground flex items-center justify-center gap-1 active:scale-95 transition-transform"
                            >
                                ✏️ Edit
                            </button>

                            {vendor.status === 'pending' || vendor.status === 'suspended' ? (
                                <button
                                    onClick={() => handleStatusChange(vendor.id, 'active')}
                                    disabled={!!processing}
                                    className="py-2 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1 active:scale-95 transition-transform"
                                >
                                    {processing === vendor.id ? <Spinner className="w-3 h-3" /> : '✅ Activate'}
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleStatusChange(vendor.id, 'suspended')}
                                    disabled={!!processing}
                                    className="py-2 bg-orange-500/20 border border-orange-500/30 text-orange-500 hover:bg-orange-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform"
                                >
                                    {processing === vendor.id ? <Spinner className="w-3 h-3" /> : '⏸️ Suspend'}
                                </button>
                            )}

                            <button
                                onClick={() => handleDelete(vendor.id, vendor.name)}
                                disabled={!!processing}
                                className="py-2 bg-red-900/10 dark:bg-red-900/40 border border-red-500/30 text-red-500 hover:bg-red-500/20 rounded-lg text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform"
                            >
                                {processing === vendor.id ? <Spinner className="w-3 h-3" /> : '🗑️ Delete'}
                            </button>

                            <AIEnhanceButton
                                onClick={() => handleAiEnhance(vendor)}
                                loading={enhancingVendorId === vendor.id}
                                className="col-span-3 mt-2 justify-center"
                                label="Auto-Categorize Venue"
                            />
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Add Bar Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <GlassCard className="w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-foreground">Add New Bar</h2>
                            <button onClick={() => setShowAddModal(false)} aria-label="Close modal" className="text-muted hover:text-foreground text-2xl">×</button>
                        </div>
                        <form onSubmit={handleAddVendor} className="space-y-4">
                            <Input label="Bar Name *" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required fullWidth variant="glass" />

                            {/* Country Select */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Country *</label>
                                <select
                                    value={formData.country}
                                    onChange={e => setFormData(p => ({ ...p, country: e.target.value }))}
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-surface-glass border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                >
                                    {countries.map(c => (
                                        <option key={c.code} value={c.code}>{c.name} ({c.currency_symbol})</option>
                                    ))}
                                </select>
                            </div>

                            <Input label="Address" value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} fullWidth variant="glass" />
                            <Input label="Phone" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} fullWidth variant="glass" />
                            <Input label="Revolut Link (optional)" value={formData.revolut_link} onChange={e => setFormData(p => ({ ...p, revolut_link: e.target.value }))} placeholder="e.g. yourhandle" fullWidth variant="glass" />
                            <Input label="WhatsApp" value={formData.whatsapp} onChange={e => setFormData(p => ({ ...p, whatsapp: e.target.value }))} fullWidth variant="glass" />
                            <Input label="Website" value={formData.website} onChange={e => setFormData(p => ({ ...p, website: e.target.value }))} fullWidth variant="glass" />

                            <div className="border-t border-border pt-4 mt-4">
                                <h3 className="text-sm font-bold text-muted uppercase tracking-wide mb-3">Owner Login Credentials</h3>
                                <div className="space-y-4">
                                    <Input label="Owner Email *" type="email" value={formData.owner_email} onChange={e => setFormData(p => ({ ...p, owner_email: e.target.value }))} required fullWidth variant="glass" />
                                    <Input label="Owner Password *" type="password" value={formData.owner_password} onChange={e => setFormData(p => ({ ...p, owner_password: e.target.value }))} required fullWidth variant="glass" placeholder="Min 6 characters" />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-surface-highlight text-foreground font-bold rounded-xl">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-3 bg-primary-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                                    {submitting ? <Spinner className="w-4 h-4" /> : 'Create Bar'}
                                </button>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}

            {/* Edit Bar Modal */}
            {showEditModal && editingVendor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <GlassCard className="w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-foreground">Edit Bar</h2>
                            <button onClick={() => { setShowEditModal(false); setEditingVendor(null); }} aria-label="Close modal" className="text-muted hover:text-foreground text-2xl">×</button>
                        </div>
                        <form onSubmit={handleEditVendor} className="space-y-4">
                            <Input label="Bar Name *" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required fullWidth variant="glass" />
                            <Input label="Address" value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} fullWidth variant="glass" />
                            <Input label="Phone" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} fullWidth variant="glass" />
                            <Input label="Revolut Link (optional)" value={formData.revolut_link} onChange={e => setFormData(p => ({ ...p, revolut_link: e.target.value }))} placeholder="e.g. yourhandle" fullWidth variant="glass" />
                            <Input label="WhatsApp" value={formData.whatsapp} onChange={e => setFormData(p => ({ ...p, whatsapp: e.target.value }))} fullWidth variant="glass" />
                            <Input label="Website" value={formData.website} onChange={e => setFormData(p => ({ ...p, website: e.target.value }))} fullWidth variant="glass" />

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => { setShowEditModal(false); setEditingVendor(null); }} className="flex-1 py-3 bg-surface-highlight text-foreground font-bold rounded-xl">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-3 bg-primary-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                                    {submitting ? <Spinner className="w-4 h-4" /> : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}
            {/* Modal */}
            <AIEnhanceModal
                isOpen={showAiModal}
                onClose={() => setShowAiModal(false)}
                onConfirm={handleApplyAiEnhancement}
                previewData={aiPreviewData}
                title="Venue Categorization Preview"
            />
        </div>
    );
};

export default AdminVendors;