# Manual Extraction Guide

If the Google Drive API approach doesn't work, you can manually download and organize the files.

## Step 1: Manual Download

1. **Go to the Google Drive folder**: https://drive.google.com/drive/folders/1OGl7MAzktOVbjKozzwcXE63YjJaM0Ulg

2. **Download each school folder**:
   - Right-click on each folder → Download
   - Google Drive will create a ZIP file for each folder
   - Download will start automatically

3. **Extract all ZIP files** into a `downloads` folder:
   ```bash
   mkdir downloads
   cd downloads
   # Extract each ZIP file here, maintaining folder names
   ```

## Step 2: Organize the Files

Once you have all folders extracted in `downloads/`, run the organizer:

```bash
npm run organize-schools
```

## Expected Folder Structure in Downloads

After extracting all ZIP files, you should have:

```
downloads/
├── Alpha High School | Austin/
├── Alpha School | Austin/  
├── Alpha School | Bethesda/
├── Alpha School | Brownsville/
├── Alpha School | Chantilly/
├── Alpha School | Charlotte/
├── Alpha School | Chicago/
├── Alpha School | Denver/
├── Alpha School | Folsom/
├── Alpha School | Fort Worth/
├── Alpha School | Houston/
├── Alpha School | Lake Forest/
├── Alpha School | Miami/
├── Alpha School | Microschools/
├── Alpha School | New York/
├── Alpha School | Orlando/
├── Alpha School | Palm Beach/
├── Alpha School | Plano/
├── Alpha School | Raleigh/
├── Alpha School | San Francisco/
├── Alpha School | Santa Barbara/
├── Alpha School | Scottsdale/
├── Alpha School | Silicon Valley/
├── Alpha School | Tampa/
├── GT School/
├── NextGen Academy | Austin/
├── Nova Academy (aka Valenta Academy)/
├── Novatio School/
├── SAT Level Up/
├── Texas Sports Academy/
├── Waypoint Academy/
├── Unbound/
├── Montessorium/
├── Limitless Education/
├── Learn + Earn/
├── Press & Media/
├── Accreditation Certificates - Cognia Seal/
├── Thought Leadership Events/
└── Internal/
```

## Step 3: Verify Organization

After running the organizer, check the output:

```bash
ls -la ../public/schools/
cat ../public/schools/README.md
```

## Troubleshooting Manual Extraction

### Missing Folders
If some folders are missing from your download:
1. Go back to Google Drive
2. Check if you have access to all folders
3. Download missing folders individually
4. Re-run the organizer

### Large Files
Some video files may be too large for Google Drive's web interface:
1. Use Google Drive desktop app instead
2. Or skip video files and download them separately
3. The organizer will handle whatever files are available

### File Name Issues
If you see special characters or encoding issues:
1. Rename problematic folders/files manually
2. The organizer is robust and handles most naming issues
3. Check the extraction report for any files that failed to process

## Alternative: Google Takeout

If the regular download doesn't work:

1. Go to [Google Takeout](https://takeout.google.com)
2. Select "Drive" 
3. Choose "Selected folders" and pick the marketing materials folder
4. Download the export when ready
5. Extract and follow the same organization process

## Batch Download Tools

For large-scale downloads, consider:

### rclone (Command Line)
```bash
# Install rclone
curl https://rclone.org/install.sh | sudo bash

# Configure Google Drive
rclone config

# Download the folder
rclone copy "gdrive:Marketing Materials Folder" downloads/ -P
```

### Google Drive CLI
```bash
# Install drive CLI tool
go get github.com/odeke-em/drive

# Authenticate and download
drive init
drive pull "Marketing Materials Folder"
```

After downloading with any method, always run:
```bash
npm run organize-schools
```

This ensures all files are properly organized and catalogued regardless of how they were downloaded.