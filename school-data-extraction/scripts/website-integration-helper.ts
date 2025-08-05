#!/usr/bin/env ts-node

/**
 * Website Integration Helper
 * 
 * Generates TypeScript definitions and API helpers for using the extracted
 * school data in the main Next.js application.
 */

import * as fs from 'fs';
import * as path from 'path';
import { SchoolData, ExtractionReport } from '../schemas/school-types';

class WebsiteIntegrationHelper {
  private schoolsPath: string;
  private outputPath: string;

  constructor(schoolsPath: string = '../public/schools', outputPath: string = '../') {
    this.schoolsPath = schoolsPath;
    this.outputPath = outputPath;
  }

  /**
   * Generate all integration files
   */
  async generateIntegration(): Promise<void> {
    console.log('🚀 Generating website integration files...');

    try {
      // Load extraction report
      const report = await this.loadExtractionReport();
      
      // Generate TypeScript definitions
      await this.generateTypeDefinitions(report);
      
      // Generate API helpers
      await this.generateAPIHelpers(report);
      
      // Generate school data index
      await this.generateSchoolIndex(report);
      
      // Generate image/video manifest
      await this.generateMediaManifest(report);
      
      // Generate Next.js API routes
      await this.generateAPIRoutes(report);

      console.log('✅ Integration files generated successfully!');
      
    } catch (error) {
      console.error('❌ Integration generation failed:', error);
      throw error;
    }
  }

  /**
   * Load the extraction report
   */
  private async loadExtractionReport(): Promise<ExtractionReport> {
    const reportPath = path.join(this.schoolsPath, 'extraction-report.json');
    const reportData = await fs.promises.readFile(reportPath, 'utf-8');
    return JSON.parse(reportData);
  }

  /**
   * Generate TypeScript type definitions
   */
  private async generateTypeDefinitions(report: ExtractionReport): Promise<void> {
    const content = `// Auto-generated from school data extraction
// Do not edit manually - regenerate with npm run generate-integration

export interface ExtractedSchoolData {
  id: string;
  name: string;
  city: string;
  state?: string;
  type: 'alpha-school' | 'other-school';
  videos: ExtractedMediaFile[];
  images: ExtractedMediaFile[];
  documents: ExtractedMediaFile[];
  totalFiles: number;
}

export interface ExtractedMediaFile {
  filename: string;
  url: string;
  fileType: 'video' | 'image' | 'document';
  mimeType: string;
  fileSize?: number;
  dimensions?: { width: number; height: number };
  duration?: number;
  title?: string;
  description?: string;
  tags?: string[];
}

// Available schools (${report.summary.totalSchools} total)
export const AVAILABLE_SCHOOLS = {
  ALPHA_SCHOOLS: [
${report.schools
  .filter(s => s.school.type === 'alpha-school')
  .map(s => `    '${s.school.id}': { name: '${s.school.name}', city: '${s.school.city}', state: '${s.school.state || ''}' }`)
  .join(',\n')}
  ],
  OTHER_SCHOOLS: [
${report.schools
  .filter(s => s.school.type === 'other-school')  
  .map(s => `    '${s.school.id}': { name: '${s.school.name}', city: '${s.school.city}' }`)
  .join(',\n')}
  ]
} as const;

// Media counts
export const MEDIA_STATS = {
  totalVideos: ${report.fileTypes.videos},
  totalImages: ${report.fileTypes.images},
  totalDocuments: ${report.fileTypes.documents},
  totalFiles: ${report.summary.totalFiles},
  lastUpdated: '${report.summary.extractionDate}'
} as const;

export type SchoolId = keyof typeof AVAILABLE_SCHOOLS.ALPHA_SCHOOLS | keyof typeof AVAILABLE_SCHOOLS.OTHER_SCHOOLS;
`;

    const outputPath = path.join(this.outputPath, 'types/school-data.ts');
    await fs.promises.writeFile(outputPath, content);
    console.log('📝 Generated: types/school-data.ts');
  }

  /**
   * Generate API helper functions
   */
  private async generateAPIHelpers(report: ExtractionReport): Promise<void> {
    const content = `// Auto-generated API helpers for school data
// Do not edit manually - regenerate with npm run generate-integration

import { ExtractedSchoolData, ExtractedMediaFile, SchoolId } from '../types/school-data';

/**
 * Load all school data
 */
export async function getAllSchools(): Promise<ExtractedSchoolData[]> {
  const schools: ExtractedSchoolData[] = [];
  
  // Load Alpha Schools
  const alphaSchoolIds = [${report.schools
    .filter(s => s.school.type === 'alpha-school')
    .map(s => `'${s.school.id}'`)
    .join(', ')}];
    
  for (const id of alphaSchoolIds) {
    try {
      const data = await import(\`/public/schools/alpha-schools/metadata/\${id}.json\`);
      schools.push(transformSchoolData(data.default || data));
    } catch (error) {
      console.warn(\`Failed to load Alpha School data for \${id}:\`, error);
    }
  }
  
  // Load Other Schools  
  const otherSchoolIds = [${report.schools
    .filter(s => s.school.type === 'other-school')
    .map(s => `'${s.school.id}'`)
    .join(', ')}];
    
  for (const id of otherSchoolIds) {
    try {
      const data = await import(\`/public/schools/other-schools/metadata/\${id}.json\`);
      schools.push(transformSchoolData(data.default || data));
    } catch (error) {
      console.warn(\`Failed to load Other School data for \${id}:\`, error);
    }
  }
  
  return schools;
}

/**
 * Load specific school data
 */
export async function getSchoolData(schoolId: SchoolId): Promise<ExtractedSchoolData | null> {
  try {
    // Determine school type and load appropriate metadata
    const isAlphaSchool = schoolId.startsWith('alpha-');
    const category = isAlphaSchool ? 'alpha-schools' : 'other-schools';
    
    const data = await import(\`/public/schools/\${category}/metadata/\${schoolId}.json\`);
    return transformSchoolData(data.default || data);
    
  } catch (error) {
    console.warn(\`Failed to load school data for \${schoolId}:\`, error);
    return null;
  }
}

/**
 * Get all videos from all schools
 */
export async function getAllVideos(): Promise<ExtractedMediaFile[]> {
  const schools = await getAllSchools();
  return schools.flatMap(school => school.videos);
}

/**
 * Get all images from all schools  
 */
export async function getAllImages(): Promise<ExtractedMediaFile[]> {
  const schools = await getAllSchools();
  return schools.flatMap(school => school.images);
}

/**
 * Get videos for specific school
 */
export async function getSchoolVideos(schoolId: SchoolId): Promise<ExtractedMediaFile[]> {
  const school = await getSchoolData(schoolId);
  return school?.videos || [];
}

/**
 * Get images for specific school
 */
export async function getSchoolImages(schoolId: SchoolId): Promise<ExtractedMediaFile[]> {
  const school = await getSchoolData(schoolId);
  return school?.images || [];
}

/**
 * Search schools by city or name
 */
export async function searchSchools(query: string): Promise<ExtractedSchoolData[]> {
  const schools = await getAllSchools();
  const lowerQuery = query.toLowerCase();
  
  return schools.filter(school => 
    school.name.toLowerCase().includes(lowerQuery) ||
    school.city.toLowerCase().includes(lowerQuery) ||
    school.state?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Transform raw school data to API format
 */
function transformSchoolData(rawData: any): ExtractedSchoolData {
  return {
    id: rawData.school.id,
    name: rawData.school.name,
    city: rawData.school.city,
    state: rawData.school.state,
    type: rawData.school.type,
    videos: rawData.media.videos.map(transformMediaFile),
    images: rawData.media.images.map(transformMediaFile),
    documents: rawData.media.documents.map(transformMediaFile),
    totalFiles: rawData.metadata.totalFiles
  };
}

/**
 * Transform raw media file to API format
 */
function transformMediaFile(rawFile: any): ExtractedMediaFile {
  return {
    filename: rawFile.filename,
    url: rawFile.localPath,
    fileType: rawFile.fileType,
    mimeType: rawFile.mimeType,
    fileSize: rawFile.fileSize,
    dimensions: rawFile.dimensions,
    duration: rawFile.duration,
    title: rawFile.metadata.title,
    description: rawFile.metadata.description,
    tags: rawFile.metadata.tags
  };
}
`;

    const outputPath = path.join(this.outputPath, 'libs/school-data.ts');
    await fs.promises.writeFile(outputPath, content);
    console.log('📝 Generated: libs/school-data.ts');
  }

  /**
   * Generate school index for quick lookups
   */
  private async generateSchoolIndex(report: ExtractionReport): Promise<void> {
    const index = {
      schools: report.schools.map(school => ({
        id: school.school.id,
        name: school.school.name,
        city: school.school.city,
        state: school.school.state,
        type: school.school.type,
        fileCount: school.metadata.totalFiles,
        hasVideos: school.media.videos.length > 0,
        hasImages: school.media.images.length > 0,
        lastUpdated: school.metadata.lastUpdated
      })),
      summary: report.summary,
      generatedAt: new Date().toISOString()
    };

    const outputPath = path.join(this.schoolsPath, 'index.json');
    await fs.promises.writeFile(outputPath, JSON.stringify(index, null, 2));
    console.log('📝 Generated: public/schools/index.json');
  }

  /**
   * Generate media manifest for galleries
   */
  private async generateMediaManifest(report: ExtractionReport): Promise<void> {
    const manifest = {
      videos: report.schools.flatMap(school => 
        school.media.videos.map(video => ({
          ...video,
          schoolId: school.school.id,
          schoolName: school.school.name,
          schoolCity: school.school.city
        }))
      ),
      images: report.schools.flatMap(school =>
        school.media.images.map(image => ({
          ...image,
          schoolId: school.school.id,
          schoolName: school.school.name,
          schoolCity: school.school.city
        }))
      ),
      generatedAt: new Date().toISOString()
    };

    const outputPath = path.join(this.schoolsPath, 'media-manifest.json');
    await fs.promises.writeFile(outputPath, JSON.stringify(manifest, null, 2));
    console.log('📝 Generated: public/schools/media-manifest.json');
  }

  /**
   * Generate Next.js API routes
   */
  private async generateAPIRoutes(report: ExtractionReport): Promise<void> {
    // Schools API route
    const schoolsApiContent = `// Auto-generated API route for schools data
import { NextRequest, NextResponse } from 'next/server';
import { getAllSchools, getSchoolData, searchSchools } from '../../../libs/school-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const schoolId = searchParams.get('id');
  const query = searchParams.get('q');

  try {
    if (schoolId) {
      // Get specific school
      const school = await getSchoolData(schoolId as any);
      if (!school) {
        return NextResponse.json({ error: 'School not found' }, { status: 404 });
      }
      return NextResponse.json(school);
    } else if (query) {
      // Search schools
      const schools = await searchSchools(query);
      return NextResponse.json(schools);
    } else {
      // Get all schools
      const schools = await getAllSchools();
      return NextResponse.json(schools);
    }
  } catch (error) {
    console.error('Schools API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
`;

    const schoolsApiPath = path.join(this.outputPath, 'app/api/schools/route.ts');
    await fs.promises.mkdir(path.dirname(schoolsApiPath), { recursive: true });
    await fs.promises.writeFile(schoolsApiPath, schoolsApiContent);
    console.log('📝 Generated: app/api/schools/route.ts');

    // Media API route
    const mediaApiContent = `// Auto-generated API route for media data
import { NextRequest, NextResponse } from 'next/server';
import { getAllVideos, getAllImages, getSchoolVideos, getSchoolImages } from '../../../libs/school-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'videos' | 'images'
  const schoolId = searchParams.get('schoolId');

  try {
    if (schoolId && type === 'videos') {
      const videos = await getSchoolVideos(schoolId as any);
      return NextResponse.json(videos);
    } else if (schoolId && type === 'images') {
      const images = await getSchoolImages(schoolId as any);
      return NextResponse.json(images);
    } else if (type === 'videos') {
      const videos = await getAllVideos();
      return NextResponse.json(videos);
    } else if (type === 'images') {
      const images = await getAllImages();
      return NextResponse.json(images);
    } else {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Media API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
`;

    const mediaApiPath = path.join(this.outputPath, 'app/api/media/route.ts');
    await fs.promises.mkdir(path.dirname(mediaApiPath), { recursive: true });
    await fs.promises.writeFile(mediaApiPath, mediaApiContent);
    console.log('📝 Generated: app/api/media/route.ts');
  }
}

// CLI execution
if (require.main === module) {
  const helper = new WebsiteIntegrationHelper();
  helper.generateIntegration()
    .then(() => {
      console.log('\n🎉 Website integration files generated!');
      console.log('\nNext steps:');
      console.log('1. Import school data types: import { ExtractedSchoolData } from "./types/school-data"');
      console.log('2. Use API helpers: import { getAllSchools } from "./libs/school-data"');
      console.log('3. Access API routes: /api/schools, /api/media');
    })
    .catch(error => {
      console.error('💥 Integration generation failed:', error);
      process.exit(1);
    });
}

export default WebsiteIntegrationHelper;