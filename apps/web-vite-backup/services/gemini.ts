
import { supabase } from './supabase';

export interface VenueCategory {
    primary_category: string;
    cuisine_types: string[];
    ambiance_tags: string[];
    price_range: string;
    highlights: string[];
    dietary_friendly: string[];
    popular_times?: string;
    competitor_context?: string;
}

export interface MenuItem {
    id?: string;
    name: string;
    description?: string;
}

export interface MenuClassification {
    dietary_tags: string[];
    flavor_profile: string[];
    smart_category: string;
    cuisine_style: string;
    meal_period: string[];
    pairing_suggestions: string;
}

export interface MenuCategorization {
    [itemId: string]: MenuClassification;
}

export class GeminiService {
    private static async invoke<T>(action: string, payload: any): Promise<T> {
        const { data, error } = await supabase.functions.invoke('gemini-features', {
            body: { action, payload },
        });

        if (error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }

        if (!data.success) {
            throw new Error(`Gemini Operation Failed: ${data.message || 'Unknown error'}`);
        }

        return data.data as T;
    }

    static async categorizeVenue(name: string, address: string, description?: string, lat?: number, lng?: number): Promise<VenueCategory> {
        return this.invoke<VenueCategory>('categorize-venue', {
            name,
            address,
            description,
            lat,
            lng,
        });
    }

    static async categorizeMenu(items: MenuItem[], venueName?: string): Promise<MenuCategorization> {
        return this.invoke<MenuCategorization>('categorize-menu', {
            items,
            venueName,
        });
    }

    static async generateImage(prompt: string, modelPreference: 'quality' | 'fast' = 'quality'): Promise<string> {
        return this.invoke<string>('generate-image', {
            prompt,
            modelPreference,
        });
    }

    static async generateAsset(entityId: string, table: 'vendors' | 'menu_items', prompt: string): Promise<{ success: boolean; url: string }> {
        return this.invoke<{ success: boolean; url: string }>('generate-asset', {
            entityId,
            table,
            column: 'ai_image_url',
            prompt,
        });
    }
}
