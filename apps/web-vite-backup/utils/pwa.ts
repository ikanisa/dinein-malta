/**
 * PWA Utilities
 * Helpers for Progressive Web App features
 */

/**
 * Checks if app is running in standalone mode (installed as PWA)
 */
// iOS-specific navigator property
interface NavigatorStandalone extends Navigator {
  standalone?: boolean;
}

export const isStandalone = (): boolean => {
  return (
    ('standalone' in window.navigator && (window.navigator as NavigatorStandalone).standalone === true) ||
    window.matchMedia('(display-mode: standalone)').matches ||
    (document.referrer.includes('android-app://') || false)
  );
};

/**
 * Checks if device is iOS
 */
export const isIOS = (): boolean => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return (
    /iphone|ipad|ipod/.test(userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
};

/**
 * Checks if device is Android
 */
export const isAndroid = (): boolean => {
  return /android/.test(window.navigator.userAgent.toLowerCase());
};

/**
 * Gets safe area insets (for notches, home indicator, etc.)
 */
export const getSafeAreaInsets = () => {
  return {
    top: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top') || '0'),
    bottom: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0'),
    left: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-left') || '0'),
    right: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-right') || '0'),
  };
};

/**
 * Requests install prompt for PWA
 * Returns the beforeinstallprompt event if available
 */
export const requestInstallPrompt = (): Promise<Event | null> => {
  return new Promise((resolve) => {
    if (isStandalone()) {
      resolve(null);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      window.removeEventListener('beforeinstallprompt', handler);
      resolve(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Timeout after 5 seconds
    setTimeout(() => {
      window.removeEventListener('beforeinstallprompt', handler);
      resolve(null);
    }, 5000);
  });
};

/**
 * Checks if service worker update is available
 */
export const checkServiceWorkerUpdate = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!('serviceWorker' in navigator)) {
      resolve(false);
      return;
    }

    navigator.serviceWorker.getRegistration().then((registration) => {
      if (!registration) {
        resolve(false);
        return;
      }

      registration.update();

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              resolve(true);
            } else {
              resolve(false);
            }
          });
        } else {
          resolve(false);
        }
      });

      // If no update found, resolve after short delay
      setTimeout(() => resolve(false), 1000);
    });
  });
};

/**
 * Reloads the app to apply service worker updates
 */
export const reloadForUpdate = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.update();
      });
      window.location.reload();
    });
  } else {
    window.location.reload();
  }
};

