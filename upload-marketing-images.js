#!/usr/bin/env node

/**
 * Upload Marketing Images to Supabase
 * 
 * This script uploads the 121 extracted brand-safe marketing images to Supabase Storage
 * and populates the marketing_images database table with metadata.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Bucket name for marketing images
const BUCKET_NAME = 'marketing-images';

async function uploadMarketingImages() {
  console.log('🚀 Uploading Marketing Images to Supabase');
  console.log('==========================================');
  console.log(`📡 Connected to: ${supabaseUrl}`);

  try {
    // Step 1: Check if bucket exists, create if not
    console.log('\n🪣 Setting up storage bucket...');
    
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      console.log(`   Creating '${BUCKET_NAME}' bucket...`);
      const { error: bucketError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (bucketError && !bucketError.message.includes('already exists')) {
        console.error('   ❌ Bucket creation failed:', bucketError.message);
        return;
      }
    }
    
    console.log(`   ✅ Bucket '${BUCKET_NAME}' ready`);

    // Step 2: Load the brand-safe marketing index
    console.log('\n📂 Loading extracted marketing data...');
    
    const indexPath = path.join('public', 'schools', 'brand-safe-marketing-index.json');
    if (!fs.existsSync(indexPath)) {
      console.error(`❌ Marketing index not found at: ${indexPath}`);
      console.log('💡 Make sure you ran the extraction scripts first!');
      return;
    }

    const marketingIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    console.log(`   ✅ Found ${marketingIndex.schools?.length || 0} schools with marketing content`);

    // Step 3: Process each school's marketing images
    let totalImages = 0;
    let uploadedImages = 0;
    let errors = 0;

    for (const school of marketingIndex.schools || []) {
      console.log(`\n🏫 Processing: ${school.name} (${school.type})`);
      
      // Load school's marketing data
      const schoolDataPath = path.join('public', 'schools', school.type, school.id + '.json');
      if (!fs.existsSync(schoolDataPath)) {
        console.log(`   ⚠️  No data file found: ${schoolDataPath}`);
        continue;
      }

      const schoolData = JSON.parse(fs.readFileSync(schoolDataPath, 'utf8'));
      const images = schoolData.marketing?.images || [];
      
      console.log(`   📸 Found ${images.length} images`);
      totalImages += images.length;

      for (const image of images) {
        try {
          // Check if file exists locally
          const localImagePath = path.join('public', 'schools', image.localPath || '');
          if (!fs.existsSync(localImagePath)) {
            console.log(`     ⚠️  File not found: ${localImagePath}`);
            errors++;
            continue;
          }

          // Read file
          const fileBuffer = fs.readFileSync(localImagePath);
          const fileName = path.basename(localImagePath);
          const fileExtension = path.extname(fileName).toLowerCase();
          
          // Generate storage path: school-type/school-id/filename
          const storagePath = `${school.type}/${school.id}/${fileName}`;
          
          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(storagePath, fileBuffer, {
              contentType: image.mimeType || `image/${fileExtension.slice(1)}`,
              upsert: true
            });

          if (uploadError) {
            console.log(`     ❌ Upload failed for ${fileName}: ${uploadError.message}`);
            errors++;
            continue;
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(storagePath);

          // Determine content category based on filename/path
          let category = 'Stock Photography'; // default
          let contentType = 'General Marketing';

          const filenameLower = fileName.toLowerCase();
          const pathLower = (image.localPath || '').toLowerCase();

          if (filenameLower.includes('logo') || pathLower.includes('logo')) {
            category = 'Brand Assets';
            contentType = 'Logo';
          } else if (filenameLower.includes('flyer') || pathLower.includes('flyer') || filenameLower.includes('event')) {
            category = 'Event Flyers';
            contentType = 'Event Promotion';
          } else if (filenameLower.includes('social') || pathLower.includes('social')) {
            category = 'Social Media';
            contentType = 'Social Media Post';
          } else if (filenameLower.includes('sign') || pathLower.includes('sign')) {
            category = 'Signage';
            contentType = 'Physical Signage';
          } else if (filenameLower.includes('camp') || pathLower.includes('camp') || filenameLower.includes('summer')) {
            category = 'Summer Camp';
            contentType = 'Camp Promotion';
          } else if (filenameLower.includes('business') || filenameLower.includes('card') || filenameLower.includes('qr')) {
            category = 'Business Materials';
            contentType = 'Business Collateral';
          }

          // Insert into database
          const { error: dbError } = await supabase
            .from('marketing_images')
            .insert({
              title: image.organizedName || image.originalName || fileName,
              description: `Marketing image for ${school.name}`,
              image_url: urlData.publicUrl,
              thumbnail_url: urlData.publicUrl, // Same for now, could generate thumbnails later
              original_filename: fileName,
              school_id: school.id,
              school_name: school.name,
              school_type: school.type,
              category: category,
              content_type: contentType,
              tags: [school.type, school.name.replace(/\s+/g, '_').toLowerCase()],
              google_drive_id: image.googleDriveId || null,
              google_drive_url: image.webViewLink || null,
              file_size: fileBuffer.length,
              width: null, // Could extract with image library if needed
              height: null,
              is_featured: false
            });

          if (dbError) {
            console.log(`     ❌ Database insert failed for ${fileName}: ${dbError.message}`);
            errors++;
          } else {
            console.log(`     ✅ ${fileName} → ${category}`);
            uploadedImages++;
          }

        } catch (error) {
          console.log(`     ❌ Error processing ${image.originalName}: ${error.message}`);
          errors++;
        }
      }
    }

    // Final summary
    console.log('\n🎉 UPLOAD COMPLETE!');
    console.log('===================');
    console.log(`📊 Total images found: ${totalImages}`);
    console.log(`✅ Successfully uploaded: ${uploadedImages}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`🔗 Storage bucket: ${BUCKET_NAME}`);
    console.log(`🎯 Gallery: http://localhost:3000/test-gallery`);
    
    if (uploadedImages > 0) {
      console.log('\n🚀 NEXT STEPS:');
      console.log('1. ✅ Images uploaded to Supabase Storage');
      console.log('2. ✅ Database populated with metadata');
      console.log('3. 🎯 View gallery: http://localhost:3000/test-gallery');
      console.log('4. 🎨 Images ready for website integration!');
    }

  } catch (error) {
    console.error('❌ Upload process failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Check if brand-safe-marketing-index.json exists');
    console.log('- Verify Supabase credentials in .env.local');
    console.log('- Ensure database tables were created');
  }
}

uploadMarketingImages();