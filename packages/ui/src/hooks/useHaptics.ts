export function useHaptics() {
    const trigger = (type: 'success' | 'error' | 'warning' | 'light' | 'medium' | 'heavy' | 'selection') => {
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
    }

    return { trigger }
}
