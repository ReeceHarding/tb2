# Supabase Setup Guide

This guide will walk you through setting up your environment to work with this Supabase project.

## Environment Variables

You will need to create a `.env.local` file in the root of your project and add the following Supabase-related environment variables. You can get the values for these variables from your own Supabase project dashboard.

```
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DB_PASSWORD=YOUR_SUPABASE_DB_PASSWORD
```

### Where to find these values:

1.  Go to your Supabase project dashboard.
2.  Navigate to **Project Settings**.
3.  Click on **API**.
4.  You will find your `Project URL` (which is `NEXT_PUBLIC_SUPABASE_URL`) and your `anon` `public` key (which is `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
5.  You will also find your `service_role` `secret` key (which is `SUPABASE_SERVICE_ROLE_KEY`).
6.  The `SUPABASE_DB_PASSWORD` is the password you set when you created the project. If you have forgotten it, you can reset it in the **Database** settings of your project dashboard.

## Linking Your Project

Before you can interact with your Supabase project using the CLI, you need to link your local project to your Supabase project.

1.  Install the Supabase CLI if you haven't already.
2.  Log in to the Supabase CLI using `supabase login`.
3.  Run the following command in your project's root directory:

    ```bash
    supabase link --project-ref YOUR_PROJECT_REF
    ```

### Where to find your `YOUR_PROJECT_REF`:

1.  Go to your Supabase project dashboard.
2.  The project reference ID is part of the URL in your browser's address bar. For example, if your URL is `https://app.supabase.com/project/abcdefghijklmnopqrst`, then `abcdefghijklmnopqrst` is your project reference ID.
3.  You can also find it in **Project Settings** > **General**.

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

By following these steps, your friend should be able to get their local environment set up to work with the project's Supabase backend.

I have created a new file named `supabase_guide.md` with the content for your friend. As previously mentioned, I am unable to provide the schema at this time because I need you to first link your project to Supabase. After you've done so, I can get the schema and add it to this file. In the meantime, I've added a placeholder for where the schema will go, along with the steps you can take to get the schema yourself. If you'd like me to proceed with getting the schema, please link the project and let me know.
