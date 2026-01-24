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
    payment_method: 'cash' | 'momo' | 'revolut'
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
    status: 'pending' | 'processing' | 'completed' | 'failed'
    image_url: string
    created_at: string
}

export interface IngestStagingItem {
    id: string
    job_id: string
    name: string
    description: string
    price: number
    category: string
    confidence: number
    status: 'draft' | 'approved' | 'rejected'
}

export interface ServiceRequest {
    id: string
    venue_id: string
    table_no: string
    status: 'pending' | 'resolved'
    created_at: string
}

// Note: VenueClaim type removed - claims are now tracked via vendors.claimed column
