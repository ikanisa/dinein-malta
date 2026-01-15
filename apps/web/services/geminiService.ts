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
 * Invoke Gemini Edge Function
 */
const invokeGemini = async (action: string, payload: any) => {
  const { data, error } = await supabase.functions.invoke('gemini-features', {
    body: { action, ...payload }
  });
  if (error) throw error;
  return data;
};

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
// DISCOVERY & SEARCH (Vendor/Admin Only)
// ============================================================================

/**
 * Find venues for claiming (vendor onboarding)
 * NOTE: This is vendor/admin functionality only, not for client UI
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
