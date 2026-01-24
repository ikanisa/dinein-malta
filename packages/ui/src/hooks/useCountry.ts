import { useState, useEffect } from 'react';
import { CountryCode, getCountry } from '@dinein/core';

const STORAGE_KEY = 'dinein_active_country';

export function useCountry() {
    const [countryCode, setCountryCode] = useState<CountryCode>(() => {
        // 1. Try local storage
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored === 'RW' || stored === 'MT') return stored;
        } catch {
            // ignore
        }
        // 2. Default to empty? Or undefined. 
        // Logic says "User never manually selects country in normal flow... User visits app root -> minimal chooser"
        // For now, we return null initially if not found, to trigger chooser.
        // But type is CountryCode. Let's default to RW if we MUST, but ideally we handle "unknown".
        // The spec says: "fallback = unknown (then show minimal chooser ONLY if required)"
        // Since we typed CountryCode as 'RW' | 'MT', we might need to extend it or handle null.
        // 2. Default to MT (Malta) - this is where our initial venue data is
        // Per spec: country is auto-derived from Venue when entering via deep link
        // For home screen, we default to MT
        return 'MT';
    });

    const [isSet, setIsSet] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'RW' || stored === 'MT') {
            setIsSet(true);
        }
    }, [countryCode]);

    const setCountry = (code: CountryCode) => {
        setCountryCode(code);
        localStorage.setItem(STORAGE_KEY, code);
        setIsSet(true);

        // Dispatch custom event for other listeners if needed
        window.dispatchEvent(new CustomEvent('country-change', { detail: code }));
    };

    return {
        country: getCountry(countryCode),
        countryCode,
        setCountry,
        isSet, // True if we have a persisted choice
    };
}
