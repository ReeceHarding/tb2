
import { NextRequest, NextResponse } from 'next/server';

async function callGenerateAPI(prompt: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt,
            maxTokens: 2000,
            temperature: 0.8
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Generate Fallback API] AI generation API failed with status ${response.status}: ${errorText}`);
        throw new Error(`AI generation failed: ${errorText}`);
    }

    return response.json();
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      type = 'question_fallback', // Default to question_fallback if type is undefined
      interests = [], 
      subject = 'general', 
      gradeLevel = '6th',
      context = null 
    } = body;
    
    // Validate required parameters
    if (!type) {
      console.error('[Generate Fallback API] Missing type parameter in request:', body);
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required parameter: type',
          details: 'Please specify type as one of: question_fallback, chat_suggestions, how_we_get_results'
        },
        { status: 400 }
      );
    }
    
    console.log(`[Generate Fallback API] Creating ${type} fallback content for ${subject} with interests:`, interests);
    console.log('[Generate Fallback API] Using new centralized API for better reliability');
    console.log('[Generate Fallback API] Full request body:', body);
    
    let prompt = '';
    
    switch (type) {
      case 'question_fallback':
        prompt = `You are creating an incredibly engaging ${subject} question that will make a ${gradeLevel} grader think "Whoa, I never thought about that!" (This is a fallback when the main system fails, but it should be just as engaging!)

STUDENT INTERESTS: ${interests.join(', ')}

CRITICAL: Your question MUST follow this exact pattern:

**HOOK FORMAT**: Start with "Have you ever wondered why..." or "Have you ever noticed that..." followed by a fascinating real-world observation that connects to their interests.

**DISCOVERY LEAD**: After the hook, pose a specific question that leads kids to discover the underlying ${subject} concept, but DON'T give away the answer.

**YOUR TASK**: 
1. Create a hook question that connects their interests (${interests.join(', ')}) to ${subject}
2. Use specific athletes, games, shows, or activities they mentioned  
3. Lead them to discover concepts without stating them directly
4. Make them think "I want to figure this out!"
5. The question should naturally make them want to ask follow-up questions

**TONE**: Conversational, excited, like a friend sharing something cool they just discovered

Return JSON in this exact format (no extra text):
{
  "question": "Start with your engaging hook question, then lead into the discovery question that makes them think",
  "solution": "Step-by-step explanation that reveals the concept they should discover, written like you're talking to a curious friend",
  "learningObjective": "The specific ${subject} concept they should discover (not just 'math concepts')",
  "interestConnection": "Exactly how this connects to ${interests.join(', ')} in a way that feels natural, not forced",
  "nextSteps": "What related questions they might want to explore next",
  "followUpQuestions": [
    "A question that digs deeper into the same concept",
    "A question that applies this concept to a different scenario from their interests", 
    "A question that connects this to a broader principle they could discover"
  ]
}

Remember: Make them CURIOUS, not confused. The goal is to hook them with genuine wonder about something they care about!

CRITICAL: Use only plain text in your response - no special characters, control characters, or line breaks within JSON string values.`;
        break;
        
      case 'chat_suggestions':
        prompt = `Generate 3 contextual chat suggestions for an AI tutor interface.

Student context:
- Current subject: ${subject}
- Interests: ${interests.join(', ')}
- Grade level: ${gradeLevel}
${context ? `- Current question context: ${context}` : ''}

Create engaging question suggestions that encourage deeper learning and connect to their interests.
Make them specific to ${subject} and relevant to ${interests.join(', ')}.

Return JSON array in this exact format (no extra text or special characters):
[
  "Specific question about ${subject} that relates to ${interests[0]}",
  "Question about real-world applications of ${subject}",
  "Question about careers or advanced topics in ${subject}"
]

CRITICAL: Use only plain text in your response - no special characters, control characters, or line breaks within JSON string values.`;
        break;
        
      case 'how_we_get_results':
        prompt = `Create personalized content explaining how Timeback will help a ${gradeLevel} grade student reach the 98th percentile.

Student context:
- Grade level: ${gradeLevel}
- Interests: ${interests.join(', ')}
- Learning goals: ${context?.learningGoals?.join(', ') || 'academic excellence'}
- Primary interest: ${context?.primaryInterest || interests[0] || 'learning'}

Generate compelling, parent-focused content that:
1. Emphasizes AI personalization specific to their child
2. References the child's actual interests and grade level
3. Explains the methodology in terms parents understand
4. Avoids generic statements - be specific to this child

Return JSON in this exact format (no extra text or special characters):
{
  "title": "Compelling headline mentioning grade level",
  "subtitle": "Specific subtitle referencing their interests",
  "points": [
    {
      "title": "Key benefit title",
      "description": "Specific explanation for their child"
    }
  ]
}

CRITICAL: Use only plain text in your response - no special characters, control characters, or line breaks within JSON string values.`;
        break;
        
      default:
        console.error(`[Generate Fallback API] Unknown fallback type: ${type}`);
        return NextResponse.json(
          { 
            success: false,
            error: `Unknown fallback type: ${type}`,
            details: 'Valid types are: question_fallback, chat_suggestions, how_we_get_results',
            receivedType: type,
            validTypes: ['question_fallback', 'chat_suggestions', 'how_we_get_results']
          },
          { status: 400 }
        );
    }

    console.log('[Generate Fallback API] Sending prompt to centralized API...');
    
    const response = await callGenerateAPI(prompt);
    
    console.log(`[Generate Fallback API] Using provider: ${response.provider}, latency: ${response.latencyMs}ms`);
    
    const result = { text: response.content };
    
    console.log('[Generate Fallback API] Raw API response:', result.text);
    console.log('[Generate Fallback API] Response length:', result.text.length);
    console.log('[Generate Fallback API] First 100 chars:', JSON.stringify(result.text.substring(0, 100)));
    
    // Parse the JSON response
    let fallbackData;
    try {
      // Enhanced JSON extraction and sanitization
      let jsonText = result.text.trim();
      
      jsonText = jsonText.replace(/^\uFEFF/, '');
      jsonText = jsonText.replace(/^[\u200B-\u200D\uFEFF]/, '');
      // eslint-disable-next-line no-control-regex
      jsonText = jsonText.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      
      const jsonMatch = jsonText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        let cleanJson = jsonMatch[0];
        
        console.log('[Generate Fallback API] Extracted JSON (first 200 chars):', JSON.stringify(cleanJson.substring(0, 200)));
        
        try {
          cleanJson = cleanJson
            // eslint-disable-next-line no-control-regex
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
            .replace(/(?<!\\)"/g, '"')
            .replace(/\\n/g, '\\n')
            .replace(/(?<!\\)\n/g, '\\n')
            .replace(/(?<!\\)\r/g, '\\r')
            .replace(/(?<!\\)\t/g, '\\t')
            .replace(/(?<!\\)\f/g, '\\f')
            .replace(/(?<!\\)\v/g, '\\v');
        } catch (cleanError) {
          console.log('[Generate Fallback API] Lookbehind not supported, using simpler approach');
          cleanJson = cleanJson
            // eslint-disable-next-line no-control-regex
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t')
            .replace(/\f/g, '\\f')
            .replace(/\v/g, '\\v');
        }
        
        console.log('[Generate Fallback API] Final cleaned JSON (first 200 chars):', JSON.stringify(cleanJson.substring(0, 200)));
        
        fallbackData = JSON.parse(cleanJson);
        console.log('[Generate Fallback API] Successfully parsed fallback data:', fallbackData);
      } else {
        throw new Error('No JSON found in API response');
      }
    } catch (parseError) {
      console.error('[Generate Fallback API] Failed to parse API response as JSON:', parseError);
      
      if (type === 'question_fallback') {
        fallbackData = {
          question: `${subject} problem related to ${interests[0] || 'your interests'} (AI temporarily unavailable)`,
          solution: 'Solution would be provided when AI service is restored.',
          learningObjective: `Core ${subject} concepts`,
          interestConnection: `Connected to ${interests[0] || 'student interests'}`,
          nextSteps: 'Try again when AI service is available',
          followUpQuestions: [
            'Please try your question again',
            'AI service will be restored shortly',
            'Thank you for your patience'
          ]
        };
      } else if (type === 'chat_suggestions') {
        fallbackData = [
          'Please try your question again',
          'AI service temporarily unavailable',
          'Thank you for your patience'
        ];
      }
    }

    return NextResponse.json({
      success: true,
      data: fallbackData,
      metadata: {
        type,
        subject,
        interests,
        gradeLevel,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Generate Fallback API] Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate fallback content',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
