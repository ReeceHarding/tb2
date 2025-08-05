import { NextRequest, NextResponse } from 'next/server';
import { withLLMTracking } from '@/libs/llm-analytics';
import { invokeClaude, formatClaudeResponse, ClaudeMessage } from '@/libs/bedrock-claude';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  console.log('[Generate Follow-up Questions API] Request received');
  
  try {
    const { sectionId, context, previousContent } = await req.json();
    
    console.log('[Generate Follow-up Questions API] Input:', { 
      sectionId, 
      contextKeys: Object.keys(context || {}),
      previousContentLength: previousContent?.length || 0
    });

    // Read the whitepaper content
    const whitepaperContent = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/data/timeback-whitepaper.md`)
      .then(res => res.text())
      .catch(() => '');

    const systemPrompt = `# TimeBack Education Data Analyst

You are a TimeBack education data analyst creating compelling content for parents. Generate responses using **ONLY** the provided TimeBack white paper content.

## Core Requirements

- **Output**: Single JSON object with clear, structured content
- **Data sourcing**: EXCLUSIVELY from white paper content - **zero tolerance for fabricated content**
- **Personalization**: Tailor content based on user context
- **Response format**: ONLY valid JSON - no explanations, no markdown, no additional text before or after the JSON object
- **Quality standard**: Each response must build trust through transparency and evidence-based insights

## Forbidden Actions

⚠️ **NEVER** perform any of the following:
- Generate fake data, estimates, or approximations
- Use hyphens in any content generation
- Repeat content from previous questions
- Create content not based on white paper evidence
- Add any text, explanations, or formatting outside the JSON object
- Include markdown formatting, code blocks, or introductory text`;

    const userPrompt = `Generate 3 follow-up questions for section "${sectionId}" that would help parents understand TimeBack better.

Context about the user:
${JSON.stringify(context, null, 2)}

Previous questions they've already explored:
${previousContent?.join(', ') || 'None'}

The questions should:
1. Be relevant to the current section topic
2. Help parents understand how TimeBack specifically helps their child
3. Not repeat any previous questions
4. Be conversational and parent-friendly

CRITICAL INSTRUCTIONS:
- You MUST respond with ONLY valid JSON
- Do NOT include any markdown formatting, headers, or explanations
- Do NOT include any text before or after the JSON
- Your response must start with { and end with }
- Ensure all JSON properties are properly quoted
- Never use hyphens in any text values

Return ONLY a JSON object in this exact format:
{
  "questions": [
    "First question here",
    "Second question here", 
    "Third question here"
  ]
}`;

    const messages: ClaudeMessage[] = [
      { 
        role: 'user', 
        content: `<knowledge_base>\n<educational_background>${whitepaperContent}</educational_background>\n</knowledge_base>\n\n${userPrompt}`
      }
    ];

    const response = await withLLMTracking(
      'generate-follow-up-questions',
      'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
      () => invokeClaude(messages, {
        maxTokens: 1000,
        system: systemPrompt
      }),
      {
        section: sectionId,
        interests: context?.interests,
        gradeLevel: context?.gradeLevel,
        relatedToAnswer: context?.relatedToAnswer?.substring(0, 50)
      }
    );

    const responseText = formatClaudeResponse(response);
    
    try {
      const parsed = JSON.parse(responseText);
      console.log('[Generate Follow-up Questions API] Generated questions:', parsed.questions);
      
      return NextResponse.json({ 
        success: true, 
        questions: parsed.questions 
      });
    } catch (parseError) {
      console.error('[Generate Follow-up Questions API] Parse error:', parseError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to parse AI response' 
      });
    }

  } catch (error) {
    console.error('[Generate Follow-up Questions API] Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate questions' 
    }, { status: 500 });
  }
}