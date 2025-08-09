-- Migration: Create core user system tables for quiz and personalization functionality
-- Date: 2025-08-07

-- 1. Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create section_data table for quiz responses and user data
CREATE TABLE IF NOT EXISTS section_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL, -- Maps to userId in the interface
  "sectionId" TEXT NOT NULL, -- Maps to sectionType in the interface (quoted for case sensitivity)
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_email, "sectionId")
);

-- 3. Create generated_content table for AI responses
CREATE TABLE IF NOT EXISTS generated_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL, -- Maps to userId in the interface
  "sectionId" TEXT NOT NULL, -- Maps to sectionType in the interface
  content JSONB NOT NULL,
  metadata JSONB DEFAULT '{}', -- Stores prompt and schema
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create journeys table for user learning paths
CREATE TABLE IF NOT EXISTS journeys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL, -- Maps to userId in the interface
  title TEXT NOT NULL,
  sections TEXT[] DEFAULT '{}', -- Array of content IDs
  "shareId" TEXT, -- Maps to sharedUrl in the interface
  metadata JSONB DEFAULT '{}', -- Stores isPublic and other data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_section_data_user_email ON section_data(user_email);
CREATE INDEX IF NOT EXISTS idx_section_data_section_id ON section_data("sectionId");
CREATE INDEX IF NOT EXISTS idx_generated_content_user_email ON generated_content(user_email);
CREATE INDEX IF NOT EXISTS idx_generated_content_section_id ON generated_content("sectionId");
CREATE INDEX IF NOT EXISTS idx_journeys_user_email ON journeys(user_email);
CREATE INDEX IF NOT EXISTS idx_journeys_share_id ON journeys("shareId");

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_section_data_updated_at
BEFORE UPDATE ON section_data
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journeys_updated_at
BEFORE UPDATE ON journeys
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE journeys ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
FOR SELECT USING (auth.email() = email);

CREATE POLICY "Users can create their own profile" ON user_profiles
FOR INSERT WITH CHECK (auth.email() = email);

CREATE POLICY "Users can update their own profile" ON user_profiles
FOR UPDATE USING (auth.email() = email);

-- Create policies for section_data
CREATE POLICY "Users can view their own section data" ON section_data
FOR SELECT USING (auth.email() = user_email);

CREATE POLICY "Users can create their own section data" ON section_data
FOR INSERT WITH CHECK (auth.email() = user_email);

CREATE POLICY "Users can update their own section data" ON section_data
FOR UPDATE USING (auth.email() = user_email);

-- Create policies for generated_content
CREATE POLICY "Users can view their own generated content" ON generated_content
FOR SELECT USING (auth.email() = user_email);

CREATE POLICY "Users can create their own generated content" ON generated_content
FOR INSERT WITH CHECK (auth.email() = user_email);

-- Create policies for journeys
CREATE POLICY "Users can view their own journeys" ON journeys
FOR SELECT USING (auth.email() = user_email);

CREATE POLICY "Public can view shared journeys" ON journeys
FOR SELECT USING ("shareId" IS NOT NULL AND (metadata->>'isPublic')::boolean = true);

CREATE POLICY "Users can create their own journeys" ON journeys
FOR INSERT WITH CHECK (auth.email() = user_email);

CREATE POLICY "Users can update their own journeys" ON journeys
FOR UPDATE USING (auth.email() = user_email);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON user_profiles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON section_data TO anon, authenticated;
GRANT SELECT, INSERT ON generated_content TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON journeys TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE user_profiles IS 'Stores user profile information for personalization';
COMMENT ON TABLE section_data IS 'Stores user responses and data by section type';
COMMENT ON TABLE generated_content IS 'Stores AI-generated content for users';
COMMENT ON TABLE journeys IS 'Stores user learning journeys and shared content';

-- Verify tables were created
SELECT 
  table_name,
  'Table created successfully' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'section_data', 'generated_content', 'journeys');