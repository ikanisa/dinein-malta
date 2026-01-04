/**
 * Touch Utilities for Mobile-First PWA
 * Provides utilities for touch interactions and gestures
 */

/**
 * Checks if device supports touch
 */
export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Gets minimum touch target size (44px for iOS, 48dp for Android)
 * Returns in pixels
 */
export const getMinTouchTarget = (): number => {
  // iOS guideline: 44x44 points
  // Android guideline: 48dp
  // Using 44px as safe minimum (works well on both)
  return 44;
};

/**
 * Checks if element has adequate touch target size
 */
export const hasAdequateTouchTarget = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  const minSize = getMinTouchTarget();
  return rect.width >= minSize && rect.height >= minSize;
};

/**
 * Adds touch ripple effect to element
 * Call this in onClick/touch handlers
 */
export const addTouchRipple = (event: React.MouseEvent | React.TouchEvent, element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const isTouch = 'touches' in event;
  const clientX = isTouch ? (event as React.TouchEvent).touches[0]?.clientX : (event as React.MouseEvent).clientX;
  const clientY = isTouch ? (event as React.TouchEvent).touches[0]?.clientY : (event as React.MouseEvent).clientY;
  
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  
  const ripple = document.createElement('span');
  const size = Math.max(rect.width, rect.height);
  const rippleSize = size * 2;
  
  ripple.style.width = ripple.style.height = `${rippleSize}px`;
  ripple.style.left = `${x - rippleSize / 2}px`;
  ripple.style.top = `${y - rippleSize / 2}px`;
  ripple.style.position = 'absolute';
  ripple.style.borderRadius = '50%';
  ripple.style.background = 'rgba(255, 255, 255, 0.5)';
  ripple.style.transform = 'scale(0)';
  ripple.style.animation = 'ripple 600ms ease-out';
  ripple.style.pointerEvents = 'none';
  
  // Ensure parent has relative positioning
  const originalPosition = element.style.position;
  if (window.getComputedStyle(element).position === 'static') {
    element.style.position = 'relative';
  }
  element.style.overflow = 'hidden';
  element.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
    if (originalPosition) {
      element.style.position = originalPosition;
    }
  }, 600);
};

/**
 * Touch event coordinates helper
 */
export const getTouchCoordinates = (event: React.TouchEvent | TouchEvent) => {
  if ('touches' in event && event.touches.length > 0) {
    return {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
  }
  if ('changedTouches' in event && event.changedTouches.length > 0) {
    return {
      x: event.changedTouches[0].clientX,
      y: event.changedTouches[0].clientY
    };
  }
  return { x: 0, y: 0 };
};

/**
 * Swipe gesture detection
 * Returns direction if swipe detected, null otherwise
 */
export interface SwipeOptions {
  threshold?: number; // Minimum distance in pixels
  velocityThreshold?: number; // Minimum velocity
}

export const detectSwipe = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  options: SwipeOptions = {}
): 'left' | 'right' | 'up' | 'down' | null => {
  const { threshold = 50, velocityThreshold = 0.3 } = options;
  
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
  if (distance < threshold) return null;
  
  // Check if horizontal or vertical swipe is dominant
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Horizontal swipe
    if (Math.abs(deltaX) / distance > velocityThreshold) {
      return deltaX > 0 ? 'right' : 'left';
    }
  } else {
    // Vertical swipe
    if (Math.abs(deltaY) / distance > velocityThreshold) {
      return deltaY > 0 ? 'down' : 'up';
    }
  }
  
  return null;
};

