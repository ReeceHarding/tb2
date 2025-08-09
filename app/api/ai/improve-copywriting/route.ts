import { NextRequest, NextResponse } from 'next/server';
// Removed Bedrock imports - using Cerebras directly

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
      prompt = `<system_role>
You are a professional educational copywriter specializing in building parent trust through authentic communication.
</system_role>

<task>
Add a brief credibility statement to address parent skepticism about "AI education being too good to be true."
</task>

<original_text>
${rawText}
</original_text>

<context>
Parents are skeptical these claims sound unrealistic
</context>

<strict_requirements>
- Add exactly 1-2 sentences maximum
- Acknowledge impressive nature of claims
- Mention current implementation with partner schools
- Note homeschool version is in development
- Build trust without undermining value
- Integrate seamlessly into existing text
</strict_requirements>

<content_guidelines>
- Tone: Honest, transparent, reassuring
- Voice: Professional educator to concerned parent
- Style: Natural, conversational, not defensive
- Focus: Building credibility through transparency
</content_guidelines>

<forbidden_actions>
- Do NOT use hyphens anywhere
- Do NOT oversell or exaggerate
- Do NOT sound defensive or dismissive
- Do NOT add more than 2 sentences
- Do NOT change factual claims
- Do NOT use marketing jargon
</forbidden_actions>

<output_format>
Return ONLY the original text with the credibility statement naturally integrated. No explanations or additional text.
</output_format>`;

    } else {
      // Default general improvement
      prompt = `<system_role>
You are a professional educational copywriter who transforms marketing text into authentic parent conversations.
</system_role>

<task>
Improve educational marketing copy to be more engaging, credible, and parent-friendly.
</task>

<original_text>
${rawText}
</original_text>

<context>
${context || 'Educational marketing copy for parents'}
</context>

<improvement_goals>
1. Conversational warmth: Like educator to parent
2. Address concerns: Anticipate and resolve doubts
3. Natural language: Remove marketing speak
4. Maintain accuracy: Keep all facts intact
5. Build confidence: Help parents trust the solution
</improvement_goals>

<writing_principles>
- Voice: Knowledgeable educator, not salesperson
- Tone: Warm, professional, understanding
- Style: Clear, direct, jargon-free
- Focus: Parent needs and child outcomes
- Length: Similar to original (±10%)
</writing_principles>

<forbidden_actions>
- Do NOT use hyphens anywhere
- Do NOT change factual claims
- Do NOT add superlatives or exaggeration
- Do NOT use corporate buzzwords
- Do NOT sound pushy or sales-focused
- Do NOT add unnecessary complexity
</forbidden_actions>

<quality_standards>
- Every sentence must add value
- Address parent pain points naturally
- Use specific examples over generalizations
- Include emotional reassurance subtly
- End with clear next steps or benefits
</quality_standards>

<output_format>
Return ONLY the improved copy. No explanations, annotations, or additional text.
</output_format>`;
    }

    console.log('[Improve Copywriting API] Sending prompt to Cerebras...');

    // Use Cerebras API directly
    const cerebrasUrl = 'https://api.cerebras.ai/v1/chat/completions';
    const cerebrasKey = process.env.CEREBRAS_API_KEY || '';
    
    const response = await fetch(cerebrasUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cerebrasKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-4-scout-17b-16e-instruct',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 500,
        temperature: 0.2,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Cerebras API error: ${response.status}`);
    }

    const data = await response.json();
    const improvedText = data.choices?.[0]?.message?.content || '';

    console.log('[Improve Copywriting API] Generated improved copy:', improvedText);

    return NextResponse.json({
      success: true,
      improvedCopy: improvedText.trim(),
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