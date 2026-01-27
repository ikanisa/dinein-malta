/**
 * Gesture thresholds for consistent behavior across components.
 * Tuned for mobile-first UX without accidental triggers.
 */

/** Long-press duration in milliseconds */
export const LONG_PRESS_DURATION_MS = 400;

/** Minimum swipe distance in pixels to register as intentional */
export const SWIPE_MIN_DELTA_PX = 60;

/** Minimum velocity (px/s) for swipe to register */
export const SWIPE_MIN_VELOCITY = 300;

/** Swipe dismiss velocity threshold (faster = close) */
export const SWIPE_DISMISS_VELOCITY = 500;

/** Horizontal dominance ratio for tab swipes (must be more horizontal than vertical) */
export const HORIZONTAL_DOMINANCE_RATIO = 1.5;

/**
 * Hook to access gesture thresholds.
 * Returns readonly object for use in gesture handlers.
 */
export function useGestureThresholds() {
    return {
        longPressDurationMs: LONG_PRESS_DURATION_MS,
        swipeMinDeltaPx: SWIPE_MIN_DELTA_PX,
        swipeMinVelocity: SWIPE_MIN_VELOCITY,
        swipeDismissVelocity: SWIPE_DISMISS_VELOCITY,
        horizontalDominanceRatio: HORIZONTAL_DOMINANCE_RATIO,
    } as const;
}
