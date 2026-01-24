/**
 * Ingest (OCR) query helpers for packages/db
 * Provides typed data access for menu OCR ingestion pipeline
 * 
 * Flow: Upload → Job Created (pending) → Processing → Completed → Staging Review → Publish
 */
import type { IngestJob, IngestStagingItem } from '../types';

// Permissive client type for cross-app compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

/**
 * Staging item with editable fields
 */
export type StagingItemForReview = IngestStagingItem & {
    isEdited?: boolean;
};

/**
 * Create a new ingest job (pending status)
 * @param client - Supabase client instance
 * @param venueId - Venue UUID
 * @param imageUrl - URL of uploaded menu image
 * @returns Created job or null on error
 */
export async function createIngestJob(
    client: SupabaseClient,
    venueId: string,
    imageUrl: string
): Promise<IngestJob | null> {
    const { data, error } = await client
        .from('ingest_jobs')
        .insert({
            venue_id: venueId,
            image_url: imageUrl,
            status: 'pending',
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating ingest job:', error.message);
        return null;
    }

    return data as IngestJob;
}

/**
 * Get ingest jobs for a venue
 * @param client - Supabase client instance
 * @param venueId - Venue UUID
 * @returns Array of jobs, newest first
 */
export async function getIngestJobs(
    client: SupabaseClient,
    venueId: string
): Promise<IngestJob[]> {
    const { data, error } = await client
        .from('ingest_jobs')
        .select('*')
        .eq('venue_id', venueId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching ingest jobs:', error.message);
        return [];
    }

    return (data ?? []) as IngestJob[];
}

/**
 * Get a single ingest job by ID
 * @param client - Supabase client instance
 * @param jobId - Job UUID
 * @returns Job or null
 */
export async function getIngestJob(
    client: SupabaseClient,
    jobId: string
): Promise<IngestJob | null> {
    const { data, error } = await client
        .from('ingest_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

    if (error) {
        console.error('Error fetching ingest job:', error.message);
        return null;
    }

    return data as IngestJob;
}

/**
 * Update ingest job status
 * @param client - Supabase client instance
 * @param jobId - Job UUID
 * @param status - New status
 * @returns Updated job or null on error
 */
export async function updateIngestJobStatus(
    client: SupabaseClient,
    jobId: string,
    status: IngestJob['status']
): Promise<IngestJob | null> {
    const { data, error } = await client
        .from('ingest_jobs')
        .update({ status })
        .eq('id', jobId)
        .select()
        .single();

    if (error) {
        console.error('Error updating ingest job status:', error.message);
        return null;
    }

    return data as IngestJob;
}

/**
 * Get staging items for a job
 * @param client - Supabase client instance
 * @param jobId - Job UUID
 * @returns Array of staging items
 */
export async function getStagingItems(
    client: SupabaseClient,
    jobId: string
): Promise<IngestStagingItem[]> {
    const { data, error } = await client
        .from('ingest_staging_items')
        .select('*')
        .eq('job_id', jobId)
        .order('category', { ascending: true });

    if (error) {
        console.error('Error fetching staging items:', error.message);
        return [];
    }

    return (data ?? []) as IngestStagingItem[];
}

/**
 * Create staging items from OCR parse result
 * @param client - Supabase client instance
 * @param jobId - Job UUID
 * @param items - Parsed menu items from OCR
 * @returns Number of items created
 */
export async function createStagingItems(
    client: SupabaseClient,
    jobId: string,
    items: Array<{
        name: string;
        description?: string | null;
        price: number;
        category?: string | null;
        confidence: number;
    }>
): Promise<number> {
    const rows = items.map(item => ({
        job_id: jobId,
        name: item.name,
        description: item.description ?? '',
        price: item.price,
        category: item.category ?? 'Uncategorized',
        confidence: item.confidence,
        status: 'draft',
    }));

    const { data, error } = await client
        .from('ingest_staging_items')
        .insert(rows)
        .select();

    if (error) {
        console.error('Error creating staging items:', error.message);
        return 0;
    }

    return data?.length ?? 0;
}

/**
 * Update staging item status
 * @param client - Supabase client instance
 * @param itemId - Staging item UUID
 * @param status - New status
 * @returns Updated item or null
 */
export async function updateStagingItemStatus(
    client: SupabaseClient,
    itemId: string,
    status: IngestStagingItem['status']
): Promise<IngestStagingItem | null> {
    const { data, error } = await client
        .from('ingest_staging_items')
        .update({ status })
        .eq('id', itemId)
        .select()
        .single();

    if (error) {
        console.error('Error updating staging item status:', error.message);
        return null;
    }

    return data as IngestStagingItem;
}

/**
 * Publish approved staging items to menu
 * Creates menu items from approved staging items
 * 
 * @param client - Supabase client instance
 * @param jobId - Job UUID
 * @param venueId - Venue UUID
 * @param currency - Currency for items ('RWF' | 'EUR')
 * @returns Number of items published
 */
export async function publishApprovedItems(
    client: SupabaseClient,
    jobId: string,
    venueId: string,
    currency: 'RWF' | 'EUR' = 'RWF'
): Promise<number> {
    // Get approved items
    const { data: rawStagingItems, error: fetchError } = await client
        .from('ingest_staging_items')
        .select('*')
        .eq('job_id', jobId)
        .eq('status', 'approved');

    if (fetchError || !rawStagingItems?.length) {
        console.error('Error fetching approved items:', fetchError?.message);
        return 0;
    }

    // Cast to typed array
    const stagingItems = rawStagingItems as IngestStagingItem[];

    // Create menu items
    const menuItems = stagingItems.map((item, index) => ({
        venue_id: venueId,
        category_id: null, // Would need category lookup/creation
        name: item.name,
        description: item.description,
        price: item.price,
        currency,
        available: true,
        sort_order: index,
    }));

    const { data: created, error: insertError } = await client
        .from('menu_items')
        .insert(menuItems)
        .select();

    if (insertError) {
        console.error('Error creating menu items:', insertError.message);
        return 0;
    }

    return created?.length ?? 0;
}
