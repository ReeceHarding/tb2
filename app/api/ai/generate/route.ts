
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { safeBedrockAPI } from '@/libs/bedrock-helpers';

const log = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[AI-GENERATE-API] ${timestamp} ${message}`, data || '');
};

const cerebrasClient = new OpenAI({
  apiKey: process.env.CEREBRAS_API_KEY || '',
  baseURL: 'https://api.cerebras.ai/v1',
});

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

interface GenerateContentOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

interface GenerateContentResponse {
  content: string;
  provider: 'cerebras' | 'bedrock' | 'openai';
  latencyMs: number;
  tokenCount?: number;
}

async function generateContent(options: GenerateContentOptions): Promise<GenerateContentResponse> {
  const startTime = Date.now();
  
  log('Starting content generation with options:', {
    promptLength: options.prompt.length,
    maxTokens: options.maxTokens,
    temperature: options.temperature,
  });

  try {
    log('Attempting generation with Cerebras (direct API)...');
    
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

    const completion = await response.json();

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
          stream: false,
        });

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    log('Received request with body:', body);

    const { prompt, maxTokens, temperature, systemPrompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const result = await generateContent({ prompt, maxTokens, temperature, systemPrompt });

    return NextResponse.json(result);
  } catch (error) {
    log('API route error', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to generate content', details: errorMessage }, { status: 500 });
  }
}
