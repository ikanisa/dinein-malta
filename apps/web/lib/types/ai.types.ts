export interface VenueCategorizationRequest {
    id: string
    name: string
    address: string
    description?: string
    latitude?: number
    longitude?: number
    cuisine_types?: string[]
}

export interface VenueCategorizationResponse {
    primary_category: string
    cuisine_types: string[]
    ambiance_tags: string[]
    price_range: '$' | '$$' | '$$$' | '$$$$'
    special_features: string[]
    confidence_score: number
    neighborhood_context?: {
        similar_venues: string[]
        local_trends: string[]
        avg_price_range: string
    }
}

export interface MenuItemCategorizationRequest {
    id: string
    name: string
    description?: string
    ingredients?: string[]
    allergens?: string[]
    venue_context?: {
        name: string
        cuisine_types: string[]
        primary_category: string
    }
}

export interface MenuItemCategorizationResponse {
    category: MenuCategory
    dietary_tags: DietaryTag[]
    cuisine_style: string
    flavor_profile: FlavorProfile[]
    meal_period: MealPeriod[]
    pairing_suggestions: string[]
    spice_level?: number
}

export type MenuCategory =
    | 'Appetizers'
    | 'Soups & Salads'
    | 'Mains'
    | 'Sides'
    | 'Desserts'
    | 'Beverages'
    | 'Specials'

export type DietaryTag =
    | 'Vegetarian'
    | 'Vegan'
    | 'Gluten-Free'
    | 'Dairy-Free'
    | 'Nut-Free'
    | 'Halal'
    | 'Kosher'
    | 'Low-Carb'
    | 'Keto'

export type FlavorProfile =
    | 'Spicy'
    | 'Sweet'
    | 'Savory'
    | 'Tangy'
    | 'Bitter'
    | 'Umami'
    | 'Rich'
    | 'Light'

export type MealPeriod =
    | 'Breakfast'
    | 'Brunch'
    | 'Lunch'
    | 'Dinner'
    | 'Late Night'
    | 'All Day'

export interface ImageGenerationRequest {
    type: 'venue' | 'menu_item'
    subject: string
    description: string
    style?: string
    context?: Record<string, unknown>
}

export interface ImageGenerationResponse {
    imageUrl: string
    base64?: string
    metadata: {
        model: string
        prompt: string
        timestamp: string
    }
}
