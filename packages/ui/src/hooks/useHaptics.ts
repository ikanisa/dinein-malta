import { useState, useCallback } from 'react'

const STORAGE_KEY = 'dinein_haptics_enabled'

export function useHaptics() {
    // Default: true on Android, false on iOS (due to poor/inconsistent support)
    // We do this check only on client side to avoid hydration mismatch
    const getInitialState = () => {
        if (typeof window === 'undefined') return false
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored !== null) return stored === 'true'

        const ua = navigator.userAgent || ''
        const isAndroid = /android/i.test(ua)
        return isAndroid
    }

    const [enabled, setEnabled] = useState(getInitialState)

    // Sync state with storage when it changes
    const toggle = useCallback((value: boolean) => {
        setEnabled(value)
        localStorage.setItem(STORAGE_KEY, String(value))
    }, [])

    const trigger = useCallback((type: 'success' | 'error' | 'warning' | 'light' | 'medium' | 'heavy' | 'selection') => {
        if (!enabled) return
        if (typeof navigator === 'undefined' || !navigator.vibrate) return

        switch (type) {
            case 'success':
                navigator.vibrate([10, 30, 10])
                break
            case 'error':
                navigator.vibrate([50, 100, 50])
                break
            case 'warning':
                navigator.vibrate([30, 50, 10])
                break
            case 'light':
                navigator.vibrate(10)
                break
            case 'medium':
                navigator.vibrate(20)
                break
            case 'heavy':
                navigator.vibrate(40)
                break
            case 'selection':
                navigator.vibrate(5)
                break
        }
    }, [enabled])

    return { trigger, enabled, toggle }
}
