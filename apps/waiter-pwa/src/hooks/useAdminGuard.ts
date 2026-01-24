import { useState } from 'react';

export function useAdminGuard() {
    const [isAuthorized] = useState<boolean | null>(() => {
        if (typeof window === 'undefined') return null;
        const role = localStorage.getItem('dinein_role') || 'guest';
        return role === 'admin';
    });

    return { isAuthorized };
}
