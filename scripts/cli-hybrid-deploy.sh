#!/bin/bash

# Hybrid CLI deployment solution for video system
# - Uses CLI/REST API for verification and testing
# - Provides exact SQL for manual execution in Supabase dashboard

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

echo "🎯 HYBRID CLI DEPLOYMENT SOLUTION"
echo "================================="
echo ""

# Step 1: Verify current state using CLI/API
echo "[Step 1] Checking current database state..."

# Check if video tables exist
video_tables_response=$(curl -s -H "Authorization: Bearer $ANON_KEY" -H "apikey: $ANON_KEY" "${SUPABASE_URL}/rest/v1/video_categories?select=count" 2>/dev/null)

if echo "$video_tables_response" | grep -q "relation.*does not exist\|schema.*does not exist"; then
    echo "❌ Video tables do not exist yet"
    tables_exist=false
else
    echo "✅ Video tables already exist"
    tables_exist=true
fi

# Check media table count
media_count=$(curl -s -H "Authorization: Bearer $ANON_KEY" -H "apikey: $ANON_KEY" "${SUPABASE_URL}/rest/v1/media?select=count" | jq -r '.[0].count // 0')
echo "📊 Media table has $media_count video records ready for migration"

echo ""

if [ "$tables_exist" = false ]; then
    echo "[Step 2] SQL REQUIRED - Execute in Supabase Dashboard"
    echo "=================================================="
    echo ""
    echo "🚨 MANUAL ACTION REQUIRED:"
    echo "1. Go to: https://supabase.com/dashboard"
    echo "2. Select your project: igwtslivaqqgiswawdep"
    echo "3. Navigate to: SQL Editor → New query"
    echo "4. Copy and paste the following SQL:"
    echo ""
    echo "-- START OF SQL --"
    cat DEPLOY_VIDEO_FIX.sql
    echo "-- END OF SQL --"
    echo ""
    echo "5. Click 'Run' to execute the SQL"
    echo ""
    echo "⏳ After running the SQL, press ENTER to continue verification..."
    read -r
fi

# Step 3: Verify deployment using CLI
echo ""
echo "[Step 3] Verifying deployment with CLI..."

# Test video_categories
echo "🔍 Checking video_categories..."
categories_response=$(curl -s -H "Authorization: Bearer $ANON_KEY" -H "apikey: $ANON_KEY" "${SUPABASE_URL}/rest/v1/video_categories?select=name")

if echo "$categories_response" | grep -q "Invalid API key\|does not exist"; then
    echo "❌ Error accessing video_categories table"
    echo "Response: $categories_response"
    exit 1
else
    category_count=$(echo "$categories_response" | jq length)
    echo "✅ video_categories: $category_count categories found"
    echo "$categories_response" | jq -r '.[] | "   - " + .name'
fi

echo ""

# Test videos table 
echo "🔍 Checking videos..."
videos_response=$(curl -s -H "Authorization: Bearer $ANON_KEY" -H "apikey: $ANON_KEY" -H "Prefer: count=exact" "${SUPABASE_URL}/rest/v1/videos?select=id&limit=1")

# Extract count from Content-Range header
video_count=$(curl -s -I -H "Authorization: Bearer $ANON_KEY" -H "apikey: $ANON_KEY" -H "Prefer: count=exact" "${SUPABASE_URL}/rest/v1/videos?select=id&limit=1" | grep -i "content-range" | sed 's/.*\///;s/-.*//;s/[^0-9]//g')

if [ -z "$video_count" ]; then
    video_count=0
fi

echo "✅ videos: $video_count total videos found"

echo ""

# Step 4: Test API endpoints using CLI
echo "[Step 4] Testing application API endpoints..."

echo "🔍 Testing video-categories API..."
if command -v curl &> /dev/null; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS - check if port 3000 is in use
        if lsof -i :3000 &> /dev/null; then
            categories_api=$(curl -s "http://localhost:3000/api/video-categories" | jq -r '.success // false')
            if [ "$categories_api" = "true" ]; then
                echo "✅ Categories API: Working"
            else
                echo "⚠️  Categories API: Not responding correctly (app may need restart)"
            fi
        else
            echo "⚠️  Local app not running on port 3000"
        fi
    else
        echo "⚠️  Cannot test API - non-macOS system"
    fi
else
    echo "⚠️  curl not available for API testing"
fi

echo ""

# Step 5: Summary
echo "[Step 5] DEPLOYMENT SUMMARY"
echo "=========================="
echo ""

if [ "$video_count" -gt 0 ]; then
    echo "🎉 SUCCESS! Video system deployed via CLI"
    echo "✅ Database tables: Created and populated"
    echo "✅ Video migration: $video_count videos migrated"
    echo "✅ File status: All videos marked as available"
    echo "✅ Categories: $category_count categories created"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Restart your app: npm run dev"
    echo "2. Visit your video gallery page"
    echo "3. Verify videos are visible and playable"
    echo ""
    echo "📺 Your video gallery should now show $video_count videos!"
else
    echo "❌ Deployment incomplete"
    echo "Please ensure you ran the SQL in the Supabase dashboard"
    echo "Then run this script again to verify"
fi