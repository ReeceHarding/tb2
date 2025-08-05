import { NextRequest, NextResponse } from 'next/server';
import { videoService, semanticVideoService, UserContext } from '@/libs/supabase';

// Force this API route to be dynamic since it uses request.url for query params
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    // Check for user context parameters for personalized recommendations
    const learningGoalsParam = searchParams.get('learningGoals');
    const kidsInterestsParam = searchParams.get('kidsInterests');
    const userTypeParam = searchParams.get('userType');
    const parentSubTypeParam = searchParams.get('parentSubType');
    const gradeParam = searchParams.get('grade');
    const selectedSchoolsParam = searchParams.get('selectedSchools');

    // If we have user context, use semantic search for personalized results
    if (learningGoalsParam || kidsInterestsParam || userTypeParam) {
      const userContext: UserContext = {
        learningGoals: learningGoalsParam ? learningGoalsParam.split(',').map(s => s.trim()) : [],
        kidsInterests: kidsInterestsParam ? kidsInterestsParam.split(',').map(s => s.trim()) : [],
        userType: userTypeParam || '',
        parentSubType: parentSubTypeParam || '',
        grade: gradeParam || undefined,
        selectedSchools: selectedSchoolsParam ? JSON.parse(selectedSchoolsParam) : undefined
      };
      
      let videos;
      if (category) {
        videos = await semanticVideoService.getPersonalizedVideosByCategory(userContext, category);
      } else {
        videos = await semanticVideoService.getPersonalizedVideos(userContext);
      }

      return NextResponse.json({
        success: true,
        videos,
        count: videos.length,
        personalized: true
      });
    }

    // Fallback to regular video service for non-personalized requests
    let videos;
    if (category) {
      videos = await videoService.getVideosByCategory(category);
    } else {
      videos = await videoService.getAllVideos();
    }

    return NextResponse.json({
      success: true,
      videos,
      count: videos.length,
      personalized: false
    });

  } catch (error) {
    console.error('[videos-api] Error fetching videos:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch videos',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}