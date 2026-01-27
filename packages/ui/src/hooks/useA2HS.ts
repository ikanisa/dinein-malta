import { useState, useEffect, useCallback } from 'react'
import { isIOSA2HSInCooldown } from '../components/ui/IOSInstallSheet'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const A2HS_DISMISSED_KEY = 'dinein-a2hs-dismissed'
const A2HS_COOLDOWN_DAYS = 7

/**
 * Detect iOS Safari (where beforeinstallprompt is not available)
 */
function isIOSSafari(): boolean {
    if (typeof navigator === 'undefined') return false
    const ua = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(ua)
    const isWebkit = /WebKit/.test(ua)
    const isChrome = /CriOS/.test(ua)
    const isFirefox = /FxiOS/.test(ua)
    // iOS Safari = iOS + WebKit but not Chrome or Firefox
    return isIOS && isWebkit && !isChrome && !isFirefox
}

/**
 * Check if app is running in standalone mode (already installed)
 */
function isStandalone(): boolean {
    if (typeof window === 'undefined') return false
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        // @ts-expect-error - iOS Safari specific
        window.navigator.standalone === true
    )
}

/**
 * A2HS hook with engagement gating.
 * Per STARTER RULES: Show prompt only after meaningful engagement:
 * - Order placed, OR
 * - 2+ items added to cart, OR
 * - ~45 seconds browsing
 * 
 * Never on first paint. Respects 7-day cooldown after dismissal.
 * For iOS Safari: shows instruction sheet instead of native prompt.
 */
export function useA2HS() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [hasPromptAvailable, setHasPromptAvailable] = useState(false)
    const [isEngaged, setIsEngaged] = useState(false)
    const [showIOSSheet, setShowIOSSheet] = useState(false)
    const [startTime] = useState(() => Date.now())

    const isIOS = isIOSSafari()
    const isInstalled = isStandalone()

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

    // Listen for beforeinstallprompt (Chrome/Edge/etc)
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

    // isReady for native prompt: prompt available + engaged + not in cooldown + not installed
    const isReady = hasPromptAvailable && isEngaged && !isInCooldown() && !isInstalled

    // isReady for iOS sheet: iOS + engaged + not in iOS cooldown + not installed
    const isIOSReady = isIOS && isEngaged && !isIOSA2HSInCooldown() && !isInstalled

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

    // Open iOS install sheet
    const openIOSSheet = useCallback(() => {
        if (isIOS && !isIOSA2HSInCooldown() && !isInstalled) {
            setShowIOSSheet(true)
        }
    }, [isIOS, isInstalled])

    // Close iOS install sheet
    const closeIOSSheet = useCallback(() => {
        setShowIOSSheet(false)
    }, [])

    return {
        // Native prompt (Chrome/Edge/etc)
        isReady,
        install,
        canInstall: hasPromptAvailable && !isInCooldown() && !isInstalled,

        // iOS Safari fallback
        isIOS,
        isIOSReady,
        showIOSSheet,
        openIOSSheet,
        closeIOSSheet,

        // Engagement
        signalEngagement,
        isEngaged,

        // Status
        isInstalled
    }
}
