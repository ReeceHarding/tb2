#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Additional color mappings to catch remaining instances
const additionalMappings = {
  // Additional text colors
  'text-timeback-primary': 'text-timeback-primary',
  'text-timeback-primary': 'text-timeback-primary',
  'text-timeback-primary': 'text-timeback-primary',

  // Additional background colors  
  'bg-timeback-bg': 'bg-timeback-bg',
  'bg-timeback-bg': 'bg-timeback-bg',
  'bg-timeback-bg': 'bg-timeback-bg',
  'bg-timeback-primary': 'bg-timeback-primary',
  'bg-timeback-primary': 'bg-timeback-primary',
  'bg-timeback-bg': 'bg-timeback-bg',
  'bg-timeback-bg': 'bg-timeback-bg',
  'bg-timeback-bg': 'bg-timeback-bg',

  // Additional border colors
  'border-timeback-primary': 'border-timeback-primary',
  'border-timeback-primary': 'border-timeback-primary',
  'border-timeback-primary': 'border-timeback-primary',

  // Additional hover states
  'hover:bg-timeback-bg': 'hover:bg-timeback-bg',
  'hover:bg-timeback-bg': 'hover:bg-timeback-bg',
  'hover:text-timeback-primary': 'hover:text-timeback-primary',

  // Additional focus states
  'focus:ring-timeback-bg': 'focus:ring-timeback-bg',
  'ring-timeback-bg': 'ring-timeback-bg',

  // Additional placeholder colors
  'placeholder-timeback-bg': 'placeholder-timeback-bg'
};

// Function to recursively find all .tsx files
function findTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other unnecessary directories
      if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(file)) {
        findTsxFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to apply transformations to a file
function transformFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Apply additional color mappings
  Object.entries(additionalMappings).forEach(([oldClass, newClass]) => {
    const regex = new RegExp(`\\b${oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, newClass);
      modified = true;
      console.log(`  ✓ Replaced ${oldClass} with ${newClass}`);
    }
  });

  // Save the file if it was modified
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ File updated: ${filePath}`);
  } else {
    console.log(`  ⚪ No changes needed: ${filePath}`);
  }
  
  return modified;
}

// Main execution
console.log('🚀 Starting Final TimeBack Color Cleanup...\n');

const projectRoot = process.cwd();
const tsxFiles = findTsxFiles(projectRoot);

console.log(`Found ${tsxFiles.length} files to process...\n`);

let totalModified = 0;

tsxFiles.forEach(filePath => {
  if (transformFile(filePath)) {
    totalModified++;
  }
  console.log(); // Add spacing between files
});

console.log(`\n🎉 Final cleanup complete!`);
console.log(`📊 Summary:`);
console.log(`   - Files processed: ${tsxFiles.length}`);
console.log(`   - Files modified: ${totalModified}`);
console.log(`   - Files unchanged: ${tsxFiles.length - totalModified}`);
console.log(`\n✨ TimeBack design system is now complete!`);