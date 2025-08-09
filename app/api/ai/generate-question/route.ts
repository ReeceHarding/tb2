import { NextRequest, NextResponse } from 'next/server';
import { withLLMTracking } from '@/libs/llm-analytics';

export const dynamic = 'force-dynamic';

async function callGenerateAPI(prompt: string) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT || '3002'}`);
    const response = await fetch(`${baseUrl}/api/ai/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt,
            maxTokens: 1000,
            temperature: 0.8
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Generate Question API] AI generation API failed with status ${response.status}: ${errorText}`);
        throw new Error(`AI generation failed: ${errorText}`);
    }

    return response.json();
}

export async function POST(request: NextRequest) {
  try {
    const { quizData, interests, gradeLevel, existingQuestions, timestamp } = await request.json();
    
    console.log(`[${timestamp}] [Generate Question API] Creating exploration question for ${gradeLevel} student with interests:`, interests);
    console.log(`[${timestamp}] [Generate Question API] Existing questions to avoid:`, existingQuestions);
    
    const prompt = `You are creating a personalized exploration question for a parent who wants to learn more about TimeBack education. Generate ONE compelling question that would help them understand how TimeBack could benefit their specific child.

CHILD'S PROFILE:
- Grade Level: ${gradeLevel}
- Interests: ${interests.join(', ')}
- Quiz Data: ${JSON.stringify(quizData)}

EXISTING QUESTIONS TO AVOID (create something different):
${existingQuestions.map((q: string) => `- ${q}`).join('\n')}

CRITICAL INSTRUCTIONS:
1. Create a question that feels personally relevant to their child's specific situation
2. The question should explore a unique aspect of TimeBack not covered by existing questions
3. Make it conversational and parent-focused (not academic)
4. Focus on outcomes, benefits, or practical implementation
5. Keep it under 12 words and make it actionable
6. Use plain text only - no special formatting

GOOD EXAMPLES:
- "How would this work for my shy ${gradeLevel} grader?"
- "What if my child struggles with ${interests[0]}?"
- "Could this help with my child's ${interests[0]} passion?"
- "How do you handle kids who hate traditional school?"
- "What does success look like for ${gradeLevel} students?"

YOUR TASK:
Generate ONE personalized exploration question that would be genuinely helpful for this parent to explore. The question should feel like something they would naturally want to ask about their specific child.

Respond with ONLY the question text - no quotes, no formatting, no explanation. Just the question.`;

    console.log(`[${timestamp}] [Generate Question API] Sending prompt to centralized API...`);
    
    const result = await withLLMTracking(
      'generate-exploration-question',
      'cerebras-qwen-3-coder-480b',
      async () => {
        const response = await callGenerateAPI(prompt);
        console.log(`[${timestamp}] [Generate Question API] Using provider: ${response.provider}, latency: ${response.latencyMs}ms`);
        return { text: response.content };
      },
      {
        interests,
        gradeLevel,
        questionsCount: existingQuestions.length
      }
    );
    
    console.log(`[${timestamp}] [Generate Question API] Raw API response:`, result.text);
    
    // Clean and extract the question
    let question = result.text.trim();
    
    // Remove any quotes or formatting
    question = question.replace(/^["']|["']$/g, '');
    question = question.replace(/^\*\*|^##|^#/, '');
    question = question.trim();
    
    // Ensure it ends with a question mark
    if (!question.endsWith('?')) {
      question += '?';
    }
    
    // Validate the question isn't too similar to existing ones
    const isUnique = !existingQuestions.some((existing: string) => 
      existing.toLowerCase().includes(question.toLowerCase().substring(0, 20)) ||
      question.toLowerCase().includes(existing.toLowerCase().substring(0, 20))
    );
    
    if (!isUnique) {
      // Generate a fallback personalized question
      const fallbackQuestions = [
        `How would TimeBack help my ${gradeLevel} child who loves ${interests[0] || 'learning'}?`,
        `What specific results could I expect for my ${gradeLevel} student?`,
        `How does TimeBack adapt to different learning styles for ${gradeLevel} students?`,
        `What would a typical day look like for my ${gradeLevel} child?`,
        `How do you keep ${gradeLevel} students motivated with this approach?`
      ];
      
      const availableFallbacks = fallbackQuestions.filter((fb: string) => 
        !existingQuestions.some((existing: string) => existing.toLowerCase().includes(fb.toLowerCase().substring(0, 20)))
      );
      
      question = availableFallbacks.length > 0 
        ? availableFallbacks[Math.floor(Math.random() * availableFallbacks.length)]
        : `Tell me more about TimeBack for my ${gradeLevel} student?`;
    }
    
    console.log(`[${timestamp}] [Generate Question API] Final generated question:`, question);

    return NextResponse.json({
      success: true,
      question: question,
      metadata: {
        gradeLevel,
        interests,
        timestamp,
        isPersonalized: true
      }
    });

  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [Generate Question API] Error:`, error);
    
    // Fallback question if generation fails
    const { interests = [], gradeLevel = 'elementary' } = await request.json().catch(() => ({}));
    const fallbackQuestion = `How would TimeBack help my ${gradeLevel} child who loves ${interests[0] || 'learning'}?`;
    
    return NextResponse.json({
      success: true,
      question: fallbackQuestion,
      metadata: {
        gradeLevel,
        interests,
        timestamp,
        isPersonalized: false,
        isFallback: true
      }
    });
  }
}