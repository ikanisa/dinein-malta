#!/bin/bash

# Restaurant Scraper - Quick Start Script
# This script helps you set up and run the scraper

set -e

echo "🚀 Restaurant Scraper Setup"
echo "============================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "Please run this script from the scripts/ directory"
    exit 1
fi

# Step 1: Check Node.js
echo "📦 Step 1: Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js version: $NODE_VERSION"
echo ""

# Step 2: Install dependencies
echo "📦 Step 2: Installing dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing npm packages..."
    npm install
else
    echo "✅ Dependencies already installed"
fi
echo ""

# Step 3: Check Playwright
echo "🌐 Step 3: Checking Playwright browser..."
if ! npx playwright --version &> /dev/null || [ ! -d "$HOME/.cache/ms-playwright" ]; then
    echo "Installing Chromium browser..."
    npx playwright install chromium
else
    echo "✅ Playwright browser already installed"
fi
echo ""

# Step 4: Check .env file
echo "🔐 Step 4: Checking environment variables..."
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo ""
    echo "Please create a .env file with:"
    echo "  VITE_SUPABASE_URL=https://elhlcdiosomutugpneoc.supabase.co"
    echo "  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here"
    echo ""
    echo "You can get these from:"
    echo "  https://supabase.com/dashboard/project/elhlcdiosomutugpneoc/settings/api"
    echo ""
    read -p "Press Enter after creating .env file, or Ctrl+C to cancel..."
fi

# Check if .env has required variables
if [ -f ".env" ]; then
    source .env
    if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        echo "⚠️  .env file exists but missing required variables!"
        echo "Please ensure you have:"
        echo "  VITE_SUPABASE_URL"
        echo "  SUPABASE_SERVICE_ROLE_KEY"
        exit 1
    fi
    echo "✅ Environment variables configured"
else
    exit 1
fi
echo ""

# Step 5: Ready to run
echo "✅ Setup complete!"
echo ""
echo "Ready to run scraper..."
echo ""
read -p "Start scraping now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Starting scraper..."
    echo "This may take 40-60 minutes..."
    echo ""
    npm run scrape
else
    echo ""
    echo "To run the scraper later, use:"
    echo "  npm run scrape"
fi

