#!/usr/bin/env node

/**
 * Direct Supabase Table Setup
 * 
 * Creates tables directly using Supabase client methods
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('[Setup] Starting direct table creation...\n');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

console.log('✅ Supabase URL:', supabaseUrl);
console.log('✅ Service role key configured\n');

// Create admin client
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTables() {
  console.log('[Setup] Creating tables and sample data...\n');
  
  try {
    // First, let's try to insert sample categories directly
    console.log('[Setup] Inserting video categories...');
    
    const categories = [
      { name: 'How It Works', description: 'Understanding TimeBack methodology and AI personalization', color: '#3B82F6' },
      { name: 'Success Stories', description: 'Real results and testimonials from families', color: '#10B981' },
      { name: 'Research', description: 'The science and research behind our learning methods', color: '#8B5CF6' },
      { name: 'Getting Started', description: 'Onboarding and setup guides for new families', color: '#F59E0B' },
      { name: 'Student Spotlights', description: 'Individual student achievements and journeys', color: '#EC4899' }
    ];
    
    // If inserting fails because table doesn't exist, we'll know the tables need creation
    const { data: catData, error: catError } = await supabase
      .from('video_categories')
      .upsert(categories, { onConflict: 'name' })
      .select();
    
    if (catError) {
      if (catError.code === '42P01') {
        console.log('❌ Tables do not exist, need to create them via SQL');
        throw new Error('Tables need to be created manually via Supabase SQL Editor');
      } else {
        console.error('❌ Error inserting categories:', catError);
        throw catError;
      }
    } else {
      console.log(`✅ Successfully inserted ${catData.length} categories`);
    }
    
    // Insert sample videos
    console.log('[Setup] Inserting sample videos...');
    
    const videos = [
      {
        title: 'How TimeBack Personalizes Learning',
        description: 'Discover how our AI adapts to each student\'s unique learning style, interests, and pace. See real examples of personalized content generation in action.',
        thumbnail_url: '/images/testimonials/sarah-chen-video.jpg',
        video_url: '/demo-video.mp4',
        duration: 180,
        category: 'How It Works',
        tags: ['personalization', 'AI', 'learning', 'adaptive'],
        is_featured: true
      },
      {
        title: 'Student Success: From Struggling to Thriving',
        description: 'Meet Sarah, a 7th grader who went from hating math to completing algebra in just 3 months. Her mother shares their incredible TimeBack journey.',
        thumbnail_url: '/images/testimonials/david-kim-video.jpg',
        video_url: '/demo-video.mp4',
        duration: 240,
        category: 'Success Stories',
        tags: ['testimonials', 'success', 'mathematics', 'transformation'],
        is_featured: true
      },
      {
        title: 'The Science Behind Mastery Learning',
        description: 'Explore the peer-reviewed research that powers our 2x faster learning results. Learn about Bloom\'s 2-Sigma Problem and how we solve it.',
        thumbnail_url: '/images/testimonials/maria-garcia-video.jpg',
        video_url: '/demo-video.mp4',
        duration: 300,
        category: 'Research',
        tags: ['research', 'mastery', 'science', 'bloom', 'pedagogy'],
        is_featured: true
      },
      {
        title: 'Getting Started: Your First Week',
        description: 'A step-by-step guide for new families. Learn how to set up your child\'s profile, understand the dashboard, and get the most from TimeBack.',
        thumbnail_url: '/images/testimonials/priya-patel-video.jpg',
        video_url: '/demo-video.mp4',
        duration: 360,
        category: 'Getting Started',
        tags: ['onboarding', 'setup', 'tutorial', 'parents'],
        is_featured: true
      },
      {
        title: 'Student Spotlight: 10-Year-Old Coding Prodigy',
        description: 'Watch Marcus, age 10, explain the video game he created after just 2 months of TimeBack coding lessons. His passion for programming is infectious!',
        thumbnail_url: '/images/testimonials/nicole-smith-video.jpg',
        video_url: '/demo-video.mp4',
        duration: 195,
        category: 'Student Spotlights',
        tags: ['coding', 'programming', 'creativity', 'young-learner'],
        is_featured: true
      }
    ];
    
    const { data: vidData, error: vidError } = await supabase
      .from('videos')
      .upsert(videos, { onConflict: 'title' })
      .select();
    
    if (vidError) {
      console.error('❌ Error inserting videos:', vidError);
      throw vidError;
    } else {
      console.log(`✅ Successfully inserted ${vidData.length} videos`);
    }
    
    console.log('\n🎉 Database setup completed successfully!');
    return true;
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    return false;
  }
}

async function testConnection() {
  console.log('[Test] Testing database connection...\n');
  
  try {
    // Try to query categories
    const { data: categories, error: catError } = await supabase
      .from('video_categories')
      .select('*')
      .limit(1);
    
    if (catError) {
      if (catError.code === '42P01') {
        console.log('❌ video_categories table does not exist');
        console.log('\n📋 MANUAL SETUP REQUIRED:');
        console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
        console.log('2. Navigate to your project: https://supabase.com/dashboard/project/igwtslivaqqgiswawdep');
        console.log('3. Go to SQL Editor');
        console.log('4. Copy and paste the contents of supabase-schema.sql');
        console.log('5. Click "Run" to execute the SQL');
        console.log('6. Then run this script again: node scripts/setup-tables-direct.js');
        return false;
      } else {
        console.error('❌ Database connection error:', catError);
        return false;
      }
    }
    
    console.log('✅ video_categories table exists');
    
    // Try to query videos
    const { data: videos, error: vidError } = await supabase
      .from('videos')
      .select('*')
      .limit(1);
      
    if (vidError) {
      console.error('❌ videos table error:', vidError);
      return false;
    }
    
    console.log('✅ videos table exists');
    console.log(`✅ Found ${categories.length} categories and ${videos.length} videos`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
}

async function main() {
  const connected = await testConnection();
  
  if (!connected) {
    console.log('\nPlease create the tables manually first, then run this script to add sample data.');
    process.exit(1);
  }
  
  const success = await createTables();
  
  if (success) {
    console.log('\n✅ All done! Your video gallery should now work.');
    console.log('\nNext step: Start your dev server and check http://localhost:3000');
  } else {
    process.exit(1);
  }
}

main();