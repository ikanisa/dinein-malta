/**
 * Cache Service - Response caching for API calls
 * Implements TTL-based caching with localStorage and in-memory cache
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheService {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private readonly MAX_MEMORY_ENTRIES = 100;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default

  /**
   * Get cached data
   */
  get<T>(key: string): T | null {
    // Check memory cache first
    const memEntry = this.memoryCache.get(key);
    if (memEntry && this.isValid(memEntry)) {
      return memEntry.data as T;
    }
    if (memEntry && !this.isValid(memEntry)) {
      this.memoryCache.delete(key);
    }

    // Check localStorage
    try {
      const stored = localStorage.getItem(`cache_${key}`);
      if (stored) {
        const entry: CacheEntry<T> = JSON.parse(stored);
        if (this.isValid(entry)) {
          // Move to memory cache for faster access
          this.memoryCache.set(key, entry);
          return entry.data;
        } else {
          localStorage.removeItem(`cache_${key}`);
        }
      }
    } catch (error) {
      console.warn('Cache read error:', error);
    }

    return null;
  }

  /**
   * Set cached data
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    // Store in memory cache
    if (this.memoryCache.size >= this.MAX_MEMORY_ENTRIES) {
      // Remove oldest entry (simple FIFO)
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }
    this.memoryCache.set(key, entry);

    // Store in localStorage
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
    } catch (error) {
      // localStorage might be full, just use memory cache
      console.warn('Cache write error:', error);
    }
  }

  /**
   * Check if cache entry is valid
   */
  private isValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Clear specific cache entry
   */
  clear(key: string): void {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.memoryCache.clear();
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Cache clear all error:', error);
    }
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): void {
    const now = Date.now();
    
    // Clean memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (!this.isValid(entry)) {
        this.memoryCache.delete(key);
      }
    }

    // Clean localStorage
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          try {
            const entry: CacheEntry<any> = JSON.parse(localStorage.getItem(key) || '{}');
            if (!this.isValid(entry)) {
              localStorage.removeItem(key);
            }
          } catch (e) {
            // Invalid entry, remove it
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Cache cleanup error:', error);
    }
  }
}

// Singleton instance
export const cacheService = new CacheService();

// Clean expired entries on startup and periodically
if (typeof window !== 'undefined') {
  cacheService.cleanExpired();
  
  // Clean every 10 minutes
  setInterval(() => {
    cacheService.cleanExpired();
  }, 10 * 60 * 1000);
}

/**
 * Cache decorator for async functions
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl: number = 5 * 60 * 1000
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    const cached = cacheService.get(key);
    if (cached !== null) {
      return cached;
    }
    
    const result = await fn(...args);
    cacheService.set(key, result, ttl);
    return result;
  }) as T;
}

/**
 * Generate cache key from arguments
 */
export function generateCacheKey(prefix: string, ...args: any[]): string {
  return `${prefix}_${args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join('_')}`;
}

