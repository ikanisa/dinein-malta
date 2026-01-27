import { createContext, useContext, useEffect, useState } from "react"
import { PALETTES, type Theme } from "../../tokens/colors"

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
}

type ThemeProviderState = {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
    theme: "candlelight",
    setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

// Helper to convert hex to HSL string "H S% L%" for Tailwind
function hexToHsl(hex: string): string {
    // Remove # if present
    const cleanHex = hex.replace('#', '');

    // Parse r, g, b
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    // Return space separated H S L values (degrees, %, %)
    return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
}

export function ThemeProvider({
    children,
    defaultTheme = "candlelight",
    storageKey = "dinein-ui-theme",
    ...props
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    )

    useEffect(() => {
        const root = window.document.documentElement
        root.classList.remove("light", "dark")

        // "candlelight" is dark-like, "bistro" is light-like.
        const mode = theme === 'candlelight' ? 'dark' : 'light';
        root.classList.add(mode);

        const palette = PALETTES[theme];
        if (!palette) return;

        // Optimized setVar that handles both Hex (converted to HSL for Shadcn) 
        // and raw values (RGB/RGBA) for new utility tokens.
        const setVar = (name: string, value: string, asHsl: boolean = false) => {
            if (!value) return;

            if (asHsl) {
                // For legacy Shadcn vars that REQUIRE H S L format (without hsl() wrapper)
                // This logic is kept to avoid breaking existing Shadcn components.
                if (value.startsWith('#')) {
                    root.style.setProperty(name, hexToHsl(value));
                }
                // If it's not hex (e.g. rgba), we can't easily convert to HSL channels. 
                // We skip setting the HSL channel var if it's not compatible.
            } else {
                // Set usage-ready values (Hex, RGBA, etc.)
                root.style.setProperty(name, value);
            }
        };

        // --- 1. SHADCN COMPATIBILITY LAYER (HSL Channels) ---
        // These are used by standard components: hsl(var(--primary))
        setVar('--background', palette.bg, true);
        setVar('--foreground', palette.text, true);
        setVar('--card', palette.surface, true);
        setVar('--card-foreground', palette.text, true);
        setVar('--popover', palette.surface, true);
        setVar('--popover-foreground', palette.text, true);
        setVar('--primary', palette.primary, true);
        setVar('--primary-foreground', palette.bg, true);
        setVar('--secondary', palette.surface2, true);
        setVar('--secondary-foreground', palette.text, true);
        setVar('--muted', palette.surface3, true);
        setVar('--muted-foreground', palette.textMuted, true);
        setVar('--accent', palette.surface2, true);
        setVar('--accent-foreground', palette.text, true);
        setVar('--destructive', palette.danger, true);
        setVar('--destructive-foreground', palette.text, true);
        setVar('--border', palette.border, true);
        setVar('--input', palette.border, true);
        setVar('--ring', palette.focusRing, true);
        setVar('--radius', '0.5rem', false); // Direct value

        // --- 2. DINEIN PREMIUM TOKENS (Direct Values) ---
        // These match the user's new tailwind config: var(--name)
        setVar('--surface', palette.surface);
        setVar('--surface-2', palette.surface2);
        setVar('--surface-3', palette.surface3);

        setVar('--glass-bg', palette.glassBg);
        setVar('--glass-border', palette.glassBorder);

        setVar('--rw-accent', palette.rwAccent);
        setVar('--mt-accent', palette.mtAccent);

        // Also expose base colors as CSS vars for flexibility
        setVar('--color-brand', palette.primary); // Note: globals.css might expect RGB channels, but this is a fallback.

    }, [theme])

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme)
            setTheme(theme)
        },
    }

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)
    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")
    return context
}
