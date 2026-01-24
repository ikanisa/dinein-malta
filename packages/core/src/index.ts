/**
 * @dinein/core - Single source of truth for types, enums, and constants
 * Per STARTER RULES: Order statuses, payment methods, and country codes must be centralized.
 */

// =============================================================================
// MICROCOPY & ASSETS
// =============================================================================
export * from './constants/microcopy';

// =============================================================================
// ORDER STATUS
// Per STARTER RULES: Only Placed → Received → Served, or Cancelled
// =============================================================================

export type OrderStatus = 'placed' | 'received' | 'served' | 'cancelled';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    placed: 'Order Placed',
    received: 'Received',
    served: 'Served',
    cancelled: 'Cancelled',
};

export const ORDER_STATUS_FLOW: OrderStatus[] = ['placed', 'received', 'served'];

export function getNextOrderStatus(current: OrderStatus): OrderStatus | null {
    const index = ORDER_STATUS_FLOW.indexOf(current);
    if (index === -1 || index === ORDER_STATUS_FLOW.length - 1) return null;
    return ORDER_STATUS_FLOW[index + 1];
}

// =============================================================================
// PAYMENT METHODS
// Per STARTER RULES: Cash, MoMoUSSD (RW), RevolutLink (MT) - handoff only
// =============================================================================

export type PaymentMethod = 'cash' | 'momo_ussd' | 'revolut_link';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    cash: 'Cash',
    momo_ussd: 'Mobile Money (USSD)',
    revolut_link: 'Revolut',
};

// =============================================================================
// COUNTRIES
// Per STARTER RULES: RW and MT only
// =============================================================================

export type CountryCode = 'RW' | 'MT';

export interface Country {
    code: CountryCode;
    name: string;
    currency: string;
    currencySymbol: string;
    flag: string;
    paymentMethods: PaymentMethod[];
}

export const COUNTRIES: Record<CountryCode, Country> = {
    RW: {
        code: 'RW',
        name: 'Rwanda',
        currency: 'RWF',
        currencySymbol: 'RWF',
        flag: '🇷🇼',
        paymentMethods: ['momo_ussd', 'cash'],
    },
    MT: {
        code: 'MT',
        name: 'Malta',
        currency: 'EUR',
        currencySymbol: '€',
        flag: '🇲🇹',
        paymentMethods: ['revolut_link', 'cash'],
    },
};

export function getCountry(code: CountryCode): Country {
    return COUNTRIES[code];
}

export function getCurrencySymbol(code: CountryCode): string {
    return COUNTRIES[code].currencySymbol;
}

export function getPaymentMethodsForCountry(code: CountryCode): PaymentMethod[] {
    return COUNTRIES[code].paymentMethods;
}

export * from './country';
