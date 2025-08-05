-- Marketing Images Database Schema for Supabase
-- Extends your existing video system for brand-safe school marketing content

-- Create marketing_image_categories table  
CREATE TABLE IF NOT EXISTS marketing_image_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create marketing_images table (similar to your videos table)
CREATE TABLE IF NOT EXISTS marketing_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL, -- Supabase Storage URL
  thumbnail_url TEXT, -- Optimized thumbnail
  original_filename TEXT NOT NULL,
  school_id VARCHAR(255) NOT NULL, -- Links to your school system
  school_name VARCHAR(255) NOT NULL,
  school_type VARCHAR(50) NOT NULL, -- 'alpha', 'other', 'special'
  category VARCHAR(255) NOT NULL,
  content_type VARCHAR(100), -- 'Brand Assets', 'Event Flyers', 'Social Media', etc.
  tags TEXT[] DEFAULT '{}',
  google_drive_id TEXT, -- Original Google Drive reference
  google_drive_url TEXT, -- Direct download link
  file_size INTEGER DEFAULT 0,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  
  -- Foreign key constraint
  CONSTRAINT fk_marketing_image_category 
    FOREIGN KEY (category) 
    REFERENCES marketing_image_categories(name) 
    ON UPDATE CASCADE 
    ON DELETE RESTRICT
);

-- Create function to increment view count (same pattern as videos)
CREATE OR REPLACE FUNCTION increment_marketing_image_view_count(image_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE marketing_images 
  SET view_count = view_count + 1,
      updated_at = TIMEZONE('utc'::text, NOW())
  WHERE id = image_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_marketing_images_updated_at 
  BEFORE UPDATE ON marketing_images 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert marketing image categories based on your actual content
INSERT INTO marketing_image_categories (name, description, color) VALUES
  ('Brand Assets', 'Logos, brand materials, and corporate identity', '#3B82F6'),
  ('Event Flyers', 'Event promotion materials and announcements', '#10B981'), 
  ('Social Media', 'Social media graphics and promotional content', '#8B5CF6'),
  ('Signage', 'Physical signage and display materials', '#F59E0B'),
  ('Summer Camp', 'Summer camp promotional materials', '#EC4899'),
  ('Business Materials', 'Business cards, QR codes, and professional materials', '#6B7280'),
  ('Stock Photography', 'Professional photos and general marketing images', '#14B8A6')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_marketing_images_school_id ON marketing_images(school_id);
CREATE INDEX IF NOT EXISTS idx_marketing_images_school_type ON marketing_images(school_type);
CREATE INDEX IF NOT EXISTS idx_marketing_images_category ON marketing_images(category);
CREATE INDEX IF NOT EXISTS idx_marketing_images_content_type ON marketing_images(content_type);
CREATE INDEX IF NOT EXISTS idx_marketing_images_featured ON marketing_images(is_featured);
CREATE INDEX IF NOT EXISTS idx_marketing_images_created_at ON marketing_images(created_at DESC);

-- Enable Row Level Security (RLS) for public access
ALTER TABLE marketing_image_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_images ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (same pattern as your videos)
CREATE POLICY "Marketing image categories are publicly readable" ON marketing_image_categories
  FOR SELECT USING (true);

CREATE POLICY "Marketing images are publicly readable" ON marketing_images
  FOR SELECT USING (true);

-- Sample data - you'll populate this with your real extracted data
INSERT INTO marketing_images (
  title, 
  description, 
  image_url, 
  original_filename,
  school_id,
  school_name,
  school_type,
  category,
  content_type,
  tags,
  google_drive_id,
  is_featured
) VALUES
  (
    'Alpha School Austin - Brand Logo (White)',
    'Professional white logo for Alpha School Austin, suitable for dark backgrounds',
    'https://your-supabase-url.supabase.co/storage/v1/object/public/marketing-images/alpha-austin/logo-white.png',
    'logo-white.png',
    'alpha-austin',
    'Alpha School | Austin',
    'alpha',
    'Brand Assets',
    'Logos',
    ARRAY['logo', 'branding', 'white', 'professional'],
    'actual-google-drive-id',
    true
  );
  
-- You'll add the other 120 images with a similar pattern