// Removed Bedrock imports - using Cerebras directly

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
    const prompt = `<system_role>
You are an educational psychologist translating research findings into parent-friendly explanations using their child's specific interests.
</system_role>

<user_context>
${userContext}
- Primary Interest: ${primaryInterest}
- Primary Goal: ${primaryGoal}
</user_context>

<strict_requirements>
- Generate ONLY valid JSON matching the exact schema
- Personalize EVERY explanation using child's interest: ${primaryInterest}
- Connect EVERY point to parent's goal: ${primaryGoal}
- Use simple, parent-friendly language (8th grade reading level)
- Provide concrete, relatable examples
- Maintain scientific accuracy while being accessible
</strict_requirements>

<research_studies>
1. Bloom's 2 Sigma Problem (1984): 1-on-1 tutoring → 2 standard deviation improvement (50th to 98th percentile)
2. Zone of Proximal Development (Vygotsky): Learning optimized at current ability + 1 level
3. Cognitive Load Theory (Sweller, 1998): Breaking complex topics into chunks improves retention
4. Mastery Learning (Winget & Persky): Complete understanding before advancing → better long-term outcomes
</research_studies>

<personalization_rules>
- personalizedExplanation: Must use ${primaryInterest} as the central example
- whyItMatters: Must directly address ${primaryGoal}
- realWorldExample: Must show specific scenario with their child
- All examples must be age-appropriate and engaging
- Avoid academic jargon completely
</personalization_rules>

<forbidden_actions>
- Do NOT use generic examples
- Do NOT use educational terminology without explanation
- Do NOT make abstract connections
- Do NOT include any text outside JSON
- Do NOT use markdown formatting
- Do NOT add escape characters unnecessarily
- Do NOT use tool invocation syntax or XML tags
</forbidden_actions>

<quality_validation>
- Each explanation must pass parent comprehension test
- Examples must be immediately relatable
- Benefits must be tangible and specific
- Language must be conversational
- JSON must be syntactically perfect
</quality_validation>

<output_schema>
{
  "bloomsSigma": {
    "personalizedExplanation": "[How 1-on-1 tutoring transforms learning using ${primaryInterest}]",
    "whyItMatters": "[Direct connection to ${primaryGoal}]",
    "realWorldExample": "[Specific scenario showing 2x improvement]"
  },
  "zoneProximalDevelopment": {
    "personalizedExplanation": "[Just-right challenge level explained via ${primaryInterest}]",
    "whyItMatters": "[How this achieves ${primaryGoal}]",
    "realWorldExample": "[Child progressing through ${primaryInterest} challenges]"
  },
  "cognitiveLoadTheory": {
    "personalizedExplanation": "[Chunking complex ${primaryInterest} topics]",
    "whyItMatters": "[Prevents overwhelm while pursuing ${primaryGoal}]",
    "realWorldExample": "[Breaking down ${primaryInterest} into manageable steps]"
  },
  "masteryLearning": {
    "personalizedExplanation": "[Mastering ${primaryInterest} fundamentals before advancing]",
    "whyItMatters": "[Ensures solid foundation for ${primaryGoal}]",
    "realWorldExample": "[Child fully understanding before moving forward]"
  },
  "overallSummary": "[How TimeBack combines all 4 approaches for their child's success]"
}
</output_schema>

<content_tone>
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

      // Use Cerebras API directly
      const cerebrasUrl = 'https://api.cerebras.ai/v1/chat/completions';
      const cerebrasKey = process.env.CEREBRAS_API_KEY || '';
      
      const response = await fetch(cerebrasUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cerebrasKey}`
        },
        body: JSON.stringify({
          model: 'llama3.1-8b',
          messages: [
            { role: 'user', content: prompt }
          ],
          max_tokens: 2000,
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`Cerebras API error: ${response.statusText}`);
      }

      const data = await response.json();
      const aiContent = JSON.parse(data.choices?.[0]?.message?.content || '{}');
      
      console.log('[generate-research-explanations] AI generation completed successfully');

      return {
        success: true,
        content: aiContent,
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
