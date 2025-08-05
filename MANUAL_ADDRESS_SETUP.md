# Manual Address Setup Instructions

## Step 1: Add Address Columns to Supabase Database

You need to run this SQL in your Supabase SQL Editor manually:

```sql
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
COMMENT ON COLUMN marketing_images.school_state IS 'State where the school is located';
COMMENT ON COLUMN marketing_images.school_zip IS 'ZIP code of the school';
COMMENT ON COLUMN marketing_images.school_phone IS 'Phone number of the school';
COMMENT ON COLUMN marketing_images.school_email IS 'Email address of the school';
COMMENT ON COLUMN marketing_images.school_website IS 'Website URL of the school';

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'marketing_images' 
AND column_name LIKE 'school_%'
ORDER BY column_name;
```

## Step 2: After Running the SQL Above

Once you've added the columns in Supabase, run this command to populate the address data:

```bash
node populate-address-data.js
```

## Step 3: Test the Integration

After populating the data, test it with:

```bash
curl -s "http://localhost:3000/api/marketing-images?schoolId=alpha-austin&limit=1" | jq '.images[0] | {school_name, school_address, school_phone, school_website}'
```

You should see the address information populated in the response.

---

## Why Manual Setup is Required

Supabase doesn't allow DDL (Data Definition Language) operations like `ALTER TABLE` through the JavaScript client library for security reasons. These operations must be performed directly in the Supabase SQL Editor with admin privileges.

Once the schema is updated, the JavaScript client can perform DML (Data Manipulation Language) operations like `INSERT`, `UPDATE`, and `SELECT` to populate and retrieve the address data.