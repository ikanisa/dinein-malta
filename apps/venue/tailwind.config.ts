import type { Config } from 'tailwindcss';
// import { colors } from '../../packages/ui/src/tokens/colors';
import { typography } from '../../packages/ui/src/tokens/typography';
import { animations } from '../../packages/ui/src/tokens/animations';
import { spacing } from '../../packages/ui/src/tokens/spacing';
import { shadows } from '../../packages/ui/src/tokens/shadows';

export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                border: 'var(--border)',
                input: 'var(--input)',
                ring: 'var(--ring)',
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                primary: {
                    DEFAULT: 'var(--primary)',
                    foreground: 'var(--primary-foreground)',
                },
                secondary: {
                    DEFAULT: 'var(--secondary)',
                    foreground: 'var(--secondary-foreground)',
                },
                destructive: {
                    DEFAULT: 'var(--destructive)',
                    foreground: 'var(--destructive-foreground)',
                },
                muted: {
                    DEFAULT: 'var(--muted)',
                    foreground: 'var(--muted-foreground)',
                },
                accent: {
                    DEFAULT: 'var(--accent)',
                    foreground: 'var(--accent-foreground)',
                },
                popover: {
                    DEFAULT: 'var(--popover)',
                    foreground: 'var(--popover-foreground)',
                },
                card: {
                    DEFAULT: 'var(--card)',
                    foreground: 'var(--card-foreground)',
                },

                // Design Pack Extensions
                surface: {
                    DEFAULT: 'var(--surface)',
                    2: 'var(--surface-2)',
                    3: 'var(--surface-3)',
                },
                glass: {
                    bg: 'var(--glass-bg)',
                    border: 'var(--glass-border)',
                },
                rw: 'var(--rw-accent)',
                mt: 'var(--mt-accent)',
            },
            fontFamily: typography.fontFamily as any,
            fontSize: typography.fontSize as any,
            fontWeight: typography.fontWeight,
            spacing: {
                ...spacing,
                'safe-top': 'env(safe-area-inset-top)',
                'safe-bottom': 'env(safe-area-inset-bottom)',
                'safe-left': 'env(safe-area-inset-left)',
                'safe-right': 'env(safe-area-inset-right)',
            },
            boxShadow: {
                ...shadows,
                'glass': '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
                'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.06)',
                'nav': '0 -8px 32px rgba(0, 0, 0, 0.06)',
            },
            transitionDuration: animations.duration,
            transitionTimingFunction: animations.easing,
            backgroundImage: {
                'gradient-brand': 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
                'gradient-warm': 'linear-gradient(135deg, #F43F5E 0%, #FB7185 100%)',
                'gradient-sunset': 'linear-gradient(135deg, #8B5CF6 0%, #F43F5E 100%)',
                'gradient-ocean': 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(100%)' },
                    '100%': { transform: 'translateY(0)' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
            },
        },
    },
    plugins: [],
} satisfies Config;
