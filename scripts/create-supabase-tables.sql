-- Create Supabase tables for Progressive AI Content System
-- Run this script in the Supabase SQL Editor

-- 1. Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  parent_type TEXT,
  kids_interests TEXT[],
  selected_grade TEXT,
  school_name TEXT,
  school_city TEXT,
  school_state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- 2. Create section_data table
CREATE TABLE IF NOT EXISTS section_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  section_id TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_email, section_id)
);

-- Create indexes for section_data
CREATE INDEX IF NOT EXISTS idx_section_data_email ON section_data(user_email);
CREATE INDEX IF NOT EXISTS idx_section_data_section ON section_data(section_id);

-- 3. Create generated_content table
CREATE TABLE IF NOT EXISTS generated_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  section_id TEXT NOT NULL,
  response JSONB NOT NULL,
  prompt TEXT NOT NULL,
  schema JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for generated_content
CREATE INDEX IF NOT EXISTS idx_generated_content_email ON generated_content(user_email);
CREATE INDEX IF NOT EXISTS idx_generated_content_section ON generated_content(section_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_email_section ON generated_content(user_email, section_id);

-- 4. Create journeys table
CREATE TABLE IF NOT EXISTS journeys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  share_id TEXT UNIQUE,
  title TEXT NOT NULL,
  sections TEXT[],
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for journeys
CREATE INDEX IF NOT EXISTS idx_journeys_email ON journeys(user_email);
CREATE INDEX IF NOT EXISTS idx_journeys_share_id ON journeys(share_id);

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
DO $$
BEGIN
  -- User profiles trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_profiles_updated_at') THEN
    CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE
      ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Section data trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_section_data_updated_at') THEN
    CREATE TRIGGER update_section_data_updated_at BEFORE UPDATE
      ON section_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Generated content trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_generated_content_updated_at') THEN
    CREATE TRIGGER update_generated_content_updated_at BEFORE UPDATE
      ON generated_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Journeys trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_journeys_updated_at') THEN
    CREATE TRIGGER update_journeys_updated_at BEFORE UPDATE
      ON journeys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE journeys ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for now - adjust based on your auth setup)
-- You may want to restrict these based on authenticated user's email

-- Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own profile" ON user_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (true);

-- Policies for section_data
CREATE POLICY "Users can view their own section data" ON section_data
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own section data" ON section_data
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own section data" ON section_data
  FOR UPDATE USING (true);

-- Policies for generated_content
CREATE POLICY "Users can view their own generated content" ON generated_content
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own generated content" ON generated_content
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own generated content" ON generated_content
  FOR UPDATE USING (true);

-- Policies for journeys
CREATE POLICY "Users can view all journeys" ON journeys
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own journeys" ON journeys
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own journeys" ON journeys
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own journeys" ON journeys
  FOR DELETE USING (true);

-- Add some helpful comments
COMMENT ON TABLE user_profiles IS 'Stores user profile information for personalization';
COMMENT ON TABLE section_data IS 'Stores user-specific data for each content section';
COMMENT ON TABLE generated_content IS 'Stores AI-generated content for each section';
COMMENT ON TABLE journeys IS 'Stores shareable learning journeys';

-- Verify tables were created
SELECT table_name, obj_description(oid, 'pg_class') as comment
FROM information_schema.tables
JOIN pg_class ON relname = table_name
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'section_data', 'generated_content', 'journeys')
ORDER BY table_name;