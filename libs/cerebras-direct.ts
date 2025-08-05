// Direct API implementation for Cerebras (bypassing OpenAI SDK issues)

import { safeBedrockAPI } from './bedrock-helpers';
import OpenAI from 'openai';

// Log timestamps for debugging
const log = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[CerebrasClient] ${timestamp} ${message}`, data || '');
};

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

// Direct Cerebras API call using fetch
async function callCerebrasDirectly(options: GenerateContentOptions): Promise<any> {
  const messages = [];
  
  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  
  messages.push({ role: 'user', content: options.prompt });
  
  const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'qwen-3-235b-a22b-instruct-2507',
      messages,
      max_tokens: options.maxTokens || 40000,
      temperature: options.temperature || 0.7
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cerebras API error: ${response.status} - ${error}`);
  }

  return response.json();
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

  // First, try Cerebras (fastest inference) with direct API call
  try {
    log('Attempting generation with Cerebras (direct API)...');
    
    const response = await callCerebrasDirectly(options);
    
    const endTime = Date.now();
    const latencyMs = endTime - startTime;
    
    log(`Cerebras succeeded in ${latencyMs}ms`);
    
    return {
      content: response.choices[0].message.content,
      provider: 'cerebras',
      latencyMs,
      tokenCount: response.usage?.total_tokens
    };
  } catch (cerebrasError) {
    log('Cerebras failed, falling back to AWS Bedrock', cerebrasError);
    
    // Second, try AWS Bedrock (Claude Sonnet)
    try {
      const bedrockResponse = await safeBedrockAPI.generateText({
        prompt: options.prompt,
        systemPrompt: options.systemPrompt,
        maxTokens: options.maxTokens || 40000,
        temperature: options.temperature || 0.7,
        modelId: 'anthropic.claude-4-20250102' // Latest Claude Sonnet
      });
      
      const endTime = Date.now();
      const latencyMs = endTime - startTime;
      
      log(`Bedrock succeeded in ${latencyMs}ms`);
      
      return {
        content: bedrockResponse.text,
        provider: 'bedrock',
        latencyMs,
        tokenCount: bedrockResponse.usage ? (bedrockResponse.usage.input_tokens + bedrockResponse.usage.output_tokens) : undefined
      };
    } catch (bedrockError) {
      log('Bedrock failed, falling back to OpenAI', bedrockError);
      
      // Third, try OpenAI GPT-4 Turbo as final fallback
      try {
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
          stream: false,
        });
        
        const endTime = Date.now();
        const latencyMs = endTime - startTime;
        
        log(`OpenAI succeeded in ${latencyMs}ms`);
        
        return {
          content: completion.choices[0].message.content || '',
          provider: 'openai',
          latencyMs,
          tokenCount: completion.usage?.total_tokens
        };
      } catch (openaiError) {
        log('All providers failed', {
          cerebrasError,
          bedrockError,
          openaiError
        });
        
        // All providers failed
        throw new Error(`All LLM providers failed. Last error: ${openaiError}`);
      }
    }
  }
}

/**
 * Stream content generation (Cerebras-specific for high-speed streaming)
 * Falls back to non-streaming if provider doesn't support it
 */
export async function streamContent(options: GenerateContentOptions): Promise<AsyncIterableIterator<string>> {
  // For now, we'll use non-streaming generation and convert to a stream
  // Future enhancement: Implement true streaming for supported providers
  const response = await generateContent(options);
  
  async function* generateChunks() {
    // Simulate streaming by yielding chunks of the response
    const chunkSize = 50; // Characters per chunk
    for (let i = 0; i < response.content.length; i += chunkSize) {
      yield response.content.slice(i, i + chunkSize);
      // Small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  
  return generateChunks();
}

// Export as default for backward compatibility
export const cerebras = {
  generateContent,
  streamContent
};