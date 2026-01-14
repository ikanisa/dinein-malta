#!/bin/bash

# ==========================================
# DineIn Database Backup Script
# ==========================================
# Usage: ./backup_database.sh [PROJECT_REF]
#
# Prerequisites:
# - Supabase CLI installed: npm install -g supabase
# - Supabase CLI logged in: supabase login
# - Project linked: supabase link --project-ref YOUR_PROJECT_REF

set -e

# Configuration
PROJECT_REF="${1:-}"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/dinein_backup_${TIMESTAMP}.sql"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}DineIn Database Backup Script${NC}"
echo "================================"

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI is not installed.${NC}"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Determine project ref
if [ -z "$PROJECT_REF" ]; then
    # Try to get from linked project
    if [ -f ".supabase/project-ref" ]; then
        PROJECT_REF=$(cat .supabase/project-ref)
        echo -e "Using linked project: ${GREEN}${PROJECT_REF}${NC}"
    else
        echo -e "${RED}Error: No project ref provided and no linked project found.${NC}"
        echo "Usage: $0 <PROJECT_REF>"
        echo "Or link a project first: supabase link --project-ref YOUR_PROJECT_REF"
        exit 1
    fi
else
    echo -e "Using project ref: ${GREEN}${PROJECT_REF}${NC}"
fi

# Create backup
echo ""
echo "Creating database backup..."
if supabase db dump --project-ref "$PROJECT_REF" > "$BACKUP_FILE" 2>&1; then
    echo -e "${GREEN}✓ Backup created successfully: ${BACKUP_FILE}${NC}"
    
    # Get file size
    FILE_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
    echo "  Backup size: $FILE_SIZE"
    
    # Compress backup
    echo ""
    echo "Compressing backup..."
    gzip "$BACKUP_FILE"
    COMPRESSED_FILE="${BACKUP_FILE}.gz"
    COMPRESSED_SIZE=$(ls -lh "$COMPRESSED_FILE" | awk '{print $5}')
    echo -e "${GREEN}✓ Compressed: ${COMPRESSED_FILE}${NC}"
    echo "  Compressed size: $COMPRESSED_SIZE"
    
    # Clean up old backups (keep last 7 days)
    echo ""
    echo "Cleaning up old backups (keeping last 7 days)..."
    DELETED_COUNT=$(find "$BACKUP_DIR" -name "*.gz" -mtime +7 -delete -print | wc -l)
    echo -e "${GREEN}✓ Deleted ${DELETED_COUNT} old backup(s)${NC}"
    
    # List current backups
    echo ""
    echo "Current backups:"
    ls -lh "$BACKUP_DIR"/*.gz 2>/dev/null | tail -5
    
    echo ""
    echo -e "${GREEN}Backup completed successfully!${NC}"
else
    echo -e "${RED}Error: Backup failed!${NC}"
    # Remove empty file if created
    rm -f "$BACKUP_FILE"
    exit 1
fi

# Restore instructions
echo ""
echo "================================"
echo "To restore this backup:"
echo "  1. Uncompress: gunzip ${COMPRESSED_FILE}"
echo "  2. Restore: supabase db reset --project-ref ${PROJECT_REF}"
echo "     Then manually apply the backup SQL"
echo "================================"
