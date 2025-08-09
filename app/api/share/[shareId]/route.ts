import { NextResponse, NextRequest } from "next/server";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

export const dynamic = 'force-dynamic';

// GET: Retrieve a shared journey by shareId (MongoDB implementation)
export async function GET(
  req: NextRequest,
  { params }: { params: { shareId: string } }
) {
  const timestamp = new Date().toISOString();
  const { shareId } = params;
  
  console.log(`[SharedJourneyAPI] ${timestamp} Processing shared journey retrieval for ID:`, shareId);

  try {
    // Validate shareId format
    if (!shareId || shareId.length !== 10) {
      console.log(`[SharedJourneyAPI] ${timestamp} Invalid share ID format`);
      return NextResponse.json(
        { error: "Invalid share link" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectMongo();
    console.log(`[SharedJourneyAPI] ${timestamp} Connected to MongoDB`);

    // Find user by shareId and ensure journey is public
    const user = await User.findOne({
      'shareableJourney.shareId': shareId,
      'shareableJourney.isPublic': true
    });

    if (!user) {
      console.log(`[SharedJourneyAPI] ${timestamp} Shared journey not found or not public`);
      return NextResponse.json(
        { error: "Shared journey not found" },
        { status: 404 }
      );
    }

    // Check if user has quiz data and generated content
    if (!user.quizData?.completedAt) {
      console.log(`[SharedJourneyAPI] ${timestamp} User has incomplete quiz data`);
      return NextResponse.json(
        { error: "This journey is incomplete" },
        { status: 400 }
      );
    }

    // Increment view count
    await User.updateOne(
      { _id: user._id },
      { $inc: { 'shareableJourney.viewCount': 1 } }
    );

    console.log(`[SharedJourneyAPI] ${timestamp} Successfully retrieved shared journey:`, {
      shareId: shareId,
      userId: user._id,
      viewedSectionsCount: user.shareableJourney.viewedSections?.length || 0,
      newViewCount: (user.shareableJourney.viewCount || 0) + 1
    });

    // Prepare response data - remove sensitive information
    const responseData = {
      success: true,
      data: {
        shareId: shareId,
        parentName: user.name || "A TimeBack Parent",
        quizData: {
          userType: user.quizData.userType,
          parentSubType: user.quizData.parentSubType,
          schoolSubType: user.quizData.schoolSubType,
          grade: user.quizData.grade,
          numberOfKids: user.quizData.numberOfKids,
          selectedSchools: user.quizData.selectedSchools,
          kidsInterests: user.quizData.kidsInterests,
          completedAt: user.quizData.completedAt
        },
        generatedContent: user.generatedContent,
        viewedSections: user.shareableJourney.viewedSections || [],
        createdAt: user.shareableJourney.createdAt,
        viewCount: (user.shareableJourney.viewCount || 0) + 1
      }
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error(`[SharedJourneyAPI] ${timestamp} Error retrieving shared journey:`, error);
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: "Failed to load shared journey. Please try again."
      },
      { status: 500 }
    );
  }
}