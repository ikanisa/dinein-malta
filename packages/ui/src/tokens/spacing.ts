export const spacing = {
    '0': '0px',
    'px': '1px',
    '0.5': '0.125rem',
    '1': '0.25rem',
    '1.5': '0.375rem',
    '2': '0.5rem',
    '2.5': '0.625rem',
    '3': '0.75rem',
    '3.5': '0.875rem',
    '4': '1rem',
    '5': '1.25rem',
    '6': '1.5rem',
    '7': '1.75rem',
    '8': '2rem',
    '9': '2.25rem',
    '10': '2.5rem',
    '11': '2.75rem',
    '12': '3rem',
    '14': '3.5rem',
    '16': '4rem',
    '20': '5rem',
    '24': '6rem',
    '28': '7rem',
    '32': '8rem',
    '36': '9rem',
    '40': '10rem',
    '44': '11rem',
    '48': '12rem',
    '52': '13rem',
    '56': '14rem',
    '60': '15rem',
    '64': '16rem',
    '72': '18rem',
    '80': '20rem',
    '96': '24rem',
};

/**
 * Layout constants for consistent mobile-first PWA design.
 * - containerMaxWidth: Max content width on mobile (520-640px per workflow)
 * - horizontalPadding: Default horizontal page padding
 * - safeAreaBottom: Bottom padding for nav + cart pill (~56px nav + buffer)
 * - minTapTarget: Minimum touch target size (WCAG 2.5.5)
 */
export const LAYOUT = {
    containerMaxWidth: '640px',
    horizontalPadding: '16px',
    safeAreaBottom: '84px',       // 56px bottom nav + 28px buffer for cart pill
    minTapTarget: '44px',
} as const;

/**
 * Numeric spacing scale (pixels) for programmatic use
 */
export const SPACING_PX = {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
} as const;
