import { useState, useEffect } from 'react';
import { supabase } from '@/shared/services/supabase';

export function useAdminGuard() {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setIsAuthorized(false);
                    return;
                }

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                setIsAuthorized(profile?.role === 'admin');
            } catch (err) {
                console.error('Admin guard check failed:', err);
                setIsAuthorized(false);
            }
        };

        checkAdminStatus();
    }, []);

    return { isAuthorized };
}
