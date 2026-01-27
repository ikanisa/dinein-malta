/**
 * Ingest (OCR) query helpers for packages/db
 * Provides typed data access for menu OCR ingestion pipeline
 * 
 * Tables: menu_ingest_jobs, menu_items_staging
 * Flow: Upload → Job Created (pending) → Running → NeedsReview → Publish/Failed
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
 * @param filePath - Storage path of uploaded menu image
 * @param userId - Auth user ID who created the job
 * @returns Created job or null on error
 */
export async function createIngestJob(
    client: SupabaseClient,
    venueId: string,
    filePath: string,
    userId: string
): Promise<IngestJob | null> {
    const { data, error } = await client
        .from('menu_ingest_jobs')
        .insert({
            venue_id: venueId,
            file_path: filePath,
            created_by: userId,
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
        .from('menu_ingest_jobs')
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
        .from('menu_ingest_jobs')
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
        .from('menu_ingest_jobs')
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
        .from('menu_items_staging')
        .select('*')
        .eq('job_id', jobId)
        .order('raw_category', { ascending: true });

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
        raw_category: item.category ?? 'Uncategorized',
        confidence: item.confidence,
        suggested_action: 'keep' as const,
    }));

    const { data, error } = await client
        .from('menu_items_staging')
        .insert(rows)
        .select();

    if (error) {
        console.error('Error creating staging items:', error.message);
        return 0;
    }

    return data?.length ?? 0;
}

/**
 * Update staging item action (keep/edit/drop)
 * @param client - Supabase client instance
 * @param itemId - Staging item UUID
 * @param action - New action
 * @returns Updated item or null
 */
export async function updateStagingItemAction(
    client: SupabaseClient,
    itemId: string,
    action: IngestStagingItem['suggested_action']
): Promise<IngestStagingItem | null> {
    const { data, error } = await client
        .from('menu_items_staging')
        .update({ suggested_action: action })
        .eq('id', itemId)
        .select()
        .single();

    if (error) {
        console.error('Error updating staging item action:', error.message);
        return null;
    }

    return data as IngestStagingItem;
}

/**
 * Publish kept staging items to menu
 * Creates menu items from staging items with suggested_action='keep'
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
    currency: 'RWF' | 'EUR' = 'EUR'
): Promise<number> {
    // Get items to publish (action = 'keep')
    const { data: rawStagingItems, error: fetchError } = await client
        .from('menu_items_staging')
        .select('*')
        .eq('job_id', jobId)
        .neq('suggested_action', 'drop');

    if (fetchError || !rawStagingItems?.length) {
        console.error('Error fetching staging items:', fetchError?.message);
        return 0;
    }

    // Cast to typed array
    const stagingItems = rawStagingItems as IngestStagingItem[];

    // Create menu items
    const menuItems = stagingItems.map((item, _index) => ({
        venue_id: venueId,
        category: item.raw_category,
        name: item.name,
        description: item.description,
        price: item.price ?? 0,
        currency,
        is_available: true,
    }));

    const { data: created, error: insertError } = await client
        .from('menu_items')
        .insert(menuItems)
        .select();

    if (insertError) {
        console.error('Error creating menu items:', insertError.message);
        return 0;
    }

    // Mark job as published
    await client
        .from('menu_ingest_jobs')
        .update({ status: 'published', updated_at: new Date().toISOString() })
        .eq('id', jobId);

    return created?.length ?? 0;
}
