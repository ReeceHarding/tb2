import { safeBedrockAPI } from '@/libs/bedrock-helpers';

export const dynamic = 'force-dynamic';

// Simple in-memory cache with TTL
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const pendingRequests = new Map<string, Promise<any>>();

// Cache key generator
function generateCacheKey(interests: string[], learningGoals: string[], quizData: any): string {
  const keyData = {
    interests: interests.sort(),
    learningGoals: learningGoals.sort(),
    userType: quizData?.userType,
    parentSubType: quizData?.parentSubType,
    gradeLevel: quizData?.selectedSchools?.[0]?.level,
    numberOfKids: quizData?.numberOfKids
  };
  return JSON.stringify(keyData);
}

// Get from cache or execute function
async function getCachedOrExecute<T>(key: string, executor: () => Promise<T>): Promise<T> {
  // Check cache first
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('[generate-research-explanations] Cache hit for key:', key.substring(0, 50) + '...');
    return cached.data;
  }

  // Check if request is already pending (deduplication)
  if (pendingRequests.has(key)) {
    console.log('[generate-research-explanations] Request deduplication for key:', key.substring(0, 50) + '...');
    return pendingRequests.get(key)!;
  }

  // Execute and cache
  const promise = executor().then(result => {
    cache.set(key, { data: result, timestamp: Date.now() });
    pendingRequests.delete(key);
    console.log('[generate-research-explanations] Cached result for key:', key.substring(0, 50) + '...');
    return result;
  }).catch(error => {
    pendingRequests.delete(key);
    throw error;
  });

  pendingRequests.set(key, promise);
  return promise;
}

// Define the schema for the generated research explanations
// Schema no longer used - research explanations are now generated using structured prompts



export async function POST(request: Request) {
  console.log('[generate-research-explanations] Processing request');

  let interests: string[] = [];
  let learningGoals: string[] = [];
  let quizData: any = {};

  try {
    const requestData = await request.json();
    interests = requestData.interests || [];
    learningGoals = requestData.learningGoals || [];
    quizData = requestData.quizData || {};
    
    console.log('[generate-research-explanations] Interests:', interests);
    console.log('[generate-research-explanations] Learning goals:', learningGoals);
    console.log('[generate-research-explanations] Quiz data keys:', Object.keys(quizData || {}));

    // Generate cache key for this request
    const cacheKey = generateCacheKey(interests, learningGoals, quizData);
    
    // Use caching mechanism
    const result = await getCachedOrExecute(cacheKey, async () => {
      const primaryInterest = interests[0] || 'learning';
      const primaryGoal = learningGoals[0] || 'academic success';
    
      // Build comprehensive context for better LLM prompting
      const userContext = `
USER CONTEXT:
- Child's Primary Interest: ${primaryInterest}
- Secondary Interests: ${interests.slice(1).join(', ') || 'None specified'}
- Learning Goals: ${learningGoals.join(', ') || 'General academic improvement'}
- User Type: ${quizData?.userType || 'Parent'}
- Parent Sub-type: ${quizData?.parentSubType || 'Not specified'}
- Current Grade Level: ${quizData?.selectedSchools?.[0]?.level || 'Elementary'}
- Number of Kids: ${quizData?.numberOfKids || 'One child'}
`;

      console.log('[generate-research-explanations] User context prepared');

    // Create a comprehensive prompt for generating personalized research explanations
    const prompt = `You are an expert educational researcher and parent communication specialist. Your job is to explain complex learning science research in relatable, parent-friendly terms that show exactly how it benefits THIS specific child.

${userContext}

CONTEXT: The parent is looking at research that validates TimeBack's educational approach. They want to understand how these academic studies specifically apply to their child who loves ${primaryInterest} and has learning goals around ${primaryGoal}.

You MUST respond with VALID JSON that exactly matches this structure. Do NOT add any escape characters, markdown formatting, or extra characters outside the JSON structure:

{
  "bloomsSigma": {
    "personalizedExplanation": "string",
    "whyItMatters": "string", 
    "realWorldExample": "string"
  },
  "zoneProximalDevelopment": {
    "personalizedExplanation": "string",
    "whyItMatters": "string",
    "realWorldExample": "string"
  },
  "cognitiveLoadTheory": {
    "personalizedExplanation": "string",
    "whyItMatters": "string",
    "realWorldExample": "string"
  },
  "masteryLearning": {
    "personalizedExplanation": "string",
    "whyItMatters": "string",
    "realWorldExample": "string"
  },
  "overallSummary": "string"
}

Generate personalized explanations for each research study:

1. **Bloom's 2 Sigma Problem (1984)**: The foundational study showing 1-on-1 tutoring produces 2 standard deviation improvements (equivalent to moving from 50th percentile to 98th percentile)

2. **Zone of Proximal Development (Vygotsky)**: How learning happens best when content is just slightly ahead of current ability level

3. **Cognitive Load Theory (Sweller, 1998)**: Why breaking down complex topics into manageable chunks improves learning

4. **Mastery Learning (Winget & Persky)**: Evidence that requiring complete understanding before advancing leads to better long-term retention

CRITICAL JSON FORMATTING REQUIREMENTS:
- Return ONLY valid JSON with no additional text, formatting, or characters
- Use double quotes for all strings
- Never use escape characters or backslashes in property names
- Never add markdown formatting like backticks
- Ensure all property names exactly match the schema above
- Never use tool invocation syntax or XML tags
- Use only plain text in your response - no special characters, control characters, or line breaks within JSON string values

CONTENT REQUIREMENTS:
- Write for worried parents who want the best for their child
- Connect each theory directly to their child's interests in ${primaryInterest}
- Show concrete examples of how this appears in their TimeBack experience
- Use conversational, confident language (not academic jargon)
- Make it clear why this research matters for THEIR child specifically
- Include specific examples related to ${primaryInterest} when possible
- Never use hyphens in any text
- Keep explanations concise but compelling (2-3 sentences each)

TONE: Reassuring, knowledgeable, and specific. Like an expert educator explaining to a caring parent over coffee.`;

      console.log('[generate-research-explanations] Calling AI with prompt length:', prompt.length);

      // Generate the structured content
      const aiResult = await safeBedrockAPI.generateObject({
        prompt: prompt,
        maxTokens: 2000,
        temperature: 0.7,
      });

      console.log('[generate-research-explanations] AI generation completed successfully');

      return {
        success: true,
        content: aiResult.object,
        interests: interests,
        learningGoals: learningGoals,
        timestamp: new Date().toISOString()
      };
    });

    return Response.json(result);

  } catch (error) {
    console.error('[generate-research-explanations] Error:', error);
    
    // Return fallback content if AI generation fails
    const primaryInterestFallback = (interests && interests[0]) || 'their interests';
    // const primaryGoalFallback = (learningGoals && learningGoals[0]) || 'academic success';
    
    const fallbackContent = {
      bloomsSigma: {
        personalizedExplanation: `The research shows 1-on-1 tutoring can move students from average to top 2% performance. For your child who loves ${primaryInterestFallback}, this means getting personalized attention that adapts to exactly how they learn best.`,
        whyItMatters: `Instead of being one of 25+ kids in a classroom, your child gets the individualized support that the research proves creates exceptional results.`,
        realWorldExample: `When your child tackles ${primaryInterestFallback} concepts, TimeBack adjusts the pace and examples to match their learning style, just like having a personal tutor.`
      },
      zoneProximalDevelopment: {
        personalizedExplanation: `This research shows kids learn best when content is just slightly challenging, not too easy or too hard. TimeBack finds that sweet spot for your child automatically.`,
        whyItMatters: `Your child will never be bored with content that's too easy or frustrated with concepts that are too difficult.`,
        realWorldExample: `If your child masters basic ${primaryInterestFallback} concepts quickly, TimeBack immediately introduces more advanced material to keep them engaged and growing.`
      },
      cognitiveLoadTheory: {
        personalizedExplanation: `Research proves that breaking complex topics into smaller chunks prevents mental overload and improves learning. TimeBack applies this to every lesson.`,
        whyItMatters: `Your child can focus fully on understanding each concept without feeling overwhelmed by too much information at once.`,
        realWorldExample: `Instead of cramming multiple ${primaryInterestFallback} concepts into one lesson, TimeBack presents them step by step, ensuring solid understanding before moving forward.`
      },
      masteryLearning: {
        personalizedExplanation: `Studies show that students who achieve complete understanding before advancing have much better long term retention. TimeBack ensures your child truly masters each concept.`,
        whyItMatters: `Your child builds a rock solid foundation without gaps that could cause problems later.`,
        realWorldExample: `Your child won't move to advanced ${primaryInterestFallback} topics until they've completely mastered the fundamentals, ensuring lasting understanding.`
      },
      overallSummary: `All this research proves that personalized, mastery based learning creates exceptional results. For your child interested in ${primaryInterestFallback}, this means faster learning, deeper understanding, and more time to pursue their passions.`
    };

    return Response.json({
      success: true,
      content: fallbackContent,
      interests: interests || [],
      learningGoals: learningGoals || [],
      timestamp: new Date().toISOString(),
      fallback: true
    });
  }
}
