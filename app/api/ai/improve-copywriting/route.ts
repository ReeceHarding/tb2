import { NextRequest, NextResponse } from 'next/server';
import { safeBedrockAPI, rateLimiter } from '@/libs/bedrock-helpers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('[Improve Copywriting API] Starting copywriting improvement...');
    
    const { 
      rawText, 
      context, 
      type = 'personalized_copy', 
      gradeLevel = 'high school',
      schoolName = 'your school',
      prompt: customPrompt
    } = await request.json();

    console.log('[Improve Copywriting API] Raw text:', rawText);
    console.log('[Improve Copywriting API] Context:', context);
    console.log('[Improve Copywriting API] Type:', type);

    if (!rawText) {
      return NextResponse.json(
        { success: false, error: 'Raw text is required' },
        { status: 400 }
      );
    }

    // Create different prompts based on the type of copy improvement needed
    let prompt = '';

    // Use custom prompt if provided
    if (customPrompt) {
      prompt = customPrompt;
    } else if (type === 'interests_personalization') {
      prompt = `You are a professional copywriter specializing in educational marketing. Transform this raw user input into natural, personalized copy for parents reading about their child's education.

Raw user input: "${rawText}"
Context: This describes what the child is interested in/passionate about
Grade level: ${gradeLevel}
School: ${schoolName}

Transform this into natural, engaging copy that:
1. Feels human-written, not like processed user input
2. Uses "your child's passion for..." or "your child's love of..." language
3. Makes parents feel this is personally relevant to their child
4. Sounds conversational and warm
5. Avoids awkward phrasing or technical language

CRITICAL INSTRUCTIONS:
- NEVER use hyphens in your response
- Make it sound like a knowledgeable educator speaking to a parent
- Keep it concise (1-2 sentences max)
- Focus on how this interest can accelerate learning

Return only the improved copy, nothing else.`;

    } else if (type === 'grade_level_fix') {
      prompt = `You are a professional copywriter. Fix this awkward grade level reference to sound natural and professional.

Raw text: "${rawText}"
Grade level context: ${gradeLevel}

Transform phrases like "high grader" or "High Grade" into proper, natural language like:
- "high school student" 
- "your high schooler"
- "high school curriculum"
- "[specific grade] grade material"

CRITICAL INSTRUCTIONS:
- NEVER use hyphens in your response
- Make it sound professional and natural
- Keep the meaning exactly the same
- Only fix the grade level reference, don't change other content

Return only the corrected text, nothing else.`;

    } else if (type === 'credibility_disclaimer') {
      prompt = `You are a professional copywriter. Add a brief, reassuring credibility statement that addresses parent skepticism about "AI education being too good to be true."

Original text: "${rawText}"
Context: Parents are skeptical this sounds unrealistic

Add a natural disclaimer that:
1. Acknowledges these are impressive claims
2. Mentions this system currently works with partner schools
3. Notes the homeschool version is still in development
4. Builds trust without undermining the value proposition

CRITICAL INSTRUCTIONS:
- NEVER use hyphens in your response
- Keep it brief and natural (1-2 sentences)
- Don't oversell or make it sound defensive
- Make it feel authentic and honest

Return the original text plus the credibility addition, seamlessly integrated.`;

    } else {
      // Default general improvement
      prompt = `You are a professional copywriter. Improve this educational marketing copy to be more engaging, credible, and parent-friendly.

Original text: "${rawText}"
Context: ${context || 'Educational marketing copy for parents'}

Improve by:
1. Making it more conversational and warm
2. Addressing potential parent concerns
3. Using natural, professional language
4. Maintaining accuracy while improving flow
5. Making parents feel confident about the offering

CRITICAL INSTRUCTIONS:
- NEVER use hyphens in your response
- Keep all factual claims intact
- Make it sound like a knowledgeable educator speaking to a parent
- Focus on building trust and credibility

Return only the improved copy, nothing else.`;
    }

    console.log('[Improve Copywriting API] Sending prompt to Claude...');

    const result = await rateLimiter.execute(async () => {
      return await safeBedrockAPI.generateText({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        maxTokens: 500, // Keep responses focused and concise
        temperature: 0.7, // Some creativity but maintain consistency
      }, 'improve-copywriting');
    });

    console.log('[Improve Copywriting API] Generated improved copy:', result.text);

    return NextResponse.json({
      success: true,
      improvedCopy: result.text.trim(),
      originalText: rawText,
      improvementType: type,
      metadata: {
        context,
        gradeLevel,
        schoolName,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Improve Copywriting API] Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to improve copywriting',
        details: error.message
      },
      { status: 500 }
    );
  }
}