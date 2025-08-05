#!/bin/bash

# Quick Restore Script for Supabase Backup
# Created: August 3, 2025 - 18:06:41
# Purpose: Quickly restore configuration and remove marketing tables if needed

set -e  # Exit on any error

BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$BACKUP_DIR/../.." && pwd)"

echo "🔄 Supabase Quick Restore Script"
echo "Backup Directory: $BACKUP_DIR"
echo "Project Root: $PROJECT_ROOT"
echo ""

# Function to restore configuration files
restore_config() {
    echo "📁 Restoring Supabase configuration files..."
    cp -r "$BACKUP_DIR/supabase_config/"* "$PROJECT_ROOT/supabase/"
    cp "$BACKUP_DIR/env_backup.txt" "$PROJECT_ROOT/.env.local"
    echo "✅ Configuration files restored"
}

# Function to remove marketing tables from database
remove_marketing_tables() {
    echo "🗑️  Removing marketing tables from database..."
    echo "⚠️  This will permanently delete the marketing_images and marketing_image_categories tables!"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Create temporary SQL file to remove tables
        cat > "$PROJECT_ROOT/temp_remove_marketing.sql" << 'EOF'
-- Remove marketing tables created by supabase-marketing-setup.sql
DROP TABLE IF EXISTS marketing_images CASCADE;
DROP TABLE IF EXISTS marketing_image_categories CASCADE;

-- Verify removal
SELECT 'Marketing tables removed successfully' as status;
EOF

        echo "📝 Temporary removal script created: $PROJECT_ROOT/temp_remove_marketing.sql"
        echo ""
        echo "🚀 To execute the removal, run this command in your Supabase SQL editor:"
        echo "   Or use: supabase db reset --db-url 'postgresql://postgres:TimeBackDatabasePassword@db.igwtslivaqqgiswawdep.supabase.co:5432/postgres'"
        echo ""
        echo "   Content to copy and paste:"
        cat "$PROJECT_ROOT/temp_remove_marketing.sql"
        echo ""
        echo "⚠️  Remember to delete temp_remove_marketing.sql after use"
    else
        echo "❌ Marketing table removal cancelled"
    fi
}

# Function to list what can be restored
list_backup_contents() {
    echo "📋 Available backup contents:"
    echo ""
    echo "Configuration Files:"
    ls -la "$BACKUP_DIR/supabase_config/"
    echo ""
    echo "SQL Files:"
    ls -la "$BACKUP_DIR/"*.sql 2>/dev/null || echo "No SQL files"
    echo ""
    echo "Environment:"
    ls -la "$BACKUP_DIR/env_backup.txt"
}

# Main menu
echo "What would you like to do?"
echo "1) List backup contents"
echo "2) Restore configuration files only"
echo "3) Generate script to remove marketing tables"
echo "4) Full restore (config + table removal script)"
echo "5) Exit"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        list_backup_contents
        ;;
    2)
        restore_config
        ;;
    3)
        remove_marketing_tables
        ;;
    4)
        restore_config
        remove_marketing_tables
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "✅ Restore operation completed!"
echo "📍 Project root: $PROJECT_ROOT"
echo "📍 Backup location: $BACKUP_DIR"