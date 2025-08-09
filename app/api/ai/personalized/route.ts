import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('[personalized] API route called');
  
  try {
    const body = await request.json();
    const { 
      question, 
      quizData, 
      conversationHistory = [], 
      interests = [], 
      gradeLevel = 'high school', 
      source = 'personalized-page',
      requestSchema = true,
      metadata = {}
    } = body;
    
    console.log('[personalized] Processing question:', question);
    console.log('[personalized] Source:', source);
    console.log('[personalized] Request schema:', requestSchema);
    console.log('[personalized] Quiz data keys:', quizData ? Object.keys(quizData) : 'none');
    console.log('[personalized] Conversation history length:', conversationHistory.length);

    if (!question?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      );
    }

    // Forward the request to the chat-tutor endpoint with schema format
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const chatTutorResponse = await fetch(`${baseUrl}/api/ai/chat-tutor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question.trim(),
        interests,
        subject: 'general',
        gradeLevel,
        context: {
          parentType: quizData?.parentSubType,
          school: quizData?.selectedSchools?.[0]?.name,
          numberOfKids: quizData?.numberOfKids,
          selectedSchools: quizData?.selectedSchools,
          kidsInterests: interests,
          source: source,
          previousConversation: conversationHistory.length > 0 ? 
            conversationHistory.slice(-4).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n') : 
            'No previous context'
        },
        messageHistory: conversationHistory,
        responseFormat: 'schema',
        quizData,
        stream: false
      }),
    });

    if (!chatTutorResponse.ok) {
      console.error('[personalized] Chat tutor API failed:', chatTutorResponse.status, await chatTutorResponse.text());
      return NextResponse.json(
        { success: false, error: 'Failed to generate personalized response' },
        { status: 500 }
      );
    }

    const chatTutorData = await chatTutorResponse.json();
    console.log('[personalized] Chat tutor response received:', !!chatTutorData.success);
    console.log('[personalized] Response format:', chatTutorData.responseFormat);
    
    if (!chatTutorData.success) {
      console.error('[personalized] Chat tutor returned error:', chatTutorData.error);
      return NextResponse.json(
        { success: false, error: chatTutorData.error || 'Failed to generate response' },
        { status: 500 }
      );
    }

    // Return the response in the expected format
    return NextResponse.json({
      success: true,
      responseFormat: 'schema',
      response: chatTutorData.response,
      metadata: {
        ...metadata,
        processedAt: new Date().toISOString(),
        source: source
      }
    });

  } catch (error) {
    console.error('[personalized] API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process personalized request',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}