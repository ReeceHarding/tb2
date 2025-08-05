#!/usr/bin/env ts-node

/**
 * Upload Marketing Images to Supabase Storage
 * 
 * Takes the 121 extracted brand-safe marketing images and uploads them to Supabase Storage,
 * then populates the marketing_images database table with metadata
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Need service role for uploads

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface MarketingImageData {
  title: string;
  description: string;
  originalFilename: string;
  schoolId: string;
  schoolName: string;
  schoolType: 'alpha' | 'other' | 'special';
  category: string;
  contentType: string;
  tags: string[];
  googleDriveId: string;
  googleDriveUrl: string;
  fileSize: number;
  width?: number;
  height?: number;
  isFeatured: boolean;
}

async function uploadMarketingImagesToSupabase() {
  console.log('🚀 Uploading Brand-Safe Marketing Images to Supabase');
  console.log('==================================================');

  try {
    // 1. Create storage bucket if it doesn't exist
    console.log('📦 Setting up Supabase Storage bucket...');
    
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'marketing-images');
    
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket('marketing-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      });
      
      if (error) {
        console.error('❌ Failed to create storage bucket:', error);
        return;
      }
      console.log('✅ Created marketing-images storage bucket');
    } else {
      console.log('✅ marketing-images bucket already exists');
    }

    // 2. Load the brand-safe marketing index
    console.log('📋 Loading brand-safe marketing data...');
    const indexPath = 'public/schools/brand-safe-marketing-index.json';
    
    if (!fs.existsSync(indexPath)) {
      console.error('❌ Brand-safe marketing index not found');
      return;
    }

    const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    console.log(`✅ Found data for ${indexData.summary.totalSchools} schools with ${indexData.summary.totalImages} images`);

    let uploadedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // 3. Process each school
    for (const school of indexData.schools) {
      if (school.images === 0) {
        console.log(`⏭️  Skipping ${school.name} (no images)`);
        continue;
      }

      console.log(`\n🏫 Processing: ${school.name} (${school.images} images)`);
      
      // Load the detailed school metadata
      const schoolMetadataPath = `public/schools/${school.type === 'special' ? 'special' : `${school.type}-schools`}/metadata/${school.id}.json`;
      
      if (!fs.existsSync(schoolMetadataPath)) {
        console.log(`⚠️  School metadata not found: ${schoolMetadataPath}`);
        continue;
      }

      const schoolData = JSON.parse(fs.readFileSync(schoolMetadataPath, 'utf8'));
      const images = schoolData.marketing?.images || [];

      console.log(`   📸 Found ${images.length} images to upload`);

      // 4. Upload each image
      for (const [index, image] of images.entries()) {
        try {
          console.log(`   🔄 [${index + 1}/${images.length}] Uploading: ${image.organizedName}`);

          // Download image from Google Drive
          const downloadResponse = await fetch(image.downloadUrl);
          if (!downloadResponse.ok) {
            console.log(`      ❌ Failed to download from Google Drive: ${downloadResponse.status}`);
            errorCount++;
            continue;
          }

          const imageBuffer = await downloadResponse.buffer();
          
          // Create storage path: school-type/school-id/image-name
          const storagePath = `${school.type}/${school.id}/${image.organizedName}`;
          
          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('marketing-images')
            .upload(storagePath, imageBuffer, {
              contentType: image.mimeType,
              upsert: true // Overwrite if exists
            });

          if (uploadError) {
            console.log(`      ❌ Supabase upload failed:`, uploadError);
            errorCount++;
            continue;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('marketing-images')
            .getPublicUrl(storagePath);

          // 5. Insert into database
          const marketingImageData: Partial<MarketingImageData> = {
            title: image.originalName.replace(/\.[^/.]+$/, ""), // Remove file extension
            description: `Marketing material from ${school.name}`,
            originalFilename: image.originalName,
            schoolId: school.id,
            schoolName: school.name,
            schoolType: school.type,
            category: mapToCategory(image.category),
            contentType: image.category,
            tags: extractTags(image.originalName, image.category),
            googleDriveId: image.googleDriveId,
            fileSize: image.size || 0,
            isFeatured: index === 0 && school.name.includes('Austin') // Feature first image from Austin schools
          };

          const { error: dbError } = await supabase
            .from('marketing_images')
            .insert({
              title: marketingImageData.title,
              description: marketingImageData.description,
              image_url: publicUrl,
              thumbnail_url: publicUrl, // Use same URL for now, can optimize later
              original_filename: marketingImageData.originalFilename,
              school_id: marketingImageData.schoolId,
              school_name: marketingImageData.schoolName,
              school_type: marketingImageData.schoolType,
              category: marketingImageData.category,
              content_type: marketingImageData.contentType,
              tags: marketingImageData.tags,
              google_drive_id: marketingImageData.googleDriveId,
              google_drive_url: image.webViewLink,
              file_size: marketingImageData.fileSize,
              is_featured: marketingImageData.isFeatured
            });

          if (dbError) {
            console.log(`      ❌ Database insert failed:`, dbError);
            errorCount++;
            continue;
          }

          console.log(`      ✅ Successfully uploaded and catalogued`);
          uploadedCount++;

        } catch (error: any) {
          console.log(`      ❌ Error processing image:`, error.message);
          errorCount++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // 6. Summary
    console.log('\n🎉 UPLOAD COMPLETE!');
    console.log('==================');
    console.log(`✅ Successfully uploaded: ${uploadedCount} images`);
    console.log(`⏭️  Skipped: ${skippedCount} images`);
    console.log(`❌ Errors: ${errorCount} images`);
    console.log(`\n📊 Your marketing images are now available at:`);
    console.log(`   🗄️  Storage: ${supabaseUrl}/storage/v1/object/public/marketing-images/`);
    console.log(`   🔗 Database: marketing_images table`);
    console.log(`   🌐 API: Ready for /api/marketing-images endpoints`);

  } catch (error: any) {
    console.error('❌ Fatal error during upload:', error);
  }
}

function mapToCategory(originalCategory: string): string {
  // Map your extracted categories to the database categories
  const categoryMap: Record<string, string> = {
    'Brand Assets': 'Brand Assets',
    'Event Flyers': 'Event Flyers', 
    'Social Media': 'Social Media',
    'Signage': 'Signage',
    'Summer Camp': 'Summer Camp',
    'Business Materials': 'Business Materials',
    'Stock Photography': 'Stock Photography',
    'Marketing Content': 'Brand Assets' // Default fallback
  };
  
  return categoryMap[originalCategory] || 'Brand Assets';
}

function extractTags(filename: string, category: string): string[] {
  const tags = new Set<string>();
  
  // Add category as tag
  tags.add(category.toLowerCase().replace(/\s+/g, '-'));
  
  // Extract tags from filename
  const name = filename.toLowerCase();
  
  if (name.includes('logo')) tags.add('logo');
  if (name.includes('flyer')) tags.add('flyer');
  if (name.includes('event')) tags.add('event');
  if (name.includes('social')) tags.add('social-media');
  if (name.includes('camp')) tags.add('summer-camp');
  if (name.includes('business')) tags.add('business');
  if (name.includes('qr')) tags.add('qr-code');
  if (name.includes('sign')) tags.add('signage');
  if (name.includes('card')) tags.add('business-card');
  
  return Array.from(tags);
}

// Run the upload
uploadMarketingImagesToSupabase();