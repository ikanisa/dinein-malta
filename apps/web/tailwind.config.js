/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./context/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
        "./utils/**/*.{js,ts,jsx,tsx}"
    ],
    darkMode: ['class', '[data-theme="dark"]'],
    theme: {
        extend: {
            colors: {
                background: 'var(--bg-main)',
                surface: 'var(--bg-surface)',
                'surface-highlight': 'var(--bg-surface-highlight)',
                foreground: 'var(--text-main)',
                muted: 'var(--text-muted)',
                border: 'var(--border-color)',
                glass: "var(--glass-bg)",
                glassBorder: "var(--glass-border)",
                primary: {
                    DEFAULT: 'var(--color-primary-500)',
                    500: 'var(--color-primary-500)',
                    600: 'var(--color-primary-600)'
                },
                secondary: {
                    DEFAULT: 'var(--color-secondary-500)',
                    500: 'var(--color-secondary-500)',
                    600: 'var(--color-secondary-600)'
                },
                accent: {
                    DEFAULT: 'var(--color-accent-500)',
                    500: 'var(--color-accent-500)'
                },
                ink: 'var(--color-ink)',
            },
            backdropBlur: {
                xs: '2px',
                xl: '20px',
            },
            boxShadow: {
                'glow': '0 0 24px rgba(255, 107, 53, 0.35)',
            },
            fontFamily: {
                display: ['var(--font-display)', 'serif'],
                body: ['var(--font-body)', 'system-ui', 'sans-serif'],
                accent: ['var(--font-accent)', 'serif']
            },
            minHeight: {
                'touch': '44px', // Minimum touch target size (Apple HIG)
            },
            minWidth: {
                'touch': '44px',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'fade-out': 'fadeOut 0.3s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'bounce-gentle': 'bounceGentle 0.5s ease-in-out',
                'scale-in': 'scaleIn 0.2s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeOut: {
                    '0%': { opacity: '1' },
                    '100%': { opacity: '0' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(100%)' },
                    '100%': { transform: 'translateY(0)' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(0)' },
                },
                bounceGentle: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.9)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
            },
        }
    },
    plugins: [],
}
