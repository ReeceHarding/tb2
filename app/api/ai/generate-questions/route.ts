
import { NextRequest, NextResponse } from 'next/server';
import { withLLMTracking } from '@/libs/llm-analytics';

export const dynamic = 'force-dynamic';

async function callGenerateAPI(prompt: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt,
            maxTokens: 4000,
            temperature: 0.7
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Generate Questions API] AI generation API failed with status ${response.status}: ${errorText}`);
        throw new Error(`AI generation failed: ${errorText}`);
    }

    return response.json();
}

export async function POST(request: NextRequest) {
  try {
    const { interests, subject, gradeLevel = '6th' } = await request.json();
    
    console.log(`[Generate Questions API] Creating ${subject} question for interests:`, interests, `at ${gradeLevel} grade level`);
    
    const prompt = `You are creating an actual ${subject} practice question for a ${gradeLevel} grade student that they can solve. The question must be deeply connected to their specific interests to make learning engaging and personal.

STUDENT INTERESTS: ${interests.join(', ')}

CRITICAL INSTRUCTIONS:
1. Create a REAL practice question that students can actually solve
2. The question must deeply integrate their specific interests (not just mention them)
3. Make it grade-appropriate but challenging
4. Present a concrete problem with specific numbers/scenarios they can work with
5. Use only plain text in your response - no special characters, control characters, or line breaks within JSON string values

EXAMPLES OF GOOD PRACTICE QUESTIONS:

For Math + Basketball:
"LeBron James made 73% of his free throws last season. If he attempted 582 free throws total, how many did he make? Round to the nearest whole number."

For Physics + Video Games:
"In Fortnite, when you jump from the Battle Bus at 1,500 meters altitude, you fall at 50 meters per second. How long will it take to reach the ground if you deploy your glider at 200 meters?"

For Science + Harry Potter:
"If a Mandrake's cry can be heard at 150 decibels (instantly fatal to humans), and earmuffs reduce sound by 85%, what decibel level would you hear with earmuffs on? Is this safe? (Safe hearing is below 85 decibels)"

For English + Minecraft:
"Write a detailed instruction manual (3 paragraphs) explaining to a new player how to survive their first night in Minecraft. Use transition words, clear topic sentences, and specific examples."

YOUR TASK:
1. Create an actual practice question using their interests (${interests.join(', ')})
2. Include specific names, games, characters, or scenarios they care about
3. Present real numbers, scenarios, or tasks they can work with
4. Make sure there's a clear answer they can calculate/write/determine
5. The problem should feel like it comes from their world, not a textbook

CRITICAL INSTRUCTIONS:
- You MUST respond with ONLY valid JSON
- Do NOT include any markdown formatting, headers, or explanations
- Do NOT include any text before or after the JSON
- Your response must start with { and end with }
- Ensure all JSON properties are properly quoted
- Never use hyphens in any text values

Return ONLY a JSON object in this exact format:
{
  "question": "The actual practice question with specific details and numbers/scenarios from their interests that they need to solve",
  "solution": "Step by step solution showing exactly how to solve it, written in a friendly, encouraging tone",
  "learningObjective": "The specific ${subject} skill being practiced (e.g., 'calculating percentages', 'understanding gravity', 'writing clear instructions')",
  "interestConnection": "How this problem authentically uses ${interests.join(', ')} to teach the concept",
  "nextSteps": "What similar but slightly harder problems they could try next",
  "followUpQuestions": [
    "A similar problem with the same concept but different numbers/scenario",
    "A slightly harder version that builds on this skill",
    "A real world application they could explore"
  ]
}

Remember: This should be a real question they can solve, not just a discussion prompt!`;

    console.log('[Generate Questions API] Sending prompt to centralized API...');
    
    const result = await withLLMTracking(
      'generate-questions',
      'cerebras-qwen-3-coder-480b',
      async () => {
        const response = await callGenerateAPI(prompt);
        console.log(`[Generate Questions API] Using provider: ${response.provider}, latency: ${response.latencyMs}ms`);
        return { text: response.content };
      },
      {
        interests,
        subject,
        gradeLevel
      }
    );
    
    console.log('[Generate Questions API] Raw API response:', result.text);
    console.log('[Generate Questions API] Response length:', result.text.length);
    console.log('[Generate Questions API] First 100 chars:', JSON.stringify(result.text.substring(0, 100)));
    
    // Parse the JSON response
    let questionData;
    try {
      // Enhanced JSON extraction and sanitization
      let jsonText = result.text.trim();
      
      jsonText = jsonText.replace(/^\uFEFF/, '');
      jsonText = jsonText.replace(/^[\u200B-\u200D\uFEFF]/, '');
      // eslint-disable-next-line no-control-regex
      jsonText = jsonText.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        let cleanJson = jsonMatch[0];
        
        console.log('[Generate Questions API] Extracted JSON (first 200 chars):', JSON.stringify(cleanJson.substring(0, 200)));
        
        /* eslint-disable no-control-regex */
        cleanJson = cleanJson
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t')
          .replace(/\f/g, '\\f')
          .replace(/\v/g, '\\v');
        /* eslint-enable no-control-regex */
        
        console.log('[Generate Questions API] Final cleaned JSON (first 200 chars):', JSON.stringify(cleanJson.substring(0, 200)));
        
        questionData = JSON.parse(cleanJson);
        console.log('[Generate Questions API] Successfully parsed question data:', questionData);
      } else {
        throw new Error('No JSON found in API response');
      }
    } catch (parseError) {
      console.error('[Generate Questions API] Failed to parse API response as JSON:', parseError);
      console.log('[Generate Questions API] API failed, attempting fallback...');
      
      try {
        const fallbackResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/ai/generate-fallback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'question_fallback',
            interests: interests,
            subject: subject,
            gradeLevel: gradeLevel
          }),
        });

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.success) {
            console.log('[Generate Questions API] Successfully generated fallback content');
            questionData = fallbackData.data;
          } else {
            throw new Error('Fallback API returned error');
          }
        } else {
          throw new Error('Fallback API request failed');
        }
      } catch (fallbackError) {
        console.error('[Generate Questions API] Fallback generation also failed:', fallbackError);
        // Ultimate fallback with minimal hardcoded content
        questionData = {
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
      }
    }

    return NextResponse.json({
      success: true,
      data: questionData,
      metadata: {
        subject,
        interests,
        gradeLevel,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Generate Questions API] Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate personalized question',
        details: error.message
      },
      { status: 500 }
    );
  }
}
