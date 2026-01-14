#!/bin/bash

echo "🧹 Removing console.log statements from production code..."
echo ""

cd "$(dirname "$0")/.." || exit 1

# Find all .ts and .tsx files in apps/web (excluding node_modules)
# Remove console.log but keep console.error and console.warn

count=0

find apps/web -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "*/node_modules/*" | while read -r file; do
  # Count console.log occurrences before removal
  matches=$(grep -c "console\.log" "$file" 2>/dev/null || echo "0")
  
  if [ "$matches" -gt 0 ]; then
    echo "  Cleaning: $file ($matches occurrences)"
    
    # Create backup
    cp "$file" "${file}.bak"
    
    # Remove lines containing only console.log (including multiline)
    sed -i.tmp '/console\.log/d' "$file"
    
    # Clean up temp files
    rm -f "${file}.tmp"
    rm -f "${file}.bak"
    
    count=$((count + matches))
  fi
done

echo ""
echo "✅ Console.log cleanup complete!"
echo ""
echo "⚠️  Note: Run 'npm run typecheck' to verify no issues were introduced."
