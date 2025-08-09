import { NextRequest } from 'next/server';
import { trackLLMUsage } from '@/libs/llm-analytics';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { xmlPromptBuilder } from '@/libs/xml-prompt-builder';
import { fieldMapper } from '@/libs/supabase-service';
import { aiPromptLogger } from '@/libs/ai-prompt-logger';
import { QuestionBank } from '@/libs/question-bank';

export const dynamic = 'force-dynamic';

// Cache for XML template and whitepaper content to avoid filesystem reads
let xmlTemplateCache: string | null = null;
let whitepaperCache: string | null = null;
let schoolInfoCache: string | null = null;
let templateCacheTimestamp = 0;
let schoolInfoCacheTimestamp = 0;
const TEMPLATE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Optimized template and whitepaper loading with caching
function getXMLTemplate(): string {
  const now = Date.now();
  
  if (!xmlTemplateCache || (now - templateCacheTimestamp) > TEMPLATE_CACHE_TTL) {
    console.log('[generate-follow-up-questions] Loading XML template from filesystem (cache miss/expired)');
    const xmlTemplatePath = path.join(process.cwd(), 'public/docs/prompt-example.xml');
    xmlTemplateCache = fs.readFileSync(xmlTemplatePath, 'utf8');
    templateCacheTimestamp = now;
  } else {
    console.log('[generate-follow-up-questions] Using cached XML template');
  }
  
  return xmlTemplateCache;
}

function getWhitepaperContent(): string {
  const now = Date.now();
  
  if (!whitepaperCache || (now - templateCacheTimestamp) > TEMPLATE_CACHE_TTL) {
    console.log('[generate-follow-up-questions] Loading whitepaper from filesystem (cache miss/expired)');
    const whitepaperPath = path.join(process.cwd(), 'public/data/timeback-whitepaper.md');
    whitepaperCache = fs.readFileSync(whitepaperPath, 'utf8');
  } else {
    console.log('[generate-follow-up-questions] Using cached whitepaper content');
  }
  
  return whitepaperCache;
}

function getSchoolInfoContent(): string {
  const now = Date.now();
  
  if (!schoolInfoCache || (now - schoolInfoCacheTimestamp) > TEMPLATE_CACHE_TTL) {
    console.log('[generate-follow-up-questions] Loading school info from filesystem (cache miss/expired)');
    const schoolInfoPath = path.join(process.cwd(), 'public/data/school-info.md');
    schoolInfoCache = fs.readFileSync(schoolInfoPath, 'utf8');
    schoolInfoCacheTimestamp = now;
  } else {
    console.log('[generate-follow-up-questions] Using cached school info content');
  }
  
  return schoolInfoCache;
}

export async function POST(request: Request) {
  console.log('[generate-follow-up-questions] API route called');
  
  try {
    // Parse request body with error handling (accepting both old and new formats)
    let body;
    try {
      const contentLength = request.headers.get('content-length');
      if (!contentLength || contentLength === '0') {
        return new Response(JSON.stringify({ error: "Request body is required" }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      body = await request.json();
    } catch (error) {
      console.error('[generate-follow-up-questions] Invalid JSON in request body:', error);
      return new Response(JSON.stringify({ error: "Invalid JSON format in request body" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Accept both old format and new format with full context
    const { 
      sectionId, 
      sectionContent, 
      userContext, 
      clickedQuestions = [],
      // New parameters to match chat-tutor
      question,
      interests = [], 
      gradeLevel, 
      context, 
      messageHistory = [], 
      quizData, 
      userData,
      // Current question that was just answered
      currentQuestion,
      // Current answer/response that was just provided
      currentAnswer
    } = body;
    
      console.log('[generate-follow-up-questions] Generating for section:', sectionId);
  console.log('[generate-follow-up-questions] Clicked questions to avoid:', clickedQuestions);
  console.log('[generate-follow-up-questions] Message history length:', messageHistory?.length || 0);
  console.log('[generate-follow-up-questions] Has current question/answer:', !!currentQuestion, !!currentAnswer);
  console.log('[generate-follow-up-questions] Has quiz data:', !!quizData);
  console.log('[generate-follow-up-questions] Has user data:', !!userData);

  // Try to use centralized question bank first for consistency
  try {
    console.log('[generate-follow-up-questions] Attempting to use centralized question bank...');
    
    // Get available follow-up questions from the bank
    const availableFollowUpQuestions = QuestionBank.getAvailableQuestions('follow-up', clickedQuestions);
    
    // If we have follow-up questions available, use them
    if (availableFollowUpQuestions.length > 0) {
      const selectedQuestions = availableFollowUpQuestions
        .slice(0, 3)
        .map(q => q.text);
      
      console.log('[generate-follow-up-questions] Using questions from centralized bank:', selectedQuestions);
      
      return new Response(JSON.stringify({
        questions: selectedQuestions,
        source: 'centralized-bank',
        success: true
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // If we don't have enough follow-up questions, supplement with main questions
    const availableMainQuestions = QuestionBank.getAvailableQuestions('main', clickedQuestions);
    const remainingSlots = 3 - availableFollowUpQuestions.length;
    
    if (availableMainQuestions.length > 0 && remainingSlots > 0) {
      const selectedQuestions = [
        ...availableFollowUpQuestions.map(q => q.text),
        ...availableMainQuestions.slice(0, remainingSlots).map(q => q.text)
      ];
      
      console.log('[generate-follow-up-questions] Using mixed questions from centralized bank:', selectedQuestions);
      
      return new Response(JSON.stringify({
        questions: selectedQuestions,
        source: 'centralized-bank-mixed',
        success: true
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('[generate-follow-up-questions] No suitable questions in centralized bank, proceeding with AI generation...');
    
  } catch (bankError) {
    console.warn('[generate-follow-up-questions] Error accessing centralized question bank:', bankError);
    console.log('[generate-follow-up-questions] Proceeding with AI generation as fallback...');
  }

    // Initialize variables for analytics and context
    let fullUserContext: any = {};
    let conversationContext = '';

    // Build the same comprehensive prompt as chat-tutor but for follow-up questions
    let systemPrompt = '';
    let userPrompt = '';
    
    try {
      // Get cached XML template and whitepaper content (same as chat-tutor)
      const xmlTemplate = getXMLTemplate();
      const whitepaperContent = getWhitepaperContent();
      const schoolInfoContent = getSchoolInfoContent();
      
      // Extract user context from quizData or context object (same as chat-tutor)
      fullUserContext = quizData || userData || userContext || {};
      const selectedSchools = fullUserContext.selectedSchools || [];
      
      // Build comprehensive school context for AI personalization (same as chat-tutor)
      const schoolContext = selectedSchools.length > 0 
        ? selectedSchools.map((school: any) => `${school.name} (${school.level} in ${school.city}, ${school.state})`).join('; ')
        : 'No specific school selected';
      
      const schoolLevels = selectedSchools.length > 0
        ? Array.from(new Set(selectedSchools.map((school: any) => school.level))).join(', ')
        : 'Not specified';
        
      const schoolLocations = selectedSchools.length > 0
        ? Array.from(new Set(selectedSchools.map((school: any) => `${school.city}, ${school.state}`))).join('; ')
        : 'Not specified';
        
      const schoolTypes = selectedSchools.length > 0
        ? selectedSchools.map((school: any) => {
            // Infer school type from name or other indicators
            const name = school.name.toLowerCase();
            if (name.includes('private') || name.includes('prep') || name.includes('academy')) return 'Private';
            if (name.includes('charter')) return 'Charter';
            if (name.includes('magnet')) return 'Magnet';
            return 'Public'; // Default assumption
          }).join(', ')
        : 'Not specified';
        
      const schoolPerformanceData = selectedSchools.length > 0
        ? selectedSchools.map((school: any) => school.name).join(', ') + ' - Performance data available on request'
        : 'Performance data not available';
      
      // Populate XML template placeholders (same as chat-tutor)
      const populatedTemplate = xmlTemplate
        .replace('{{WHITE_PAPER_CONTENT}}', whitepaperContent) // Full whitepaper content
        .replace('{{SCHOOL_INFO_CONTENT}}', schoolInfoContent.substring(0, 5000)) // School location directory
        .replace('{{USER_FIRST_NAME}}', fullUserContext.userFirstName || fullUserContext.firstName || 'Parent')
        .replace('{{STUDENT_GRADE_LEVEL}}', fullUserContext.childGrade || gradeLevel || 'elementary')
        .replace('{{STUDENT_SUBJECTS_OF_INTEREST}}', Array.isArray(interests) ? interests.join(', ') : (fullUserContext.kidsInterests?.join(', ') || 'math, science'))
        .replace('{{PARENT_CONCERNS}}', fullUserContext.learningGoals?.join(', ') || fullUserContext.mainConcerns?.join(', ') || 'academic achievement')
        .replace('{{SELECTED_SCHOOLS_CONTEXT}}', schoolContext)
        .replace('{{SCHOOL_LEVELS}}', schoolLevels)
        .replace('{{SCHOOL_LOCATIONS}}', schoolLocations)
        .replace('{{SCHOOL_TYPES}}', schoolTypes)
        .replace('{{SCHOOL_PERFORMANCE_DATA}}', schoolPerformanceData)
        .replace('{{PREVIOUS_COMPONENTS_SUMMARY}}', fullUserContext.previousContent || 'No previous interactions')
        .replace('{{USER_LATEST_CHOICE}}', currentQuestion || question || 'General inquiry about TimeBack');

      // Modify the XML template for follow-up question generation
      systemPrompt = populatedTemplate.replace(
        /<system_role>[\s\S]*?<\/system_role>/,
        `<system_role>
# TimeBack Education Data Analyst - Simple Follow-up Question Generator

You are a TimeBack education data analyst generating SHORT, SIMPLE follow-up questions based on the conversation that just occurred. Generate responses using **ONLY** the provided TimeBack white paper content.

## Core Requirements

- **Output**: JSON array of exactly 3 follow-up questions
- **Question Length**: Maximum 7 words per question - NO EXCEPTIONS
- **Format**: Simple, direct questions that are easily skimmable
- **Data sourcing**: EXCLUSIVELY from white paper content - **zero tolerance for fabricated content**
- **Response format**: ONLY valid JSON array - no explanations, no markdown, no additional text before or after the JSON array

## Follow-up Question Generation Requirements

- **Brevity First**: Each question must be 7 words or fewer
- **Natural Extensions**: Questions should be obvious next questions someone would ask after reading the previous content
- **Simple Language**: Use everyday words, avoid jargon
- **Conversational**: Sound like natural follow-up questions in a conversation
- **Scannable**: Must be quickly readable and immediately understandable

## Question Quality Standards

- **Concise**: Maximum 7 words - shorter is better
- **Clear**: Immediately understandable without context
- **Natural**: Feel like obvious next questions
- **Relevant**: Directly build from the conversation
- **Actionable**: Lead to useful information

## Examples of GOOD Questions (Follow This Style)

- "How does TimeBack improve test scores?"
- "What's the daily schedule like?"
- "Can I see student success stories?"
- "How much does TimeBack cost?"
- "What subjects does TimeBack cover?"
- "Are there schools near me?"
- "How do students stay motivated?"

## Forbidden Patterns

- **Long Questions**: No questions over 7 words
- **Complex Sentences**: Keep it simple and direct
- **Multiple Clauses**: One simple thought per question
- **Technical Jargon**: Use everyday language
- **Overly Specific Details**: Focus on main concepts

</system_role>`
      ).replace(
        /<instructions>[\s\S]*?<\/instructions>/,
        `<instructions>
CRITICAL: Your response must be ONLY a JSON array of exactly 3 follow-up questions - nothing else. No explanations, no markdown formatting, no text before or after the JSON array.

Generate SHORT, SIMPLE follow-up questions that naturally extend from the conversation. Each question must be:

- MAXIMUM 7 WORDS TOTAL
- Natural next question someone would ask
- Easy to read and scan quickly
- Direct and conversational

QUESTION STYLE REQUIREMENTS:
- Use simple, everyday language
- Start with question words (How, What, Can, Does, Is, etc.)
- Focus on one clear concept per question
- Make it feel like natural conversation

EXAMPLES OF PERFECT QUESTIONS:
- "How does the AI tutoring work?"
- "What's the cost per month?"
- "Can I see the curriculum?"
- "How long are daily sessions?"
- "What ages does TimeBack serve?"

FORBIDDEN:
- Questions longer than 7 words
- Complex or compound sentences
- Technical jargon or buzzwords
- Multiple concepts in one question

OUTPUT FORMAT: ["Question 1", "Question 2", "Question 3"]
</instructions>`
      );
      
      // Build conversation context from message history
      if (messageHistory && messageHistory.length > 0) {
        console.log('[generate-follow-up-questions] Processing conversation history for context');
        
        // Keep all recent messages for full context
        const recentHistory = messageHistory.slice(-8);
        
        // Format conversation history for context
        conversationContext = recentHistory
          .map((msg: {role: string, content: any}) => {
            let content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
            // If it's a schema response, extract the description and key points for context
            if (typeof msg.content === 'object' && msg.content.description) {
              content = `${msg.content.description} ${msg.content.key_points?.map((p: any) => `${p.label}: ${p.description}`).join(' ') || ''}`;
            }
            return `${msg.role === 'user' ? 'Parent' : 'TimeBack AI'}: ${content}`;
          })
          .join('\n\n');
          
        console.log('[generate-follow-up-questions] Added conversation context:', recentHistory.length, 'messages');
      }
      
      // Include current question and answer if provided
      if (currentQuestion && currentAnswer) {
        const currentExchange = `\n\nMOST RECENT EXCHANGE:\nParent: ${currentQuestion}\nTimeBack AI: ${typeof currentAnswer === 'object' ? (currentAnswer.description || JSON.stringify(currentAnswer)) : currentAnswer}`;
        conversationContext += currentExchange;
      }
      
      // Log the XML prompt
      aiPromptLogger.logXMLPrompt('generate-follow-up-questions', systemPrompt, {
        service: 'generate-follow-up-questions',
        question: currentQuestion || question || 'follow-up generation',
        hasMessageHistory: !!conversationContext,
        gradeLevel: fullUserContext.childGrade || gradeLevel,
        interests: Array.isArray(interests) ? interests : fullUserContext.kidsInterests,
        userId: userData?.userId || 'anonymous'
      });
      
      // Build the user prompt with full conversation context
      if (conversationContext) {
        userPrompt = `PREVIOUS CONVERSATION CONTEXT:
${conversationContext}

PREVIOUSLY CLICKED QUESTIONS TO AVOID: ${JSON.stringify(clickedQuestions)}

Generate exactly 3 SHORT, SIMPLE follow-up questions (MAX 7 words each) that naturally build from this conversation. Focus on:
1. What someone would naturally ask next
2. Simple, clear language
3. Easy to scan and read quickly
4. Avoid similarity to clicked questions

Examples: "How does this work?", "What's the cost?", "Can I try it?"

Return ONLY the JSON array of 3 questions.`;
      } else {
        // Fallback if no conversation history
        userPrompt = `Generate 3 SHORT, SIMPLE follow-up questions (MAX 7 words each) about TimeBack education for a parent with a ${fullUserContext.childGrade || gradeLevel || 'elementary'} student interested in ${Array.isArray(interests) ? interests.join(', ') : (fullUserContext.kidsInterests?.join(', ') || 'learning')}.

PREVIOUSLY CLICKED QUESTIONS TO AVOID: ${JSON.stringify(clickedQuestions)}

Examples: "How does TimeBack work?", "What subjects are covered?", "What's the schedule like?"

Return ONLY the JSON array of 3 questions.`;
      }
      
      console.log('[generate-follow-up-questions] Built comprehensive prompt with conversation context');
      
    } catch (error) {
      console.error('[generate-follow-up-questions] Error building comprehensive prompt:', error);
      // Fallback to simpler prompt if XML template fails
      systemPrompt = `You are a TimeBack education advisor generating SHORT, SIMPLE follow-up questions (max 7 words each). Generate exactly 3 follow-up questions that build upon the conversation context provided. Return ONLY a JSON array.`;
      userPrompt = `Conversation: ${JSON.stringify({currentQuestion, currentAnswer, messageHistory: messageHistory?.slice(-3)})}. Clicked questions to avoid: ${JSON.stringify(clickedQuestions)}. Generate 3 SHORT, SIMPLE follow-up questions (max 7 words each) as JSON array. Examples: "How does this work?", "What's the cost?", "Can I try it?"`;
    }

    // Track start time for analytics
    const startTime = Date.now();
    
    try {
      // Use Cerebras API with the comprehensive prompt (same as chat-tutor)
      const cerebrasMessages = [];
      if (systemPrompt) {
        cerebrasMessages.push({ role: 'system', content: systemPrompt });
      }
      cerebrasMessages.push({ role: 'user', content: userPrompt });
      
      // Log the API request
      const requestBody = {
        model: 'llama-4-scout-17b-16e-instruct',
        messages: cerebrasMessages,
        max_completion_tokens: 1000,
        temperature: 0.2,
        top_p: 1,
        stream: false
      };
      
      aiPromptLogger.logAPIRequest('cerebras-follow-up', requestBody, {
        messageCount: cerebrasMessages.length,
        hasSystemPrompt: !!systemPrompt,
        question: currentQuestion || question || 'follow-up generation',
        userId: userData?.userId || 'anonymous'
      });
      
      const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Cerebras API error: ${response.status} - ${error}`);
      }

      const cerebrasCompletion = await response.json();
      const fullText = cerebrasCompletion.choices[0]?.message?.content || '';
      const tokenUsage = cerebrasCompletion.usage || {};
      
      // Log the API response
      aiPromptLogger.logAPIResponse('cerebras-follow-up', cerebrasCompletion, {
        responseLength: fullText.length,
        promptTokens: tokenUsage.prompt_tokens,
        completionTokens: tokenUsage.completion_tokens,
        totalTokens: tokenUsage.total_tokens
      });
      
      console.log('[generate-follow-up-questions] Cerebras successful, response length:', fullText.length);
      
      // Parse the response as JSON array
      let questions;
      try {
        // Clean up response to extract JSON array
        let cleanedResponse = fullText.trim()
          .replace(/[\u201C\u201D]/g, '"')  // smart double quotes → standard
          .replace(/[\u2018\u2019]/g, "'");   // smart single quotes → standard
        
        // Find JSON array boundaries
        const jsonStart = cleanedResponse.indexOf('[');
        const jsonEnd = cleanedResponse.lastIndexOf(']') + 1;
        
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
          cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd);
        }
        
        questions = JSON.parse(cleanedResponse);
        
        // Validate that it's an array of strings
        if (!Array.isArray(questions)) {
          throw new Error('Response is not an array');
        }
        
        questions = questions.filter(q => typeof q === 'string' && q.trim().length > 0);
        
        if (questions.length === 0) {
          throw new Error('No valid questions in response');
        }
        
      } catch (parseError) {
        console.error('[generate-follow-up-questions] JSON parsing failed:', parseError);
        console.error('[generate-follow-up-questions] Raw response was:', fullText);
        throw new Error('Failed to parse AI response as JSON array');
      }
      
      // Filter out any questions that are too similar to clicked ones (enhanced filtering)
      const filteredQuestions = questions.filter((q: string) => {
        return !clickedQuestions.some((clicked: string) => {
          const qLower = q.toLowerCase();
          const clickedLower = clicked.toLowerCase();
          
          // Check for substring matches (more sensitive)
          const substringMatch = qLower.includes(clickedLower.substring(0, 30)) || 
                                clickedLower.includes(qLower.substring(0, 30));
          
          // Check for keyword overlap (less sensitive but catches similar topics)
          const qWords = qLower.split(' ').filter(w => w.length > 3);
          const clickedWords = clickedLower.split(' ').filter(w => w.length > 3);
          const commonWords = qWords.filter(w => clickedWords.includes(w));
          const keywordMatch = commonWords.length >= 2;
          
          return substringMatch || keywordMatch;
        });
      });
      
      // Ensure we have at least 3 questions, truncate or supplement as needed
      const finalQuestions = filteredQuestions.slice(0, 3);
      while (finalQuestions.length < 3 && questions.length > finalQuestions.length) {
        const nextQuestion = questions[finalQuestions.length];
        if (!finalQuestions.includes(nextQuestion)) {
          finalQuestions.push(nextQuestion);
        } else {
          break;
        }
      }
      
      console.log('[generate-follow-up-questions] Generated questions:', questions);
      console.log('[generate-follow-up-questions] Filtered questions (after removing similar to clicked):', filteredQuestions);
      console.log('[generate-follow-up-questions] Final questions:', finalQuestions);

      // Track successful completion
      await trackLLMUsage({
        endpoint: 'generate-follow-up-questions',
        model: 'llama-4-scout-17b-16e-instruct',
        latencyMs: Date.now() - startTime,
        success: true,
        context: {
          gradeLevel: fullUserContext.childGrade || gradeLevel,
          interests: Array.isArray(interests) ? interests : fullUserContext.kidsInterests,
          messagesCount: messageHistory?.length || 0,
          hasConversationContext: !!conversationContext,
          questionsGenerated: questions.length,
          questionsFiltered: filteredQuestions.length,
          provider: 'cerebras',
          inputTokens: tokenUsage.prompt_tokens,
          outputTokens: tokenUsage.completion_tokens
        }
      });

      return Response.json({ questions: finalQuestions });

    } catch (error) {
      console.error('[generate-follow-up-questions] Cerebras API failed:', error);
      throw error;
    }

  } catch (error) {
    console.error('[generate-follow-up-questions] Error:', error);
    
    // Track error
    await trackLLMUsage({
      endpoint: 'generate-follow-up-questions',
      model: 'llama-4-scout-17b-16e-instruct',
      latencyMs: Date.now() - (Date.now()), // Approximation
      success: false,
      error: error instanceof Error ? error.message : String(error),
      context: {
        provider: 'cerebras-failed'
      }
    });
    
    return Response.json({ 
      error: 'Failed to generate follow-up questions',
      questions: [
        "How does TimeBack work?",
        "What's the daily schedule like?",
        "Can I see success stories?"
      ]
    }, { status: 200 }); // Return fallback questions on error
  }
}
