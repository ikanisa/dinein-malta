import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useVenues, useVenue } from './useVenues';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Supabase client
const mockSupabase = {
    from: vi.fn(() => ({
        select: vi.fn(() => ({
            eq: vi.fn(() => ({
                single: vi.fn(),
            })),
        })),
    })),
};

vi.mock('@/lib/supabase/client', () => ({
    createClient: () => mockSupabase,
}));

// Setup QueryClient wrapper
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe('useVenues Hook', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('fetches venues successfully', async () => {
        const mockData = { venues: [{ id: '1', name: 'Test Venue' }] };
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockData,
        });

        const { result } = renderHook(() => useVenues(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(mockData);
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/venues'));
    });

    it('handles fetch error', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
        });

        const { result } = renderHook(() => useVenues(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isError).toBe(true));
    });
});

describe('useVenue Hook', () => {
    it('fetches single venue details', async () => {
        const mockVenue = { id: '1', name: 'Detailed Venue', slug: 'detailed-venue' };

        // Setup specialized mock chain
        const singleMock = vi.fn().mockResolvedValue({ data: mockVenue, error: null });
        const eqMock = vi.fn(() => ({ single: singleMock }));
        const selectMock = vi.fn(() => ({ eq: eqMock }));
        const fromMock = vi.fn(() => ({ select: selectMock }));

        mockSupabase.from = fromMock;

        const { result } = renderHook(() => useVenue('detailed-venue'), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(mockVenue);
        expect(mockSupabase.from).toHaveBeenCalledWith('vendors');
        expect(eqMock).toHaveBeenCalledWith('slug', 'detailed-venue');
    });
});
