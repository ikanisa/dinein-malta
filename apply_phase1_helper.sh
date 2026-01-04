#!/bin/bash
# Helper script to format Phase 1 migrations for easy copy-paste

echo "📋 Phase 1 Migrations - Ready to Apply"
echo "========================================"
echo ""
echo "⚠️  Note: Supabase doesn't allow DDL execution via API for security reasons."
echo "   This SQL must be applied via the Supabase Dashboard SQL Editor."
echo ""
echo "📝 Steps:"
echo "1. Open: https://supabase.com/dashboard/project/elhlcdiosomutugpneoc/sql"
echo "2. Copy the SQL below (between the markers)"
echo "3. Paste into SQL Editor"
echo "4. Click 'Run' or press Cmd/Ctrl+Enter"
echo ""
echo "========================================"
echo "START COPYING BELOW THIS LINE"
echo "========================================"
echo ""
cat supabase/apply_phase1_migrations.sql
echo ""
echo "========================================"
echo "STOP COPYING ABOVE THIS LINE"
echo "========================================"
echo ""
echo "✅ SQL is ready above. Copy everything between the markers."

