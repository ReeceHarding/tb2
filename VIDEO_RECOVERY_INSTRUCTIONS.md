# 🚨 VIDEO SYSTEM RECOVERY INSTRUCTIONS

## SITUATION SUMMARY
- **Lost**: 363 video files (storage bucket deleted)  
- **Lost**: Video database tables (video_categories, videos)
- **Preserved**: All 363 video metadata records in media table
- **Preserved**: All other content (content, media, transcriptions)

## IMMEDIATE RECOVERY STEPS

### Step 1: Restore Database Tables
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy and paste contents of `sql-recover-video-system.sql`
3. Click **"Run"** to execute
4. Verify success by checking the output shows:
   - Categories created: 4
   - Videos recovered: 363
   - Files missing: 363

### Step 2: Recreate Storage Bucket
1. In **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Name: `videos`
4. Set to **Public** bucket
5. Click **"Create bucket"**

### Step 3: Test Recovery
Run verification:
```bash
node scripts/verify-database.js
```

Expected output:
- ✅ video_categories: exists (4 rows)
- ✅ videos: exists (363 rows)

### Step 4: Test Video Gallery
Visit your video gallery - it should now show:
- 363 recovered videos with titles like "Recovered Video #1", "Recovered Video #2"
- Videos will have "missing" file status (thumbnails may not load)
- Gallery functionality should work (categories, filtering)

## CURRENT VIDEO STATUS

All 363 videos are marked as `file_status = 'missing'` because:
- Original storage bucket was deleted
- Video files are not accessible
- Only metadata was preserved

## OPTIONS FOR VIDEO FILES

### Option 1: Accept Loss (Quickest)
- Update video gallery to show "Video unavailable" for missing files
- Keep metadata for historical records
- Focus on new video uploads

### Option 2: Restore from Backup
- If you have backups of the videos bucket, restore them
- Update `file_status` to 'available' for restored videos
- Re-upload to new videos bucket

### Option 3: Re-record/Re-upload
- Use preserved metadata as guide for what content existed
- Re-create important videos
- Update database records when files are restored

## POST-RECOVERY VIDEO GALLERY

After running the recovery SQL, your video gallery will:
- ✅ Show 363 videos organized by categories
- ✅ Display proper titles and descriptions  
- ✅ Allow category filtering
- ⚠️ Show "Video unavailable" for playback (files missing)
- ✅ Preserve all original metadata and timestamps

## PREVENTING FUTURE LOSS

1. **Set up automated backups** for Supabase Storage
2. **Use version control** for database schema changes
3. **Test changes** in staging environment first
4. **Document recovery procedures** for your team

## FILES CREATED FOR RECOVERY
- `sql-recover-video-system.sql` - Complete database recovery
- `scripts/recover-video-system.js` - Analysis tool
- `scripts/inspect-database.js` - Database inspection
- `VIDEO_RECOVERY_INSTRUCTIONS.md` - This document

## SUPPORT
If you encounter issues:
1. Check Supabase logs for error details
2. Verify environment variables are correct
3. Ensure Supabase project has sufficient permissions
4. Run verification scripts to confirm recovery status