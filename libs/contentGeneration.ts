// Content Generation Service for Parallel LLM Processing
// Handles all LLM API calls in parallel for personalized results

interface QuizData {
  userType: string;
  parentSubType: string;
  selectedSchools: Array<{
    id: string;
    name: string;
    city: string;
    state: string;
    level: string;
  }>;
  // learningGoals: string[]; - removed
  kidsInterests: string[];
  numberOfKids: number;
}

interface GenerationTask {
  id: string;
  name: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  progress: number;
  data?: any;
  error?: string;
}

interface ContentGenerationResult {
  afternoonActivities?: any;
  subjectExamples?: any;
  howWeGetResults?: any;
  followUpQuestions?: any;
  tasks: GenerationTask[];
  allCompleted: boolean;
  hasErrors: boolean;
}

// Helper function to get section content for context (shared with PersonalizedResults)
export const getSectionContent = (section: string): string => {
  const contentMap: Record<string, string> = {
    'school-performance': 'Data showing TimeBack students consistently achieve 99th percentile results compared to traditional schools, with detailed analytics and performance metrics.',
    'timeback-intro': 'Overview of how TimeBack AI tutoring works with personalized learning, mastery-based progression, and adaptive curriculum.',
    'subject-examples': 'Examples of how TimeBack connects student interests to academic subjects like math, science, English, creating personalized problems and lessons.',
    'learning-science': 'The research and science behind mastery-based learning, spaced repetition, and personalized education approaches.',
    'competitors': 'Comparison between TimeBack and other educational approaches including Khan Academy, traditional tutoring, and other AI platforms.',
    'afternoon-activities': 'How TimeBack incorporates afternoon activities, real-world experiences, and interest-based learning outside of academics.',
    'speed-comparison': 'Data showing how TimeBack students complete academic subjects 6-10x faster than traditional school while achieving better results.',
    'cta': 'Information about getting started with TimeBack, enrollment process, and next steps for parents.',
    'timeback-vs-competitors': 'Detailed comparison between TimeBack and other educational approaches including Khan Academy, traditional tutoring, and other AI platforms.'
  };
  
  return contentMap[section] || 'General TimeBack personalized education platform information';
};

export class ContentGenerationService {
  private tasks: GenerationTask[] = [];
  private onProgressCallback?: (tasks: GenerationTask[], allCompleted: boolean) => void;
  private static cache = new Map<string, { data: any; timestamp: number; expiry: number }>();
  private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes cache

  constructor(onProgress?: (tasks: GenerationTask[], allCompleted: boolean) => void) {
    this.onProgressCallback = onProgress;
    console.log('[ContentGenerationService] Initialized with progress callback:', !!onProgress);
  }

  // Generate cache key based on quiz data
  private static generateCacheKey(endpoint: string, quizData: QuizData): string {
    const keyData = {
      endpoint,
      userType: quizData.userType,
      parentSubType: quizData.parentSubType,
      interests: quizData.kidsInterests.sort(),
      schoolCount: quizData.selectedSchools.length,
      schoolLevels: Array.from(new Set(quizData.selectedSchools.map(s => s.level))).sort()
    };
    return btoa(JSON.stringify(keyData));
  }

  // Check cache for existing content
  private static getCachedContent(cacheKey: string): any | null {
    const cached = ContentGenerationService.cache.get(cacheKey);
    if (!cached) return null;
    
    const now = Date.now();
    if (now > cached.expiry) {
      ContentGenerationService.cache.delete(cacheKey);
      return null;
    }
    
    console.log(`[ContentGenerationService] Cache hit for key: ${cacheKey}`);
    return cached.data;
  }

  // Store content in cache
  private static setCachedContent(cacheKey: string, data: any): void {
    const now = Date.now();
    ContentGenerationService.cache.set(cacheKey, {
      data,
      timestamp: now,
      expiry: now + ContentGenerationService.CACHE_DURATION
    });
    console.log(`[ContentGenerationService] Cached content for key: ${cacheKey}`);
  }

  // Clear expired cache entries periodically
  private static cleanupCache(): void {
    const now = Date.now();
    const sizeBefore = ContentGenerationService.cache.size;
    
    for (const [key, value] of Array.from(ContentGenerationService.cache.entries())) {
      if (now > value.expiry) {
        ContentGenerationService.cache.delete(key);
      }
    }
    
    const sizeAfter = ContentGenerationService.cache.size;
    if (sizeBefore !== sizeAfter) {
      console.log(`[ContentGenerationService] Cleaned up cache: ${sizeBefore} -> ${sizeAfter} entries`);
    }
  }

  // Initialize all generation tasks
  initializeTasks(): GenerationTask[] {
    const timestamp = new Date().toISOString();
    console.log(`[ContentGenerationService] ${timestamp} Initializing all generation tasks`);

    this.tasks = [
      {
        id: 'afternoon-activities',
        name: 'Generating afternoon activities...',
        status: 'pending',
        progress: 0
      },
      {
        id: 'subject-examples-questions',
        name: 'Creating subject example questions...',
        status: 'pending',
        progress: 0
      },

      {
        id: 'how-we-get-results',
        name: 'Generating results explanation...',
        status: 'pending',
        progress: 0
      },
      {
        id: 'follow-up-questions',
        name: 'Creating interactive questions...',
        status: 'pending',
        progress: 0
      }
    ];

    console.log(`[ContentGenerationService] ${timestamp} Initialized ${this.tasks.length} tasks:`, this.tasks.map(t => t.id));
    return [...this.tasks];
  }

  // Update task status and notify callback
  private updateTask(taskId: string, updates: Partial<GenerationTask>) {
    const timestamp = new Date().toISOString();
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      console.error(`[ContentGenerationService] ${timestamp} Task not found: ${taskId}`);
      return;
    }

    // Update the task
    this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
    console.log(`[ContentGenerationService] ${timestamp} Updated task ${taskId}:`, updates);

    // Check if all tasks are completed
    const allCompleted = this.tasks.every(task => task.status === 'completed' || task.status === 'error');
    console.log(`[ContentGenerationService] ${timestamp} All tasks completed: ${allCompleted}`);
    console.log(`[ContentGenerationService] ${timestamp} Task statuses:`, this.tasks.map(t => ({ id: t.id, status: t.status })));

    // Notify progress callback
    if (this.onProgressCallback) {
      this.onProgressCallback([...this.tasks], allCompleted);
    }
  }

  // Generate afternoon activities content with caching
  private async generateAfternoonActivities(quizData: QuizData): Promise<any> {
    const timestamp = new Date().toISOString();
    console.log(`[ContentGenerationService] ${timestamp} Starting afternoon activities generation`);
    
    // Clean up cache periodically
    ContentGenerationService.cleanupCache();
    
    // Check cache first
    const cacheKey = ContentGenerationService.generateCacheKey('afternoon-activities', quizData);
    const cachedContent = ContentGenerationService.getCachedContent(cacheKey);
    
    if (cachedContent) {
      console.log(`[ContentGenerationService] ${timestamp} Using cached afternoon activities`);
      this.updateTask('afternoon-activities', { 
        status: 'completed', 
        progress: 100, 
        data: cachedContent 
      });
      return cachedContent;
    }
    
    this.updateTask('afternoon-activities', { status: 'loading', progress: 10 });

    try {
      this.updateTask('afternoon-activities', { progress: 30 });
      
      const response = await fetch('/api/ai/generate-afternoon-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interests: quizData.kidsInterests,
          quizData
        }),
      });

      this.updateTask('afternoon-activities', { progress: 70 });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log(`[ContentGenerationService] ${timestamp} Afternoon activities generated successfully`);
        
        // Cache the result
        ContentGenerationService.setCachedContent(cacheKey, data.content);
        
        this.updateTask('afternoon-activities', { 
          status: 'completed', 
          progress: 100, 
          data: data.content 
        });
        return data.content;
      } else {
        throw new Error(data.error || 'Failed to generate afternoon activities');
      }
    } catch (error) {
      console.error(`[ContentGenerationService] ${timestamp} Error generating afternoon activities:`, error);
      this.updateTask('afternoon-activities', { 
        status: 'error', 
        progress: 0, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return null;
    }
  }

  // Generate subject examples questions
  private async generateSubjectExamplesQuestions(quizData: QuizData): Promise<any> {
    const timestamp = new Date().toISOString();
    console.log(`[ContentGenerationService] ${timestamp} Starting subject examples questions generation`);
    
    this.updateTask('subject-examples-questions', { status: 'loading', progress: 10 });

    try {
      this.updateTask('subject-examples-questions', { progress: 30 });
      
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interests: quizData.kidsInterests,
          quizData
        }),
      });

      this.updateTask('subject-examples-questions', { progress: 70 });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log(`[ContentGenerationService] ${timestamp} Subject examples questions generated successfully`);
      this.updateTask('subject-examples-questions', { 
        status: 'completed', 
        progress: 100, 
        data: data 
      });
      return data;
    } catch (error) {
      console.error(`[ContentGenerationService] ${timestamp} Error generating subject examples questions:`, error);
      this.updateTask('subject-examples-questions', { 
        status: 'error', 
        progress: 0, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return null;
    }
  }



  // Generate how we get results content
  private async generateHowWeGetResults(quizData: QuizData): Promise<any> {
    const timestamp = new Date().toISOString();
    console.log(`[ContentGenerationService] ${timestamp} Starting how we get results generation`);
    
    this.updateTask('how-we-get-results', { status: 'loading', progress: 10 });

    try {
      this.updateTask('how-we-get-results', { progress: 30 });
      
      const response = await fetch('/api/ai/generate-fallback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section: 'how-we-get-results',
          interests: quizData.kidsInterests,
          // learningGoals: quizData.learningGoals, - removed
          gradeLevel: quizData.selectedSchools[0]?.level || '2nd'
        }),
      });

      this.updateTask('how-we-get-results', { progress: 70 });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log(`[ContentGenerationService] ${timestamp} How we get results generated successfully`);
      this.updateTask('how-we-get-results', { 
        status: 'completed', 
        progress: 100, 
        data: data 
      });
      return data;
    } catch (error) {
      console.error(`[ContentGenerationService] ${timestamp} Error generating how we get results:`, error);
      this.updateTask('how-we-get-results', { 
        status: 'error', 
        progress: 0, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return null;
    }
  }

  // Generate follow-up questions for all sections
  private async generateFollowUpQuestions(quizData: QuizData): Promise<any> {
    const timestamp = new Date().toISOString();
    console.log(`[ContentGenerationService] ${timestamp} Starting follow-up questions generation`);
    
    this.updateTask('follow-up-questions', { status: 'loading', progress: 10 });

    const allSections = [
      'school-performance',
      'timeback-intro', 
      'subject-examples',
      'learning-science',
      'competitors',
      'timeback-vs-competitors',
      'afternoon-activities',
      'speed-comparison',
      'cta'
    ];

    try {
      const questionPromises = allSections.map(async (section, index) => {
        console.log(`[ContentGenerationService] ${timestamp} Generating questions for section: ${section}`);
        
        // Update progress based on section completion
        const sectionProgress = 10 + (index / allSections.length) * 80;
        this.updateTask('follow-up-questions', { progress: sectionProgress });
        
        try {
          const response = await fetch('/api/ai/generate-follow-up-questions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              section,
              quizData,
              sectionContent: getSectionContent(section)
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          
          return {
            section,
            questions: data.success ? data.questions : [],
            isGenerated: data.success,
            isLoading: false
          };
        } catch (error) {
          console.error(`[ContentGenerationService] ${timestamp} Error generating questions for ${section}:`, error);
          return {
            section,
            questions: [],
            isGenerated: false,
            isLoading: false
          };
        }
      });

      const results = await Promise.all(questionPromises);
      
      // Convert array to object keyed by section
      const questionsData = results.reduce((acc, result) => {
        acc[result.section] = {
          questions: result.questions,
          isGenerated: result.isGenerated,
          isLoading: result.isLoading
        };
        return acc;
      }, {} as Record<string, any>);

      console.log(`[ContentGenerationService] ${timestamp} Follow-up questions generated for all sections`);
      this.updateTask('follow-up-questions', { 
        status: 'completed', 
        progress: 100, 
        data: questionsData 
      });
      return questionsData;
    } catch (error) {
      console.error(`[ContentGenerationService] ${timestamp} Error generating follow-up questions:`, error);
      this.updateTask('follow-up-questions', { 
        status: 'error', 
        progress: 0, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return null;
    }
  }

  // Main method to generate all content in parallel
  async generateAllContent(quizData: QuizData): Promise<ContentGenerationResult> {
    const timestamp = new Date().toISOString();
    console.log(`[ContentGenerationService] ${timestamp} Starting parallel content generation for all components`);

    // Initialize tasks
    this.initializeTasks();

    // Start all generation tasks in parallel
    const [
      afternoonActivities,
      subjectExamplesQuestions,
      howWeGetResults,
      followUpQuestions
    ] = await Promise.all([
      this.generateAfternoonActivities(quizData),
      this.generateSubjectExamplesQuestions(quizData),
      this.generateHowWeGetResults(quizData),
      this.generateFollowUpQuestions(quizData)
    ]);

    const allCompleted = this.tasks.every(task => task.status === 'completed' || task.status === 'error');
    const hasErrors = this.tasks.some(task => task.status === 'error');

    console.log(`[ContentGenerationService] ${timestamp} All parallel generation completed. Success: ${allCompleted}, Errors: ${hasErrors}`);
    console.log(`[ContentGenerationService] ${timestamp} Final task states:`, this.tasks.map(t => ({ id: t.id, status: t.status })));

    return {
      afternoonActivities,
      subjectExamples: {
        questions: subjectExamplesQuestions
      },
      howWeGetResults,
      followUpQuestions,
      tasks: [...this.tasks],
      allCompleted,
      hasErrors
    };
  }

  // Get current task statuses
  getTasks(): GenerationTask[] {
    return [...this.tasks];
  }

  // Get overall progress percentage
  getOverallProgress(): number {
    if (this.tasks.length === 0) return 0;
    
    const totalProgress = this.tasks.reduce((sum, task) => sum + task.progress, 0);
    return Math.round(totalProgress / this.tasks.length);
  }

  // Check if all tasks are completed
  isAllCompleted(): boolean {
    return this.tasks.every(task => task.status === 'completed' || task.status === 'error');
  }

  // Check if there are any errors
  hasErrors(): boolean {
    return this.tasks.some(task => task.status === 'error');
  }
}

export default ContentGenerationService;