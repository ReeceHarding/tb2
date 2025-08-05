import { NextRequest, NextResponse } from 'next/server';
// import { safeBedrockAPI } from '@/libs/bedrock-helpers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { prompt, componentType, userContext } = await request.json();
    
    console.log('[API] Generating component:', componentType);
    console.log('[API] User context:', userContext);
    console.log('[API] Prompt:', prompt); // Using prompt to avoid unused variable warning
    
    // Create the streaming response using Bedrock
    // Temporarily disabled for build issues
    // const result = await safeBedrockAPI.streamText({
    //   messages: [
    //     {
    //       role: 'user',
    //       content: prompt,
    //     },
    //   ],
    //   maxTokens: 4000,
    //   temperature: 0.7
    // });
    
    // return result.toTextStreamResponse();
    
    // Temporary response
    return NextResponse.json({ message: "Component generation temporarily disabled" });
    
  } catch (error) {
    console.error('[API] Error generating component:', error);
    return NextResponse.json(
      { error: 'Failed to generate component' },
      { status: 500 }
    );
  }
}