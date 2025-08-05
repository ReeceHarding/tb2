-- Single-command video system deployment (optimized for CLI execution)
DO $$
BEGIN
    -- Create video_categories table
    CREATE TABLE IF NOT EXISTS video_categories (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        color VARCHAR(7) DEFAULT '#3B82F6',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );

    -- Create videos table
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
        original_media_id UUID REFERENCES media(id),
        file_status VARCHAR(20) DEFAULT 'available'
    );

    -- Insert categories
    INSERT INTO video_categories (name, description, color) VALUES
    ('All Videos', 'All video content', '#3B82F6'),
    ('Twitter Videos', 'Videos from Twitter/X platform', '#1DA1F2'),
    ('July 2025', 'Videos from July 2025', '#10B981'),
    ('Recent Content', 'Recently uploaded videos', '#8B5CF6')
    ON CONFLICT (name) DO NOTHING;

    -- Migrate videos from media table
    INSERT INTO videos (
        title, description, video_url, thumbnail_url, platform, platform_id,
        category_id, published_at, created_at, original_media_id, file_status, is_featured
    )
    SELECT 
        COALESCE(NULLIF(m.title, ''), 'Video #' || ROW_NUMBER() OVER (ORDER BY m.created_at)) as title,
        COALESCE(NULLIF(m.description, ''), 'Video uploaded on ' || m.created_at::date) as description,
        m.url as video_url,
        CASE WHEN m.url LIKE '%.mp4' THEN '/images/testimonials/default-video-thumb.jpg'
             ELSE '/images/testimonials/default-video-thumb.jpg' END as thumbnail_url,
        CASE WHEN m.url LIKE '%twitter%' OR m.url LIKE '%/twitter/%' THEN 'twitter'
             WHEN m.url LIKE '%2025-07%' THEN 'july2025'
             ELSE 'general' END as platform,
        SUBSTRING(m.url FROM 'video_([0-9]+)_') as platform_id,
        CASE WHEN m.url LIKE '%twitter%' OR m.url LIKE '%/twitter/%' 
               THEN (SELECT id FROM video_categories WHERE name = 'Twitter Videos')
             WHEN m.url LIKE '%2025-07%' 
               THEN (SELECT id FROM video_categories WHERE name = 'July 2025')
             ELSE (SELECT id FROM video_categories WHERE name = 'All Videos') END as category_id,
        m.created_at as published_at,
        m.created_at,
        m.id as original_media_id,
        'available' as file_status,
        true as is_featured
    FROM media m
    WHERE m.url LIKE '%mp4%' 
      AND m.url IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM videos v WHERE v.original_media_id = m.id);

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_videos_category_id ON videos(category_id);
    CREATE INDEX IF NOT EXISTS idx_videos_featured ON videos(is_featured);
    CREATE INDEX IF NOT EXISTS idx_videos_file_status ON videos(file_status);
    CREATE INDEX IF NOT EXISTS idx_videos_platform ON videos(platform);

    -- Create helper function
    CREATE OR REPLACE FUNCTION increment_view_count(video_id UUID)
    RETURNS void AS $BODY$
    BEGIN
        UPDATE videos 
        SET view_count = view_count + 1, updated_at = NOW()
        WHERE id = video_id;
    END;
    $BODY$ LANGUAGE plpgsql;

    -- Report results
    RAISE NOTICE 'Video system deployed successfully!';
    RAISE NOTICE 'Categories: %', (SELECT COUNT(*) FROM video_categories);
    RAISE NOTICE 'Videos: %', (SELECT COUNT(*) FROM videos);
    
END $$;
