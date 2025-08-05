// LLM Analytics wrapper for tracking AI responses
import { NextResponse } from 'next/server';

interface LLMAnalyticsData {
  endpoint: string;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  latencyMs: number;
  success: boolean;
  error?: string;
  context?: Record<string, any>;
  responsePreview?: string;
}

// PostHog tracking function
export async function trackLLMUsage(data: LLMAnalyticsData) {
  // Only track on server-side in production
  if (typeof window !== 'undefined' || process.env.NODE_ENV !== 'production') {
    console.log('[LLM Analytics] Would track:', data);
    return;
  }

  try {
    // Import PostHog server-side client
    const { PostHog } = await import('posthog-node');
    const posthog = new PostHog(
      process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
      {
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'
      }
    );

    // Track the LLM event
    posthog.capture({
      distinctId: 'server', // Server-side events
      event: 'llm_api_call',
      properties: {
        ...data,
        timestamp: new Date().toISOString()
      }
    });

    // Ensure the event is sent
    await posthog.shutdown();
  } catch (error) {
    console.error('[LLM Analytics] Failed to track event:', error);
  }
}

// Wrapper for timing API calls
export async function withLLMTracking<T>(
  endpoint: string,
  model: string,
  apiCall: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  const startTime = Date.now();
  let success = true;
  let error: string | undefined;
  let result: T;

  try {
    result = await apiCall();
    return result;
  } catch (e) {
    success = false;
    error = e instanceof Error ? e.message : String(e);
    throw e;
  } finally {
    const latencyMs = Date.now() - startTime;
    
    // Extract token usage if available
    let promptTokens: number | undefined;
    let completionTokens: number | undefined;
    let totalTokens: number | undefined;
    let responsePreview: string | undefined;

    if (result && typeof result === 'object') {
      // Anthropic response format
      if ('usage' in result) {
        const usage = (result as any).usage;
        promptTokens = usage?.input_tokens;
        completionTokens = usage?.output_tokens;
        totalTokens = (promptTokens || 0) + (completionTokens || 0);
      }
      
      // OpenAI/Vercel AI response format
      if ('usage' in result) {
        const usage = (result as any).usage;
        promptTokens = usage?.prompt_tokens || promptTokens;
        completionTokens = usage?.completion_tokens || completionTokens;
        totalTokens = usage?.total_tokens || totalTokens;
      }

      // Get response preview
      if ('content' in result && Array.isArray((result as any).content)) {
        const content = (result as any).content[0];
        if (content?.text) {
          responsePreview = content.text.substring(0, 100) + '...';
        }
      } else if ('text' in result) {
        responsePreview = (result as any).text.substring(0, 100) + '...';
      }
    }

    // Track the analytics
    await trackLLMUsage({
      endpoint,
      model,
      promptTokens,
      completionTokens,
      totalTokens,
      latencyMs,
      success,
      error,
      context,
      responsePreview
    });
  }
}

// Utility to extract model name from various formats
export function extractModelName(model: any): string {
  if (typeof model === 'string') return model;
  if (model?.modelId) return model.modelId;
  if (model?.model) return model.model;
  return 'unknown';
}