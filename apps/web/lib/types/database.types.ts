export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            vendors: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    owner_id?: string // Legacy might be flexible
                    name: string
                    slug: string
                    description: string | null
                    address: string | null
                    city: string | null
                    lat: number | null
                    lng: number | null
                    ai_image_url: string | null
                    photos_json: Json | null
                    cuisine_types: string[] | null
                    price_level: string | null
                    is_active: boolean
                    rating: number | null
                    review_count?: number // Computed or separate? Keep optional
                    features?: string[] | null // Check mapping to special_features
                    special_features: string[] | null
                    ambiance_tags: string[] | null
                    hours_json: Json | null
                    phone: string | null
                    website: string | null
                    last_ai_update: string | null
                    ai_category_confidence: number | null
                    primary_category: string | null
                    ai_description: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    owner_id?: string
                    name: string
                    slug: string
                    description?: string | null
                    address?: string | null
                    city?: string | null
                    lat?: number | null
                    lng?: number | null
                    ai_image_url?: string | null
                    photos_json?: Json | null
                    cuisine_types?: string[] | null
                    price_level?: string | null
                    is_active?: boolean
                    rating?: number | null
                    special_features?: string[] | null
                    ambiance_tags?: string[] | null
                    hours_json?: Json | null
                    phone?: string | null
                    website?: string | null
                    last_ai_update?: string | null
                    ai_category_confidence?: number | null
                    primary_category?: string | null
                    ai_description?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    owner_id?: string
                    name?: string
                    slug?: string
                    description?: string | null
                    address?: string | null
                    city?: string | null
                    lat?: number | null
                    lng?: number | null
                    ai_image_url?: string | null
                    photos_json?: Json | null
                    cuisine_types?: string[] | null
                    price_level?: string | null
                    is_active?: boolean
                    rating?: number | null
                    special_features?: string[] | null
                    ambiance_tags?: string[] | null
                    hours_json?: Json | null
                    phone?: string | null
                    website?: string | null
                    last_ai_update?: string | null
                    ai_category_confidence?: number | null
                    primary_category?: string | null
                    ai_description?: string | null
                }
                Relationships: [
                    // {
                    //     foreignKeyName: "vendors_owner_id_fkey"
                    //     columns: ["owner_id"]
                    //     referencedRelation: "profiles"
                    //     referencedColumns: ["id"]
                    // }
                ]
            }
            menu_items: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    venue_id: string
                    category: string | null // Text-based category in legacy
                    name: string
                    description: string | null
                    price: number
                    currency: string
                    image_url: string | null
                    is_available: boolean
                    dietary_tags: string[] | null
                    ingredients: string[] | null
                    calories: number | null
                    spiciness_level: number | null
                    preparation_time: number | null
                    last_ai_update: string | null
                    smart_category: string | null
                    flavor_profile: string[] | null
                    meal_period: string[] | null
                    pairing_suggestions: string[] | null
                    ai_image_url: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    venue_id: string
                    category?: string | null
                    name: string
                    description?: string | null
                    price: number
                    currency?: string
                    image_url?: string | null
                    is_available?: boolean
                    dietary_tags?: string[] | null
                    ingredients?: string[] | null
                    calories?: number | null
                    spiciness_level?: number | null
                    preparation_time?: number | null
                    last_ai_update?: string | null
                    smart_category?: string | null
                    flavor_profile?: string[] | null
                    meal_period?: string[] | null
                    pairing_suggestions?: string[] | null
                    ai_image_url?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    venue_id?: string
                    category?: string | null
                    name?: string
                    description?: string | null
                    price?: number
                    currency?: string
                    image_url?: string | null
                    is_available?: boolean
                    dietary_tags?: string[] | null
                    ingredients?: string[] | null
                    calories?: number | null
                    spiciness_level?: number | null
                    preparation_time?: number | null
                    last_ai_update?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "menu_items_venue_id_fkey"
                        columns: ["venue_id"]
                        referencedRelation: "venues"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
    }
}
