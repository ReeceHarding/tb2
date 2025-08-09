// Centralized AI Fallback System for robust error handling across all AI APIs

export interface AIFallbackConfig {
  endpoint: string;
  maxRetries: number;
  retryDelay: number;
  providers: ('claude' | 'openai' | 'fallback')[];
  fallbackContent?: any;
}

export interface AIRequest {
  interests?: string[];
  subject?: string;
  gradeLevel?: string;
  context?: any;
  type?: string;
  [key: string]: any;
}

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  provider?: string;
  retryCount?: number;
  metadata?: any;
}

class AIFallbackService {
  private static instance: AIFallbackService;
  private providerFailures: Map<string, number> = new Map();
  private lastFailureTime: Map<string, number> = new Map();
  
  static getInstance(): AIFallbackService {
    if (!AIFallbackService.instance) {
      AIFallbackService.instance = new AIFallbackService();
    }
    return AIFallbackService.instance;
  }

  // Circuit breaker pattern - temporarily disable failed providers
  private isProviderAvailable(provider: string): boolean {
    const failures = this.providerFailures.get(provider) || 0;
    const lastFailure = this.lastFailureTime.get(provider) || 0;
    const now = Date.now();
    
    // Reset failure count after 5 minutes
    if (now - lastFailure > 5 * 60 * 1000) {
      this.providerFailures.set(provider, 0);
      return true;
    }
    
    // Disable provider after 3 consecutive failures
    return failures < 3;
  }

  private recordProviderFailure(provider: string): void {
    const currentFailures = this.providerFailures.get(provider) || 0;
    this.providerFailures.set(provider, currentFailures + 1);
    this.lastFailureTime.set(provider, Date.now());
    
    console.log(`[AIFallbackService] Provider ${provider} failure count: ${currentFailures + 1}`);
  }

  private recordProviderSuccess(provider: string): void {
    this.providerFailures.set(provider, 0);
    console.log(`[AIFallbackService] Provider ${provider} successful, resetting failure count`);
  }

  async executeWithFallback(
    request: AIRequest,
    config: AIFallbackConfig
  ): Promise<AIResponse> {
    const startTime = Date.now();
    let lastError: Error | null = null;
    
    console.log(`[AIFallbackService] Starting request for endpoint: ${config.endpoint}`);
    console.log(`[AIFallbackService] Available providers:`, config.providers);
    console.log(`[AIFallbackService] Request details:`, {
      subject: request.subject,
      gradeLevel: request.gradeLevel,
      interests: request.interests?.length || 0,
      type: request.type
    });
    
    // Try each provider in order
    for (let i = 0; i < config.providers.length; i++) {
      const provider = config.providers[i];
      
      // Skip unavailable providers (circuit breaker)
      if (!this.isProviderAvailable(provider)) {
        console.log(`[AIFallbackService] Skipping ${provider} - circuit breaker active`);
        continue;
      }
      
      console.log(`[AIFallbackService] Attempting provider: ${provider} (attempt ${i + 1}/${config.providers.length})`);
      
      try {
        let result: AIResponse;
        
        switch (provider) {
          case 'openai':
          case 'fallback':
            result = await this.callFallbackAPI(request, config);
            break;
          default:
            throw new Error(`Provider ${provider} not implemented in fallback service`);
        }
        
        if (result.success) {
          this.recordProviderSuccess(provider);
          const duration = Date.now() - startTime;
          
          console.log(`[AIFallbackService] Success with ${provider} after ${duration}ms`);
          
          return {
            ...result,
            provider,
            retryCount: i,
            metadata: {
              ...result.metadata,
              duration,
              timestamp: new Date().toISOString(),
              providersAttempted: config.providers.slice(0, i + 1)
            }
          };
        } else {
          throw new Error(result.error || 'Provider returned unsuccessful response');
        }
        
      } catch (error) {
        lastError = error as Error;
        this.recordProviderFailure(provider);
        console.error(`[AIFallbackService] Provider ${provider} failed:`, error.message);
        
        // Add delay before trying next provider (except for last attempt)
        if (i < config.providers.length - 1) {
          console.log(`[AIFallbackService] Waiting ${config.retryDelay}ms before next provider...`);
          await new Promise(resolve => setTimeout(resolve, config.retryDelay));
        }
      }
    }
    
    // All providers failed, return emergency fallback content
    console.error(`[AIFallbackService] All providers failed for ${config.endpoint}, using emergency fallback`);
    const duration = Date.now() - startTime;
    
    return {
      success: true,
      data: this.generateEmergencyFallback(request, config),
      provider: 'emergency-fallback',
      error: `All AI providers failed: ${lastError?.message}`,
      retryCount: config.providers.length,
      metadata: {
        duration,
        timestamp: new Date().toISOString(),
        providersAttempted: config.providers,
        emergencyFallback: true,
        lastError: lastError?.message
      }
    };
  }

  private async callFallbackAPI(request: AIRequest, config: AIFallbackConfig): Promise<AIResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    const url = `${baseUrl}/api/ai/generate-fallback`;
    
    console.log(`[AIFallbackService] Calling fallback API: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...request,
        type: request.type || 'question_fallback'
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Fallback API failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`[AIFallbackService] Fallback API response:`, { success: result.success, hasData: !!result.data });
    
    return result;
  }

  private generateEmergencyFallback(request: AIRequest, config: AIFallbackConfig): any {
    const { interests = [], subject = 'general', gradeLevel = '6th' } = request;
    const primaryInterest = interests[0] || 'your interests';
    
    console.log(`[AIFallbackService] Generating emergency fallback for ${subject}/${gradeLevel}/${primaryInterest}`);
    
    // Return structured fallback content based on the endpoint type
    if (config.fallbackContent) {
      return config.fallbackContent;
    }
    
    // Default emergency fallback for question-type responses
    if (request.type === 'question_fallback' || !request.type) {
      return {
        question: `Here's a ${subject} question related to ${primaryInterest} for ${gradeLevel} grade: How might concepts from ${subject} apply to ${primaryInterest}?`,
        solution: `This is an emergency fallback response. AI services are temporarily unavailable. Please try refreshing the page in a few minutes for a personalized learning experience.`,
        learningObjective: `Core ${subject} concepts and their practical applications`,
        interestConnection: `This connects ${subject} learning with ${primaryInterest} to make it more engaging`,
        nextSteps: 'Refresh the page to try again when AI services are restored',
        followUpQuestions: [
          'Most interesting topic aspects?',
          'Real life applications?',
          'Next learning subject?'
        ],
        emergency: true
      };
    }
    
    // Default fallback for other types
    return {
      message: `Content related to ${subject} and ${primaryInterest} for ${gradeLevel} grade`,
      note: 'AI services are temporarily unavailable. Please try again in a few minutes.',
      subject,
      interests,
      gradeLevel,
      emergency: true,
      suggestions: [
        'Refresh the page to try again',
        'Check your internet connection',
        'Contact support if the issue persists'
      ]
    };
  }

  // Get provider health status for monitoring
  getProviderStatus(): Record<string, { failures: number; lastFailure: number; available: boolean }> {
    const providers = ['claude', 'openai', 'fallback'];
    const status: Record<string, { failures: number; lastFailure: number; available: boolean }> = {};
    
    providers.forEach(provider => {
      status[provider] = {
        failures: this.providerFailures.get(provider) || 0,
        lastFailure: this.lastFailureTime.get(provider) || 0,
        available: this.isProviderAvailable(provider)
      };
    });
    
    return status;
  }

  // Reset all provider failure counts (for manual recovery)
  resetProviderFailures(): void {
    console.log('[AIFallbackService] Resetting all provider failure counts');
    this.providerFailures.clear();
    this.lastFailureTime.clear();
  }

  // Get comprehensive metrics for monitoring
  getMetrics(): {
    providerStatus: Record<string, { failures: number; lastFailure: number; available: boolean }>;
    totalFailures: number;
    availableProviders: string[];
  } {
    const providerStatus = this.getProviderStatus();
    const totalFailures = Array.from(this.providerFailures.values()).reduce((sum, failures) => sum + failures, 0);
    const availableProviders = Object.entries(providerStatus)
      .filter(([_, status]) => status.available)
      .map(([provider, _]) => provider);
    
    return {
      providerStatus,
      totalFailures,
      availableProviders
    };
  }
}

export const aiFallbackService = AIFallbackService.getInstance();

// Convenience function for quick fallback integration
export async function withAIFallback(
  request: AIRequest,
  config: Partial<AIFallbackConfig> & { endpoint: string }
): Promise<AIResponse> {
  const fullConfig: AIFallbackConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    providers: ['openai', 'fallback'],
    ...config
  };
  
  return aiFallbackService.executeWithFallback(request, fullConfig);
}