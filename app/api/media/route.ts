// Auto-generated API route for media data
import { NextRequest, NextResponse } from 'next/server';
import { getAllVideos, getAllImages, getSchoolVideos, getSchoolImages } from '../../../libs/school-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'videos' | 'images'
  const schoolId = searchParams.get('schoolId');

  try {
    if (schoolId && type === 'videos') {
      const videos = await getSchoolVideos(schoolId as any);
      return NextResponse.json(videos);
    } else if (schoolId && type === 'images') {
      const images = await getSchoolImages(schoolId as any);
      return NextResponse.json(images);
    } else if (type === 'videos') {
      const videos = await getAllVideos();
      return NextResponse.json(videos);
    } else if (type === 'images') {
      const images = await getAllImages();
      return NextResponse.json(images);
    } else {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Media API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
