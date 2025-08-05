-- Add Address Information to Marketing Images Table
-- Copy this script and run it in Supabase SQL Editor

-- Add address columns to marketing_images table
ALTER TABLE marketing_images 
ADD COLUMN IF NOT EXISTS school_address TEXT,
ADD COLUMN IF NOT EXISTS school_city TEXT,
ADD COLUMN IF NOT EXISTS school_state TEXT,
ADD COLUMN IF NOT EXISTS school_zip TEXT,
ADD COLUMN IF NOT EXISTS school_phone TEXT,
ADD COLUMN IF NOT EXISTS school_email TEXT,
ADD COLUMN IF NOT EXISTS school_website TEXT;

-- Create index for address-based queries
CREATE INDEX IF NOT EXISTS idx_marketing_images_location 
ON marketing_images(school_city, school_state);

-- Create index for state-based filtering
CREATE INDEX IF NOT EXISTS idx_marketing_images_state 
ON marketing_images(school_state);

-- Add comments to document the new columns
COMMENT ON COLUMN marketing_images.school_address IS 'Street address of the school';
COMMENT ON COLUMN marketing_images.school_city IS 'City where the school is located';
COMMENT ON COLUMN marketing_images.school_state IS 'State abbreviation (e.g., TX, CA, FL)';
COMMENT ON COLUMN marketing_images.school_zip IS 'ZIP/postal code';
COMMENT ON COLUMN marketing_images.school_phone IS 'Primary phone number';
COMMENT ON COLUMN marketing_images.school_email IS 'Primary email contact';
COMMENT ON COLUMN marketing_images.school_website IS 'Official school website URL';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'marketing_images' 
  AND column_name LIKE 'school_%'
ORDER BY ordinal_position;