#!/usr/bin/env ts-node

/**
 * Test System for School Data Extraction
 * 
 * Quick verification that all components work properly
 */

import * as fs from 'fs';
import * as path from 'path';
import { ALL_SCHOOLS, ALPHA_SCHOOL_LOCATIONS, OTHER_SCHOOL_LOCATIONS } from './schemas/school-types';

class SystemTester {
  
  async runTests(): Promise<void> {
    console.log('🧪 Testing School Data Extraction System...\n');

    await this.testSchemaDefinitions();
    await this.testDirectoryStructure();
    await this.testDependencies();
    await this.testConfiguration();

    console.log('\n✅ All tests passed! System is ready for extraction.');
  }

  /**
   * Test schema definitions
   */
  private async testSchemaDefinitions(): Promise<void> {
    console.log('📋 Testing schema definitions...');

    // Test school counts
    console.log(`   Alpha Schools: ${ALPHA_SCHOOL_LOCATIONS.length} locations`);
    console.log(`   Other Schools: ${OTHER_SCHOOL_LOCATIONS.length} institutions`);
    console.log(`   Total Schools: ${ALL_SCHOOLS.length} schools`);

    // Verify required fields
    const requiredFields = ['id', 'name', 'city', 'type', 'isMainBrand'];
    for (const school of ALL_SCHOOLS) {
      for (const field of requiredFields) {
        if (!(field in school)) {
          throw new Error(`Missing required field '${field}' in school: ${school.name}`);
        }
      }
    }

    // Check for duplicate IDs
    const ids = ALL_SCHOOLS.map(s => s.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      throw new Error('Duplicate school IDs found');
    }

    console.log('   ✅ Schema definitions valid');
  }

  /**
   * Test directory structure
   */
  private async testDirectoryStructure(): Promise<void> {
    console.log('📁 Testing directory structure...');

    const requiredDirs = [
      './schemas',
      './scripts', 
      './extractors',
      '../public/schools',
      '../public/schools/alpha-schools',
      '../public/schools/other-schools'
    ];

    for (const dir of requiredDirs) {
      if (!fs.existsSync(dir)) {
        throw new Error(`Required directory missing: ${dir}`);
      }
    }

    console.log('   ✅ Directory structure valid');
  }

  /**
   * Test dependencies
   */
  private async testDependencies(): Promise<void> {
    console.log('📦 Testing dependencies...');

    try {
      // Test Google APIs
      await import('googleapis');
      await import('google-auth-library');
      console.log('   ✅ Google APIs available');

      // Test Node.js modules
      await import('fs');
      await import('path');
      console.log('   ✅ Node.js modules available');

    } catch (error) {
      throw new Error(`Dependency test failed: ${error}`);
    }
  }

  /**
   * Test configuration
   */
  private async testConfiguration(): Promise<void> {
    console.log('⚙️  Testing configuration...');

    // Check if .env.example exists
    if (!fs.existsSync('.env.example')) {
      throw new Error('.env.example file missing');
    }

    // Check package.json
    if (!fs.existsSync('./package.json')) {
      throw new Error('package.json missing');
    }

    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
    const requiredScripts = ['extract-drive', 'organize-schools', 'full-extraction'];
    
    for (const script of requiredScripts) {
      if (!packageJson.scripts[script]) {
        throw new Error(`Missing NPM script: ${script}`);
      }
    }

    console.log('   ✅ Configuration valid');
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new SystemTester();
  tester.runTests()
    .then(() => {
      console.log('\n🎉 System test complete! Ready to extract school data.');
    })
    .catch(error => {
      console.error('\n❌ System test failed:', error.message);
      process.exit(1);
    });
}

export default SystemTester;