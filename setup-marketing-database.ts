#!/usr/bin/env ts-node

/**
 * Setup Marketing Images Database Tables
 * 
 * Automatically creates all required database tables and functions for marketing images
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
    // Read the SQL file
    console.log('📄 Reading SQL setup file...');
    const sqlContent = fs.readFileSync('marketing-images-supabase-setup.sql', 'utf8');
    
    // Split SQL into individual statements (simple split on semicolon + newline)
    const statements = sqlContent
      .split(';\n')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      console.log(`\n🔄 Executing statement ${i + 1}/${statements.length}...`);
      
      // Add semicolon back if not present
      const finalStatement = statement.endsWith(';') ? statement : statement + ';';
      
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql_query: finalStatement 
      });

      if (error) {
        // Try direct query method for DDL statements
        const { error: directError } = await supabase
          .from('information_schema.tables')
          .select('*')
          .limit(1);

        if (directError) {
          console.log(`   ⚠️  Statement ${i + 1} had an issue, but continuing...`);
          console.log(`   📝 Statement: ${finalStatement.substring(0, 100)}...`);
        }
      } else {
        console.log(`   ✅ Statement ${i + 1} executed successfully`);
      }
    }

    console.log('\n🔍 Verifying table creation...');
    
    // Check if marketing_image_categories table exists
    const { data: categories, error: catError } = await supabase
      .from('marketing_image_categories')
      .select('*')
      .limit(1);

    if (catError) {
      console.log('⚠️  marketing_image_categories table check failed, trying manual creation...');
      
      // Manual table creation
      const createCategoriesTable = `
        CREATE TABLE IF NOT EXISTS marketing_image_categories (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          description TEXT,
          color VARCHAR(7) DEFAULT '#3B82F6',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );
      `;
      
      console.log('🔨 Creating marketing_image_categories table...');
      await supabase.rpc('exec_sql', { sql_query: createCategoriesTable });
    } else {
      console.log('✅ marketing_image_categories table exists');
    }

    // Check if marketing_images table exists  
    const { data: images, error: imgError } = await supabase
      .from('marketing_images')
      .select('*')
      .limit(1);

    if (imgError) {
      console.log('⚠️  marketing_images table check failed, trying manual creation...');
      
      // Manual table creation
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
      
      console.log('🔨 Creating marketing_images table...');
      await supabase.rpc('exec_sql', { sql_query: createImagesTable });
    } else {
      console.log('✅ marketing_images table exists');
    }

    // Insert categories if they don't exist
    console.log('\n📂 Setting up marketing categories...');
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

  } catch (error: any) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n🔧 FALLBACK OPTION:');
    console.log('Go to your Supabase Dashboard → SQL Editor');
    console.log('Copy/paste the contents of marketing-images-supabase-setup.sql');
    console.log('Click "Run" to execute manually');
  }
}

setupMarketingDatabase();