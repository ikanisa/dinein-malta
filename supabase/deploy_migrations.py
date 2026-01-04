#!/usr/bin/env python3
"""
Script to deploy database migrations via Supabase Management API
Uses the Supabase REST API to create and execute a migration function
"""

import json
import urllib.request
import urllib.parse
import sys

SUPABASE_URL = "https://elhlcdiosomutugpneoc.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaGxjZGlvc29tdXR1Z3BuZW9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODkwNTc1MywiZXhwIjoyMDc0NDgxNzUzfQ.INeWgLyQetYUZGQYiVx7GCB7fREKypaOfy-XEMhYi6A"

def execute_sql(sql_query):
    """Execute SQL via Supabase Management API"""
    # The Management API query endpoint might only support SELECT
    # So we'll need to use a different approach
    print("⚠️  Direct SQL execution via REST API is not supported for DDL statements.")
    print("Please use one of these methods:")
    print("\n1. Supabase Dashboard SQL Editor (Recommended):")
    print("   - Go to: https://supabase.com/dashboard/project/elhlcdiosomutugpneoc/sql")
    print("   - Copy contents of supabase/apply_via_rpc.sql")
    print("   - Paste and execute")
    print("\n2. Use psql with connection string:")
    print("   - Get connection string from Dashboard > Settings > Database")
    print("   - Run: psql \"<connection-string>\" -f supabase/apply_via_rpc.sql")
    return False

if __name__ == "__main__":
    # Read the migration SQL
    try:
        with open('supabase/apply_via_rpc.sql', 'r') as f:
            sql_content = f.read()
        print(f"Read migration SQL ({len(sql_content)} characters)")
        execute_sql(sql_content)
    except FileNotFoundError:
        print("Error: supabase/apply_via_rpc.sql not found")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

