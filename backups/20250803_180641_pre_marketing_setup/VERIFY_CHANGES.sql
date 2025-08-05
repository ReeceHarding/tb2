-- Verification Script for Marketing Setup Changes
-- Run this in Supabase SQL Editor to check if tables were created successfully

-- Check if marketing_image_categories table exists and has data
SELECT 'marketing_image_categories' as table_name, count(*) as row_count 
FROM marketing_image_categories;

-- Check if marketing_images table exists
SELECT 'marketing_images' as table_name, count(*) as row_count 
FROM marketing_images;

-- List all categories that were inserted
SELECT name, description, color, created_at 
FROM marketing_image_categories 
ORDER BY created_at;

-- Check table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('marketing_image_categories', 'marketing_images')
ORDER BY table_name, ordinal_position;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('marketing_image_categories', 'marketing_images');

-- Test API access (shows if policies work correctly)
-- This should return data if everything is set up correctly
SELECT 'API test' as test_type, 'Categories accessible' as result
FROM marketing_image_categories 
LIMIT 1;

SELECT 'API test' as test_type, 'Images table accessible' as result  
FROM marketing_images
LIMIT 1;