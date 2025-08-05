-- =====================================================
-- DEPLOY VIDEO SYSTEM FIX - PRODUCTION DATABASE
-- Execute this in Supabase SQL Editor
-- =====================================================

-- Step 1: Create video_categories table
CREATE TABLE IF NOT EXISTS video_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Step 2: Create videos table  
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url TEXT,
  video_url TEXT NOT NULL,
  duration INTEGER DEFAULT 0,
  platform VARCHAR(50),
  platform_id VARCHAR(255),
  category_id UUID REFERENCES video_categories(id),
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  original_media_id UUID,
  file_status VARCHAR(20) DEFAULT 'available'
);

-- Step 3: Insert video categories
INSERT INTO video_categories (name, description, color) VALUES
('All Videos', 'All video content', '#3B82F6'),
('Twitter Videos', 'Videos from Twitter/X platform', '#1DA1F2'),
('July 2025', 'Videos from July 2025', '#10B981'),
('Recent Content', 'Recently uploaded videos', '#8B5CF6')
ON CONFLICT (name) DO NOTHING;

-- Step 4: Migrate video data from media table (DISABLED - media table doesn't exist)
-- This section is commented out because the media table reference doesn't exist
-- INSERT INTO videos will be done via separate script

-- Step 5: Create support functions
CREATE OR REPLACE FUNCTION increment_view_count(video_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE videos 
  SET view_count = view_count + 1,
      updated_at = NOW()
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_videos_category_id ON videos(category_id);
CREATE INDEX IF NOT EXISTS idx_videos_featured ON videos(is_featured);
CREATE INDEX IF NOT EXISTS idx_videos_file_status ON videos(file_status);
CREATE INDEX IF NOT EXISTS idx_videos_platform ON videos(platform);

-- Step 7: Verification query
SELECT 
  'DEPLOYMENT SUMMARY' as summary,
  (SELECT COUNT(*) FROM video_categories) as categories_created,
  (SELECT COUNT(*) FROM videos) as videos_migrated,
  (SELECT COUNT(*) FROM videos WHERE file_status = 'available') as videos_available,
  (SELECT COUNT(*) FROM videos WHERE is_featured = true) as videos_featured;

-- Step 8: Sample results (will show empty until videos are populated)
-- SELECT 
--   v.title,
--   v.file_status,
--   v.platform,
--   vc.name as category,
--   v.created_at::date as migrated_date
-- FROM videos v
-- JOIN video_categories vc ON v.category_id = vc.id
-- ORDER BY v.created_at DESC
-- LIMIT 10;