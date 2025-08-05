#!/usr/bin/env node

/**
 * Upload Real Marketing Images from Recursive Data
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Supabase config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Convert Google Drive webViewLink to direct image URL
function convertToDirectImageUrl(webViewLink) {
  // Extract file ID from the link
  const match = webViewLink.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (match) {
    const fileId = match[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  return webViewLink;
}

// Determine category from filename/folder structure
function categorizeImage(image) {
  const filename = image.name.toLowerCase();
  
  if (filename.includes('logo')) {
    return { category: 'Brand Assets', contentType: 'Logo' };
  } else if (filename.includes('flyer') || filename.includes('event')) {
    return { category: 'Event Flyers', contentType: 'Event Promotion' };
  } else if (filename.includes('social') || filename.includes('instagram') || filename.includes('facebook')) {
    return { category: 'Social Media', contentType: 'Social Media Post' };
  } else if (filename.includes('sign') || filename.includes('banner')) {
    return { category: 'Signage', contentType: 'Physical Signage' };
  } else if (filename.includes('camp') || filename.includes('summer')) {
    return { category: 'Summer Camp', contentType: 'Camp Promotion' };
  } else if (filename.includes('business') || filename.includes('card') || filename.includes('qr')) {
    return { category: 'Business Materials', contentType: 'Business Collateral' };
  }
  
  return { category: 'Stock Photography', contentType: 'General Marketing' };
}

async function uploadRealImages() {
  console.log('🚀 Uploading Real Marketing Images');
  console.log('==================================');

  try {
    // Get all school directories
    const recursiveDir = 'school-data-extraction/recursive-downloads';
    const schoolDirs = fs.readdirSync(recursiveDir).filter(dir => 
      fs.statSync(path.join(recursiveDir, dir)).isDirectory()
    );

    console.log(`📂 Found ${schoolDirs.length} schools with data`);

    let totalImages = 0;
    let uploadedImages = 0;
    let errors = 0;

    // Process each school
    for (const schoolDir of schoolDirs) {
      const dataPath = path.join(recursiveDir, schoolDir, 'recursive-data.json');
      
      if (!fs.existsSync(dataPath)) {
        console.log(`⚠️  No data file for: ${schoolDir}`);
        continue;
      }

      const schoolData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      const images = schoolData.media?.images || [];
      
      if (images.length === 0) {
        console.log(`📂 ${schoolDir}: No images`);
        continue;
      }

      console.log(`\n🏫 ${schoolDir}: ${images.length} images`);
      totalImages += images.length;

      // Process each image
      for (const image of images) {
        try {
          // Convert Google Drive link to direct URL
          const directImageUrl = convertToDirectImageUrl(image.webViewLink);
          const thumbnailUrl = image.thumbnailLink || directImageUrl;
          
          // Categorize image
          const { category, contentType } = categorizeImage(image);
          
          // Generate school info
          const schoolName = schoolData.school.name;
          const schoolId = schoolData.school.id;
          const schoolType = schoolName.toLowerCase().includes('alpha') ? 'alpha-schools' : 
                            schoolName.toLowerCase().includes('gt') ? 'other-schools' : 'special';

          // Insert into database
          const { error: dbError } = await supabase
            .from('marketing_images')
            .insert({
              title: image.name,
              description: `${contentType} for ${schoolName}`,
              image_url: directImageUrl,
              thumbnail_url: thumbnailUrl,
              original_filename: image.name,
              school_id: schoolId,
              school_name: schoolName,
              school_type: schoolType,
              category: category,
              content_type: contentType,
              tags: [schoolType, schoolName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()],
              google_drive_id: image.id,
              google_drive_url: image.webViewLink,
              file_size: parseInt(image.size || '0'),
              width: null,
              height: null,
              is_featured: category === 'Brand Assets' && image.name.toLowerCase().includes('logo')
            });

          if (dbError) {
            console.log(`     ❌ ${image.name}: ${dbError.message}`);
            errors++;
          } else {
            console.log(`     ✅ ${image.name} → ${category}`);
            uploadedImages++;
          }

        } catch (error) {
          console.log(`     ❌ Error processing ${image.name}: ${error.message}`);
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
    console.log(`🎯 Gallery: http://localhost:3000/test-gallery`);
    
    if (uploadedImages > 0) {
      console.log('\n🚀 SUCCESS!');
      console.log('Your brand-safe marketing images are now live!');
      console.log('Go to: http://localhost:3000/test-gallery');
    }

  } catch (error) {
    console.error('❌ Upload failed:', error.message);
  }
}

uploadRealImages();