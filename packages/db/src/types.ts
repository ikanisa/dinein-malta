export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Venue {
    id: string
    slug: string
    name: string
    country: 'RW' | 'MT'
    ai_image_url?: string | null
    description?: string | null
    address?: string | null
    city?: string | null
    rating?: number | null
    price_level?: number | null
    revolut_link?: string | null
    whatsapp?: string | null  // Used for MoMo USSD code in Rwanda
    phone?: string | null
    claimed: boolean
    owner_email?: string | null
    owner_pin?: string | null
    owner_phone?: string | null
    contact_email?: string | null
    created_at: string
}

export interface MenuItem {
    id: string
    venue_id: string
    category_id: string
    name: string
    description?: string | null
    price: number
    currency: 'RWF' | 'EUR'
    image_url?: string | null
    available: boolean
    sort_order: number
}

export interface MenuCategory {
    id: string
    venue_id: string
    name: string
    sort_order: number
}

export interface Order {
    id: string
    venue_id: string
    status: 'placed' | 'received' | 'served' | 'cancelled'
    total_amount: number
    currency: 'RWF' | 'EUR'
    table_no?: string | null
    payment_method: 'cash' | 'momo_ussd' | 'revolut_link'
    created_at: string
    items?: OrderItem[]
}

export interface OrderItem {
    id: string
    order_id: string
    menu_item_id: string
    quantity: number
    price: number
    currency: 'RWF' | 'EUR'
    name: string // Snapshot of name at time of order
    created_at: string
}

export interface IngestJob {
    id: string
    venue_id: string
    created_by: string
    file_path: string
    status: 'pending' | 'running' | 'needs_review' | 'published' | 'failed'
    error_code?: string | null
    error_message?: string | null
    attempt_count: number
    next_attempt_at?: string | null
    started_at?: string | null
    finished_at?: string | null
    created_at: string
    updated_at: string
}

export interface IngestStagingItem {
    id: string
    job_id: string
    venue_id: string
    raw_category?: string | null
    name: string
    description?: string | null
    price?: number | null
    currency?: string | null
    confidence: number
    parse_warnings: string[]
    suggested_action: 'keep' | 'edit' | 'drop'
    created_at: string
}

export interface ServiceRequest {
    id: string
    venue_id: string
    table_no: string
    status: 'pending' | 'resolved'
    created_at: string
}

// Note: VenueClaim type removed - claims are now tracked via vendors.claimed column
