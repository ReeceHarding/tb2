// Enhanced logging for comprehensive backend visibility
const log = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`🤖 [OptimisticContentGen] ${timestamp} ${message}`, data || '');
};

const logError = (message: string, error?: any) => {
  const timestamp = new Date().toISOString();
  console.error(`💥 [OptimisticContentGen] ${timestamp} ${message}`, error || '');
};

const logSuccess = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`✅ [OptimisticContentGen] ${timestamp} ${message}`, data || '');
};

const logProgress = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`⏳ [OptimisticContentGen] ${timestamp} ${message}`, data || '');
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
  log(`========== STARTING SECTION GENERATION: ${sectionId.toUpperCase()} ==========`);
  
  console.log(`🎯 [OptimisticContentGen] Section context:`, {
    sectionId,
    promptLength: prompt.length,
    userType: quizData?.userType,
    interests: quizData?.kidsInterests || [],
    schoolsCount: quizData?.selectedSchools?.length || 0
  });

  try {
    // Update status to generating
    if (contentCache) {
      logProgress(`Updating cache status for ${sectionId}: pending → generating`);
      contentCache.generationStatus[sectionId as keyof ContentGenerationStatus] = 'generating';
      
      console.log(`📊 [OptimisticContentGen] Current generation status:`, contentCache.generationStatus);
    } else {
      logError(`Content cache not initialized! Cannot track status for ${sectionId}`);
    }

    logProgress(`Making API request to /api/ai/generate for ${sectionId}...`);
    const requestStartTime = Date.now();
    
    const requestBody = {
      prompt,
      systemPrompt: 'You are an expert educational content generator. Generate engaging, personalized content that speaks directly to parents about their child\'s education. Always respond with valid JSON only, no additional text.',
      maxTokens: 2000,
      temperature: 0.8
    };
    
    console.log(`📝 [OptimisticContentGen] API request details:`, {
      endpoint: '/api/ai/generate',
      promptPreview: prompt.substring(0, 150) + '...',
      systemPromptLength: requestBody.systemPrompt.length,
      maxTokens: requestBody.maxTokens,
      temperature: requestBody.temperature
    });

    const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    const requestLatency = Date.now() - requestStartTime;
    console.log(`⏱️ [OptimisticContentGen] API request completed in ${requestLatency}ms, status: ${response.status}`);

    if (!response.ok) {
        const errorData = await response.json();
        logError(`API request failed for ${sectionId}`, {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.error || `Failed to generate content for ${sectionId}`);
    }

    const result = await response.json();
    const totalLatency = Date.now() - startTime;

    logSuccess(`Content generation API successful for ${sectionId}`, {
      provider: result.provider,
      apiLatencyMs: result.latencyMs,
      totalLatencyMs: totalLatency,
      responseLength: result.content?.length || 0
    });

    // Parse the JSON response
    let parsedContent;
    try {
      logProgress(`Parsing JSON response for ${sectionId}...`);
      parsedContent = JSON.parse(result.content);
      
      console.log(`✅ [OptimisticContentGen] Successfully parsed JSON for ${sectionId}:`, {
        contentKeys: Object.keys(parsedContent),
        contentSize: JSON.stringify(parsedContent).length,
        hasExpectedStructure: true
      });
    } catch (parseError) {
      logError(`Failed to parse JSON for ${sectionId}, using raw content`, {
        parseError,
        rawContentPreview: result.content?.substring(0, 200) + '...'
      });
      parsedContent = { 
        rawContent: result.content,
        parseError: parseError.message,
        sectionId 
      };
    }

    // Cache the content
    if (contentCache) {
      logProgress(`Caching generated content for ${sectionId}...`);
      contentCache[sectionId as keyof ContentCache] = parsedContent;
      contentCache.generationStatus[sectionId as keyof ContentGenerationStatus] = 'completed';
      
      const completedSections = Object.values(contentCache.generationStatus).filter(
        status => status === 'completed'
      ).length;
      
      logSuccess(`Content cached successfully for ${sectionId}`, {
        completedSections,
        totalSections: Object.keys(contentCache.generationStatus).length,
        completionPercentage: Math.round(completedSections / Object.keys(contentCache.generationStatus).length * 100)
      });
      
      console.log(`📊 [OptimisticContentGen] Updated generation status:`, contentCache.generationStatus);
    } else {
      logError(`Content cache not available for caching ${sectionId}!`);
    }

    console.log(`🎉 [OptimisticContentGen] ========== SECTION GENERATION COMPLETE: ${sectionId.toUpperCase()} ==========`);
    return parsedContent;
  } catch (error) {
    const totalLatency = Date.now() - startTime;
    logError(`Content generation failed for ${sectionId} after ${totalLatency}ms`, {
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 3),
      sectionId,
      totalLatency
    });
    
    // Update status to error
    if (contentCache) {
      contentCache.generationStatus[sectionId as keyof ContentGenerationStatus] = 'error';
      
      const errorSections = Object.values(contentCache.generationStatus).filter(
        status => status === 'error'
      ).length;
      
      console.log(`📊 [OptimisticContentGen] Updated generation status after error:`, {
        ...contentCache.generationStatus,
        errorSections,
        totalSections: Object.keys(contentCache.generationStatus).length
      });
    }

    throw error;
  }
};

// Start optimistic content generation
export const startOptimisticGeneration = async (quizData: any): Promise<void> => {
  const overallStartTime = Date.now();
  log('========== STARTING OPTIMISTIC CONTENT GENERATION ==========');
  
  console.log(`🚀 [OptimisticContentGen] Generation initiated with context:`, {
    userType: quizData?.userType,
    parentSubType: quizData?.parentSubType,
    interests: quizData?.kidsInterests || [],
    interestsCount: quizData?.kidsInterests?.length || 0,
    primaryInterest: quizData?.kidsInterests?.[0] || 'learning',
    schoolsCount: quizData?.selectedSchools?.length || 0,
    gradeLevel: quizData?.selectedSchools?.[0]?.level || 'unknown',
    schoolName: quizData?.selectedSchools?.[0]?.name || 'their school'
  });

  // Initialize cache
  log('Initializing content cache with all sections pending...');
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
  
  console.log(`📊 [OptimisticContentGen] Cache initialized:`, {
    sectionsTotal: Object.keys(contentCache.generationStatus).length,
    allPending: Object.values(contentCache.generationStatus).every(status => status === 'pending'),
    startTime: new Date(contentCache.startTime).toISOString()
  });

  // Generate prompts
  logProgress('Generating personalized prompts for all sections...');
  const promptStartTime = Date.now();
  const prompts = generatePrompts(quizData);
  const promptLatency = Date.now() - promptStartTime;
  
  console.log(`📝 [OptimisticContentGen] Prompts generated in ${promptLatency}ms:`, {
    sectionsWithPrompts: Object.keys(prompts),
    totalPromptLength: Object.values(prompts).reduce((sum, prompt) => sum + prompt.length, 0),
    averagePromptLength: Math.round(Object.values(prompts).reduce((sum, prompt) => sum + prompt.length, 0) / Object.keys(prompts).length),
    promptLengths: Object.entries(prompts).reduce((acc, [key, prompt]) => ({
      ...acc,
      [key]: prompt.length
    }), {})
  });

  // Start generating all sections in parallel
  log('Launching parallel content generation for all sections...');
  const generationPromises = [
    generateSectionContent('afternoonActivities', prompts.afternoonActivities, quizData),
    generateSectionContent('subjectExamples', prompts.subjectExamples, quizData),
    generateSectionContent('howWeGetResults', prompts.howWeGetResults, quizData),
    generateSectionContent('learningScience', prompts.learningScience, quizData),
    generateSectionContent('dataShock', prompts.dataShock, quizData)
  ];
  
  console.log(`🔄 [OptimisticContentGen] ${generationPromises.length} parallel generation tasks launched`);

  // Wait for all to complete (but don't block)
  Promise.all(generationPromises)
    .then(() => {
      if (contentCache) {
        contentCache.completionTime = Date.now();
        const totalTime = contentCache.completionTime - contentCache.startTime;
        const overallTime = Date.now() - overallStartTime;
        
        logSuccess('========== ALL CONTENT GENERATION COMPLETED ==========');
        console.log(`🎉 [OptimisticContentGen] Complete generation summary:`, {
          totalGenerationTime: `${totalTime}ms`,
          overallTime: `${overallTime}ms`,
          sectionsCompleted: Object.values(contentCache.generationStatus).filter(s => s === 'completed').length,
          sectionsErrored: Object.values(contentCache.generationStatus).filter(s => s === 'error').length,
          sectionsTotal: Object.keys(contentCache.generationStatus).length,
          finalStatus: contentCache.generationStatus,
          successRate: `${Math.round(Object.values(contentCache.generationStatus).filter(s => s === 'completed').length / Object.keys(contentCache.generationStatus).length * 100)}%`,
          averageTimePerSection: `${Math.round(totalTime / Object.keys(contentCache.generationStatus).length)}ms`,
          completionTimestamp: new Date(contentCache.completionTime).toISOString()
        });
        
        // Log final cache content summary
        const contentSummary = Object.entries(contentCache).reduce((acc, [key, value]) => {
          if (key !== 'generationStatus' && key !== 'startTime' && key !== 'completionTime') {
            acc[key] = {
              exists: !!value,
              size: value ? JSON.stringify(value).length : 0,
              keys: value && typeof value === 'object' ? Object.keys(value).length : 0
            };
          }
          return acc;
        }, {} as any);
        
        console.log(`📊 [OptimisticContentGen] Final content cache summary:`, contentSummary);
      }
    })
    .catch((error) => {
      const overallTime = Date.now() - overallStartTime;
      logError(`Parallel content generation failed after ${overallTime}ms`, {
        error: error.message,
        stack: error.stack?.split('\n').slice(0, 3),
        currentStatus: contentCache?.generationStatus,
        sectionsCompleted: contentCache ? Object.values(contentCache.generationStatus).filter(s => s === 'completed').length : 0,
        sectionsErrored: contentCache ? Object.values(contentCache.generationStatus).filter(s => s === 'error').length : 0,
        overallTime
      });
    });
};

// Get cached content
export const getCachedContent = (): ContentCache | null => {
  if (contentCache) {
    const completedSections = Object.values(contentCache.generationStatus).filter(s => s === 'completed').length;
    const errorSections = Object.values(contentCache.generationStatus).filter(s => s === 'error').length;
    
    console.log(`📋 [OptimisticContentGen] Cache access - current state:`, {
      exists: true,
      hasCompletionTime: !!contentCache.completionTime,
      sectionsCompleted: completedSections,
      sectionsErrored: errorSections,
      sectionsTotal: Object.keys(contentCache.generationStatus).length,
      isFullyComplete: !!contentCache.completionTime,
      ageMs: Date.now() - contentCache.startTime,
      status: contentCache.generationStatus
    });
  } else {
    console.log(`❌ [OptimisticContentGen] Cache access - no cache available`);
  }
  
  return contentCache;
};

// Get specific section content
export const getSectionContent = (sectionId: string): any => {
  if (!contentCache) {
    console.log(`❌ [OptimisticContentGen] Section access failed - no cache for: ${sectionId}`);
    return null;
  }
  
  const content = contentCache[sectionId as keyof ContentCache];
  const status = contentCache.generationStatus[sectionId as keyof ContentGenerationStatus];
  
  console.log(`🔍 [OptimisticContentGen] Section content access:`, {
    sectionId,
    hasContent: !!content,
    status,
    contentSize: content ? JSON.stringify(content).length : 0,
    contentKeys: content && typeof content === 'object' ? Object.keys(content).length : 0
  });
  
  return content;
};

// Get generation status
export const getGenerationStatus = (): ContentGenerationStatus | null => {
  if (contentCache?.generationStatus) {
    const statusCounts = Object.values(contentCache.generationStatus).reduce((acc, status) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(`📊 [OptimisticContentGen] Status access:`, {
      ...contentCache.generationStatus,
      summary: statusCounts,
      totalSections: Object.keys(contentCache.generationStatus).length,
      completionPercentage: Math.round((statusCounts.completed || 0) / Object.keys(contentCache.generationStatus).length * 100)
    });
  } else {
    console.log(`❌ [OptimisticContentGen] Status access failed - no generation status available`);
  }
  
  return contentCache?.generationStatus || null;
};

// Clear cache (useful for testing or new quiz attempts)
export const clearContentCache = (): void => {
  if (contentCache) {
    const cacheAge = Date.now() - contentCache.startTime;
    const completedSections = Object.values(contentCache.generationStatus).filter(s => s === 'completed').length;
    
    log('Clearing content cache', {
      hadContent: true,
      cacheAge: `${cacheAge}ms`,
      sectionsCompleted: completedSections,
      sectionsTotal: Object.keys(contentCache.generationStatus).length,
      wasComplete: !!contentCache.completionTime
    });
  } else {
    log('Cache clear requested but no cache exists');
  }
  
  contentCache = null;
};

// Pre-fetch content for subsequent questions
export const prefetchFollowUpContent = async (
  sectionId: string,
  context: any
): Promise<void> => {
  const prefetchStartTime = Date.now();
  log(`========== PREFETCHING FOLLOW-UP CONTENT: ${sectionId.toUpperCase()} ==========`);
  
  console.log(`🔮 [OptimisticContentGen] Prefetch initiated:`, {
    sectionId,
    contextKeys: context ? Object.keys(context) : [],
    contextSize: context ? JSON.stringify(context).length : 0,
    hasUserType: !!context?.userType,
    hasInterests: !!context?.kidsInterests
  });

  try {
    const prompt = `Generate 3 follow-up questions for the ${sectionId} section.
Context: ${JSON.stringify(context)}
Format as JSON array of questions with engaging text.`;

    console.log(`📝 [OptimisticContentGen] Prefetch prompt details:`, {
      promptLength: prompt.length,
      targetSection: `${sectionId}_followUp`,
      contextIncluded: !!context,
      promptPreview: prompt.substring(0, 150) + '...'
    });

    logProgress(`Making prefetch API request for ${sectionId}...`);
    const requestStartTime = Date.now();

    const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt,
            maxTokens: 1000,
            temperature: 0.9,
        }),
    });

    const requestLatency = Date.now() - requestStartTime;
    console.log(`⏱️ [OptimisticContentGen] Prefetch API request completed in ${requestLatency}ms, status: ${response.status}`);

    if (!response.ok) {
        const errorData = await response.json();
        logError(`Prefetch API request failed for ${sectionId}`, {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.error || 'Failed to prefetch content');
    }
    
    const result = await response.json();
    const totalLatency = Date.now() - prefetchStartTime;

    logSuccess(`Pre-fetched follow-up content for ${sectionId}`, {
      provider: result.provider,
      apiLatencyMs: result.latencyMs,
      totalLatencyMs: totalLatency,
      responseLength: result.content?.length || 0,
      sectionId
    });

    console.log(`🎯 [OptimisticContentGen] Prefetch result summary:`, {
      hasResult: !!result,
      hasContent: !!result.content,
      provider: result.provider,
      contentPreview: result.content?.substring(0, 100) + '...'
    });

    // Store in a separate follow-up cache if needed
    console.log(`💾 [OptimisticContentGen] Prefetch storage not yet implemented (placeholder for future enhancement)`);
  } catch (error) {
    const totalLatency = Date.now() - prefetchStartTime;
    logError(`Error pre-fetching follow-up content for ${sectionId} after ${totalLatency}ms`, {
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 3),
      sectionId,
      totalLatency
    });
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
