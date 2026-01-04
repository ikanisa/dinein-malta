import { supabase } from './supabase';

export async function findVenuesForClaiming(lat: number, lng: number): Promise<any[]> {
  const { data, error } = await supabase.functions.invoke('gemini-features', {
    body: {
      action: 'discover',
      payload: { lat, lng, radius: 5000 }
    }
  });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function searchPlacesByName(query: string, lat?: number, lng?: number): Promise<any[]> {
  const { data, error } = await supabase.functions.invoke('gemini-features', {
    body: {
      action: 'search',
      payload: { query, lat, lng }
    }
  });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function enrichVenueProfile(name: string, address: string): Promise<any> {
  const { data, error } = await supabase.functions.invoke('gemini-features', {
    body: {
      action: 'enrich-profile',
      payload: { name, address }
    }
  });

  if (error) throw error;
  return data || {};
}

export async function generateVenueThumbnail(name: string, vibe: string): Promise<string | null> {
  const { data, error } = await supabase.functions.invoke('gemini-features', {
    body: {
      action: 'generate-image',
      payload: {
        prompt: `Professional photo of ${name}. Style: ${vibe}. High quality restaurant photography.`,
        size: '2K'
      }
    }
  });

  if (error) throw error;
  return typeof data === 'string' ? data : null;
}



