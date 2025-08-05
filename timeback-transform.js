#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Comprehensive TimeBack design system transformation mappings
const colorMappings = {
  // Text color mappings
  'text-timeback-primary': 'text-timeback-primary',
  'text-timeback-primary': 'text-timeback-primary',
  'text-timeback-primary': 'text-timeback-primary',
  'text-timeback-primary': 'text-timeback-primary',
  'text-timeback-primary': 'text-timeback-primary',
  'text-timeback-primary': 'text-timeback-primary',
  'text-timeback-primary': 'text-timeback-primary',
  'text-timeback-primary': 'text-timeback-primary',
  'text-timeback-primary': 'text-timeback-primary',
  'text-timeback-primary': 'text-timeback-primary',
  'text-timeback-primary': 'text-timeback-primary',
  'text-timeback-primary': 'text-timeback-primary',

  // Background color mappings
  'bg-timeback-bg': 'bg-timeback-bg',
  'bg-timeback-bg': 'bg-timeback-bg',
  'bg-timeback-bg': 'bg-timeback-bg',
  'bg-timeback-bg': 'bg-timeback-bg',
  'bg-timeback-bg': 'bg-timeback-bg',
  'bg-timeback-bg': 'bg-timeback-bg',
  'bg-timeback-bg': 'bg-timeback-bg',

  // Border color mappings
  'border-timeback-primary': 'border-timeback-primary',
  'border-timeback-primary': 'border-timeback-primary',
  'border-timeback-primary': 'border-timeback-primary',
  'border-timeback-primary': 'border-timeback-primary',
  'border-timeback-primary': 'border-timeback-primary',
  'border-timeback-primary': 'border-timeback-primary',

  // Hover state mappings
  'hover:text-timeback-primary': 'hover:text-timeback-primary',
  'hover:text-timeback-primary': 'hover:text-timeback-primary',
  'hover:bg-timeback-bg': 'hover:bg-timeback-bg',
  'hover:bg-timeback-bg': 'hover:bg-timeback-bg',
  'hover:bg-timeback-bg': 'hover:bg-timeback-bg',
  'hover:border-timeback-primary': 'hover:border-timeback-primary',
  'hover:border-timeback-primary': 'hover:border-timeback-primary',

  // Border radius improvements
  'rounded-xl': 'rounded-xl',
  'rounded-xl': 'rounded-xl',

  // Shadow enhancements
  'shadow-2xl': 'shadow-2xl',
  'shadow-2xl': 'shadow-2xl',
  'shadow-2xl': 'shadow-2xl',

  // Focus states
  'focus:border-timeback-primary': 'focus:border-timeback-primary',
  'focus:ring-timeback-primary': 'focus:ring-timeback-primary',
  'focus:ring-timeback-bg': 'focus:ring-timeback-bg',

  // Additional mappings for completeness
  'border-t-timeback-primary': 'border-t-timeback-primary',
  'border-b-2 border-timeback-primary': 'border-b-2 border-timeback-primary'
};

// Special gradient mappings
const gradientMappings = {
  'bg-gradient-to-br from-timeback-bg to-white': 'bg-gradient-to-br from-timeback-bg to-white',
  'bg-gradient-to-r from-timeback-primary to-timeback-primary': 'bg-gradient-to-r from-timeback-primary to-timeback-primary'
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
  
  // Apply color mappings
  Object.entries(colorMappings).forEach(([oldClass, newClass]) => {
    const regex = new RegExp(`\\b${oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, newClass);
      modified = true;
      console.log(`  ✓ Replaced ${oldClass} with ${newClass}`);
    }
  });

  // Apply gradient mappings
  Object.entries(gradientMappings).forEach(([oldGradient, newGradient]) => {
    if (content.includes(oldGradient)) {
      content = content.replace(new RegExp(oldGradient.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newGradient);
      modified = true;
      console.log(`  ✓ Replaced gradient: ${oldGradient} with ${newGradient}`);
    }
  });

  // Add font-cal to text elements that don't have it
  const fontCalRegex = /(className="[^"]*(?:text-|font-)[^"]*")(?![^>]*font-cal)/g;
  const matches = content.match(fontCalRegex);
  if (matches) {
    matches.forEach(match => {
      // Extract the className content
      const classNameContent = match.match(/className="([^"]*)"/)[1];
      if (!classNameContent.includes('font-cal')) {
        const newClassName = `className="${classNameContent} font-cal"`;
        content = content.replace(match, newClassName);
        modified = true;
        console.log(`  ✓ Added font-cal to: ${match}`);
      }
    });
  }

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
console.log('🚀 Starting TimeBack Design System Transformation...\n');

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

console.log(`\n🎉 Transformation complete!`);
console.log(`📊 Summary:`);
console.log(`   - Files processed: ${tsxFiles.length}`);
console.log(`   - Files modified: ${totalModified}`);
console.log(`   - Files unchanged: ${tsxFiles.length - totalModified}`);
console.log(`\n✨ TimeBack design system has been applied successfully!`);