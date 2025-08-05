import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";

// Gender API configuration
const GENDER_API_URL = "https://gender-api.com/get";
const GENDER_API_KEY = process.env.GENDER_API_KEY || "";

export async function GET() {
  return NextResponse.json({ error: "Method not allowed. Use POST." }, { status: 405 });
}

export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log("[Gender API] Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      console.log("[Gender API] No name provided");
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    console.log(`[Gender API] Processing gender request for name: ${name}`);

    // If no API key is configured, return a default response
    if (!GENDER_API_KEY) {
      console.log("[Gender API] No API key configured, returning default response");
      // For demo purposes, return a mock response
      // In production, you would want to require the API key
      return NextResponse.json({
        gender: "unknown",
        probability: 0,
        count: 0,
        name: name,
        message: "Gender API key not configured"
      });
    }

    // Make request to Gender-API.com
    const genderApiUrl = `${GENDER_API_URL}?name=${encodeURIComponent(name)}&key=${GENDER_API_KEY}`;
    
    console.log("[Gender API] Making request to Gender-API.com");
    const response = await fetch(genderApiUrl);

    if (!response.ok) {
      console.error("[Gender API] Gender-API.com request failed:", response.status);
      throw new Error(`Gender API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("[Gender API] Response from Gender-API.com:", data);

    // Gender-API.com returns data in this format:
    // {
    //   "name": "peter",
    //   "gender": "male",
    //   "probability": 99,
    //   "count": 165452
    // }

    // Transform the response to our format
    const transformedData = {
      gender: data.gender || "unknown",
      probability: data.probability ? data.probability / 100 : 0, // Convert percentage to decimal
      count: data.count || 0,
      name: data.name || name
    };

    console.log("[Gender API] Returning transformed data:", transformedData);
    return NextResponse.json(transformedData);

  } catch (error) {
    console.error("[Gender API] Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch gender data",
        gender: "unknown",
        probability: 0,
        count: 0
      },
      { status: 500 }
    );
  }
}