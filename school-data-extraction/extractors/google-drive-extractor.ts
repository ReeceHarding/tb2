#!/usr/bin/env ts-node

/**
 * Google Drive Extractor
 * 
 * This script uses the Google Drive API to download files from the shared folder
 * and organize them locally before processing.
 * 
 * Setup:
 * 1. Enable Google Drive API in Google Cloud Console
 * 2. Create credentials (Service Account or OAuth2)
 * 3. Add credentials to .env.local
 * 4. Run: npm run extract-drive
 */

import * as fs from 'fs';
import * as path from 'path';
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
}

interface DownloadProgress {
  total: number;
  downloaded: number;
  current: string;
  errors: Array<{ file: string; error: string }>;
}

class GoogleDriveExtractor {
  private auth: GoogleAuth;
  private drive: any;
  private downloadPath: string;
  private folderId: string;
  private progress: DownloadProgress;

  constructor(folderId: string, downloadPath: string = './downloads') {
    this.folderId = folderId;
    this.downloadPath = downloadPath;
    this.progress = {
      total: 0,
      downloaded: 0,
      current: '',
      errors: []
    };

    // Initialize Google Auth
    this.auth = new GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
      credentials: process.env.GOOGLE_SERVICE_ACCOUNT_KEY 
        ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
        : undefined,
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });

    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }

  /**
   * Extract all files from the Google Drive folder
   */
  async extract(): Promise<void> {
    console.log('🚀 Starting Google Drive extraction...');
    console.log(`📂 Folder ID: ${this.folderId}`);
    console.log(`💾 Download Path: ${this.downloadPath}`);

    try {
      // Create download directory
      await fs.promises.mkdir(this.downloadPath, { recursive: true });

      // Get all files and folders
      console.log('📋 Scanning folder structure...');
      const allFiles = await this.getAllFiles(this.folderId);
      
      this.progress.total = allFiles.length;
      console.log(`📊 Found ${this.progress.total} files to download`);

      // Download all files
      await this.downloadAllFiles(allFiles);

      // Print summary
      this.printSummary();

    } catch (error) {
      console.error('❌ Extraction failed:', error);
      throw error;
    }
  }

  /**
   * Recursively get all files from folder and subfolders
   */
  private async getAllFiles(folderId: string, folderPath: string = ''): Promise<Array<DriveFile & { folderPath: string }>> {
    const files: Array<DriveFile & { folderPath: string }> = [];
    
    try {
      console.log(`🔍 Scanning: ${folderPath || 'Root folder'}`);
      
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id,name,mimeType,parents,size,createdTime,modifiedTime)',
        pageSize: 1000
      });

      const items = response.data.files || [];

      for (const item of items) {
        const itemPath = folderPath ? `${folderPath}/${item.name}` : item.name;

        if (item.mimeType === 'application/vnd.google-apps.folder') {
          // Recursively scan subfolders
          console.log(`📁 Entering folder: ${item.name}`);
          const subFiles = await this.getAllFiles(item.id, itemPath);
          files.push(...subFiles);
        } else {
          // Add file to download list
          files.push({
            ...item,
            folderPath: folderPath
          });
        }
      }

    } catch (error) {
      console.error(`Error scanning folder ${folderPath}:`, error);
      this.progress.errors.push({
        file: folderPath || 'Root',
        error: error instanceof Error ? error.message : String(error)
      });
    }

    return files;
  }

  /**
   * Download all files maintaining folder structure
   */
  private async downloadAllFiles(files: Array<DriveFile & { folderPath: string }>): Promise<void> {
    for (const file of files) {
      try {
        this.progress.current = file.name;
        console.log(`⬇️  Downloading [${this.progress.downloaded + 1}/${this.progress.total}]: ${file.folderPath}/${file.name}`);

        await this.downloadFile(file);
        this.progress.downloaded++;

        // Show progress
        const percent = Math.round((this.progress.downloaded / this.progress.total) * 100);
        console.log(`✅ Downloaded: ${file.name} (${percent}% complete)`);

      } catch (error) {
        console.error(`❌ Failed to download: ${file.name}`, error);
        this.progress.errors.push({
          file: file.name,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }

  /**
   * Download a single file
   */
  private async downloadFile(file: DriveFile & { folderPath: string }): Promise<void> {
    try {
      // Create local folder structure
      const localFolderPath = path.join(this.downloadPath, file.folderPath);
      await fs.promises.mkdir(localFolderPath, { recursive: true });

      const localFilePath = path.join(localFolderPath, file.name);

      // Skip if file already exists and has same size
      if (fs.existsSync(localFilePath)) {
        const localStats = await fs.promises.stat(localFilePath);
        if (file.size && localStats.size === parseInt(file.size)) {
          console.log(`⏭️  Skipping (already exists): ${file.name}`);
          return;
        }
      }

      // Handle Google Docs files (need to export)
      if (file.mimeType?.startsWith('application/vnd.google-apps.')) {
        await this.exportGoogleFile(file, localFilePath);
      } else {
        // Regular file download
        await this.downloadRegularFile(file, localFilePath);
      }

    } catch (error) {
      console.error(`Error downloading ${file.name}:`, error);
      throw error;
    }
  }

  /**
   * Export Google Workspace files (Docs, Sheets, Slides)
   */
  private async exportGoogleFile(file: DriveFile, localFilePath: string): Promise<void> {
    const exportMimeTypes: { [key: string]: { mimeType: string; extension: string } } = {
      'application/vnd.google-apps.document': {
        mimeType: 'application/pdf',
        extension: '.pdf'
      },
      'application/vnd.google-apps.spreadsheet': {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        extension: '.xlsx'
      },
      'application/vnd.google-apps.presentation': {
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        extension: '.pptx'
      }
    };

    const exportInfo = exportMimeTypes[file.mimeType!];
    if (!exportInfo) {
      console.log(`⚠️  Cannot export file type: ${file.mimeType}`);
      return;
    }

    // Add appropriate extension
    const exportPath = localFilePath + exportInfo.extension;

    const response = await this.drive.files.export({
      fileId: file.id,
      mimeType: exportInfo.mimeType
    }, {
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(exportPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  /**
   * Download regular files (images, videos, PDFs, etc.)
   */
  private async downloadRegularFile(file: DriveFile, localFilePath: string): Promise<void> {
    const response = await this.drive.files.get({
      fileId: file.id,
      alt: 'media'
    }, {
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(localFilePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  /**
   * Print extraction summary
   */
  private printSummary(): void {
    console.log('\n🎉 Google Drive extraction complete!');
    console.log(`📊 Downloaded: ${this.progress.downloaded}/${this.progress.total} files`);
    
    if (this.progress.errors.length > 0) {
      console.log(`❌ Errors: ${this.progress.errors.length}`);
      this.progress.errors.forEach(error => {
        console.log(`   - ${error.file}: ${error.error}`);
      });
    }

    console.log(`💾 Files saved to: ${this.downloadPath}`);
    console.log('\n✨ Next step: Run "npm run organize-schools" to organize the downloaded files');
  }

  /**
   * Test connection to Google Drive API
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔗 Testing Google Drive API connection...');
      
      const response = await this.drive.files.get({
        fileId: this.folderId,
        fields: 'id,name,mimeType'
      });

      console.log(`✅ Connected! Folder: ${response.data.name}`);
      return true;

    } catch (error) {
      console.error('❌ Connection failed:', error);
      return false;
    }
  }
}

// Extract folder ID from Google Drive URL
function extractFolderIdFromUrl(url: string): string {
  const match = url.match(/\/folders\/([a-zA-Z0-9-_]+)/);
  if (!match) {
    throw new Error('Invalid Google Drive folder URL');
  }
  return match[1];
}

// CLI execution
if (require.main === module) {
  const driveUrl = process.env.GOOGLE_DRIVE_FOLDER_URL || process.argv[2];
  
  if (!driveUrl) {
    console.error('❌ Please provide Google Drive folder URL as argument or in GOOGLE_DRIVE_FOLDER_URL env var');
    process.exit(1);
  }

  try {
    const folderId = extractFolderIdFromUrl(driveUrl);
    const extractor = new GoogleDriveExtractor(folderId);

    // Test connection first
    extractor.testConnection()
      .then(connected => {
        if (connected) {
          return extractor.extract();
        } else {
          throw new Error('Failed to connect to Google Drive API');
        }
      })
      .then(() => {
        console.log('\n🎉 All done! Files are ready for organization.');
      })
      .catch(error => {
        console.error('💥 Extraction failed:', error);
        process.exit(1);
      });

  } catch (error) {
    console.error('❌ Invalid folder URL:', error);
    process.exit(1);
  }
}

export default GoogleDriveExtractor;