
import { NextRequest, NextResponse } from 'next/server';

const log = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[AI-GENERATE-API] ${timestamp} ${message}`, data || '');
};

// Cerebras configuration - using direct fetch API for streaming support
const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY || '';
const CEREBRAS_BASE_URL = 'https://api.cerebras.ai/v1';

// Groq configuration (OpenAI-compatible API)
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

interface GenerateContentOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  stream?: boolean;
}

async function generateWithGroq(options: GenerateContentOptions): Promise<{ content: string; provider: string; model: string }> {
  if (!GROQ_API_KEY) {
    log('GROQ_API_KEY is not set; cannot use Groq fallback');
    throw new Error('Groq API key missing');
  }

  const messages: any[] = [];
  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  messages.push({ role: 'user', content: options.prompt });

  const model = 'openai/gpt-oss-120b';

  const resp = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: options.maxTokens || 32766,
      temperature: options.temperature ?? 1,
      stream: false,
      ...(options.systemPrompt ? { response_format: { type: 'json_object' } } : {})
    })
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Groq API error: ${resp.status} - ${errText}`);
  }

  const data = await resp.json();
  const content: string = data?.choices?.[0]?.message?.content || '';
  return { content, provider: 'groq', model };
}

async function* generateContentStream(options: GenerateContentOptions) {
  const startTime = Date.now();
  
  log('Starting content generation with options:', {
    promptLength: options.prompt.length,
    maxTokens: options.maxTokens,
    temperature: options.temperature,
    stream: options.stream,
  });

  try {
    log('Attempting generation with Cerebras llama-4-scout-17b-16e-instruct model...');
    
    const messages: any[] = [];
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: options.prompt });
    
    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CEREBRAS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-4-scout-17b-16e-instruct',
        messages,
        max_completion_tokens: options.maxTokens || 65536,
        temperature: options.temperature ?? 0.2,
        top_p: 1,
        stream: true
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cerebras API error: ${response.status} - ${error}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (!reader) {
      throw new Error('No response body reader available');
    }

    let fullContent = '';
    let done = false;
    while (!done) {
      const result = await reader.read();
      done = result.done || false;
      const value = result.value;
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) {
              fullContent += content;
              yield content;
            }
          } catch (e) {
            // Skip parsing errors for incomplete chunks
          }
        }
      }
    }
    
    const latencyMs = Date.now() - startTime;
    log(`Cerebras streaming generation successful in ${latencyMs}ms`);
    
  } catch (error) {
    log('Cerebras streaming failed', error);
    // Fallback to Groq (non-stream) and emit as a single chunk
    try {
      const { content, provider, model } = await generateWithGroq({ ...options, stream: false });
      log(`Groq fallback (streaming path) succeeded using ${provider}:${model}`);
      if (content) {
        yield content;
        return;
      }
      throw new Error('Groq fallback returned empty content');
    } catch (fallbackErr) {
      log('Groq fallback (streaming path) failed', fallbackErr);
      throw fallbackErr;
    }
  }
}

async function generateContent(options: GenerateContentOptions): Promise<{ content: string; provider: string; model: string }> {
  const startTime = Date.now();
  
  log('Starting non-streaming content generation with options:', {
    promptLength: options.prompt.length,
    maxTokens: options.maxTokens,
    temperature: options.temperature,
  });

  try {
    log('Attempting generation with Cerebras llama-4-scout-17b-16e-instruct model (non-streaming)...');
    
    const messages: any[] = [];
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: options.prompt });
    
    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CEREBRAS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-4-scout-17b-16e-instruct',
        messages,
        max_completion_tokens: options.maxTokens || 65536,
        temperature: options.temperature ?? 0.2,
        top_p: 1,
        stream: false
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
    
    return { content, provider: 'cerebras', model: 'llama-4-scout-17b-16e-instruct' };
  } catch (error) {
    log('Cerebras failed', error);
    // Fallback to Groq
    const { content, provider, model } = await generateWithGroq({ ...options, stream: false });
    log(`Groq fallback (non-stream) succeeded using ${provider}:${model}`);
    return { content, provider, model };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    log('Received request with body:', body);

    const { prompt, maxTokens, temperature, systemPrompt, stream = false } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (stream) {
      // Create a streaming response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of generateContentStream({ prompt, maxTokens, temperature, systemPrompt, stream: true })) {
              controller.enqueue(encoder.encode(chunk));
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Non-streaming response
      const { content, provider, model } = await generateContent({ prompt, maxTokens, temperature, systemPrompt });
      return NextResponse.json({ 
        content, 
        provider,
        model
      });
    }
  } catch (error) {
    log('API route error', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to generate content', details: errorMessage }, { status: 500 });
  }
}
