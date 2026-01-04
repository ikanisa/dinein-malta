#!/bin/bash
# Deploy Performance Indexes Migration
# This script applies the performance indexes migration directly to Supabase

set -e

CONNECTION_STRING="postgresql://postgres:MoMo!!0099@db.elhlcdiosomutugpneoc.supabase.co:5432/postgres"
MIGRATION_FILE="supabase/migrations/20250119000000_performance_indexes.sql"

echo "🚀 Deploying Performance Indexes Migration..."
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ psql not found. Please install PostgreSQL client."
    exit 1
fi

# Apply migration
echo "📝 Applying migration..."
psql "$CONNECTION_STRING" -f "$MIGRATION_FILE" -v ON_ERROR_STOP=1

echo ""
echo "✅ Migration applied successfully!"
echo ""
echo "Verifying indexes..."

# Verify indexes were created
psql "$CONNECTION_STRING" -c "
SELECT indexname, tablename 
FROM pg_indexes 
WHERE indexname LIKE 'idx_%' 
AND schemaname = 'public'
AND indexname IN (
    'idx_vendors_status_active',
    'idx_vendors_status_location',
    'idx_vendors_google_place_id',
    'idx_menu_items_vendor_available',
    'idx_orders_vendor_status_created',
    'idx_tables_vendor_active',
    'idx_reservations_vendor_status_datetime'
)
ORDER BY tablename, indexname;
"

echo ""
echo "🎉 Deployment complete!"

