import { colors } from './tokens/colors';
import { typography } from './tokens/typography';
import { spacing } from './tokens/spacing';
import { shadows } from './tokens/shadows';
import { animations } from './tokens/animations';

export const tokens = {
    colors,
    typography,
    spacing,
    shadows,
    animations,
} as const;

export type DesignSystem = typeof tokens;

// Helper to get color values safely
export const getColor = (path: string) => {
    return path.split('.').reduce((obj: any, key) => obj?.[key], tokens.colors);
};

export default tokens;
