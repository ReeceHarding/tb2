#!/usr/bin/env ts-node

/**
 * School Data Organization Script
 * 
 * This script processes downloaded Google Drive files and organizes them
 * into a structured format for the website.
 * 
 * Usage:
 * 1. Download all files from Google Drive to a 'downloads' folder
 * 2. Run: npm run organize-schools
 * 3. Files will be organized into public/schools/ with proper structure
 */

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { 
  SchoolData, 
  MediaFile, 
  ExtractionReport, 
  ALL_SCHOOLS,
  SchoolLocation 
} from '../schemas/school-types';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);

class SchoolDataOrganizer {
  private downloadPath: string;
  private outputPath: string;
  private report: ExtractionReport;

  constructor(downloadPath: string = './downloads', outputPath: string = './public/schools') {
    this.downloadPath = downloadPath;
    this.outputPath = outputPath;
    this.report = {
      summary: {
        totalSchools: 0,
        totalFiles: 0,
        extractionDate: new Date().toISOString(),
        status: 'complete'
      },
      schools: [],
      errors: [],
      fileTypes: { videos: 0, images: 0, documents: 0 }
    };
  }

  /**
   * Main organization function
   */
  async organize(): Promise<ExtractionReport> {
    console.log('🚀 Starting school data organization...');
    console.log(`📂 Input: ${this.downloadPath}`);
    console.log(`📂 Output: ${this.outputPath}`);

    try {
      // Check if download folder exists
      if (!fs.existsSync(this.downloadPath)) {
        throw new Error(`Download folder not found: ${this.downloadPath}`);
      }

      // Create output directories
      await this.createOutputDirectories();

      // Process each school
      for (const school of ALL_SCHOOLS) {
        console.log(`\n📚 Processing ${school.name} (${school.city})...`);
        await this.processSchool(school);
      }

      // Process special folders
      await this.processSpecialFolders();

      // Generate final report
      await this.generateReport();

      console.log('\n✅ Organization complete!');
      console.log(`📊 Processed ${this.report.summary.totalSchools} schools`);
      console.log(`📁 Organized ${this.report.summary.totalFiles} files`);

      return this.report;

    } catch (error) {
      console.error('❌ Organization failed:', error);
      this.report.summary.status = 'failed';
      this.report.errors.push({
        school: 'SYSTEM',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Create output directory structure
   */
  private async createOutputDirectories(): Promise<void> {
    const dirs = [
      `${this.outputPath}/alpha-schools/videos`,
      `${this.outputPath}/alpha-schools/images`, 
      `${this.outputPath}/alpha-schools/documents`,
      `${this.outputPath}/alpha-schools/metadata`,
      `${this.outputPath}/other-schools/videos`,
      `${this.outputPath}/other-schools/images`,
      `${this.outputPath}/other-schools/documents`, 
      `${this.outputPath}/other-schools/metadata`,
      `${this.outputPath}/special/press-media`,
      `${this.outputPath}/special/accreditation`,
      `${this.outputPath}/special/thought-leadership`,
      `${this.outputPath}/special/internal`
    ];

    for (const dir of dirs) {
      await mkdir(dir, { recursive: true });
    }
  }

  /**
   * Process a single school's files
   */
  private async processSchool(school: SchoolLocation): Promise<void> {
    try {
      // Find matching folder in downloads
      const folderName = this.findSchoolFolder(school);
      if (!folderName) {
        console.log(`⚠️  No folder found for ${school.name}`);
        return;
      }

      const schoolPath = path.join(this.downloadPath, folderName);
      const schoolData: SchoolData = {
        school,
        media: { videos: [], images: [], documents: [] },
        metadata: {
          totalFiles: 0,
          lastUpdated: new Date().toISOString(),
          extractionDate: new Date().toISOString(),
          googleDriveFolder: folderName
        },
        marketing: {}
      };

      // Process all files in school folder
      await this.processSchoolFiles(schoolPath, schoolData);

      // Save school data
      const outputFolder = school.type === 'alpha-school' ? 'alpha-schools' : 'other-schools';
      const metadataPath = `${this.outputPath}/${outputFolder}/metadata/${school.id}.json`;
      
      await fs.promises.writeFile(
        metadataPath, 
        JSON.stringify(schoolData, null, 2)
      );

      this.report.schools.push(schoolData);
      this.report.summary.totalSchools++;

      console.log(`✅ Processed ${schoolData.metadata.totalFiles} files for ${school.name}`);

    } catch (error) {
      console.error(`❌ Error processing ${school.name}:`, error);
      this.report.errors.push({
        school: school.name,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Find the corresponding folder for a school
   */
  private findSchoolFolder(school: SchoolLocation): string | null {
    try {
      const folders = fs.readdirSync(this.downloadPath);
      
      // Direct name matching patterns
      const patterns = [
        school.name,
        `${school.name} | ${school.city}`,
        `${school.name} ${school.city}`,
        school.city,
        school.id
      ];

      for (const pattern of patterns) {
        const match = folders.find(folder => 
          folder.toLowerCase().includes(pattern.toLowerCase())
        );
        if (match) return match;
      }

      return null;
    } catch (error) {
      console.error(`Error finding folder for ${school.name}:`, error);
      return null;
    }
  }

  /**
   * Process all files in a school's folder
   */
  private async processSchoolFiles(schoolPath: string, schoolData: SchoolData): Promise<void> {
    try {
      const files = await this.getFilesRecursively(schoolPath);
      
      for (const filePath of files) {
        const mediaFile = await this.processMediaFile(filePath, schoolData.school);
        if (mediaFile) {
          // Categorize file
          if (this.isVideo(filePath)) {
            schoolData.media.videos.push(mediaFile);
            this.report.fileTypes.videos++;
          } else if (this.isImage(filePath)) {
            schoolData.media.images.push(mediaFile);
            this.report.fileTypes.images++;
          } else {
            schoolData.media.documents.push(mediaFile);
            this.report.fileTypes.documents++;
          }

          schoolData.metadata.totalFiles++;
          this.report.summary.totalFiles++;
        }
      }
    } catch (error) {
      console.error(`Error processing files for ${schoolData.school.name}:`, error);
    }
  }

  /**
   * Get all files recursively from a directory
   */
  private async getFilesRecursively(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const items = await readdir(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stats = await stat(fullPath);
        
        if (stats.isDirectory()) {
          const subFiles = await this.getFilesRecursively(fullPath);
          files.push(...subFiles);
        } else {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dirPath}:`, error);
    }
    
    return files;
  }

  /**
   * Process a single media file
   */
  private async processMediaFile(filePath: string, school: SchoolLocation): Promise<MediaFile | null> {
    try {
      const stats = await stat(filePath);
      const filename = path.basename(filePath);
      const ext = path.extname(filename).toLowerCase();

      // Skip system files
      if (filename.startsWith('.') || filename.includes('Thumbs.db')) {
        return null;
      }

      // Determine output path
      const category = school.type === 'alpha-school' ? 'alpha-schools' : 'other-schools';
      let fileType: 'video' | 'image' | 'document';
      let subFolder: string;

      if (this.isVideo(filePath)) {
        fileType = 'video';
        subFolder = 'videos';
      } else if (this.isImage(filePath)) {
        fileType = 'image'; 
        subFolder = 'images';
      } else {
        fileType = 'document';
        subFolder = 'documents';
      }

      const outputFilename = `${school.id}_${Date.now()}_${filename}`;
      const localPath = `${this.outputPath}/${category}/${subFolder}/${outputFilename}`;

      // Copy file to organized location
      await copyFile(filePath, localPath);

      const mediaFile: MediaFile = {
        filename: outputFilename,
        originalPath: filePath,
        localPath: localPath.replace('./public', ''),
        fileType,
        mimeType: this.getMimeType(ext),
        fileSize: stats.size,
        metadata: {
          title: filename.replace(ext, ''),
          dateCreated: stats.birthtime.toISOString(),
          lastModified: stats.mtime.toISOString(),
          tags: [school.name, school.city, school.type]
        }
      };

      console.log(`📁 Organized: ${filename} → ${outputFilename}`);
      return mediaFile;

    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Process special folders (Press & Media, Accreditation, etc.)
   */
  private async processSpecialFolders(): Promise<void> {
    const specialFolders = [
      'Press & Media',
      'Accreditation Certificates - Cognia Seal', 
      'Thought Leadership Events',
      'Internal'
    ];

    for (const folderName of specialFolders) {
      const folderPath = path.join(this.downloadPath, folderName);
      if (fs.existsSync(folderPath)) {
        console.log(`\n📂 Processing special folder: ${folderName}`);
        await this.processSpecialFolder(folderPath, folderName);
      }
    }
  }

  /**
   * Process a special folder
   */
  private async processSpecialFolder(folderPath: string, folderName: string): Promise<void> {
    try {
      const files = await this.getFilesRecursively(folderPath);
      const outputSubfolder = folderName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      for (const filePath of files) {
        const filename = path.basename(filePath);
        const outputPath = `${this.outputPath}/special/${outputSubfolder}/${filename}`;
        
        // Create directory if needed
        await mkdir(path.dirname(outputPath), { recursive: true });
        
        // Copy file
        await copyFile(filePath, outputPath);
        
        console.log(`📁 Special file: ${filename}`);
        this.report.summary.totalFiles++;
      }
    } catch (error) {
      console.error(`Error processing special folder ${folderName}:`, error);
    }
  }

  /**
   * Generate final report
   */
  private async generateReport(): Promise<void> {
    const reportPath = `${this.outputPath}/extraction-report.json`;
    await fs.promises.writeFile(reportPath, JSON.stringify(this.report, null, 2));
    
    // Also create a summary markdown
    const summaryPath = `${this.outputPath}/README.md`;
    const markdown = this.generateMarkdownSummary();
    await fs.promises.writeFile(summaryPath, markdown);
  }

  /**
   * Generate markdown summary
   */
  private generateMarkdownSummary(): string {
    return `# School Marketing Materials - Extraction Report

## Summary
- **Extraction Date**: ${this.report.summary.extractionDate}
- **Total Schools**: ${this.report.summary.totalSchools}
- **Total Files**: ${this.report.summary.totalFiles}
- **Status**: ${this.report.summary.status}

## File Types
- **Videos**: ${this.report.fileTypes.videos}
- **Images**: ${this.report.fileTypes.images}  
- **Documents**: ${this.report.fileTypes.documents}

## Schools Processed

### Alpha Schools (${this.report.schools.filter(s => s.school.type === 'alpha-school').length})
${this.report.schools
  .filter(s => s.school.type === 'alpha-school')
  .map(s => `- **${s.school.name}** (${s.school.city}) - ${s.metadata.totalFiles} files`)
  .join('\n')}

### Other Schools (${this.report.schools.filter(s => s.school.type === 'other-school').length})
${this.report.schools
  .filter(s => s.school.type === 'other-school')
  .map(s => `- **${s.school.name}** - ${s.metadata.totalFiles} files`)
  .join('\n')}

## Errors
${this.report.errors.length === 0 ? 'No errors encountered.' : 
  this.report.errors.map(e => `- **${e.school}**: ${e.error}`).join('\n')}

---
*Generated on ${new Date().toISOString()}*
`;
  }

  // Utility methods
  private isVideo(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.mkv'].includes(ext);
  }

  private isImage(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.tiff'].includes(ext);
  }

  private getMimeType(ext: string): string {
    const mimeTypes: { [key: string]: string } = {
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}

// CLI execution
if (require.main === module) {
  const organizer = new SchoolDataOrganizer();
  organizer.organize()
    .then(report => {
      console.log('\n🎉 Organization complete!');
      console.log('📊 Report saved to public/schools/extraction-report.json');
    })
    .catch(error => {
      console.error('💥 Organization failed:', error);
      process.exit(1);
    });
}

export default SchoolDataOrganizer;