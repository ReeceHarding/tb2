#!/usr/bin/env ts-node

/**
 * Quick Setup Script for Google Drive API
 * 
 * This script checks if credentials are available and guides you through setup
 */

import * as fs from 'fs';
import * as path from 'path';
import { google } from 'googleapis';

const CREDENTIALS_FILE = './credentials.json';
const FOLDER_ID = '1OGl7MAzktOVbjKozzwcXE63YjJaM0Ulg';

async function checkCredentials(): Promise<boolean> {
  if (!fs.existsSync(CREDENTIALS_FILE)) {
    console.log('❌ No credentials.json file found');
    return false;
  }

  try {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
    if (!credentials.client_email || !credentials.private_key) {
      console.log('❌ Invalid credentials file format');
      return false;
    }
    console.log('✅ Valid credentials file found');
    console.log(`📧 Service Account: ${credentials.client_email}`);
    return true;
  } catch (error: any) {
    console.log('❌ Error reading credentials file:', error.message);
    return false;
  }
}

async function testDriveAccess(): Promise<boolean> {
  try {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
    
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });

    const drive = google.drive({ version: 'v3', auth });

    console.log('🔍 Testing Google Drive API access...');
    
    const response = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType)',
      pageSize: 5
    });

    const files = response.data.files || [];
    console.log(`✅ Successfully accessed folder! Found ${files.length} items (showing first 5):`);
    
    files.forEach((file, index) => {
      const type = file.mimeType === 'application/vnd.google-apps.folder' ? '📁' : '📄';
      console.log(`  ${index + 1}. ${type} ${file.name}`);
    });

    return true;

  } catch (error: any) {
    if (error.code === 403) {
      console.log('❌ Access denied. The service account needs permission to access the Google Drive folder.');
      console.log('\n📋 TO FIX THIS:');
      console.log('1. Open: https://drive.google.com/drive/folders/1OGl7MAzktOVbjKozzwcXE63YjJaM0Ulg');
      console.log('2. Click "Share" button');
      console.log('3. Add this email with "Viewer" permission:');
      
      try {
        const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
        console.log(`   ${credentials.client_email}`);
      } catch {}
      
      console.log('4. Click "Send"');
      console.log('5. Run this script again');
    } else {
      console.log('❌ API access failed:', error.message);
    }
    return false;
  }
}

function showSetupInstructions(): void {
  console.log('\n🚀 GOOGLE DRIVE API SETUP REQUIRED');
  console.log('==================================\n');
  
  console.log('📋 Quick 5-minute setup:');
  console.log('1. Go to: https://console.cloud.google.com');
  console.log('2. Create new project: "School Marketing Extractor"');
  console.log('3. Enable Google Drive API');
  console.log('4. Create Service Account: "SchoolExtractor"');
  console.log('5. Download JSON key as "credentials.json" in this folder');
  console.log('6. Share the Google Drive folder with your service account email');
  console.log('\n📖 Detailed guide: ./setup-google-drive.md');
  console.log('\n🔄 Run this script again after setup to test access');
}

async function main() {
  console.log('🔧 Google Drive API Setup Checker\n');

  // Check if credentials exist
  const hasCredentials = await checkCredentials();
  
  if (!hasCredentials) {
    showSetupInstructions();
    return;
  }

  // Test API access
  const hasAccess = await testDriveAccess();
  
  if (hasAccess) {
    console.log('\n🎉 SUCCESS! Google Drive API is ready to use.');
    console.log('\n▶️  Next step: Run the extraction');
    console.log('   npm run extract-schools');
  }
}

if (require.main === module) {
  main().catch(console.error);
}