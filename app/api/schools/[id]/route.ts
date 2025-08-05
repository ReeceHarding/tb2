import { NextRequest, NextResponse } from 'next/server';
import { getSchoolDetailsOptimized, getSchoolDetails } from '@/app/ai-experience/lib/schooldigger';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const schoolId = params.id;
    const { searchParams } = new URL(request.url);
    const optimized = searchParams.get('optimized') === 'true';

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      );
    }

    console.log('[API] Get school details request:', { schoolId, optimized });

    // Only allow mock data for specific demo school ID - fail for all others
    if (schoolId === 'DEMO_SCHOOL_12345') {
      console.log('[API] Using mock data for demo school ID DEMO_SCHOOL_12345');
      const mockSchool = {
        schoolid: 'DEMO_SCHOOL_12345',
        schoolName: 'Lincoln Elementary School (DEMO)',
        name: 'Lincoln Elementary School (DEMO)',
        city: 'San Francisco',
        state: 'CA',
        level: 'Elementary',
        address: {
          street: '1234 Demo Street',
          city: 'San Francisco',
          state: 'CA',
          zip: '94102'
        },
        phone: '(555) 123-4567',
        website: 'https://example.com',
        enrollment: 450,
        grades: 'K-5',
        lowGrade: 'K',
        highGrade: '5',
        type: 'Public',
        district: {
          districtName: 'San Francisco Unified School District'
        },
        rankHistory: [
          {
            rankStatewidePercentage: 75,
            rankStars: 4,
            year: '2023'
          }
        ],
        testScores: [
          {
            subject: 'Reading',
            year: 2023,
            schoolTestScore: { percentMetStandard: 78 },
            stateTestScore: { percentMetStandard: 65 }
          },
          {
            subject: 'Math', 
            year: 2023,
            schoolTestScore: { percentMetStandard: 72 },
            stateTestScore: { percentMetStandard: 60 }
          },
          {
            subject: 'Science',
            year: 2023,
            schoolTestScore: { percentMetStandard: 80 },
            stateTestScore: { percentMetStandard: 68 }
          }
        ],
        schoolYearlyDetails: [
          {
            numberOfStudents: 450,
            pupilTeacherRatio: 18
          }
        ],
        detailsType: optimized ? 'optimized' : 'legacy'
      };
      return NextResponse.json(mockSchool);
    }

    if (optimized) {
      // Use new optimized details with enhanced data structure
      const school = await getSchoolDetailsOptimized(schoolId);
      console.log('[API] Returning optimized school details for:', school.name);
      return NextResponse.json({ 
        ...school, 
        detailsType: 'optimized' 
      });
    } else {
      // Use legacy details for backward compatibility
      const school = await getSchoolDetails(schoolId);
      console.log('[API] Returning legacy school details for:', school.schoolName);
      return NextResponse.json({ 
        ...school, 
        detailsType: 'legacy' 
      });
    }
    
  } catch (error) {
    console.error('[API] Get school details error:', error);
    return NextResponse.json(
      { error: 'Failed to get school details' },
      { status: 500 }
    );
  }
}