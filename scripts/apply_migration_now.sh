#!/bin/bash
# Apply vendor dashboard migration directly using psql

set -e

DB_URL="postgresql://postgres:MoMo!!0099@db.elhlcdiosomutugpneoc.supabase.co:5432/postgres"
MIGRATION_FILE="supabase/migrations/20250122000000_add_order_status_workflow.sql"

echo "🚀 Applying Vendor Dashboard Migration..."
echo "=========================================="
echo ""

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📄 Migration file: $MIGRATION_FILE"
echo "🗄️  Database: elhlcdiosomutugpneoc.supabase.co"
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql is not installed"
    echo "   Install PostgreSQL client tools or use Supabase Dashboard"
    echo "   https://supabase.com/dashboard/project/elhlcdiosomutugpneoc/sql"
    exit 1
fi

echo "✅ psql found, applying migration..."
echo ""

# Apply migration
psql "$DB_URL" -f "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration applied successfully!"
    echo ""
    echo "🔍 Verifying migration..."
    echo ""
    
    # Verify the migration
    psql "$DB_URL" -c "SELECT unnest(enum_range(NULL::order_status)) AS status ORDER BY status;"
    
    echo ""
    echo "✅ Verification complete!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Test vendor dashboard at /vendor/live"
    echo "   2. Create a test order and verify status workflow"
    echo "   3. Check that orders appear with NEW status"
else
    echo ""
    echo "❌ Migration failed. Please check the error above."
    echo "   You can also apply manually via Supabase Dashboard:"
    echo "   https://supabase.com/dashboard/project/elhlcdiosomutugpneoc/sql"
    exit 1
fi
