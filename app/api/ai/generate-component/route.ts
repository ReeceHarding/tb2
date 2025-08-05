import { NextRequest, NextResponse } from 'next/server';
import { safeBedrockAPI } from '@/libs/bedrock-helpers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { prompt, componentType, userContext } = await request.json();
    
    console.log('[API] Generating component:', componentType);
    console.log('[API] User context:', userContext);
    
    // Create the streaming response using Bedrock
    const result = await safeBedrockAPI.streamText({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      maxTokens: 4000,
      temperature: 0.7
    });
    
    return result.toTextStreamResponse();
    
  } catch (error) {
    console.error('[API] Error generating component:', error);
    return NextResponse.json(
      { error: 'Failed to generate component' },
      { status: 500 }
    );
  }
}