#!/usr/bin/env node

// Quick upload script for marketing images using exact environment
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const BUCKET_NAME = 'marketing-images';

async function uploadImages() {
  console.log('🚀 Quick Upload: Marketing Images');
  console.log('=================================');

  try {
    // Create bucket
    console.log('🪣 Setting up bucket...');
    const { error: bucketError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    });
    
    if (bucketError && !bucketError.message.includes('already exists')) {
      console.log(`   Bucket issue: ${bucketError.message}`);
    } else {
      console.log('   ✅ Bucket ready');
    }

    // Load marketing index
    console.log('\n📂 Loading marketing data...');
    const indexPath = 'public/schools/brand-safe-marketing-index.json';
    const marketingIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    
    console.log(`   Found ${marketingIndex.schools?.length || 0} schools`);
    console.log(`   Total images to upload: ${marketingIndex.summary?.totalImages || 0}`);

    let uploaded = 0;
    let errors = 0;

    // Process first few schools as test
    const schoolsToProcess = (marketingIndex.schools || []).slice(0, 3); // Test with first 3 schools
    
    for (const school of schoolsToProcess) {
      console.log(`\n🏫 ${school.name} (${school.images} images)`);
      
      // Load school data
      const schoolDataPath = `public/schools/${school.type}/${school.id}.json`;
      if (!fs.existsSync(schoolDataPath)) continue;
      
      const schoolData = JSON.parse(fs.readFileSync(schoolDataPath, 'utf8'));
      const images = (schoolData.marketing?.images || []).slice(0, 2); // Test with first 2 images per school
      
      for (const image of images) {
        try {
          const localPath = `public/schools/${image.localPath}`;
          if (!fs.existsSync(localPath)) {
            console.log(`   ⚠️  File not found: ${localPath}`);
            continue;
          }

          const fileBuffer = fs.readFileSync(localPath);
          const fileName = path.basename(localPath);
          const storagePath = `${school.type}/${school.id}/${fileName}`;
          
          // Upload to storage
          const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(storagePath, fileBuffer, { contentType: 'image/jpeg', upsert: true });

          if (uploadError) {
            console.log(`   ❌ Upload failed: ${uploadError.message}`);
            errors++;
            continue;
          }

          // Get public URL
          const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);

          // Insert to database
          const { error: dbError } = await supabase.from('marketing_images').insert({
            title: fileName,
            description: `Marketing image for ${school.name}`,
            image_url: urlData.publicUrl,
            thumbnail_url: urlData.publicUrl,
            original_filename: fileName,
            school_id: school.id,
            school_name: school.name,
            school_type: school.type,
            category: 'Brand Assets',
            content_type: 'Marketing Image',
            tags: [school.type, school.name.toLowerCase().replace(/\s+/g, '_')],
            file_size: fileBuffer.length,
            is_featured: false
          });

          if (dbError) {
            console.log(`   ❌ DB insert failed: ${dbError.message}`);
            errors++;
          } else {
            console.log(`   ✅ ${fileName}`);
            uploaded++;
          }

        } catch (error) {
          console.log(`   ❌ Error: ${error.message}`);
          errors++;
        }
      }
    }

    console.log('\n🎉 QUICK UPLOAD COMPLETE!');
    console.log('=========================');
    console.log(`✅ Uploaded: ${uploaded} images`);
    console.log(`❌ Errors: ${errors}`);
    console.log('\n🎯 Test your gallery: http://localhost:3000/test-gallery');

  } catch (error) {
    console.error('❌ Upload failed:', error.message);
  }
}

uploadImages();