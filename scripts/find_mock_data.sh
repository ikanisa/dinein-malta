#!/bin/bash

echo "🔍 Searching for mock data patterns in apps/web/..."
echo ""

cd "$(dirname "$0")/.." || exit 1

# Search for common mock data patterns (exclude node_modules)
echo "=== Checking for TODO comments ==="
grep -rn "// TODO" apps/web --include="*.ts" --include="*.tsx" --exclude-dir=node_modules 2>/dev/null || echo "✓ No TODO comments found"
echo ""

echo "=== Checking for MOCK comments ==="
grep -rn "// MOCK\|//MOCK\|/\* MOCK" apps/web --include="*.ts" --include="*.tsx" --exclude-dir=node_modules 2>/dev/null || echo "✓ No MOCK comments found"
echo ""

echo "=== Checking for PLACEHOLDER ==="
grep -rn "PLACEHOLDER" apps/web --include="*.ts" --include="*.tsx" --exclude-dir=node_modules 2>/dev/null || echo "✓ No PLACEHOLDER found"
echo ""

echo "=== Checking for mockData variables ==="
grep -rn "const mockData\|let mockData\|var mockData" apps/web --include="*.ts" --include="*.tsx" --exclude-dir=node_modules 2>/dev/null || echo "✓ No mockData variables found"
echo ""

echo "=== Checking for dummyData variables ==="
grep -rn "const dummyData\|let dummyData\|var dummyData" apps/web --include="*.ts" --include="*.tsx" --exclude-dir=node_modules 2>/dev/null || echo "✓ No dummyData variables found"
echo ""

echo "=== Checking for faker usage ==="
grep -rn "faker\." apps/web --include="*.ts" --include="*.tsx" --exclude-dir=node_modules 2>/dev/null || echo "✓ No faker usage found"
echo ""

echo "=== Checking for hardcoded test data ==="
grep -rn "test@test\|test@example\|lorem ipsum\|foo bar" apps/web --include="*.ts" --include="*.tsx" --exclude-dir=node_modules 2>/dev/null || echo "✓ No hardcoded test data found"
echo ""

echo "✅ Mock data search complete!"
