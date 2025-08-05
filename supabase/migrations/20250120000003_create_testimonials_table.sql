-- Create testimonials table for storing video testimonial data
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  student_name TEXT,
  student_age INTEGER,
  student_grade TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  local_video_path TEXT,
  transcription TEXT NOT NULL,
  marketing_copy JSONB,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  video_width INTEGER,
  video_height INTEGER,
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster querying
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_display_order ON testimonials(display_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_view_count ON testimonials(view_count DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Create policies for testimonials table
CREATE POLICY "Public can view testimonials" ON testimonials
  FOR SELECT USING (true);

-- Create policy for authenticated users to insert/update testimonials
CREATE POLICY "Authenticated users can manage testimonials" ON testimonials
  FOR ALL USING (auth.role() = 'authenticated');

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_testimonials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_testimonials_updated_at_trigger
  BEFORE UPDATE ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_testimonials_updated_at();