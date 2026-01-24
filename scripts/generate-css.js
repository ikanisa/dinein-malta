const PALETTES = {
    candlelight: {
        bg: '#0B0B0E',
        bg2: '#0F1015',
        surface: '#12131A',
        surface2: '#161825',
        surface3: '#1B1F2E',
        text: '#F4F1EA',
        textMuted: '#B9B4A7',
        textSubtle: '#8E889A',
        border: '#26283A',
        divider: '#1E2030',
        primary: '#FF7A1A',
        primaryHover: '#FF8E3A',
        primaryActive: '#F06A10',
        gold: '#D7B45A',
        success: '#2ECC71',
        warning: '#F5A524',
        danger: '#FF4D4F',
        info: '#3BA7FF',
        focusRing: '#FFB15C',
        scrim: 'rgba(0,0,0,0.55)',
        overlay: 'rgba(18,19,26,0.72)',
        glassBg: 'rgba(18,19,26,0.62)',
        glassBorder: 'rgba(255,255,255,0.08)',
        glassHighlight: 'rgba(255,122,26,0.12)',
        rwAccent: 'rgba(46,204,113,0.18)',
        mtAccent: 'rgba(59,167,255,0.18)',
    },
    bistro: {
        bg: '#FCFAF6',
        bg2: '#F7F2EA',
        surface: '#FFFFFF',
        surface2: '#FFF8EE',
        surface3: '#F2EEE7',
        text: '#141318',
        textMuted: '#4E4B57',
        textSubtle: '#7A7685',
        border: '#E6DFD4',
        divider: '#EFE7DC',
        primary: '#FF6A00',
        primaryHover: '#FF7B24',
        primaryActive: '#E95F00',
        gold: '#C9A44A',
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',
        info: '#2563EB',
        focusRing: '#FF9A4A',
        scrim: 'rgba(20,19,24,0.28)',
        overlay: 'rgba(255,255,255,0.75)',
        glassBg: 'rgba(255,255,255,0.65)',
        glassBorder: 'rgba(20,19,24,0.10)',
        glassHighlight: 'rgba(255,106,0,0.10)',
        rwAccent: 'rgba(46,204,113,0.18)',
        mtAccent: 'rgba(59,167,255,0.18)',
    }
};

function hexToHSL(hex) {
    // Simple hex to HSL (approximate)
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = "0x" + hex[1] + hex[1];
        g = "0x" + hex[2] + hex[2];
        b = "0x" + hex[3] + hex[3];
    } else if (hex.length === 7) {
        r = "0x" + hex[1] + hex[2];
        g = "0x" + hex[3] + hex[4];
        b = "0x" + hex[5] + hex[6];
    } else if (hex.startsWith('rgba')) {
        return hex; // Keep rgba as is, though shadcn might need handling
    }

    r /= 255;
    g /= 255;
    b /= 255;

    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    if (delta === 0)
        h = 0;
    else if (cmax === r)
        h = ((g - b) / delta) % 6;
    else if (cmax === g)
        h = (b - r) / delta + 2;
    else
        h = (r - g) / delta + 4;

    h = Math.round(h * 60);
    if (h < 0) h += 360;

    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return `${h} ${s}% ${l}%`;
}

function generateCSS() {
    let css = '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n';

    // Bistro (Light) -> :root
    css += '@layer base {\n  :root {\n';
    const bistro = PALETTES.bistro;
    for (const key in bistro) {
        const val = bistro[key];
        if (val.startsWith('#')) {
            css += `    --${key}: ${hexToHSL(val)};\n`;
        } else {
            css += `    --${key}: ${val};\n`;
        }
    }
    // Add shadcn specific mappings for Light
    css += `
    --background: var(--bg);
    --foreground: var(--text);
    --card: var(--surface);
    --card-foreground: var(--text);
    --popover: var(--surface);
    --popover-foreground: var(--text);
    --primary: var(--primary);
    --primary-foreground: var(--surface);
    --secondary: var(--bg2);
    --secondary-foreground: var(--text);
    --muted: var(--surface2);
    --muted-foreground: var(--textMuted);
    --accent: var(--gold);
    --accent-foreground: var(--text);
    --destructive: var(--danger);
    --destructive-foreground: var(--bg);
    --border: var(--border);
    --input: var(--border);
    --ring: var(--focusRing);
    --radius: 0.5rem;
    `;
    css += '  }\n\n';

    // Candlelight (Dark) -> .dark
    css += '  .dark {\n';
    const candle = PALETTES.candlelight;
    for (const key in candle) {
        const val = candle[key];
        if (val.startsWith('#')) {
            css += `    --${key}: ${hexToHSL(val)};\n`;
        } else {
            css += `    --${key}: ${val};\n`;
        }
    }
    // Shadcn mappings for Dark
    css += `
    --background: var(--bg);
    --foreground: var(--text);
    --card: var(--surface);
    --card-foreground: var(--text);
    --popover: var(--surface);
    --popover-foreground: var(--text);
    --primary: var(--primary);
    --primary-foreground: var(--text);
    --secondary: var(--bg2);
    --secondary-foreground: var(--text);
    --muted: var(--surface2);
    --muted-foreground: var(--textMuted);
    --accent: var(--gold);
    --accent-foreground: var(--bg);
    --destructive: var(--danger);
    --destructive-foreground: var(--text);
    --border: var(--border);
    --input: var(--border);
    --ring: var(--focusRing);
    `;
    css += '  }\n}\n';

    console.log(css);
}

generateCSS();
