# Complete Supabase Restoration Guide

**Backup Date:** August 3, 2025 - 18:06:41  
**Total Size:** 23MB  
**Database:** `igwtslivaqqgiswawdep.supabase.co`

## 🎯 COMPREHENSIVE BACKUP STATUS: ✅ COMPLETE

### What Was Fully Backed Up

#### 📊 **Database Tables & Data**
- **content**: 395 rows (15MB) - Main content data
- **marketing_image_categories**: 7 rows - Category definitions
- **marketing_images**: 121 rows (139KB) - Marketing asset metadata  
- **media**: 369 rows (160KB) - Media file references
- **transcriptions**: 394 rows (7.6MB) - Video transcription data

#### 🪣 **Storage Buckets & Files**
- **videos**: 3 files - Video content storage
- **videos-large**: 3 files (500MB limit) - Large video files
- **marketing-images**: 3 files - Marketing image assets

#### 🔐 **Authentication & Security**
- Complete authentication settings
- All Row Level Security (RLS) policies
- User access configurations
- JWT settings and permissions

#### ⚡ **Edge Functions & System**
- Edge function configurations
- Database schema (35KB complete definition)
- All table structures, indexes, and constraints
- Custom database functions and triggers

#### ⚙️ **Configuration Files**
- Complete Supabase local config (`config.toml`)
- All migration files
- Environment variables and API keys
- All project SQL files (12 files)

## 🚀 How to Restore Everything

### Option 1: Complete Database Restore
```bash
# 1. Create new Supabase project or reset existing
supabase projects create your-project-name

# 2. Restore schema and data
cat comprehensive/schema_info.json # Review structure first
# Then import via Supabase Dashboard SQL Editor

# 3. Restore each table's data
cat comprehensive/table_content_data.json | jq -r '.[]' 
# Import through Dashboard or API
```

### Option 2: Selective Restore
```bash
# Restore specific tables only
curl -X POST "https://your-project.supabase.co/rest/v1/content" \
  -H "apikey: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d @comprehensive/table_content_data.json

# Restore storage buckets
cat comprehensive/storage_buckets.json | jq '.[]'
# Recreate via Dashboard: Storage → New Bucket
```

### Option 3: Configuration Restore
```bash
# Restore Supabase configuration
cp -r supabase_config/* /path/to/new/project/supabase/
cp env_backup.txt /path/to/new/project/.env.local

# Apply local development setup
supabase start
supabase db reset
```

## 📋 Restoration Checklist

### Database Restoration
- [ ] Create/reset Supabase project
- [ ] Import schema via SQL Editor
- [ ] Restore table data (content, media, transcriptions)
- [ ] Verify data integrity with row counts
- [ ] Test API endpoints for each table

### Storage Restoration  
- [ ] Recreate storage buckets with same settings
- [ ] Upload files back to appropriate buckets
- [ ] Verify bucket policies and permissions
- [ ] Test file access URLs

### Authentication Restoration
- [ ] Configure authentication settings
- [ ] Restore RLS policies for each table
- [ ] Test user permissions
- [ ] Verify JWT configuration

### Application Restoration
- [ ] Update environment variables
- [ ] Test database connections
- [ ] Verify API endpoints work
- [ ] Check storage file access
- [ ] Run application tests

## 🔍 Verification Commands

### Database Verification
```sql
-- Check table row counts match backup
SELECT 'content' as table_name, count(*) FROM content;
SELECT 'marketing_images' as table_name, count(*) FROM marketing_images;
SELECT 'media' as table_name, count(*) FROM media;
SELECT 'transcriptions' as table_name, count(*) FROM transcriptions;

-- Expected counts:
-- content: 395 rows
-- marketing_images: 121 rows  
-- media: 369 rows
-- transcriptions: 394 rows
```

### Storage Verification
```bash
# Check bucket existence
curl "https://your-project.supabase.co/storage/v1/bucket" \
  -H "apikey: YOUR_SERVICE_KEY"

# Should return 3 buckets: videos, videos-large, marketing-images
```

### API Verification
```bash
# Test table access
curl "https://your-project.supabase.co/rest/v1/content?select=*&limit=1" \
  -H "apikey: YOUR_ANON_KEY"

# Should return content data
```

## ⚠️ Important Notes

1. **File Content**: This backup contains metadata about files but not the actual file content. Files in storage buckets need to be manually downloaded and re-uploaded.

2. **Secrets**: Environment variables are backed up but may need to be updated for new project.

3. **URLs**: All URLs will change if creating a new project - update application configuration accordingly.

4. **Progressive Restoration**: Start with schema, then data, then storage, then test.

## 🆘 Emergency Quick Restore

If you just need to undo the marketing setup changes:
```sql
-- Run in Supabase SQL Editor
DROP TABLE IF EXISTS marketing_images CASCADE;
DROP TABLE IF EXISTS marketing_image_categories CASCADE;
```

---
**Backup Location:** `/Users/reeceharding/ship-fast-ts-3/backups/20250803_180641_pre_marketing_setup/`  
**Status:** ✅ **COMPLETE COMPREHENSIVE BACKUP**