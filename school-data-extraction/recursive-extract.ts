#!/usr/bin/env ts-node

/**
 * RECURSIVE Google Drive Extraction
 * 
 * Goes inside Marketing folders to get the actual photos and videos
 */

import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const FOLDER_ID = '1OGl7MAzktOVbjKozzwcXE63YjJaM0Ulg';
const API_KEY = process.env.GOOGLE_API_KEY;

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink: string;
  thumbnailLink?: string;
  parents?: string[];
}

interface ExtractedContent {
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
    images: DriveFile[];
    videos: DriveFile[];
    documents: DriveFile[];
    folders: DriveFile[];
    other: DriveFile[];
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

async function getRecursiveContent() {
  console.log('🔍 RECURSIVE Google Drive Extraction');
  console.log('====================================');
  console.log('🎯 Going INSIDE Marketing folders to get actual photos!');

  if (!API_KEY) {
    console.log('❌ No API key found in .env file');
    return;
  }

  try {
    const drive = google.drive({ version: 'v3', auth: API_KEY });

    // Get all school folders first
    console.log('📂 Step 1: Getting all school folders...');
    const schoolsResponse = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType,parents)',
      pageSize: 1000
    });

    const schoolFolders = schoolsResponse.data.files?.filter(file => 
      file.mimeType === 'application/vnd.google-apps.folder'
    ) || [];

    console.log(`✅ Found ${schoolFolders.length} school folders`);

    const allExtractedContent: ExtractedContent[] = [];
    let totalImages = 0;
    let totalVideos = 0;
    let totalDocuments = 0;

    // Process each school folder
    for (const schoolFolder of schoolFolders) {
      console.log(`\n🏫 Processing: ${schoolFolder.name}`);
      
      try {
        // Get contents of this school folder
        const schoolContentsResponse = await drive.files.list({
          q: `'${schoolFolder.id}' in parents and trashed=false`,
          fields: 'files(id,name,mimeType,size,webViewLink,thumbnailLink,parents)',
          pageSize: 1000
        });

        const schoolContents = schoolContentsResponse.data.files || [];
        
        // Look for Marketing folder specifically
        const marketingFolder = schoolContents.find(file => 
          file.name?.toLowerCase().includes('marketing') && 
          file.mimeType === 'application/vnd.google-apps.folder'
        );

        let marketingContents: any[] = [];
        
        if (marketingFolder) {
          console.log(`  📁 Found Marketing folder: ${marketingFolder.name}`);
          
          // Get contents of Marketing folder
          const marketingResponse = await drive.files.list({
            q: `'${marketingFolder.id}' in parents and trashed=false`,
            fields: 'files(id,name,mimeType,size,webViewLink,thumbnailLink,parents)',
            pageSize: 1000
          });

          marketingContents = marketingResponse.data.files || [];
          console.log(`  🎯 Found ${marketingContents.length} items in Marketing folder`);
          
          // If there are subfolders in Marketing, go deeper
          const marketingSubfolders = marketingContents.filter(file =>
            file.mimeType === 'application/vnd.google-apps.folder'
          );

          for (const subfolder of marketingSubfolders) {
            console.log(`    📂 Checking subfolder: ${subfolder.name}`);
            
            const subfolderResponse = await drive.files.list({
              q: `'${subfolder.id}' in parents and trashed=false`,
              fields: 'files(id,name,mimeType,size,webViewLink,thumbnailLink,parents)',
              pageSize: 1000
            });

            const subfolderContents = subfolderResponse.data.files || [];
            console.log(`      🔍 Found ${subfolderContents.length} items in ${subfolder.name}`);
            
            // Add subfolder contents to marketing contents
            marketingContents.push(...subfolderContents);
          }
        } else {
          console.log(`  ⚠️  No Marketing folder found, checking all contents`);
          marketingContents = schoolContents;
        }

        // Categorize all found files
        const images = marketingContents.filter(file => 
          file.mimeType?.startsWith('image/') || 
          file.name?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
        );
        
        const videos = marketingContents.filter(file => 
          file.mimeType?.startsWith('video/') || 
          file.name?.match(/\.(mp4|mov|avi|mkv|webm)$/i)
        );
        
        const documents = marketingContents.filter(file => 
          file.mimeType?.includes('document') || 
          file.mimeType?.includes('pdf') ||
          file.mimeType?.includes('presentation') ||
          file.mimeType?.includes('spreadsheet') ||
          file.name?.match(/\.(pdf|doc|docx|ppt|pptx|xls|xlsx)$/i)
        );

        const folders = marketingContents.filter(file => 
          file.mimeType === 'application/vnd.google-apps.folder'
        );

        const other = marketingContents.filter(file => 
          !images.includes(file) && 
          !videos.includes(file) && 
          !documents.includes(file) &&
          !folders.includes(file)
        );

        // Update totals
        totalImages += images.length;
        totalVideos += videos.length;
        totalDocuments += documents.length;

        console.log(`  📊 Results: ${images.length} images, ${videos.length} videos, ${documents.length} docs`);

        // Create school data structure
        const schoolId = schoolFolder.name?.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-') || 'unknown';

        const extractedContent: ExtractedContent = {
          school: {
            name: schoolFolder.name || 'Unknown',
            id: schoolId,
            extractionDate: new Date().toISOString()
          },
          marketingFolder: marketingFolder ? {
            id: marketingFolder.id || '',
            name: marketingFolder.name || '',
            webViewLink: marketingFolder.webViewLink || ''
          } : undefined,
          media: {
            images: images as DriveFile[],
            videos: videos as DriveFile[],
            documents: documents as DriveFile[],
            folders: folders as DriveFile[],
            other: other as DriveFile[]
          },
          totals: {
            images: images.length,
            videos: videos.length,
            documents: documents.length,
            folders: folders.length,
            other: other.length,
            total: marketingContents.length
          }
        };

        allExtractedContent.push(extractedContent);

        // Save individual school data
        const outputDir = 'recursive-downloads';
        const schoolDir = path.join(outputDir, schoolFolder.name || 'unknown');
        
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
        if (!fs.existsSync(schoolDir)) fs.mkdirSync(schoolDir, { recursive: true });
        
        fs.writeFileSync(
          path.join(schoolDir, 'recursive-data.json'),
          JSON.stringify(extractedContent, null, 2)
        );

      } catch (error: any) {
        console.log(`  ❌ Error processing ${schoolFolder.name}:`, error.message);
      }
    }

    // Create summary report
    const summaryReport = {
      extractionDate: new Date().toISOString(),
      summary: {
        schoolsProcessed: schoolFolders.length,
        totalImages: totalImages,
        totalVideos: totalVideos,
        totalDocuments: totalDocuments,
        totalFiles: totalImages + totalVideos + totalDocuments
      },
      schools: allExtractedContent.map(school => ({
        name: school.school.name,
        id: school.school.id,
        images: school.totals.images,
        videos: school.totals.videos,
        documents: school.totals.documents,
        hasMarketingFolder: !!school.marketingFolder
      }))
    };

    // Save summary
    fs.writeFileSync(
      'recursive-downloads/RECURSIVE_EXTRACTION_REPORT.json',
      JSON.stringify(summaryReport, null, 2)
    );

    console.log('\n🎉 RECURSIVE EXTRACTION COMPLETE!');
    console.log('===============================');
    console.log(`📊 FINAL RESULTS:`);
    console.log(`   📸 Total Images: ${totalImages}`);
    console.log(`   🎥 Total Videos: ${totalVideos}`);
    console.log(`   📄 Total Documents: ${totalDocuments}`);
    console.log(`   🏫 Schools Processed: ${schoolFolders.length}`);
    console.log(`\n📁 All data saved to: recursive-downloads/`);
    console.log(`📋 Summary report: recursive-downloads/RECURSIVE_EXTRACTION_REPORT.json`);

    if (totalImages > 50) {
      console.log(`\n🎯 SUCCESS! Found ${totalImages} images - exactly what you expected!`);
    } else {
      console.log(`\n🤔 Only found ${totalImages} images. May need to go even deeper or check folder permissions.`);
    }

  } catch (error: any) {
    console.log('❌ Error during recursive extraction:', error.message);
  }
}

getRecursiveContent();