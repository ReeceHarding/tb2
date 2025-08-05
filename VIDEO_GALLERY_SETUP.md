# Video Gallery Setup Guide

This guide explains how to set up the Video Gallery feature that displays videos from your Supabase database in a beautiful collage layout.

## Features

✨ **Beautiful Collage Layout** - Responsive grid with featured video prominently displayed
📱 **Mobile Responsive** - Works perfectly on all device sizes  
🎥 **Video Modal Player** - Full-screen video playback with controls
🏷️ **Category Filtering** - Filter videos by category with smooth animations
🔍 **Smart Fallbacks** - Graceful handling when Supabase is not configured
📊 **View Tracking** - Automatic view count incrementation
🎨 **Hover Effects** - Beautiful animations and transitions

## Setup Instructions

### 1. Configure Supabase

First, you need to set up your Supabase project and add the connection details:

```bash
# Copy the example environment file
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Create Database Tables

Run the SQL schema in your Supabase SQL Editor:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor  
3. Copy and paste the contents of `supabase-schema.sql`
4. Click "Run" to create all tables, functions, and sample data

This will create:
- `video_categories` table with sample categories
- `videos` table with sample videos  
- Proper indexes and Row Level Security policies
- Sample data to get you started

### 3. Upload Your Videos

You have several options for hosting your videos:

#### Option A: Supabase Storage (Recommended)
1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `videos`
3. Upload your video files
4. Make the bucket public or configure proper policies
5. Update the `video_url` in your videos table

#### Option B: External CDN
1. Upload videos to your preferred CDN (Cloudflare, AWS S3, etc.)
2. Update the `video_url` and `thumbnail_url` in your videos table

#### Option C: Self-hosted
1. Place videos in your `public` folder
2. Update paths in the videos table (e.g., `/videos/my-video.mp4`)

### 4. Add Your Video Data

Update the videos in your Supabase database:

```sql
-- Update existing sample videos or insert new ones
UPDATE videos SET 
  video_url = 'https://your-cdn.com/actual-video.mp4',
  thumbnail_url = 'https://your-cdn.com/thumbnail.jpg'
WHERE title = 'How TimeBack Personalizes Learning';

-- Or insert completely new videos
INSERT INTO videos (title, description, thumbnail_url, video_url, duration, category, tags) 
VALUES (
  'Your New Video Title',
  'Compelling description of your video content...',
  'https://your-cdn.com/thumbnail.jpg',
  'https://your-cdn.com/video.mp4',
  240, -- duration in seconds
  'How It Works', -- must match existing category
  ARRAY['tag1', 'tag2', 'tag3']
);
```

### 5. Test the Integration

1. Start your development server: `npm run dev`
2. Visit `/personalized` to see the video gallery
3. Try filtering by category
4. Click on videos to test the modal player
5. Check that view counts increment properly

## Video Gallery Component

The video gallery is automatically integrated into the personalized results page and includes:

- **Dynamic Loading**: Fetches videos from your Supabase database
- **Category Filtering**: Beautiful filter buttons for different video categories  
- **Collage Layout**: Featured video (first one) displays larger
- **Modal Player**: Click any video to open full-screen player
- **Responsive Design**: Adapts perfectly to all screen sizes
- **Loading States**: Smooth animations while content loads
- **Error Handling**: Graceful fallbacks with sample content

## Customization

### Styling
All styling uses Tailwind CSS classes and can be customized in:
- `components/VideoGallery.tsx` - Main component styling
- Categories, colors, and layout can be modified

### Categories  
Add new video categories in Supabase:

```sql
INSERT INTO video_categories (name, description, color) VALUES
  ('New Category', 'Description here', '#FF6B6B');
```

### Mock Data
If Supabase isn't configured, the component shows fallback mock data to demonstrate the layout.

## API Routes

The video gallery uses these API routes:

- `GET /api/videos` - Fetch all featured videos
- `GET /api/videos?category=CategoryName` - Fetch videos by category  
- `GET /api/video-categories` - Fetch all categories

## Troubleshooting

### Videos Not Loading
1. Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
2. Verify your Supabase tables exist and have data
3. Check Row Level Security policies allow public read access
4. Ensure video URLs are accessible

### Build Errors
1. The component gracefully handles missing Supabase configuration
2. Build should succeed even without Supabase credentials  
3. Check console for specific error messages

### Styling Issues
1. Ensure Tailwind CSS is properly configured
2. Check that required CSS classes are available
3. Test on different screen sizes

## Database Schema

```sql
-- Video Categories
CREATE TABLE video_categories (
  id UUID PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Videos  
CREATE TABLE videos (
  id UUID PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  video_url TEXT NOT NULL,
  duration INTEGER DEFAULT 0,
  category VARCHAR(255) NOT NULL,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_featured BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0
);
```

## Support

If you encounter any issues:

1. Check the browser console for error messages
2. Verify your Supabase configuration  
3. Ensure your video URLs are accessible
4. Test the API routes directly: `/api/videos` and `/api/video-categories`

The video gallery component includes comprehensive logging to help debug any issues.