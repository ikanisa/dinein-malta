export const SPACING = {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
    container: {
        mobile: '640px', // Max width for mobile-first content
        padding: '16px', // Default horizontal padding
    },
    safeArea: {
        bottom: 'env(safe-area-inset-bottom, 24px)',
    }
} as const;
