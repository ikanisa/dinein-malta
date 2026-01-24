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

        // "candlelight" is dark-like, "bistro" is light-like
        // This helps tailwind dark: modifiers work if we map them
        const mode = theme === 'candlelight' ? 'dark' : 'light';
        root.classList.add(mode);

        const palette = PALETTES[theme];
        if (!palette) return;

        // Helper to set variable
        const setVar = (name: string, hexValue: string) => {
            if (!hexValue || hexValue.startsWith('rgba') || hexValue.startsWith('linear')) {
                // If rgba or gradient, we can't easily put it inside hsl(). 
                // For now, we assume standard colors are Hex. 
                // For rgba/gradients, we might need a separate strategy or just set them raw 
                // and hope tailwind config doesn't wrap them in hsl() forcefully.
                // NOTE: The current tailwind config WRAPS everything in hsl(). 
                // We MUST skip wrapper for complex values in config, or use HSL for everything.
                // For V1, we only map the core shadcn colors which are Hex in our palette.
                return;
            }
            root.style.setProperty(name, hexToHsl(hexValue));
        };

        // Map DineIn Palette to Shadcn Variables
        setVar('--background', palette.bg);
        setVar('--foreground', palette.text);

        setVar('--card', palette.surface);
        setVar('--card-foreground', palette.text);

        setVar('--popover', palette.surface);
        setVar('--popover-foreground', palette.text);

        setVar('--primary', palette.primary);
        setVar('--primary-foreground', palette.bg); // Text on primary

        setVar('--secondary', palette.surface2);
        setVar('--secondary-foreground', palette.text);

        setVar('--muted', palette.surface3);
        setVar('--muted-foreground', palette.textMuted);

        setVar('--accent', palette.surface2);
        setVar('--accent-foreground', palette.text);

        setVar('--destructive', palette.danger);
        setVar('--destructive-foreground', palette.text);

        setVar('--border', palette.border);
        setVar('--input', palette.border); // Inputs use border color
        setVar('--ring', palette.focusRing);

        setVar('--radius', '0.5rem');

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
