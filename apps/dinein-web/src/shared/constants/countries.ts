export interface Country {
    code: string;
    name: string;
    currency: string;
    flag: string;
    paymentMethods: string[];
}

export const COUNTRIES: Country[] = [
    { code: 'RW', name: 'Rwanda', currency: 'RWF', flag: '🇷🇼', paymentMethods: ['Mobile Money', 'Cash', 'Card'] },
    { code: 'MT', name: 'Malta', currency: 'EUR', flag: '🇲🇹', paymentMethods: ['Revolut', 'Cash', 'Card'] }
];
