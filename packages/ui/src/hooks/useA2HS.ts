import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const A2HS_DISMISSED_KEY = 'dinein-a2hs-dismissed'
const A2HS_COOLDOWN_DAYS = 7

/**
 * A2HS hook with engagement gating.
 * Per STARTER RULES: Show prompt only after meaningful engagement:
 * - Order placed, OR
 * - 2+ items added to cart, OR
 * - ~45 seconds browsing
 * 
 * Never on first paint. Respects 7-day cooldown after dismissal.
 */
export function useA2HS() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [hasPromptAvailable, setHasPromptAvailable] = useState(false)
    const [isEngaged, setIsEngaged] = useState(false)
    const [startTime] = useState(() => Date.now())

    // Check if we're in cooldown from previous dismissal
    const isInCooldown = useCallback(() => {
        try {
            const dismissed = localStorage.getItem(A2HS_DISMISSED_KEY)
            if (!dismissed) return false
            const dismissedAt = parseInt(dismissed, 10)
            const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)
            return daysSince < A2HS_COOLDOWN_DAYS
        } catch {
            return false
        }
    }, [])

    // Listen for beforeinstallprompt
    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            setHasPromptAvailable(true)
        }

        window.addEventListener('beforeinstallprompt', handler)
        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    // Check time-based engagement (45 seconds)
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsEngaged(true)
        }, 45000) // 45 seconds

        return () => clearTimeout(timer)
    }, [startTime])

    // Signal engagement from external triggers
    const signalEngagement = useCallback((reason: 'order_placed' | 'cart_items' | 'time') => {
        console.log('[A2HS] Engagement signaled:', reason)
        setIsEngaged(true)
    }, [])

    // isReady only when: prompt available + engaged + not in cooldown
    const isReady = hasPromptAvailable && isEngaged && !isInCooldown()

    const install = useCallback(async () => {
        if (!deferredPrompt) return 'unavailable'

        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            setDeferredPrompt(null)
            setHasPromptAvailable(false)
        } else {
            // User dismissed, set cooldown
            try {
                localStorage.setItem(A2HS_DISMISSED_KEY, Date.now().toString())
            } catch {
                // Ignore localStorage errors
            }
        }

        return outcome
    }, [deferredPrompt])

    return {
        isReady,
        install,
        signalEngagement,
        // For manual trigger in Settings
        canInstall: hasPromptAvailable && !isInCooldown()
    }
}
