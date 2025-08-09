-- Create Supabase tables for Progressive AI Content System
-- Fixed version with correct column names matching the application code

-- 1. Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  firstName TEXT,
  lastName TEXT,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- 2. Create section_data table
CREATE TABLE IF NOT EXISTS section_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  userId UUID NOT NULL,
  sectionId TEXT NOT NULL,
  data JSONB NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(userId, sectionId)
);

-- Create indexes for section_data
CREATE INDEX IF NOT EXISTS idx_section_data_userId ON section_data(userId);
CREATE INDEX IF NOT EXISTS idx_section_data_section ON section_data(sectionId);

-- 3. Create generated_content table
CREATE TABLE IF NOT EXISTS generated_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  userId UUID NOT NULL,
  sectionId TEXT NOT NULL,
  content JSONB NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for generated_content
CREATE INDEX IF NOT EXISTS idx_generated_content_userId ON generated_content(userId);
CREATE INDEX IF NOT EXISTS idx_generated_content_section ON generated_content(sectionId);

-- 4. Create journeys table
CREATE TABLE IF NOT EXISTS journeys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  userId UUID NOT NULL,
  shareId TEXT UNIQUE,
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}'::jsonb,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for journeys
CREATE INDEX IF NOT EXISTS idx_journeys_userId ON journeys(userId);
CREATE INDEX IF NOT EXISTS idx_journeys_shareId ON journeys(shareId);

-- Enable Row Level Security on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE journeys ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (true);

-- Create policies for section_data
CREATE POLICY "Users can view all section data" ON section_data
  FOR SELECT USING (true);

CREATE POLICY "Users can insert section data" ON section_data
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update section data" ON section_data
  FOR UPDATE USING (true);

-- Create policies for generated_content
CREATE POLICY "Users can view all generated content" ON generated_content
  FOR SELECT USING (true);

CREATE POLICY "Users can insert generated content" ON generated_content
  FOR INSERT WITH CHECK (true);

-- Create policies for journeys
CREATE POLICY "Users can view all journeys" ON journeys
  FOR SELECT USING (true);

CREATE POLICY "Users can insert journeys" ON journeys
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update journeys" ON journeys
  FOR UPDATE USING (true);

-- Create function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updatedAt
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE
    ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_section_data_updated_at BEFORE UPDATE
    ON section_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_content_updated_at BEFORE UPDATE
    ON generated_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journeys_updated_at BEFORE UPDATE
    ON journeys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();