-- Migration: Remove out-of-scope geolocation features
-- Date: 2026-01-24
-- Description: Cleans up geolocation features that violate STARTER RULES scope boundaries.
-- - Removes search_nearby_venues function (NO maps, NO geolocation, NO "near me")
-- - Removes coordinates column from vendors (geography type)
-- - Keeps lat/lng for now as they are stored but not used for geospatial queries

BEGIN;

-- 1. Drop the search_nearby_venues function (geolocation feature - out of scope)
DROP FUNCTION IF EXISTS public.search_nearby_venues(double precision, double precision, double precision, text, integer);
DROP FUNCTION IF EXISTS public.search_nearby_venues(double precision, double precision, int);

-- 2. Drop the coordinates column if it exists (geography type - PostGIS)
ALTER TABLE public.vendors DROP COLUMN IF EXISTS coordinates;

-- 3. Drop any spatial indexes that might exist
DROP INDEX IF EXISTS idx_vendors_coordinates;

COMMIT;
