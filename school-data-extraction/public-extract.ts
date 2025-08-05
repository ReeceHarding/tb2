#!/usr/bin/env ts-node

/**
 * Public Folder Extraction - Simple API Key Approach
 * 
 * For public Google Drive folders, we can use just an API key
 */

import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

const FOLDER_ID = '1OGl7MAzktOVbjKozzwcXE63YjJaM0Ulg';

// We'll try with a simple API key approach first
async function tryPublicAccess() {
  console.log('🌐 Testing public folder access...');
  
  try {
    // For public folders, we can try direct HTTP requests
    const drive = google.drive({ version: 'v3' });
    
    // First, let's try to get folder info
    console.log('📂 Getting folder information...');
    
    const folderResponse = await drive.files.get({
      fileId: FOLDER_ID,
      fields: 'id,name,mimeType,shared,permissions'
    });
    
    console.log('✅ Folder found:', folderResponse.data.name);
    console.log('📋 Shared:', folderResponse.data.shared);
    
    // Now try to list files in the folder
    console.log('\n📁 Listing folder contents...');
    
    const filesResponse = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType,size,modifiedTime,webViewLink)',
      pageSize: 50
    });

    const files = filesResponse.data.files || [];
    console.log(`\n🎉 SUCCESS! Found ${files.length} items in public folder:`);
    
    // Organize files by type
    const schools: any[] = [];
    const categories: any[] = [];
    
    files.forEach((file, index) => {
      const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
      const icon = isFolder ? '📁' : '📄';
      
      console.log(`  ${index + 1}. ${icon} ${file.name}`);
      
      if (isFolder) {
        if (file.name?.includes('Alpha School') || file.name?.includes('Alpha High School')) {
          schools.push({ ...file, type: 'alpha' });
        } else if (file.name?.includes('School') || file.name?.includes('Academy')) {
          schools.push({ ...file, type: 'other' });
        } else {
          categories.push(file);
        }
      }
    });

    console.log(`\n📊 Organization Summary:`);
    console.log(`   🏫 School folders: ${schools.length}`);
    console.log(`   📋 Category folders: ${categories.length}`);

    // Save the list for further processing
    const manifest = {
      folderId: FOLDER_ID,
      folderName: folderResponse.data.name,
      extractionDate: new Date().toISOString(),
      totalItems: files.length,
      schools,
      categories,
      allFiles: files
    };

    fs.writeFileSync('./public-folder-manifest.json', JSON.stringify(manifest, null, 2));
    console.log('\n✅ Saved manifest to: ./public-folder-manifest.json');
    
    return manifest;

  } catch (error: any) {
    console.log('❌ Error accessing public folder:', error.message);
    
    if (error.message.includes('API Key')) {
      console.log('\n💡 Solution: We need a Google API key');
      console.log('   1. Go to: https://console.cloud.google.com/apis/credentials');
      console.log('   2. Create API Key');
      console.log('   3. Enable Google Drive API');
      console.log('   4. Add key to .env as: GOOGLE_API_KEY=your_key_here');
    }
    
    return null;
  }
}

// Quick extraction function for when we have access
async function extractSchoolData(manifest: any) {
  console.log('\n🔄 Starting school data extraction...');
  
  const drive = google.drive({ version: 'v3' });
  const downloadDir = './downloads-public';
  
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
  }

  for (const school of manifest.schools) {
    console.log(`\n📁 Processing: ${school.name}`);
    
    try {
      // Get files in this school folder
      const schoolFiles = await drive.files.list({
        q: `'${school.id}' in parents and trashed=false`,
        fields: 'files(id,name,mimeType,size,webViewLink)',
        pageSize: 100
      });

      const files = schoolFiles.data.files || [];
      console.log(`   Found ${files.length} files`);

      // Create school directory
      const schoolDir = path.join(downloadDir, school.name);
      if (!fs.existsSync(schoolDir)) {
        fs.mkdirSync(schoolDir, { recursive: true });
      }

      // Log file info (we'll download actual files later)
      const fileManifest = {
        school: school.name,
        schoolId: school.id,
        type: school.type,
        files: files.map(f => ({
          id: f.id,
          name: f.name,
          mimeType: f.mimeType,
          size: f.size,
          webViewLink: f.webViewLink
        }))
      };

      fs.writeFileSync(
        path.join(schoolDir, 'manifest.json'), 
        JSON.stringify(fileManifest, null, 2)
      );

      console.log(`   ✅ Saved manifest for ${school.name}`);

    } catch (error: any) {
      console.log(`   ❌ Error processing ${school.name}:`, error.message);
    }
  }

  console.log('\n🎉 Extraction complete! Check ./downloads-public/');
}

async function main() {
  console.log('🚀 Public Google Drive Folder Extraction');
  console.log('========================================');
  
  const manifest = await tryPublicAccess();
  
  if (manifest) {
    console.log('\n🎯 Ready to extract school data!');
    console.log('   Run: npm run extract-public');
    
    // If we got the manifest, try extracting
    await extractSchoolData(manifest);
  }
}

main().catch(console.error);