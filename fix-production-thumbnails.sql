-- FIX BROKEN THUMBNAIL URLs FOR PRODUCTION DEPLOYMENT
-- Run this SQL in your Supabase SQL editor to fix all broken thumbnail URLs

-- First, show current problematic records
SELECT 
  'Current problematic thumbnail URLs' as info,
  COUNT(*) as count
FROM videos 
WHERE thumbnail_url LIKE '%_thumb.jpg' 
   OR thumbnail_url LIKE '%thumb.jpg';

-- Show some examples
SELECT 
  id, 
  title, 
  thumbnail_url
FROM videos 
WHERE thumbnail_url LIKE '%_thumb.jpg' 
   OR thumbnail_url LIKE '%thumb.jpg'
LIMIT 5;

-- Update ALL videos with broken thumbnail URLs to use default fallback
UPDATE videos 
SET thumbnail_url = '/images/testimonials/default-video-thumb.jpg',
    updated_at = NOW()
WHERE thumbnail_url LIKE '%_thumb.jpg' 
   OR thumbnail_url LIKE '%thumb.jpg';

-- Verify the fix
SELECT 
  'After fix - problematic URLs remaining' as info,
  COUNT(*) as count
FROM videos 
WHERE thumbnail_url LIKE '%_thumb.jpg' 
   OR thumbnail_url LIKE '%thumb.jpg';

-- Show confirmation
SELECT 
  'Videos now using default thumbnail' as info,
  COUNT(*) as count
FROM videos 
WHERE thumbnail_url = '/images/testimonials/default-video-thumb.jpg';