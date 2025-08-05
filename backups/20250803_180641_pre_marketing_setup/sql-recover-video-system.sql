-- =====================================================
-- COMPLETE VIDEO SYSTEM RECOVERY 
-- Rebuilds video infrastructure from preserved metadata
-- =====================================================

-- Step 1: Create the missing video database tables
CREATE TABLE IF NOT EXISTS video_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

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
  
  -- Add reference to original media table entry
  original_media_id UUID REFERENCES media(id),
  
  -- Add status to track file availability
  file_status VARCHAR(20) DEFAULT 'missing' -- 'available', 'missing', 'processing'
);

-- Step 2: Create video categories
INSERT INTO video_categories (name, description, color) VALUES
('Recovered Content', 'Videos recovered from media table', '#10B981'),
('July 2025', 'Videos from July 2025', '#3B82F6'),
('Educational', 'Educational video content', '#8B5CF6'),
('Archive', 'Archived video content', '#6B7280');

-- Step 3: Migrate existing media video records to videos table
INSERT INTO videos (
  title, 
  description, 
  video_url, 
  thumbnail_url,
  platform,
  platform_id,
  category_id,
  published_at,
  created_at,
  original_media_id,
  file_status,
  is_featured
)
SELECT 
  COALESCE(NULLIF(m.title, ''), 'Recovered Video #' || ROW_NUMBER() OVER (ORDER BY m.created_at)) as title,
  COALESCE(NULLIF(m.description, ''), 'Video recovered from media table on ' || m.created_at::date) as description,
  m.url as video_url,
  CASE 
    -- Try to generate thumbnail URL from video URL
    WHEN m.url LIKE '%.mp4' THEN '/images/testimonials/default-video-thumb.jpg'
    ELSE '/images/testimonials/default-video-thumb.jpg'
  END as thumbnail_url,
  'recovered' as platform,
  SUBSTRING(m.url FROM 'video_([0-9]+)_') as platform_id,
  (SELECT id FROM video_categories WHERE name = 'Recovered Content') as category_id,
  m.created_at as published_at,
  m.created_at,
  m.id as original_media_id,
  'missing' as file_status,  -- Mark as missing since storage bucket was deleted
  true as is_featured  -- Make them visible in gallery
FROM media m
WHERE m.url LIKE '%mp4%'
  AND m.url IS NOT NULL;

-- Step 4: Create function to increment view count (if not exists)
CREATE OR REPLACE FUNCTION increment_view_count(video_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE videos 
  SET view_count = view_count + 1,
      updated_at = NOW()
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Add index for better performance
CREATE INDEX IF NOT EXISTS idx_videos_category_id ON videos(category_id);
CREATE INDEX IF NOT EXISTS idx_videos_featured ON videos(is_featured);
CREATE INDEX IF NOT EXISTS idx_videos_file_status ON videos(file_status);
CREATE INDEX IF NOT EXISTS idx_videos_platform ON videos(platform);

-- Step 6: Verify the recovery
SELECT 
  'Recovery Summary' as summary,
  (SELECT COUNT(*) FROM video_categories) as categories_created,
  (SELECT COUNT(*) FROM videos) as videos_recovered,
  (SELECT COUNT(*) FROM videos WHERE file_status = 'missing') as files_missing,
  (SELECT COUNT(*) FROM videos WHERE is_featured = true) as videos_featured;

-- Step 7: Show sample of recovered videos
SELECT 
  v.title,
  v.file_status,
  v.platform,
  vc.name as category,
  v.created_at::date as recovered_date
FROM videos v
JOIN video_categories vc ON v.category_id = vc.id
ORDER BY v.created_at DESC
LIMIT 10;