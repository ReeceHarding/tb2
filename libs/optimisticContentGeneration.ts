import { cerebras } from './cerebras';

// Log timestamps for debugging
const log = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[OptimisticContentGen] ${timestamp} ${message}`, data || '');
};

// Content generation status tracking
interface ContentGenerationStatus {
  afternoonActivities: 'pending' | 'generating' | 'completed' | 'error';
  subjectExamples: 'pending' | 'generating' | 'completed' | 'error';
  howWeGetResults: 'pending' | 'generating' | 'completed' | 'error';
  learningScience: 'pending' | 'generating' | 'completed' | 'error';
  dataShock: 'pending' | 'generating' | 'completed' | 'error';
}

// Content cache interface
interface ContentCache {
  afternoonActivities?: any;
  subjectExamples?: any;
  howWeGetResults?: any;
  learningScience?: any;
  dataShock?: any;
  generationStatus: ContentGenerationStatus;
  startTime: number;
  completionTime?: number;
}

// Global cache for generated content
let contentCache: ContentCache | null = null;

// Generate prompts for each section based on quiz data
const generatePrompts = (quizData: any) => {
  const interests = quizData.kidsInterests || [];
  const primaryInterest = interests[0] || 'learning';
  const gradeLevel = quizData.selectedSchools?.[0]?.level || 'high school';
  const schoolName = quizData.selectedSchools?.[0]?.name || 'their school';

  return {
    afternoonActivities: `Generate content for a personalized education page section about afternoon activities.
Context:
- Primary interest: ${primaryInterest}
- All interests: ${interests.join(', ')}
- Grade level: ${gradeLevel}
- School: ${schoolName}

Create a JSON response with this exact structure:
{
  "mainTitle": "In the Afternoons, They Can Focus on ${primaryInterest}",
  "subtitle": "With 5-6 hours saved daily, they can truly master ${primaryInterest} and explore related activities.",
  "secondaryInterestsText": "They'll also have time for their other interests: [list other interests]",
  "specificActivities": [
    {
      "activity": "[specific activity name]",
      "description": "[detailed description of what they could do]",
      "timeRequired": "[time estimate]"
    }
  ],
  "passionProjectName": "[creative project name based on ${primaryInterest}]",
  "passionDeepDive": {
    "title": "Deep Dive: [specific aspect of ${primaryInterest}]",
    "description": "[detailed description of mastery path]",
    "progression": "[how they would progress over time]"
  },
  "timeComparisonCustom": {
    "traditional": "[what they could do in traditional school time]",
    "timeback": "[what they can accomplish with TimeBack]"
  }
}

Make the content highly specific to ${primaryInterest} with concrete examples.`,

    subjectExamples: `Generate personalized subject examples for a student interested in ${primaryInterest}.
Context:
- Primary interest: ${primaryInterest}
- Grade level: ${gradeLevel}
- All interests: ${interests.join(', ')}

Create content showing how core subjects (Math, Science, English, History) can be taught through the lens of ${primaryInterest}.
For each subject, provide:
1. A catchy title connecting the subject to ${primaryInterest}
2. 2-3 specific lesson examples
3. Real-world applications

Format as JSON with subjects as keys.`,

    howWeGetResults: `Generate content explaining how AI personalization helps students interested in ${primaryInterest}.
Context:
- Interest: ${primaryInterest}
- Grade level: ${gradeLevel}

Create content explaining:
1. How AI identifies learning patterns for students interested in ${primaryInterest}
2. Specific adaptations made for ${primaryInterest} enthusiasts
3. Success metrics and outcomes
4. Personalization examples

Format as clear, parent-friendly JSON content.`,

    learningScience: `Generate content about the learning science behind personalized education for ${primaryInterest}.
Include:
1. Research-backed methods
2. Cognitive science principles
3. Engagement strategies specific to ${primaryInterest}
4. Memory and retention techniques

Format as educational JSON content.`,

    dataShock: `Generate compelling data points about learning efficiency for students interested in ${primaryInterest}.
Include:
1. Time savings statistics
2. Achievement comparisons
3. Engagement metrics
4. Success stories

Format as impactful JSON statistics.`
  };
};

// Generate content for a single section
const generateSectionContent = async (
  sectionId: string,
  prompt: string,
  quizData: any
): Promise<any> => {
  const startTime = Date.now();
  log(`Starting generation for section: ${sectionId}`);

  try {
    // Update status to generating
    if (contentCache) {
      contentCache.generationStatus[sectionId as keyof ContentGenerationStatus] = 'generating';
    }

    // Generate content using Cerebras with fallback chain
    const response = await cerebras.generateContent({
      prompt,
      systemPrompt: 'You are an expert educational content generator. Generate engaging, personalized content that speaks directly to parents about their child\'s education. Always respond with valid JSON only, no additional text.',
      maxTokens: 2000,
      temperature: 0.8
    });

    log(`Generated content for ${sectionId}`, {
      provider: response.provider,
      latencyMs: response.latencyMs
    });

    // Parse the JSON response
    let parsedContent;
    try {
      parsedContent = JSON.parse(response.content);
    } catch (parseError) {
      log(`Failed to parse JSON for ${sectionId}, using raw content`, parseError);
      parsedContent = { rawContent: response.content };
    }

    // Cache the content
    if (contentCache) {
      contentCache[sectionId as keyof ContentCache] = parsedContent;
      contentCache.generationStatus[sectionId as keyof ContentGenerationStatus] = 'completed';
    }

    return parsedContent;
  } catch (error) {
    log(`Error generating content for ${sectionId}`, error);
    
    // Update status to error
    if (contentCache) {
      contentCache.generationStatus[sectionId as keyof ContentGenerationStatus] = 'error';
    }

    throw error;
  }
};

// Start optimistic content generation
export const startOptimisticGeneration = async (quizData: any): Promise<void> => {
  log('Starting optimistic content generation', {
    interests: quizData.kidsInterests,
    schoolsCount: quizData.selectedSchools?.length
  });

  // Initialize cache
  contentCache = {
    generationStatus: {
      afternoonActivities: 'pending',
      subjectExamples: 'pending',
      howWeGetResults: 'pending',
      learningScience: 'pending',
      dataShock: 'pending'
    },
    startTime: Date.now()
  };

  // Generate prompts
  const prompts = generatePrompts(quizData);

  // Start generating all sections in parallel
  const generationPromises = [
    generateSectionContent('afternoonActivities', prompts.afternoonActivities, quizData),
    generateSectionContent('subjectExamples', prompts.subjectExamples, quizData),
    generateSectionContent('howWeGetResults', prompts.howWeGetResults, quizData),
    generateSectionContent('learningScience', prompts.learningScience, quizData),
    generateSectionContent('dataShock', prompts.dataShock, quizData)
  ];

  // Wait for all to complete (but don't block)
  Promise.all(generationPromises)
    .then(() => {
      if (contentCache) {
        contentCache.completionTime = Date.now();
        const totalTime = contentCache.completionTime - contentCache.startTime;
        log(`All content generation completed in ${totalTime}ms`);
      }
    })
    .catch((error) => {
      log('Error in parallel content generation', error);
    });
};

// Get cached content
export const getCachedContent = (): ContentCache | null => {
  return contentCache;
};

// Get specific section content
export const getSectionContent = (sectionId: string): any => {
  if (!contentCache) return null;
  return contentCache[sectionId as keyof ContentCache];
};

// Get generation status
export const getGenerationStatus = (): ContentGenerationStatus | null => {
  return contentCache?.generationStatus || null;
};

// Clear cache (useful for testing or new quiz attempts)
export const clearContentCache = (): void => {
  log('Clearing content cache');
  contentCache = null;
};

// Pre-fetch content for subsequent questions
export const prefetchFollowUpContent = async (
  sectionId: string,
  context: any
): Promise<void> => {
  log(`Pre-fetching follow-up content for section: ${sectionId}`);

  // This would generate follow-up questions based on the section
  // Implementation depends on the specific follow-up question logic
  try {
    const prompt = `Generate 3 follow-up questions for the ${sectionId} section.
Context: ${JSON.stringify(context)}
Format as JSON array of questions with engaging text.`;

    const response = await cerebras.generateContent({
      prompt,
      maxTokens: 1000,
      temperature: 0.9
    });

    log(`Pre-fetched follow-up content for ${sectionId}`, {
      provider: response.provider,
      latencyMs: response.latencyMs
    });

    // Store in a separate follow-up cache if needed
  } catch (error) {
    log(`Error pre-fetching follow-up content for ${sectionId}`, error);
  }
};

// Export interface for use in components
export interface OptimisticContentService {
  startOptimisticGeneration: typeof startOptimisticGeneration;
  getCachedContent: typeof getCachedContent;
  getSectionContent: typeof getSectionContent;
  getGenerationStatus: typeof getGenerationStatus;
  clearContentCache: typeof clearContentCache;
  prefetchFollowUpContent: typeof prefetchFollowUpContent;
}