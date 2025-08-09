# Supabase Tables Setup Guide

## Overview

This guide provides instructions for setting up the required Supabase tables for the Progressive AI Content System.

## Required Tables

The following tables need to be created in your Supabase database:

1. **user_profiles** - Stores user profile information for personalization
2. **section_data** - Stores user-specific data for each content section
3. **generated_content** - Stores AI-generated content for each section
4. **journeys** - Stores shareable learning journeys

## Setup Instructions

### Option 1: Using Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard at https://app.supabase.com
2. Navigate to the **SQL Editor** section
3. Copy the entire contents of `scripts/create-supabase-tables.sql`
4. Paste it into the SQL editor
5. Click **Run** to execute the script
6. You should see a success message and the tables will be created

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# From the project root directory
supabase db push scripts/create-supabase-tables.sql
```

### Option 3: Using the Automated Setup Script

We've created an automated setup script that uses the Supabase Management API:

```bash
# Set up your Supabase Service Role Key (from .env.local)
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run the automated setup
npx tsx scripts/setup-supabase-tables.ts
```

## Verification

After creating the tables, verify they were created successfully:

```bash
npx tsx scripts/verify-supabase-tables.ts
```

You should see:
```
✅ user_profiles - EXISTS
✅ section_data - EXISTS
✅ generated_content - EXISTS
✅ journeys - EXISTS
```

## Table Schemas

### user_profiles
- `id` (UUID, Primary Key)
- `email` (Text, Unique, Not Null)
- `name` (Text)
- `phone` (Text)
- `parent_type` (Text)
- `kids_interests` (Text Array)
- `selected_grade` (Text)
- `school_name` (Text)
- `school_city` (Text)
- `school_state` (Text)
- `created_at` (Timestamp with timezone)
- `updated_at` (Timestamp with timezone)

### section_data
- `id` (UUID, Primary Key)
- `user_email` (Text, Not Null)
- `section_id` (Text, Not Null)
- `data` (JSONB, Not Null)
- `created_at` (Timestamp with timezone)
- `updated_at` (Timestamp with timezone)
- Unique constraint on (user_email, section_id)

### generated_content
- `id` (UUID, Primary Key)
- `user_email` (Text, Not Null)
- `section_id` (Text, Not Null)
- `response` (JSONB, Not Null)
- `prompt` (Text, Not Null)
- `schema` (JSONB, Not Null)
- `created_at` (Timestamp with timezone)
- `updated_at` (Timestamp with timezone)

### journeys
- `id` (UUID, Primary Key)
- `user_email` (Text, Not Null)
- `share_id` (Text, Unique)
- `title` (Text, Not Null)
- `sections` (Text Array)
- `metadata` (JSONB)
- `created_at` (Timestamp with timezone)
- `updated_at` (Timestamp with timezone)

## Row Level Security (RLS)

All tables have RLS enabled with basic policies that allow:
- Users to view their own data
- Users to create their own data
- Users to update their own data
- Public viewing of shared journeys

**Note**: You may want to customize these policies based on your specific authentication setup.

## Next Steps

After successfully creating the tables:

1. The Progressive AI Content System will automatically start using Supabase for data persistence
2. User data will be stored both locally and in Supabase
3. The unified data service will handle synchronization
4. Journey sharing features will be fully functional

## Troubleshooting

If you encounter issues:

1. **Permission Errors**: Ensure you're using the correct Supabase project URL and keys
2. **Table Already Exists**: The script uses `IF NOT EXISTS` clauses, so it's safe to run multiple times
3. **RLS Issues**: If you can't access data, check the RLS policies in the Supabase dashboard

## Environment Variables

Ensure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```