-- App configuration table for versioning and feature flags
-- This table stores key-value configuration for the app

CREATE TABLE IF NOT EXISTS public.app_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (public read, admin write)
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read config
CREATE POLICY "Anyone can read app_config"
  ON public.app_config FOR SELECT
  USING (true);

-- Only authenticated admins can modify (for future admin portal)
CREATE POLICY "Admins can modify app_config"
  ON public.app_config FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Seed initial version config
INSERT INTO public.app_config (key, value) VALUES
  ('version', '{"min_version": "1.0.0", "force_update": false, "update_message": "A new version is available. Please update for the best experience."}')
ON CONFLICT (key) DO NOTHING;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_app_config_key ON public.app_config(key);
