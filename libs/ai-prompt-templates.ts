/**
 * AI Prompt Templates for TimeBack
 * Standardized XML templates for consistent AI content generation with personalization
 */

import { QuizData } from '@/types/quiz';

// Define the structure for user context data
export interface UserContext {
  name?: string;
  studentGrade?: string;
  interestSubjects?: string[];
  mainConcerns?: string[];
  schoolContext?: any[];
  schoolLevels?: string[];
  schoolLocations?: string[];
  schoolTypes?: string[];
  schoolPerformance?: any;
  previousContent?: string;
  currentRequest?: string;
  customContext?: Record<string, any>;
}

// Define the structure for AI response schemas
export interface AIResponseSchema {
  header?: string;
  main_heading?: string;
  description?: string;
  key_points?: Array<{
    label: string;
    description: string;
  }>;
  next_options?: string[];
  [key: string]: any; // Allow for custom schema fields
}

/**
 * Builds user context from quiz data and additional parameters
 */
export function buildUserContext(
  quizData: Partial<QuizData>,
  additionalContext?: Partial<UserContext>
): UserContext {
  const schools = quizData.selectedSchools || [];
  const interests = quizData.kidsInterests || [];
  
  return {
    name: quizData.userType === 'parents' ? 'Parent' : 'Student',
    studentGrade: schools[0]?.level || 'not specified',
    interestSubjects: interests,
    mainConcerns: [], // Can be populated based on user interactions
    schoolContext: schools,
    schoolLevels: schools.map(s => s.level).filter(Boolean),
    schoolLocations: schools.map(s => s.city || s.state).filter(Boolean),
    schoolTypes: [], // School type information not available in quiz data
    schoolPerformance: {}, // School performance data not available in quiz data
    ...additionalContext
  };
}

/**
 * Base prompt template following the XML structure
 */
export function createBasePromptTemplate(
  systemRole: string,
  userContext: UserContext,
  whitepaperContent: string,
  targetSchema?: AIResponseSchema,
  customInstructions?: string
): string {
  // Clean up any undefined or null values
  const cleanContext = Object.entries(userContext)
    .filter(([_, value]) => value !== undefined && value !== null)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

  return `<system_role>
${systemRole}
</system_role>

<knowledge_base>
<educational_background>${whitepaperContent}</educational_background>
</knowledge_base>

<current_user>
${Object.entries(cleanContext).map(([key, value]) => {
  if (Array.isArray(value)) {
    return `<${key}>${value.join(', ')}</${key}>`;
  }
  if (typeof value === 'object') {
    return `<${key}>${JSON.stringify(value)}</${key}>`;
  }
  return `<${key}>${value}</${key}>`;
}).join('\n')}
</current_user>

<target_output>
${targetSchema ? `<schema>
${JSON.stringify(targetSchema, null, 2)}
</schema>` : ''}
<instructions>
${customInstructions || 'Generate a response based on the provided context and knowledge base.'}
</instructions>
</target_output>`;
}

/**
 * Template for TimeBack data analyst responses
 */
export function createDataAnalystPrompt(
  userContext: UserContext,
  whitepaperContent: string,
  currentRequest: string
): string {
  const systemRole = `# TimeBack Education Data Analyst

You are a TimeBack education data analyst creating compelling content for parents. Generate responses using **ONLY** the provided TimeBack white paper content.

## Core Requirements

- **Output**: Single JSON object with clear, structured content
- **Data sourcing**: EXCLUSIVELY from white paper content - **zero tolerance for fabricated content**
- **Personalization**: Tailor content based on student_grade, interest_subjects, main_concerns, and school_context information
- **Response format**: ONLY valid JSON - no explanations, no markdown, no additional text before or after the JSON object
- **Quality standard**: Each response must build trust through transparency and evidence-based insights

## Personalization Requirements

- **User addressing**: Address user appropriately based on context
- **Content filtering**: Filter content relevance by student_grade, interest_subjects, and school_levels
- **School personalization**: Reference specific schools when relevant and appropriate based on school_context
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
- **Incomplete user information**: Focus on general TimeBack benefits and principles`;

  const schema: AIResponseSchema = {
    header: "string - Formatted header line (e.g., 'TIMEBACK | INSIGHT #1' or similar branding)",
    main_heading: "string - Primary heading that captures the key message",
    description: "string - Brief paragraph explaining the main concept or insight",
    key_points: [
      {
        label: "string - Bold label for the point",
        description: "string - Detailed explanation of this aspect"
      }
    ],
    next_options: [
      "string - Relevant follow-up conversation option"
    ]
  };

  const instructions = `CRITICAL: Your response must be ONLY the JSON object - nothing else. No explanations, no markdown formatting, no text before or after the JSON.

Generate a compelling response using white paper content filtered for the student context. Create content that builds on previous interactions and provide 3 relevant next conversation options using the exact schema above.

Current user request: ${currentRequest}

RESPOND WITH ONLY THE JSON OBJECT.`;

  return createBasePromptTemplate(
    systemRole,
    { ...userContext, currentRequest },
    whitepaperContent,
    schema,
    instructions
  );
}

/**
 * Template for personalized question responses
 */
export function createPersonalizedQuestionPrompt(
  userContext: UserContext,
  whitepaperContent: string,
  question: string,
  section?: string
): string {
  const systemRole = `# TimeBack Education Expert

You are a TimeBack education expert helping parents understand how TimeBack can benefit their child. Generate helpful, informative responses based on the TimeBack white paper content.

## Response Guidelines

- **Tone**: Educational, helpful, and encouraging without being salesy
- **Content**: Based on facts from the white paper, personalized to the user's context
- **Format**: Clear paragraphs with specific examples and data points
- **Length**: 2-3 paragraphs that directly answer the question
- **Personalization**: Reference the user's school, grade, or interests when relevant

## Important Rules

- Never use hyphens in your response
- Focus on educational value and helping parents understand
- Use specific data and examples from the white paper
- Keep responses neutral and informative
- Address the parent directly when appropriate`;

  const instructions = `Answer the following question based on the TimeBack white paper content:

Question: ${question}
${section ? `Context: This question is related to the ${section} section.` : ''}

Provide a clear, informative answer that helps the parent understand how TimeBack addresses their question. Use specific examples and data from the white paper when available.`;

  return createBasePromptTemplate(
    systemRole,
    userContext,
    whitepaperContent,
    undefined,
    instructions
  );
}

/**
 * Template for follow-up question generation
 */
export function createFollowUpQuestionsPrompt(
  userContext: UserContext,
  whitepaperContent: string,
  sectionId: string,
  previousQuestions?: string[]
): string {
  const systemRole = `# TimeBack Education Data Analyst

You are generating relevant follow-up questions for parents exploring TimeBack. Questions should be natural, conversational, and lead to deeper understanding.

## Requirements

- Generate exactly 3 follow-up questions
- Questions should be relevant to the current section: ${sectionId}
- Personalize based on user context when possible
- Avoid repeating previous questions
- Keep questions focused and specific
- Use natural, conversational language`;

  const schema = {
    questions: [
      "string - Natural follow-up question 1",
      "string - Natural follow-up question 2",
      "string - Natural follow-up question 3"
    ]
  };

  const instructions = `Generate 3 follow-up questions for section "${sectionId}" that would help a parent learn more about TimeBack.

${previousQuestions?.length ? `Avoid these previous questions:
${previousQuestions.map(q => `- ${q}`).join('\n')}` : ''}

Return ONLY a JSON object with a "questions" array containing exactly 3 questions.`;

  return createBasePromptTemplate(
    systemRole,
    userContext,
    whitepaperContent,
    schema,
    instructions
  );
}

/**
 * Template for afternoon activities content generation
 */
export function createAfternoonActivitiesPrompt(
  userContext: UserContext,
  whitepaperContent: string,
  selectedActivity: string
): string {
  const systemRole = `# TimeBack Afternoon Activities Expert

You are explaining how TimeBack students spend their extra 6 hours of free time gained through efficient learning. Focus on the specific activity selected and how it aligns with the student's interests.

## Content Requirements

- Explain the activity in detail
- Connect to the student's specific interests
- Use examples from the white paper
- Show how this relates to TimeBack's efficiency
- Be inspiring and educational

## Forbidden Actions

- Never use hyphens in content
- Don't make up statistics or examples
- Don't be overly promotional`;

  const schema = {
    title: "string - Activity title",
    description: "string - Detailed description of the activity",
    benefits: [
      {
        label: "string - Benefit category",
        description: "string - How this benefits the student"
      }
    ],
    timeAllocation: "string - How the extra 6 hours enables this",
    personalConnection: "string - How this connects to the student's interests"
  };

  const instructions = `Generate content about the afternoon activity: ${selectedActivity}

Focus on how TimeBack students can pursue this activity with their extra 6 hours of free time. Connect it to the student's interests: ${userContext.interestSubjects?.join(', ') || 'general enrichment'}.

Return ONLY the JSON object following the schema.`;

  return createBasePromptTemplate(
    systemRole,
    userContext,
    whitepaperContent,
    schema,
    instructions
  );
}

/**
 * Template for custom question responses with schema
 */
export function createCustomQuestionSchemaPrompt(
  userContext: UserContext,
  whitepaperContent: string,
  question: string,
  conversationHistory?: Array<{role: string, content: string}>
): string {
  const systemRole = `# TimeBack Custom Question Assistant

You are answering specific questions about TimeBack based on the white paper content. Provide structured, informative responses that directly address the parent's question.

## Response Requirements

- Answer the specific question asked
- Use only information from the white paper
- Provide concrete examples when possible
- Maintain educational, helpful tone
- Structure response for clarity

## Context Awareness

- Consider previous conversation if provided
- Build on earlier topics naturally
- Avoid repetition of information`;

  const schema = {
    header: "string - Context-appropriate header",
    main_heading: "string - Direct answer summary",
    explanation: "string - Detailed explanation",
    key_insights: [
      {
        point: "string - Key point",
        detail: "string - Supporting detail"
      }
    ],
    next_options: [
      "string - Related follow-up question"
    ]
  };

  const instructions = `Answer this question: ${question}

${conversationHistory?.length ? `Previous conversation context:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}` : ''}

Provide a structured response that directly answers the question using information from the white paper.

Return ONLY the JSON object following the schema.`;

  return createBasePromptTemplate(
    systemRole,
    userContext,
    whitepaperContent,
    schema,
    instructions
  );
}

/**
 * Utility function to extract variables from quiz data
 */
export function extractPersonalizationVariables(quizData: Partial<QuizData>): Record<string, any> {
  const schools = quizData.selectedSchools || [];
  const primarySchool = schools[0];
  
  return {
    USER_FIRST_NAME: 'Parent', // Can be updated if we collect names
    STUDENT_GRADE_LEVEL: primarySchool?.level || 'not specified',
    STUDENT_SUBJECTS_OF_INTEREST: (quizData.kidsInterests || []).join(', ') || 'general learning',
    PARENT_CONCERNS: 'helping child reach full potential', // Can be derived from interactions
    SELECTED_SCHOOLS_CONTEXT: schools.map(s => `${s.name} in ${s.city}, ${s.state}`).join('; '),
    SCHOOL_LEVELS: schools.map(s => s.level).filter(Boolean).join(', '),
    SCHOOL_LOCATIONS: schools.map(s => `${s.city}, ${s.state}`).filter(Boolean).join('; '),
    SCHOOL_TYPES: 'public', // Default to public schools
    SCHOOL_PERFORMANCE_DATA: '{}', // Performance data not available
  };
}

/**
 * Helper to format prompt with variables
 */
export function formatPromptWithVariables(
  template: string,
  variables: Record<string, any>
): string {
  let formattedPrompt = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    formattedPrompt = formattedPrompt.replace(regex, String(value));
  });
  
  return formattedPrompt;
}