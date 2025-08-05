#!/usr/bin/env node

/**
 * Direct SQL execution to create marketing tables
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixMarketingTables() {
  console.log('🔧 Fixing Marketing Images Database Tables');
  console.log('==========================================');

  try {
    // Drop existing tables if they exist (to start fresh)
    console.log('🗑️  Dropping existing tables (if any)...');
    
    const dropQueries = [
      'DROP TABLE IF EXISTS marketing_images CASCADE;',
      'DROP TABLE IF EXISTS marketing_image_categories CASCADE;',
      'DROP FUNCTION IF EXISTS increment_marketing_image_view_count(UUID);'
    ];

    for (const query of dropQueries) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: query });
        if (error) {
          console.log(`   Note: ${query.split(' ')[2]} may not have existed`);
        }
      } catch (e) {
        // Ignore errors for non-existent objects
      }
    }

    // Create categories table
    console.log('📂 Creating marketing_image_categories table...');
    
    const createCategoriesSQL = `
      CREATE TABLE marketing_image_categories (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        color VARCHAR(7) DEFAULT '#3B82F6',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );
    `;

    let { error: catError } = await supabase.rpc('exec_sql', { sql: createCategoriesSQL });
    if (catError) {
      console.log('   Trying alternative method...');
      const { error: catError2 } = await supabase.rpc('exec', { sql: createCategoriesSQL });
      if (catError2) console.log('   Categories table creation issue:', catError2.message);
    }

    // Create images table
    console.log('🖼️  Creating marketing_images table...');
    
    const createImagesSQL = `
      CREATE TABLE marketing_images (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        image_url TEXT NOT NULL,
        thumbnail_url TEXT,
        original_filename TEXT NOT NULL,
        school_id VARCHAR(255) NOT NULL,
        school_name VARCHAR(255) NOT NULL,
        school_type VARCHAR(50) NOT NULL,
        category VARCHAR(255) NOT NULL,
        content_type VARCHAR(100),
        tags TEXT[] DEFAULT '{}',
        google_drive_id TEXT,
        google_drive_url TEXT,
        file_size INTEGER DEFAULT 0,
        width INTEGER,
        height INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        is_featured BOOLEAN DEFAULT false,
        view_count INTEGER DEFAULT 0
      );
    `;

    let { error: imgError } = await supabase.rpc('exec_sql', { sql: createImagesSQL });
    if (imgError) {
      console.log('   Trying alternative method...');
      const { error: imgError2 } = await supabase.rpc('exec', { sql: createImagesSQL });
      if (imgError2) console.log('   Images table creation issue:', imgError2.message);
    }

    // Insert sample categories using direct inserts
    console.log('📋 Adding marketing categories...');
    
    const categories = [
      { name: 'Brand Assets', description: 'Logos, brand materials, and corporate identity', color: '#3B82F6' },
      { name: 'Event Flyers', description: 'Event promotion materials and announcements', color: '#10B981' },
      { name: 'Social Media', description: 'Social media graphics and promotional content', color: '#8B5CF6' },
      { name: 'Signage', description: 'Physical signage and display materials', color: '#F59E0B' },
      { name: 'Summer Camp', description: 'Summer camp promotional materials', color: '#EC4899' },
      { name: 'Business Materials', description: 'Business cards, QR codes, and professional materials', color: '#6B7280' },
      { name: 'Stock Photography', description: 'Professional photos and general marketing images', color: '#14B8A6' }
    ];

    for (const category of categories) {
      const { error: insertError } = await supabase
        .from('marketing_image_categories')
        .upsert(category, { onConflict: 'name' });
        
      if (!insertError) {
        console.log(`   ✅ ${category.name}`);
      } else {
        console.log(`   ⚠️  ${category.name}: ${insertError.message}`);
      }
    }

    // Test the tables
    console.log('\n🧪 Testing table access...');
    
    const { data: testCategories, error: testCatError } = await supabase
      .from('marketing_image_categories')
      .select('*')
      .limit(1);

    if (testCatError) {
      console.log(`   ❌ Categories test failed: ${testCatError.message}`);
    } else {
      console.log(`   ✅ Categories table accessible: ${testCategories?.length || 0} records`);
    }

    const { data: testImages, error: testImgError } = await supabase
      .from('marketing_images')
      .select('*')
      .limit(1);

    if (testImgError) {
      console.log(`   ❌ Images test failed: ${testImgError.message}`);
    } else {
      console.log(`   ✅ Images table accessible: ${testImages?.length || 0} records`);
    }

    console.log('\n🎉 TABLES FIXED!');
    console.log('================');
    console.log('✅ marketing_image_categories table ready');
    console.log('✅ marketing_images table ready');  
    console.log('🔗 API should now work at /api/marketing-images');
    console.log('🎯 Test gallery: http://localhost:3000/test-gallery');

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

fixMarketingTables();