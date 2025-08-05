#!/usr/bin/env node

/**
 * Verify Database Setup
 * 
 * Tests if the video database tables are properly created and populated
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('[Verify] Testing video database setup...\n');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

// Create client with anon key
const supabase = createClient(supabaseUrl, anonKey);

async function testTables() {
  console.log('[Test] Checking if tables exist and have data...\n');
  
  try {
    // Test video_categories table
    console.log('[Test] Testing video_categories table...');
    const { data: categories, error: catError } = await supabase
      .from('video_categories')
      .select('*');
    
    if (catError) {
      if (catError.code === '42P01') {
        console.log('❌ video_categories table does not exist');
        return false;
      } else {
        console.error('❌ Error querying video_categories:', catError.message);
        return false;
      }
    }
    
    console.log(`✅ video_categories table exists with ${categories.length} categories`);
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.color})`);
    });
    
    // Test videos table
    console.log('\n[Test] Testing videos table...');
    const { data: videos, error: vidError } = await supabase
      .from('videos')
      .select('*');
    
    if (vidError) {
      if (vidError.code === '42P01') {
        console.log('❌ videos table does not exist');
        return false;
      } else {
        console.error('❌ Error querying videos:', vidError.message);
        return false;
      }
    }
    
    console.log(`✅ videos table exists with ${videos.length} videos`);
    videos.forEach(vid => {
      console.log(`   - ${vid.title} (${vid.category}, ${vid.duration}s)`);
    });
    
    if (categories.length > 0 && videos.length > 0) {
      console.log('\n🎉 Database setup is complete!');
      return true;
    } else {
      console.log('\n⚠️  Tables exist but no sample data found');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

async function testAPIs() {
  console.log('\n[Test] Testing API endpoints...\n');
  
  try {
    // Test categories API
    console.log('[Test] Testing /api/video-categories...');
    const catResponse = await fetch('http://localhost:3000/api/video-categories');
    if (catResponse.ok) {
      const catData = await catResponse.json();
      console.log(`✅ Categories API: ${catData.categories.length} categories`);
    } else {
      console.error('❌ Categories API failed:', catResponse.status);
      return false;
    }
    
    // Test videos API
    console.log('[Test] Testing /api/videos...');
    const vidResponse = await fetch('http://localhost:3000/api/videos');
    if (vidResponse.ok) {
      const vidData = await vidResponse.json();
      console.log(`✅ Videos API: ${vidData.videos.length} videos`);
      if (vidData.videos.length > 0) {
        console.log('✅ Video gallery should now be working!');
        return true;
      } else {
        console.log('⚠️  API working but no videos returned');
        return false;
      }
    } else {
      console.error('❌ Videos API failed:', vidResponse.status);
      return false;
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('Make sure your dev server is running: npm run dev');
    return false;
  }
}

async function main() {
  const dbReady = await testTables();
  
  if (!dbReady) {
    console.log('\n📋 TO FIX THIS:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Open your project SQL Editor');
    console.log('3. Run the SQL from MANUAL_DATABASE_SETUP.md');
    console.log('4. Then run this script again to verify');
    process.exit(1);
  }
  
  const apiReady = await testAPIs();
  
  if (apiReady) {
    console.log('\n🎉 Everything is working! Visit http://localhost:3000 to see your video gallery.');
  } else {
    console.log('\n⚠️  Database is ready but APIs may need restart. Try refreshing your browser.');
  }
}

main();