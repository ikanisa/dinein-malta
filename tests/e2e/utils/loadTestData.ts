/**
 * Load Real Test Data from Supabase
 * 
 * This module reads the venue data fetched by global-setup.ts
 * to provide real Supabase data to E2E tests.
 */

import * as fs from 'fs';
import * as path from 'path';

interface VenueData {
    id: string;
    slug: string;
    name: string;
    country: string;
}

interface TestDataFile {
    primaryVenue: VenueData;
    allVenues: VenueData[];
    fetchedAt: string;
}

let cachedData: TestDataFile | null = null;

/**
 * Load real venue data from .test-data.json (created by global-setup.ts)
 */
export function loadTestData(): TestDataFile {
    if (cachedData) return cachedData;

    const dataPath = path.join(__dirname, '..', '.test-data.json');

    if (!fs.existsSync(dataPath)) {
        throw new Error(
            'Test data file not found! Run global-setup first.\n' +
            'Make sure Playwright is configured with globalSetup: "./global-setup.ts"'
        );
    }

    const raw = fs.readFileSync(dataPath, 'utf-8');
    cachedData = JSON.parse(raw) as TestDataFile;
    return cachedData;
}

/**
 * Get primary test venue (real data from Supabase)
 */
export function getPrimaryVenue(): VenueData {
    return loadTestData().primaryVenue;
}

/**
 * Get all available test venues (real data from Supabase)
 */
export function getAllVenues(): VenueData[] {
    return loadTestData().allVenues;
}
