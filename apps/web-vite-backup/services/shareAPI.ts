/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Web Share API Service
 * Handles sharing functionality
 */

export interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

/**
 * Check if Web Share API is supported
 */
export function isShareSupported(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}

/**
 * Share content using Web Share API
 */
export async function share(data: ShareData): Promise<void> {
  if (!isShareSupported()) {
    // Fallback: copy to clipboard
    if (data.url) {
      try {
        await navigator.clipboard.writeText(data.url);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
    return;
  }

  try {
    await navigator.share(data);
  } catch (error: any) {
    // User cancelled or error occurred
    if (error.name !== 'AbortError') {
      console.error('Share failed:', error);
    }
  }
}

/**
 * Share venue
 */
export async function shareVenue(_venueId: string, venueName: string, url: string) {
  await share({
    title: `Check out ${venueName} on DineIn`,
    text: `I found this great place: ${venueName}`,
    url,
  });
}

/**
 * Share order
 */
export async function shareOrder(orderCode: string, venueName: string) {
  await share({
    title: `My order at ${venueName}`,
    text: `Order code: ${orderCode}`,
    url: window.location.origin,
  });
}



