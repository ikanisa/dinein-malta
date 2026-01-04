#!/usr/bin/env python3
"""
Apply Phase 1 migrations directly to Supabase using service role
"""
import sys
import os

# Read SQL file
sql_file = 'supabase/apply_phase1_migrations.sql'
if not os.path.exists(sql_file):
    print(f"Error: {sql_file} not found")
    sys.exit(1)

with open(sql_file, 'r') as f:
    sql = f.read()

print(f"📄 Loaded SQL from {sql_file}")
print(f"📊 SQL length: {len(sql)} characters")
print("\n" + "="*60)
print("⚠️  Direct SQL execution via Supabase API is not supported")
print("="*60)
print("\nSupabase Management API does not support DDL execution via REST")
print("for security reasons. SQL migrations must be applied via:\n")
print("1. Supabase Dashboard SQL Editor (RECOMMENDED)")
print("   → https://supabase.com/dashboard/project/elhlcdiosomutugpneoc/sql")
print("   → Copy the SQL from: supabase/apply_phase1_migrations.sql")
print("   → Paste and execute\n")
print("2. psql (if you have database password)")
print("   → Requires direct database connection\n")
print("3. Supabase CLI db push (after fixing migration history)")
print("\n" + "="*60)
print("\n✅ SQL file is ready at: supabase/apply_phase1_migrations.sql")
print("📋 Next step: Apply via Dashboard SQL Editor (2 minutes)")

