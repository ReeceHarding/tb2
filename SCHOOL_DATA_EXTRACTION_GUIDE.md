# School Marketing Materials Extraction System

## Overview

I've created a comprehensive system to extract and organize all school marketing materials from your Google Drive folder. This system will download all files from the 24+ Alpha School locations and 11+ other educational institutions, then organize them into a clean, structured format for your website.

## What's Been Created

### 📁 System Files
```
school-data-extraction/
├── schemas/
│   └── school-types.ts          # TypeScript definitions for all data structures
├── extractors/
│   └── google-drive-extractor.ts # Automated Google Drive API downloader
├── scripts/
│   ├── organize-school-data.ts   # File organization and structuring
│   └── website-integration-helper.ts # Generate API helpers for your site
├── package.json                 # Dependencies and scripts
├── README.md                    # Detailed setup instructions
├── MANUAL_EXTRACTION_GUIDE.md   # Fallback manual process
└── .env.example                 # Environment configuration template
```

### 📊 Data Structure (Output)
```
public/schools/
├── alpha-schools/               # 24 Alpha School locations
│   ├── videos/                 # All Alpha School videos
│   ├── images/                 # All Alpha School images
│   ├── documents/              # All Alpha School documents
│   └── metadata/               # JSON files with structured data
├── other-schools/               # 11 Other educational institutions
│   ├── videos/                 # All other school videos
│   ├── images/                 # All other school images
│   ├── documents/              # All other school documents
│   └── metadata/               # JSON files with structured data
├── special/
│   ├── press-media/            # Press & Media materials
│   ├── accreditation/          # Cognia Seal certificates
│   ├── thought-leadership/     # Event materials
│   └── internal/               # Internal documents
├── index.json                  # Quick lookup index
├── media-manifest.json         # All videos/images with metadata
├── extraction-report.json      # Detailed extraction report
└── README.md                   # Summary of extracted data
```

## Quick Start (3 Methods)

### Method 1: Automated API Extraction (Recommended)

1. **Set up Google Drive API access**:
   ```bash
   # Go to https://console.cloud.google.com/
   # Create project → Enable Drive API → Create Service Account
   # Download service account key JSON file
   ```

2. **Configure environment**:
   ```bash
   cd school-data-extraction
   cp .env.example .env
   # Edit .env with your Google credentials
   ```

3. **Run full extraction**:
   ```bash
   npm run extract-schools
   ```

### Method 2: Manual Download + Organization

1. **Manually download from Google Drive**:
   - Go to: https://drive.google.com/drive/folders/1OGl7MAzktOVbjKozzwcXE63YjJaM0Ulg
   - Download each school folder as ZIP
   - Extract all to `school-data-extraction/downloads/`

2. **Organize the files**:
   ```bash
   npm run organize-schools
   ```

### Method 3: Hybrid Approach

1. **Download specific folders manually**
2. **Use API for others**
3. **Run organization script**

## NPM Scripts Available

From the main project directory:

| Command | Description |
|---------|-------------|
| `npm run extract-schools` | Complete automated extraction (API + organize) |
| `npm run extract-drive` | Download files from Google Drive via API |
| `npm run organize-schools` | Organize downloaded files into structure |
| `npm run generate-school-integration` | Generate website integration files |
| `npm run setup-school-extraction` | Install extraction system dependencies |
| `npm run clean-school-data` | Clean all extracted data and downloads |

## Schools Included (35 Total)

### Alpha Schools (24 locations)
- **Texas**: Austin (2), Brownsville, Fort Worth, Houston, Plano
- **California**: Folsom, Lake Forest, San Francisco, Santa Barbara, Scottsdale, Silicon Valley  
- **Florida**: Miami, Orlando, Palm Beach, Tampa
- **East Coast**: Bethesda (MD), Chantilly (VA), Charlotte (NC), New York (NY), Raleigh (NC)
- **Other**: Chicago (IL), Denver (CO)
- **Plus**: Microschools program

### Other Educational Institutions (11)
- GT School, NextGen Academy (Austin), Nova Academy (Valenta Academy)
- Novatio School, SAT Level Up, Texas Sports Academy
- Waypoint Academy, Unbound, Montessorium
- Limitless Education, Learn + Earn

## File Types Supported

### Videos
- `.mp4`, `.mov`, `.avi`, `.wmv`, `.flv`, `.webm`, `.mkv`

### Images  
- `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.svg`, `.webp`, `.tiff`

### Documents
- `.pdf`, `.doc`, `.docx`, `.ppt`, `.pptx`, `.txt`, `.md`
- Google Docs → PDF, Sheets → Excel, Slides → PowerPoint

## Integration with Your Website

After extraction, the system generates:

### 1. TypeScript Definitions
```typescript
// types/school-data.ts
export interface ExtractedSchoolData {
  id: string;
  name: string;
  city: string;
  videos: ExtractedMediaFile[];
  images: ExtractedMediaFile[];
  // ... full type definitions
}
```

### 2. API Helper Functions
```typescript
// libs/school-data.ts
export async function getAllSchools(): Promise<ExtractedSchoolData[]>
export async function getSchoolData(schoolId: string): Promise<ExtractedSchoolData>
export async function getAllVideos(): Promise<ExtractedMediaFile[]>
export async function searchSchools(query: string): Promise<ExtractedSchoolData[]>
```

### 3. Next.js API Routes
- `/api/schools` - Get all schools or search
- `/api/media` - Get videos/images by school or globally

### 4. Usage Examples
```typescript
// Get all Alpha School data
const schools = await getAllSchools();
const alphaSchools = schools.filter(s => s.type === 'alpha-school');

// Get specific school
const austinSchool = await getSchoolData('alpha-austin');

// Get all videos
const allVideos = await getAllVideos();

// Search by city
const texasSchools = await searchSchools('texas');
```

## Expected Output

After successful extraction:

- **~500-2000+ files** organized by school and type
- **JSON metadata** for each school with complete file listings
- **Extraction report** with detailed statistics and any errors
- **Website integration files** ready for immediate use
- **API endpoints** for accessing data programmatically

## Data Examples

### School Metadata (alpha-austin.json)
```json
{
  "school": {
    "id": "alpha-austin",
    "name": "Alpha School",
    "city": "Austin", 
    "state": "TX",
    "type": "alpha-school"
  },
  "media": {
    "videos": [
      {
        "filename": "alpha-austin_1699123456789_intro-video.mp4",
        "url": "/schools/alpha-schools/videos/alpha-austin_1699123456789_intro-video.mp4",
        "fileType": "video",
        "mimeType": "video/mp4",
        "title": "Introduction Video",
        "tags": ["Alpha School", "Austin", "alpha-school"]
      }
    ],
    "images": [...],
    "documents": [...]
  },
  "metadata": {
    "totalFiles": 45,
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

## Cleanup Instructions

After successful extraction and verification:

1. **Keep the organized data**:
   ```bash
   # Keep: public/schools/ (this is your website data)
   ```

2. **Remove extraction tools**:
   ```bash
   # Delete: school-data-extraction/ (cleanup tools)
   npm run clean-school-data
   rm -rf school-data-extraction/
   ```

3. **Commit organized data**:
   ```bash
   git add public/schools/
   git commit -m "Add organized school marketing materials

   - 24 Alpha School locations
   - 11 Other educational institutions  
   - Videos, images, documents organized by school
   - JSON metadata for website integration
   - API helpers and TypeScript definitions"
   ```

## Troubleshooting

### Google Drive API Issues
- **Authentication errors**: Check service account permissions
- **Rate limiting**: System includes automatic throttling
- **Large files**: May take significant time to download

### Missing Files
- Check extraction report: `public/schools/extraction-report.json`
- Use manual download as fallback
- Some folders may be empty or inaccessible

### Integration Issues
- Run TypeScript compilation: `npm run build`
- Check API route functionality: Test `/api/schools`
- Verify file paths in metadata JSON

## Next Steps

1. **Extract the data** using one of the three methods above
2. **Verify extraction** by checking the generated report
3. **Test integration** by calling the API endpoints
4. **Update your website** to use the new school data
5. **Clean up** by removing the extraction tools

The system is designed to be run once for bulk extraction, then the tools can be safely deleted while keeping the organized data for your website.

---

**Total Time**: 10-30 minutes depending on file sizes and internet speed  
**Total Files**: Estimated 500-2000+ files across all schools  
**Storage**: Expect 1-5GB of organized marketing materials