import { useEffect, useState } from 'react';
import { supabase } from '../shared/services/supabase';

export interface VendorProfile {
    id: string;
    name: string;
    phone: string | null;
    address: string | null;
    website: string | null;
    status: 'pending' | 'active' | 'suspended';
    hours_json: unknown;
    photos_json: unknown;
}

export function useVendorProfile() {
    const [profile, setProfile] = useState<VendorProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            // Get vendor link
            const { data: vendorUser } = await supabase
                .from('vendor_users')
                .select('vendor_id')
                .eq('auth_user_id', user.id)
                .maybeSingle();

            if (!vendorUser) {
                setLoading(false);
                return;
            }

            const { data, error: fetchError } = await supabase
                .from('vendors')
                .select('*')
                .eq('id', vendorUser.vendor_id)
                .single();

            if (fetchError) throw fetchError;

            setProfile(data as VendorProfile);
        } catch (err: unknown) {
            console.error('Error fetching profile:', err);
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (updates: Partial<VendorProfile>) => {
        if (!profile) return;
        setSaving(true);
        try {
            const { error: updateError } = await supabase
                .from('vendors')
                .update(updates)
                .eq('id', profile.id);

            if (updateError) throw updateError;

            // Optimistic update
            setProfile(prev => prev ? { ...prev, ...updates } : null);
        } catch (err: unknown) {
            console.error('Error updating profile:', err);
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
            throw err;
        } finally {
            setSaving(false);
        }
    };

    return {
        profile,
        loading,
        saving,
        error,
        updateProfile,
        refresh: fetchProfile
    };
}
