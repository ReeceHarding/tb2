import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { QuizSaveRequest, QuizSaveResponse, QuizRetrieveResponse } from "@/types/quiz";

export const dynamic = 'force-dynamic';

// API endpoint to save quiz data and generated content to authenticated user's account
export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log(`[QuizSaveAPI] ${timestamp} Processing quiz data save request`);

  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log(`[QuizSaveAPI] ${timestamp} Unauthorized request - no session`);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log(`[QuizSaveAPI] ${timestamp} Authenticated user:`, session.user.email);

    // Connect to MongoDB
    await connectMongo();
    console.log(`[QuizSaveAPI] ${timestamp} Connected to MongoDB`);

    // Parse request body with error handling
    let body;
    try {
      const contentLength = req.headers.get('content-length');
      if (!contentLength || contentLength === '0') {
        console.log(`[QuizSaveAPI] ${timestamp} Empty request body`);
        return NextResponse.json(
          { error: "Request body is required" },
          { status: 400 }
        );
      }
      body = await req.json();
    } catch (error) {
      console.log(`[QuizSaveAPI] ${timestamp} Invalid JSON in request body:`, error);
      return NextResponse.json(
        { error: "Invalid JSON format in request body" },
        { status: 400 }
      );
    }
    
    const { quizData, generatedContent, partial } = body;

    console.log(`[QuizSaveAPI] ${timestamp} Received data:`, {
      hasQuizData: !!quizData,
      hasGeneratedContent: !!generatedContent,
      isPartialSave: !!partial,
      userType: quizData?.userType,
      schoolsCount: quizData?.selectedSchools?.length || 0,
      interestsCount: quizData?.kidsInterests?.length || 0
    });

    // Validate required quiz data fields
    if (!quizData) {
      console.log(`[QuizSaveAPI] ${timestamp} Missing quiz data in request`);
      return NextResponse.json(
        { error: "Quiz data is required" },
        { status: 400 }
      );
    }

    // For partial saves, merge with existing data
    let updateData: any;
    
    if (partial) {
      // Find existing user data first
      const existingUser = await User.findOne({ email: session.user.email });
      const existingQuizData = existingUser?.quizData || {};
      
      console.log(`[QuizSaveAPI] ${timestamp} Partial save - merging with existing data:`, {
        hasExistingData: !!existingUser,
        existingSchools: existingQuizData.selectedSchools?.length || 0,
        existingInterests: existingQuizData.kidsInterests?.length || 0
      });
      
      // Merge the data
      updateData = {
        quizData: {
          ...existingQuizData,
          ...quizData,
          // Don't set completedAt for partial saves
          completedAt: quizData.completedAt || existingQuizData.completedAt,
          updatedAt: new Date().toISOString()
        }
      };
    } else {
      // Full save - replace all quiz data
      updateData = {
        quizData: {
          ...quizData,
          completedAt: quizData.completedAt || new Date().toISOString(),
        }
      };
    }

    // Add generated content if provided
    if (generatedContent) {
      updateData.generatedContent = {
        ...generatedContent,
        generatedAt: new Date().toISOString(),
      };
      console.log(`[QuizSaveAPI] ${timestamp} Including generated content:`, {
        hasAfternoonActivities: !!generatedContent.afternoonActivities,
        hasSubjectExamples: !!generatedContent.subjectExamples,
        hasHowWeGetResults: !!generatedContent.howWeGetResults,
        hasFollowUpQuestions: !!generatedContent.followUpQuestions,
        allCompleted: generatedContent.allCompleted,
        hasErrors: generatedContent.hasErrors
      });
    }

    // Find user and update with quiz data
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      updateData,
      { 
        upsert: true, // Create user if doesn't exist
        new: true,    // Return updated document
        runValidators: true // Run mongoose validation
      }
    );

    if (!user) {
      console.error(`[QuizSaveAPI] ${timestamp} Failed to create or update user`);
      return NextResponse.json(
        { error: "Failed to save quiz data" },
        { status: 500 }
      );
    }

    console.log(`[QuizSaveAPI] ${timestamp} Successfully saved quiz data for user:`, {
      userId: user._id,
      email: user.email,
      quizCompleted: !!user.quizData?.completedAt,
      hasGeneratedContent: !!user.generatedContent?.generatedAt
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Quiz data saved successfully",
      data: {
        userId: user._id,
        quizCompleted: !!user.quizData?.completedAt,
        hasGeneratedContent: !!user.generatedContent?.generatedAt,
        savedAt: timestamp
      }
    });

  } catch (error) {
    console.error(`[QuizSaveAPI] ${timestamp} Error saving quiz data:`, error);
    
    // Check if it's a validation error
    if (error.name === 'ValidationError') {
      console.error(`[QuizSaveAPI] ${timestamp} Validation error details:`, error.errors);
      return NextResponse.json(
        { 
          error: "Invalid quiz data format",
          details: Object.keys(error.errors).map(key => ({
            field: key,
            message: error.errors[key].message
          }))
        },
        { status: 400 }
      );
    }

    // Generic error response
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
  console.log(`[QuizSaveAPI] ${timestamp} Processing quiz data retrieval request`);

  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log(`[QuizSaveAPI] ${timestamp} Unauthorized request - no session`);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log(`[QuizSaveAPI] ${timestamp} Retrieving data for user:`, session.user.email);

    // Connect to MongoDB
    await connectMongo();

    // Find user and their quiz data
    const user = await User.findOne(
      { email: session.user.email },
      { quizData: 1, generatedContent: 1, _id: 1 }
    );

    if (!user) {
      console.log(`[QuizSaveAPI] ${timestamp} User not found`);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log(`[QuizSaveAPI] ${timestamp} Found user data:`, {
      userId: user._id,
      hasQuizData: !!user.quizData?.completedAt,
      hasGeneratedContent: !!user.generatedContent?.generatedAt
    });

    return NextResponse.json({
      success: true,
      data: {
        quizData: user.quizData || null,
        generatedContent: user.generatedContent || null,
        hasCompletedQuiz: !!user.quizData?.completedAt
      }
    });

  } catch (error) {
    console.error(`[QuizSaveAPI] ${timestamp} Error retrieving quiz data:`, error);
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: "Failed to retrieve quiz data. Please try again."
      },
      { status: 500 }
    );
  }
}