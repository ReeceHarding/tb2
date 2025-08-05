#!/usr/bin/env ts-node

/**
 * Auto Extract - Multiple Authentication Approaches
 * 
 * This script tries multiple ways to access the Google Drive folder:
 * 1. Service account credentials (if available)
 * 2. OAuth tokens (if saved)
 * 3. API key (if folder is public)
 * 4. Guided setup
 */

import { google } from 'googleapis';
import * as fs from 'fs';
import { GoogleAuth } from 'google-auth-library';

const FOLDER_ID = '1OGl7MAzktOVbjKozzwcXE63YjJaM0Ulg';

// Known folder structure from web search results
const EXPECTED_SCHOOLS = [
  '2 Hour Learning',
  'Accreditation Certificates - Cognia Seal', 
  'Alpha High School | Austin',
  'Alpha School | Austin',
  'Alpha School | Bethesda',
  'Alpha School | Brownsville',
  'Alpha School | Chantilly',
  'Alpha School | Charlotte',
  'Alpha School | Chicago',
  'Alpha School | Denver',
  'Alpha School | Folsom',
  'Alpha School | Fort Worth',
  'Alpha School | Houston',
  'Alpha School | Lake Forest',
  'Alpha School | Miami',
  'Alpha School | Microschools',
  'Alpha School | New York',
  'Alpha School | Orlando',
  'Alpha School | Palm Beach',
  'Alpha School | Plano',
  'Alpha School | Raleigh',
  'Alpha School | San Francisco',
  'Alpha School | Santa Barbara',
  'Alpha School | Scottsdale',
  'Alpha School | Silicon Valley',
  'Alpha School | Tampa',
  'GT School',
  'Internal',
  'Learn + Earn',
  'Limitless Education',
  'Montessorium',
  'NextGen Academy | Austin',
  'Nova Academy (aka Valenta Academy)',
  'Novatio School',
  'Press & Media',
  'SAT Level Up',
  'Texas Sports Academy',
  'Thought Leadership Events',
  'Unbound',
  'Waypoint Academy'
];

async function tryServiceAccountAuth() {
  if (!fs.existsSync('./credentials.json')) {
    return null;
  }

  try {
    console.log('🔑 Trying service account authentication...');
    
    const auth = new GoogleAuth({
      keyFile: './credentials.json',
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });

    const drive = google.drive({ version: 'v3', auth });
    
    // Test access
    const response = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType)',
      pageSize: 5
    });

    console.log('✅ Service account authentication successful!');
    return drive;
    
  } catch (error: any) {
    console.log('❌ Service account auth failed:', error.message);
    return null;
  }
}

async function tryOAuthTokens(): Promise<any> {
  if (!fs.existsSync('./oauth-tokens.json')) {
    return null;
  }

  try {
    console.log('🔑 Trying saved OAuth tokens...');
    
    // Note: This would need valid OAuth client credentials
    // For now, return null to skip this method
    return null;
    
  } catch (error: any) {
    console.log('❌ OAuth tokens failed:', error.message);
    return null;
  }
}

async function tryPublicAccess() {
  try {
    console.log('🔑 Trying public API access...');
    
    const drive = google.drive({ version: 'v3' });
    
    const response = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType)',
      pageSize: 5
    });

    console.log('✅ Public access successful!');
    return drive;
    
  } catch (error: any) {
    console.log('❌ Public access failed:', error.message);
    return null;
  }
}

async function extractFolderStructure(drive: any) {
  console.log('\n📂 Extracting folder structure...');
  
  try {
    const response = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType,size,createdTime)',
      pageSize: 100
    });

    const folders = response.data.files || [];
    
    console.log(`\n✅ Found ${folders.length} school directories:`);
    
    const alphaSchools = [];
    const otherSchools = [];
    const specialCategories = [];
    
    folders.forEach((folder: any, index: number) => {
      const isFolder = folder.mimeType === 'application/vnd.google-apps.folder';
      const icon = isFolder ? '📁' : '📄';
      
      console.log(`  ${index + 1}. ${icon} ${folder.name}`);
      
      if (folder.name?.includes('Alpha School')) {
        alphaSchools.push(folder);
      } else if (folder.name?.includes('School') || folder.name?.includes('Academy')) {
        otherSchools.push(folder);
      } else {
        specialCategories.push(folder);
      }
    });

    console.log(`\n📊 Organization Summary:`);
    console.log(`   🏫 Alpha Schools: ${alphaSchools.length}`);
    console.log(`   🎓 Other Schools: ${otherSchools.length}`);
    console.log(`   📋 Special Categories: ${specialCategories.length}`);

    // Check against expected schools
    const found = folders.map((f: any) => f.name);
    const missing = EXPECTED_SCHOOLS.filter(school => !found.includes(school));
    
    if (missing.length === 0) {
      console.log(`\n✅ All ${EXPECTED_SCHOOLS.length} expected schools found!`);
    } else {
      console.log(`\n⚠️  Missing ${missing.length} expected schools:`);
      missing.slice(0, 5).forEach(school => console.log(`     - ${school}`));
      if (missing.length > 5) {
        console.log(`     ... and ${missing.length - 5} more`);
      }
    }

    return folders;
    
  } catch (error: any) {
    console.error('❌ Failed to extract folder structure:', error.message);
    return [];
  }
}

async function main() {
  console.log('🚀 Auto-Extract: School Marketing Materials');
  console.log('=========================================\n');

  // Try different authentication methods
  let drive = null;
  
  // Method 1: Service Account
  drive = await tryServiceAccountAuth();
  
  // Method 2: OAuth Tokens  
  if (!drive) {
    drive = await tryOAuthTokens();
  }
  
  // Method 3: Public Access
  if (!drive) {
    drive = await tryPublicAccess();
  }

  if (!drive) {
    console.log('\n❌ All authentication methods failed');
    console.log('\n📋 Setup Required:');
    console.log('   Run: npm run setup');
    console.log('   Or follow: ./setup-google-drive.md');
    return;
  }

  // Extract folder structure
  const folders = await extractFolderStructure(drive);
  
  if (folders.length > 0) {
    console.log('\n🎉 Ready for full extraction!');
    console.log('\n▶️  Next steps:');
    console.log('   1. npm run extract-drive    # Download all files');
    console.log('   2. npm run organize-schools # Organize into structure');
    console.log('   3. Check: ../public/schools/ # Final organized output');
    
    // Save authentication method for use in actual extraction
    if (fs.existsSync('./credentials.json')) {
      console.log('\n💾 Using service account for extraction');
    } else {
      console.log('\n💾 Using public access for extraction');
    }
  }
}

if (require.main === module) {
  main().catch(console.error);
}