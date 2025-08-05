-- Migration to replace local JSON files with database storage for Vercel deployment
-- This migration creates tables to store school data, marketing assets, and metadata

-- Schools table - stores basic school information
CREATE TABLE schools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  type TEXT NOT NULL CHECK (type IN ('alpha', 'other', 'special')),
  extraction_date TIMESTAMPTZ,
  has_marketing_folder BOOLEAN DEFAULT false,
  marketing_folder_id TEXT,
  total_assets INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketing assets table - stores images, videos, and documents
CREATE TABLE marketing_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  organized_name TEXT,
  local_path TEXT,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video', 'document')),
  mime_type TEXT,
  file_size BIGINT,
  google_drive_id TEXT,
  download_url TEXT,
  web_view_link TEXT,
  thumbnail_link TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- School categories table - tracks content categories for each school
CREATE TABLE school_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(school_id, category)
);

-- School summary table - stores aggregated statistics
CREATE TABLE school_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_schools INTEGER NOT NULL,
  total_images INTEGER NOT NULL,
  total_videos INTEGER NOT NULL,
  total_documents INTEGER NOT NULL,
  total_assets INTEGER NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- School contact info table - stores address and contact details
CREATE TABLE school_contact_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  address TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  full_address TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(school_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_schools_type ON schools(type);
CREATE INDEX idx_schools_city_state ON schools(city, state);
CREATE INDEX idx_marketing_assets_school_id ON marketing_assets(school_id);
CREATE INDEX idx_marketing_assets_file_type ON marketing_assets(file_type);
CREATE INDEX idx_marketing_assets_category ON marketing_assets(category);
CREATE INDEX idx_school_categories_school_id ON school_categories(school_id);
CREATE INDEX idx_school_contact_info_school_id ON school_contact_info(school_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_schools_updated_at 
  BEFORE UPDATE ON schools 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_assets_updated_at 
  BEFORE UPDATE ON marketing_assets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_school_contact_info_updated_at 
  BEFORE UPDATE ON school_contact_info 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_contact_info ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since this is marketing data)
CREATE POLICY "Schools are publicly readable" ON schools FOR SELECT USING (true);
CREATE POLICY "Marketing assets are publicly readable" ON marketing_assets FOR SELECT USING (true);
CREATE POLICY "School categories are publicly readable" ON school_categories FOR SELECT USING (true);
CREATE POLICY "School summary is publicly readable" ON school_summary FOR SELECT USING (true);
CREATE POLICY "School contact info is publicly readable" ON school_contact_info FOR SELECT USING (true);

-- Create policies for authenticated users to insert/update (for data migration)
CREATE POLICY "Authenticated users can insert schools" ON schools FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update schools" ON schools FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert marketing assets" ON marketing_assets FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update marketing assets" ON marketing_assets FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert school categories" ON school_categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert school summary" ON school_summary FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update school summary" ON school_summary FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert school contact info" ON school_contact_info FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update school contact info" ON school_contact_info FOR UPDATE USING (auth.role() = 'authenticated');

-- Create useful views for common queries
CREATE VIEW schools_with_assets AS
SELECT 
  s.*,
  COALESCE(asset_counts.image_count, 0) as image_count,
  COALESCE(asset_counts.video_count, 0) as video_count,
  COALESCE(asset_counts.document_count, 0) as document_count,
  COALESCE(asset_counts.total_asset_count, 0) as total_asset_count,
  sci.address,
  sci.zip_code,
  sci.phone,
  sci.email,
  sci.website,
  sci.full_address,
  sci.description
FROM schools s
LEFT JOIN (
  SELECT 
    school_id,
    COUNT(CASE WHEN file_type = 'image' THEN 1 END) as image_count,
    COUNT(CASE WHEN file_type = 'video' THEN 1 END) as video_count,
    COUNT(CASE WHEN file_type = 'document' THEN 1 END) as document_count,
    COUNT(*) as total_asset_count
  FROM marketing_assets 
  GROUP BY school_id
) asset_counts ON s.id = asset_counts.school_id
LEFT JOIN school_contact_info sci ON s.id = sci.school_id;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;