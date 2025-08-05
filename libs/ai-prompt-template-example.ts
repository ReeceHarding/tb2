/**
 * Example usage of AI Prompt Templates
 * This demonstrates how to use the prompt templates in API endpoints
 */

import {
  buildUserContext,
  createDataAnalystPrompt,
  createPersonalizedQuestionPrompt,
  createFollowUpQuestionsPrompt,
  createAfternoonActivitiesPrompt,
  createCustomQuestionSchemaPrompt,
  extractPersonalizationVariables,
  formatPromptWithVariables
} from './ai-prompt-templates';
import { QuizData } from '@/types/quiz';

// Example 1: Using in a generate endpoint
export async function generatePersonalizedContent(
  quizData: Partial<QuizData>,
  currentRequest: string,
  whitepaperContent: string
) {
  // Build user context from quiz data
  const userContext = buildUserContext(quizData, {
    currentRequest,
    previousContent: 'User viewed TimeBack overview and data comparison'
  });

  // Create the prompt using the data analyst template
  const prompt = createDataAnalystPrompt(
    userContext,
    whitepaperContent,
    currentRequest
  );

  // Send to AI generation API
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      maxTokens: 2000,
      temperature: 0.7,
      systemPrompt: '' // Already included in the prompt template
    })
  });

  const { content } = await response.json();
  
  // Parse the JSON response
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return null;
  }
}

// Example 2: Using for custom questions
export async function answerCustomQuestion(
  quizData: Partial<QuizData>,
  question: string,
  conversationHistory: Array<{role: string, content: string}>,
  whitepaperContent: string
) {
  // Build context with conversation history
  const userContext = buildUserContext(quizData, {
    previousContent: conversationHistory.map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n')
  });

  // Create prompt for custom question
  const prompt = createCustomQuestionSchemaPrompt(
    userContext,
    whitepaperContent,
    question,
    conversationHistory
  );

  // Call generation API
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      maxTokens: 1500,
      temperature: 0.8
    })
  });

  return response.json();
}

// Example 3: Using variable extraction for legacy prompts
export async function generateWithLegacyPrompt(
  quizData: Partial<QuizData>,
  legacyPromptTemplate: string,
  whitepaperContent: string
) {
  // Extract variables from quiz data
  const variables = extractPersonalizationVariables(quizData);
  
  // Add whitepaper content to variables
  variables.WHITE_PAPER_CONTENT = whitepaperContent;
  variables.PREVIOUS_COMPONENTS_SUMMARY = 'User has viewed introduction and data sections';
  variables.USER_LATEST_CHOICE = 'Show me example questions for my child';

  // Format the legacy prompt with variables
  const formattedPrompt = formatPromptWithVariables(
    legacyPromptTemplate,
    variables
  );

  // Send to generation API
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: formattedPrompt,
      maxTokens: 2000,
      temperature: 0.7
    })
  });

  return response.json();
}

// Example 4: Using in an API endpoint
export async function exampleAPIEndpoint(req: Request) {
  try {
    const { quizData, question, section } = await req.json();
    
    // Load whitepaper content
    const whitepaperContent = await fetch('/data/timeback-whitepaper.md')
      .then(res => res.text());

    // Build user context
    const userContext = buildUserContext(quizData, {
      currentRequest: question
    });

    // Choose appropriate template based on section
    let prompt: string;
    
    switch (section) {
      case 'afternoon-activities':
        prompt = createAfternoonActivitiesPrompt(
          userContext,
          whitepaperContent,
          question
        );
        break;
        
      case 'follow-up':
        prompt = createFollowUpQuestionsPrompt(
          userContext,
          whitepaperContent,
          section,
          [] // Previous questions if any
        );
        break;
        
      default:
        prompt = createPersonalizedQuestionPrompt(
          userContext,
          whitepaperContent,
          question,
          section
        );
    }

    // Generate content
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        maxTokens: 1500,
        temperature: 0.8
      })
    });

    const result = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      content: result.content
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error in API endpoint:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to generate content'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}