
import { NextRequest, NextResponse } from 'next/server';
import { withLLMTracking } from '@/libs/llm-analytics';
import { aiPromptLogger } from '@/libs/ai-prompt-logger';

export const dynamic = 'force-dynamic';

// Centralized function to call the AI generation API
async function callGenerateAPI(prompt: string): Promise<any> {
  const cerebrasUrl = 'https://api.cerebras.ai/v1/chat/completions';
  const cerebrasKey = process.env.CEREBRAS_API_KEY || '';
  const model = 'qwen-3-coder-480b';

  const response = await fetch(cerebrasUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cerebrasKey}`
    },
    body: JSON.stringify({
      model, 
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Generate Questions API] Cerebras API error: ${response.status} - ${errorText}`);
    throw new Error(`AI generation failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No content in AI response');
  }

  return {
    content: JSON.parse(content),
    provider: 'cerebras',
    model
  };
}

export async function POST(request: NextRequest) {
  let interests, subject, gradeLevel;
  
  try {
    const requestData = await request.json();
    interests = requestData.interests;
    subject = requestData.subject;
    gradeLevel = requestData.gradeLevel || '6th';
    
    console.log(`[Generate Questions API] Creating ${subject} question for interests:`, interests, `at ${gradeLevel} grade level`);
    
    const prompt = `<system_role>
You are a TimeBack AI tutor creating personalized practice questions that deeply integrate student interests.
</system_role>

<student_context>
- Grade Level: ${gradeLevel}
- Subject: ${subject}
- Interests: ${interests.join(', ')}
</student_context>

<strict_requirements>
- Create ONE solvable practice question for ${gradeLevel} grade ${subject}
- Deeply integrate ALL listed interests: ${interests.join(', ')}
- Include specific numbers, data, or scenarios to work with
- Ensure question has a clear, calculable/determinable answer
- Match exact grade-level curriculum standards
- Use real-world contexts from their interests
</strict_requirements>

<question_criteria>
- Complexity: Grade-appropriate but engaging
- Interest Integration: Natural, not forced
- Solvability: Clear path to solution
- Relevance: Connects to real curriculum
- Engagement: Feels like their world, not textbook
</question_criteria>

<example_structures>
Math: "[Character/Interest] has [specific number] of [items]. If [specific condition with numbers], how many [specific outcome]?"
Science: "In [Interest context], when [specific phenomenon] occurs at [specific measurement], what happens to [specific variable]?"
English: "Write [specific format] about [interest topic] that includes [specific requirements] and demonstrates [specific skill]."
History: "If you were [character from interest] during [historical period], how would [specific event] affect [specific aspect]?"
</example_structures>

<solution_requirements>
- Step-by-step breakdown
- Grade-appropriate language
- Encouraging tone
- Show all work/reasoning
- Highlight key concepts
</solution_requirements>

<forbidden_actions>
- Do NOT create discussion prompts without answers
- Do NOT use generic placeholder names/numbers
- Do NOT exceed grade-level complexity
- Do NOT force interests artificially
- Do NOT include any text outside JSON
- Do NOT use markdown or formatting
- Do NOT use hyphens in any field
</forbidden_actions>

<output_validation>
- Question must be solvable by target grade
- Solution must be complete and accurate
- Learning objective must be specific
- Interest connection must be authentic
- Follow-up questions must build progressively
</output_validation>

<output_format>
{
  "question": "[Specific practice question with real numbers/scenarios from their interests]",
  "solution": "[Complete step-by-step solution with encouraging guidance]",
  "learningObjective": "[Specific ${subject} skill being practiced]",
  "interestConnection": "[How interests authentically enhance learning]",
  "nextSteps": "[Progression path for continued learning]",
  "followUpQuestions": [
    "[Similar problem with varied numbers/context]",
    "[Slightly harder problem building on same skill]",
    "[Real-world application to explore]"
  ]
}
</output_format>

RESPOND WITH ONLY THE JSON OBJECT - NO OTHER TEXT`;

    // Log the XML prompt
    aiPromptLogger.logXMLPrompt('generate-questions', prompt, {
      interests,
      subject,
      gradeLevel,
      promptLength: prompt.length
    });

    console.log('[Generate Questions API] Sending prompt to centralized API...');
    
    const result = await withLLMTracking(
      'generate-questions',
      'cerebras-qwen-3-coder-480b',
      async () => {
        const response = await callGenerateAPI(prompt);
        console.log(`[Generate Questions API] Using provider: ${response.provider}, model: ${response.model}`);
        // Return the raw JSON string for withLLMTracking to process
        return { text: JSON.stringify(response.content), provider: response.provider, model: response.model };
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
      
      // Since result.text is already a JSON string, we can parse it directly
      if (jsonText.startsWith('{') || jsonText.startsWith('[')) {
        let cleanJson = jsonText;
        
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
        const fbBase = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT || '3002'}`);
        const fallbackResponse = await fetch(`${fbBase}/api/ai/generate-fallback`, {
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
            'Try asking again?',
            'Service restored soon?', 
            'Thanks for patience?'
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
    console.error('[Generate Questions API] Error stack:', error.stack);
    console.error('[Generate Questions API] Error details:', {
      message: error.message,
      name: error.name,
      interests,
      subject,
      gradeLevel
    });
    
    // Log detailed error information for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = {
      timestamp: new Date().toISOString(),
      endpoint: 'generate-questions',
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      context: { interests, subject, gradeLevel }
    };
    
    console.error('[Generate Questions API] Detailed error log:', JSON.stringify(errorDetails, null, 2));
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate personalized question',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
