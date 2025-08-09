import { NextRequest } from 'next/server';
import { trackLLMUsage } from '@/libs/llm-analytics';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { xmlPromptBuilder } from '@/libs/xml-prompt-builder';
import { unifiedDataService } from '@/libs/unified-data-service';
import { SectionSchema } from '@/libs/section-schemas';
import { fieldMapper } from '@/libs/supabase-service';
import { aiPromptLogger } from '@/libs/ai-prompt-logger';

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
        description: "TimeBack enables students to learn 2x the material in just 2 hours per day (≈6x faster learning rate) through AI-powered personalized mastery learning. Students work with AI tutors that adapt to their learning style, while human Guides provide motivation and life skills training.",
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
let schoolInfoCache: string | null = null;
let templateCacheTimestamp = 0;
let schoolInfoCacheTimestamp = 0;
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

function getSchoolInfoContent(): string {
  const now = Date.now();
  
  if (!schoolInfoCache || (now - schoolInfoCacheTimestamp) > TEMPLATE_CACHE_TTL) {
    console.log('[chat-tutor] Loading school info from filesystem (cache miss/expired)');
    const schoolInfoPath = path.join(process.cwd(), 'public/data/school-info.md');
    schoolInfoCache = fs.readFileSync(schoolInfoPath, 'utf8');
    schoolInfoCacheTimestamp = now;
  } else {
    console.log('[chat-tutor] Using cached school info content');
  }
  
  return schoolInfoCache;
}

// Plain-text sanitizer to enforce "no markdown" policy on all returned strings
function stripMarkdown(input: string): string {
  if (typeof input !== 'string') return input as unknown as string;
  let s = input;
  // Remove common markdown emphases and code formatting
  s = s
    .replace(/\*\*([^*]+)\*\*/g, '$1')  // **bold**
    .replace(/\*([^*]+)\*/g, '$1')        // *italic*
    .replace(/__([^_]+)__/g, '$1')         // __underline__
    .replace(/_([^_]+)_/g, '$1')           // _emphasis_
    .replace(/`([^`]+)`/g, '$1')           // `code`
    .replace(/~~([^~]+)~~/g, '$1');        // ~~strikethrough~~
  // Remove any remaining stray multiple asterisks or heading markers
  s = s
    .replace(/\*{2,}/g, '')                // **** -> ''
    .replace(/(^|\n)\s*#{1,6}\s+/g, '$1'); // # Heading -> Heading
  return s;
}

function sanitizePlainTextDeep<T = any>(value: T): T {
  // Recursively walk the object/array and strip markdown from all string fields
  if (value == null) return value;
  if (Array.isArray(value)) {
    return value.map((v) => sanitizePlainTextDeep(v)) as unknown as T;
  }
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      const arr = (value as unknown[]).map((v) => sanitizePlainTextDeep(v));
      return arr as unknown as T;
    }
    const output: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      output[k] = sanitizePlainTextDeep(v);
    }
    return output as T;
  }
  if (typeof value === 'string') {
    return stripMarkdown(value) as unknown as T;
  }
  return value;
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

// Cerebras configuration - using direct fetch API
const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY || '';

// Groq configuration (OpenAI-compatible API)
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

function log(message: string, meta?: Record<string, unknown>) {
  const ts = new Date().toISOString();
  if (meta) {
    console.log(`[chat-tutor] ${ts} ${message}`, meta);
  } else {
    console.log(`[chat-tutor] ${ts} ${message}`);
  }
}

async function generateWithGroq(
  systemPrompt: string,
  messages: any[],
  preferJson: boolean = false
): Promise<{ content: string; provider: string; model: string }> {
  if (!GROQ_API_KEY) {
    log('GROQ_API_KEY is not set; cannot use Groq fallback');
    throw new Error('GROQ_API_KEY is not configured');
  }

  log('Attempting Groq fallback...');

  const groqMessages = [] as Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  if (systemPrompt) {
    groqMessages.push({ role: 'system', content: systemPrompt });
  }
  // Use the full message history for Groq fallback as requested
  groqMessages.push(...messages);

  // Diagnostics for Groq input sizes
  const groqApproxChars = groqMessages.reduce((sum, m) => {
    const c = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
    return sum + c.length;
  }, 0);
  log('Groq request prepared', {
    provider: 'groq',
    baseUrl: GROQ_BASE_URL,
    model: 'openai/gpt-oss-120b',
    systemPromptChars: (systemPrompt?.length || 0),
    messagesCount: messages.length,
    approxChars: groqApproxChars
  });

  const requestBody: any = {
    model: 'openai/gpt-oss-120b',
    messages: groqMessages,
    // Increased max tokens to prevent truncation when falling back from Cerebras (was 1024)
    max_tokens: 4000,
    temperature: 0.7,
    top_p: 1,
    stream: false
  };

  if (preferJson) {
    requestBody.response_format = { type: 'json_object' };
  }

  const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  log('Groq response received', {
    provider: 'groq',
    status: response.status,
    ok: response.ok,
    contentType: response.headers.get('content-type') || 'unknown'
  });

  if (!response.ok) {
    const errorText = await response.text();
    log('Groq error body snippet', { snippet: errorText.slice(0, 300) });
    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  const completion = await response.json();
  const content = completion.choices[0]?.message?.content || '';
  
  if (!content) {
    throw new Error('Groq returned empty response');
  }

  log(`Groq successful, response length: ${content.length}`);
  return { content, provider: 'groq', model: 'openai/gpt-oss-120b' };
}

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
    
    const { question, interests = [], subject, gradeLevel, context, messageHistory, responseFormat, quizData, stream = false, sectionId, sectionSchema, userData, userContext } = body;
    
    console.log('[chat-tutor] Processing question:', question);
    console.log('[chat-tutor] Context:', context);
    console.log('[chat-tutor] Response format:', responseFormat);
    console.log('[chat-tutor] Message history length:', messageHistory?.length || 0);
    console.log('[chat-tutor] Quiz data keys:', quizData ? Object.keys(quizData) : 'none');
    console.log('[chat-tutor] Section ID:', sectionId);
    console.log('[chat-tutor] Has section schema:', !!sectionSchema);
    console.log('[chat-tutor] Has user data:', !!userData);

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
    
    // Handle section schema-based generation
    if (sectionId && sectionSchema) {
      console.log('[chat-tutor] Using section schema-based generation for:', sectionId);
      console.log('[chat-tutor] Raw userData:', userData);
      
      try {
        // Map the user data to expected field names
        const mappedUserData = fieldMapper.mapQuizToAI(userData || {});
        console.log('[chat-tutor] Mapped userData:', mappedUserData);
        
        // Use the XML prompt builder with section schema
        const promptResult = xmlPromptBuilder.buildPrompt({
          sectionId,
          userData: mappedUserData,
          userContext: userContext || {},
          messageHistory: messageHistory || [],
          additionalContext: context || {}
        });
        
        if (!promptResult.success) {
          if (promptResult.missingData) {
            console.log('[chat-tutor] Missing required data:', promptResult.missingData);
            return new Response(JSON.stringify({
              success: false,
              error: 'Missing required data',
              missingData: promptResult.missingData
            }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          
          return new Response(JSON.stringify({
            success: false,
            error: promptResult.error || 'Failed to build prompt'
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        userPrompt = promptResult.prompt!;
        console.log('[chat-tutor] Built prompt using section schema, length:', userPrompt.length);
        
      } catch (error) {
        console.error('[chat-tutor] Error building prompt with schema:', error);
        // Fall back to regular schema generation
      }
    } else if (responseFormat === 'schema' || context === 'schema-generation') {
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
        const schoolInfoContent = getSchoolInfoContent();
        
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
          .replace('{{WHITE_PAPER_CONTENT}}', whitepaperContent) // Full whitepaper content
          .replace('{{SCHOOL_INFO_CONTENT}}', schoolInfoContent.substring(0, 5000)) // School location directory
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
        
        // Log the XML prompt
        aiPromptLogger.logXMLPrompt('chat-tutor', populatedTemplate, {
          service: 'chat-tutor',
          question,
          hasMessageHistory: !!managedHistory,
          gradeLevel: userContext.childGrade || gradeLevel,
          interests: Array.isArray(interests) ? interests : userContext.kidsInterests,
          userId: userData?.userId || 'anonymous'
        });
        
        // Use the populated template as the system prompt
        systemPrompt = populatedTemplate;
        // Enforce ASCII-only, JSON-only output for schema generation to prevent smart punctuation issues
        systemPrompt += '\n\nSTRICT OUTPUT CONSTRAINTS: Return a single JSON object using only ASCII characters (U+0020–U+007E). Use straight quotes (\"), no smart quotes/dashes, no non-breaking spaces, and no special symbols. Escape newlines as \\n. Do not include any text before or after the JSON.';
        // Enforce plain-text only within all string fields to prevent markdown/styling characters from appearing in UI
        systemPrompt += '\n\nPLAIN TEXT ONLY: All string values in the JSON (e.g., header, main_heading, description, key_points.label, key_points.description, next_options) must use plain text only. Do NOT include any markdown or formatting characters such as **, *, __, _, #, >, `, ~, or list prefixes like - or 1). Write clean human-readable sentences without wrappers.';
        // Enforce exact cardinality and allowed keys
        systemPrompt += '\n\nSTRICT CARDINALITY: Return EXACTLY 3 items in key_points (no more, no less) and EXACTLY 3 items in next_options (no more, no less). If you have more candidates, include only the best 3 and omit the rest.';
        systemPrompt += '\n\nALLOWED KEYS ONLY: Only include these top-level keys: header, main_heading, description, key_points, next_options. Do NOT include any other keys.';
        systemPrompt += '\n\nARRAY LENGTH ENFORCEMENT: key_points must be an array of length 3 with objects having label and description. next_options must be an array of length 3 of plain strings.';
        userPrompt = `${managedHistory}Generate a compelling response for this question: "${question}"`;
        
        console.log('[chat-tutor] Final user prompt includes conversation history:', !!managedHistory);
      } catch (error) {
        console.error('[chat-tutor] Error reading XML template or whitepaper:', error);
        // Fallback to simple schema prompt
        systemPrompt = `You are a TimeBack education data analyst. 

SPECIAL RULE: If question contains "What is TimeBack?" treat as SIMPLE even if additional context follows - prioritize clear, concise explanation of TimeBack over comprehensive evidence.

MANDATORY for complex questions (NOT "What is TimeBack?" questions): Include specific research citations with study names (e.g., "Benjamin Bloom's 2 Sigma Problem (1984) found..."), exact Alpha School data with specific numbers and percentiles (e.g., "Alpha students averaged 99th percentile on MAP reading with 6.81x faster learning"), and concrete student case studies (e.g., "7 boys who were 2 years behind advanced 13.8x faster, completing 2 grade levels in 6 months"). FORBIDDEN: Vague phrases like "research shows" or "studies indicate" without specifics. 

Generate ONLY a JSON response using this exact schema:
{
  "header": "TIMEBACK | INSIGHT #1",
  "main_heading": "Primary heading that captures the key message",
  "description": "Contextual explanation that matches the question complexity: brief and clear for simple questions (especially 'What is TimeBack?' questions), comprehensive and detailed for complex multi-part questions. SPECIAL: For 'What is TimeBack?' treat as simple regardless of additional context. MANDATORY FORMATTING: Use \\n\\n for paragraph breaks between different concepts to improve readability. Break long explanations into digestible paragraphs.",
  "key_points": [
    {"label": "Point 1 Label", "description": "Detailed explanation. Use \\n\\n for paragraph breaks if explanation is complex"},
    {"label": "Point 2 Label", "description": "Detailed explanation. Use \\n\\n for paragraph breaks if explanation is complex"}, 
    {"label": "Point 3 Label", "description": "Detailed explanation. Use \\n\\n for paragraph breaks if explanation is complex"}
  ],
  "next_options": ["Follow-up option 1", "Follow-up option 2", "Follow-up option 3"]
}
RESPOND WITH ONLY THE JSON OBJECT - no explanations, no markdown, no additional text.`;
        // Enforce ASCII-only, JSON-only output for schema generation to prevent smart punctuation issues
        systemPrompt += '\n\nSTRICT OUTPUT CONSTRAINTS: Return a single JSON object using only ASCII characters (U+0020–U+007E). Use straight quotes (\"), no smart quotes/dashes, no non-breaking spaces, and no special symbols. Escape newlines as \\n. Do not include any text before or after the JSON.';
        // Enforce plain-text only within all string fields to prevent markdown/styling characters from appearing in UI
        systemPrompt += '\n\nPLAIN TEXT ONLY: All string values in the JSON (e.g., header, main_heading, description, key_points.label, key_points.description, next_options) must use plain text only. Do NOT include any markdown or formatting characters such as **, *, __, _, #, >, `, ~, or list prefixes like - or 1). Write clean human-readable sentences without wrappers.';
        // Reinforce exact cardinality and allowed keys
        systemPrompt += '\n\nSTRICT CARDINALITY: Return EXACTLY 3 items in key_points and EXACTLY 3 items in next_options. Never return 2 or 4+ items.';
        systemPrompt += '\n\nALLOWED KEYS ONLY: Only include top-level keys header, main_heading, description, key_points, next_options. Do not include any other keys.';
        systemPrompt += '\n\nARRAY LENGTH ENFORCEMENT: key_points length must be 3 (objects with label and description). next_options length must be 3 (plain strings).';
        userPrompt = question;
      }
    } else if (context === 'timeback-whitepaper') {
      // Chatbot context with conversation history support
      console.log('[chat-tutor] Using timeback-whitepaper context with conversation history');
      
      systemPrompt = `You are a helpful TimeBack education assistant. Answer questions about TimeBack's educational approach based on the white paper content.

Key facts about TimeBack:
- Students learn 2x the material in just 2 hours per day (≈6x faster learning rate)
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

Keep responses encouraging, age-appropriate, and focused on guiding their thinking process.

## Mathematical Formatting Rules
CRITICAL: Use ONLY plain text and Unicode symbols for all mathematical expressions:
- Use × for multiplication (not \\times)
- Use ÷ for division (not \\div) 
- Use ½, ⅓, ¼, ⅔, ¾ for common fractions (not \\frac{1}{2})
- Use ft, in, cm, etc. as plain text (not \\text{ft})
- Use ± for plus/minus (not \\pm)
- NEVER use LaTeX notation like \\text{}, \\times, \\frac{}, etc.
- Write mathematical expressions as readable text that displays correctly

Examples:
❌ BAD: "(12 \\text{ ft} \\times 9 \\text{ ft})"
✅ GOOD: "(12 ft × 9 ft)"

❌ BAD: "\\frac{1}{2} of the total area"
✅ GOOD: "½ of the total area"

❌ BAD: "area \\div 40"
✅ GOOD: "area ÷ 40"`;

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
        
        // Handle streaming if requested
        if (stream && responseFormat !== 'schema') {
          console.log('[chat-tutor] Using streaming response');
          
          // Log the API request
          const requestBody = {
            model: 'llama-4-scout-17b-16e-instruct',
            messages: cerebrasMessages,
            max_completion_tokens: 65536,
            temperature: 0.2,
            top_p: 1,
            stream: true
          };
          
          aiPromptLogger.logAPIRequest('cerebras-streaming', requestBody, {
            messageCount: cerebrasMessages.length,
            hasSystemPrompt: !!systemPrompt,
            question,
            userId: userData?.userId || 'anonymous'
          });
          
          const cerebrasResponse = await fetch('https://api.cerebras.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          });

          if (!cerebrasResponse.ok) {
            const error = await cerebrasResponse.text();
            throw new Error(`Cerebras API error: ${cerebrasResponse.status} - ${error}`);
          }

          // Return early with streaming response
          const encoder = new TextEncoder();
          const streamReader = cerebrasResponse.body?.getReader();
          const decoder = new TextDecoder();
          
          const streamResponse = new ReadableStream({
            async start(controller) {
              if (!streamReader) {
                controller.error(new Error('No response body'));
                return;
              }
              
              let buffer = '';
              
              try {
                let done = false;
                while (!done) {
                  const result = await streamReader.read();
                  done = result.done || false;
                  const value = result.value;
                  if (done) break;
                  
                  buffer += decoder.decode(value, { stream: true });
                  const lines = buffer.split('\n');
                  buffer = lines.pop() || '';
                  
                  for (const line of lines) {
                    if (line.startsWith('data: ')) {
                      const data = line.slice(6);
                      if (data === '[DONE]') {
                        controller.enqueue(encoder.encode('data: {"success":true,"provider":"cerebras"}\n\n'));
                        continue;
                      }
                      
                      try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices?.[0]?.delta?.content || '';
                        if (content) {
                          controller.enqueue(encoder.encode(`data: {"content":"${content.replace(/"/g, '\\"')}"}\n\n`));
                        }
                      } catch (e) {
                        // Skip parsing errors
                      }
                    }
                  }
                }
                
                controller.close();
              } catch (error) {
                controller.error(error);
              }
            }
          });
          
          return new Response(streamResponse, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          });
        }

        // Non-streaming response
        const nonStreamRequestBody = {
          model: 'llama-4-scout-17b-16e-instruct',
          messages: cerebrasMessages,
          max_completion_tokens: 65536,
          // Lower temperature for schema/strict JSON responses to reduce smart punctuation and variability
          temperature: (responseFormat === 'schema' || context === 'schema-generation') ? 0 : 0.2,
          top_p: 1,
          stream: false
        };
        
        // Log the API request
        aiPromptLogger.logAPIRequest('cerebras-non-streaming', nonStreamRequestBody, {
          messageCount: cerebrasMessages.length,
          hasSystemPrompt: !!systemPrompt,
          question,
          userId: userData?.userId || 'anonymous'
        });
        
        const cerebrasResponse = await fetch('https://api.cerebras.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(nonStreamRequestBody)
        });

        if (!cerebrasResponse.ok) {
          const error = await cerebrasResponse.text();
          throw new Error(`Cerebras API error: ${cerebrasResponse.status} - ${error}`);
        }

        const cerebrasCompletion = await cerebrasResponse.json();
        fullText = cerebrasCompletion.choices[0]?.message?.content || '';
        tokenUsage = cerebrasCompletion.usage || {};
        usedProvider = 'cerebras';
        
        // Log the API response
        aiPromptLogger.logAPIResponse('cerebras-non-streaming', cerebrasCompletion, {
          responseLength: fullText.length,
          promptTokens: tokenUsage.prompt_tokens,
          completionTokens: tokenUsage.completion_tokens,
          totalTokens: tokenUsage.total_tokens
        });
        
        console.log('[chat-tutor] Cerebras successful, response length:', fullText.length);
        
      } catch (cerebrasError) {
        console.log('[chat-tutor] Cerebras failed:', cerebrasError.message);
        
        // Try Groq as fallback
        try {
          const groqResult = await generateWithGroq(
            systemPrompt,
            messages,
            responseFormat === 'schema' || context === 'schema-generation'
          );
          fullText = groqResult.content;
          usedProvider = groqResult.provider;
          tokenUsage = {}; // Groq doesn't provide detailed token usage in this implementation
          
          console.log('[chat-tutor] Groq fallback successful, response length:', fullText.length);
        } catch (groqError) {
          console.log('[chat-tutor] Groq fallback also failed:', groqError.message);
          throw cerebrasError; // Throw original Cerebras error
        }
      }
      
      // Track successful completion with actual provider used
      const modelMap = {
        cerebras: 'llama-4-scout-17b-16e-instruct',
        groq: 'openai/gpt-oss-120b'
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
          
          // Clean up response if it has extra text around JSON or formatting quirks produced by LLMs
          // 1) Convert smart quotes to standard quotes
          // 2) Collapse unescaped line breaks inside JSON strings
          // 3) Trim any leading / trailing commentary
          let cleanedResponse = fullText.trim()
            .replace(/[\u201C\u201D]/g, '"')  // smart double quotes → standard
            .replace(/[\u2018\u2019]/g, "'")   // smart single quotes → standard
            .replace(/\r?\n+/g, ' ');
          
          // Find JSON object boundaries
          const jsonStart = cleanedResponse.indexOf('{');
          const jsonEnd = cleanedResponse.lastIndexOf('}') + 1;
          
          if (jsonStart !== -1 && jsonEnd > jsonStart) {
            cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd);
          }
          
          // Handle Unicode characters that can break JSON parsing
          try {
            parsedResponse = JSON.parse(cleanedResponse);
          } catch (parseError) {
            console.log('[chat-tutor] Initial JSON parse failed, attempting Unicode cleanup:', parseError.message);
            
            // Clean up common Unicode issues that break JSON parsing
            let unicodeCleanedResponse = cleanedResponse
              .replace(/[""]/g, '"')  // Replace smart quotes with regular quotes
              .replace(/['']/g, "'")  // Replace smart apostrophes
              .replace(/[–—]/g, '-')  // Replace en-dash and em-dash with regular dash
              .replace(/×/g, 'x')     // Replace multiplication symbol
              .replace(/\s+%/g, '%')  // Remove extra spaces before percent
              .replace(/\u2013/g, '-') // En-dash
              .replace(/\u2014/g, '-') // Em-dash
              .replace(/\u2019/g, "'") // Right single quotation mark
              .replace(/\u201C/g, '"') // Left double quotation mark
              .replace(/\u201D/g, '"') // Right double quotation mark
              .replace(/\u2212/g, '-') // Minus sign
              .replace(/\u00D7/g, 'x') // Multiplication sign
              .replace(/\u2011/g, '-') // Non-breaking hyphen
              .replace(/\u00A0/g, ' '); // Non-breaking space
            
            // Fix specific structural JSON issues
            unicodeCleanedResponse = unicodeCleanedResponse
              // Fix unescaped quotes around specific terms that commonly appear
              .replace(/"Speed Bumps"/g, '\\"Speed Bumps\\"')
              .replace(/"one‑size‑fits‑all"/g, '\\"one-size-fits-all\\"')
              .replace(/"middle of the road"/g, '\\"middle of the road\\"')
              .replace(/"98th‑percentile"/g, '\\"98th-percentile\\"')
              .replace(/"A"/g, '\\"A\\"') // For cases like "A" students
              .replace(/"90%\+"/g, '\\"90%+\\"') // For percentage ranges
              .replace(/"Benjamin Bloom's 2 Sigma Problem"/g, '\\"Benjamin Bloom\'s 2 Sigma Problem\\"')
              // Fix markdown-style formatting that might slip through (enhanced detection)
              .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove **bold** formatting
              .replace(/\*([^*]+)\*/g, '$1') // Remove *italic* formatting
              .replace(/_{2,}([^_]+)_{2,}/g, '$1') // Remove __underline__ formatting
              .replace(/_([^_]+)_/g, '$1') // Remove _emphasis_ formatting
              .replace(/`([^`]+)`/g, '$1') // Remove `code` formatting
              .replace(/~~([^~]+)~~/g, '$1') // Remove ~~strikethrough~~ formatting
              // More aggressive ** detection for edge cases
              .replace(/\*{2,}/g, '') // Remove any double or multiple asterisks
              .replace(/\*(?=[A-Z])/g, '') // Remove asterisks before capital letters
              .replace(/\*(?=\s)/g, '') // Remove asterisks before spaces
              // Fix double-escaped newlines
              .replace(/\\\\n\\\\n/g, '\\n\\n')
              .replace(/\\\\n/g, '\\n')
              // More aggressive quote fixing for common phrases
              .replace(/eliminating the "([^"]+)" pacing/g, 'eliminating the \\"$1\\" pacing')
              .replace(/the "([^"]+)" approach/g, 'the \\"$1\\" approach')
              .replace(/called "([^"]+)"/g, 'called \\"$1\\"')
              // Generic fix for any unescaped quotes within string values
              .replace(/"([^"]*)"([^"]*)"([^"]*)"/g, (match, part1, part2, part3) => {
                // Only apply if this looks like a JSON string value (not a key-value pair)
                if (part1.includes(': ') || part1.includes('": ')) {
                  return match; // Skip if this looks like a JSON key
                }
                // If part2 contains common quoted terms, escape them
                if (part2.match(/\b(Speed Bumps|middle of the road|one.size.fits.all|A|98th.percentile|traditional|approach|model|system)\b/)) {
                  return `"${part1}\\"${part2}\\"${part3}"`;
                }
                return match; // Keep original if no common patterns found
              });
            
            try {
              parsedResponse = JSON.parse(unicodeCleanedResponse);
              console.log('[chat-tutor] Successfully parsed after Unicode cleanup');
            } catch (secondParseError) {
              // Final fallback: try to fix unescaped quotes within JSON strings more systematically
              console.log('[chat-tutor] Attempting final quote fix for JSON strings...');
              
              try {
                // More systematic approach: fix quotes within JSON string values
                let finalCleanedResponse = unicodeCleanedResponse;
                
                // Fix unescaped quotes in description fields specifically
                finalCleanedResponse = finalCleanedResponse.replace(
                  /"description"\s*:\s*"([^"]*)"([^"]*)"([^"]*)"/g,
                  (match, prefix, middle, suffix) => {
                    return `"description": "${prefix}\\"${middle}\\"${suffix}"`;
                  }
                );
                
                // Fix unescaped quotes in any string field that contains common patterns
                finalCleanedResponse = finalCleanedResponse.replace(
                  /("\w+")\s*:\s*"([^"]*)"([^"]*)"([^"]*)"/g,
                  (match, fieldName, prefix, middle, suffix) => {
                    // Only escape if middle contains content that looks like it should be quoted
                    if (middle.length > 0 && middle.match(/\w+/)) {
                      return `${fieldName}: "${prefix}\\"${middle}\\"${suffix}"`;
                    }
                    return match;
                  }
                );
                
                parsedResponse = JSON.parse(finalCleanedResponse);
                console.log('[chat-tutor] Successfully parsed after final quote fix');
              } catch (finalParseError) {
                console.error('[chat-tutor] Final JSON parse also failed:', finalParseError.message);
                console.error('[chat-tutor] JSON parse failed even after cleanup:', secondParseError.message);
                console.error('[chat-tutor] Original response snippet:', cleanedResponse.substring(0, 500));
                console.error('[chat-tutor] Unicode cleaned snippet:', unicodeCleanedResponse.substring(0, 500));
                
                // Log the problematic area around the error position if available
                if (secondParseError.message.includes('position')) {
                  const positionMatch = secondParseError.message.match(/position (\d+)/);
                  if (positionMatch) {
                    const position = parseInt(positionMatch[1]);
                    const start = Math.max(0, position - 100);
                    const end = Math.min(unicodeCleanedResponse.length, position + 100);
                    console.error('[chat-tutor] Context around error position:', unicodeCleanedResponse.substring(start, end));
                    console.error('[chat-tutor] Error position marker:', ' '.repeat(Math.min(100, position - start)) + '^');
                  }
                }
                
                throw new Error(`Failed to parse AI response as JSON after all cleanup attempts: ${finalParseError.message}`);
              }
            }
          }
          
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
          
          // Enforce plain-text policy by stripping markdown across all string fields
          const sanitizedResponse = sanitizePlainTextDeep(parsedResponse);
          if (sanitizedResponse !== parsedResponse) {
            console.log('[chat-tutor] Applied markdown sanitizer to schema response');
          }

          console.log('[chat-tutor] Schema response validated successfully');
          
          // Additional validation for section schema responses
          if (sectionId && sectionSchema) {
            const isValid = xmlPromptBuilder.validateResponse(sectionId, parsedResponse);
            if (!isValid) {
              console.warn('[chat-tutor] Response does not match section schema structure');
            }
          }
          
          // Cache the successful schema response for future use
          if (cacheKey) {
            setCachedResponse(cacheKey, sanitizedResponse, 120); // Cache for 2 hours
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
            response: sanitizedResponse,
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