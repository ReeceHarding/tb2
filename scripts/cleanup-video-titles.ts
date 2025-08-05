import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupTitles() {
  console.log('[cleanup-titles] Starting title cleanup process...');
  
  try {
    // Fetch all videos with titles that have quotes
    const { data: videos, error } = await supabase
      .from('content')
      .select('id, title')
      .or('title.like.%"%,title.like.%""%')
      .not('title', 'is', null);

    if (error) {
      console.error('[cleanup-titles] Error fetching videos:', error);
      throw error;
    }

    console.log(`[cleanup-titles] Found ${videos?.length || 0} videos with quoted titles`);

    if (!videos || videos.length === 0) {
      console.log('[cleanup-titles] No videos with quoted titles found');
      return;
    }

    let cleanedCount = 0;
    
    // Process each video
    for (const video of videos) {
      if (video.title) {
        // Remove surrounding quotes (both single and double)
        const cleanedTitle = video.title
          .replace(/^["']|["']$/g, '') // Remove quotes at start and end
          .replace(/^"|"$/g, '') // Remove smart quotes
          .trim();
        
        if (cleanedTitle !== video.title) {
          console.log(`[cleanup-titles] Cleaning title for video ${video.id}:`);
          console.log(`[cleanup-titles]   Before: "${video.title}"`);
          console.log(`[cleanup-titles]   After:  "${cleanedTitle}"`);
          
          // Update the title
          const { error: updateError } = await supabase
            .from('content')
            .update({ title: cleanedTitle })
            .eq('id', video.id);

          if (updateError) {
            console.error(`[cleanup-titles] Error updating video ${video.id}:`, updateError);
          } else {
            cleanedCount++;
            console.log(`[cleanup-titles] Successfully cleaned title for video ${video.id}`);
          }
        }
      }
    }

    console.log('\n[cleanup-titles] ===== SUMMARY =====');
    console.log(`[cleanup-titles] Total videos checked: ${videos.length}`);
    console.log(`[cleanup-titles] Titles cleaned: ${cleanedCount}`);
    console.log('[cleanup-titles] Cleanup complete!');
    
  } catch (error) {
    console.error('[cleanup-titles] Fatal error:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupTitles();