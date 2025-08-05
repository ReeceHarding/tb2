# Quick Google Drive API Setup Guide

This is a simplified 5-minute setup process to extract all marketing materials from the Google Drive folder.

## Step 1: Create Google Cloud Project & Enable API

1. Go to https://console.cloud.google.com
2. Click "Select a project" → "New Project"
3. Name it "School Marketing Extractor" → Create
4. In the search bar, type "Google Drive API" → Enable it

## Step 2: Create Service Account

1. Go to "IAM & Admin" → "Service Accounts"
2. Click "Create Service Account"
3. Name: "SchoolExtractor" → Create and Continue → Done
4. Click on the service account email
5. Go to "Keys" tab → "Add Key" → "Create New Key" → JSON → Create
6. Download the JSON file and save it as `credentials.json` in this folder

## Step 3: Share the Google Drive Folder

The Google Drive folder needs to be shared with your service account:

1. Open the Google Drive folder: https://drive.google.com/drive/folders/1OGl7MAzktOVbjKozzwcXE63YjJaM0Ulg
2. Click "Share" button
3. Add the service account email (looks like `schoolextractor@project-name.iam.gserviceaccount.com`)
4. Give it "Viewer" permissions
5. Click "Send"

## Step 4: Run the Extractor

```bash
# Copy credentials file
cp /path/to/downloaded/credentials.json ./credentials.json

# Run the extraction
npm run extract-schools
```

That's it! The extractor will download and organize all 38+ school marketing materials automatically.

## What Gets Extracted

- **24 Alpha School locations** (Austin, Miami, Chicago, etc.)
- **14+ Other educational institutions** (GT School, NextGen Academy, etc.)
- **Special categories** (Press & Media, Accreditation Certificates, etc.)
- **All file types** (videos, images, documents, presentations)

## Output Structure

```
public/schools/
├── alpha-schools/
│   ├── videos/
│   ├── images/
│   ├── documents/
│   └── metadata/
├── other-schools/
│   ├── videos/
│   ├── images/
│   ├── documents/
│   └── metadata/
└── special/
    ├── press-media/
    ├── accreditation/
    └── thought-leadership/
```

## Troubleshooting

If you get authentication errors:
1. Make sure the credentials.json file is in the school-data-extraction folder
2. Verify the Google Drive folder is shared with your service account email
3. Check that Google Drive API is enabled in your Google Cloud project