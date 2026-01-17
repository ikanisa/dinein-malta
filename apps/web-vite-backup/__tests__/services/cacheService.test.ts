/**
 * Unit tests for cacheService.ts
 * Tests for cache get/set, TTL expiration, and invalidation
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Create a real localStorage mock with proper Object.keys support
const createLocalStorageMock = () => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
        get length() { return Object.keys(store).length; },
        key: (index: number) => Object.keys(store)[index] || null,
        // Helper to get keys for testing
        _getStore: () => store,
        _setStore: (newStore: Record<string, string>) => { store = newStore; },
    };
};

const localStorageMock = createLocalStorageMock();

// Mock localStorage globally
Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true,
});

// Mock Object.keys to work with our localStorage mock
const originalKeys = Object.keys;
Object.keys = function (obj: object) {
    if (obj === localStorageMock) {
        return originalKeys(localStorageMock._getStore());
    }
    return originalKeys(obj);
};

// Reset module cache before importing
vi.resetModules();

// Import after mocking
import { cacheService, withCache, generateCacheKey } from '../../services/cacheService';

describe('cacheService', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        localStorageMock.clear();
        vi.clearAllMocks();
        // Also clear the in-memory cache
        cacheService.clearAll();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('get and set', () => {
        it('returns null for non-existent key', () => {
            const result = cacheService.get('non-existent');
            expect(result).toBeNull();
        });

        it('sets and gets value', () => {
            const testData = { name: 'Test', value: 123 };
            cacheService.set('test-key', testData);

            const result = cacheService.get('test-key');
            expect(result).toEqual(testData);
        });

        it('stores in localStorage', () => {
            const testData = { foo: 'bar' };
            cacheService.set('storage-key', testData);

            const stored = localStorageMock.getItem('cache_storage-key');
            expect(stored).not.toBeNull();
            const parsed = JSON.parse(stored!);
            expect(parsed.data).toEqual(testData);
        });

        it('retrieves from localStorage on cache miss after clearAll', () => {
            // Manually set in localStorage to simulate persistence
            const entry = {
                data: { persisted: true },
                timestamp: Date.now(),
                ttl: 60000,
            };
            localStorageMock.setItem('cache_persisted-key', JSON.stringify(entry));

            // Clear memory cache only (not localStorage)
            cacheService.clearAll();
            // Re-add entry to localStorage
            localStorageMock.setItem('cache_persisted-key', JSON.stringify(entry));

            const result = cacheService.get('persisted-key');
            expect(result).toEqual({ persisted: true });
        });

        it('uses custom TTL', () => {
            cacheService.set('custom-ttl', 'data', 1000);

            // Should exist immediately
            expect(cacheService.get('custom-ttl')).toBe('data');

            // Advance time past TTL
            vi.advanceTimersByTime(1500);

            // Should be expired now
            expect(cacheService.get('custom-ttl')).toBeNull();
        });
    });

    describe('TTL expiration', () => {
        it('returns null for expired entries', () => {
            cacheService.set('expiring', 'value', 1000); // 1 second TTL

            // Advance time past expiration
            vi.advanceTimersByTime(2000);

            const result = cacheService.get('expiring');
            expect(result).toBeNull();
        });

        it('returns value before expiration', () => {
            cacheService.set('valid', 'value', 5000);

            // Advance time but not past expiration
            vi.advanceTimersByTime(3000);

            const result = cacheService.get('valid');
            expect(result).toBe('value');
        });
    });

    describe('clear', () => {
        it('clears specific cache entry', () => {
            cacheService.set('key1', 'value1');
            cacheService.set('key2', 'value2');

            cacheService.clear('key1');

            expect(cacheService.get('key1')).toBeNull();
            expect(cacheService.get('key2')).toBe('value2');
        });

        it('removes from localStorage', () => {
            cacheService.set('to-clear', 'value');
            cacheService.clear('to-clear');

            expect(localStorageMock.getItem('cache_to-clear')).toBeNull();
        });
    });

    describe('clearAll', () => {
        it('clears all in-memory cache entries', () => {
            cacheService.set('key1', 'value1');
            cacheService.set('key2', 'value2');
            cacheService.set('key3', 'value3');

            cacheService.clearAll();

            // Check in-memory cache is cleared (after clearAll, get still checks localStorage)
            // Since clearAll clears both, all should be null
            expect(cacheService.get('key1')).toBeNull();
            expect(cacheService.get('key2')).toBeNull();
            expect(cacheService.get('key3')).toBeNull();
        });
    });

    describe('cleanExpired', () => {
        it('removes expired entries from memory cache', () => {
            cacheService.set('short', 'value', 1000);
            cacheService.set('long', 'value', 10000);

            // Advance time past short TTL
            vi.advanceTimersByTime(2000);

            cacheService.cleanExpired();

            expect(cacheService.get('short')).toBeNull();
            expect(cacheService.get('long')).toBe('value');
        });
    });
});

describe('withCache', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        localStorageMock.clear();
        cacheService.clearAll();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('caches function result', async () => {
        const mockFn = vi.fn().mockResolvedValue('result');
        const cachedFn = withCache(mockFn, () => 'test-key');

        // First call
        const result1 = await cachedFn();
        expect(result1).toBe('result');
        expect(mockFn).toHaveBeenCalledTimes(1);

        // Second call - should use cache
        const result2 = await cachedFn();
        expect(result2).toBe('result');
        expect(mockFn).toHaveBeenCalledTimes(1); // Still 1
    });

    it('respects TTL for cached results', async () => {
        const mockFn = vi.fn()
            .mockResolvedValueOnce('first')
            .mockResolvedValueOnce('second');
        const cachedFn = withCache(mockFn, () => 'ttl-key', 1000);

        // First call
        await cachedFn();
        expect(mockFn).toHaveBeenCalledTimes(1);

        // Advance time past TTL
        vi.advanceTimersByTime(2000);

        // Should call function again
        const result = await cachedFn();
        expect(result).toBe('second');
        expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('generates different keys for different arguments', async () => {
        const mockFn = vi.fn().mockResolvedValue('result');
        const cachedFn = withCache(
            mockFn,
            (arg: string) => `key_${arg}`
        );

        await cachedFn('a');
        await cachedFn('b');
        await cachedFn('a'); // Cached

        expect(mockFn).toHaveBeenCalledTimes(2);
    });
});

describe('generateCacheKey', () => {
    it('generates key from prefix and string args', () => {
        const key = generateCacheKey('venues', 'active', 'search');
        expect(key).toBe('venues_active_search');
    });

    it('generates key from prefix and number args', () => {
        const key = generateCacheKey('items', 1, 2, 3);
        expect(key).toBe('items_1_2_3');
    });

    it('serializes object args', () => {
        const key = generateCacheKey('filter', { status: 'active' });
        expect(key).toBe('filter_{"status":"active"}');
    });

    it('handles mixed args', () => {
        const key = generateCacheKey('mixed', 'str', 123, { a: 1 });
        expect(key).toBe('mixed_str_123_{"a":1}');
    });
});
