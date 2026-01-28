/**
 * DraftEditor - Edit menu and promo drafts before submission
 * 
 * Venue manager can create, edit, and submit drafts for approval.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Input, Badge, Skeleton } from '@dinein/ui';
import { ArrowLeft, Save, Send, Trash2 } from 'lucide-react';
import { supabase } from '../shared/services/supabase';
import { useOwner } from '../context/OwnerContext';
import { useCategories } from '../hooks/useCategories';
import { toast } from 'sonner';

// =============================================================================
// TYPES
// =============================================================================

type DraftType = 'menu' | 'promo';

interface MenuDraft {
    id: string;
    venue_id: string;
    category_id: string | null;
    name: string;
    description: string | null;
    price: number;
    status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'published';
    rejection_reason?: string;
}

interface PromoDraft {
    id: string;
    venue_id: string;
    title: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    valid_from: string | null;
    valid_until: string | null;
    status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'published';
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function DraftEditor() {
    const { draftId, type } = useParams<{ draftId: string; type: DraftType }>();
    const navigate = useNavigate();
    const { venue, isAuthenticated } = useOwner();
    const { categories } = useCategories();
    const isNew = draftId === 'new';

    // Form state for menu draft
    const [menuForm, setMenuForm] = useState<Partial<MenuDraft>>({
        name: '',
        description: '',
        price: 0,
        category_id: null,
    });

    // Form state for promo draft
    const [promoForm, setPromoForm] = useState<Partial<PromoDraft>>({
        title: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 0,
        valid_from: null,
        valid_until: null,
    });

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<string>('draft');

    // Fetch existing draft
    useEffect(() => {
        if (isNew || !draftId || !venue) return;

        const fetchDraft = async () => {
            setLoading(true);
            try {
                const table = type === 'promo' ? 'promo_drafts' : 'menu_item_drafts';
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .eq('id', draftId)
                    .eq('venue_id', venue.id)
                    .single();

                if (error) throw error;

                if (type === 'promo') {
                    setPromoForm(data);
                } else {
                    setMenuForm(data);
                }
                setStatus(data.status);
            } catch {
                toast.error('Failed to load draft');
                navigate('/dashboard/menu');
            } finally {
                setLoading(false);
            }
        };

        fetchDraft();
    }, [draftId, type, venue, isNew, navigate]);

    const handleSave = async () => {
        if (!venue || !isAuthenticated) return;
        setSaving(true);

        try {
            const table = type === 'promo' ? 'promo_drafts' : 'menu_item_drafts';
            const formData = type === 'promo' ? promoForm : menuForm;

            if (isNew) {
                const { error } = await supabase.from(table).insert({
                    ...formData,
                    venue_id: venue.id,
                    status: 'draft',
                });
                if (error) throw error;
                toast.success('Draft created');
            } else {
                const { error } = await supabase
                    .from(table)
                    .update(formData)
                    .eq('id', draftId);
                if (error) throw error;
                toast.success('Draft saved');
            }

            navigate('/dashboard/menu');
        } catch (err) {
            toast.error('Failed to save draft');
        } finally {
            setSaving(false);
        }
    };

    const handleSubmitForApproval = async () => {
        if (!venue || !draftId || isNew) return;
        setSaving(true);

        try {
            const table = type === 'promo' ? 'promo_drafts' : 'menu_item_drafts';
            const entityType = type === 'promo' ? 'promo_draft' : 'menu_item_draft';
            const requestType = type === 'promo' ? 'promo_publish' : 'menu_publish';

            // Update draft status
            const { error: draftError } = await supabase
                .from(table)
                .update({ status: 'pending_approval' })
                .eq('id', draftId);

            if (draftError) throw draftError;

            // Create approval request
            const { data: { user } } = await supabase.auth.getUser();
            const { error: requestError } = await supabase
                .from('approval_requests')
                .insert({
                    request_type: requestType,
                    entity_type: entityType,
                    entity_id: draftId,
                    venue_id: venue.id,
                    requested_by: user?.id,
                    notes: `Publish ${type === 'promo' ? promoForm.title : menuForm.name}`,
                    priority: 'normal',
                    status: 'pending',
                });

            if (requestError) {
                // Rollback
                await supabase.from(table).update({ status: 'draft' }).eq('id', draftId);
                throw requestError;
            }

            toast.success('Submitted for approval');
            navigate('/dashboard/approvals');
        } catch {
            toast.error('Failed to submit');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!draftId || isNew) return;

        try {
            const table = type === 'promo' ? 'promo_drafts' : 'menu_item_drafts';
            const { error } = await supabase.from(table).delete().eq('id', draftId);
            if (error) throw error;
            toast.success('Draft deleted');
            navigate('/dashboard/menu');
        } catch {
            toast.error('Failed to delete');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <Skeleton className="h-10 w-48" />
                <Card className="p-6 space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-32" />
                </Card>
            </div>
        );
    }

    const statusColors: Record<string, string> = {
        draft: 'bg-slate-500/10 text-slate-500',
        pending_approval: 'bg-orange-500/10 text-orange-500',
        approved: 'bg-green-500/10 text-green-500',
        rejected: 'bg-red-500/10 text-red-500',
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/menu')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {isNew ? 'New' : 'Edit'} {type === 'promo' ? 'Promo' : 'Menu'} Draft
                        </h1>
                        {!isNew && (
                            <Badge className={statusColors[status] || ''}>
                                {status.replace('_', ' ')}
                            </Badge>
                        )}
                    </div>
                </div>
                {!isNew && status === 'draft' && (
                    <Button variant="ghost" size="sm" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                )}
            </div>

            {/* Form */}
            <Card className="p-6 space-y-4">
                {type === 'promo' ? (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input
                                value={promoForm.title || ''}
                                onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                                placeholder="Summer Special"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Input
                                value={promoForm.description || ''}
                                onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                                placeholder="Get 20% off all drinks"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Discount Type</label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border bg-background"
                                    value={promoForm.discount_type}
                                    onChange={(e) => setPromoForm({ ...promoForm, discount_type: e.target.value as 'percentage' | 'fixed' })}
                                >
                                    <option value="percentage">Percentage</option>
                                    <option value="fixed">Fixed Amount</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    {promoForm.discount_type === 'percentage' ? 'Percentage (%)' : 'Amount'}
                                </label>
                                <Input
                                    type="number"
                                    value={promoForm.discount_value || 0}
                                    onChange={(e) => setPromoForm({ ...promoForm, discount_value: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input
                                value={menuForm.name || ''}
                                onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                                placeholder="Grilled Chicken"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Input
                                value={menuForm.description || ''}
                                onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                                placeholder="Tender grilled chicken breast..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border bg-background"
                                    value={menuForm.category_id || ''}
                                    onChange={(e) => setMenuForm({ ...menuForm, category_id: e.target.value || null })}
                                >
                                    <option value="">Uncategorized</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Price</label>
                                <Input
                                    type="number"
                                    value={menuForm.price || 0}
                                    onChange={(e) => setMenuForm({ ...menuForm, price: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                    </>
                )}
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
                <Button onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Draft'}
                </Button>
                {!isNew && status === 'draft' && (
                    <Button variant="outline" onClick={handleSubmitForApproval} disabled={saving}>
                        <Send className="h-4 w-4 mr-2" />
                        Submit for Approval
                    </Button>
                )}
            </div>
        </div>
    );
}
