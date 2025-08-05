import { invokeClaude, formatClaudeResponse, ClaudeMessage } from './bedrock-claude';

// Exponential backoff retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

// Circuit breaker to prevent overload cascades
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private readonly threshold = 5;
  private readonly timeout = 30000; // 30 seconds

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open - Bedrock Claude API temporarily unavailable');
      }
    }

    try {
      const result = await operation();
      if (this.state === 'half-open') {
        this.reset();
      }
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.threshold) {
      this.state = 'open';
      console.warn(`[CircuitBreaker] Bedrock Claude API circuit breaker opened after ${this.failures} failures`);
    }
  }

  private reset() {
    this.failures = 0;
    this.state = 'closed';
    console.log('[CircuitBreaker] Bedrock Claude API circuit breaker reset - service restored');
  }
}

const circuitBreaker = new CircuitBreaker();

// Delay function for exponential backoff
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Enhanced retry wrapper for Bedrock Claude API calls
async function withRetry<T>(operation: () => Promise<T>, context: string = 'API call'): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      console.log(`[BedrockRetry] ${context} - Attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1}`);
      
      return await circuitBreaker.execute(operation);
    } catch (error: any) {
      lastError = error;
      
      // Check if it's an overload error (Bedrock has different error patterns)
      const isOverloadError = error.message?.includes('Overloaded') || 
                             error.message?.includes('overloaded_error') ||
                             error.message?.includes('ThrottlingException') ||
                             error.status === 529;

      if (!isOverloadError || attempt === RETRY_CONFIG.maxRetries) {
        console.error(`[BedrockRetry] ${context} - Final failure after ${attempt + 1} attempts:`, error);
        throw error;
      }

      // Calculate delay with exponential backoff + jitter
      const backoffDelay = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(2, attempt),
        RETRY_CONFIG.maxDelay
      );
      const jitter = Math.random() * 1000; // Add randomness to prevent thundering herd
      const totalDelay = backoffDelay + jitter;

      console.warn(`[BedrockRetry] ${context} - Overload detected, retrying in ${Math.round(totalDelay)}ms (attempt ${attempt + 1})`);
      await delay(totalDelay);
    }
  }

  throw lastError!;
}

// AI SDK compatible wrappers for Bedrock Claude
export const safeBedrockAPI = {
  async generateText(params: any, context: string = 'generateText') {
    return withRetry(async () => {
      const messages: ClaudeMessage[] = params.messages || [
        { role: 'user', content: params.prompt || '' }
      ];
      
      const response = await invokeClaude(messages, {
        maxTokens: params.maxTokens || 1024,
        temperature: params.temperature || 0.7,
        system: params.system
      });
      
      return {
        text: formatClaudeResponse(response),
        usage: response.usage
      };
    }, context);
  },

  async streamText(params: any, context: string = 'streamText') {
    // For streaming, we simulate it by getting the full response and streaming it
    return withRetry(async () => {
      const messages: ClaudeMessage[] = params.messages || [
        { role: 'user', content: params.prompt || '' }
      ];
      
      const response = await invokeClaude(messages, {
        maxTokens: params.maxTokens || 1024,
        temperature: params.temperature || 0.7,
        system: params.system
      });
      
      const fullText = formatClaudeResponse(response);
      
      // Create a simple text stream response
      return {
        toTextStreamResponse: () => {
          const encoder = new TextEncoder();
          const stream = new ReadableStream({
            start(controller) {
              // Simulate streaming by sending text in chunks
              const words = fullText.split(' ');
              const chunkSize = 3;
              
              const sendChunk = (index: number) => {
                if (index < words.length) {
                  const chunk = words.slice(index, index + chunkSize).join(' ') + ' ';
                  controller.enqueue(encoder.encode(chunk));
                  setTimeout(() => sendChunk(index + chunkSize), 50);
                } else {
                  controller.close();
                }
              };
              
              sendChunk(0);
            }
          });
          
          return new Response(stream, {
            headers: {
              'Content-Type': 'text/plain',
              'Cache-Control': 'no-cache',
            },
          });
        }
      };
    }, context);
  },

  async generateObject(params: any, context: string = 'generateObject') {
    return withRetry(async () => {
      // Enhance the prompt to explicitly request JSON format
      const enhancedPrompt = `${params.prompt || ''}

CRITICAL INSTRUCTIONS:
- You MUST respond with ONLY valid JSON
- Do NOT include any markdown formatting, headers, or explanations
- Do NOT include any text before or after the JSON
- Your response must start with { and end with }
- Ensure all JSON properties are properly quoted
- Never use hyphens in any text values

Return only the JSON object that matches the requested schema.`;

      const messages: ClaudeMessage[] = [
        { role: 'user', content: enhancedPrompt }
      ];
      
      const response = await invokeClaude(messages, {
        maxTokens: params.maxTokens || 1000,
        temperature: params.temperature || 0.7,
        system: params.system
      });
      
      const textResponse = formatClaudeResponse(response);
      console.log(`[${context}] Raw Claude response:`, textResponse.substring(0, 200) + '...');
      
      // Parse JSON response with better error handling
      let parsedObject;
      try {
        // First, try to clean up the response by removing any markdown formatting
        let cleanedResponse = textResponse.trim();
        
        // Remove markdown code blocks if present
        cleanedResponse = cleanedResponse.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        
        // Remove any leading text before the JSON (like "# Galactic" or other markdown)
        const jsonStart = cleanedResponse.indexOf('{');
        const jsonEnd = cleanedResponse.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
        }
        
        console.log(`[${context}] Cleaned response:`, cleanedResponse.substring(0, 200) + '...');
        
        // Parse the cleaned JSON
        parsedObject = JSON.parse(cleanedResponse);
        
        console.log(`[${context}] Successfully parsed JSON object`);
        
      } catch (error) {
        console.error(`[${context}] Failed to parse JSON from Bedrock response:`, error);
        console.error(`[${context}] Original response:`, textResponse);
        
        // Try one more time with a more aggressive approach
        try {
          const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedObject = JSON.parse(jsonMatch[0]);
            console.log(`[${context}] Successfully parsed with regex extraction`);
          } else {
            throw new Error('No JSON found in response');
          }
        } catch (secondError) {
          console.error(`[${context}] Second parsing attempt failed:`, secondError);
          throw new Error(`Invalid JSON response from Bedrock Claude. Response started with: ${textResponse.substring(0, 100)}`);
        }
      }
      
      return {
        object: parsedObject,
        usage: response.usage
      };
    }, context);
  }
};

// Rate limiter to prevent too many concurrent requests
class RateLimiter {
  private queue: Array<() => void> = [];
  private running = 0;
  private readonly maxConcurrent = 3; // Maximum concurrent Bedrock requests

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          this.running++;
          console.log(`[RateLimiter] Executing request (${this.running}/${this.maxConcurrent} concurrent)`);
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.running--;
          this.processQueue();
        }
      });

      this.processQueue();
    });
  }

  private processQueue() {
    if (this.running < this.maxConcurrent && this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) {
        next();
      }
    }
  }
}

export const rateLimiter = new RateLimiter();