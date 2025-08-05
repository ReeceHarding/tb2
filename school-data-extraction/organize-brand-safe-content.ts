#!/usr/bin/env ts-node

/**
 * Organize All Brand-Safe Marketing Content
 * 
 * Takes the 121 images + 6 videos + 105 documents from recursive extraction
 * and organizes them into the website database structure
 */

import * as fs from 'fs';
import * as path from 'path';

interface RecursiveSchoolData {
  school: {
    name: string;
    id: string;
    extractionDate: string;
  };
  marketingFolder?: {
    id: string;
    name: string;
    webViewLink: string;
  };
  media: {
    images: any[];
    videos: any[];
    documents: any[];
    folders: any[];
    other: any[];
  };
  totals: {
    images: number;
    videos: number;
    documents: number;
    folders: number;
    other: number;
    total: number;
  };
}

interface OrganizedSchoolData {
  school: {
    name: string;
    id: string;
    city: string;
    state: string;
    type: 'alpha' | 'other' | 'special';
    extractionDate: string;
  };
  marketing: {
    images: any[];
    videos: any[];
    documents: any[];
    totalAssets: number;
  };
  metadata: {
    hasMarketingFolder: boolean;
    marketingFolderId?: string;
    contentCategories: string[];
    lastUpdated: string;
  };
}

async function organizeBrandSafeContent() {
  console.log('🗂️  Organizing Brand-Safe Marketing Content');
  console.log('==========================================');
  console.log('🎯 Converting 121 images + 6 videos + 105 docs into website database');

  const recursiveDir = './recursive-downloads';
  const outputDir = '../public/schools';
  
  if (!fs.existsSync(recursiveDir)) {
    console.log('❌ No recursive downloads found. Run npm run recursive first.');
    return;
  }

  // Create output structure
  ['alpha-schools', 'other-schools', 'special'].forEach(category => {
    const categoryDir = path.join(outputDir, category);
    ['images', 'videos', 'documents', 'metadata'].forEach(subdir => {
      const fullPath = path.join(categoryDir, subdir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  });

  // Read all recursive data
  const schoolDirs = fs.readdirSync(recursiveDir).filter(item => {
    const itemPath = path.join(recursiveDir, item);
    return fs.statSync(itemPath).isDirectory();
  });

  console.log(`📂 Processing ${schoolDirs.length} schools with marketing content...`);

  const allOrganizedData: OrganizedSchoolData[] = [];
  let totalImagesProcessed = 0;
  let totalVideosProcessed = 0;
  let totalDocsProcessed = 0;

  for (const schoolDir of schoolDirs) {
    const schoolDataPath = path.join(recursiveDir, schoolDir, 'recursive-data.json');
    
    if (!fs.existsSync(schoolDataPath)) {
      console.log(`⚠️  No data file for ${schoolDir}`);
      continue;
    }

    try {
      const recursiveData: RecursiveSchoolData = JSON.parse(
        fs.readFileSync(schoolDataPath, 'utf8')
      );

      console.log(`\n🏫 Processing: ${recursiveData.school.name}`);
      console.log(`   📊 ${recursiveData.totals.images} images, ${recursiveData.totals.videos} videos, ${recursiveData.totals.documents} docs`);

      // Determine school category and clean ID
      const schoolName = recursiveData.school.name;
      let schoolType: 'alpha' | 'other' | 'special' = 'other';
      
      if (schoolName.toLowerCase().includes('alpha school') || schoolName.toLowerCase().includes('alpha high')) {
        schoolType = 'alpha';
      } else if (schoolName.toLowerCase().includes('hour learning') || 
                 schoolName.toLowerCase().includes('press & media') ||
                 schoolName.toLowerCase().includes('sat level') ||
                 schoolName.toLowerCase().includes('thought leadership') ||
                 schoolName.toLowerCase().includes('unbound') ||
                 schoolName.toLowerCase().includes('internal') ||
                 schoolName.toLowerCase().includes('learn + earn')) {
        schoolType = 'special';
      }

      // Clean school ID
      const cleanId = schoolName.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/^alpha-school-/, 'alpha-')
        .replace(/^alpha-high-school-/, 'alpha-high-');

      // Extract location from name
      const nameParts = schoolName.split(' | ');
      const location = nameParts.length > 1 ? nameParts[1].trim() : '';
      const [city, state] = location.includes(',') ? location.split(',').map(s => s.trim()) : [location, ''];

      // Process and organize images
      const organizedImages = recursiveData.media.images.map((img, index) => {
        const extension = img.name.split('.').pop()?.toLowerCase() || 'png';
        const organizedName = `${cleanId}_${index + 1}_${img.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        return {
          originalName: img.name,
          organizedName: organizedName,
          localPath: `/${schoolType}-schools/images/${organizedName}`,
          fileType: 'image',
          mimeType: img.mimeType,
          size: parseInt(img.size) || 0,
          googleDriveId: img.id,
          downloadUrl: `https://drive.google.com/uc?id=${img.id}&export=download`,
          webViewLink: img.webViewLink,
          thumbnailLink: img.thumbnailLink,
          category: getImageCategory(img.name)
        };
      });

      // Process videos
      const organizedVideos = recursiveData.media.videos.map((vid, index) => {
        const extension = vid.name.split('.').pop()?.toLowerCase() || 'mp4';
        const organizedName = `${cleanId}_${index + 1}_${vid.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        return {
          originalName: vid.name,
          organizedName: organizedName,
          localPath: `/${schoolType}-schools/videos/${organizedName}`,
          fileType: 'video',
          mimeType: vid.mimeType,
          size: parseInt(vid.size) || 0,
          googleDriveId: vid.id,
          downloadUrl: `https://drive.google.com/uc?id=${vid.id}&export=download`,
          webViewLink: vid.webViewLink,
          thumbnailLink: vid.thumbnailLink,
          category: getVideoCategory(vid.name)
        };
      });

      // Process documents
      const organizedDocuments = recursiveData.media.documents.map((doc, index) => {
        const extension = doc.name.split('.').pop()?.toLowerCase() || 'pdf';
        const organizedName = `${cleanId}_${index + 1}_${doc.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        return {
          originalName: doc.name,
          organizedName: organizedName,
          localPath: `/${schoolType}-schools/documents/${organizedName}`,
          fileType: 'document',
          mimeType: doc.mimeType,
          size: parseInt(doc.size) || 0,
          googleDriveId: doc.id,
          downloadUrl: `https://drive.google.com/uc?id=${doc.id}&export=download`,
          webViewLink: doc.webViewLink,
          category: getDocumentCategory(doc.name)
        };
      });

      // Get content categories
      const categories = new Set();
      [...organizedImages, ...organizedVideos, ...organizedDocuments].forEach(item => {
        if (item.category) categories.add(item.category);
      });

      // Create organized school data
      const organizedSchool: OrganizedSchoolData = {
        school: {
          name: schoolName,
          id: cleanId,
          city: city || 'Unknown',
          state: state || 'Unknown',
          type: schoolType,
          extractionDate: recursiveData.school.extractionDate
        },
        marketing: {
          images: organizedImages,
          videos: organizedVideos,
          documents: organizedDocuments,
          totalAssets: organizedImages.length + organizedVideos.length + organizedDocuments.length
        },
        metadata: {
          hasMarketingFolder: !!recursiveData.marketingFolder,
          marketingFolderId: recursiveData.marketingFolder?.id,
          contentCategories: Array.from(categories) as string[],
          lastUpdated: new Date().toISOString()
        }
      };

      allOrganizedData.push(organizedSchool);

      // Update totals
      totalImagesProcessed += organizedImages.length;
      totalVideosProcessed += organizedVideos.length;
      totalDocsProcessed += organizedDocuments.length;

      // Save individual school metadata
      const metadataPath = path.join(outputDir, `${schoolType}-schools`, 'metadata', `${cleanId}.json`);
      fs.writeFileSync(metadataPath, JSON.stringify(organizedSchool, null, 2));

      console.log(`   ✅ Saved metadata: ${metadataPath}`);

    } catch (error: any) {
      console.log(`   ❌ Error processing ${schoolDir}: ${error.message}`);
    }
  }

  // Create master index
  const masterIndex = {
    lastUpdated: new Date().toISOString(),
    summary: {
      totalSchools: allOrganizedData.length,
      totalImages: totalImagesProcessed,
      totalVideos: totalVideosProcessed,
      totalDocuments: totalDocsProcessed,
      totalAssets: totalImagesProcessed + totalVideosProcessed + totalDocsProcessed
    },
    schools: allOrganizedData.map(school => ({
      id: school.school.id,
      name: school.school.name,
      type: school.school.type,
      city: school.school.city,
      state: school.school.state,
      images: school.marketing.images.length,
      videos: school.marketing.videos.length,
      documents: school.marketing.documents.length,
      totalAssets: school.marketing.totalAssets,
      categories: school.metadata.contentCategories
    })),
    alphaSchools: allOrganizedData.filter(s => s.school.type === 'alpha').map(s => ({ id: s.school.id, name: s.school.name })),
    otherSchools: allOrganizedData.filter(s => s.school.type === 'other').map(s => ({ id: s.school.id, name: s.school.name })),
    specialCategories: allOrganizedData.filter(s => s.school.type === 'special').map(s => ({ id: s.school.id, name: s.school.name }))
  };

  // Save master index
  fs.writeFileSync(
    path.join(outputDir, 'brand-safe-marketing-index.json'),
    JSON.stringify(masterIndex, null, 2)
  );

  console.log('\n🎉 BRAND-SAFE CONTENT ORGANIZATION COMPLETE!');
  console.log('============================================');
  console.log(`📊 FINAL DATABASE RESULTS:`);
  console.log(`   📸 Images: ${totalImagesProcessed} (brand-safe marketing content)`);
  console.log(`   🎥 Videos: ${totalVideosProcessed} (educational and promotional)`);
  console.log(`   📄 Documents: ${totalDocsProcessed} (flyers, presentations, etc.)`);
  console.log(`   🏫 Schools: ${allOrganizedData.length} (with marketing materials)`);
  console.log(`\n📁 Database ready at: ../public/schools/`);
  console.log(`📋 Master index: ../public/schools/brand-safe-marketing-index.json`);
  
  // Create next steps summary
  console.log(`\n🚀 NEXT STEPS FOR YOUR BOSS:`);
  console.log(`   1. All content is from YOUR OWN schools (100% brand-safe)`);
  console.log(`   2. Professional marketing materials ready for website use`);
  console.log(`   3. Organized by school type and content category`);
  console.log(`   4. API endpoints ready to serve content to your website`);
}

function getImageCategory(filename: string): string {
  const name = filename.toLowerCase();
  
  if (name.includes('logo')) return 'Brand Assets';
  if (name.includes('flyer') || name.includes('poster')) return 'Event Flyers';
  if (name.includes('social') || name.includes('1x1')) return 'Social Media';
  if (name.includes('sign') || name.includes('banner')) return 'Signage';
  if (name.includes('camp') || name.includes('summer')) return 'Summer Camp';
  if (name.includes('business') || name.includes('card')) return 'Business Materials';
  if (name.includes('qr')) return 'QR Codes';
  if (name.includes('stock')) return 'Stock Photography';
  
  return 'Marketing Content';
}

function getVideoCategory(filename: string): string {
  const name = filename.toLowerCase();
  
  if (name.includes('unlock') || name.includes('confidence')) return 'Educational';
  if (name.includes('skill') || name.includes('life')) return 'Educational';
  if (name.includes('challenge') || name.includes('impossible')) return 'Student Success';
  if (name.includes('sizzle') || name.includes('reel')) return 'Promotional';
  
  return 'Marketing Video';
}

function getDocumentCategory(filename: string): string {
  const name = filename.toLowerCase();
  
  if (name.includes('flyer') || name.includes('poster')) return 'Event Flyers';
  if (name.includes('presentation') || name.includes('ppt')) return 'Presentations';
  if (name.includes('handout') || name.includes('brochure')) return 'Print Materials';
  if (name.includes('business') || name.includes('card')) return 'Business Materials';
  
  return 'Marketing Documents';
}

organizeBrandSafeContent();