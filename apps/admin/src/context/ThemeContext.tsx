import { createContext, useContext, useEffect, useState, useMemo } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        const stored = localStorage.getItem('theme') as Theme;
        return stored || 'system';
    });

    const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>(() => {
        return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    });

    // Derive resolvedTheme using useMemo (not setState in effect)
    const resolvedTheme = useMemo<'light' | 'dark'>(() => {
        if (theme === 'system') {
            return systemPreference;
        }
        return theme === 'dark' ? 'dark' : 'light';
    }, [theme, systemPreference]);

    // Apply theme class and persist to localStorage
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.toggle('dark', resolvedTheme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme, resolvedTheme]);

    // Listen for system theme changes if mode is 'system'
    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            const systemTheme = mediaQuery.matches ? 'dark' : 'light';
            setSystemPreference(systemTheme);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

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
