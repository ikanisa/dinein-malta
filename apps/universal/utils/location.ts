/**
 * Robust Location Permission Utility
 * Unified, simple, and performant location handling
 */

export interface LocationResult {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface LocationError {
  code: number;
  message: string;
}

/**
 * Request location permission with robust error handling
 * Returns location or null with error details
 */
export async function requestLocation(
  options: {
    timeout?: number;
    enableHighAccuracy?: boolean;
    maximumAge?: number;
  } = {}
): Promise<{ location: LocationResult | null; error: LocationError | null }> {
  const {
    timeout = 10000,
    enableHighAccuracy = true,
    maximumAge = 0, // Always get fresh location
  } = options;

  return new Promise((resolve) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      resolve({
        location: null,
        error: {
          code: 0,
          message: 'Geolocation is not supported by this browser',
        },
      });
      return;
    }

    // Request location with timeout
    const timeoutId = setTimeout(() => {
      resolve({
        location: null,
        error: {
          code: 3, // TIMEOUT
          message: 'Location request timed out',
        },
      });
    }, timeout);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        resolve({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
          error: null,
        });
      },
      (error) => {
        clearTimeout(timeoutId);
        let message = 'Location permission denied';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
          default:
            message = 'Unknown location error';
        }

        resolve({
          location: null,
          error: {
            code: error.code,
            message,
          },
        });
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );
  });
}

/**
 * Check if location permission is granted
 */
export function hasLocationPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(false);
      return;
    }

    // Quick check - try to get position with very short timeout
    navigator.geolocation.getCurrentPosition(
      () => resolve(true),
      () => resolve(false),
      { timeout: 100, maximumAge: Infinity }
    );
  });
}

