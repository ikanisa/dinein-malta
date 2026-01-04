/**
 * Badge API Service
 * Updates app icon badge with order count
 */

/**
 * Set badge text (shows on app icon)
 */
export async function setBadge(count: number): Promise<void> {
  if (!('setAppBadge' in navigator)) {
    // Badge API not supported
    return;
  }

  try {
    if (count > 0) {
      await (navigator as any).setAppBadge(count);
    } else {
      await (navigator as any).clearAppBadge();
    }
  } catch (error) {
    console.error('Failed to set badge:', error);
  }
}

/**
 * Clear badge
 */
export async function clearBadge(): Promise<void> {
  if (!('clearAppBadge' in navigator)) {
    return;
  }

  try {
    await (navigator as any).clearAppBadge();
  } catch (error) {
    console.error('Failed to clear badge:', error);
  }
}

/**
 * Check if badge API is supported
 */
export function isBadgeAPISupported(): boolean {
  return 'setAppBadge' in navigator && 'clearAppBadge' in navigator;
}



