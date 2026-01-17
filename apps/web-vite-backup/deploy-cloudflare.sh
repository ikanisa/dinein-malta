#!/bin/bash
# Robust Cloudflare Pages Deployment Script
# Deploys the DineIn Malta PWA to Cloudflare Pages

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="dinein"
BUILD_DIR="dist"
WORKING_DIR="apps/web"

echo -e "${BLUE}🚀 Cloudflare Pages Deployment${NC}"
echo -e "${BLUE}==============================${NC}\n"

# Check if we're in the right directory
if [ ! -d "$WORKING_DIR" ]; then
    echo -e "${RED}❌ Error: $WORKING_DIR directory not found${NC}"
    echo "Please run this script from the repository root"
    exit 1
fi

cd "$WORKING_DIR"

# Check if logged in to Cloudflare
echo -e "${BLUE}📋 Checking Cloudflare authentication...${NC}"
if ! npx wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Cloudflare. Please login:${NC}"
    npx wrangler login
fi

# Display current user
echo -e "${GREEN}✅ Logged in as:$(npx wrangler whoami | grep -oP '(?<=You are logged in as ).*')${NC}\n"

# Clean previous build
echo -e "${BLUE}🧹 Cleaning previous build...${NC}"
rm -rf "$BUILD_DIR" node_modules/.vite

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm ci --legacy-peer-deps

# Run type check
echo -e "${BLUE}🔍 Running type check...${NC}"
if ! npm run typecheck; then
    echo -e "${RED}❌ Type check failed. Please fix errors before deploying.${NC}"
    exit 1
fi

# Build for production
echo -e "${BLUE}🔨 Building for production...${NC}"
if ! npm run build; then
    echo -e "${RED}❌ Build failed. Please fix errors before deploying.${NC}"
    exit 1
fi

# Verify build output
if [ ! -d "$BUILD_DIR" ] || [ -z "$(ls -A $BUILD_DIR)" ]; then
    echo -e "${RED}❌ Build directory is empty. Build may have failed.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}\n"

# Check build size
BUILD_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
echo -e "${BLUE}📊 Build size: ${BUILD_SIZE}${NC}\n"

# Deploy to Cloudflare Pages
echo -e "${BLUE}🚀 Deploying to Cloudflare Pages...${NC}"
echo -e "${YELLOW}Project: ${PROJECT_NAME}${NC}"
echo -e "${YELLOW}Directory: ${BUILD_DIR}${NC}\n"

# Deploy with production flag
DEPLOY_OUTPUT=$(npx wrangler pages deploy "$BUILD_DIR" --project-name="$PROJECT_NAME" 2>&1)
DEPLOY_EXIT_CODE=$?

if [ $DEPLOY_EXIT_CODE -eq 0 ]; then
    # Extract deployment URL from output
    DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -oP 'https://[a-zA-Z0-9-]+\.pages\.dev' | head -1)
    
    echo -e "\n${GREEN}✅ Deployment successful!${NC}\n"
    echo -e "${GREEN}🌐 Deployment URL: ${DEPLOY_URL}${NC}\n"
    
    # Display next steps
    echo -e "${BLUE}📝 Next Steps:${NC}"
    echo -e "  1. Visit ${DEPLOY_URL} to verify deployment"
    echo -e "  2. Test all routes (client, vendor, admin)"
    echo -e "  3. Verify service worker registration"
    echo -e "  4. Test PWA installation"
    echo -e "  5. Check Cloudflare Dashboard for analytics"
    echo ""
    
    # Open browser (optional)
    if command -v open &> /dev/null; then
        read -p "Open deployment URL in browser? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            open "$DEPLOY_URL"
        fi
    fi
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

echo -e "\n${GREEN}🎉 Deployment complete!${NC}"




