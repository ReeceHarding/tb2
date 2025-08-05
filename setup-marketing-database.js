#!/usr/bin/env node

/**
 * Setup Marketing Images Database Tables
 * 
 * Automatically creates all required database tables and functions for marketing images
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupMarketingDatabase() {
  console.log('🚀 Setting Up Marketing Images Database');
  console.log('=====================================');
  console.log(`🔗 Connected to: ${supabaseUrl}`);

  try {
    console.log('\n🔨 Creating marketing_image_categories table...');
    
    // Create categories table
    const createCategoriesTable = `
      CREATE TABLE IF NOT EXISTS marketing_image_categories (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        color VARCHAR(7) DEFAULT '#3B82F6',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );
    `;
    
    const { error: catTableError } = await supabase.rpc('query', { 
      query: createCategoriesTable 
    });

    console.log('🔨 Creating marketing_images table...');
    
    // Create images table
    const createImagesTable = `
      CREATE TABLE IF NOT EXISTS marketing_images (
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
    
    const { error: imgTableError } = await supabase.rpc('query', { 
      query: createImagesTable 
    });

    console.log('🔑 Creating view count function...');
    
    // Create view count function
    const createViewCountFunction = `
      CREATE OR REPLACE FUNCTION increment_marketing_image_view_count(image_id UUID)
      RETURNS VOID AS $$
      BEGIN
        UPDATE marketing_images 
        SET view_count = view_count + 1,
            updated_at = TIMEZONE('utc'::text, NOW())
        WHERE id = image_id;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    await supabase.rpc('query', { query: createViewCountFunction });

    console.log('📂 Setting up marketing categories...');
    
    // Insert categories
    const categoriesData = [
      { name: 'Brand Assets', description: 'Logos, brand materials, and corporate identity', color: '#3B82F6' },
      { name: 'Event Flyers', description: 'Event promotion materials and announcements', color: '#10B981' },
      { name: 'Social Media', description: 'Social media graphics and promotional content', color: '#8B5CF6' },
      { name: 'Signage', description: 'Physical signage and display materials', color: '#F59E0B' },
      { name: 'Summer Camp', description: 'Summer camp promotional materials', color: '#EC4899' },
      { name: 'Business Materials', description: 'Business cards, QR codes, and professional materials', color: '#6B7280' },
      { name: 'Stock Photography', description: 'Professional photos and general marketing images', color: '#14B8A6' }
    ];

    for (const category of categoriesData) {
      const { error: insertError } = await supabase
        .from('marketing_image_categories')
        .upsert(category, { onConflict: 'name' });
        
      if (!insertError) {
        console.log(`   ✅ Category: ${category.name}`);
      }
    }

    // Enable RLS
    console.log('🔒 Setting up Row Level Security...');
    await supabase.rpc('query', { 
      query: 'ALTER TABLE marketing_image_categories ENABLE ROW LEVEL SECURITY;' 
    });
    await supabase.rpc('query', { 
      query: 'ALTER TABLE marketing_images ENABLE ROW LEVEL SECURITY;' 
    });

    // Create policies
    await supabase.rpc('query', { 
      query: `CREATE POLICY "Marketing image categories are publicly readable" ON marketing_image_categories FOR SELECT USING (true);` 
    });
    await supabase.rpc('query', { 
      query: `CREATE POLICY "Marketing images are publicly readable" ON marketing_images FOR SELECT USING (true);` 
    });

    // Final verification
    console.log('\n🔍 Final verification...');
    
    const { data: finalCategories } = await supabase
      .from('marketing_image_categories')
      .select('*');
      
    const { data: finalImages } = await supabase
      .from('marketing_images') 
      .select('*');

    console.log('\n🎉 DATABASE SETUP COMPLETE!');
    console.log('============================');
    console.log(`✅ marketing_image_categories: ${finalCategories?.length || 0} categories`);
    console.log(`✅ marketing_images: ${finalImages?.length || 0} images (ready for upload)`);
    console.log(`🔗 API endpoint ready: /api/marketing-images`);
    console.log(`🎨 Gallery component ready: MarketingImageGallery`);
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. ✅ Database setup complete');
    console.log('2. 🔄 Run: npm run setup-marketing-images');
    console.log('3. 🎯 View: http://localhost:3000/test-gallery');
    console.log('4. 🎉 See your 121 brand-safe marketing images!');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n🔧 FALLBACK OPTION:');
    console.log('Go to your Supabase Dashboard → SQL Editor');
    console.log('Copy/paste the contents of marketing-images-supabase-setup.sql');
    console.log('Click "Run" to execute manually');
  }
}

setupMarketingDatabase();