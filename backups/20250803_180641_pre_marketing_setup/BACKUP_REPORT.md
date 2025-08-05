# Supabase Backup Report - Pre-Marketing Setup

**Backup Date:** August 3, 2025 - 18:06:41  
**Backup Reason:** Before running `supabase-marketing-setup.sql` changes  
**Production DB:** `igwtslivaqqgiswawdep.supabase.co`  

## What Was Backed Up

### ✅ Configuration Files
- `supabase_config/` - Complete Supabase configuration directory
  - `config.toml` - Main Supabase configuration
  - `migrations/` - All existing migrations
  - All other Supabase local development files

### ✅ Environment Variables
- `env_backup.txt` - Complete copy of `.env.local` with all API keys and database credentials

### ✅ SQL Files
All SQL files from project root have been preserved:
- `add-address-columns.sql`
- `DEPLOY_VIDEO_FIX.sql`
- `fix-production-thumbnails.sql` 
- `marketing-images-supabase-setup.sql`
- `sql-insert-video-data.sql`
- `sql-reconnect-existing-videos.sql`
- `sql-recover-video-system.sql`
- `supabase-marketing-setup.sql` (the one you're about to run)
- `supabase-schema.sql`
- `video_deploy_optimized.sql`

### ⚠️ Database Dump Status
**ISSUE:** Could not create automated database dump due to PostgreSQL version mismatch:
- Remote server: PostgreSQL 17.4
- Local pg_dump: Version 15.8

## Manual Database Backup Required

Since automated backup failed, you need to manually backup your database:

### Option 1: Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard/project/igwtslivaqqgiswawdep
2. Navigate to Settings > Database
3. Scroll down to "Database backups"
4. Click "Download backup" to get a full database dump

### Option 2: Upgrade pg_dump (Advanced)
```bash
# Install PostgreSQL 17 to match server version
brew install postgresql@17
export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"
```

## What Changes Will Be Made

The `supabase-marketing-setup.sql` will:
1. Create `marketing_image_categories` table
2. Create `marketing_images` table  
3. Insert default categories
4. Enable Row Level Security
5. Create public read policies

## How to Restore if Needed

### To Revert Database Changes
```sql
-- Run these commands in Supabase SQL editor to remove the new tables
DROP TABLE IF EXISTS marketing_images;
DROP TABLE IF EXISTS marketing_image_categories;
```

### To Restore Configuration
```bash
# From project root, restore configuration files
cp -r backups/20250803_180641_pre_marketing_setup/supabase_config/* supabase/
cp backups/20250803_180641_pre_marketing_setup/env_backup.txt .env.local
```

### To Restore Any SQL File
```bash
# Copy any specific SQL file back
cp backups/20250803_180641_pre_marketing_setup/[filename].sql ./
```

## Verification Commands

After running your changes, verify everything works:
```bash
# Check if new tables exist
supabase db dump --schema-only --db-url "postgresql://postgres:TimeBackDatabasePassword@db.igwtslivaqqgiswawdep.supabase.co:5432/postgres"

# Test API connection
curl "https://igwtslivaqqgiswawdep.supabase.co/rest/v1/marketing_image_categories" \
  -H "apikey: sb_publishable_T9J-TclA51if2Yg8ZAR45A_R5L4HHql"
```

## Safety Recommendations

1. **Create manual database backup** using Supabase dashboard before proceeding
2. Test changes in development first if possible
3. Have this backup directory ready for quick restoration
4. Monitor application after changes to ensure everything works

---
**Backup Location:** `/Users/reeceharding/ship-fast-ts-3/backups/20250803_180641_pre_marketing_setup/`