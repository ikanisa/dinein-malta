/**
 * Haptic Feedback Utilities
 * Provides native-like tactile feedback for mobile devices
 */

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

/**
 * Triggers haptic feedback (vibration) if supported
 * @param type - Type of haptic feedback
 */
export const haptic = (type: HapticType = 'medium'): void => {
  if (!('vibrate' in navigator)) return;

  const patterns: Record<HapticType, number | number[]> = {
    light: 5,
    medium: 10,
    heavy: 20,
    success: [10, 50, 10], // Short-long-short (success pattern)
    warning: [20, 50, 20], // Medium-long-medium (warning pattern)
    error: [30, 100, 30], // Long-pause-long (error pattern)
    selection: 5 // Quick tap for selection
  };

  const pattern = patterns[type];
  if (pattern) {
    navigator.vibrate(pattern);
  }
};

/**
 * Haptic feedback for button taps
 */
export const hapticButton = () => haptic('light');

/**
 * Haptic feedback for success actions
 */
export const hapticSuccess = () => haptic('success');

/**
 * Haptic feedback for errors
 */
export const hapticError = () => haptic('error');

/**
 * Haptic feedback for warnings
 */
export const hapticWarning = () => haptic('warning');

/**
 * Haptic feedback for selection changes (e.g., in pickers)
 */
export const hapticSelection = () => haptic('selection');

/**
 * Haptic feedback for important actions (heavy feedback)
 */
export const hapticImportant = () => haptic('heavy');

