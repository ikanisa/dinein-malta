/**
 * Image Caching Service with Supabase Storage
 * Implements weekly rotation for venue images to save API consumption
 * while keeping the app dynamic
 */

import { supabase } from './supabase';

const BUCKET_NAME = 'venue-images';

interface ImageCacheEntry {
  venueName: string;
  imageUrl: string;
  generatedAt: number; // timestamp
  weekKey: string; // YYYY-WW format for weekly rotation
}

/**
 * Get current week key (YYYY-WW format)
 */
function getCurrentWeekKey(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
}

/**
 * Get cache key for venue image
 */
function getCacheKey(venueName: string, weekKey: string): string {
  const cleanName = venueName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `venue_${cleanName}_${weekKey}`;
}

/**
 * Upload image to Supabase storage
 */
async function uploadImageToStorage(
  venueName: string,
  imageData: string,
  weekKey: string
): Promise<string | null> {
  try {
    // Extract base64 data if it's a data URL
    const base64Data = imageData.includes(',') 
      ? imageData.split(',')[1] 
      : imageData;
    
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const blob = new Blob([buffer], { type: 'image/png' });
    
    const fileName = `${getCacheKey(venueName, weekKey)}.png`;
    const filePath = `${weekKey}/${fileName}`;
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, blob, {
        contentType: 'image/png',
        upsert: true, // Overwrite if exists
      });
    
    if (error) {
      console.error('Error uploading image to storage:', error);
      return null;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    return urlData?.publicUrl || null;
  } catch (error) {
    console.error('Error in uploadImageToStorage:', error);
    return null;
  }
}

/**
 * Get cached image URL from storage
 */
async function getCachedImageUrl(
  venueName: string,
  weekKey: string
): Promise<string | null> {
  try {
    const fileName = `${getCacheKey(venueName, weekKey)}.png`;
    const filePath = `${weekKey}/${fileName}`;
    
    // Check if file exists by listing
    const { data: listData, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(weekKey);
    
    if (listError) {
      // Bucket might not exist or might not have this week's folder yet
      return null;
    }
    
    const fileExists = listData?.some(file => file.name === fileName);
    if (!fileExists) {
      return null;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    return urlData?.publicUrl || null;
  } catch (error) {
    console.error('Error checking cached image:', error);
    return null;
  }
}

/**
 * Get or generate venue thumbnail with weekly rotation
 * This ensures one image per venue per week, cached in Supabase
 */
export async function getVenueThumbnailWithCache(
  venueName: string,
  vibe: string,
  generateImageFn: (name: string, vibe: string) => Promise<string | null>
): Promise<string | null> {
  const currentWeekKey = getCurrentWeekKey();
  
  // 1. Check Supabase storage for current week's image
  const cachedUrl = await getCachedImageUrl(venueName, currentWeekKey);
  if (cachedUrl) {
    return cachedUrl;
  }
  
  // 2. Check localStorage as fallback (for backward compatibility)
  const localCacheKey = `venue_thumb_${venueName.replace(/\s/g, '')}_${currentWeekKey}`;
  const localCached = localStorage.getItem(localCacheKey);
  if (localCached) {
    // Also upload to Supabase for future use
    const uploadedUrl = await uploadImageToStorage(venueName, localCached, currentWeekKey);
    if (uploadedUrl) {
      return uploadedUrl;
    }
    return localCached.startsWith('http') ? localCached : `data:image/png;base64,${localCached}`;
  }
  
  // 3. Generate new image (only if no cache exists for this week)
  try {
    const generatedImage = await generateImageFn(venueName, vibe);
    
    if (generatedImage) {
      // Upload to Supabase storage
      const uploadedUrl = await uploadImageToStorage(venueName, generatedImage, currentWeekKey);
      
      if (uploadedUrl) {
        // Cache URL in localStorage for quick access
        localStorage.setItem(localCacheKey, uploadedUrl);
        return uploadedUrl;
      }
      
      // Fallback to base64 if upload fails
      if (generatedImage.startsWith('data:')) {
        localStorage.setItem(localCacheKey, generatedImage);
        return generatedImage;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error generating venue thumbnail:', error);
    return null;
  }
}

/**
 * Get or generate menu item image with permanent caching
 * Menu item images are saved permanently (unlike venue images which rotate weekly)
 */
export async function getMenuItemImageWithCache(
  vendorId: string,
  itemId: string,
  itemName: string,
  description: string,
  generateImageFn: (name: string, desc: string) => Promise<string | null>
): Promise<string | null> {
  const cacheKey = `menu_item_${vendorId}_${itemId}`;
  const filePath = `menu-items/${vendorId}/${itemId}.png`;
  
  try {
    // 1. Check Supabase storage for existing image
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    if (urlData?.publicUrl) {
      // Verify file exists
      const response = await fetch(urlData.publicUrl, { method: 'HEAD' });
      if (response.ok) {
        return urlData.publicUrl;
      }
    }
    
    // 2. Check localStorage as fallback
    const localCached = localStorage.getItem(cacheKey);
    if (localCached && localCached.startsWith('http')) {
      // If it's a URL, try to upload it
      try {
        const imageResponse = await fetch(localCached);
        const blob = await imageResponse.blob();
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, blob, {
            contentType: 'image/png',
            upsert: true,
          });
        if (!uploadError) {
          const { data: newUrlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);
          return newUrlData?.publicUrl || localCached;
        }
      } catch (e) {
        // If upload fails, return the cached URL
        return localCached;
      }
      return localCached;
    }
    
    // 3. Generate new image
    const generatedImage = await generateImageFn(itemName, description);
    
    if (generatedImage) {
      // Upload to Supabase storage
      const base64Data = generatedImage.includes(',') 
        ? generatedImage.split(',')[1] 
        : generatedImage;
      
      const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      const blob = new Blob([buffer], { type: 'image/png' });
      
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, blob, {
          contentType: 'image/png',
          upsert: true,
        });
      
      if (!uploadError) {
        const { data: finalUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filePath);
        
        const finalUrl = finalUrlData?.publicUrl || null;
        if (finalUrl) {
          localStorage.setItem(cacheKey, finalUrl);
          return finalUrl;
        }
      }
      
      // Fallback to base64 if upload fails
      if (generatedImage.startsWith('data:')) {
        localStorage.setItem(cacheKey, generatedImage);
        return generatedImage;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error in getMenuItemImageWithCache:', error);
    return null;
  }
}

/**
 * Clean up old images (older than 4 weeks)
 * Call this periodically or on app start
 */
export async function cleanupOldImages(): Promise<void> {
  try {
    const currentWeekKey = getCurrentWeekKey();
    const currentWeek = parseInt(currentWeekKey.split('-W')[1]);
    const currentYear = parseInt(currentWeekKey.split('-W')[0]);
    
    // Get list of all files in bucket
    const { data: files, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' },
      });
    
    if (error || !files) {
      console.error('Error listing files for cleanup:', error);
      return;
    }
    
    // Delete files older than 4 weeks
    for (const file of files) {
      if (!file.name.includes('venue_')) continue;
      
      // Extract week from folder structure or filename
      const weekMatch = file.name.match(/(\d{4})-W(\d{2})/);
      if (!weekMatch) continue;
      
      const fileYear = parseInt(weekMatch[1]);
      const fileWeek = parseInt(weekMatch[2]);
      
      // Calculate week difference
      const weekDiff = (currentYear - fileYear) * 52 + (currentWeek - fileWeek);
      if (weekDiff > 4) {
        // Delete old file
        await supabase.storage
          .from(BUCKET_NAME)
          .remove([file.name]);
      }
    }
  } catch (error) {
    console.error('Error cleaning up old images:', error);
  }
}
