#!/bin/bash
# Bundle Analysis Script
# Builds production bundle and analyzes size/composition

set -e

echo "🚀 Building for production..."
cd "$(dirname "$0")/../apps/web"
npm run build

echo ""
echo "📊 Bundle Statistics:"
echo "====================="

# Total dist size
echo ""
echo "📦 Total dist size:"
du -sh dist/

# JavaScript chunks
echo ""
echo "📜 JavaScript chunks:"
find dist -name "*.js" -type f -exec ls -lh {} \; | awk '{print $5, $9}' | sort -hr

# Large files warning
echo ""
echo "⚠️  Files over 200KB:"
find dist -type f -size +200k -exec ls -lh {} \; 2>/dev/null || echo "  None found - great!"

# Compression stats
echo ""
echo "🗜️  Compressed files:"
echo "  Brotli (.br):"
ls -lh dist/assets/js/*.br 2>/dev/null | wc -l | xargs -I {} echo "    {} files"
echo "  Gzip (.gz):"
ls -lh dist/assets/js/*.gz 2>/dev/null | wc -l | xargs -I {} echo "    {} files"

# Open visualizer if exists
if [ -f "dist/stats.html" ]; then
  echo ""
  echo "📈 Bundle visualizer available at: dist/stats.html"
  echo "   Run: open dist/stats.html (macOS) or xdg-open dist/stats.html (Linux)"
fi

echo ""
echo "✅ Analysis complete!"
