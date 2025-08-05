-- Supabase Schema for Video Gallery
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Create video_categories table
CREATE TABLE IF NOT EXISTS video_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color code
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  video_url TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 0, -- Duration in seconds
  category VARCHAR(255) NOT NULL,
  tags TEXT[] DEFAULT '{}', -- Array of tags
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  is_featured BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  
  -- Foreign key constraint
  CONSTRAINT fk_video_category 
    FOREIGN KEY (category) 
    REFERENCES video_categories(name) 
    ON UPDATE CASCADE 
    ON DELETE RESTRICT
);

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(video_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE videos 
  SET view_count = view_count + 1,
      updated_at = TIMEZONE('utc'::text, NOW())
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_videos_updated_at 
  BEFORE UPDATE ON videos 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample categories
INSERT INTO video_categories (name, description, color) VALUES
  ('How It Works', 'Understanding TimeBack methodology and AI personalization', '#3B82F6'),
  ('Success Stories', 'Real results and testimonials from families', '#10B981'),
  ('Research', 'The science and research behind our learning methods', '#8B5CF6'),
  ('Getting Started', 'Onboarding and setup guides for new families', '#F59E0B'),
  ('Student Spotlights', 'Individual student achievements and journeys', '#EC4899')
ON CONFLICT (name) DO NOTHING;

-- Insert sample videos (replace URLs with your actual video and thumbnail URLs)
INSERT INTO videos (title, description, thumbnail_url, video_url, duration, category, tags) VALUES
  (
    'How TimeBack Personalizes Learning',
    'Discover how our AI adapts to each student''s unique learning style, interests, and pace. See real examples of personalized content generation in action.',
    '/images/testimonials/sarah-chen-video.jpg',
    '/demo-video.mp4',
    180,
    'How It Works',
    ARRAY['personalization', 'AI', 'learning', 'adaptive']
  ),
  (
    'Student Success: From Struggling to Thriving',
    'Meet Sarah, a 7th grader who went from hating math to completing algebra in just 3 months. Her mother shares their incredible TimeBack journey.',
    '/images/testimonials/david-kim-video.jpg',
    '/demo-video.mp4',
    240,
    'Success Stories',
    ARRAY['testimonials', 'success', 'mathematics', 'transformation']
  ),
  (
    'The Science Behind Mastery Learning',
    'Explore the peer-reviewed research that powers our 2x faster learning results. Learn about Bloom''s 2-Sigma Problem and how we solve it.',
    '/images/testimonials/maria-garcia-video.jpg',
    '/demo-video.mp4',
    300,
    'Research',
    ARRAY['research', 'mastery', 'science', 'bloom', 'pedagogy']
  ),
  (
    'Getting Started: Your First Week',
    'A step-by-step guide for new families. Learn how to set up your child''s profile, understand the dashboard, and get the most from TimeBack.',
    '/images/testimonials/priya-patel-video.jpg',
    '/demo-video.mp4',
    360,
    'Getting Started',
    ARRAY['onboarding', 'setup', 'tutorial', 'parents']
  ),
  (
    'Student Spotlight: 10-Year-Old Coding Prodigy',
    'Watch Marcus, age 10, explain the video game he created after just 2 months of TimeBack coding lessons. His passion for programming is infectious!',
    '/images/testimonials/nicole-smith-video.jpg',
    '/demo-video.mp4',
    195,
    'Student Spotlights',
    ARRAY['coding', 'programming', 'creativity', 'young-learner']
  )
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE video_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can view video categories" ON video_categories
  FOR SELECT USING (true);

CREATE POLICY "Public can view featured videos" ON videos
  FOR SELECT USING (is_featured = true);

-- Create policy to allow updating view count
CREATE POLICY "Anyone can increment view count" ON videos
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_featured ON videos(is_featured);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at);
CREATE INDEX IF NOT EXISTS idx_videos_view_count ON videos(view_count);
CREATE INDEX IF NOT EXISTS idx_videos_tags ON videos USING GIN(tags);

-- Create view for video statistics (optional)
CREATE OR REPLACE VIEW video_stats AS
SELECT 
  c.name as category,
  COUNT(v.*) as video_count,
  AVG(v.duration) as avg_duration,
  SUM(v.view_count) as total_views
FROM video_categories c
LEFT JOIN videos v ON c.name = v.category AND v.is_featured = true
GROUP BY c.name
ORDER BY c.name;