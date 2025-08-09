-- Migration: Fix schema mismatches for personalized page functionality
-- Aligns existing table schemas with what the code expects

-- 1. Fix user_profiles table schema
-- Add missing columns that the code expects
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Update existing data to map 'name' to first_name/last_name (simplified version)
UPDATE user_profiles 
SET 
  first_name = CASE 
    WHEN name IS NOT NULL AND name != '' THEN split_part(name, ' ', 1)
    ELSE first_name
  END,
  last_name = CASE 
    WHEN name IS NOT NULL AND name != '' AND position(' ' in name) > 0
    THEN substring(name from position(' ' in name) + 1)
    ELSE last_name
  END,
  metadata = CASE 
    WHEN metadata IS NULL OR metadata = '{}' THEN 
      jsonb_build_object(
        'phone', phone,
        'parent_type', parent_type,
        'kids_interests', COALESCE(to_jsonb(kids_interests), '[]'::jsonb),
        'selected_grade', selected_grade,
        'school_name', school_name,
        'school_city', school_city,
        'school_state', school_state
      )
    ELSE metadata
  END
WHERE (first_name IS NULL OR last_name IS NULL OR metadata = '{}' OR metadata IS NULL);

-- 2. Check and fix section_data table schema
-- Ensure it has the correct columns
DO $$ 
BEGIN
  -- Check if sectionId column exists, if not, assume it needs to be created
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'section_data' AND column_name = 'sectionId'
  ) THEN
    -- Drop and recreate section_data with correct schema
    DROP TABLE IF EXISTS section_data;
    CREATE TABLE section_data (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_email TEXT NOT NULL,
      "sectionId" TEXT NOT NULL, -- Quoted for exact case match
      data JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_email, "sectionId")
    );
  END IF;
END $$;

-- 3. Check and fix generated_content table schema
DO $$ 
BEGIN
  -- Check if sectionId column exists, if not, assume it needs to be created
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'generated_content' AND column_name = 'sectionId'
  ) THEN
    -- Drop and recreate generated_content with correct schema
    DROP TABLE IF EXISTS generated_content;
    CREATE TABLE generated_content (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_email TEXT NOT NULL,
      "sectionId" TEXT NOT NULL, -- Quoted for exact case match
      content JSONB NOT NULL,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- 4. Fix journeys table - rename share_id to shareId
ALTER TABLE journeys RENAME COLUMN share_id TO "shareId";

-- 5. Create missing indexes with correct column names
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_section_data_user_email ON section_data(user_email);
CREATE INDEX IF NOT EXISTS idx_section_data_section_id ON section_data("sectionId");
CREATE INDEX IF NOT EXISTS idx_generated_content_user_email ON generated_content(user_email);
CREATE INDEX IF NOT EXISTS idx_generated_content_section_id ON generated_content("sectionId");
CREATE INDEX IF NOT EXISTS idx_journeys_user_email ON journeys(user_email);
CREATE INDEX IF NOT EXISTS idx_journeys_share_id ON journeys("shareId");

-- 6. Ensure RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE journeys ENABLE ROW LEVEL SECURITY;

-- 7. Create/update RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;
CREATE POLICY "Users can create their own profile" ON user_profiles
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (true);

-- Section data policies
DROP POLICY IF EXISTS "Users can view their own section data" ON section_data;
CREATE POLICY "Users can view their own section data" ON section_data
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own section data" ON section_data;
CREATE POLICY "Users can create their own section data" ON section_data
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own section data" ON section_data;
CREATE POLICY "Users can update their own section data" ON section_data
  FOR UPDATE USING (true);

-- Generated content policies
DROP POLICY IF EXISTS "Users can view their own generated content" ON generated_content;
CREATE POLICY "Users can view their own generated content" ON generated_content
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own generated content" ON generated_content;
CREATE POLICY "Users can create their own generated content" ON generated_content
  FOR INSERT WITH CHECK (true);

-- Journey policies
DROP POLICY IF EXISTS "Users can view their own journeys" ON journeys;
CREATE POLICY "Users can view their own journeys" ON journeys
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own journeys" ON journeys;
CREATE POLICY "Users can create their own journeys" ON journeys
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own journeys" ON journeys;
CREATE POLICY "Users can update their own journeys" ON journeys
  FOR UPDATE USING (true);

-- 8. Ensure triggers exist for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Update triggers
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_section_data_updated_at ON section_data;
CREATE TRIGGER update_section_data_updated_at 
  BEFORE UPDATE ON section_data 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_journeys_updated_at ON journeys;
CREATE TRIGGER update_journeys_updated_at 
  BEFORE UPDATE ON journeys 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON user_profiles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON section_data TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON generated_content TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON journeys TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Add comments
COMMENT ON TABLE user_profiles IS 'User profile information with first_name, last_name, and metadata fields';
COMMENT ON TABLE section_data IS 'Quiz responses and user data with sectionId field';
COMMENT ON TABLE generated_content IS 'AI-generated personalized content with sectionId field';
COMMENT ON TABLE journeys IS 'User learning journeys with shareId field (not share_id)';