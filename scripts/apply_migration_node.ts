#!/usr/bin/env tsx
/**
 * Apply vendor dashboard migration using Supabase client
 * Uses service role key to execute SQL via Supabase Management API
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = 'https://elhlcdiosomutugpneoc.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaGxjZGlvc29tdXR1Z3BuZW9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODkwNTc1MywiZXhwIjoyMDc0NDgxNzUzfQ.INeWgLyQetYUZGQYiVx7GCB7fREKypaOfy-XEMhYi6A';

const MIGRATION_FILE = path.join(__dirname, '../supabase/migrations/20250122000000_add_order_status_workflow.sql');

async function applyMigration() {
  console.log('🚀 Applying Vendor Dashboard Migration...\n');

  // Read migration SQL
  if (!fs.existsSync(MIGRATION_FILE)) {
    console.error(`❌ Error: Migration file not found: ${MIGRATION_FILE}`);
    process.exit(1);
  }

  const migrationSQL = fs.readFileSync(MIGRATION_FILE, 'utf-8');
  console.log(`📄 Migration file: ${MIGRATION_FILE}`);
  console.log(`📊 SQL length: ${migrationSQL.length} characters\n`);

  // Create Supabase client with service role
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Note: Supabase REST API doesn't support DDL directly
  // We need to use RPC or Edge Function, but the simplest is to use psql
  // For now, we'll create an RPC function if possible, or provide instructions

  console.log('⚠️  Note: Supabase REST API has limitations with DDL operations.');
  console.log('   Trying to execute via RPC function...\n');

  // Split SQL into statements (simple approach)
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

  console.log(`📋 Found ${statements.length} SQL statements\n`);

  // Try to execute via a temporary function
  // Since we can't execute DDL directly, we'll need to use psql or Dashboard
  console.log('❌ Direct DDL execution via REST API is not supported by Supabase.');
  console.log('\n✅ Alternative methods:\n');
  console.log('Option 1: Use psql (if installed):');
  console.log('  ./scripts/apply_migration_now.sh\n');
  console.log('Option 2: Supabase Dashboard SQL Editor:');
  console.log('  1. Go to: https://supabase.com/dashboard/project/elhlcdiosomutugpneoc/sql');
  console.log('  2. Click "New Query"');
  console.log('  3. Copy the SQL below');
  console.log('  4. Paste and execute\n');
  console.log('─'.repeat(60));
  console.log(migrationSQL);
  console.log('─'.repeat(60));
  
  // Try to verify current status
  console.log('\n🔍 Checking current order_status enum values...\n');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: "SELECT unnest(enum_range(NULL::order_status)) AS status;"
    });

    if (error) {
      // Try direct query
      const { data: enumData, error: enumError } = await supabase
        .from('pg_type')
        .select('*')
        .eq('typname', 'order_status');

      if (!enumError && enumData) {
        console.log('Current enum values detected in database.');
      } else {
        console.log('Could not verify enum values (this is normal if RPC not available).');
      }
    } else {
      console.log('Current statuses:', data);
    }
  } catch (e) {
    console.log('Note: Verification query may require direct database access.');
  }

  console.log('\n💡 Recommended: Use psql script or Supabase Dashboard');
}

applyMigration().catch(console.error);
