import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import { unifiedDataService } from "@/libs/unified-data-service";
import { QuizData, QuizSaveRequest, QuizSaveResponse, QuizRetrieveResponse } from "@/types/quiz";

export const dynamic = 'force-dynamic';

// API endpoint to save quiz data and generated content to authenticated user's account using Supabase
export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log(`[QuizSaveAPI-Supabase] ${timestamp} Processing quiz data save request`);

  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log(`[QuizSaveAPI-Supabase] ${timestamp} Unauthorized request - no session`);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log(`[QuizSaveAPI-Supabase] ${timestamp} Authenticated user:`, session.user.email);

    // Parse request body
    let body: QuizSaveRequest;
    try {
      body = await req.json();
    } catch (error) {
      console.log(`[QuizSaveAPI-Supabase] ${timestamp} Invalid JSON in request body:`, error);
      return NextResponse.json(
        { error: "Invalid JSON format in request body" },
        { status: 400 }
      );
    }

    // Create or get user profile
    let userProfile = await unifiedDataService.getUserProfile(session.user.email);
    
    if (!userProfile) {
      console.log(`[QuizSaveAPI-Supabase] ${timestamp} Creating new user profile`);
      // Create user profile
      const firstName = session.user.name?.split(' ')[0];
      const lastName = session.user.name?.split(' ').slice(1).join(' ');
      userProfile = await unifiedDataService.saveUserProfile(
        session.user.email,
        {
          firstName,
          lastName
        }
      );
    }

    if (!userProfile) {
      throw new Error('Failed to create user profile');
    }

    console.log(`[QuizSaveAPI-Supabase] ${timestamp} User profile:`, userProfile.id);

    // Save quiz data as section data
    if (body.quizData) {
      console.log(`[QuizSaveAPI-Supabase] ${timestamp} Saving quiz data`);
      
      const quizSectionData = await unifiedDataService.saveSectionData(
        userProfile.id,
        'quiz-legacy',
        {
          ...body.quizData,
          completedAt: new Date().toISOString()
        }
      );

      if (!quizSectionData) {
        throw new Error('Failed to save quiz data');
      }

      // Also save individual fields for progressive system compatibility
      const fieldsToSave = {
        userType: body.quizData.userType,
        parentSubType: body.quizData.parentSubType,
        schoolSubType: body.quizData.schoolSubType,
        selectedSchools: body.quizData.selectedSchools,
        kidsInterests: body.quizData.kidsInterests,
        grade: body.quizData.grade,
      };

      for (const [key, value] of Object.entries(fieldsToSave)) {
        if (value !== undefined && value !== null) {
          await unifiedDataService.saveSectionData(
            userProfile.id,
            key,
            { value }
          );
        }
      }
    }

    // Save generated content if provided
    if (body.generatedContent) {
      console.log(`[QuizSaveAPI-Supabase] ${timestamp} Saving generated content`);
      
      const savedContent = await unifiedDataService.saveGeneratedContent(
        userProfile.id,
        'quiz-generated-content',
        'Legacy quiz completion', // prompt
        body.generatedContent,
        { componentType: 'mixed' } // Legacy schema
      );

      if (!savedContent) {
        throw new Error('Failed to save generated content');
      }
    }

    // Create a journey for the quiz completion
    const journey = await unifiedDataService.createJourney(
      userProfile.id,
      `Quiz Journey - ${new Date().toLocaleDateString()}`
    );

    console.log(`[QuizSaveAPI-Supabase] ${timestamp} Successfully saved all data`);

    return NextResponse.json<QuizSaveResponse>({
      success: true,
      message: "Quiz data saved successfully"
    });

  } catch (error) {
    console.error(`[QuizSaveAPI-Supabase] ${timestamp} Error saving quiz data:`, error);
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: "Failed to save quiz data. Please try again."
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve saved quiz data for authenticated user
export async function GET() {
  const timestamp = new Date().toISOString();
  console.log(`[QuizSaveAPI-Supabase] ${timestamp} Processing quiz data retrieval request`);

  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log(`[QuizSaveAPI-Supabase] ${timestamp} Unauthorized request - no session`);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log(`[QuizSaveAPI-Supabase] ${timestamp} Retrieving data for user:`, session.user.email);

    // Get user profile
    const userProfile = await unifiedDataService.getUserProfile(session.user.email);
    
    if (!userProfile) {
      console.log(`[QuizSaveAPI-Supabase] ${timestamp} User not found`);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get quiz data
    const quizSection = await unifiedDataService.getSectionData(userProfile.id, 'quiz-legacy');
    const generatedContentArray = await unifiedDataService.getGeneratedContent(userProfile.id, 'quiz-generated-content');
    const generatedContent = generatedContentArray.length > 0 ? generatedContentArray[0] : null;

    console.log(`[QuizSaveAPI-Supabase] ${timestamp} Found user data:`, {
      userId: userProfile.id,
      hasQuizData: !!quizSection,
      hasGeneratedContent: !!generatedContent
    });

    return NextResponse.json<QuizRetrieveResponse>({
      success: true,
      data: {
        quizData: quizSection?.data as QuizData | null,
        generatedContent: generatedContent?.response || null,
        hasCompletedQuiz: !!quizSection?.data?.completedAt
      }
    });

  } catch (error) {
    console.error(`[QuizSaveAPI-Supabase] ${timestamp} Error retrieving quiz data:`, error);
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: "Failed to retrieve quiz data. Please try again."
      },
      { status: 500 }
    );
  }
}