import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { nanoid } from "nanoid";

export const dynamic = 'force-dynamic';

// Generate a unique, URL-safe share ID
function generateShareId(): string {
  // Using nanoid for URL-safe, collision-resistant IDs
  // 10 characters gives us 62^10 possible combinations
  return nanoid(10);
}

// POST: Create or update a shareable journey
export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log(`[ShareJourneyAPI] ${timestamp} Processing create/update shareable journey request`);

  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log(`[ShareJourneyAPI] ${timestamp} Unauthorized request - no session`);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log(`[ShareJourneyAPI] ${timestamp} Authenticated user:`, session.user.email);

    // Connect to MongoDB
    await connectMongo();
    console.log(`[ShareJourneyAPI] ${timestamp} Connected to MongoDB`);

    // Parse request body
    const body = await req.json();
    const { viewedSections } = body;

    console.log(`[ShareJourneyAPI] ${timestamp} Received data:`, {
      viewedSectionsCount: viewedSections?.length || 0
    });

    // Find the user
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      console.log(`[ShareJourneyAPI] ${timestamp} User not found`);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has completed quiz
    if (!user.quizData?.completedAt) {
      console.log(`[ShareJourneyAPI] ${timestamp} User has not completed quiz`);
      return NextResponse.json(
        { error: "Please complete the quiz first" },
        { status: 400 }
      );
    }

    // Generate share ID if not exists
    let shareId = user.shareableJourney?.shareId;
    if (!shareId) {
      shareId = generateShareId();
      console.log(`[ShareJourneyAPI] ${timestamp} Generated new share ID:`, shareId);
    }

    // Update shareable journey data
    const updateData: Record<string, any> = {
      'shareableJourney.shareId': shareId,
      'shareableJourney.isPublic': true,
      'shareableJourney.viewedSections': viewedSections || [],
      'shareableJourney.lastUpdatedAt': new Date(),
    };

    // Set createdAt only if it's a new shareable journey
    if (!user.shareableJourney?.shareId) {
      updateData['shareableJourney.createdAt'] = new Date();
    }

    // Update user with shareable journey data
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      console.error(`[ShareJourneyAPI] ${timestamp} Failed to update user`);
      return NextResponse.json(
        { error: "Failed to create shareable journey" },
        { status: 500 }
      );
    }

    console.log(`[ShareJourneyAPI] ${timestamp} Successfully created/updated shareable journey:`, {
      userId: updatedUser._id,
      shareId: shareId,
      viewedSectionsCount: viewedSections?.length || 0
    });

    // Construct the share URL using request headers for proper domain detection
    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
    const baseUrl = process.env.NEXT_PUBLIC_URL || `${protocol}://${host}`;
    const shareUrl = `${baseUrl}/shared/${shareId}`;

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Shareable journey created successfully",
      data: {
        shareId: shareId,
        shareUrl: shareUrl,
        createdAt: updatedUser.shareableJourney.createdAt,
        lastUpdatedAt: updatedUser.shareableJourney.lastUpdatedAt,
        viewedSectionsCount: viewedSections?.length || 0
      }
    });

  } catch (error) {
    console.error(`[ShareJourneyAPI] ${timestamp} Error creating shareable journey:`, error);
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: "Failed to create shareable journey. Please try again."
      },
      { status: 500 }
    );
  }
}

// GET: Retrieve own shareable journey status
export async function GET() {
  const timestamp = new Date().toISOString();
  console.log(`[ShareJourneyAPI] ${timestamp} Processing get shareable journey status request`);

  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log(`[ShareJourneyAPI] ${timestamp} Unauthorized request - no session`);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    await connectMongo();

    // Find user and their shareable journey data
    const user = await User.findOne(
      { email: session.user.email },
      { shareableJourney: 1, quizData: 1, _id: 1 }
    );

    if (!user) {
      console.log(`[ShareJourneyAPI] ${timestamp} User not found`);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has a shareable journey
    if (!user.shareableJourney?.shareId) {
      console.log(`[ShareJourneyAPI] ${timestamp} No shareable journey found`);
      return NextResponse.json({
        success: true,
        data: {
          hasShareableJourney: false,
          shareId: null,
          shareUrl: null
        }
      });
    }

    // Construct the share URL
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/shared/${user.shareableJourney.shareId}`;

    console.log(`[ShareJourneyAPI] ${timestamp} Found shareable journey:`, {
      userId: user._id,
      shareId: user.shareableJourney.shareId,
      isPublic: user.shareableJourney.isPublic
    });

    return NextResponse.json({
      success: true,
      data: {
        hasShareableJourney: true,
        shareId: user.shareableJourney.shareId,
        shareUrl: shareUrl,
        isPublic: user.shareableJourney.isPublic,
        viewedSectionsCount: user.shareableJourney.viewedSections?.length || 0,
        createdAt: user.shareableJourney.createdAt,
        lastUpdatedAt: user.shareableJourney.lastUpdatedAt,
        viewCount: user.shareableJourney.viewCount || 0
      }
    });

  } catch (error) {
    console.error(`[ShareJourneyAPI] ${timestamp} Error retrieving shareable journey status:`, error);
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: "Failed to retrieve shareable journey status."
      },
      { status: 500 }
    );
  }
}