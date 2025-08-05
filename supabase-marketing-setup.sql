-- Marketing Images Database Setup for Supabase
-- Copy this entire file and paste into Supabase SQL Editor, then click "Run"

-- Create categories table
CREATE TABLE IF NOT EXISTS marketing_image_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create images table  
CREATE TABLE IF NOT EXISTS marketing_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  original_filename TEXT NOT NULL,
  school_id VARCHAR(255) NOT NULL,
  school_name VARCHAR(255) NOT NULL,
  school_type VARCHAR(50) NOT NULL,
  category VARCHAR(255) NOT NULL,
  content_type VARCHAR(100),
  tags TEXT[] DEFAULT '{}',
  google_drive_id TEXT,
  google_drive_url TEXT,
  file_size INTEGER DEFAULT 0,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0
);

-- Insert marketing categories
INSERT INTO marketing_image_categories (name, description, color) VALUES
  ('Brand Assets', 'Logos, brand materials, and corporate identity', '#3B82F6'),
  ('Event Flyers', 'Event promotion materials and announcements', '#10B981'),
  ('Social Media', 'Social media graphics and promotional content', '#8B5CF6'),
  ('Signage', 'Physical signage and display materials', '#F59E0B'),
  ('Summer Camp', 'Summer camp promotional materials', '#EC4899'),
  ('Business Materials', 'Business cards, QR codes, and professional materials', '#6B7280'),
  ('Stock Photography', 'Professional photos and general marketing images', '#14B8A6')
ON CONFLICT (name) DO NOTHING;

-- Enable public access (same as your videos table)
ALTER TABLE marketing_image_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_images ENABLE ROW LEVEL SECURITY;

-- Create public read policies
CREATE POLICY "Marketing image categories are publicly readable" ON marketing_image_categories
  FOR SELECT USING (true);

CREATE POLICY "Marketing images are publicly readable" ON marketing_images
  FOR SELECT USING (true);

-- Verify setup (optional - check if tables were created)
SELECT 'Categories table created' as status, count(*) as category_count FROM marketing_image_categories;
SELECT 'Images table created' as status, count(*) as image_count FROM marketing_images;