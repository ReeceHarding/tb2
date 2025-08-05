import { NextResponse } from 'next/server';
import { videoService } from '@/libs/supabase';

export async function GET() {
  console.log('[video-categories-api] Processing GET request for video categories');

  try {
    const categories = await videoService.getCategories();
    
    console.log('[video-categories-api] Successfully fetched categories:', categories.length);

    return NextResponse.json({
      success: true,
      categories,
      count: categories.length
    });

  } catch (error) {
    console.error('[video-categories-api] Error fetching categories:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch video categories',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}