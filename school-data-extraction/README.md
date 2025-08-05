# School Data Extraction System

Automated extraction and organization of school marketing materials from Google Drive folders.

## Overview

This system downloads all marketing materials from the shared Google Drive folder and organizes them into a structured format for use on the website. It handles:

- **24 Alpha School locations** across multiple states
- **11 Other educational institutions** 
- **Special folders** (Press & Media, Accreditation, etc.)
- **All file types** (videos, images, documents)

## Quick Start

### 1. Set Up Google Drive API Access

#### Option A: Service Account (Recommended)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Drive API
4. Create a Service Account:
   - Go to IAM & Admin > Service Accounts
   - Click "Create Service Account"
   - Add name and description
   - Grant "Viewer" role for the Drive API
5. Create and download the JSON key file
6. Share the Google Drive folder with the service account email

#### Option B: OAuth2 (Interactive)
1. Create OAuth2 credentials in Google Cloud Console
2. Download the credentials JSON file
3. Follow OAuth flow during first run

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env
```

Add your Google Drive credentials:
```env
# Option A: Service Account Key File
GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./path/to/service-account-key.json

# Option B: Service Account Key as JSON String  
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account"...}

# The Google Drive folder URL
GOOGLE_DRIVE_FOLDER_URL=https://drive.google.com/drive/folders/1OGl7MAzktOVbjKozzwcXE63YjJaM0Ulg
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Extraction

#### Full Automated Process
```bash
npm run full-extraction
```

#### Step by Step
```bash
# 1. Test API connection
npm run test-connection

# 2. Download from Google Drive  
npm run extract-drive

# 3. Organize downloaded files
npm run organize-schools
```

## Output Structure

Files are organized into:

```
public/schools/
├── alpha-schools/
│   ├── videos/           # All Alpha School videos
│   ├── images/           # All Alpha School images  
│   ├── documents/        # All Alpha School documents
│   └── metadata/         # JSON files with school data
├── other-schools/
│   ├── videos/           # Other institution videos
│   ├── images/           # Other institution images
│   ├── documents/        # Other institution documents  
│   └── metadata/         # JSON files with school data
├── special/
│   ├── press-media/      # Press & Media materials
│   ├── accreditation/    # Accreditation certificates
│   ├── thought-leadership/ # Thought leadership events
│   └── internal/         # Internal materials
├── extraction-report.json # Detailed extraction report
└── README.md            # Summary of extracted data
```

## File Organization

### Filename Convention
All files are renamed for consistency:
```
{school-id}_{timestamp}_{original-filename}
```

Examples:
- `alpha-austin_1699123456789_intro-video.mp4`
- `nextgen-austin_1699123456789_campus-photo.jpg`

### Metadata Structure
Each school gets a JSON metadata file:

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
    "videos": [...],
    "images": [...], 
    "documents": [...]
  },
  "metadata": {
    "totalFiles": 45,
    "lastUpdated": "2024-01-15T10:30:00Z",
    "googleDriveFolder": "Alpha School | Austin"
  }
}
```

## Supported Schools

### Alpha Schools (24 locations)
- Austin (2 locations), Bethesda, Brownsville, Chantilly, Charlotte
- Chicago, Denver, Folsom, Fort Worth, Houston, Lake Forest
- Miami, Microschools, New York, Orlando, Palm Beach, Plano
- Raleigh, San Francisco, Santa Barbara, Scottsdale
- Silicon Valley, Tampa

### Other Educational Institutions (11)
- GT School, NextGen Academy (Austin), Nova Academy
- Novatio School, SAT Level Up, Texas Sports Academy
- Waypoint Academy, Unbound, Montessorium
- Limitless Education, Learn + Earn

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run extract-drive` | Download all files from Google Drive |
| `npm run organize-schools` | Organize downloaded files into structure |
| `npm run full-extraction` | Complete end-to-end process |
| `npm run test-connection` | Test Google Drive API connection |
| `npm run clean-downloads` | Delete downloaded files |
| `npm run clean-output` | Delete organized output files |
| `npm run clean-all` | Clean everything |
| `npm run generate-report` | Generate extraction report only |

## File Type Support

### Videos
- `.mp4`, `.mov`, `.avi`, `.wmv`, `.flv`, `.webm`, `.mkv`

### Images  
- `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.svg`, `.webp`, `.tiff`

### Documents
- `.pdf`, `.doc`, `.docx`, `.ppt`, `.pptx`, `.txt`, `.md`

### Google Workspace Files
- Google Docs → Exported as PDF
- Google Sheets → Exported as Excel (.xlsx)  
- Google Slides → Exported as PowerPoint (.pptx)

## Error Handling

The system includes comprehensive error handling:

- **Connection errors**: Retry with exponential backoff
- **Missing files**: Logged but don't stop process
- **Permission errors**: Clear error messages with solutions
- **Quota limits**: Automatic throttling and resume

All errors are logged in the extraction report.

## Data Usage

After extraction, you can:

1. **Import into website**: Use the JSON metadata files to populate school pages
2. **Search and filter**: All files are tagged and categorized
3. **Generate galleries**: Automatically create video/image galleries
4. **Update content**: Easy re-extraction process for updates

## Cleanup

After successful extraction and verification:

```bash
# Remove extraction tools (keeps organized data)
cd ..
rm -rf school-data-extraction/

# Keep only the organized data in public/schools/
```

## Troubleshooting

### Google Drive API Issues
```bash
# Test connection
npm run test-connection

# Check credentials
cat .env | grep GOOGLE
```

### Missing Files
- Check the extraction report: `public/schools/extraction-report.json`
- Look for permission errors in the error log
- Ensure all folders are shared with service account

### Large File Issues  
- Some video files may be very large (>100MB)
- Download may take significant time
- Monitor disk space during extraction

## Integration with Website

The organized data can be directly used by your Next.js application:

```typescript
// Example: Load all Alpha School data
const alphaSchools = await import('/public/schools/alpha-schools/metadata/*.json');

// Example: Get all videos for a specific school
const austinData = await import('/public/schools/alpha-schools/metadata/alpha-austin.json');
const videos = austinData.media.videos;
```

---

**Next Steps**: After extraction is complete, delete this folder and use the organized data in `public/schools/` for your website.