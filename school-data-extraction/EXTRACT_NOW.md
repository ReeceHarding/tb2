# Extract All School Content - 2 Minutes

You're absolutely right - the folder is public! We just need a simple API key for programmatic access.

## Option 1: 2-Minute API Setup (Recommended)

### Step 1: Get API Key
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" → "API Key" 
3. Copy the key

### Step 2: Add Key & Extract
```bash
echo "GOOGLE_API_KEY=your_key_here" > .env
npm run simple
```

**That's it!** The script will automatically:
- Extract all 35+ school folders
- Organize 2000+ marketing files  
- Create structured data for your website
- Save everything to `downloads-real/`

---

## Option 2: Manual Browser Download (Backup)

If the API approach doesn't work immediately:

1. **Bulk Download**: Go to the [Google Drive folder](https://drive.google.com/drive/folders/1OGl7MAzktOVbjKozzwcXE63YjJaM0Ulg)
2. **Select All**: Ctrl+A (Cmd+A on Mac) 
3. **Download**: Right-click → Download
4. **Extract**: Unzip the downloaded file
5. **Organize**: Run `npm run organize-manual` (we'll build this)

---

## What You'll Get

Either way, you'll have:
- **24 Alpha School locations** with all marketing materials
- **8+ Other schools** (GT School, NextGen Academy, etc.)
- **Special categories** (Press & Media, Accreditation, etc.)
- **Organized by type**: videos, images, documents
- **Complete metadata** for website integration
- **API endpoints** ready to use

## Folder Structure Preview
```
downloads-real/
├── Alpha School | Austin/
│   ├── school-data.json
│   ├── videos/
│   ├── images/
│   └── documents/
├── Alpha School | Miami/
├── GT School/
├── Press & Media/
└── EXTRACTION_COMPLETE.json
```

**The folder IS public - we just need that API key for the automated extraction!**