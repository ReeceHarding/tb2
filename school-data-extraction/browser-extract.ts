#!/usr/bin/env ts-node

/**
 * Browser-based extraction guide
 * 
 * For when you just want to download everything manually from browser
 */

import * as fs from 'fs';
import * as path from 'path';

console.log('🌐 Browser-Based Extraction Guide');
console.log('=================================');
console.log('');
console.log('Since the Google Drive folder is public, you can:');
console.log('');
console.log('1. 📂 Open: https://drive.google.com/drive/folders/1OGl7MAzktOVbjKozzwcXE63YjJaM0Ulg');
console.log('2. 🖱️  Select all folders (Ctrl+A or Cmd+A)');
console.log('3. ⬇️  Right-click → Download');
console.log('4. 📁 Extract the zip file to: ./downloads-manual/');
console.log('5. 🚀 Run: npm run organize-manual');
console.log('');
console.log('💡 This bypasses all API authentication!');
console.log('');

// Create the manual organization script
const organizeScript = `#!/usr/bin/env ts-node

/**
 * Organize manually downloaded files
 */

import * as fs from 'fs';
import * as path from 'path';

function organizeManualDownload() {
  const downloadDir = './downloads-manual';
  const outputDir = '../public/schools';
  
  console.log('🗂️  Organizing manually downloaded files...');
  
  if (!fs.existsSync(downloadDir)) {
    console.log('❌ No downloads-manual folder found');
    console.log('📋 Steps:');
    console.log('   1. Download from browser to downloads-manual/');
    console.log('   2. Run this script again');
    return;
  }
  
  // Create output structure
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const alphDir = path.join(outputDir, 'alpha-schools');
  const otherDir = path.join(outputDir, 'other-schools'); 
  const specialDir = path.join(outputDir, 'special');
  
  [alphDir, otherDir, specialDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    ['videos', 'images', 'documents', 'metadata'].forEach(subdir => {
      const fullPath = path.join(dir, subdir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  });
  
  console.log('✅ Created organized structure');
  console.log('📁 Check: ../public/schools/');
  
  // TODO: Process the actual downloaded files
  console.log('');
  console.log('🔄 Next: Add your downloaded folders to downloads-manual/');
  console.log('   Then run this script again for full organization');
}

organizeManualDownload();
`;

fs.writeFileSync('./organize-manual.ts', organizeScript);

console.log('✅ Created organize-manual.ts script');
console.log('');
console.log('📋 Summary:');
console.log('   • Manual download avoids ALL authentication');
console.log('   • Browser download works for public folders');
console.log('   • Organization script handles the rest');
console.log('');
console.log('🚀 Choose your approach:');
console.log('   • API:    npm run simple (need 1 API key)');
console.log('   • Manual: Follow browser guide above');