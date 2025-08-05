// Auto-generated API route for schools data
import { NextRequest, NextResponse } from 'next/server';
import { getAllSchools, getSchoolData, searchSchools } from '../../../libs/school-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const schoolId = searchParams.get('id');
  const query = searchParams.get('q');

  try {
    if (schoolId) {
      // Get specific school
      const school = await getSchoolData(schoolId as any);
      if (!school) {
        return NextResponse.json({ error: 'School not found' }, { status: 404 });
      }
      return NextResponse.json(school);
    } else if (query) {
      // Search schools
      const schools = await searchSchools(query);
      return NextResponse.json(schools);
    } else {
      // Get all schools
      const schools = await getAllSchools();
      return NextResponse.json(schools);
    }
  } catch (error) {
    console.error('Schools API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
