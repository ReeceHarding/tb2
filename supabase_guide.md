# Supabase Setup Guide for TimeBack Project

This guide will walk you through setting up your local environment to work with Reece's TimeBack Supabase project.

## Step 1: Create Environment Variables

Create a `.env.local` file in the root of your project and add these exact environment variables:

```bash
# Supabase Configuration for TimeBack Project
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
SUPABASE_DB_PASSWORD=your_supabase_database_password_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=your_nextauth_secret_here_use_openssl_rand_base64_32

# Google OAuth (if needed)
GOOGLE_ID=your_google_oauth_client_id_here
GOOGLE_SECRET=your_google_oauth_secret_here

# AI API Key (Cerebras - primary AI provider)
CEREBRAS_API_KEY=your_cerebras_api_key_here

# Legacy AI Keys (no longer required - using Cerebras for all AI)
# AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
# AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
# AWS_REGION=us-east-1
# OPENAI_API_KEY=your_openai_api_key_here
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
GENDER_API_KEY=your_gender_api_key_here

# SchoolDigger API
SCHOOLDIGGER_APP_ID=your_schooldigger_app_id_here
SCHOOLDIGGER_API_KEY=your_schooldigger_api_key_here
SCHOOLDIGGER_RATE_LIMIT_PER_MINUTE=45
SCHOOLDIGGER_RATE_DELAY_MS=50

# MongoDB (if used)
MONGODB_URI=your_mongodb_connection_string_here
```

## Step 2: Install Supabase CLI

If you don't have the Supabase CLI installed:

```bash
npm install -g supabase
```

## Step 3: Link to the TimeBack Project

1. **Log in to Supabase CLI:**
   ```bash
   supabase login
   ```
   This will open your browser to authenticate.

2. **Link to Reece's TimeBack project:**
   ```bash
   supabase link --project-ref igwtslivaqqgiswawdep
   ```

   **Project Details:**
   - Project Reference: `igwtslivaqqgiswawdep`  
   - Project Name: `reece.harding@superbuilders.school's Project`
   - Organization: Reece (qwyvjixxyibpgguygafq)
   - Region: West US (North California)

## Database Schema

The database contains several main table groups that support different features of the application:

### Table Overview (from CLI inspection)

```
Name                              | Table size | Index size | Total size | Estimated row count
----------------------------------|------------|------------|------------|--------------------
public.content                   | 6784 kB    | 6464 kB    | 13 MB      | 395                
public.transcriptions             | 3624 kB    | 3032 kB    | 6656 kB    | 396                
public.map_scores                 | 112 kB     | 336 kB     | 448 kB     | 800                
public.marketing_images           | 232 kB     | 48 kB      | 280 kB     | 121                
public.media                      | 136 kB     | 72 kB      | 208 kB     | 369                
public.testimonials               | 72 kB      | 104 kB     | 176 kB     | 30                 
public.students                   | 96 kB      | 72 kB      | 168 kB     | 309                
public.marketing_image_categories | 16 kB      | 32 kB      | 48 kB      | 7                  
public.time_commitments           | 8192 bytes | 24 kB      | 32 kB      | 0                  
public.grade_gaps                 | 8192 bytes | 24 kB      | 32 kB      | 0                  
public.daily_metrics              | 8192 bytes | 16 kB      | 24 kB      | 0                  
```

### Complete Database Schema

The schema consists of several feature groups:

#### 1. School Data Tables
These tables store information about schools, their marketing assets, and metadata:

```sql
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

-- School categories table
CREATE TABLE school_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(school_id, category)
);

-- School contact info table
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
```

#### 2. Student Journey Tables
These tables store TimeBack student data for the "Students Like Your Child" feature:

```sql
-- Students table - basic student information
CREATE TABLE students (
  id TEXT PRIMARY KEY, -- e.g., "Anon#450"
  campus TEXT NOT NULL,
  level TEXT NOT NULL, -- L1, L2, L3
  age_grade INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MAP test scores - standardized test results by term
CREATE TABLE map_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL, -- Reading, Math, Language, Science
  spring_prev_rit DECIMAL, -- Spring 23-24
  fall_rit DECIMAL,       -- Fall 24-25
  winter_rit DECIMAL,     -- Winter 24-25
  spring_rit DECIMAL,     -- Spring 24-25
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject)
);

-- Daily metrics - daily performance tracking
CREATE TABLE daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  subject TEXT NOT NULL,
  app TEXT, -- IXL, Khan Academy, Lalilo, etc.
  course TEXT,
  lessons_mastered INTEGER DEFAULT 0,
  essential_lessons_mastered INTEGER DEFAULT 0,
  correct_questions INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  accuracy DECIMAL,
  minutes DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date, subject, app)
);

-- Time commitments - how much time students spend per subject
CREATE TABLE time_commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  hours_worked DECIMAL,
  mins_per_weekday DECIMAL,
  daily_minutes_vs_target DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject)
);

-- Grade gaps - how far above/below grade level students work
CREATE TABLE grade_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  working_grade_gap INTEGER, -- positive = above grade level, negative = below
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject)
);
```

#### 3. Video System Tables

```sql
-- Video categories table
CREATE TABLE video_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Videos table  
CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url TEXT,
  video_url TEXT NOT NULL,
  duration INTEGER DEFAULT 0,
  platform VARCHAR(50),
  platform_id VARCHAR(255),
  category_id UUID REFERENCES video_categories(id),
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  original_media_id UUID,
  file_status VARCHAR(20) DEFAULT 'available'
);
```

#### 4. Testimonials Table

```sql
-- Testimonials table for video testimonial data
CREATE TABLE testimonials (
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
```

### Key Features

- **Row Level Security (RLS)** is enabled on all tables
- **Public read access** for most data (since it's marketing/educational content)
- **Authenticated user access** for insert/update operations
- **Automatic timestamps** with triggers for updated_at fields
- **Comprehensive indexing** for query performance
- **Foreign key constraints** to maintain data integrity

### CLI Commands for Schema Inspection

Once your project is linked, you can use these commands to inspect the schema:

```bash
# Get table statistics
supabase inspect db table-stats

# Get index information
supabase inspect db index-stats

# Show table sizes and usage
supabase inspect db table-stats --output json
```

## Step 4: Verify Your Setup

Once you've completed the above steps, verify everything is working:

1. **Check if your project is linked:**
   ```bash
   supabase status
   ```

2. **Test database connection:**
   ```bash
   supabase inspect db table-stats
   ```
   You should see a list of tables including: `content`, `transcriptions`, `map_scores`, `marketing_images`, `media`, `testimonials`, `students`, etc.

3. **Test your environment variables:**
   Create a simple test file to verify your connection works in your application.

## Troubleshooting

- **If linking fails:** Make sure you're logged into the correct Supabase account (`reece.harding@superbuilders.school`)
- **If table-stats fails:** Double-check your environment variables match exactly what's shown above
- **If you get permission errors:** You may need Reece to grant you access to the project

## What's Next?

After setup, you'll have access to:
- **Student Journey Data**: 309 anonymized student profiles with learning analytics
- **School Marketing Content**: 121 marketing images from various Alpha Schools
- **Video Content**: Testimonials and promotional videos
- **Transcription Data**: 396 processed transcriptions
- **Educational Analytics**: MAP scores, daily metrics, and learning progress data

You're now ready to work with the TimeBack Supabase backend!
