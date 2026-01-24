import { useEffect, useState } from 'react';
import { supabase } from '../shared/services/supabase';

export interface Table {
    id: string;
    table_number: number;
    label: string;
    public_code: string;
    is_active: boolean;
    // Status isn't in DB yet, inferred from active orders or hardcoded logic
    status?: 'available' | 'occupied' | 'reserved';
    currentOrder?: string;
    capacity?: number; // Not in v1 schema
}

export function useVendorTables() {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
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
                .from('tables')
                .select('*')
                .eq('vendor_id', vendorUser.vendor_id)
                .order('table_number', { ascending: true });

            if (fetchError) throw fetchError;

            // enrich tables with status logic if we had orders linked
            // For now, mapping simplified status
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const enrichedTables = data.map((t: any) => ({
                ...t,
                status: 'available', // Default
                capacity: 4 // Mock default
            }));

            setTables(enrichedTables);
        } catch (err: unknown) {
            console.error('Error fetching tables:', err);
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const addTable = async (number: number, label: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            // In real app, we reuse vendorId from context/hook
            const { data: vendorUser } = await supabase.from('vendor_users').select('vendor_id').eq('auth_user_id', user?.id).single();

            if (!vendorUser) throw new Error('No vendor found');

            // generate public code
            const public_code = `${vendorUser.vendor_id.slice(0, 4)}-${number}-${Date.now().toString().slice(-4)}`;

            const { error } = await supabase.from('tables').insert({
                vendor_id: vendorUser.vendor_id,
                table_number: number,
                label,
                public_code,
                is_active: true
            });

            if (error) throw error;
            fetchTables();
        } catch (err: unknown) {
            console.error('Error adding table:', err);
            throw err;
        }
    };

    const deleteTable = async (id: string) => {
        try {
            const { error } = await supabase.from('tables').delete().eq('id', id);
            if (error) throw error;
            setTables(prev => prev.filter(t => t.id !== id));
        } catch (err: unknown) {
            console.error('Error deleting table:', err);
            throw err;
        }
    };

    return {
        tables,
        loading,
        error,
        addTable,
        deleteTable,
        refresh: fetchTables
    };
}
