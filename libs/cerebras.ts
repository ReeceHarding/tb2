import OpenAI from 'openai';
import { safeBedrockAPI } from './bedrock-helpers';

// Log timestamps for debugging
const log = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[CerebrasClient] ${timestamp} ${message}`, data || '');
};

// Initialize Cerebras client using OpenAI SDK (Cerebras is OpenAI-compatible)
const cerebrasClient = new OpenAI({
  baseURL: 'https://api.cerebras.ai/v1',
  apiKey: process.env.CEREBRAS_API_KEY || '',
});

// Initialize OpenAI client as fallback
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export interface GenerateContentOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  stream?: boolean;
}

export interface GenerateContentResponse {
  content: string;
  provider: 'cerebras' | 'bedrock' | 'openai';
  latencyMs: number;
  tokenCount?: number;
}

/**
 * Generate content using Cerebras with automatic fallback to AWS Bedrock and OpenAI
 * This implements the fallback chain: Cerebras → AWS Bedrock (Claude) → OpenAI GPT-4 Turbo
 */
export async function generateContent(options: GenerateContentOptions): Promise<GenerateContentResponse> {
  const startTime = Date.now();
  
  log('Starting content generation with options:', {
    promptLength: options.prompt.length,
    maxTokens: options.maxTokens,
    temperature: options.temperature,
    stream: options.stream
  });

  // First, try Cerebras (fastest inference)
  try {
    log('Attempting generation with Cerebras...');
    
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    
    messages.push({ role: 'user', content: options.prompt });
    
    const completion = await cerebrasClient.chat.completions.create({
      model: 'qwen-3-coder-480b', // Using the recommended model from the TODO
      messages,
      max_tokens: options.maxTokens || 40000,
      temperature: options.temperature || 0.7,
      stream: false, // Always false for now
    });

    if (options.stream) {
      // For streaming responses, we'd need to handle differently
      // For now, we'll throw to use non-streaming fallback
      throw new Error('Streaming not yet implemented for Cerebras');
    }

    const content = completion.choices[0]?.message?.content || '';
    const latencyMs = Date.now() - startTime;
    
    log(`Cerebras generation successful in ${latencyMs}ms`);
    
    return {
      content,
      provider: 'cerebras',
      latencyMs,
      tokenCount: completion.usage?.total_tokens,
    };
  } catch (cerebrasError) {
    log('Cerebras failed, falling back to AWS Bedrock', cerebrasError);
    
    // Second, try AWS Bedrock with Claude
    try {
      const bedrockStartTime = Date.now();
      
      const bedrockResult = await safeBedrockAPI.generateText({
        prompt: options.prompt,
        system: options.systemPrompt,
        maxTokens: options.maxTokens || 40000,
        temperature: options.temperature || 0.7
      }, 'cerebras-fallback');
      
      const bedrockResponse = bedrockResult.text;
      
      const latencyMs = Date.now() - bedrockStartTime;
      
      log(`AWS Bedrock generation successful in ${latencyMs}ms`);
      
      return {
        content: bedrockResponse,
        provider: 'bedrock',
        latencyMs,
      };
    } catch (bedrockError) {
      log('Bedrock failed, falling back to OpenAI', bedrockError);
      
      // Final fallback to OpenAI GPT-4 Turbo
      try {
        const openaiStartTime = Date.now();
        
        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
        
        if (options.systemPrompt) {
          messages.push({ role: 'system', content: options.systemPrompt });
        }
        
        messages.push({ role: 'user', content: options.prompt });
        
        const completion = await openaiClient.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages,
          max_tokens: options.maxTokens || 4096,
          temperature: options.temperature || 0.7,
          stream: false, // Always false for now
        });

        if (options.stream) {
          throw new Error('Streaming not yet implemented for OpenAI fallback');
        }

        const content = completion.choices[0]?.message?.content || '';
        const latencyMs = Date.now() - openaiStartTime;
        
        log(`OpenAI generation successful in ${latencyMs}ms`);
        
        return {
          content,
          provider: 'openai',
          latencyMs,
          tokenCount: completion.usage?.total_tokens,
        };
      } catch (openaiError) {
        log('All providers failed', { cerebrasError, bedrockError, openaiError });
        throw new Error('All LLM providers failed. Please try again later.');
      }
    }
  }
}

/**
 * Stream content generation with Cerebras (with fallback support)
 * Returns an async generator that yields content chunks
 */
export async function* streamContent(options: GenerateContentOptions): AsyncGenerator<string> {
  log('Starting streaming content generation...');
  
  try {
    // Try Cerebras streaming first
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    
    messages.push({ role: 'user', content: options.prompt });
    
    const stream = await cerebrasClient.chat.completions.create({
      model: 'qwen-3-coder-480b',
      messages,
      max_tokens: options.maxTokens || 40000,
      temperature: options.temperature || 0.7,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield content;
      }
    }
    
    log('Cerebras streaming completed successfully');
  } catch (error) {
    log('Cerebras streaming failed, using non-streaming fallback', error);
    
    // Fallback to non-streaming generation
    const response = await generateContent({ ...options, stream: false });
    
    // Simulate streaming by yielding chunks
    const chunkSize = 10; // Characters per chunk
    for (let i = 0; i < response.content.length; i += chunkSize) {
      yield response.content.slice(i, i + chunkSize);
      // Small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
}

/**
 * Pre-generate content for multiple prompts in parallel
 * Used for optimistic content generation
 */
export async function preGenerateContent(
  prompts: GenerateContentOptions[]
): Promise<GenerateContentResponse[]> {
  log(`Pre-generating content for ${prompts.length} prompts...`);
  
  const startTime = Date.now();
  
  // Generate all content in parallel
  const results = await Promise.all(
    prompts.map(prompt => generateContent(prompt))
  );
  
  const totalLatency = Date.now() - startTime;
  log(`Pre-generation completed in ${totalLatency}ms for ${prompts.length} prompts`);
  
  return results;
}

// Export a singleton instance for easy use
export const cerebras = {
  generateContent,
  streamContent,
  preGenerateContent,
};