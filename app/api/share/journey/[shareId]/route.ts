import { NextResponse, NextRequest } from "next/server";
import { unifiedDataService } from "@/libs/unified-data-service";
import { SECTION_SCHEMAS } from "@/libs/section-schemas";

export const dynamic = 'force-dynamic';

// GET: Retrieve a shared journey by shareId (public endpoint)
export async function GET(
  req: NextRequest,
  { params }: { params: { shareId: string } }
) {
  const timestamp = new Date().toISOString();
  const { shareId } = params;
  
  console.log(`[SharedJourneyAPI-Supabase] ${timestamp} Processing shared journey retrieval for ID:`, shareId);

  try {
    // Validate shareId format (assuming it's a UUID now)
    if (!shareId) {
      console.log(`[SharedJourneyAPI-Supabase] ${timestamp} Invalid share ID format`);
      return NextResponse.json(
        { error: "Invalid share link" },
        { status: 400 }
      );
    }

    // Get the journey
    const journey = await unifiedDataService.getJourney(shareId);

    if (!journey || !journey.isPublic) {
      console.log(`[SharedJourneyAPI-Supabase] ${timestamp} Journey not found or not public`);
      return NextResponse.json(
        { error: "Shared journey not found" },
        { status: 404 }
      );
    }

    // Get user profile for additional context
    const userProfile = await unifiedDataService.getUserProfile(journey.userId);
    
    if (!userProfile) {
      console.log(`[SharedJourneyAPI-Supabase] ${timestamp} User profile not found`);
      return NextResponse.json(
        { error: "Journey owner not found" },
        { status: 404 }
      );
    }

    // Get all generated content for this journey
    const allGeneratedContent = await unifiedDataService.getGeneratedContent(userProfile.id);
    const journeyContent = allGeneratedContent.filter(content => 
      journey.sections.includes(content.id)
    );

    // Get section data for context
    const sectionData = await unifiedDataService.getAllSectionData(userProfile.id);
    const sectionDataMap = sectionData.reduce((acc, section) => {
      acc[section.sectionType] = section.data;
      return acc;
    }, {} as Record<string, any>);

    console.log(`[SharedJourneyAPI-Supabase] ${timestamp} Successfully retrieved journey:`, {
      journeyId: journey.id,
      sections: journey.sections.length,
      owner: userProfile.email
    });

    // Format response to match expected structure
    const response = {
      success: true,
      data: {
        journeyId: journey.id,
        title: journey.title,
        createdAt: journey.createdAt,
        ownerName: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || 'Anonymous',
        sections: journeyContent.map(content => ({
          id: content.id,
          type: content.sectionType,
          title: SECTION_SCHEMAS[content.sectionType]?.name || content.sectionType,
          content: content.response,
          createdAt: content.createdAt
        })),
        // Include user context for personalization
        userContext: {
          interests: sectionDataMap.kidsInterests?.value || [],
          grade: sectionDataMap.grade?.value || null,
          selectedSchools: sectionDataMap.selectedSchools?.value || []
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error(`[SharedJourneyAPI-Supabase] ${timestamp} Error retrieving shared journey:`, error);
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: "Failed to load shared journey"
      },
      { status: 500 }
    );
  }
}