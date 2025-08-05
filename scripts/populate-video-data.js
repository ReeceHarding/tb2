#!/usr/bin/env node

/**
 * Populate Video Database
 * 
 * Adds sample video categories and videos to make the gallery functional
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('[Populate] Adding sample video data...\n');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, anonKey);

async function populateVideoData() {
  try {
    console.log('[Step 1] Creating video categories...');
    
    // Create video categories
    const categories = [
      {
        name: 'All Content',
        description: 'All educational videos and content',
        color: '#3B82F6'
      },
      {
        name: 'Instagram',
        description: 'Educational content from Instagram',
        color: '#E1306C'
      },
      {
        name: 'Twitter',
        description: 'Educational content from Twitter/X',
        color: '#1DA1F2'
      },
      {
        name: 'Student Success',
        description: 'Student testimonials and success stories',
        color: '#10B981'
      }
    ];
    
    const { data: insertedCategories, error: categoryError } = await supabase
      .from('video_categories')
      .insert(categories)
      .select();
    
    if (categoryError) {
      console.error('❌ Error creating categories:', categoryError);
      return;
    }
    
    console.log('✅ Created categories:', insertedCategories.length);
    
    console.log('\n[Step 2] Creating sample videos...');
    
    // Get category IDs for reference
    const allContentCat = insertedCategories.find(c => c.name === 'All Content');
    const instagramCat = insertedCategories.find(c => c.name === 'Instagram');
    const twitterCat = insertedCategories.find(c => c.name === 'Twitter');
    const successCat = insertedCategories.find(c => c.name === 'Student Success');
    
    // Create sample videos using existing testimonial images as thumbnails
    const videos = [
      {
        title: 'Sarah Chen - 40% Time Reduction in Math',
        description: 'Sarah shares how TimeBack helped her reduce study time by 40% while improving her math grades from C+ to A-.',
        thumbnail_url: '/images/testimonials/sarah-chen-video.jpg',
        video_url: '/demo-video.mp4',
        platform: 'testimonial',
        platform_id: 'sarah-chen-math',
        category_id: successCat.id,
        view_count: 1247,
        duration: 180, // 3 minutes
        published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
      },
      {
        title: 'Learning Science: How TimeBack Works',
        description: 'Understanding the cognitive science principles behind TimeBack learning methodology and why it works.',
        thumbnail_url: '/images/testimonials/priya-patel-video.jpg',
        video_url: '/demo-video.mp4',
        platform: 'educational',
        platform_id: 'learning-science-explained',
        category_id: allContentCat.id,
        view_count: 892,
        duration: 240,
        published_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Instagram: Study Tips for Better Results',
        description: 'Quick study tips shared on Instagram that help students optimize their learning sessions.',
        thumbnail_url: '/images/testimonials/maria-garcia-video.jpg',
        video_url: '/demo-video.mp4',
        platform: 'instagram',
        platform_id: 'study-tips-instagram',
        category_id: instagramCat.id,
        view_count: 634,
        duration: 90,
        published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Twitter Thread: Common Study Mistakes',
        description: 'A viral Twitter thread about the most common study mistakes students make and how to avoid them.',
        thumbnail_url: '/images/testimonials/nicole-smith-video.jpg',
        video_url: '/demo-video.mp4',
        platform: 'twitter',
        platform_id: 'study-mistakes-thread',
        category_id: twitterCat.id,
        view_count: 445,
        duration: 150,
        published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'David Kim - From Struggling to Top 10%',
        description: 'David tells his transformation story from struggling student to top 10% of his class using TimeBack.',
        thumbnail_url: '/images/testimonials/david-kim-video.jpg',
        video_url: '/demo-video.mp4',
        platform: 'testimonial',
        platform_id: 'david-kim-transformation',
        category_id: successCat.id,
        view_count: 1156,
        duration: 210,
        published_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Instagram: Quick Memory Techniques',
        description: 'Fast memory techniques that help students remember information better, shared on Instagram.',
        thumbnail_url: '/images/testimonials/amanda-lee-results.jpg',
        video_url: '/demo-video.mp4',
        platform: 'instagram',
        platform_id: 'memory-techniques',
        category_id: instagramCat.id,
        view_count: 723,
        duration: 75,
        published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Twitter: Productivity Hacks for Students',
        description: 'Evidence-based productivity hacks shared on Twitter that help students manage their time better.',
        thumbnail_url: '/images/testimonials/lisa-martinez-results.jpg',
        video_url: '/demo-video.mp4',
        platform: 'twitter',
        platform_id: 'productivity-hacks',
        category_id: twitterCat.id,
        view_count: 567,
        duration: 120,
        published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'The Science of Spaced Repetition',
        description: 'Deep dive into how spaced repetition works and why it is so effective for long-term learning.',
        thumbnail_url: '/images/testimonials/thomas-brown-results.jpg',
        video_url: '/demo-video.mp4',
        platform: 'educational',
        platform_id: 'spaced-repetition-science',
        category_id: allContentCat.id,
        view_count: 934,
        duration: 300,
        published_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    const { data: insertedVideos, error: videoError } = await supabase
      .from('videos')
      .insert(videos)
      .select();
    
    if (videoError) {
      console.error('❌ Error creating videos:', videoError);
      return;
    }
    
    console.log('✅ Created videos:', insertedVideos.length);
    
    console.log('\n[Success] Video gallery data populated successfully!');
    console.log('=========================================================');
    console.log(`✅ ${insertedCategories.length} video categories created`);
    console.log(`✅ ${insertedVideos.length} sample videos created`);
    console.log('\nYour video gallery should now display content.');
    console.log('Visit http://localhost:3000/test-video-gallery to see the results.');
    
  } catch (error) {
    console.error('❌ Error during population:', error);
  }
}

// Run the population
populateVideoData().catch(console.error);