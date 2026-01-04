/**
 * Gemini Service - Simplified and Clean
 * Direct API calls to Gemini Edge Function with caching
 */

import { supabase } from './supabase';
import { cacheService, generateCacheKey } from './cacheService';

export interface VenueResult {
  name: string;
  google_place_id?: string;
  address?: string;
  lat?: number;
  lng?: number;
  distance_meters?: number;
  rating?: number;
  price_level?: number;
  website?: string;
  phone?: string;
  whatsapp?: string;
  photo_url?: string;
  photo_references?: string[];
  visualVibe?: string;
  category?: string;
  summary?: string;
  quick_tags?: string[];
  category_tags?: string[];
  why_recommended?: string;
  city?: string;
  country?: string;
}

export interface UIContext {
  appName: string;
  greeting: string;
  currencySymbol: string;
  visualVibe?: string;
  cityName?: string;
  country?: string;
}

/**
 * Invoke Gemini Edge Function with retry logic
 */
async function invokeGeminiFunction(action: string, payload: any, retries = 2): Promise<any> {
  const maxRetries = retries;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await invokeGemini(action, payload);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on client errors (4xx)
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status;
        if (status >= 400 && status < 500) {
          throw lastError;
        }
      }

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  throw lastError || new Error('Failed to invoke Gemini function');
}

// ============================================================================
// DISCOVERY & SEARCH
// ============================================================================

/**
 * Discover nearby venues (sorted by distance, nearest first)
 * Cached for 10 minutes to reduce API calls
 */
export const findNearbyPlaces = async (
  lat: number,
  lng: number,
  excludeNames: string[] = [],
  radius = 5000
): Promise<VenueResult[]> => {
  // Round coordinates to reduce cache misses for nearby locations
  const roundedLat = Math.round(lat * 100) / 100; // ~1km precision
  const roundedLng = Math.round(lng * 100) / 100;
  const cacheKey = generateCacheKey('venues_discover', roundedLat, roundedLng, radius);
  
  // Check cache first
  const cached = cacheService.get<VenueResult[]>(cacheKey);
  if (cached) {
    return cached.filter((v: VenueResult) => !excludeNames.includes(v.name));
  }
  
  try {
    const results = await invokeGeminiFunction('discover', { lat, lng, radius });
    const venues = Array.isArray(results) ? results : [];
    
    // Cache for 10 minutes
    cacheService.set(cacheKey, venues, 10 * 60 * 1000);
    
    return venues.filter((v: VenueResult) => !excludeNames.includes(v.name));
  } catch (error) {
    console.warn('Gemini API failed for nearby places', error);
    return [];
  }
};

/**
 * Find venues for claiming (vendor onboarding)
 */
export const findVenuesForClaiming = async (lat: number, lng: number): Promise<VenueResult[]> => {
  try {
    const results = await invokeGeminiFunction('discover', { lat, lng, radius: 2000 });
    return Array.isArray(results) ? results : [];
  } catch (error) {
    console.warn('Gemini API failed for venue discovery', error);
    return [];
  }
};

/**
 * Search venues by query
 */
export const searchPlacesByName = async (
  query: string,
  lat?: number,
  lng?: number
): Promise<VenueResult[]> => {
  try {
    const results = await invokeGeminiFunction('search', { query, lat, lng });
    return Array.isArray(results) ? results : [];
  } catch (error) {
    console.warn('Gemini API failed for venue search', error);
    return [];
  }
};

/**
 * Discover global/popular venues (uses user location if available)
 */
export const discoverGlobalVenues = async (userLat?: number, userLng?: number): Promise<VenueResult[]> => {
  try {
    if (userLat && userLng) {
      const results = await invokeGeminiFunction('discover', { 
        lat: userLat, 
        lng: userLng, 
        radius: 5000 
      });
      return Array.isArray(results) ? results : [];
    }
    
    // Try to get location from browser
    const { locationService } = await import('./locationService');
    const location = locationService.getLocation() || (await locationService.requestPermission()).location;
    
    if (location) {
      const results = await invokeGeminiFunction('discover', { 
        lat: location.lat, 
        lng: location.lng, 
        radius: 5000 
      });
      return Array.isArray(results) ? results : [];
    }
    
    // No location - use generic search
    const results = await invokeGeminiFunction('search', {
      query: "popular bars and restaurants nearby",
    });
    return Array.isArray(results) ? results : [];
  } catch (error) {
    console.warn('Gemini API failed for global venue discovery', error);
    return [];
  }
};

// ============================================================================
// ENRICHMENT
// ============================================================================

/**
 * Enrich venue profile with Google Maps and Search data
 */
export const enrichVenueProfile = async (
  name: string,
  address: string
): Promise<any> => {
  try {
    return await invokeGeminiFunction('enrich-profile', { name, address });
  } catch (error) {
    console.warn('Gemini API failed for venue enrichment', error);
    return {};
  }
};

// ============================================================================
// LOCATION ADAPTATION
// ============================================================================

/**
 * Adapt UI based on location
 * Cached for 1 hour (location UI context doesn't change frequently)
 */
export const adaptUiToLocation = async (lat: number, lng: number): Promise<UIContext> => {
  // Round coordinates for cache key
  const roundedLat = Math.round(lat * 100) / 100;
  const roundedLng = Math.round(lng * 100) / 100;
  const cacheKey = generateCacheKey('ui_adapt', roundedLat, roundedLng);
  
  // Check cache first
  const cached = cacheService.get<UIContext>(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    const res = await invokeGeminiFunction('adapt', { lat, lng });
    
    const cityName = res?.cityName || 'Your Area';
    const country = res?.country || '';
    const currencySymbol = res?.currencySymbol || '$';
    const greeting = res?.greeting || "Welcome";
    
    const appName = cityName && cityName !== 'Your Area' 
      ? `DineIn ${cityName}` 
      : country 
        ? `DineIn ${country}`
        : 'DineIn';
    
    const result = {
      appName,
      greeting,
      currencySymbol,
      visualVibe: country ? `${cityName}, ${country}` : cityName,
      cityName,
      country,
    };
    
    // Cache for 1 hour
    cacheService.set(cacheKey, result, 60 * 60 * 1000);
    
    return result;
  } catch (error) {
    console.warn('Gemini API failed for UI adaptation', error);
    const fallback = {
      appName: "DineIn",
      greeting: "Welcome",
      currencySymbol: "$",
      visualVibe: "Local Dining",
      cityName: "Your Area",
      country: "",
    };
    // Cache fallback for shorter time (5 minutes)
    cacheService.set(cacheKey, fallback, 5 * 60 * 1000);
    return fallback;
  }
};

// ============================================================================
// IMAGE GENERATION
// ============================================================================

/**
 * Generate venue thumbnail image (internal - used by caching service)
 */
const _generateVenueThumbnailRaw = async (
  venueName: string,
  vibe: string,
  locationContext?: { city?: string; country?: string; lat?: number; lng?: number },
  referenceImages?: string[]
): Promise<string | null> => {
  try {
    const result = await invokeGeminiFunction('generate-image', {
      prompt: `Cinematic professional photo of ${venueName} restaurant or bar. Style: ${vibe}. High quality, appetizing, professional restaurant photography.`,
      size: '2K',
      locationContext,
      referenceImages
    });
    
    return typeof result === 'string' ? result : null;
  } catch (error) {
    console.warn('Gemini API failed for venue thumbnail generation', error);
    return null;
  }
};

/**
 * Generate venue thumbnail with Supabase storage caching and weekly rotation
 */
export const generateVenueThumbnail = async (
  venueName: string,
  vibe: string,
  locationContext?: { city?: string; country?: string; lat?: number; lng?: number },
  referenceImages?: string[]
): Promise<string | null> => {
  const { getVenueThumbnailWithCache } = await import('./imageCache');
  return getVenueThumbnailWithCache(
    venueName, 
    vibe, 
    (name: string, v: string) => _generateVenueThumbnailRaw(name, v, locationContext, referenceImages)
  );
};

/**
 * Generate menu item image (internal - used by caching service)
 */
const _generateMenuItemImageRaw = async (
  itemName: string,
  description: string
): Promise<string | null> => {
  try {
    const result = await invokeGeminiFunction('generate-image', {
      prompt: `Professional appetizing food photography of ${itemName}. ${description}. Centered, restaurant menu style.`,
      size: '2K'
    });
    
    return typeof result === 'string' ? result : null;
  } catch (error) {
    console.warn('Gemini API failed for menu item image generation', error);
    return null;
  }
};

/**
 * Generate menu item image with Supabase storage caching (permanent storage)
 */
export const generateMenuItemImage = async (
  vendorId: string,
  itemId: string,
  itemName: string,
  description: string
): Promise<string | null> => {
  const { getMenuItemImageWithCache } = await import('./imageCache');
  return getMenuItemImageWithCache(
    vendorId,
    itemId,
    itemName,
    description,
    _generateMenuItemImageRaw
  );
};

/**
 * Generate menu item image preview (for vendor dashboard preview)
 */
export const generateMenuItemImagePreview = async (
  itemName: string,
  description: string
): Promise<string | null> => {
  return _generateMenuItemImageRaw(itemName, description);
};

// ============================================================================
// MENU PARSING
// ============================================================================

/**
 * Parse menu from uploaded image
 */
export const parseMenuFromFile = async (fileData: string, mimeType: string): Promise<any[]> => {
  try {
    return await invokeGeminiFunction('parse-menu', { fileData, mimeType });
  } catch (error) {
    console.warn('Gemini API failed for menu parsing', error);
    return [];
  }
};

// ============================================================================
// TEXT GENERATION
// ============================================================================

/**
 * Generate smart description for venue/menu item
 */
export const generateSmartDescription = async (name: string, category: string): Promise<string> => {
  try {
    return await invokeGeminiFunction('smart-description', { name, category });
  } catch (error) {
    console.warn('Gemini API failed for smart description', error);
    return "";
  }
};
