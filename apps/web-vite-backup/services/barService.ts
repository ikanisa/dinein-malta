/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from './supabase';
import { Venue, MenuItem } from '../types';

// --- BAR ONBOARDING SERVICE ---
// Handles bar/restaurant onboarding, menu OCR, and AI features

/**
 * Search existing vendors by name/address
 */
export async function searchBars(query: string): Promise<Venue[]> {
    if (!query || query.length < 2) return [];

    const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .or(`name.ilike.%${query}%,address.ilike.%${query}%`)
        .eq('status', 'active')
        .limit(10);

    if (error) {
        console.error('Error searching bars:', error);
        return [];
    }

    return (data || []).map(mapVendorToVenue);
}

/**
 * Create a new bar/vendor
 */
export async function createBar(data: {
    name: string;
    momoCode?: string;
    whatsapp?: string;
    country?: string;
    address?: string;
}): Promise<Venue> {
    // Generate slug from name
    const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        + '-' + Date.now().toString(36);

    const { data: vendor, error } = await supabase
        .from('vendors')
        .insert({
            name: data.name,
            slug,
            momo_code: data.momoCode || null,
            whatsapp: data.whatsapp || null,
            country: data.country || 'MT',
            address: data.address || null,
            status: 'pending',
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create bar: ${error.message}`);
    }

    return mapVendorToVenue(vendor);
}

/**
 * Upload menu image and extract items via OCR
 */
export async function parseMenuWithOCR(file: File): Promise<MenuItem[]> {
    // Convert file to base64
    const base64 = await fileToBase64(file);
    const mimeType = file.type || 'image/jpeg';

    // Call gemini-features edge function
    const { data, error } = await supabase.functions.invoke('gemini-features', {
        body: {
            action: 'parse-menu',
            payload: {
                fileData: base64,
                mimeType,
            },
        },
    });

    if (error) {
        throw new Error(`Menu OCR failed: ${error.message}`);
    }

    // Map extracted items to MenuItem format
    return (data || []).map((item: any, index: number) => ({
        id: `temp-${index}-${Date.now()}`,
        name: item.name || 'Unnamed Item',
        description: item.description || '',
        price: parseFloat(item.price) || 0,
        category: item.category || 'Uncategorized',
        available: true,
        tags: item.tags || [],
    }));
}

/**
 * Generate AI image for a menu item
 */
export async function generateMenuItemImage(item: MenuItem): Promise<string | null> {
    const prompt = `Professional food photography of "${item.name}" - ${item.description || item.category}. 
Clean white plate, soft natural lighting, shallow depth of field, restaurant quality presentation.
Style: Modern food photography, appetizing, high-end restaurant menu.`;

    const { data, error } = await supabase.functions.invoke('gemini-features', {
        body: {
            action: 'generate-image',
            payload: {
                prompt,
            },
        },
    });

    if (error) {
        console.error('Image generation failed:', error);
        return null;
    }

    return data || null;
}

/**
 * Generate AI profile (description + image) for a bar
 */
export async function enrichBarProfile(name: string, address: string): Promise<{
    description: string;
    imageUrl: string | null;
}> {
    // First, enrich profile with Google Search data
    const { data: enriched, error: enrichError } = await supabase.functions.invoke('gemini-features', {
        body: {
            action: 'enrich-profile',
            payload: { name, address },
        },
    });

    if (enrichError) {
        console.error('Profile enrichment failed:', enrichError);
    }

    const description = enriched?.description ||
        `Welcome to ${name}. We offer a great selection of drinks and food in a welcoming atmosphere.`;

    // Generate representative bar image
    const imagePrompt = `Professional exterior photo of "${name}" bar/restaurant. 
Modern establishment, warm inviting atmosphere, evening ambiance with soft lighting.
Style: High-end real estate photography, welcoming, premium feel.`;

    const { data: imageData, error: imageError } = await supabase.functions.invoke('gemini-features', {
        body: {
            action: 'generate-image',
            payload: { prompt: imagePrompt },
        },
    });

    return {
        description,
        imageUrl: imageError ? null : imageData,
    };
}

/**
 * Bulk create menu items for a vendor
 */
export async function bulkCreateMenuItems(
    vendorId: string,
    items: Omit<MenuItem, 'id'>[]
): Promise<MenuItem[]> {
    const insertData = items.map((item) => ({
        vendor_id: vendorId,
        name: item.name,
        description: item.description || null,
        price: item.price,
        category: item.category || 'Uncategorized',
        is_available: item.available !== false,
        tags_json: item.tags || [],
        image_url: item.imageUrl || null,
        ai_image_url: null,
    }));

    const { data, error } = await supabase
        .from('menu_items')
        .insert(insertData)
        .select();

    if (error) {
        throw new Error(`Failed to create menu items: ${error.message}`);
    }

    return (data || []).map(mapMenuItem);
}

/**
 * Update menu item availability
 */
export async function updateMenuItemAvailability(
    itemId: string,
    available: boolean
): Promise<void> {
    const { error } = await supabase
        .from('menu_items')
        .update({ is_available: available, updated_at: new Date().toISOString() })
        .eq('id', itemId);

    if (error) {
        throw new Error(`Failed to update menu item: ${error.message}`);
    }
}

/**
 * Link user to vendor as owner
 */
export async function linkUserToVendor(vendorId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { error } = await supabase
        .from('vendor_users')
        .insert({
            vendor_id: vendorId,
            auth_user_id: user.id,
            role: 'owner',
            is_active: true,
        });

    if (error) {
        throw new Error(`Failed to link user to vendor: ${error.message}`);
    }
}

// --- HELPERS ---

async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function mapVendorToVenue(row: any): Venue {
    return {
        id: row.id,
        name: row.name || '',
        address: row.address || '',
        description: row.ai_description || '',
        revolutHandle: row.revolut_link || '',
        phone: row.phone || undefined,
        whatsappNumber: row.whatsapp || undefined,
        website: row.website || undefined,
        imageUrl: row.ai_image_url || row.photos_json?.[0] || undefined,
        menu: [],
        status: row.status || 'pending',
    };
}

function mapMenuItem(row: any): MenuItem {
    return {
        id: row.id,
        name: row.name || '',
        description: row.description || '',
        price: parseFloat(row.price) || 0,
        category: row.category || 'Uncategorized',
        available: row.is_available !== false,
        tags: row.tags_json || [],
        imageUrl: row.ai_image_url || row.image_url || undefined,
    };
}
