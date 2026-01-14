/**
 * Gemini Service Tests
 * Tests for the frontend Gemini service wrapper
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock supabase before importing the service
vi.mock('../../services/supabase', () => ({
    supabase: {
        functions: {
            invoke: vi.fn(),
        },
    },
}));

// Mock cacheService
vi.mock('../../services/cacheService', () => ({
    cacheService: {
        get: vi.fn(),
        set: vi.fn(),
    },
    generateCacheKey: vi.fn((...args: any[]) => args.join('_')),
}));

import { supabase } from '../../services/supabase';
import { cacheService, generateCacheKey } from '../../services/cacheService';
import {
    findNearbyPlaces,
    searchPlacesByName,
    adaptUiToLocation,
    enrichVenueProfile,
    parseMenuFromFile,
    generateSmartDescription,
} from '../../services/geminiService';

describe('geminiService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('findNearbyPlaces', () => {
        it('returns venues from Gemini API', async () => {
            const mockVenues = [
                { name: 'Test Bar', lat: 1.95, lng: 30.06, distance_meters: 100 },
                { name: 'Cool Cafe', lat: 1.96, lng: 30.07, distance_meters: 200 },
            ];

            vi.mocked(cacheService.get).mockReturnValue(null);
            vi.mocked(supabase.functions.invoke).mockResolvedValue({
                data: mockVenues,
                error: null,
            });

            const result = await findNearbyPlaces(1.95, 30.06);

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('Test Bar');
            expect(supabase.functions.invoke).toHaveBeenCalledWith('gemini-features', {
                body: { action: 'discover', lat: 1.95, lng: 30.06, radius: 5000 },
            });
        });

        it('returns cached results when available', async () => {
            const cachedVenues = [
                { name: 'Cached Bar', lat: 1.95, lng: 30.06, distance_meters: 50 },
            ];

            vi.mocked(cacheService.get).mockReturnValue(cachedVenues);

            const result = await findNearbyPlaces(1.95, 30.06);

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Cached Bar');
            expect(supabase.functions.invoke).not.toHaveBeenCalled();
        });

        it('excludes venues by name when specified', async () => {
            const cachedVenues = [
                { name: 'Keep Me', lat: 1.95, lng: 30.06 },
                { name: 'Exclude Me', lat: 1.96, lng: 30.07 },
            ];

            vi.mocked(cacheService.get).mockReturnValue(cachedVenues);

            const result = await findNearbyPlaces(1.95, 30.06, ['Exclude Me']);

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Keep Me');
        });

        it('returns empty array on API error', async () => {
            vi.mocked(cacheService.get).mockReturnValue(null);
            vi.mocked(supabase.functions.invoke).mockResolvedValue({
                data: null,
                error: new Error('Network error'),
            });

            const result = await findNearbyPlaces(1.95, 30.06);

            expect(result).toEqual([]);
        });
    });

    describe('searchPlacesByName', () => {
        it('searches venues by query', async () => {
            const mockVenues = [
                { name: 'Sushi Place', category: 'restaurant' },
            ];

            vi.mocked(supabase.functions.invoke).mockResolvedValue({
                data: mockVenues,
                error: null,
            });

            const result = await searchPlacesByName('sushi', 1.95, 30.06);

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Sushi Place');
            expect(supabase.functions.invoke).toHaveBeenCalledWith('gemini-features', {
                body: { action: 'search', query: 'sushi', lat: 1.95, lng: 30.06 },
            });
        });

        it('searches without location', async () => {
            vi.mocked(supabase.functions.invoke).mockResolvedValue({
                data: [],
                error: null,
            });

            await searchPlacesByName('coffee');

            expect(supabase.functions.invoke).toHaveBeenCalledWith('gemini-features', {
                body: { action: 'search', query: 'coffee', lat: undefined, lng: undefined },
            });
        });

        it('returns empty array on error', async () => {
            vi.mocked(supabase.functions.invoke).mockResolvedValue({
                data: null,
                error: new Error('Search failed'),
            });

            const result = await searchPlacesByName('test');

            expect(result).toEqual([]);
        });
    });

    describe('adaptUiToLocation', () => {
        it('returns UI context for location', async () => {
            const mockContext = {
                cityName: 'Kigali',
                country: 'Rwanda',
                currencySymbol: 'RWF',
                greeting: 'Muraho',
            };

            vi.mocked(cacheService.get).mockReturnValue(null);
            vi.mocked(supabase.functions.invoke).mockResolvedValue({
                data: mockContext,
                error: null,
            });

            const result = await adaptUiToLocation(-1.94, 30.06);

            expect(result.cityName).toBe('Kigali');
            expect(result.country).toBe('Rwanda');
            expect(result.appName).toBe('DineIn Kigali');
            expect(result.greeting).toBe('Muraho');
        });

        it('returns cached context when available', async () => {
            const cachedContext = {
                appName: 'DineIn Paris',
                greeting: 'Bonjour',
                currencySymbol: '€',
                cityName: 'Paris',
                country: 'France',
            };

            vi.mocked(cacheService.get).mockReturnValue(cachedContext);

            const result = await adaptUiToLocation(48.85, 2.35);

            expect(result.appName).toBe('DineIn Paris');
            expect(supabase.functions.invoke).not.toHaveBeenCalled();
        });

        it('returns fallback on error', async () => {
            vi.mocked(cacheService.get).mockReturnValue(null);
            vi.mocked(supabase.functions.invoke).mockResolvedValue({
                data: null,
                error: new Error('API error'),
            });

            const result = await adaptUiToLocation(0, 0);

            expect(result.appName).toBe('DineIn');
            expect(result.greeting).toBe('Welcome');
            expect(result.currencySymbol).toBe('$');
        });
    });

    describe('enrichVenueProfile', () => {
        it('enriches venue with Google data', async () => {
            const mockEnriched = {
                website: 'https://example.com',
                phone: '+250788123456',
                instagram_url: 'https://instagram.com/venue',
                description: 'A great place',
            };

            vi.mocked(supabase.functions.invoke).mockResolvedValue({
                data: mockEnriched,
                error: null,
            });

            const result = await enrichVenueProfile('Test Venue', '123 Main St');

            expect(result.website).toBe('https://example.com');
            expect(result.phone).toBe('+250788123456');
        });

        it('returns empty object on error', async () => {
            vi.mocked(supabase.functions.invoke).mockResolvedValue({
                data: null,
                error: new Error('Enrichment failed'),
            });

            const result = await enrichVenueProfile('Test', 'Address');

            expect(result).toEqual({});
        });
    });

    describe('parseMenuFromFile', () => {
        it('parses menu items from image', async () => {
            const mockItems = [
                { name: 'Burger', price: 15, category: 'Mains' },
                { name: 'Fries', price: 5, category: 'Sides' },
            ];

            vi.mocked(supabase.functions.invoke).mockResolvedValue({
                data: mockItems,
                error: null,
            });

            const result = await parseMenuFromFile('base64data', 'image/jpeg');

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('Burger');
        });

        it('returns empty array on error', async () => {
            vi.mocked(supabase.functions.invoke).mockResolvedValue({
                data: null,
                error: new Error('Parse failed'),
            });

            const result = await parseMenuFromFile('data', 'image/png');

            expect(result).toEqual([]);
        });
    });

    describe('generateSmartDescription', () => {
        it('generates description for menu item', async () => {
            vi.mocked(supabase.functions.invoke).mockResolvedValue({
                data: 'A delicious grilled chicken with herbs',
                error: null,
            });

            const result = await generateSmartDescription('Grilled Chicken', 'Mains');

            expect(result).toBe('A delicious grilled chicken with herbs');
        });

        it('returns empty string on error', async () => {
            vi.mocked(supabase.functions.invoke).mockResolvedValue({
                data: null,
                error: new Error('Generation failed'),
            });

            const result = await generateSmartDescription('Test', 'Category');

            expect(result).toBe('');
        });
    });
});
