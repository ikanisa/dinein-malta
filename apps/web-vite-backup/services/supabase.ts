import { createClient } from "@supabase/supabase-js";

// Fallback values (production Supabase project)
const FALLBACK_URL = "https://elhlcdiosomutugpneoc.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaGxjZGlvc29tdXR1Z3BuZW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MDU3NTMsImV4cCI6MjA3NDQ4MTc1M30.d92ZJG5E_9r7bOlRLBXRI6gcB_7ERVbL-Elp7fk4avY";

// Helper to get a valid env value (handles "undefined" string, empty string, and actual undefined)
const getEnv = (key: string): string | undefined => {
  // Try import.meta.env first (Vite standard)
  const metaValue = import.meta.env?.[key];
  if (metaValue && metaValue !== "undefined" && metaValue.trim() !== "") {
    return metaValue;
  }

  // Try process.env (for SSR or Node environments)
  const processValue = typeof process !== "undefined" ? (process.env as Record<string, string | undefined>)?.[key] : undefined;
  if (processValue && processValue !== "undefined" && processValue.trim() !== "") {
    return processValue;
  }

  return undefined;
};

const supabaseUrl = getEnv("VITE_SUPABASE_URL") || FALLBACK_URL;
const supabaseAnonKey = getEnv("VITE_SUPABASE_ANON_KEY") || FALLBACK_KEY;

// Debug logging (only in development)
if (import.meta.env?.DEV) {
  console.log("[Supabase] URL:", supabaseUrl.substring(0, 30) + "...");
  console.log("[Supabase] Key configured:", !!supabaseAnonKey && supabaseAnonKey.length > 10);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
