import { cerebras } from '@/libs/cerebras';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Simple in-memory cache with TTL
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const pendingRequests = new Map<string, Promise<any>>();

// Cache key generator
function generateCacheKey(interests: string[], quizData: any): string {
  const keyData = {
    interests: interests.sort(),
    userType: quizData?.userType,
    parentSubType: quizData?.parentSubType,
    numberOfKids: quizData?.numberOfKids
  };
  return JSON.stringify(keyData);
}

// Get from cache or execute function
async function getCachedOrExecute<T>(key: string, executor: () => Promise<T>): Promise<T> {
  // Check cache first
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('[generate-afternoon-content] Cache hit for key:', key.substring(0, 50) + '...');
    return cached.data;
  }

  // Check if request is already pending (deduplication)
  if (pendingRequests.has(key)) {
    console.log('[generate-afternoon-content] Request deduplication for key:', key.substring(0, 50) + '...');
    return pendingRequests.get(key)!;
  }

  // Execute and cache
  const promise = executor().then(result => {
    cache.set(key, { data: result, timestamp: Date.now() });
    pendingRequests.delete(key);
    console.log('[generate-afternoon-content] Cached result for key:', key.substring(0, 50) + '...');
    return result;
  }).catch(error => {
    pendingRequests.delete(key);
    throw error;
  });

  pendingRequests.set(key, promise);
  return promise;
}

// Define the schema for the generated afternoon activities content
const AfternoonContentSchema = z.object({
  mainTitle: z.string().describe('Engaging title mentioning their primary interest'),
  subtitle: z.string().describe('Compelling subtitle about time savings and opportunities'),
  secondaryInterestsText: z.string().optional().describe('Text about other interests if they have multiple'),
  specificActivities: z.array(z.object({
    activity: z.string().describe('Specific activity they could do'),
    description: z.string().describe('Why this activity is valuable and engaging'),
    timeRequired: z.string().describe('How much time this might take')
  })).length(4).describe('4 specific activities they could pursue'),
  passionProjectName: z.string().describe('Creative, specific name for their passion project (e.g., "Lego Architecture Studio", "Minecraft Engineering Lab", "Basketball Skills Academy")'),
  passionDeepDive: z.object({
    title: z.string().describe('Title for their main passion development'),
    description: z.string().describe('How they could really master their main interest'),
    progression: z.string().describe('How they could advance from beginner to expert')
  }),
  timeComparisonCustom: z.object({
    traditional: z.string().describe('Custom description of traditional school time constraints'),
    timeback: z.string().describe('Custom description of TimeBack time freedom')
  })
});

export async function POST(request: Request) {
  console.log('[generate-afternoon-content] Processing request');

  let interests: string[] = [];
  let quizData: any = {};

  try {
    const requestData = await request.json();
    interests = requestData.interests || [];
    quizData = requestData.quizData || {};
    
    console.log('[generate-afternoon-content] Interests:', interests);
    console.log('[generate-afternoon-content] Quiz data keys:', Object.keys(quizData || {}));

    // Generate cache key for this request
    const cacheKey = generateCacheKey(interests, quizData);
    
    // Use caching mechanism
    const result = await getCachedOrExecute(cacheKey, async () => {
      const primaryInterest = interests[0] || 'their favorite activities';
      const secondaryInterests = interests.slice(1);
    
    // Build comprehensive context for better LLM prompting
    const userContext = `
USER CONTEXT:
- Primary Interest: ${primaryInterest}
- Secondary Interests: ${secondaryInterests.join(', ') || 'None specified'}
- User Type: ${quizData?.userType || 'Not specified'}
- Parent Sub-type: ${quizData?.parentSubType || 'Not specified'}
- Number of Kids: ${quizData?.numberOfKids || 'Not specified'}
- Learning Goals: ${quizData?.learningGoals?.join(', ') || 'Not specified'}
- Current Grade Level: ${quizData?.gradeLevel || 'Not specified'}
`;

    console.log('[generate-afternoon-content] User context prepared');

    // Create a comprehensive prompt for generating personalized afternoon content
    const prompt = `You are an expert in child development and personalized education, specializing in helping children pursue their passions through additional free time.

${userContext}

CONTEXT: This child will have 5-6 hours of free time every afternoon because TimeBack's efficient learning approach only requires 2 hours of academics daily (vs 8+ hours in traditional school).

Generate compelling, personalized content for the "afternoon activities" section that shows exactly how this child could use their extra time to pursue their passion for ${primaryInterest}.

REQUIREMENTS:
- Make it specific to ${primaryInterest} - not generic
- Include 4 concrete, actionable activities they could actually do
- Show progression from beginner to advanced levels
- Reference their secondary interests (${secondaryInterests.join(', ') || 'none'}) if relevant
- Make it inspiring and exciting for both parent and child
- Use specific examples, not vague concepts
- Show how the time adds up to real mastery
- Avoid education jargon - use conversational language
- Never use hyphens in any text

PASSION PROJECT NAME REQUIREMENTS:
Create a specific, creative name for their passion project that sounds like a real program or studio they could attend. Examples:
- For "legos": "Lego Architecture Studio" or "Master Builder Workshop" or "Creative Construction Lab"
- For "coding": "Code Academy Workshop" or "Game Development Studio" or "Programming Innovation Lab"
- For "art": "Digital Art Studio" or "Creative Design Workshop" or "Young Artists Academy"
- For "basketball": "Basketball Skills Academy" or "Elite Hoops Training" or "Basketball Performance Lab"
- For "music": "Young Musicians Studio" or "Music Production Workshop" or "Songwriting Academy"
- For "minecraft": "Minecraft Engineering Lab" or "Digital Architecture Studio" or "Creative Building Academy"

Make the passion project name sound professional, exciting, and like something they would genuinely want to attend. Avoid generic words like "Deep Dive" or "Program".

EXAMPLES of good specific activities:
- For "coding": "Build their own video game using Scratch, then advance to Python game development"
- For "art": "Complete a full oil painting series, learn digital illustration on iPad, create comic book characters"
- For "sports": "Practice advanced basketball moves with local coach, join competitive travel team, study game film like pros"
- For "music": "Learn to compose original songs, record in home studio setup, perform at local venues"

Make the content feel personal and achievable, showing clear steps from where they are now to where they could be.`;

      console.log('[generate-afternoon-content] Calling AI with prompt length:', prompt.length);

      // Generate the structured content using Cerebras with fallback
      const systemPrompt = `You are an expert JSON generator. You must respond with valid JSON that matches the required schema exactly. Do not include any explanation or text outside the JSON object.`;
      
      const structuredPrompt = `${prompt}

${JSON.stringify(AfternoonContentSchema.shape, null, 2)}

Please respond with a JSON object that matches this exact schema.`;
      
      const response = await cerebras.generateContent({
        prompt: structuredPrompt,
        systemPrompt: systemPrompt,
        maxTokens: 2000,
        temperature: 0.7,
      });
      
      console.log('[generate-afternoon-content] Using provider:', response.provider);
      console.log('[generate-afternoon-content] Generation latency:', response.latencyMs, 'ms');
      
      // Parse the JSON response
      let aiResult;
      try {
        aiResult = { object: JSON.parse(response.content) };
        // Validate against schema
        AfternoonContentSchema.parse(aiResult.object);
      } catch (parseError) {
        console.error('[generate-afternoon-content] Failed to parse AI response:', parseError);
        throw new Error('Failed to generate valid content structure');
      }

      console.log('[generate-afternoon-content] AI generation completed successfully');
      console.log('[generate-afternoon-content] Generated activities count:', (aiResult.object as any).specificActivities?.length || 0);
      console.log('[generate-afternoon-content] AI-generated passion project name:', (aiResult.object as any).passionProjectName);
      console.log('[generate-afternoon-content] Primary interest was:', primaryInterest);

      return {
        success: true,
        content: aiResult.object,
        interests: interests,
        timestamp: new Date().toISOString()
      };
    });

    return Response.json(result);

  } catch (error) {
    console.error('[generate-afternoon-content] Error:', error);
    
    // Return fallback content if AI generation fails
    const primaryInterestFallback = (interests && interests[0]) || 'Their Passions';
    
    // Generate creative fallback passion project name
    const generateFallbackPassionProjectName = (interest: string): string => {
      console.log('[generate-afternoon-content] Generating fallback passion project name for:', interest);
      
      const interestLower = interest.toLowerCase();
      const fallbackNames: { [key: string]: string[] } = {
        'legos': ['Lego Architecture Studio', 'Master Builder Workshop', 'Creative Construction Lab'],
        'lego': ['Lego Architecture Studio', 'Master Builder Workshop', 'Creative Construction Lab'],
        'coding': ['Code Academy Workshop', 'Game Development Studio', 'Programming Innovation Lab'],
        'programming': ['Code Academy Workshop', 'Game Development Studio', 'Programming Innovation Lab'],
        'art': ['Digital Art Studio', 'Creative Design Workshop', 'Young Artists Academy'],
        'drawing': ['Digital Art Studio', 'Creative Design Workshop', 'Young Artists Academy'],
        'basketball': ['Basketball Skills Academy', 'Elite Hoops Training', 'Basketball Performance Lab'],
        'soccer': ['Soccer Skills Academy', 'Elite Soccer Training', 'Soccer Performance Lab'],
        'football': ['Football Skills Academy', 'Elite Football Training', 'Football Performance Lab'],
        'music': ['Young Musicians Studio', 'Music Production Workshop', 'Songwriting Academy'],
        'piano': ['Piano Mastery Studio', 'Musical Performance Academy', 'Piano Excellence Workshop'],
        'guitar': ['Guitar Excellence Studio', 'Musical Performance Academy', 'Guitar Mastery Workshop'],
        'minecraft': ['Minecraft Engineering Lab', 'Digital Architecture Studio', 'Creative Building Academy'],
        'science': ['Science Innovation Lab', 'Young Scientists Academy', 'Discovery Research Studio'],
        'math': ['Mathematical Thinking Lab', 'Problem Solving Academy', 'Math Excellence Studio'],
        'reading': ['Literary Arts Studio', 'Young Writers Workshop', 'Reading Excellence Academy'],
        'writing': ['Creative Writing Studio', 'Young Authors Workshop', 'Storytelling Academy'],
        'chess': ['Chess Strategy Academy', 'Strategic Thinking Studio', 'Chess Mastery Workshop'],
        'dance': ['Dance Performance Studio', 'Creative Movement Academy', 'Dance Excellence Workshop'],
        'singing': ['Vocal Performance Studio', 'Young Singers Academy', 'Vocal Excellence Workshop']
      };
      
      // Find matching names for the interest
      for (const [key, names] of Object.entries(fallbackNames)) {
        if (interestLower.includes(key) || key.includes(interestLower)) {
          const randomName = names[Math.floor(Math.random() * names.length)];
          console.log('[generate-afternoon-content] Selected fallback name:', randomName);
          return randomName;
        }
      }
      
      // Default fallback if no specific match found
      const defaultName = `${interest.charAt(0).toUpperCase() + interest.slice(1)} Excellence Academy`;
      console.log('[generate-afternoon-content] Using default fallback name:', defaultName);
      return defaultName;
    };
    
    const passionProjectName = generateFallbackPassionProjectName(primaryInterestFallback);
    console.log('[generate-afternoon-content] Using fallback passion project name:', passionProjectName);
    console.log('[generate-afternoon-content] Fallback triggered for primary interest:', primaryInterestFallback);
    
    const fallbackContent = {
      mainTitle: `In the Afternoons, They Can Focus on ${primaryInterestFallback}`,
      subtitle: `With 5-6 hours saved daily, they can truly master ${primaryInterestFallback.toLowerCase()} and explore related activities.`,
      secondaryInterestsText: (interests && interests.length > 1) ? `They'll also have time for their other interests: ${interests.slice(1).join(', ')}` : '',
      specificActivities: [
        {
          activity: `Advanced ${primaryInterestFallback.toLowerCase()} practice`,
          description: 'Dedicated time for skill development and mastery',
          timeRequired: '2 hours'
        },
        {
          activity: 'Creative projects',
          description: 'Personal projects that combine learning with passion',
          timeRequired: '1-2 hours'
        },
        {
          activity: 'Real-world application',
          description: 'Applying skills in practical, meaningful ways',
          timeRequired: '1 hour'
        },
        {
          activity: 'Exploration and discovery',
          description: 'Time to explore new aspects of their interests',
          timeRequired: '1 hour'
        }
      ],
      passionProjectName: passionProjectName,
      passionDeepDive: {
        title: `Mastering ${primaryInterestFallback}`,
        description: `With consistent daily practice and exploration, they can develop real expertise in ${primaryInterestFallback.toLowerCase()}.`,
        progression: 'From beginner curiosity to advanced skills and creative expression.'
      },
      timeComparisonCustom: {
        traditional: '6-8 hours in school + 2-3 hours homework = 1-2 hours for passions',
        timeback: '2 hours academics + done with learning = 5-6 hours for passions'
      }
    };

    return Response.json({
      success: true,
      content: fallbackContent,
      interests: interests || [],
      timestamp: new Date().toISOString(),
      fallback: true
    });
  }
}