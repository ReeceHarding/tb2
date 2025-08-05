#!/usr/bin/env ts-node

/**
 * Migration script to move school data from local JSON files to Supabase database
 * This prepares the app for Vercel deployment by removing file system dependencies
 * 
 * Usage: npx ts-node scripts/migrate-school-data-to-database.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// Use environment variables for Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('🔧 Environment check:');
console.log('   SUPABASE_URL:', supabaseUrl || 'Not set');
console.log('   SERVICE_KEY:', supabaseServiceKey ? 'Set (' + supabaseServiceKey.slice(0, 20) + '...)' : 'Not set');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SchoolData {
  school: {
    name: string;
    id: string;
    city: string;
    state: string;
    type: string;
    extractionDate: string;
  };
  marketing: {
    images: MarketingAsset[];
    videos: MarketingAsset[];
    documents: MarketingAsset[];
    totalAssets: number;
  };
  metadata: {
    hasMarketingFolder: boolean;
    marketingFolderId?: string;
    contentCategories: string[];
    lastUpdated: string;
  };
}

interface MarketingAsset {
  originalName: string;
  organizedName: string;
  localPath: string;
  fileType: string;
  mimeType: string;
  size: number;
  googleDriveId: string;
  downloadUrl: string;
  webViewLink: string;
  thumbnailLink: string;
  category: string;
}

interface IndexData {
  lastUpdated: string;
  summary: {
    totalSchools: number;
    totalImages: number;
    totalVideos: number;
    totalDocuments: number;
    totalAssets: number;
  };
  schools: Array<{
    id: string;
    name: string;
    type: string;
    city: string;
    state: string;
    images: number;
    videos: number;
    documents: number;
    totalAssets: number;
    categories: string[];
    address?: string;
    zipCode?: string;
    phone?: string;
    email?: string;
    website?: string;
    fullAddress?: string;
    description?: string;
  }>;
}

async function main() {
  console.log('🚀 Starting school data migration to Supabase...\n');

  try {
    // Step 1: Clear existing data
    console.log('🧹 Clearing existing data...');
    await clearExistingData();

    // Step 2: Load and migrate index data
    console.log('📊 Loading brand-safe marketing index...');
    const indexData = await loadIndexData();
    
    // Step 3: Migrate school summary
    console.log('📈 Migrating school summary...');
    await migrateSchoolSummary(indexData);

    // Step 4: Migrate schools and their data
    console.log('🏫 Migrating schools...');
    await migrateSchools(indexData);

    console.log('\n✅ Migration completed successfully!');
    console.log('🎉 Your app is now ready for Vercel deployment!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

async function clearExistingData() {
  const tables = ['marketing_assets', 'school_categories', 'school_contact_info', 'school_summary', 'schools'];
  
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      console.warn(`⚠️  Warning clearing ${table}:`, error.message);
    } else {
      console.log(`   ✅ Cleared ${table}`);
    }
  }
}

async function loadIndexData(): Promise<IndexData> {
  const indexPath = path.join(process.cwd(), 'public/schools/brand-safe-marketing-index.json');
  
  if (!fs.existsSync(indexPath)) {
    throw new Error(`Index file not found: ${indexPath}`);
  }

  const indexContent = fs.readFileSync(indexPath, 'utf8');
  const indexData = JSON.parse(indexContent) as IndexData;
  
  console.log(`   📋 Found ${indexData.schools.length} schools to migrate`);
  console.log(`   📊 Summary: ${indexData.summary.totalImages} images, ${indexData.summary.totalVideos} videos, ${indexData.summary.totalDocuments} documents`);
  
  return indexData;
}

async function migrateSchoolSummary(indexData: IndexData) {
  console.log('   📝 Inserting school summary data:', {
    total_schools: indexData.summary.totalSchools,
    total_images: indexData.summary.totalImages,
    total_videos: indexData.summary.totalVideos,
    total_documents: indexData.summary.totalDocuments,
    total_assets: indexData.summary.totalAssets,
    last_updated: indexData.lastUpdated
  });

  const { data, error } = await supabase
    .from('school_summary')
    .insert({
      total_schools: indexData.summary.totalSchools,
      total_images: indexData.summary.totalImages,
      total_videos: indexData.summary.totalVideos,
      total_documents: indexData.summary.totalDocuments,
      total_assets: indexData.summary.totalAssets,
      last_updated: indexData.lastUpdated
    });

  if (error) {
    console.error('   ❌ Error details:', error);
    throw new Error(`Failed to migrate school summary: ${error.message || JSON.stringify(error)}`);
  }

  console.log('   ✅ School summary migrated:', data);
}

async function migrateSchools(indexData: IndexData) {
  let successCount = 0;
  let errorCount = 0;

  for (const schoolInfo of indexData.schools) {
    try {
      console.log(`   🏫 Migrating ${schoolInfo.name}...`);
      
      // Step 1: Insert school basic info
      const { error: schoolError } = await supabase
        .from('schools')
        .insert({
          id: schoolInfo.id,
          name: schoolInfo.name,
          city: schoolInfo.city,
          state: schoolInfo.state,
          type: schoolInfo.type,
          total_assets: schoolInfo.totalAssets
        });

      if (schoolError) {
        throw new Error(`Failed to insert school: ${schoolError.message}`);
      }

      // Step 2: Insert contact info if available
      if (schoolInfo.address || schoolInfo.phone || schoolInfo.email || schoolInfo.website) {
        const { error: contactError } = await supabase
          .from('school_contact_info')
          .insert({
            school_id: schoolInfo.id,
            address: schoolInfo.address,
            zip_code: schoolInfo.zipCode,
            phone: schoolInfo.phone,
            email: schoolInfo.email,
            website: schoolInfo.website,
            full_address: schoolInfo.fullAddress,
            description: schoolInfo.description
          });

        if (contactError) {
          console.warn(`     ⚠️  Warning inserting contact info: ${contactError.message}`);
        }
      }

      // Step 3: Insert categories
      if (schoolInfo.categories && schoolInfo.categories.length > 0) {
        const categoryInserts = schoolInfo.categories.map(category => ({
          school_id: schoolInfo.id,
          category
        }));

        const { error: categoryError } = await supabase
          .from('school_categories')
          .insert(categoryInserts);

        if (categoryError) {
          console.warn(`     ⚠️  Warning inserting categories: ${categoryError.message}`);
        }
      }

      // Step 4: Load and migrate detailed school data
      await migrateSchoolDetails(schoolInfo.id, schoolInfo.type);

      successCount++;
      console.log(`     ✅ ${schoolInfo.name} migrated successfully`);

    } catch (error) {
      errorCount++;
      console.error(`     ❌ Failed to migrate ${schoolInfo.name}:`, error);
    }
  }

  console.log(`\n📊 Migration results:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
}

async function migrateSchoolDetails(schoolId: string, schoolType: string) {
  // Determine the directory based on school type
  let metadataDir: string;
  switch (schoolType) {
    case 'alpha':
      metadataDir = 'alpha-schools';
      break;
    case 'other':
      metadataDir = 'other-schools';
      break;
    case 'special':
      metadataDir = 'special';
      break;
    default:
      metadataDir = 'special-schools'; // fallback for legacy data
  }

  const metadataPath = path.join(process.cwd(), `public/schools/${metadataDir}/metadata/${schoolId}.json`);
  
  if (!fs.existsSync(metadataPath)) {
    console.log(`     ℹ️  No detailed metadata found for ${schoolId}`);
    return;
  }

  try {
    const metadataContent = fs.readFileSync(metadataPath, 'utf8');
    const schoolData = JSON.parse(metadataContent) as SchoolData;

    // Update school with metadata
    const { error: updateError } = await supabase
      .from('schools')
      .update({
        extraction_date: schoolData.school.extractionDate,
        has_marketing_folder: schoolData.metadata.hasMarketingFolder,
        marketing_folder_id: schoolData.metadata.marketingFolderId
      })
      .eq('id', schoolId);

    if (updateError) {
      console.warn(`     ⚠️  Warning updating school metadata: ${updateError.message}`);
    }

    // Migrate marketing assets
    const allAssets = [
      ...schoolData.marketing.images.map(asset => ({ ...asset, file_type: 'image' })),
      ...schoolData.marketing.videos.map(asset => ({ ...asset, file_type: 'video' })),
      ...schoolData.marketing.documents.map(asset => ({ ...asset, file_type: 'document' }))
    ];

    if (allAssets.length > 0) {
      const assetInserts = allAssets.map(asset => ({
        school_id: schoolId,
        original_name: asset.originalName,
        organized_name: asset.organizedName,
        local_path: asset.localPath,
        file_type: asset.file_type,
        mime_type: asset.mimeType,
        file_size: asset.size,
        google_drive_id: asset.googleDriveId,
        download_url: asset.downloadUrl,
        web_view_link: asset.webViewLink,
        thumbnail_link: asset.thumbnailLink,
        category: asset.category
      }));

      const { error: assetError } = await supabase
        .from('marketing_assets')
        .insert(assetInserts);

      if (assetError) {
        console.warn(`     ⚠️  Warning inserting marketing assets: ${assetError.message}`);
      } else {
        console.log(`     📎 Migrated ${allAssets.length} marketing assets`);
      }
    }

    // Migrate additional categories from metadata
    if (schoolData.metadata.contentCategories && schoolData.metadata.contentCategories.length > 0) {
      const additionalCategories = schoolData.metadata.contentCategories.map(category => ({
        school_id: schoolId,
        category
      }));

      const { error: categoryError } = await supabase
        .from('school_categories')
        .insert(additionalCategories);

      if (categoryError && !categoryError.message.includes('duplicate')) {
        console.warn(`     ⚠️  Warning inserting additional categories: ${categoryError.message}`);
      }
    }

  } catch (error) {
    console.warn(`     ⚠️  Warning processing detailed data for ${schoolId}:`, error);
  }
}

// Run the migration
if (require.main === module) {
  main().catch(console.error);
}

export { main as migrateSchoolData };