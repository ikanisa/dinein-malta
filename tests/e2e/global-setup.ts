/**
 * E2E Global Setup - Fetches Real Data from Supabase
 * 
 * This runs BEFORE tests to fetch real venue data from your database.
 * No mocks, no placeholders - uses actual production/staging data.
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

interface VenueData {
    slug: string;
    name: string;
    country: string;
    id: string;
}

async function globalSetup() {
    console.log('🔄 E2E Global Setup: Fetching real venue data from Supabase...\n');

    // Get Supabase credentials from environment
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase credentials!');
        console.error('   Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch active venues from database
    const { data: venues, error } = await supabase
        .from('vendors')
        .select('id, slug, name, country')
        .eq('status', 'active')
        .order('name')
        .limit(10);

    if (error) {
        console.error('❌ Failed to fetch venues:', error.message);
        process.exit(1);
    }

    if (!venues || venues.length === 0) {
        console.error('❌ No active venues found in database!');
        console.error('   Make sure you have at least one venue with status="active"');
        process.exit(1);
    }

    console.log(`✅ Found ${venues.length} active venues:\n`);
    venues.forEach((v: VenueData, i: number) => {
        console.log(`   ${i + 1}. ${v.name} (${v.slug}) - ${v.country}`);
    });

    // Use first venue as primary test venue
    const primaryVenue = venues[0] as VenueData;

    // Write venue data to temp file for tests to read
    const testDataPath = path.join(__dirname, '.test-data.json');
    const testData = {
        primaryVenue: {
            id: primaryVenue.id,
            slug: primaryVenue.slug,
            name: primaryVenue.name,
            country: primaryVenue.country,
        },
        allVenues: venues,
        fetchedAt: new Date().toISOString(),
    };

    fs.writeFileSync(testDataPath, JSON.stringify(testData, null, 2));
    console.log(`\n📁 Wrote test data to: ${testDataPath}`);
    console.log(`🎯 Primary test venue: ${primaryVenue.name} (/${primaryVenue.slug})\n`);

    // Also set environment variable for specs
    process.env.E2E_VENUE_SLUG = primaryVenue.slug;
    process.env.E2E_VENUE_ID = primaryVenue.id;
    process.env.E2E_VENUE_NAME = primaryVenue.name;
}

export default globalSetup;
