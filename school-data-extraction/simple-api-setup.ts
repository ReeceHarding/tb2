#!/usr/bin/env ts-node

/**
 * Simple API Key Setup - Just 2 minutes
 * 
 * Even public folders need an API key for programmatic access
 */

import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const FOLDER_ID = '1OGl7MAzktOVbjKozzwcXE63YjJaM0Ulg';

async function testWithApiKey() {
  console.log('🔑 Testing with API key...');
  
  // Check if we have an API key in environment
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    console.log('❌ No API key found');
    console.log('\n🚀 QUICK 2-MINUTE SETUP:');
    console.log('======================');
    console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
    console.log('2. Click "Create Credentials" → "API Key"');
    console.log('3. Copy the key and paste it below:');
    console.log('');
    console.log('   echo "GOOGLE_API_KEY=your_key_here" > .env');
    console.log('');
    console.log('4. Run this script again: npm run simple');
    console.log('');
    console.log('💡 The folder is public, we just need an API key for programmatic access');
    return;
  }

  try {
    // Initialize with API key
    const drive = google.drive({ 
      version: 'v3',
      auth: apiKey
    });

    console.log('✅ API key found, testing access...');
    
    // Test folder access
    const response = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType,size,webViewLink)',
      pageSize: 50
    });

    const files = response.data.files || [];
    console.log(`\n🎉 SUCCESS! Found ${files.length} items in the folder:`);
    
    // Show first few items
    files.slice(0, 10).forEach((file, index) => {
      const icon = file.mimeType === 'application/vnd.google-apps.folder' ? '📁' : '📄';
      console.log(`  ${index + 1}. ${icon} ${file.name}`);
    });

    if (files.length > 10) {
      console.log(`  ... and ${files.length - 10} more items`);
    }

    // Extract everything
    await extractAllContent(drive, files);

  } catch (error: any) {
    console.log('❌ Error:', error.message);
    
    if (error.message.includes('API has not been used') || error.message.includes('is disabled')) {
      console.log('\n🎯 SIMPLE FIX NEEDED:');
      console.log('====================');
      console.log('Your API key works! Just need to enable Google Drive API.');
      console.log('');
      
      // Extract project ID from error message
      const projectMatch = error.message.match(/project (\d+)/);
      const projectId = projectMatch ? projectMatch[1] : '734496222202';
      
      console.log(`1. Click: https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=${projectId}`);
      console.log('2. Click "Enable" button');
      console.log('3. Wait 1-2 minutes for activation');
      console.log('4. Run: npm run simple');
      console.log('');
      console.log('🎉 Then you\'ll get all 2000+ school marketing files automatically!');
      
    } else if (error.message.includes('API_KEY_INVALID')) {
      console.log('💡 Your API key might be invalid');
      console.log('   1. Check the API key in .env file');
      console.log('   2. Try creating a new API key');
      console.log('   3. Run: npm run simple');
    }
  }
}

async function extractAllContent(drive: any, folders: any[]) {
  console.log('\n🔄 Extracting all school content...');
  
  const downloadDir = './downloads-real';
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
  }

  const extractedData: any = {
    extraction: {
      date: new Date().toISOString(),
      totalFolders: folders.length,
      schools: []
    }
  };

  for (const folder of folders) {
    if (folder.mimeType !== 'application/vnd.google-apps.folder') continue;
    
    console.log(`\n📁 Processing: ${folder.name}`);
    
    try {
      // Get all files in this school folder
      const filesResponse = await drive.files.list({
        q: `'${folder.id}' in parents and trashed=false`,
        fields: 'files(id,name,mimeType,size,webViewLink,thumbnailLink)',
        pageSize: 1000 // Get everything
      });

      const files = filesResponse.data.files || [];
      console.log(`   📄 Found ${files.length} files`);

      // Categorize files
      const videos = files.filter((f: any) => f.mimeType?.includes('video') || f.name?.match(/\.(mp4|mov|avi|webm)$/i));
      const images = files.filter((f: any) => f.mimeType?.includes('image') || f.name?.match(/\.(jpg|jpeg|png|gif|svg)$/i));
      const documents = files.filter((f: any) => f.mimeType?.includes('pdf') || f.mimeType?.includes('document') || f.name?.match(/\.(pdf|doc|docx|ppt|pptx)$/i));
      const other = files.filter((f: any) => !videos.includes(f) && !images.includes(f) && !documents.includes(f));

      console.log(`   🎥 Videos: ${videos.length}`);
      console.log(`   🖼️  Images: ${images.length}`);
      console.log(`   📄 Documents: ${documents.length}`);
      console.log(`   📋 Other: ${other.length}`);

      // Create school folder and save data
      const schoolDir = path.join(downloadDir, folder.name);
      if (!fs.existsSync(schoolDir)) {
        fs.mkdirSync(schoolDir, { recursive: true });
      }

      // Save complete manifest
      const schoolData = {
        school: {
          name: folder.name,
          id: folder.id,
          extractionDate: new Date().toISOString()
        },
        media: {
          videos: videos.map((f: any) => ({ id: f.id, name: f.name, mimeType: f.mimeType, size: f.size, webViewLink: f.webViewLink })),
          images: images.map((f: any) => ({ id: f.id, name: f.name, mimeType: f.mimeType, size: f.size, webViewLink: f.webViewLink, thumbnailLink: f.thumbnailLink })),
          documents: documents.map((f: any) => ({ id: f.id, name: f.name, mimeType: f.mimeType, size: f.size, webViewLink: f.webViewLink })),
          other: other.map((f: any) => ({ id: f.id, name: f.name, mimeType: f.mimeType, size: f.size, webViewLink: f.webViewLink }))
        },
        totals: {
          videos: videos.length,
          images: images.length, 
          documents: documents.length,
          other: other.length,
          total: files.length
        }
      };

      fs.writeFileSync(
        path.join(schoolDir, 'school-data.json'),
        JSON.stringify(schoolData, null, 2)
      );

      extractedData.extraction.schools.push(schoolData.school);

      console.log(`   ✅ Saved data for ${folder.name}`);

    } catch (error: any) {
      console.log(`   ❌ Error processing ${folder.name}:`, error.message);
    }
  }

  // Save master extraction report
  fs.writeFileSync(
    path.join(downloadDir, 'EXTRACTION_COMPLETE.json'),
    JSON.stringify(extractedData, null, 2)
  );

  console.log(`\n🎉 EXTRACTION COMPLETE!`);
  console.log(`📊 Results:`);
  console.log(`   📁 Schools processed: ${extractedData.extraction.schools.length}`);
  console.log(`   📂 Total folders: ${extractedData.extraction.totalFolders}`);
  console.log(`   📄 Data saved to: ./downloads-real/`);
  console.log(`\n📋 Next step: npm run organize-real`);
}

console.log('🚀 Simple API Key Setup & Extraction');
console.log('===================================');
testWithApiKey().catch(console.error);