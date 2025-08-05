#!/usr/bin/env ts-node

/**
 * Organize Real Extracted Data
 * 
 * Converts the extracted Google Drive data into the website-ready structure
 */

import * as fs from 'fs';
import * as path from 'path';

interface ExtractedFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink: string;
  thumbnailLink?: string;
}

interface ExtractedSchoolData {
  school: {
    name: string;
    id: string;
    extractionDate: string;
  };
  media: {
    videos: ExtractedFile[];
    images: ExtractedFile[];
    documents: ExtractedFile[];
    other: ExtractedFile[];
  };
  totals: {
    videos: number;
    images: number;
    documents: number;
    other: number;
    total: number;
  };
}

async function organizeRealData() {
  console.log('🗂️  Organizing Real Extracted Data');
  console.log('=================================');

  const downloadsDir = './downloads-real';
  const outputDir = '../public/schools';

  // Clear and create output directory structure
  if (fs.existsSync(outputDir)) {
    console.log('🧹 Cleaning existing output directory...');
    fs.rmSync(outputDir, { recursive: true, force: true });
  }

  const alphaDIr = path.join(outputDir, 'alpha-schools');
  const otherDir = path.join(outputDir, 'other-schools');
  const specialDir = path.join(outputDir, 'special');

  [alphaDIr, otherDir, specialDir].forEach(dir => {
    fs.mkdirSync(dir, { recursive: true });
    ['videos', 'images', 'documents', 'metadata'].forEach(subdir => {
      fs.mkdirSync(path.join(dir, subdir), { recursive: true });
    });
  });

  console.log('✅ Created organized directory structure');

  // Get all school folders
  const schoolFolders = fs.readdirSync(downloadsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  console.log(`📁 Found ${schoolFolders.length} school folders to organize`);

  const organizedData = {
    alphaSchools: [] as any[],
    otherSchools: [] as any[],
    specialCategories: [] as any[],
    totalFiles: 0,
    totalSchools: 0
  };

  for (const schoolName of schoolFolders) {
    console.log(`\n📂 Processing: ${schoolName}`);

    const schoolDataPath = path.join(downloadsDir, schoolName, 'school-data.json');
    if (!fs.existsSync(schoolDataPath)) {
      console.log(`   ❌ No school-data.json found, skipping`);
      continue;
    }

    const schoolData: ExtractedSchoolData = JSON.parse(fs.readFileSync(schoolDataPath, 'utf8'));
    
    // Determine school category
    let category = 'other';
    let outputCategory = 'other-schools';
    
    if (schoolName.includes('Alpha School') || schoolName.includes('Alpha High School')) {
      category = 'alpha';
      outputCategory = 'alpha-schools';
    } else if (schoolName.includes('Press & Media') || 
               schoolName.includes('2 Hour Learning') ||
               schoolName.includes('SAT Level Up') ||
               schoolName.includes('Learn + Earn') ||
               schoolName.includes('Unbound') ||
               schoolName.includes('Internal') ||
               schoolName.includes('Thought Leadership') ||
               schoolName.includes('Accreditation')) {
      category = 'special';
      outputCategory = 'special';
    }

    // Create school ID from name
    const schoolId = schoolName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    console.log(`   📋 Category: ${category} (${outputCategory})`);
    console.log(`   🆔 ID: ${schoolId}`);
    console.log(`   📊 Files: ${schoolData.totals.total} total`);
    console.log(`      🎥 Videos: ${schoolData.totals.videos}`);
    console.log(`      🖼️  Images: ${schoolData.totals.images}`);
    console.log(`      📄 Documents: ${schoolData.totals.documents}`);
    console.log(`      📋 Other: ${schoolData.totals.other}`);

    // Process media files
    const processedMedia = {
      videos: [] as any[],
      images: [] as any[],
      documents: [] as any[],
      other: [] as any[]
    };

    let fileIndex = 0;

    // Process each media type
    for (const [mediaType, files] of Object.entries(schoolData.media)) {
      for (const file of files as ExtractedFile[]) {
        fileIndex++;
        
        // Create organized filename
        const ext = path.extname(file.name) || '';
        const baseName = path.basename(file.name, ext).replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, '-');
        const organizedName = `${schoolId}_${fileIndex}_${baseName}${ext}`;

        const processedFile = {
          id: file.id,
          originalName: file.name,
          organizedName: organizedName,
          mimeType: file.mimeType,
          size: file.size ? parseInt(file.size) : undefined,
          webViewLink: file.webViewLink,
          thumbnailLink: file.thumbnailLink,
          downloadUrl: `https://drive.google.com/uc?id=${file.id}&export=download`,
          localPath: `/${outputCategory}/${mediaType}/${organizedName}`,
          extractionDate: schoolData.school.extractionDate
        };

        processedMedia[mediaType as keyof typeof processedMedia].push(processedFile);
      }
    }

    // Create school metadata
    const schoolMetadata = {
      school: {
        id: schoolId,
        name: schoolName,
        originalName: schoolData.school.name,
        type: category,
        category: outputCategory,
        googleDriveId: schoolData.school.id
      },
      media: processedMedia,
      stats: {
        totalFiles: schoolData.totals.total,
        videoCount: schoolData.totals.videos,
        imageCount: schoolData.totals.images,
        documentCount: schoolData.totals.documents,
        otherCount: schoolData.totals.other
      },
      extraction: {
        date: schoolData.school.extractionDate,
        source: 'google-drive-api',
        version: '1.0'
      }
    };

    // Save metadata file
    const metadataPath = path.join(outputDir, outputCategory, 'metadata', `${schoolId}.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(schoolMetadata, null, 2));

    // Add to organized data
    if (category === 'alpha') {
      organizedData.alphaSchools.push(schoolMetadata.school);
    } else if (category === 'special') {
      organizedData.specialCategories.push(schoolMetadata.school);
    } else {
      organizedData.otherSchools.push(schoolMetadata.school);
    }

    organizedData.totalFiles += schoolData.totals.total;
    organizedData.totalSchools++;

    console.log(`   ✅ Organized ${schoolName}`);
  }

  // Create master files
  console.log('\n📋 Creating master files...');

  // Create schools index
  const schoolsIndex = {
    alphaSchools: organizedData.alphaSchools,
    otherSchools: organizedData.otherSchools,
    specialCategories: organizedData.specialCategories,
    stats: {
      totalSchools: organizedData.totalSchools,
      alphaSchoolCount: organizedData.alphaSchools.length,
      otherSchoolCount: organizedData.otherSchools.length,
      specialCategoryCount: organizedData.specialCategories.length,
      totalFiles: organizedData.totalFiles
    },
    lastUpdated: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(outputDir, 'schools-index.json'),
    JSON.stringify(schoolsIndex, null, 2)
  );

  // Create extraction report
  const extractionReport = {
    summary: {
      extractionDate: new Date().toISOString(),
      source: 'Google Drive Public Folder',
      folderId: '1OGl7MAzktOVbjKozzwcXE63YjJaM0Ulg',
      totalSchools: organizedData.totalSchools,
      totalFiles: organizedData.totalFiles,
      status: 'complete'
    },
    breakdown: {
      alphaSchools: organizedData.alphaSchools.length,
      otherSchools: organizedData.otherSchools.length,
      specialCategories: organizedData.specialCategories.length
    },
    schools: organizedData.alphaSchools.concat(organizedData.otherSchools, organizedData.specialCategories)
  };

  fs.writeFileSync(
    path.join(outputDir, 'extraction-report.json'),
    JSON.stringify(extractionReport, null, 2)
  );

  console.log('\n🎉 ORGANIZATION COMPLETE!');
  console.log('========================');
  console.log(`📊 Final Results:`);
  console.log(`   🏫 Alpha Schools: ${organizedData.alphaSchools.length}`);
  console.log(`   🎓 Other Schools: ${organizedData.otherSchools.length}`);  
  console.log(`   📋 Special Categories: ${organizedData.specialCategories.length}`);
  console.log(`   📄 Total Files: ${organizedData.totalFiles}`);
  console.log(`   📁 Total Schools: ${organizedData.totalSchools}`);
  console.log('');
  console.log(`📂 Organized structure: ../public/schools/`);
  console.log(`📋 Master index: ../public/schools/schools-index.json`);
  console.log(`📊 Full report: ../public/schools/extraction-report.json`);
  console.log('');
  console.log('🔗 Website integration ready!');
}

organizeRealData().catch(console.error);