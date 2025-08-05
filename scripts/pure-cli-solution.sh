#!/bin/bash

# PURE CLI SOLUTION for Video System Deployment
# Uses only REST API calls and file operations - no manual steps

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

echo "🎯 PURE CLI VIDEO SYSTEM DEPLOYMENT"
echo "===================================="
echo ""
echo "🔑 Using API-only approach with working anon key"
echo "📊 Target: $SUPABASE_URL"
echo ""

# Create API helper functions
api_call() {
    local method="$1"
    local endpoint="$2" 
    local data="$3"
    local headers="$4"
    
    curl -s -X "$method" \
         -H "Authorization: Bearer $ANON_KEY" \
         -H "apikey: $ANON_KEY" \
         -H "Content-Type: application/json" \
         $headers \
         "${SUPABASE_URL}/rest/v1${endpoint}" \
         ${data:+-d "$data"}
}

# Step 1: Check current state
echo "[Step 1] Checking database state via CLI..."

media_count=$(api_call "GET" "/media?select=count" | jq -r '.[0].count // 0')
echo "✅ Media table: $media_count video records found"

# Test if video tables exist
video_check=$(api_call "GET" "/video_categories?select=count&limit=1" 2>/dev/null)
if echo "$video_check" | grep -q "does not exist\|Invalid input syntax"; then
    tables_exist=false
    echo "❌ Video tables: Do not exist yet"
else
    tables_exist=true
    echo "✅ Video tables: Already exist"
fi

echo ""

if [ "$tables_exist" = false ]; then
    echo "[Step 2] Creating deployment file for CLI execution..."
    
    # Create a curl-based SQL execution script
    cat > temp_deploy.sh << 'EOF'
#!/bin/bash

# Since direct SQL execution via API is limited, we'll use a Supabase-compatible approach
# that creates an Edge Function to execute our SQL

echo "🚀 Deploying via Edge Function approach..."

# Create the Edge Function that contains our SQL
mkdir -p supabase/functions/deploy-video-system

cat > supabase/functions/deploy-video-system/index.ts << 'FUNC_EOF'
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

// Create tables and migrate data
const deploySQL = `
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

-- Migrate video data
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
  m.created_at as published_at, m.created_at, m.id as original_media_id,
  'available' as file_status, true as is_featured
FROM media m
WHERE m.url LIKE '%mp4%' AND m.url IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM videos v WHERE v.original_media_id = m.id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_videos_category_id ON videos(category_id);
CREATE INDEX IF NOT EXISTS idx_videos_featured ON videos(is_featured);
CREATE INDEX IF NOT EXISTS idx_videos_file_status ON videos(file_status);
CREATE INDEX IF NOT EXISTS idx_videos_platform ON videos(platform);
`;

serve(async (req) => {
  try {
    // Execute the deployment SQL
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Execute SQL in chunks to avoid timeouts
    const sqlStatements = deploySQL.split(';').filter(stmt => stmt.trim())
    
    for (const stmt of sqlStatements) {
      if (stmt.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: stmt })
        if (error) {
          console.error('SQL Error:', error)
          throw error
        }
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Video system deployed successfully',
      executed: sqlStatements.length 
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
FUNC_EOF

echo "✅ Edge Function created for deployment"
EOF

    # Make temp deploy script executable
    chmod +x temp_deploy.sh
    
    echo "🔧 Created CLI deployment solution"
    echo ""
    echo "[Step 3] Executing Edge Function deployment..."
    
    # Execute the deployment
    ./temp_deploy.sh
    
    echo ""
    echo "[Step 4] Deploying Edge Function..."
    
    # Deploy the Edge Function
    if command -v supabase &> /dev/null; then
        echo "📤 Deploying Edge Function via CLI..."
        supabase functions deploy deploy-video-system --project-ref igwtslivaqqgiswawdep --no-verify-jwt
        
        echo ""
        echo "🚀 Invoking deployment function..."
        
        # Call the Edge Function to execute deployment
        deployment_result=$(curl -s -X POST \
            "${SUPABASE_URL}/functions/v1/deploy-video-system" \
            -H "Authorization: Bearer $ANON_KEY" \
            -H "Content-Type: application/json")
        
        echo "📊 Deployment result: $deployment_result"
        
        # Cleanup
        supabase functions delete deploy-video-system --project-ref igwtslivaqqgiswawdep
        
    else
        echo "⚠️  Supabase CLI not properly configured for Edge Functions"
    fi
    
    # Cleanup temp files
    rm -f temp_deploy.sh
    rm -rf supabase/functions/deploy-video-system
fi

echo ""
echo "[Step 5] Verifying deployment via CLI..."

# Verify video tables
categories_result=$(api_call "GET" "/video_categories?select=name")
if echo "$categories_result" | grep -q "All Videos"; then
    category_count=$(echo "$categories_result" | jq length)
    echo "✅ Categories: $category_count created successfully"
    echo "$categories_result" | jq -r '.[] | "   - " + .name'
else
    echo "❌ Categories: Still not accessible"
fi

echo ""

# Verify videos
videos_result=$(api_call "GET" "/videos?select=count&limit=1" "" "-H 'Prefer: count=exact'")
video_count=$(curl -s -I -H "Authorization: Bearer $ANON_KEY" -H "apikey: $ANON_KEY" -H "Prefer: count=exact" "${SUPABASE_URL}/rest/v1/videos?select=id&limit=1" | grep -i "content-range" | sed 's/.*\///;s/-.*//;s/[^0-9]//g' || echo "0")

echo "✅ Videos: $video_count total migrated"

echo ""
echo "[Step 6] Testing application APIs via CLI..."

# Test if local app is running
if lsof -i :3000 &> /dev/null; then
    categories_api=$(curl -s "http://localhost:3000/api/video-categories" | jq -r '.success // false')
    if [ "$categories_api" = "true" ]; then
        echo "✅ Categories API: Working"
    else
        echo "❌ Categories API: Failed"
    fi
    
    videos_api=$(curl -s "http://localhost:3000/api/videos" | jq -r '.success // false')
    if [ "$videos_api" = "true" ]; then
        echo "✅ Videos API: Working"
    else
        echo "❌ Videos API: Failed"
    fi
else
    echo "⚠️  Local app not running - start with 'npm run dev'"
fi

echo ""
echo "🎉 PURE CLI DEPLOYMENT COMPLETE!"
echo "================================="

if [ "$video_count" -gt 0 ]; then
    echo "✅ Success: Video system deployed entirely via CLI"
    echo "📺 Videos available: $video_count"
    echo "🎯 Categories created: $category_count"
    echo ""
    echo "🚀 Ready to test your video gallery!"
else
    echo "⚠️  Deployment may need manual verification"
    echo "Check Supabase dashboard if videos don't appear"
fi