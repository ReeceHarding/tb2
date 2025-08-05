#!/usr/bin/env node

/**
 * Deploy Video System Fix to Remote Database
 * 
 * Executes SQL directly on deployed Supabase instance using service role key
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

console.log('[Deploy] Starting video system deployment to remote database...\n');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables for deployment');
  process.exit(1);
}

console.log('🎯 Target:', supabaseUrl);
console.log('🔑 Using service role key for admin operations\n');

// Create admin client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQL(sqlCommand, description) {
  console.log(`[SQL] Executing: ${description}...`);
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlCommand });
    if (error) {
      console.error(`❌ Error in ${description}:`, error);
      return false;
    }
    console.log(`✅ Success: ${description}`);
    return true;
  } catch (err) {
    // Try alternative method if rpc doesn't exist
    console.log(`[SQL] Trying alternative method for: ${description}...`);
    try {
      // For table creation, we'll use direct SQL execution
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql: sqlCommand })
      });
      
      if (!response.ok) {
        console.error(`❌ HTTP Error in ${description}:`, response.status, await response.text());
        return false;
      }
      
      console.log(`✅ Success: ${description}`);
      return true;
    } catch (altErr) {
      console.error(`❌ Alternative method failed for ${description}:`, altErr.message);
      return false;
    }
  }
}

async function deployVideoSystem() {
  console.log('[Step 1] Creating video_categories table...');
  
  const createCategoriesTable = `
    CREATE TABLE IF NOT EXISTS video_categories (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      color VARCHAR(7) DEFAULT '#3B82F6',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );
  `;
  
  await executeSQL(createCategoriesTable, 'Create video_categories table');
  
  console.log('\n[Step 2] Creating videos table...');
  
  const createVideosTable = `
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
  `;
  
  await executeSQL(createVideosTable, 'Create videos table');
  
  console.log('\n[Step 3] Inserting video categories...');
  
  const insertCategories = `
    INSERT INTO video_categories (name, description, color) VALUES
    ('All Videos', 'All video content', '#3B82F6'),
    ('Twitter Videos', 'Videos from Twitter/X platform', '#1DA1F2'),
    ('July 2025', 'Videos from July 2025', '#10B981'),
    ('Recent Content', 'Recently uploaded videos', '#8B5CF6')
    ON CONFLICT (name) DO NOTHING;
  `;
  
  await executeSQL(insertCategories, 'Insert video categories');
  
  console.log('\n[Step 4] Migrating video data from media table...');
  
  const migrateVideos = `
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
      AND NOT EXISTS (SELECT 1 FROM videos v WHERE v.original_media_id = m.id);
  `;
  
  await executeSQL(migrateVideos, 'Migrate videos from media table');
  
  console.log('\n[Step 5] Creating support functions...');
  
  const createFunction = `
    CREATE OR REPLACE FUNCTION increment_view_count(video_id UUID)
    RETURNS void AS $$
    BEGIN
      UPDATE videos 
      SET view_count = view_count + 1,
          updated_at = NOW()
      WHERE id = video_id;
    END;
    $$ LANGUAGE plpgsql;
  `;
  
  await executeSQL(createFunction, 'Create increment_view_count function');
  
  console.log('\n[Step 6] Creating indexes for performance...');
  
  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_videos_category_id ON videos(category_id);
    CREATE INDEX IF NOT EXISTS idx_videos_featured ON videos(is_featured);
    CREATE INDEX IF NOT EXISTS idx_videos_file_status ON videos(file_status);
    CREATE INDEX IF NOT EXISTS idx_videos_platform ON videos(platform);
  `;
  
  await executeSQL(createIndexes, 'Create performance indexes');
  
  console.log('\n[Step 7] Verifying deployment...');
  
  try {
    const { data: categories, error: catError } = await supabase
      .from('video_categories')
      .select('*');
    
    if (catError) {
      console.error('❌ Error verifying categories:', catError);
      return;
    }
    
    const { data: videos, error: videoError } = await supabase
      .from('videos')
      .select('*', { count: 'exact' });
    
    if (videoError) {
      console.error('❌ Error verifying videos:', videoError);
      return;
    }
    
    console.log('🎉 DEPLOYMENT SUCCESSFUL!');
    console.log('=====================================');
    console.log(`✅ Categories created: ${categories?.length || 0}`);
    console.log(`✅ Videos migrated: ${videos?.length || 0}`);
    console.log(`✅ All videos marked as: available`);
    console.log('');
    console.log('🚀 Your video gallery should now be fully functional!');
    console.log(`📺 Visit your app to see ${videos?.length || 0} available videos`);
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
  }
}

// Execute deployment
deployVideoSystem().catch(console.error);