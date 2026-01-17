/**
 * Debounce utility - delays function execution until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Generic utility function
export function debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Generic utility function
    return function (this: any, ...args: Parameters<T>) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            func.apply(this, args);
            timeoutId = null;
        }, wait);
    };
}

/**
 * Throttle utility - limits function execution to at most once per wait milliseconds.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Generic utility function
export function throttle<T extends (...args: any[]) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let lastTime = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Generic utility function
    return function (this: any, ...args: Parameters<T>) {
        const now = Date.now();
        const remaining = wait - (now - lastTime);

        if (remaining <= 0) {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
            lastTime = now;
            func.apply(this, args);
        } else if (!timeoutId) {
            timeoutId = setTimeout(() => {
                lastTime = Date.now();
                timeoutId = null;
                func.apply(this, args);
            }, remaining);
        }
    };
}
