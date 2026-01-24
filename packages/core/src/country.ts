import { CountryCode, COUNTRIES, PaymentMethod } from './index';

export function formatMoney(amount: number, country: CountryCode): string {
    const config = COUNTRIES[country];
    if (!config) return `${amount}`;

    try {
        if (country === 'RW') {
            // RWF usually handled integer-like or with RWF prefix
            // e.g. "RWF 5,000"
            return new Intl.NumberFormat('en-RW', {
                style: 'currency',
                currency: 'RWF',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(amount);
        } else if (country === 'MT') {
            // EUR with 2 decimals
            return new Intl.NumberFormat('en-MT', {
                style: 'currency',
                currency: 'EUR',
            }).format(amount);
        }
    } catch (e) {
        console.warn('formatMoney error', e);
    }

    return `${config.currencySymbol} ${amount}`;
}

export type PaymentOption = {
    method: PaymentMethod;
    enabled: boolean;
    reason?: 'missing_handle' | 'not_supported';
};

export function getPaymentOptions(
    country: CountryCode,
    handles: { momo_code?: string; revolut_link?: string }
): PaymentOption[] {
    const config = COUNTRIES[country];
    if (!config) return [];

    const results: PaymentOption[] = [];

    // 1. Cash always first
    results.push({ method: 'cash', enabled: true });

    // 2. RW Specific
    if (country === 'RW') {
        const hasMomo = !!handles.momo_code;
        results.push({
            method: 'momo_ussd',
            enabled: hasMomo,
            reason: hasMomo ? undefined : 'missing_handle',
        });
    }

    // 3. MT Specific
    if (country === 'MT') {
        const hasRevolut = !!handles.revolut_link;
        results.push({
            method: 'revolut_link',
            enabled: hasRevolut,
            reason: hasRevolut ? undefined : 'missing_handle',
        });
    }

    return results;
}
