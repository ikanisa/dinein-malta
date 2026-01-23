import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('utils', () => {
    it('cn should merge class names correctly', () => {
        const result = cn('text-red-500', 'bg-blue-500');
        expect(result).toContain('text-red-500');
        expect(result).toContain('bg-blue-500');
    });

    it('cn should handle conditional classes', () => {
        const result = cn('text-red-500', false && 'bg-blue-500', 'p-4');
        expect(result).toBe('text-red-500 p-4');
    });
});
