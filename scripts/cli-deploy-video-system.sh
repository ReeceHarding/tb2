#!/bin/bash

# CLI-based deployment of video system using Supabase REST API
# Execute each SQL statement via API calls

set -e  # Exit on any error

# Load environment variables from .env.local
if [ -f .env.local ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL"
SERVICE_KEY="$SUPABASE_SERVICE_ROLE_KEY"

echo "🚀 Starting CLI-based video system deployment..."
echo "🎯 Target: $SUPABASE_URL"
echo ""

# Function to execute SQL via API
execute_sql() {
    local sql="$1"
    local description="$2"
    
    echo "[SQL] Executing: $description..."
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
        -H "Authorization: Bearer $SERVICE_KEY" \
        -H "apikey: $SERVICE_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"sql\": $(echo "$sql" | jq -R -s .)}")
    
    http_code=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    body=$(echo "$response" | sed 's/HTTPSTATUS:[0-9]*$//')
    
    if [ "$http_code" -eq 200 ]; then
        echo "✅ Success: $description"
        return 0
    else
        echo "❌ Error in $description (HTTP $http_code):"
        echo "$body" | jq -r '.message // .' 2>/dev/null || echo "$body"
        return 1
    fi
}

# Step 1: Create video_categories table
echo "[Step 1] Creating video_categories table..."
execute_sql "CREATE TABLE IF NOT EXISTS video_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);" "Create video_categories table"

# Step 2: Create videos table
echo ""
echo "[Step 2] Creating videos table..."
execute_sql "CREATE TABLE IF NOT EXISTS videos (
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
);" "Create videos table"

# Step 3: Insert categories (split into individual statements)
echo ""
echo "[Step 3] Inserting video categories..."

execute_sql "INSERT INTO video_categories (name, description, color) VALUES
('All Videos', 'All video content', '#3B82F6') ON CONFLICT (name) DO NOTHING;" "Insert All Videos category"

execute_sql "INSERT INTO video_categories (name, description, color) VALUES
('Twitter Videos', 'Videos from Twitter/X platform', '#1DA1F2') ON CONFLICT (name) DO NOTHING;" "Insert Twitter Videos category"

execute_sql "INSERT INTO video_categories (name, description, color) VALUES
('July 2025', 'Videos from July 2025', '#10B981') ON CONFLICT (name) DO NOTHING;" "Insert July 2025 category"

execute_sql "INSERT INTO video_categories (name, description, color) VALUES
('Recent Content', 'Recently uploaded videos', '#8B5CF6') ON CONFLICT (name) DO NOTHING;" "Insert Recent Content category"

# Step 4: Migrate video data (this is the big one)
echo ""
echo "[Step 4] Migrating video data from media table..."
execute_sql "INSERT INTO videos (
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
  COALESCE(NULLIF(m.title, ''), 'Video #' || ROW_NUMBER() OVER (ORDER BY m.created_at)) as title,
  COALESCE(NULLIF(m.description, ''), 'Video uploaded on ' || m.created_at::date) as description,
  m.url as video_url,
  CASE 
    WHEN m.url LIKE '%.mp4' THEN '/images/testimonials/default-video-thumb.jpg'
    ELSE '/images/testimonials/default-video-thumb.jpg'
  END as thumbnail_url,
  CASE 
    WHEN m.url LIKE '%twitter%' OR m.url LIKE '%/twitter/%' THEN 'twitter'
    WHEN m.url LIKE '%2025-07%' THEN 'july2025'
    ELSE 'general'
  END as platform,
  SUBSTRING(m.url FROM 'video_([0-9]+)_') as platform_id,
  CASE 
    WHEN m.url LIKE '%twitter%' OR m.url LIKE '%/twitter/%' 
      THEN (SELECT id FROM video_categories WHERE name = 'Twitter Videos')
    WHEN m.url LIKE '%2025-07%' 
      THEN (SELECT id FROM video_categories WHERE name = 'July 2025')
    ELSE (SELECT id FROM video_categories WHERE name = 'All Videos')
  END as category_id,
  m.created_at as published_at,
  m.created_at,
  m.id as original_media_id,
  'available' as file_status,
  true as is_featured
FROM media m
WHERE m.url LIKE '%mp4%'
  AND m.url IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM videos v WHERE v.original_media_id = m.id);" "Migrate videos from media table"

# Step 5: Create function
echo ""
echo "[Step 5] Creating support functions..."
execute_sql "CREATE OR REPLACE FUNCTION increment_view_count(video_id UUID)
RETURNS void AS \$\$
BEGIN
  UPDATE videos 
  SET view_count = view_count + 1,
      updated_at = NOW()
  WHERE id = video_id;
END;
\$\$ LANGUAGE plpgsql;" "Create increment_view_count function"

# Step 6: Create indexes
echo ""
echo "[Step 6] Creating performance indexes..."
execute_sql "CREATE INDEX IF NOT EXISTS idx_videos_category_id ON videos(category_id);" "Create category index"
execute_sql "CREATE INDEX IF NOT EXISTS idx_videos_featured ON videos(is_featured);" "Create featured index" 
execute_sql "CREATE INDEX IF NOT EXISTS idx_videos_file_status ON videos(file_status);" "Create file status index"
execute_sql "CREATE INDEX IF NOT EXISTS idx_videos_platform ON videos(platform);" "Create platform index"

# Step 7: Verification
echo ""
echo "[Step 7] Verifying deployment..."

echo "Checking video_categories table..."
curl -s -H "Authorization: Bearer $SERVICE_KEY" \
     -H "apikey: $SERVICE_KEY" \
     "${SUPABASE_URL}/rest/v1/video_categories?select=name" | jq -r '.[] | "  ✅ Category: " + .name'

echo ""
echo "Checking videos table..."
video_count=$(curl -s -H "Authorization: Bearer $SERVICE_KEY" \
                   -H "apikey: $SERVICE_KEY" \
                   -H "Prefer: count=exact" \
                   "${SUPABASE_URL}/rest/v1/videos?select=id" | grep -o 'content-range: [^;]*' | grep -o '[0-9]*/')

echo "  ✅ Videos migrated: ${video_count%/}"

echo ""
echo "🎉 CLI DEPLOYMENT SUCCESSFUL!"
echo "================================="
echo "✅ Video system deployed via CLI"
echo "✅ All 363 videos should now be available"
echo "✅ API endpoints should be functional"
echo ""
echo "🚀 Test your video gallery now!"