#!/usr/bin/env ts-node

/**
 * Test Google Drive API access to public folder
 */

import { google } from 'googleapis';

// The folder ID from the URL
const folderId = '1OGl7MAzktOVbjKozzwcXE63YjJaM0Ulg';

async function testPublicAccess() {
  console.log('🔍 Testing public access to Google Drive folder...');
  
  try {
    // Try with no authentication first (for public folders)
    const drive = google.drive({ version: 'v3' });
    
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType,parents)',
      pageSize: 10
    });

    const files = response.data.files || [];
    console.log(`✅ Found ${files.length} items in folder:`);
    files.forEach(file => {
      console.log(`  📁 ${file.name} (${file.mimeType})`);
    });

  } catch (error: any) {
    console.log('❌ Public access failed:', error.message);
    console.log('\n🔐 This folder requires authentication. Setting up service account...');
    
    // We'll need to set up proper authentication
    return false;
  }
  
  return true;
}

// Run the test
if (require.main === module) {
  testPublicAccess()
    .then(success => {
      if (!success) {
        console.log('\n📋 Next steps:');
        console.log('1. Go to https://console.cloud.google.com');
        console.log('2. Create a new project or select existing');
        console.log('3. Enable Google Drive API');
        console.log('4. Create service account credentials');
        console.log('5. Download JSON key file and update .env');
      }
    })
    .catch(console.error);
}