import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { safeBedrockAPI } from '@/libs/bedrock-helpers';

// Initialize OpenAI client for final fallback
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Helper function to call AI providers with fallback pattern
async function generateCustomResponse(prompt: string, systemPrompt: string): Promise<any> {
  const startTime = Date.now();
  
  // 1. Try Cerebras first (fastest)
  try {
    console.log('[Custom Question] Attempting generation with Cerebras...');
    
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ];
    
    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-3-235b-a22b-instruct-2507',
        messages,
        max_tokens: 1024,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cerebras API error: ${response.status} - ${error}`);
    }

    const completion = await response.json();
    const content = completion.choices[0]?.message?.content || '';
    
    console.log(`[Custom Question] Cerebras successful in ${Date.now() - startTime}ms`);
    
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error('[Custom Question] Failed to parse Cerebras response as JSON:', content);
      throw new Error('Invalid JSON response from Cerebras');
    }
    
  } catch (cerebrasError) {
    console.log('[Custom Question] Cerebras failed, falling back to AWS Bedrock:', cerebrasError);
    
    // 2. Try AWS Bedrock as first fallback
    try {
      const bedrockStartTime = Date.now();
      
      const fullPrompt = `${systemPrompt}\n\n${prompt}`;
      
      const bedrockResult = await safeBedrockAPI.generateText({
        prompt: fullPrompt,
        maxTokens: 1024,
        temperature: 0.7
      }, 'custom-question-fallback');
      
      const content = bedrockResult.text;
      
      console.log(`[Custom Question] AWS Bedrock successful in ${Date.now() - bedrockStartTime}ms`);
      
      try {
        return JSON.parse(content);
      } catch (e) {
        console.error('[Custom Question] Failed to parse Bedrock response as JSON:', content);
        throw new Error('Invalid JSON response from Bedrock');
      }
      
    } catch (bedrockError) {
      console.log('[Custom Question] Bedrock failed, falling back to OpenAI:', bedrockError);
      
      // 3. Try OpenAI GPT-4 Turbo as final fallback
      try {
        const openaiStartTime = Date.now();
        
        const completion = await openaiClient.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1024,
          temperature: 0.7,
          response_format: { type: "json_object" }
        });

        const content = completion.choices[0]?.message?.content || '';
        
        console.log(`[Custom Question] OpenAI successful in ${Date.now() - openaiStartTime}ms`);
        
        try {
          return JSON.parse(content);
        } catch (e) {
          console.error('[Custom Question] Failed to parse OpenAI response as JSON:', content);
          throw new Error('Invalid JSON response from OpenAI');
        }
        
      } catch (openaiError) {
        console.error('[Custom Question] All providers failed:', { cerebrasError, bedrockError, openaiError });
        
        // Return fallback response
        return {
          header: "TIMEBACK | CUSTOM INSIGHT",
          main_heading: "Unable to Generate Response",
          description: "I apologize, but I couldn't generate a proper response. Please try rephrasing your question.",
          key_points: [
            {
              label: "Error Processing",
              description: "All AI providers are currently unavailable. Please try again later."
            }
          ],
          next_options: [
            "How does TimeBack personalize learning?",
            "What results can I expect for my child?",
            "How is TimeBack different from homeschooling?"
          ]
        };
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, viewedComponentsSummary, currentUser } = body;

    console.log('Received custom question request:', { question, currentUser });

    // Read the whitepaper content
    const fs = require('fs').promises;
    const path = require('path');
    const whitepaperPath = path.join(process.cwd(), 'public/data/timeback-whitepaper.md');
    const whitepaperContent = await fs.readFile(whitepaperPath, 'utf8');

    // Construct the system prompt
    const systemPrompt = `# TimeBack Education Data Analyst

You are a TimeBack education data analyst creating compelling content for parents. Generate responses using **ONLY** the provided TimeBack white paper content.

## Core Requirements

- **Output**: Single JSON object with clear, structured content
- **Data sourcing**: EXCLUSIVELY from white paper content - **zero tolerance for fabricated content**
- **Personalization**: Tailor content based on student_grade, interest_subjects, and main_concerns context
- **Response format**: ONLY valid JSON - no explanations, no markdown, no additional text before or after the JSON object
- **Quality standard**: Each response must build trust through transparency and evidence-based insights
- **CRITICAL**: Never use hyphens in any content generation

## Personalization Requirements

- **User addressing**: Address user by name from current_user context
- **Content filtering**: Filter content relevance by student_grade and interest_subjects
- **Tone matching**: Match response tone to main_concerns urgency level
- **Content uniqueness**: Never reference previous_content elements in current response
- **Conversation flow**: Ensure next_options advance conversation logically based on current_request

## Forbidden Actions

⚠️ **NEVER** perform any of the following:
- Generate fake data, estimates, or approximations
- Use hyphens in any content generation
- Repeat content from previous_content summary
- Create content not based on white paper evidence
- Add any text, explanations, or formatting outside the JSON object
- Include markdown formatting, code blocks, or introductory text

## Error Handling

- **Missing context**: Generate response using available white paper content only
- **Incomplete user information**: Focus on general TimeBack benefits and principles

## Knowledge Base
${whitepaperContent}`;

    // Construct the user prompt with context
    const prompt = `<current_user>
<name>${currentUser.name}</name>
<student_grade>${currentUser.student_grade}</student_grade>
<interest_subjects>${currentUser.interest_subjects}</interest_subjects>
<main_concerns>${currentUser.main_concerns}</main_concerns>
<school_name>${currentUser.school_name}</school_name>
<school_city>${currentUser.school_city}</school_city>
<school_state>${currentUser.school_state}</school_state>
<previous_content>${viewedComponentsSummary}</previous_content>
<current_request>${question}</current_request>
</current_user>

<target_output>
<schema>
{
  "header": "string - Formatted header line (e.g., 'TIMEBACK | INSIGHT #1' or similar branding)",
  "main_heading": "string - Primary heading that captures the key message",
  "description": "string - Brief paragraph explaining the main concept or insight",
  "key_points": [
    {
      "label": "string - Bold label for the point (e.g., 'Personalized Learning')",
      "description": "string - Detailed explanation of this aspect"
    },
    {
      "label": "string - Bold label for the point (e.g., 'Data Results')", 
      "description": "string - Detailed explanation of this aspect"
    },
    {
      "label": "string - Bold label for the point (e.g., 'Student Engagement')",
      "description": "string - Detailed explanation of this aspect"
    }
  ],
  "next_options": [
    "string - Relevant follow up conversation option 1",
    "string - Relevant follow up conversation option 2", 
    "string - Relevant follow up conversation option 3"
  ]
}
</schema>
<instructions>
CRITICAL: Your response must be ONLY the JSON object - nothing else. No explanations, no markdown formatting, no text before or after the JSON.

Generate a compelling response using white paper content filtered for the student context. Create content that builds on previous interactions and provide 3 relevant next conversation options using the exact schema above.

RESPOND WITH ONLY THE JSON OBJECT.
</instructions>
</target_output>`;

    // Call AI providers with fallback pattern
    const generatedContent = await generateCustomResponse(prompt, systemPrompt);

    console.log('[Custom Question] Generated response:', generatedContent);

    return NextResponse.json(generatedContent);
    
  } catch (error) {
    console.error('Error in custom question API:', error);
    
    // Return a fallback response
    return NextResponse.json({
      header: "TIMEBACK | CUSTOM INSIGHT",
      main_heading: "Let Me Help You Understand TimeBack",
      description: "I apologize for the technical difficulty. Please try asking your question again, and I'll provide you with personalized insights about how TimeBack can benefit your child.",
      key_points: [
        {
          label: "Personalized Learning",
          description: "TimeBack adapts to each student's unique learning pace and style, ensuring they master concepts before moving forward."
        },
        {
          label: "Proven Results",
          description: "Students typically learn 2x faster while spending only 2 hours on academics daily, freeing up time for passions and life skills."
        },
        {
          label: "AI Powered Support",
          description: "Our AI tutors provide individualized attention and immediate feedback, eliminating learning gaps and building confidence."
        }
      ],
      next_options: [
        "How does TimeBack measure student progress?",
        "What happens if my child struggles with a concept?",
        "How do students spend their extra time?"
      ]
    });
  }
}