
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Credentials from user request
const SUPABASE_URL = "https://elhlcdiosomutugpneoc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaGxjZGlvc29tdXR1Z3BuZW9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODkwNTc1MywiZXhwIjoyMDc0NDgxNzUzfQ.INeWgLyQetYUZGQYiVx7GCB7fREKypaOfy-XEMhYi6A";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const TSV_FILE = path.resolve(process.cwd(), 'menu_data.tsv');

async function seed() {
    console.log('Reading menu data from:', TSV_FILE);
    const rawData = fs.readFileSync(TSV_FILE, 'utf-8');
    const lines = rawData.split('\n').filter(line => line.trim() !== '');

    // Headers: Bar Name, Item Name, Price, Category
    const headers = lines[0].split('\t');
    const data = lines.slice(1).map(line => {
        const cols = line.split('\t');
        return {
            barName: cols[0]?.trim(),
            itemName: cols[1]?.trim(),
            price: parseFloat(cols[2]?.trim()),
            category: cols[3]?.trim()
        };
    }).filter(item => item.barName && item.itemName);

    console.log(`Parsed ${data.length} menu items.`);

    // Group by Bar Name
    const bars: Record<string, typeof data> = {};
    for (const item of data) {
        if (!bars[item.barName]) bars[item.barName] = [];
        bars[item.barName].push(item);
    }

    for (const barName of Object.keys(bars)) {
        console.log(`Processing bar: ${barName}`);

        // Check if vendor exists
        let { data: vendor, error } = await supabase
            .from('venues')
            .select('id')
            .eq('name', barName)
            .single();

        if (!vendor) {
            console.log(`Vendor '${barName}' not found. Creating...`);
            // Create simplified vendor
            const slug = barName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const { data: newVendor, error: createError } = await supabase
                .from('venues')
                .insert({
                    name: barName,
                    slug: slug,
                    status: 'active',
                    google_place_id: `manual-${slug}`, // Placeholder
                    hours_json: {},
                    photos_json: []
                })
                .select('id')
                .single();

            if (createError) {
                console.error(`Failed to create vendor '${barName}':`, createError);
                continue;
            }
            vendor = newVendor;
        }

        if (!vendor) {
            console.error(`Skipping ${barName} due to vendor resolution failure.`);
            continue;
        }

        const vendorId = vendor.id;
        console.log(`Vendor ID for '${barName}': ${vendorId}`);

        // Clear existing menu items for this vendor to ensure clean state
        const { error: deleteError } = await supabase
            .from('menu_items')
            .delete()
            .eq('venue_id', vendorId);

        if (deleteError) {
            // If table doesn't exist, this will fail.
            if (deleteError.code === '42P01') { // undefined_table
                console.error('Table menu_items does not exist! Please assume migration is needed.');
                // I should ideally create it here if possible, but I can't run DDL easily.
                // But let's report it.
            }
            console.error(`Error clearing menu items for ${barName}:`, deleteError);
        }

        // Insert new items
        const itemsToInsert = bars[barName].map(item => ({
            venue_id: vendorId,
            name: item.itemName,
            price: item.price,
            category: item.category,
            is_available: true,
            currency: 'EUR'
        }));

        const { error: insertError } = await supabase
            .from('menu_items')
            .insert(itemsToInsert);

        if (insertError) {
            console.error(`Error inserting menu items for ${barName}:`, insertError);
        } else {
            console.log(`Successfully inserted ${itemsToInsert.length} items for ${barName}.`);
        }
    }
}

seed().catch(console.error);
