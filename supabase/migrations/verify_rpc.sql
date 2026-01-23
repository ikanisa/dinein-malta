-- Helper SQL to verify function creation
select pg_get_functiondef('search_nearby_venues'::regproc);
