#!/usr/bin/env node

/**
 * Database Schema Inspector
 * 
 * Uses Supabase client to inspect current database schema and tables
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('[Inspector] Analyzing database schema...\n');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

console.log('🔗 Supabase URL:', supabaseUrl);
console.log('🔑 Using anon key for inspection\n');

// Create client
const supabase = createClient(supabaseUrl, anonKey);

async function inspectDatabase() {
  console.log('[Inspector] Checking available tables...\n');
  
  try {
    // Try to query each known table to see what exists
    const tablesToCheck = [
      'content',
      'media', 
      'transcriptions',
      'video_categories',
      'videos',
      'users',
      'profiles'
    ];
    
    const existingTables = [];
    const missingTables = [];
    
    for (const tableName of tablesToCheck) {
      try {
        console.log(`[Test] Checking table: ${tableName}`);
        
        // Try to count rows in the table
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`  ❌ ${tableName}: ${error.message}`);
          missingTables.push(tableName);
        } else {
          console.log(`  ✅ ${tableName}: exists (${count || 0} rows)`);
          existingTables.push({ name: tableName, count: count || 0 });
        }
      } catch (err) {
        console.log(`  ❌ ${tableName}: ${err.message}`);
        missingTables.push(tableName);
      }
    }
    
    console.log('\n[Results] Database Schema Analysis:');
    console.log('=====================================');
    
    console.log('\n✅ EXISTING TABLES:');
    existingTables.forEach(table => {
      console.log(`  - ${table.name} (${table.count} rows)`);
    });
    
    console.log('\n❌ MISSING TABLES:');
    missingTables.forEach(table => {
      console.log(`  - ${table}`);
    });
    
    // Check specifically for our video-related tables
    const videoTablesNeeded = ['video_categories', 'videos'];
    const missingVideoTables = videoTablesNeeded.filter(table => 
      missingTables.includes(table)
    );
    
    if (missingVideoTables.length > 0) {
      console.log('\n🎥 VIDEO GALLERY ISSUE IDENTIFIED:');
      console.log('===================================');
      console.log('Missing required tables for video functionality:');
      missingVideoTables.forEach(table => {
        console.log(`  - ${table}`);
      });
      console.log('\nThis explains why "No videos found" is showing.');
      console.log('You need to create these tables using the SQL provided.');
    } else {
      console.log('\n🎥 Video tables exist! Let\'s check their content...');
      
      // If video tables exist, check their content
      if (existingTables.find(t => t.name === 'video_categories')) {
        const { data: categories } = await supabase
          .from('video_categories')
          .select('*')
          .limit(5);
        
        console.log('\nVideo Categories Sample:');
        console.log(JSON.stringify(categories, null, 2));
      }
      
      if (existingTables.find(t => t.name === 'videos')) {
        const { data: videos } = await supabase
          .from('videos')
          .select('*')
          .limit(5);
        
        console.log('\nVideos Sample:');
        console.log(JSON.stringify(videos, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Error during inspection:', error);
  }
}

// Run the inspection
inspectDatabase().catch(console.error);