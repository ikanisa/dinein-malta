import { createContext, useContext, useEffect, useMemo, useLayoutEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window === 'undefined') return 'system';
        const stored = localStorage.getItem('theme') as Theme;
        return stored || 'system';
    });

    // Track system preference separately for reactivity
    const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>(() => {
        if (typeof window === 'undefined') return 'light';
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    // Derive resolved theme from theme + systemPreference (no setState in effect)
    const resolvedTheme = useMemo((): 'light' | 'dark' => {
        if (theme === 'system') return systemPreference;
        return theme === 'dark' ? 'dark' : 'light';
    }, [theme, systemPreference]);

    // Apply theme to DOM (useLayoutEffect to avoid flash)
    useLayoutEffect(() => {
        const root = window.document.documentElement;
        root.classList.toggle('dark', resolvedTheme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme, resolvedTheme]);

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            setSystemPreference(e.matches ? 'dark' : 'light');
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};
