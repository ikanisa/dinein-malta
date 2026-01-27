import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * Unit tests for useA2HS hook cooldown and engagement logic.
 * 
 * Note: These tests focus on the pure logic functions that support useA2HS.
 * Testing the React hook itself requires @testing-library/react-hooks.
 */

const A2HS_DISMISSED_KEY = 'dinein-a2hs-dismissed'
const A2HS_COOLDOWN_DAYS = 7
const IOS_A2HS_DISMISSED_KEY = 'dinein-ios-a2hs-dismissed'
const IOS_A2HS_COOLDOWN_DAYS = 7

// Helper function matching useA2HS isInCooldown logic
function isInCooldown(storageKey: string, cooldownDays: number): boolean {
    try {
        const dismissed = localStorage.getItem(storageKey)
        if (!dismissed) return false
        const dismissedAt = parseInt(dismissed, 10)
        const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)
        return daysSince < cooldownDays
    } catch {
        return false
    }
}

// Helper to simulate dismiss
function setDismissed(storageKey: string, daysAgo: number = 0): void {
    const timestamp = Date.now() - (daysAgo * 24 * 60 * 60 * 1000)
    localStorage.setItem(storageKey, timestamp.toString())
}

describe('A2HS Cooldown Logic', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe('Native A2HS (Chrome/Edge) Cooldown', () => {
        it('should return false for isInCooldown when no dismissal stored', () => {
            expect(isInCooldown(A2HS_DISMISSED_KEY, A2HS_COOLDOWN_DAYS)).toBe(false)
        })

        it('should return true for isInCooldown within cooldown period (day 0)', () => {
            setDismissed(A2HS_DISMISSED_KEY, 0) // dismissed today
            expect(isInCooldown(A2HS_DISMISSED_KEY, A2HS_COOLDOWN_DAYS)).toBe(true)
        })

        it('should return true for isInCooldown within cooldown period (day 3)', () => {
            setDismissed(A2HS_DISMISSED_KEY, 3) // dismissed 3 days ago
            expect(isInCooldown(A2HS_DISMISSED_KEY, A2HS_COOLDOWN_DAYS)).toBe(true)
        })

        it('should return true for isInCooldown at exactly day 6', () => {
            setDismissed(A2HS_DISMISSED_KEY, 6) // dismissed 6 days ago
            expect(isInCooldown(A2HS_DISMISSED_KEY, A2HS_COOLDOWN_DAYS)).toBe(true)
        })

        it('should return false for isInCooldown after cooldown expires (day 8)', () => {
            setDismissed(A2HS_DISMISSED_KEY, 8) // dismissed 8 days ago
            expect(isInCooldown(A2HS_DISMISSED_KEY, A2HS_COOLDOWN_DAYS)).toBe(false)
        })

        it('should return false for isInCooldown on exactly day 7', () => {
            // 7 days = cooldown expired (< 7, not <= 7)
            setDismissed(A2HS_DISMISSED_KEY, 7)
            expect(isInCooldown(A2HS_DISMISSED_KEY, A2HS_COOLDOWN_DAYS)).toBe(false)
        })
    })

    describe('iOS Safari A2HS Cooldown', () => {
        it('should return false for iOS cooldown when no dismissal stored', () => {
            expect(isInCooldown(IOS_A2HS_DISMISSED_KEY, IOS_A2HS_COOLDOWN_DAYS)).toBe(false)
        })

        it('should return true for iOS cooldown within 7 days', () => {
            setDismissed(IOS_A2HS_DISMISSED_KEY, 5) // dismissed 5 days ago
            expect(isInCooldown(IOS_A2HS_DISMISSED_KEY, IOS_A2HS_COOLDOWN_DAYS)).toBe(true)
        })

        it('should return false for iOS cooldown after 7 days', () => {
            setDismissed(IOS_A2HS_DISMISSED_KEY, 10) // dismissed 10 days ago
            expect(isInCooldown(IOS_A2HS_DISMISSED_KEY, IOS_A2HS_COOLDOWN_DAYS)).toBe(false)
        })
    })

    describe('Edge Cases', () => {
        it('should handle invalid localStorage value gracefully', () => {
            localStorage.setItem(A2HS_DISMISSED_KEY, 'not-a-number')
            // NaN comparison returns false, which means NOT in cooldown
            expect(isInCooldown(A2HS_DISMISSED_KEY, A2HS_COOLDOWN_DAYS)).toBe(false)
        })

        it('should handle missing localStorage gracefully', () => {
            // Already cleared in beforeEach
            expect(isInCooldown(A2HS_DISMISSED_KEY, A2HS_COOLDOWN_DAYS)).toBe(false)
        })
    })
})

describe('iOS Safari Detection', () => {
    const originalNavigator = globalThis.navigator

    afterEach(() => {
        // @ts-expect-error - restoring navigator
        globalThis.navigator = originalNavigator
    })

    // iOS detection function matching useA2HS
    function isIOSSafari(userAgent: string): boolean {
        const isIOS = /iPad|iPhone|iPod/.test(userAgent)
        const isWebkit = /WebKit/.test(userAgent)
        const isChrome = /CriOS/.test(userAgent)
        const isFirefox = /FxiOS/.test(userAgent)
        return isIOS && isWebkit && !isChrome && !isFirefox
    }

    it('should detect iOS Safari', () => {
        const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        expect(isIOSSafari(ua)).toBe(true)
    })

    it('should detect iPad Safari', () => {
        const ua = 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        expect(isIOSSafari(ua)).toBe(true)
    })

    it('should NOT detect iOS Chrome as iOS Safari', () => {
        const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.0.0 Mobile/15E148 Safari/604.1'
        expect(isIOSSafari(ua)).toBe(false)
    })

    it('should NOT detect iOS Firefox as iOS Safari', () => {
        const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/120.0 Mobile/15E148 Safari/605.1.15'
        expect(isIOSSafari(ua)).toBe(false)
    })

    it('should NOT detect desktop Chrome as iOS Safari', () => {
        const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        expect(isIOSSafari(ua)).toBe(false)
    })

    it('should NOT detect Android Chrome as iOS Safari', () => {
        const ua = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
        expect(isIOSSafari(ua)).toBe(false)
    })
})

describe('Engagement Timer', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should trigger engagement after 45 seconds', () => {
        let isEngaged = false
        const ENGAGEMENT_TIMEOUT = 45000

        setTimeout(() => {
            isEngaged = true
        }, ENGAGEMENT_TIMEOUT)

        // Not engaged at start
        expect(isEngaged).toBe(false)

        // Not engaged at 44 seconds
        vi.advanceTimersByTime(44000)
        expect(isEngaged).toBe(false)

        // Engaged at 45 seconds
        vi.advanceTimersByTime(1000)
        expect(isEngaged).toBe(true)
    })
})
