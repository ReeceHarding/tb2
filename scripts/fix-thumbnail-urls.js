const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Create Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixThumbnailUrls() {
  console.log('[fix-thumbnails] Starting thumbnail URL fix...');
  console.log('[fix-thumbnails] Connecting to Supabase...');

  try {
    // First, check if videos table exists and has records with problematic thumbnails
    console.log('[fix-thumbnails] Checking for videos with problematic thumbnail URLs...');
    
    const { data: problematicVideos, error: checkError } = await supabase
      .from('videos')
      .select('id, title, thumbnail_url')
      .or('thumbnail_url.like.%_thumb.jpg,thumbnail_url.like.%thumb.jpg');

    if (checkError) {
      console.log('[fix-thumbnails] Error checking videos table (table might not exist):', checkError.message);
      console.log('[fix-thumbnails] This is normal if you haven\'t run video migration scripts yet.');
      return;
    }

    console.log(`[fix-thumbnails] Found ${problematicVideos?.length || 0} videos with problematic thumbnail URLs`);

    if (!problematicVideos || problematicVideos.length === 0) {
      console.log('[fix-thumbnails] No problematic thumbnail URLs found. Nothing to fix.');
      return;
    }

    // Show some examples
    console.log('[fix-thumbnails] Examples of problematic URLs:');
    problematicVideos.slice(0, 3).forEach(video => {
      console.log(`  - Video "${video.title}": ${video.thumbnail_url}`);
    });

    // Update all problematic thumbnail URLs to use the default
    console.log('[fix-thumbnails] Updating thumbnail URLs to use default...');
    
    const { data: updateResult, error: updateError } = await supabase
      .from('videos')
      .update({ 
        thumbnail_url: '/images/testimonials/default-video-thumb.jpg' 
      })
      .or('thumbnail_url.like.%_thumb.jpg,thumbnail_url.like.%thumb.jpg')
      .select('id');

    if (updateError) {
      console.error('[fix-thumbnails] Error updating thumbnail URLs:', updateError.message);
      return;
    }

    console.log(`[fix-thumbnails] Successfully updated ${updateResult?.length || 0} video thumbnail URLs`);
    
    // Verify the changes
    console.log('[fix-thumbnails] Verifying changes...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('videos')
      .select('id, title, thumbnail_url')
      .eq('thumbnail_url', '/images/testimonials/default-video-thumb.jpg')
      .limit(5);

    if (verifyError) {
      console.error('[fix-thumbnails] Error verifying changes:', verifyError.message);
      return;
    }

    console.log(`[fix-thumbnails] Verification: ${verifyData?.length || 0} videos now use the default thumbnail`);
    console.log('[fix-thumbnails] Sample updated records:');
    verifyData?.forEach(video => {
      console.log(`  - "${video.title}": ${video.thumbnail_url}`);
    });

    console.log('[fix-thumbnails] ✅ Thumbnail URL fix completed successfully!');

  } catch (error) {
    console.error('[fix-thumbnails] Unexpected error:', error.message);
  }
}

// Run the fix
fixThumbnailUrls();