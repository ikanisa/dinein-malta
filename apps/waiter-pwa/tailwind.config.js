/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Premium Indigo/Purple brand palette
                brand: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                },
                // Deep ink for text
                ink: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#020617',
                },
                // Accent coral for CTAs
                coral: {
                    400: '#fb7185',
                    500: '#f43f5e',
                    600: '#e11d48',
                },
                // Glass overlay colors
                glass: {
                    light: 'rgba(255, 255, 255, 0.7)',
                    medium: 'rgba(255, 255, 255, 0.5)',
                    dark: 'rgba(15, 23, 42, 0.8)',
                },
            },
            fontFamily: {
                sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
            },
            backgroundImage: {
                // Premium gradients
                'gradient-brand': 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                'gradient-warm': 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)',
                'gradient-sunset': 'linear-gradient(135deg, #8b5cf6 0%, #f43f5e 100%)',
                'gradient-ocean': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                'gradient-mesh': 'radial-gradient(at 40% 20%, hsla(245, 84%, 60%, 0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(280, 100%, 70%, 0.2) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(340, 100%, 76%, 0.3) 0px, transparent 50%)',
                'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)',
            },
            boxShadow: {
                // Premium shadows
                'glass': '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
                'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.06)',
                'glow-brand': '0 0 40px rgba(79, 70, 229, 0.3), 0 0 80px rgba(79, 70, 229, 0.1)',
                'glow-coral': '0 0 40px rgba(244, 63, 94, 0.3)',
                'inner-glow': 'inset 0 1px 1px rgba(255, 255, 255, 0.4)',
                'card': '0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
                'card-hover': '0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)',
                'nav': '0 -8px 32px rgba(0, 0, 0, 0.06)',
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'fade-in-up': 'fadeInUp 0.5s ease-out',
                'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'float': 'float 3s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(100%)' },
                    '100%': { transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
            },
            backdropBlur: {
                'xs': '2px',
            },
        },
    },
    plugins: [],
}
