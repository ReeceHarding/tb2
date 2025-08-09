import { createClient } from '@supabase/supabase-js';

// Prefer server-side envs in production, fallback to NEXT_PUBLIC_* for client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Only warn about missing environment variables in development or when actually trying to use Supabase
const hasValidConfig = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseKey !== 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types for semantic search
export interface UserContext {
  learningGoals: string[];
  kidsInterests: string[];
  userType: string;
  parentSubType: string;
  grade?: string;
  selectedSchools?: Array<{
    id: string;
    name: string;
    level: string;
  }>;
}

export const isSupabaseConfigured = () => {
  if (!hasValidConfig && process.env.NODE_ENV !== 'production') {
    console.warn('[Supabase] Missing environment variables. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.');
  }
  return hasValidConfig;
};

// Database types for TypeScript support
export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  duration: number; // in seconds
  category: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  is_featured: boolean;
  view_count: number;
}

export interface VideoCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  created_at: string;
}

export interface Testimonial {
  id: string;
  title: string;
  description?: string;
  student_name?: string;
  student_age?: number;
  student_grade?: string;
  video_url: string;
  thumbnail_url?: string;
  local_video_path?: string;
  transcription: string;
  marketing_copy?: any;
  duration_seconds?: number;
  file_size_bytes?: number;
  video_width?: number;
  video_height?: number;
  tags?: string[];
  featured: boolean;
  display_order: number;
  view_count: number;
  last_viewed_at?: string;
  created_at: string;
  updated_at: string;
}

// Helper functions for video operations using the videos table
export const videoService = {
  async getAllVideos(): Promise<Video[]> {
    console.log('[videoService] Fetching all videos from media table');
    if (!isSupabaseConfigured()) return [];
    
    // Query media table where media_type is video
    const { data, error } = await supabase
      .from('media')
      .select(`
        id,
        url,
        local_file_path,
        file_size,
        width,
        height,
        duration_seconds,
        created_at,
        content (
          id,
          title,
          description,
          platform,
          platform_id,
          author_username,
          views_count
        )
      `)
      .eq('media_type', 'video')
      .order('created_at', { ascending: false })
      .limit(50); // Limit to most recent 50 videos
    
    if (error) {
      console.error('[videoService] Error fetching videos:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('[videoService] No videos found in media table');
      return [];
    }
    
    // Transform media data to Video format
    const videos: Video[] = data.map(item => ({
      id: item.id,
      title: (item.content as any)?.title || `Video ${item.id.slice(-8)}`,
      description: (item.content as any)?.description || 'Video content',
      thumbnail_url: '/images/testimonials/default-video-thumb.jpg', // Use fallback since thumbnails don't exist
      video_url: item.url || '',
      duration: Math.round(item.duration_seconds || 0),
      category: (item.content as any)?.platform || 'general',
      tags: [] as string[],
      created_at: item.created_at,
      updated_at: item.created_at,
      is_featured: true,
      view_count: (item.content as any)?.views_count || 0
    }));
    
    console.log(`[videoService] Found ${videos.length} videos from media table`);
    return videos;
  },

  async getVideosByCategory(category: string): Promise<Video[]> {
    console.log('[videoService] Fetching videos for category:', category);
    if (!isSupabaseConfigured()) return [];
    
    if (category.toLowerCase() === 'all videos' || category === 'all') {
      return this.getAllVideos();
    }
    
    // Query media table filtered by platform (category)
    const { data, error } = await supabase
      .from('media')
      .select(`
        id,
        url,
        local_file_path,
        file_size,
        width,
        height,
        duration_seconds,
        created_at,
        content!inner (
          id,
          title,
          description,
          platform,
          platform_id,
          author_username,
          views_count
        )
      `)
      .eq('media_type', 'video')
      .eq('content.platform', category)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('[videoService] Error fetching videos by category:', error);
      return [];
    }
    
    // Transform media data to Video format
    const videos: Video[] = (data || []).map(item => ({
      id: item.id,
      title: (item.content as any)?.title || `Video ${item.id.slice(-8)}`,
      description: (item.content as any)?.description || 'Video content',
      thumbnail_url: '/images/testimonials/default-video-thumb.jpg', // Use fallback since thumbnails don't exist
      video_url: item.url || '',
      duration: Math.round(item.duration_seconds || 0),
      category: (item.content as any)?.platform || 'general',
      tags: [] as string[],
      created_at: item.created_at,
      updated_at: item.created_at,
      is_featured: true,
      view_count: (item.content as any)?.views_count || 0
    }));
    
    console.log(`[videoService] Found ${videos.length} videos for category: ${category}`);
    return videos;
  },

  async getCategories(): Promise<VideoCategory[]> {
    console.log('[videoService] Getting categories from content platforms');
    if (!isSupabaseConfigured()) return [];
    
    try {
      // Get unique platforms from content table that have associated media
      const { data, error } = await supabase
        .from('content')
        .select('platform')
        .not('platform', 'is', null);
      
      if (error) {
        console.error('[videoService] Error fetching platforms:', error);
        // Return default categories as fallback
        return [
          { id: 'all', name: 'All Videos', description: 'All video content', color: '#3B82F6', created_at: new Date().toISOString() },
          { id: 'twitter', name: 'Twitter Videos', description: 'Videos from Twitter/X platform', color: '#1DA1F2', created_at: new Date().toISOString() },
          { id: 'general', name: 'General', description: 'General video content', color: '#10B981', created_at: new Date().toISOString() }
        ];
      }
      
      // Get unique platforms and create categories
      const uniquePlatforms = new Set((data || []).map(item => item.platform).filter(Boolean));
      const platforms = Array.from(uniquePlatforms);
      
      const categories: VideoCategory[] = [
        { id: 'all', name: 'All Videos', description: 'All video content', color: '#3B82F6', created_at: new Date().toISOString() },
        ...platforms.map(platform => ({
          id: platform,
          name: platform === 'twitter' ? 'Twitter Videos' : platform.charAt(0).toUpperCase() + platform.slice(1),
          description: platform === 'twitter' ? 'Videos from Twitter/X platform' : `Videos from ${platform}`,
          color: platform === 'twitter' ? '#1DA1F2' : '#10B981',
          created_at: new Date().toISOString()
        }))
      ];
      
      console.log(`[videoService] Found ${categories.length} categories from content platforms:`, categories.map(c => c.name));
      return categories;
    } catch (error) {
      console.error('[videoService] Error in getCategories:', error);
      // Return default categories as ultimate fallback
      return [
        { id: 'all', name: 'All Videos', description: 'All video content', color: '#3B82F6', created_at: new Date().toISOString() },
        { id: 'twitter', name: 'Twitter Videos', description: 'Videos from Twitter/X platform', color: '#1DA1F2', created_at: new Date().toISOString() },
        { id: 'general', name: 'General', description: 'General video content', color: '#10B981', created_at: new Date().toISOString() }
      ];
    }
  },

  async incrementViewCount(videoId: string): Promise<void> {
    console.log('[videoService] Incrementing view count for video:', videoId);
    if (!isSupabaseConfigured()) return;
    
    try {
      // Get the content_id associated with this media
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .select('content_id')
        .eq('id', videoId)
        .single();
      
      if (mediaError || !mediaData?.content_id) {
        console.error('[videoService] Error finding content for media:', mediaError);
        return;
      }
      
      // Update view count in content table
      const { data: contentData, error: getError } = await supabase
        .from('content')
        .select('views_count')
        .eq('id', mediaData.content_id)
        .single();
      
      if (getError) {
        console.error('[videoService] Error getting current view count:', getError);
        return;
      }
      
      const currentCount = contentData?.views_count || 0;
      const { error: updateError } = await supabase
        .from('content')
        .update({ 
          views_count: currentCount + 1
        })
        .eq('id', mediaData.content_id);
      
      if (updateError) {
        console.error('[videoService] Error incrementing view count:', updateError);
      } else {
        console.log('[videoService] View count incremented successfully for content:', mediaData.content_id);
      }
    } catch (error) {
      console.error('[videoService] Unexpected error incrementing view count:', error);
    }
  }
};

// Helper function to convert user context to searchable text
function contextToSearchText(userContext: UserContext): string {
  console.log('[contextToSearchText] Converting user context to search text');
  const parts: string[] = [];
  if (userContext.learningGoals && userContext.learningGoals.length > 0) {
    parts.push(...userContext.learningGoals);
  }
  if (userContext.kidsInterests && userContext.kidsInterests.length > 0) {
    parts.push(...userContext.kidsInterests);
  }
  if (userContext.grade) {
    parts.push(userContext.grade);
  }
  if (userContext.userType && userContext.parentSubType) {
    parts.push(userContext.userType, userContext.parentSubType);
  }
  if (userContext.selectedSchools && userContext.selectedSchools.length > 0) {
    userContext.selectedSchools.forEach(s => parts.push(s.name, s.level));
  }
  const searchText = parts.join(' ');
  console.log('[contextToSearchText] Generated search text:', searchText);
  return searchText;
}


// Helper function to generate embeddings (mock implementation)
async function generateEmbedding(text: string): Promise<number[]> {
  console.log('[generateEmbedding] Generating embedding for text:', text.substring(0, 50) + '...');
  
  // In a real implementation, this would call an AI service like OpenAI, Cohere, or local model
  // For now, we'll create a simple hash-based pseudo-embedding
  const hash = text.split('').reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) & 0xffffffff;
  }, 0);
  
  // Generate a 1536-dimensional vector to match OpenAI text-embedding-ada-002 format
  const embedding: number[] = [];
  for (let i = 0; i < 1536; i++) {
    const seed = hash + i;
    embedding.push(Math.sin(seed) * 0.1); // Small values to simulate normalized embeddings
  }
  
  return embedding;
}

// Helper function to calculate cosine similarity between two vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || !Array.isArray(vecA) || !Array.isArray(vecB)) {
    return 0;
  }
  
  if (vecA.length !== vecB.length) {
    return 0;
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Semantic search service for personalized video recommendations
export const semanticVideoService = {
  async getPersonalizedVideos(userContext: UserContext, limit: number = 20): Promise<Video[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const searchText = contextToSearchText(userContext);
      
      if (!searchText.trim()) {
        return videoService.getAllVideos();
      }

      // Generate embedding for user context
      const queryEmbedding = await generateEmbedding(searchText);

      // Get all videos from media table with their content
      const { data: videos, error } = await supabase
        .from('media')
        .select(`
          id,
          url,
          duration_seconds,
          created_at,
          content (
            id,
            title,
            description,
            platform,
            views_count,
            content_embedding,
            description_embedding,
            embedding_generated_at,
            embedding_model
          )
        `)
        .eq('media_type', 'video')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[semanticVideoService] Error fetching videos:', error);
        return videoService.getAllVideos();
      }

      if (!videos || videos.length === 0) {
        return [];
      }

      // Calculate similarity scores for each video
      const videosWithScores = await Promise.all(
        videos.map(async (video) => {
          const content = video.content as any;
          const combinedText = `${content?.title || ''} ${content?.description || ''} ${content?.platform || ''}`.trim();
          
          if (!combinedText) {
            return null; // Skip videos without content
          }

          // Check if we have cached embeddings (check multiple embedding types)
          let embedding: number[];
          let foundCachedEmbedding = false;
          

          
          // Try content_embedding first
          if (content?.content_embedding) {
            try {
              embedding = JSON.parse(content.content_embedding);
              foundCachedEmbedding = true;
            } catch (e) {
              console.warn(`[semanticVideoService] Failed to parse content_embedding for video ${video.id}:`, e);
            }
          }
          
          // Try description_embedding if content_embedding failed
          if (!foundCachedEmbedding && content?.description_embedding) {
            try {
              embedding = JSON.parse(content.description_embedding);
              foundCachedEmbedding = true;
            } catch (e) {
              console.warn(`[semanticVideoService] Failed to parse description_embedding for video ${video.id}:`, e);
            }
          }
          
          if (!foundCachedEmbedding) {
            // Generate embedding only if not cached
            embedding = await generateEmbedding(combinedText);
            
            // Cache the embedding back to the database (async, don't wait)
            if (content?.id) {
              supabase
                .from('content')
                .update({ 
                  content_embedding: JSON.stringify(embedding),
                  embedding_generated_at: new Date().toISOString(),
                  embedding_model: 'text-embedding-ada-002'
                })
                .eq('id', content.id)
                .then(result => {
                  if (result.error) {
                    console.error('[semanticVideoService] Error caching embedding:', result.error);
                  }
                });
            }
          }
          
          const similarity = cosineSimilarity(queryEmbedding, embedding);

          return {
            id: video.id,
            title: content?.title || `Video ${video.id.slice(-8)}`,
            description: content?.description || 'Video content',
            thumbnail_url: '/images/testimonials/default-video-thumb.jpg', // Use fallback since thumbnails don't exist
            video_url: video.url || '',
            duration: Math.round(video.duration_seconds || 0),
            category: content?.platform || 'general',
            tags: [] as string[],
            created_at: video.created_at,
            updated_at: video.created_at,
            is_featured: true,
            view_count: content?.views_count || 0,
            similarity_score: similarity
          };
        })
      );

      // Filter out null values
      const validVideos = videosWithScores.filter(video => video !== null);

      // Sort by similarity score and view count
      const sortedVideos = validVideos
        .sort((a, b) => {
          // Primary sort: similarity score
          const similarityDiff = (b.similarity_score || 0) - (a.similarity_score || 0);
          if (Math.abs(similarityDiff) > 0.01) return similarityDiff;
          
          // Secondary sort: view count
          return (b.view_count || 0) - (a.view_count || 0);
        })
        .slice(0, limit);

      return sortedVideos.map(({ similarity_score, ...video }) => video); // Remove similarity_score from final result
      
    } catch (error) {
      console.error('[semanticVideoService] Error in getPersonalizedVideos:', error);
      return videoService.getAllVideos();
    }
  },

  async getPersonalizedVideosByCategory(userContext: UserContext, category: string, limit: number = 15): Promise<Video[]> {
    if (!isSupabaseConfigured()) return [];
    
    try {
      const searchText = contextToSearchText(userContext);
      
      // Get videos from media table with content (includes cached embeddings)
      const { data: videos, error } = await supabase
        .from('media')
        .select(`
          id,
          url,
          duration_seconds,
          created_at,
          content!inner (
            id,
            title,
            description,
            platform,
            views_count,
            content_embedding,
            description_embedding,
            combined_embedding
          )
        `)
        .eq('media_type', 'video')
        .eq('content.platform', category)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[semanticVideoService] Error fetching videos by category:', error);
        return videoService.getVideosByCategory(category);
      }

      if (!videos || videos.length === 0) {
        return [];
      }

      // If no user context, just return by popularity
      if (!searchText.trim()) {
        return videos
          .map(item => ({
            id: item.id,
            title: (item.content as any)?.title || `Video ${item.id.slice(-8)}`,
            description: (item.content as any)?.description || 'Video content',
            thumbnail_url: '/images/testimonials/default-video-thumb.jpg',
            video_url: item.url || '',
            duration: Math.round(item.duration_seconds || 0),
            category: (item.content as any)?.platform || category,
            tags: [] as string[],
            created_at: item.created_at,
            updated_at: item.created_at,
            is_featured: true,
            view_count: (item.content as any)?.views_count || 0
          }))
          .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
          .slice(0, limit);
      }

      // Generate embedding for user context
      const queryEmbedding = await generateEmbedding(searchText);

      // Calculate similarity scores for category videos
      const videosWithScores = await Promise.all(
        videos.map(async (video) => {
          const content = video.content as any;
          let embedding: number[];
          
          // Use cached embeddings if available, otherwise generate new ones
          if (content?.combined_embedding && Array.isArray(content.combined_embedding)) {
            embedding = content.combined_embedding;
          } else if (content?.content_embedding && Array.isArray(content.content_embedding)) {
            embedding = content.content_embedding;
          } else if (content?.description_embedding && Array.isArray(content.description_embedding)) {
            embedding = content.description_embedding;
          } else {
            // Only generate embedding if no cached version exists
            const combinedText = `${content?.title || ''} ${content?.description || ''} ${content?.platform || ''}`.trim();
            if (!combinedText) {
              return null;
            }
            embedding = await generateEmbedding(combinedText);
            
            // Cache the embedding back to the database (async, don't wait)
            if (content?.id) {
              supabase
                .from('content')
                .update({ 
                  content_embedding: JSON.stringify(embedding),
                  embedding_generated_at: new Date().toISOString(),
                  embedding_model: 'text-embedding-ada-002'
                })
                .eq('id', content.id)
                .then(result => {
                  if (result.error) {
                    console.error('[semanticVideoService] Error caching embedding:', result.error);
                  }
                });
            }
          }
          
          const similarity = cosineSimilarity(queryEmbedding, embedding);

          return {
            id: video.id,
            title: content?.title || `Video ${video.id.slice(-8)}`,
            description: content?.description || 'Video content',
            thumbnail_url: '/images/testimonials/default-video-thumb.jpg',
            video_url: video.url || '',
            duration: Math.round(video.duration_seconds || 0),
            category: content?.platform || category,
            tags: [] as string[],
            created_at: video.created_at,
            updated_at: video.created_at,
            is_featured: true,
            view_count: content?.views_count || 0,
            similarity_score: similarity
          };
        })
      );

      // Filter out null results and sort by similarity score and view count
      const sortedVideos = videosWithScores
        .filter(video => video !== null)
        .sort((a, b) => {
          // Primary sort: similarity score
          const similarityDiff = (b.similarity_score || 0) - (a.similarity_score || 0);
          if (Math.abs(similarityDiff) > 0.01) return similarityDiff;
          
          // Secondary sort: view count
          return (b.view_count || 0) - (a.view_count || 0);
        })
        .slice(0, limit);

      return sortedVideos.map(({ similarity_score, ...video }) => video);
      
    } catch (error) {
      console.error('[semanticVideoService] Error in getPersonalizedVideosByCategory:', error);
      return videoService.getVideosByCategory(category);
    }
  }
};
