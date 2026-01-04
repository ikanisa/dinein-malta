-- Remove the country constraint to allow non-Malta vendors (e.g., Rwanda)
ALTER TABLE public.vendors DROP CONSTRAINT IF EXISTS vendors_country_mt_chk;
