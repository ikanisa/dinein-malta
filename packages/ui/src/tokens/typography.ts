export const TYPOGRAPHY = {
    fonts: {
        sans: 'Inter, system-ui, -apple-system, sans-serif',
        mono: 'JetBrains Mono, monospace',
    },
    sizes: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    },
    weights: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },
    // Semantic scale from typography pack
    semantic: {
        titleLg: { fontSize: '24px', lineHeight: '1.25', fontWeight: '600' },
        titleMd: { fontSize: '18px', lineHeight: '1.25', fontWeight: '600' },
        body: { fontSize: '16px', lineHeight: '1.5', fontWeight: '400' },
        bodySm: { fontSize: '14px', lineHeight: '1.4', fontWeight: '400' },
        caption: { fontSize: '12px', lineHeight: '1.4', fontWeight: '400' },
        monoSm: { fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', lineHeight: '1.4' },
    }
} as const;

export const typography = {
    fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    },
    fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    }
} as const;
