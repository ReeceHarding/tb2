#!/usr/bin/env ts-node

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
