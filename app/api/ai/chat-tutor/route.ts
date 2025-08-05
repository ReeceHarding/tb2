import { NextRequest } from 'next/server';
import { trackLLMUsage } from '@/libs/llm-analytics';
import { invokeClaude, formatClaudeResponse, ClaudeMessage } from '@/libs/bedrock-claude';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Simple in-memory cache for schema responses
const responseCache = new Map<string, {
  response: any,
  timestamp: number,
  ttl: number
}>();

// Pre-cache common questions for better performance
function initializeCommonResponses() {
  const commonQuestions = [
    {
      question: "how does timeback work",
      context: { interests: ["general"], gradeLevel: "elementary" },
      response: {
        header: "TIMEBACK | HOW IT WORKS",
        main_heading: "TimeBack's Revolutionary 2-Hour Learning System",
        description: "TimeBack enables students to learn 2x faster in just 2 hours per day through AI-powered personalized mastery learning. Students work with AI tutors that adapt to their learning style, while human Guides provide motivation and life skills training.",
        key_points: [
          { label: "AI-Powered Learning", description: "Each student receives personalized instruction from AI tutors that identify knowledge gaps and deliver targeted lessons for deep understanding." },
          { label: "Mastery-Based Progress", description: "Students must achieve 90% proficiency before advancing, ensuring solid foundations and preventing learning gaps that plague traditional education." },
          { label: "Life Skills Focus", description: "Afternoons are dedicated to developing critical life skills, entrepreneurship, and pursuing passions through project-based learning with expert Guides." }
        ],
        next_options: [
          "Show me the daily schedule breakdown",
          "How do AI tutors personalize learning?", 
          "What subjects does TimeBack cover?"
        ]
      }
    }
  ];

  // Pre-cache these responses
  commonQuestions.forEach(item => {
    const cacheKey = generateCacheKey(item.question, item.context, 'schema');
    setCachedResponse(cacheKey, item.response, 1440); // Cache for 24 hours
  });
  
  console.log('[chat-tutor] Pre-cached', commonQuestions.length, 'common responses');
}

// Initialize common responses when the module loads
initializeCommonResponses();

// Cache for XML template and whitepaper content to avoid filesystem reads
let xmlTemplateCache: string | null = null;
let whitepaperCache: string | null = null;
let templateCacheTimestamp = 0;
const TEMPLATE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Optimized template and whitepaper loading with caching
function getXMLTemplate(): string {
  const now = Date.now();
  
  if (!xmlTemplateCache || (now - templateCacheTimestamp) > TEMPLATE_CACHE_TTL) {
    console.log('[chat-tutor] Loading XML template from filesystem (cache miss/expired)');
    const xmlTemplatePath = path.join(process.cwd(), 'public/docs/prompt-example.xml');
    xmlTemplateCache = fs.readFileSync(xmlTemplatePath, 'utf8');
    templateCacheTimestamp = now;
  } else {
    console.log('[chat-tutor] Using cached XML template');
  }
  
  return xmlTemplateCache;
}

function getWhitepaperContent(): string {
  const now = Date.now();
  
  if (!whitepaperCache || (now - templateCacheTimestamp) > TEMPLATE_CACHE_TTL) {
    console.log('[chat-tutor] Loading whitepaper from filesystem (cache miss/expired)');
    const whitepaperPath = path.join(process.cwd(), 'public/data/timeback-whitepaper.md');
    whitepaperCache = fs.readFileSync(whitepaperPath, 'utf8');
  } else {
    console.log('[chat-tutor] Using cached whitepaper content');
  }
  
  return whitepaperCache;
}

// Cache helper functions
function generateCacheKey(question: string, context: any, responseFormat?: string): string {
  const key = JSON.stringify({ question: question.toLowerCase().trim(), context, responseFormat });
  return crypto.createHash('md5').update(key).digest('hex');
}

function getCachedResponse(cacheKey: string): any | null {
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    console.log('[chat-tutor] Cache hit for key:', cacheKey.substring(0, 8) + '...');
    return cached.response;
  }
  
  if (cached) {
    responseCache.delete(cacheKey); // Remove expired entry
    console.log('[chat-tutor] Cache expired for key:', cacheKey.substring(0, 8) + '...');
  }
  
  return null;
}

function setCachedResponse(cacheKey: string, response: any, ttlMinutes: number = 60): void {
  const ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
  responseCache.set(cacheKey, {
    response,
    timestamp: Date.now(),
    ttl
  });
  console.log('[chat-tutor] Cached response for key:', cacheKey.substring(0, 8) + '...', 'TTL:', ttlMinutes, 'minutes');
  
  // Simple cache size management - keep only the 100 most recent entries
  if (responseCache.size > 100) {
    const oldestKey = Array.from(responseCache.keys())[0];
    responseCache.delete(oldestKey);
    console.log('[chat-tutor] Cache size limit reached, removed oldest entry');
  }
}

export const dynamic = 'force-dynamic';

// Initialize OpenAI client for final fallback
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: NextRequest) {
  console.log('[chat-tutor] API route called');
  
  try {
    // Parse request body with error handling
    let body;
    try {
      const contentLength = req.headers.get('content-length');
      if (!contentLength || contentLength === '0') {
        return new Response(JSON.stringify({ error: "Request body is required" }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      body = await req.json();
    } catch (error) {
      console.error('[chat-tutor] Invalid JSON in request body:', error);
      return new Response(JSON.stringify({ error: "Invalid JSON format in request body" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { question, interests = [], subject, gradeLevel, context, messageHistory, responseFormat, quizData } = body;
    
    console.log('[chat-tutor] Processing question:', question);
    console.log('[chat-tutor] Context:', context);
    console.log('[chat-tutor] Response format:', responseFormat);
    console.log('[chat-tutor] Message history length:', messageHistory?.length || 0);
    console.log('[chat-tutor] Quiz data keys:', quizData ? Object.keys(quizData) : 'none');

    // Check cache for schema responses (only cache schema responses, not conversations)
    let cacheKey: string | null = null;
    if (responseFormat === 'schema' || context === 'schema-generation') {
      // Create cache key based on question and minimal context (exclude conversation history for caching)
      const cacheContext = {
        interests,
        gradeLevel,
        parentType: quizData?.parentSubType,
        schoolName: quizData?.selectedSchools?.[0]?.name
      };
      
      cacheKey = generateCacheKey(question, cacheContext, responseFormat);
      const cachedResponse = getCachedResponse(cacheKey);
      
      if (cachedResponse) {
        console.log('[chat-tutor] Returning cached schema response');
        
        // Track cached response analytics
        console.log('[chat-tutor] Schema analytics (cached):', {
          timestamp: new Date().toISOString(),
          provider: 'cache',
          responseFormat: 'schema',
          questionLength: question.length,
          hasConversationHistory: !!(messageHistory && messageHistory.length > 0),
          historyLength: messageHistory?.length || 0,
          userContext: {
            hasQuizData: !!quizData,
            parentType: quizData?.parentSubType || 'unknown',
            interests: quizData?.kidsInterests?.length || 0,
            schoolCount: quizData?.selectedSchools?.length || 0,
            schoolLevels: quizData?.selectedSchools?.map((s: any) => s.level).join(',') || 'none',
            schoolLocations: quizData?.selectedSchools?.map((s: any) => `${s.city}, ${s.state}`).join(';') || 'none'
          },
          cacheStatus: 'hit',
          component: 'chat-tutor-api'
        });
        
        return new Response(JSON.stringify({
          success: true,
          response: cachedResponse,
          responseFormat: 'schema',
          provider: 'cache',
          cached: true
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      console.log('[chat-tutor] No cache hit, proceeding with AI generation');
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (responseFormat === 'schema' || context === 'schema-generation') {
      // Schema generation context using XML prompt template
      console.log('[chat-tutor] Using schema generation context with XML template');
      
      // Smart conversation history management
      let managedHistory = '';
      if (messageHistory && messageHistory.length > 0) {
        console.log('[chat-tutor] Processing conversation history for context');
        
        // Keep last 6 messages to maintain context while preventing token overflow
        const recentHistory = messageHistory.slice(-6);
        
        // Format conversation history for context
        const conversationContext = recentHistory
          .map((msg: {role: string, content: any}) => `${msg.role === 'user' ? 'Parent' : 'TimeBack AI'}: ${typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}`)
          .join('\n\n');
        
        managedHistory = `\n\nPREVIOUS CONVERSATION CONTEXT:\n${conversationContext}\n\nCURRENT QUESTION:`;
        console.log('[chat-tutor] Added conversation context:', recentHistory.length, 'messages');
      }
      
      try {
        // Get cached XML template and whitepaper content (optimized)
        const xmlTemplate = getXMLTemplate();
        const whitepaperContent = getWhitepaperContent();
        
        // Extract user context from quizData or context object
        const userContext = quizData || context || {};
        const selectedSchools = userContext.selectedSchools || [];
        
        // Build comprehensive school context for AI personalization
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
        
        // Populate XML template placeholders
        const populatedTemplate = xmlTemplate
          .replace('{{WHITE_PAPER_CONTENT}}', whitepaperContent.substring(0, 8000)) // Limit for token constraints
          .replace('{{USER_FIRST_NAME}}', userContext.userFirstName || userContext.firstName || 'Parent')
          .replace('{{STUDENT_GRADE_LEVEL}}', userContext.childGrade || gradeLevel || 'elementary')
          .replace('{{STUDENT_SUBJECTS_OF_INTEREST}}', Array.isArray(interests) ? interests.join(', ') : (userContext.kidsInterests?.join(', ') || 'math, science'))
          .replace('{{PARENT_CONCERNS}}', userContext.learningGoals?.join(', ') || userContext.mainConcerns?.join(', ') || 'academic achievement')
          .replace('{{SELECTED_SCHOOLS_CONTEXT}}', schoolContext)
          .replace('{{SCHOOL_LEVELS}}', schoolLevels)
          .replace('{{SCHOOL_LOCATIONS}}', schoolLocations)
          .replace('{{SCHOOL_TYPES}}', schoolTypes)
          .replace('{{SCHOOL_PERFORMANCE_DATA}}', schoolPerformanceData)
          .replace('{{PREVIOUS_COMPONENTS_SUMMARY}}', userContext.previousContent || 'No previous interactions')
          .replace('{{USER_LATEST_CHOICE}}', question || 'General inquiry about TimeBack');
        
        console.log('[chat-tutor] XML template populated with user context');
        
        // Use the populated template as the system prompt
        systemPrompt = populatedTemplate;
        userPrompt = `${managedHistory}Generate a compelling response for this question: "${question}"`;
        
        console.log('[chat-tutor] Final user prompt includes conversation history:', !!managedHistory);
      } catch (error) {
        console.error('[chat-tutor] Error reading XML template or whitepaper:', error);
        // Fallback to simple schema prompt
        systemPrompt = `You are a TimeBack education data analyst. Generate ONLY a JSON response using this exact schema:
{
  "header": "TIMEBACK | INSIGHT #1",
  "main_heading": "Primary heading that captures the key message",
  "description": "Brief paragraph explaining the main concept",
  "key_points": [
    {"label": "Point 1 Label", "description": "Detailed explanation"},
    {"label": "Point 2 Label", "description": "Detailed explanation"}, 
    {"label": "Point 3 Label", "description": "Detailed explanation"}
  ],
  "next_options": ["Follow-up option 1", "Follow-up option 2", "Follow-up option 3"]
}
RESPOND WITH ONLY THE JSON OBJECT - no explanations, no markdown, no additional text.`;
        userPrompt = question;
      }
    } else if (context === 'timeback-whitepaper') {
      // Chatbot context with conversation history support
      console.log('[chat-tutor] Using timeback-whitepaper context with conversation history');
      
      systemPrompt = `You are a helpful TimeBack education assistant. Answer questions about TimeBack's educational approach based on the white paper content.

Key facts about TimeBack:
- Students learn 2x faster in just 2 hours per day
- AI-powered personalized learning with 1:1 tutoring
- Students consistently score in the top 1% nationally
- Mastery-based learning requiring 90% proficiency before advancement
- No traditional teachers, instead "Guides" who motivate and support
- Afternoons free for life skills and passion projects

Be helpful, informative, and educational. Focus on explaining how TimeBack works and its benefits.

If there is previous conversation context, acknowledge it and build upon the discussion naturally.`;
      
      // Include conversation history for context continuity
      if (messageHistory && messageHistory.length > 0) {
        const recentHistory = messageHistory.slice(-8); // More context for chat
        const conversationContext = recentHistory
          .map((msg: {role: string, content: any}) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
          .join('\n');
        
        userPrompt = `Previous conversation:\n${conversationContext}\n\nCurrent question: ${question}`;
        console.log('[chat-tutor] Added conversation context for whitepaper chat:', recentHistory.length, 'messages');
      } else {
      userPrompt = question;
      }
    } else {
      // Regular tutor context  
      systemPrompt = `You are a helpful AI tutor helping a ${gradeLevel || 'student'} who is interested in ${interests.join(', ') || 'various topics'}.

🚫 CRITICAL RULE: NEVER GIVE AWAY THE ANSWER! NEVER SOLVE THE PROBLEM FOR THEM!

You are a GUIDE, not a problem solver. Your job is to help students think through problems step by step without giving away solutions.

ALWAYS follow these strict guidelines:
1. 🚫 NEVER provide the final answer or solution
2. 🚫 NEVER do calculations for them
3. 🚫 NEVER give away what the answer should be
4. ✅ Ask guiding questions to help them think
5. ✅ Give hints about what concept or method to use
6. ✅ Help them break the problem into smaller steps
7. ✅ Point them toward the right approach or formula
8. ✅ Encourage them when they're on the right track
9. ✅ Help them identify what information they have vs what they need
10. ✅ Connect to their interests to make it engaging

EXAMPLES:
❌ BAD: "The answer is 73. LeBron made 73% of 582 shots, so 582 × 0.73 = 425 shots."
✅ GOOD: "Great question about LeBron! When we want to find a percentage of something, what operation do you think we'd use? What does 73% mean as a decimal?"

❌ BAD: "You need to multiply 582 by 0.73 to get 425."
✅ GOOD: "You've got the right numbers! Now, when finding 73% of 582 shots, think about what 73% means. Have you learned how to convert percentages to decimals?"

Keep responses encouraging, age-appropriate, and focused on guiding their thinking process.`;

      userPrompt = `The student is asking about ${subject || 'a subject'}: "${question}"
${context ? `\nContext: ${JSON.stringify(context)}` : ''}`;
    }

    // Track start time for analytics
    const startTime = Date.now();
    let usedProvider = '';
    let fullText = '';
    let tokenUsage: any = {};
    
    // Prepare messages for all providers
    const messages = [
      ...(messageHistory || []).map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user',
        content: userPrompt
      }
    ];

    try {
      // FIRST: Try Cerebras API (following models.mdc hierarchy)
      console.log('[chat-tutor] Attempting Cerebras (primary model)...');
      
      try {
        const cerebrasMessages = [];
        if (systemPrompt) {
          cerebrasMessages.push({ role: 'system', content: systemPrompt });
        }
        cerebrasMessages.push(...messages);
        
        const cerebrasResponse = await fetch('https://api.cerebras.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'qwen-3-235b-a22b-instruct-2507',
            messages: cerebrasMessages,
            max_tokens: 1024,
            temperature: 0.7
          })
        });

        if (!cerebrasResponse.ok) {
          const error = await cerebrasResponse.text();
          throw new Error(`Cerebras API error: ${cerebrasResponse.status} - ${error}`);
        }

        const cerebrasCompletion = await cerebrasResponse.json();
        fullText = cerebrasCompletion.choices[0]?.message?.content || '';
        tokenUsage = cerebrasCompletion.usage || {};
        usedProvider = 'cerebras';
        
        console.log('[chat-tutor] Cerebras successful, response length:', fullText.length);
        
      } catch (cerebrasError) {
        console.log('[chat-tutor] Cerebras failed, falling back to AWS Bedrock...', cerebrasError.message);
        
        try {
          // SECOND: Try AWS Bedrock Claude (fallback #1)
          console.log('[chat-tutor] Attempting AWS Bedrock...');
          
          const claudeMessages: ClaudeMessage[] = messages;
          const response = await invokeClaude(claudeMessages, {
            maxTokens: 1024,
            temperature: 0.7,
            system: systemPrompt
          });
          
          fullText = formatClaudeResponse(response);
          tokenUsage = response.usage || {};
          usedProvider = 'bedrock';
          
          console.log('[chat-tutor] AWS Bedrock successful, response length:', fullText.length);
          
        } catch (bedrockError) {
          console.log('[chat-tutor] Bedrock failed, falling back to OpenAI GPT-4 Turbo...', bedrockError.message);
          
          // THIRD: Try OpenAI GPT-4 Turbo (final fallback)
          console.log('[chat-tutor] Attempting OpenAI GPT-4 Turbo...');
          
          const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
          if (systemPrompt) {
            openaiMessages.push({ role: 'system', content: systemPrompt });
          }
          openaiMessages.push(...messages);
          
          const completion = await openaiClient.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: openaiMessages,
            max_tokens: 1024,
            temperature: 0.7,
            stream: false,
          });

          fullText = completion.choices[0]?.message?.content || '';
          tokenUsage = completion.usage || {};
          usedProvider = 'openai';
          
          console.log('[chat-tutor] OpenAI GPT-4 Turbo successful, response length:', fullText.length);
        }
      }
      
      // Track successful completion with actual provider used
      const modelMap = {
        cerebras: 'qwen-3-235b-a22b-instruct-2507',
        bedrock: 'us.anthropic.claude-3-7-sonnet-20250219-v1:0', 
        openai: 'gpt-4-turbo-preview'
      };
      
      await trackLLMUsage({
        endpoint: 'chat-tutor',
        model: modelMap[usedProvider as keyof typeof modelMap] || usedProvider,
        latencyMs: Date.now() - startTime,
        success: true,
        context: {
          gradeLevel,
          interests,
          messagesCount: messageHistory?.length || 0,
          isStreaming: false,
          provider: usedProvider,
          inputTokens: tokenUsage.input_tokens || tokenUsage.prompt_tokens,
          outputTokens: tokenUsage.output_tokens || tokenUsage.completion_tokens
        }
      });

      // Handle schema response format with JSON validation
      if (responseFormat === 'schema' || context === 'schema-generation') {
        console.log('[chat-tutor] Processing schema response, validating JSON...');
        
        try {
          // Try to parse the response as JSON to validate structure
          let parsedResponse;
          
          // Clean up response if it has extra text around JSON or common formatting issues returned by LLMs
          let cleanedResponse = fullText.trim();

          // Standardise curly / straight quotation marks that often break JSON parsing
          cleanedResponse = cleanedResponse
            .replace(/[\u201C\u201D]/g, '"')   // smart double quotes → straight quotes
            .replace(/[\u2018\u2019]/g, "'");  // smart single quotes → straight single quotes

          // Remove raw newline characters that occasionally appear unescaped inside JSON string values
          cleanedResponse = cleanedResponse.replace(/\r?\n+/g, ' ');
          
          // Find JSON object boundaries
          const jsonStart = cleanedResponse.indexOf('{');
          const jsonEnd = cleanedResponse.lastIndexOf('}') + 1;
          
          if (jsonStart !== -1 && jsonEnd > jsonStart) {
            cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd);
          }
          
          parsedResponse = JSON.parse(cleanedResponse);
          
          // Validate required schema fields
          const requiredFields = ['header', 'main_heading', 'description', 'key_points', 'next_options'];
          const missingFields = requiredFields.filter(field => !parsedResponse[field]);
          
          if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
          }
          
          // Validate key_points structure (should be array of 3 objects with label and description)
          if (!Array.isArray(parsedResponse.key_points) || parsedResponse.key_points.length !== 3) {
            throw new Error('key_points must be an array of exactly 3 objects');
          }
          
          for (const point of parsedResponse.key_points) {
            if (!point.label || !point.description) {
              throw new Error('Each key_point must have both label and description');
            }
          }
          
          // Validate next_options structure (should be array of 3 strings)
          if (!Array.isArray(parsedResponse.next_options) || parsedResponse.next_options.length !== 3) {
            throw new Error('next_options must be an array of exactly 3 strings');
          }
          
          console.log('[chat-tutor] Schema response validated successfully');
          
          // Cache the successful schema response for future use
          if (cacheKey) {
            setCachedResponse(cacheKey, parsedResponse, 120); // Cache for 2 hours
          }
          
          // Track successful schema response analytics
          console.log('[chat-tutor] Schema analytics:', {
            timestamp: new Date().toISOString(),
            provider: usedProvider,
            responseFormat: 'schema',
            questionLength: question.length,
            hasConversationHistory: !!(messageHistory && messageHistory.length > 0),
            historyLength: messageHistory?.length || 0,
            userContext: {
              hasQuizData: !!quizData,
              parentType: quizData?.parentSubType || 'unknown',
              interests: quizData?.kidsInterests?.length || 0,
              schoolCount: quizData?.selectedSchools?.length || 0,
              schoolLevels: quizData?.selectedSchools?.map((s: any) => s.level).join(',') || 'none',
              schoolLocations: quizData?.selectedSchools?.map((s: any) => `${s.city}, ${s.state}`).join(';') || 'none'
            },
            responseMetrics: {
              keyPointsCount: parsedResponse.key_points?.length || 0,
              nextOptionsCount: parsedResponse.next_options?.length || 0,
              descriptionLength: parsedResponse.description?.length || 0
            },
            cacheStatus: 'fresh',
            component: 'chat-tutor-api'
          });
          
          // Return validated schema response
          return new Response(JSON.stringify({
            success: true,
            response: parsedResponse,
            responseFormat: 'schema',
            provider: usedProvider,
            cached: false
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
        } catch (validationError) {
          console.error('[chat-tutor] Schema validation failed:', validationError);
          console.error('[chat-tutor] Raw response was:', fullText);
          
          // Return error with fallback
          return new Response(JSON.stringify({
            success: false,
            error: 'Failed to generate valid schema response',
            validationError: validationError.message,
            rawResponse: fullText
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
            }
          });
        }
      }

      // Return standard plain text response
      return new Response(JSON.stringify({
        success: true,
        response: fullText,
        provider: usedProvider
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
    } catch (error) {
      console.error('[chat-tutor] All providers failed:', error);
      
      // Track error with final attempted provider
      await trackLLMUsage({
        endpoint: 'chat-tutor',
        model: usedProvider || 'unknown',
        latencyMs: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        context: {
          gradeLevel,
          interests,
          messagesCount: messageHistory?.length || 0,
          isStreaming: false,
          provider: usedProvider || 'all-failed'
        }
      });

      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to generate response - all AI providers unavailable'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      });
    }
  } catch (error) {
    console.error('[chat-tutor] Outer error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to process request'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}