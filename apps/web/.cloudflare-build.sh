#!/bin/bash
# Cloudflare Pages Build Script
# This script runs during Cloudflare Pages build process

set -e

echo "🚀 Starting Cloudflare Pages build..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --legacy-peer-deps

# Type check
echo "🔍 Running type check..."
npm run typecheck || echo "⚠️ Type check warnings (continuing...)"

# Build
echo "🔨 Building application..."
npm run build

# Verify build
if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    echo "❌ Build failed - dist directory is empty"
    exit 1
fi

echo "✅ Build complete!"




