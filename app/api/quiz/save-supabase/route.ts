import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import { unifiedDataService } from "@/libs/unified-data-service";
import { QuizData, QuizSaveRequest, QuizSaveResponse, QuizRetrieveResponse } from "@/types/quiz";

export const dynamic = 'force-dynamic';

// API endpoint to retrieve quiz data for an authenticated user
export async function GET(req: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log(`[QuizRetrieveAPI-Supabase] ${timestamp} Processing quiz data retrieve request`);

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log(`[QuizRetrieveAPI-Supabase] ${timestamp} Unauthorized request - no session`);
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    console.log(`[QuizRetrieveAPI-Supabase] ${timestamp} Authenticated user:`, session.user.email);

    let userProfile = await unifiedDataService.getUserProfile(session.user.email);
    if (!userProfile) {
      console.log(`[QuizRetrieveAPI-Supabase] ${timestamp} No profile found for user, creating one...`);
      const firstName = session.user.name?.split(' ')[0];
      const lastName = session.user.name?.split(' ').slice(1).join(' ');
      userProfile = await unifiedDataService.saveUserProfile(
        session.user.email,
        {
          firstName,
          lastName
        }
      );
      if (!userProfile) {
        throw new Error('Failed to create user profile');
      }
      console.log(`[QuizRetrieveAPI-Supabase] ${timestamp} New user profile created:`, userProfile.id);
    } else {
      console.log(`[QuizRetrieveAPI-Supabase] ${timestamp} User profile found:`, userProfile.id);
    }

    // Fetch all section data for the user
    const allData = await unifiedDataService.getAllSectionData(userProfile.id);
    const quizDataRaw = allData.find(d => d.sectionType === 'quiz-legacy')?.data || {};
    const generatedContentResult = await unifiedDataService.getGeneratedContent(userProfile.id, 'quiz-generated-content');
    const generatedContent = generatedContentResult.length > 0 ? generatedContentResult.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].response : null;

    // Convert raw data to QuizData type
    const quizData: QuizData | null = quizDataRaw && Object.keys(quizDataRaw).length > 0 ? {
      userType: quizDataRaw.userType || 'parents',
      parentSubType: quizDataRaw.parentSubType,
      schoolSubType: quizDataRaw.schoolSubType,
      grade: quizDataRaw.grade,
      numberOfKids: quizDataRaw.numberOfKids || 1,
      selectedSchools: quizDataRaw.selectedSchools || [],
      kidsInterests: quizDataRaw.kidsInterests || []
    } : null;

    const responseData: QuizRetrieveResponse = {
      success: true,
      data: {
        quizData,
        generatedContent,
        hasCompletedQuiz: !!quizData
      }
    };

    console.log(`[QuizRetrieveAPI-Supabase] ${timestamp} Successfully retrieved data for user:`, {
      userId: userProfile.id,
      hasQuizData: !!quizData,
      hasGeneratedContent: !!generatedContent,
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error(`[QuizRetrieveAPI-Supabase] ${timestamp} Error retrieving quiz data:`, error);
    return NextResponse.json(
      { error: "Internal server error", message: "Failed to retrieve quiz data." },
      { status: 500 }
    );
  }
}

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