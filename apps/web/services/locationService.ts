/**
 * Centralized Location Service
 * Device-based location permission (request once, reuse)
 * Stores permission state to avoid repeated prompts
 */

export interface Location {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: number;
}

export type LocationStatus = 'prompt' | 'granted' | 'denied' | 'error' | 'unsupported';

interface LocationServiceState {
  status: LocationStatus;
  location: Location | null;
  watchId: number | null;
}

const STORAGE_KEY_PERMISSION = 'dinein_location_permission';
const STORAGE_KEY_LOCATION = 'dinein_last_location';

class LocationService {
  private state: LocationServiceState = {
    status: 'prompt',
    location: null,
    watchId: null,
  };

  private listeners: Set<(location: Location | null, status: LocationStatus) => void> = new Set();

  constructor() {
    this.initialize();
  }

  /**
   * Initialize service - check stored permission state
   */
  private initialize() {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      this.state.status = 'unsupported';
      return;
    }

    // Check stored permission state
    const storedPermission = localStorage.getItem(STORAGE_KEY_PERMISSION) as LocationStatus | null;
    if (storedPermission && ['granted', 'denied'].includes(storedPermission)) {
      this.state.status = storedPermission;
      
      // If permission was granted, try to get location
      if (storedPermission === 'granted') {
        this.loadStoredLocation();
        this.watchLocation();
      }
    }
  }

  /**
   * Load last known location from storage
   */
  private loadStoredLocation() {
    const stored = localStorage.getItem(STORAGE_KEY_LOCATION);
    if (stored) {
      try {
        const location = JSON.parse(stored);
        // Only use if less than 5 minutes old
        if (Date.now() - location.timestamp < 5 * 60 * 1000) {
          this.state.location = location;
          this.notifyListeners();
        }
      } catch (e) {
        // Invalid stored data
      }
    }
  }

  /**
   * Store location in localStorage
   */
  private storeLocation(location: Location) {
    localStorage.setItem(STORAGE_KEY_LOCATION, JSON.stringify(location));
  }

  /**
   * Store permission status
   */
  private storePermissionStatus(status: LocationStatus) {
    if (status === 'granted' || status === 'denied') {
      localStorage.setItem(STORAGE_KEY_PERMISSION, status);
    }
  }

  /**
   * Request location permission (only called once)
   * Returns location immediately if permission already granted
   */
  async requestPermission(): Promise<{ location: Location | null; status: LocationStatus }> {
    // If already granted, return current location
    if (this.state.status === 'granted') {
      if (this.state.location) {
        return { location: this.state.location, status: 'granted' };
      }
      // Try to get fresh location
      return this.getCurrentLocation();
    }

    // If already denied, return
    if (this.state.status === 'denied') {
      return { location: null, status: 'denied' };
    }

    // If unsupported, return
    if (this.state.status === 'unsupported') {
      return { location: null, status: 'unsupported' };
    }

    // Request permission (triggers browser prompt only if not yet granted/denied)
    return this.getCurrentLocation(true);
  }

  /**
   * Get current location (doesn't trigger permission prompt if already denied)
   */
  private getCurrentLocation(requestPermission = false): Promise<{ location: Location | null; status: LocationStatus }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        this.state.status = 'unsupported';
        resolve({ location: null, status: 'unsupported' });
        return;
      }

      // If permission already denied and not requesting, return
      if (this.state.status === 'denied' && !requestPermission) {
        resolve({ location: null, status: 'denied' });
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0, // Get fresh location
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
          };

          this.state.location = location;
          this.state.status = 'granted';
          this.storeLocation(location);
          this.storePermissionStatus('granted');
          this.watchLocation(); // Start watching for updates
          this.notifyListeners();
          
          resolve({ location, status: 'granted' });
        },
        (error) => {
          let status: LocationStatus = 'error';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              status = 'denied';
              break;
            case error.POSITION_UNAVAILABLE:
              status = 'error';
              break;
            case error.TIMEOUT:
              status = 'error';
              break;
          }

          this.state.status = status;
          this.storePermissionStatus(status);
          this.notifyListeners();
          
          resolve({ location: null, status });
        },
        options
      );
    });
  }

  /**
   * Watch location changes (only if permission granted)
   */
  private watchLocation() {
    // Stop existing watch
    if (this.state.watchId !== null) {
      navigator.geolocation.clearWatch(this.state.watchId);
    }

    // Only watch if permission granted
    if (this.state.status !== 'granted' || !navigator.geolocation) {
      return;
    }

    this.state.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        };

        this.state.location = location;
        this.storeLocation(location);
        this.notifyListeners();
      },
      (error) => {
        // On error, stop watching
        if (this.state.watchId !== null) {
          navigator.geolocation.clearWatch(this.state.watchId);
          this.state.watchId = null;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000, // Accept location up to 1 minute old
      }
    );
  }

  /**
   * Get current location (non-blocking, uses cached if available)
   */
  getLocation(): Location | null {
    return this.state.location;
  }

  /**
   * Get current status
   */
  getStatus(): LocationStatus {
    return this.state.status;
  }

  /**
   * Subscribe to location updates
   */
  subscribe(listener: (location: Location | null, status: LocationStatus) => void): () => void {
    this.listeners.add(listener);
    
    // Immediately notify with current state
    listener(this.state.location, this.state.status);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners() {
    this.listeners.forEach((listener) => {
      listener(this.state.location, this.state.status);
    });
  }

  /**
   * Clear permission (user can disable later)
   */
  clearPermission() {
    this.state.status = 'prompt';
    this.state.location = null;
    
    // Stop watching
    if (this.state.watchId !== null) {
      navigator.geolocation.clearWatch(this.state.watchId);
      this.state.watchId = null;
    }

    // Clear storage
    localStorage.removeItem(STORAGE_KEY_PERMISSION);
    localStorage.removeItem(STORAGE_KEY_LOCATION);
    
    this.notifyListeners();
  }
}

// Export singleton instance
export const locationService = new LocationService();



