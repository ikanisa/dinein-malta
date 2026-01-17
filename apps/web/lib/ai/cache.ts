import { Redis } from '@upstash/redis'

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export class CacheService {
    private redis: Redis;

    constructor(redisInstance: Redis) {
        this.redis = redisInstance;
    }

    /**
     * Get cached data
     */
    async get<T>(key: string): Promise<T | null> {
        try {
            const data = await this.redis.get<T>(key)
            return data
        } catch (error) {
            console.error('Cache get error:', error)
            return null
        }
    }

    /**
     * Set cached data with TTL
     */
    async set<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
        try {
            await this.redis.setex(key, ttlSeconds, value)
        } catch (error) {
            console.error('Cache set error:', error)
        }
    }

    /**
     * Delete cached data
     */
    async delete(key: string): Promise<void> {
        try {
            await this.redis.del(key)
        } catch (error) {
            console.error('Cache delete error:', error)
        }
    }

    /**
     * Clear all cache with pattern
     */
    async clearPattern(pattern: string): Promise<void> {
        try {
            const keys = await this.redis.keys(pattern)
            if (keys.length > 0) {
                await this.redis.del(...keys)
            }
        } catch (error) {
            console.error('Cache clear error:', error)
        }
    }

    /**
     * Get or set cached data with automatic cache
     */
    async getOrSet<T>(
        key: string,
        fetchFn: () => Promise<T>,
        ttlSeconds: number = 3600
    ): Promise<T | null> {
        const cached = await this.get<T>(key)

        if (cached) return cached

        const data = await fetchFn()
        await this.set(key, data, ttlSeconds)

        return data
    }

    /**
     * Get venue categories (with automatic cache)
     */
    async getVenueCategories<T>(
        venueId: string,
        fetchFn: () => Promise<T>
    ): Promise<T | null> {
        const key = `venue:category:${venueId}`
        const cached = await this.get<T>(key)

        if (cached) return cached

        const data = await fetchFn()
        await this.set(key, data, 86400) // 24 hours

        return data
    }

    /**
     * Get menu item categories
     */
    async getMenuItemCategories<T>(
        itemId: string,
        fetchFn: () => Promise<T>
    ): Promise<T | null> {
        const key = `item:category:${itemId}`
        const cached = await this.get<T>(key)

        if (cached) return cached

        const data = await fetchFn()
        await this.set(key, data, 604800) // 7 days

        return data
    }
}

export const cacheService = new CacheService(redis)
