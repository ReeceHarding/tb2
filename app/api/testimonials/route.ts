import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Testimonial } from '@/libs/supabase';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Cache duration in seconds (5 minutes)
const CACHE_DURATION = 300;

export async function GET(request: NextRequest) {
  console.log('📡 Testimonials API: Fetching testimonials from database...');
  console.log('⏰ Timestamp:', new Date().toISOString());
  
  try {
    const { searchParams } = new URL(request.url);
    const featuredOnly = searchParams.get('featured') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const tag = searchParams.get('tag'); // Add tag filtering support
    
    console.log('🔍 Query params:', { featuredOnly, limit, tag });
    
    // Build the query
    let query = supabase
      .from('testimonials')
      .select('*')
      .order('display_order', { ascending: true });
    
    // Apply filters
    if (featuredOnly) {
      query = query.eq('featured', true);
    }
    
    if (tag) {
      query = query.contains('tags', [tag]);
    }
    
    if (limit) {
      query = query.limit(limit);
    }
    
    console.log('🗄️ Executing database query...');
    const { data: testimonials, error } = await query;
    
    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to fetch testimonials',
          details: error.message 
        },
        { status: 500 }
      );
    }
    
    if (!testimonials || testimonials.length === 0) {
      console.log('⚠️ No testimonials found');
      return NextResponse.json(
        { 
          testimonials: [],
          count: 0,
          message: 'No testimonials found'
        },
        {
          status: 200,
          headers: {
            'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=600`,
          }
        }
      );
    }
    
    // Process testimonials to ensure video URLs are accessible
    const processedTestimonials = testimonials.map((testimonial: Testimonial) => {
      console.log(`📹 Processing testimonial: ${testimonial.title} - Video URL: ${testimonial.video_url}`);
      
      return {
        ...testimonial,
        // Ensure video_url is properly formatted
        video_url: testimonial.video_url,
        // Generate thumbnail URL if not present
        thumbnail_url: testimonial.thumbnail_url || generateThumbnailUrl(testimonial.video_url),
        // Ensure transcription exists
        transcription: testimonial.transcription || 'Transcription not available',
        // Clean up marketing copy
        marketing_copy: testimonial.marketing_copy || null,
        // Ensure proper display values
        student_name: testimonial.student_name || 'Anonymous Student',
        description: testimonial.description || 'Student testimonial about their learning experience'
      };
    });
    
    console.log(`✅ Successfully fetched ${processedTestimonials.length} testimonials`);
    console.log('📊 Testimonials preview:', processedTestimonials.slice(0, 3).map(t => ({
      title: t.title,
      student: t.student_name,
      featured: t.featured,
      hasVideo: !!t.video_url
    })));
    
    const response = NextResponse.json({
      testimonials: processedTestimonials,
      count: processedTestimonials.length,
      metadata: {
        total: processedTestimonials.length,
        featured: processedTestimonials.filter(t => t.featured).length,
        withVideo: processedTestimonials.filter(t => t.video_url).length,
        fetchedAt: new Date().toISOString()
      }
    });
    
    // Set cache headers
    response.headers.set('Cache-Control', `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=600`);
    
    return response;
    
  } catch (error) {
    console.error('❌ Unexpected error in testimonials API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while fetching testimonials'
      },
      { status: 500 }
    );
  }
}

// Helper function to generate thumbnail URL from video URL
function generateThumbnailUrl(_videoUrl: string): string {
  // For now, return a placeholder thumbnail
  // In production, this could generate actual video thumbnails
  return '/images/testimonials/default-video-thumb.jpg';
}

// POST endpoint to increment view count
export async function POST(request: NextRequest) {
  console.log('📊 Testimonials API: Incrementing view count...');
  
  try {
    const body = await request.json();
    const { testimonialId } = body;
    
    if (!testimonialId) {
      return NextResponse.json(
        { error: 'testimonialId is required' },
        { status: 400 }
      );
    }
    
    console.log(`📈 Incrementing view count for testimonial: ${testimonialId}`);
    
    // First get current view count
    const { data: currentData } = await supabase
      .from('testimonials')
      .select('view_count')
      .eq('id', testimonialId)
      .single();

    const currentViewCount = currentData?.view_count || 0;

    // Then update with incremented value
    const { data, error } = await supabase
      .from('testimonials')
      .update({ 
        view_count: currentViewCount + 1,
        last_viewed_at: new Date().toISOString()
      })
      .eq('id', testimonialId)
      .select('view_count')
      .single();
    
    if (error) {
      console.error('❌ Error updating view count:', error);
      return NextResponse.json(
        { error: 'Failed to update view count' },
        { status: 500 }
      );
    }
    
    console.log(`✅ View count updated. New count: ${data.view_count}`);
    
    return NextResponse.json({
      success: true,
      viewCount: data.view_count
    });
    
  } catch (error) {
    console.error('❌ Error in view count update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}