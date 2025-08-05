import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import OpenAI from 'openai';

// Load environment variables
config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize OpenAI client with GPT-4o mini
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface VideoWithTranscript {
  id: string;
  title: string;
  description: string;
  transcript: string | null;
}

async function fetchVideosWithTranscripts(): Promise<VideoWithTranscript[]> {
  console.log('[generate-titles] Fetching videos with transcripts from Supabase...');
  
  // Query videos with their transcripts
  const { data, error } = await supabase
    .from('content')
    .select(`
      id,
      title,
      description,
      media!inner(
        id,
        media_type
      ),
      transcriptions(
        text
      )
    `)
    .eq('media.media_type', 'video')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[generate-titles] Error fetching videos:', error);
    throw error;
  }

  console.log(`[generate-titles] Found ${data?.length || 0} videos`);

  // Transform the data
  return (data || []).map(item => ({
    id: item.id,
    title: item.title || 'Untitled Video',
    description: item.description || '',
    transcript: item.transcriptions?.[0]?.text || null
  }));
}

async function generateTitle(video: VideoWithTranscript): Promise<string> {
  // If video already has a good title (not "Untitled Video"), skip it
  if (video.title && video.title !== 'Untitled Video' && video.title.trim() !== '') {
    console.log(`[generate-titles] Video ${video.id} already has title: "${video.title}", skipping`);
    return video.title;
  }

  // Use transcript if available, otherwise use description
  const contentToAnalyze = video.transcript || video.description;
  
  if (!contentToAnalyze || contentToAnalyze.trim() === '') {
    console.log(`[generate-titles] Video ${video.id} has no transcript or description, skipping`);
    return video.title; // Keep existing title
  }

  console.log(`[generate-titles] Generating title for video ${video.id}...`);
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a title generator for educational videos. Create a concise, engaging title that is exactly 2-4 words long. The title should capture the main topic or benefit of the video. Never use hyphens in your titles.

Examples of good titles:
- "Math Made Easy"
- "Student Success Story"
- "Learning Science Explained"
- "Personalized Education"
- "Alpha Program Results"

Focus on:
- Educational value
- Student success
- Learning benefits
- Key topics
- Clear outcomes`
        },
        {
          role: 'user',
          content: `Generate a 2-4 word title for this educational video based on the following content:\n\n${contentToAnalyze.substring(0, 1000)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 20,
    });

    const generatedTitle = response.choices[0]?.message?.content?.trim() || video.title;
    console.log(`[generate-titles] Generated title for video ${video.id}: "${generatedTitle}"`);
    
    return generatedTitle;
  } catch (error) {
    console.error(`[generate-titles] Error generating title for video ${video.id}:`, error);
    return video.title; // Keep existing title on error
  }
}

async function updateVideoTitle(videoId: string, newTitle: string): Promise<void> {
  console.log(`[generate-titles] Updating video ${videoId} with title: "${newTitle}"`);
  
  const { error } = await supabase
    .from('content')
    .update({ 
      title: newTitle
    })
    .eq('id', videoId);

  if (error) {
    console.error(`[generate-titles] Error updating video ${videoId}:`, error);
    throw error;
  }
  
  console.log(`[generate-titles] Successfully updated video ${videoId}`);
}

async function main() {
  try {
    console.log('[generate-titles] Starting video title generation process...');
    console.log('[generate-titles] Using GPT-4o mini for title generation');
    
    // Fetch all videos with transcripts
    const videos = await fetchVideosWithTranscripts();
    console.log(`[generate-titles] Processing ${videos.length} videos...`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Process videos in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < videos.length; i += batchSize) {
      const batch = videos.slice(i, i + batchSize);
      console.log(`[generate-titles] Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(videos.length/batchSize)}...`);
      
      const promises = batch.map(async (video) => {
        try {
          const newTitle = await generateTitle(video);
          
          // Only update if title changed
          if (newTitle !== video.title && newTitle !== 'Untitled Video') {
            await updateVideoTitle(video.id, newTitle);
            updatedCount++;
            return { success: true, videoId: video.id, oldTitle: video.title, newTitle };
          } else {
            skippedCount++;
            return { success: false, videoId: video.id, reason: 'Title unchanged or invalid' };
          }
        } catch (error) {
          errorCount++;
          console.error(`[generate-titles] Error processing video ${video.id}:`, error);
          return { success: false, videoId: video.id, error };
        }
      });
      
      const results = await Promise.all(promises);
      
      // Log batch results
      results.forEach(result => {
        if (result.success) {
          console.log(`✅ Updated: "${result.oldTitle}" → "${result.newTitle}"`);
        }
      });
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < videos.length) {
        console.log('[generate-titles] Waiting 2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('\n[generate-titles] ===== SUMMARY =====');
    console.log(`[generate-titles] Total videos processed: ${videos.length}`);
    console.log(`[generate-titles] Titles updated: ${updatedCount}`);
    console.log(`[generate-titles] Skipped (already had titles): ${skippedCount}`);
    console.log(`[generate-titles] Errors: ${errorCount}`);
    console.log('[generate-titles] Title generation complete!');
    
  } catch (error) {
    console.error('[generate-titles] Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
main();