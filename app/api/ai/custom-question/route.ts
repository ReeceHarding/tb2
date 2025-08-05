import { NextRequest, NextResponse } from 'next/server';

async function callAnthropicBedrock(prompt: string): Promise<any> {
  try {
    // Using AWS SDK for Bedrock
    const AWS = require('aws-sdk');
    
    const bedrock = new AWS.BedrockRuntime({
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'your_aws_access_key_id_here',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'your_aws_secret_access_key_here',
      },
    });

    const modelId = 'anthropic.claude-sonnet-4-20250514-v1:0';
    
    const requestBody = {
      anthropic_version: 'bedrock-2023-05-31',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    };

    const response = await bedrock.invokeModel({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(requestBody),
    }).promise();

    const responseBody = JSON.parse(response.body.toString());
    
    // Extract content from the response
    const content = responseBody.content?.[0]?.text || '';
    
    try {
      // Try to parse as JSON
      return JSON.parse(content);
    } catch (e) {
      // If not valid JSON, return structured error
      console.error('Failed to parse AI response as JSON:', content);
      return {
        header: "TIMEBACK | CUSTOM INSIGHT",
        main_heading: "Unable to Generate Response",
        description: "I apologize, but I couldn't generate a proper response. Please try rephrasing your question.",
        key_points: [
          {
            label: "Error Processing",
            description: "The AI response was not in the expected format."
          }
        ],
        next_options: [
          "How does TimeBack personalize learning?",
          "What results can I expect for my child?",
          "How is TimeBack different from homeschooling?"
        ]
      };
    }
  } catch (error) {
    console.error('Error calling Anthropic via Bedrock:', error);
    throw error;
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

    // Construct the prompt using XML tags
    const prompt = `<system_role>
# TimeBack Education Data Analyst

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
</system_role>

<knowledge_base>
<educational_background>${whitepaperContent}</educational_background>
</knowledge_base>

<current_user>
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

    // Call Anthropic via Bedrock
    const generatedContent = await callAnthropicBedrock(prompt);

    console.log('Generated custom question response:', generatedContent);

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