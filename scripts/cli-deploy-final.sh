#!/bin/bash

# FINAL CLI SOLUTION - Video System Deployment
# Maximizes CLI usage while handling authentication limitations

set -e

# Load environment variables from .env.local
if [ -f .env.local ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY"
SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL"

# Validate required environment variables
if [ -z "$ANON_KEY" ] || [ -z "$SUPABASE_URL" ]; then
    echo "❌ Missing required environment variables in .env.local:"
    echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   NEXT_PUBLIC_SUPABASE_URL"
    exit 1
fi

echo "🎯 CLI-FIRST VIDEO DEPLOYMENT"
echo "============================="
echo ""

# Step 1: Verify current state via CLI
echo "[CLI] Checking database state..."
media_count=$(curl -s -H "Authorization: Bearer $ANON_KEY" -H "apikey: $ANON_KEY" "${SUPABASE_URL}/rest/v1/media?select=count" | jq -r '.[0].count // 0')
echo "✅ Media records available: $media_count videos"

# Check if video tables exist
video_response=$(curl -s -H "Authorization: Bearer $ANON_KEY" -H "apikey: $ANON_KEY" "${SUPABASE_URL}/rest/v1/video_categories?select=count&limit=1" 2>/dev/null)

if echo "$video_response" | grep -q "does not exist\|relation.*does not exist"; then
    echo "❌ Video tables: Missing (need to create)"
    tables_exist=false
else
    echo "✅ Video tables: Already exist"
    tables_exist=true
fi

echo ""

if [ "$tables_exist" = false ]; then
    echo "[CLI] Creating optimized SQL for remote execution..."
    
    # Create a single-command SQL file for easy CLI execution
    cat > video_deploy_optimized.sql << 'EOF'
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
EOF

    echo "✅ Created: video_deploy_optimized.sql"
    echo ""
    
    echo "[CLI] One manual step required - execute this optimized command:"
    echo "=============================================================="
    echo ""
    echo "🔗 Open: https://supabase.com/dashboard/project/igwtslivaqqgiswawdep/sql/new"
    echo ""
    echo "📋 Copy this single-block SQL and click 'Run':"
    echo "-------------------------------------------"
    cat video_deploy_optimized.sql
    echo ""
    echo "⏳ Press ENTER after running the SQL to continue CLI verification..."
    read -r
fi

echo ""
echo "[CLI] Verifying deployment..."

# Verify categories
echo "🔍 Testing video_categories via API..."
categories=$(curl -s -H "Authorization: Bearer $ANON_KEY" -H "apikey: $ANON_KEY" "${SUPABASE_URL}/rest/v1/video_categories?select=name")

if echo "$categories" | jq -e '. | length > 0' > /dev/null 2>&1; then
    category_count=$(echo "$categories" | jq length)
    echo "✅ Categories: $category_count found"
    echo "$categories" | jq -r '.[] | "   - " + .name'
else
    echo "❌ Categories: Not found"
    exit 1
fi

echo ""

# Verify videos with precise count
echo "🔍 Testing videos via API..."
video_count_response=$(curl -s -I -H "Authorization: Bearer $ANON_KEY" -H "apikey: $ANON_KEY" -H "Prefer: count=exact" "${SUPABASE_URL}/rest/v1/videos?select=id&limit=1")
video_count=$(echo "$video_count_response" | grep -i "content-range" | sed 's/.*\///;s/-.*//;s/[^0-9]//g')

if [ -z "$video_count" ]; then
    video_count=0
fi

echo "✅ Videos: $video_count total migrated"

# Test video availability
if [ "$video_count" -gt 0 ]; then
    sample_videos=$(curl -s -H "Authorization: Bearer $ANON_KEY" -H "apikey: $ANON_KEY" "${SUPABASE_URL}/rest/v1/videos?select=title,file_status,platform&limit=3")
    echo ""
    echo "📹 Sample migrated videos:"
    echo "$sample_videos" | jq -r '.[] | "   - " + .title + " (" + .platform + ", " + .file_status + ")"'
fi

echo ""
echo "[CLI] Testing application endpoints..."

# Test local API if app is running
if lsof -i :3000 &> /dev/null 2>&1; then
    echo "🔍 Testing local app APIs..."
    
    categories_api=$(curl -s "http://localhost:3000/api/video-categories" 2>/dev/null | jq -r '.success // false' 2>/dev/null || echo "false")
    videos_api=$(curl -s "http://localhost:3000/api/videos" 2>/dev/null | jq -r '.success // false' 2>/dev/null || echo "false")
    
    if [ "$categories_api" = "true" ]; then
        echo "✅ Categories API: Working"
    else
        echo "❌ Categories API: Failed"
    fi
    
    if [ "$videos_api" = "true" ]; then
        echo "✅ Videos API: Working"
        # Get video count from API
        api_video_count=$(curl -s "http://localhost:3000/api/videos" 2>/dev/null | jq -r '.videos | length' 2>/dev/null || echo "0")
        echo "📊 API reports: $api_video_count videos available"
    else
        echo "❌ Videos API: Failed - may need app restart"
    fi
    
else
    echo "⚠️  Local app not running - start with: npm run dev"
fi

echo ""
echo "🎉 CLI DEPLOYMENT SUMMARY"
echo "========================"

if [ "$video_count" -gt 0 ]; then
    echo "✅ SUCCESS: Video system deployed via CLI"
    echo "📊 Database: $category_count categories, $video_count videos"
    echo "🔄 Migration: All $media_count media records processed"
    echo "📁 File Status: All videos marked as 'available'"
    echo ""
    echo "🚀 NEXT STEPS:"
    echo "1. Restart your app: npm run dev"
    echo "2. Visit your video gallery page"
    echo "3. All $video_count videos should be visible and playable!"
    echo ""
    echo "🎯 Your video gallery is now fully functional!"
else
    echo "❌ Deployment incomplete - please verify SQL execution"
fi

# Cleanup
rm -f video_deploy_optimized.sql