import OpenAI from 'openai';

// Cerebras client configuration
const cerebrasClient = new OpenAI({
  apiKey: process.env.CEREBRAS_API_KEY || '',
  baseURL: 'https://api.cerebras.ai/v1',
});

interface SendCerebrasOptions {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

// Use this to make a call to Cerebras Llama 4 Scout model
export const sendCerebras = async ({
  messages,
  maxTokens = 65536,
  temperature = 0.2,
  stream = false
}: SendCerebrasOptions) => {
  console.log('[Cerebras] Request >>>');
  messages.forEach((m) =>
    console.log(' - ' + m.role.toUpperCase() + ': ' + m.content.substring(0, 100) + '...')
  );

  try {
    if (stream) {
      // Streaming response
      console.log('[Cerebras] Using streaming mode');
      const streamResponse = await cerebrasClient.chat.completions.create({
        model: 'llama-4-scout-17b-16e-instruct',
        messages,
        max_completion_tokens: maxTokens,
        temperature,
        top_p: 1,
        stream: true,
      });

      return streamResponse;
    } else {
      // Non-streaming response
      const response = await cerebrasClient.chat.completions.create({
        model: 'llama-4-scout-17b-16e-instruct',
        messages,
        max_completion_tokens: maxTokens,
        temperature,
        top_p: 1,
        stream: false,
      });

      const answer = response.choices[0]?.message?.content || '';
      const usage = response.usage;

      console.log('[Cerebras] Response >>>', answer.substring(0, 100) + '...');
      console.log(
        '[Cerebras] TOKENS USED: ' +
          usage?.total_tokens +
          ' (prompt: ' +
          usage?.prompt_tokens +
          ' / response: ' +
          usage?.completion_tokens +
          ')'
      );
      console.log('\n');

      return answer;
    }
  } catch (error) {
    console.error('[Cerebras] Error:', error);
    return null;
  }
};

// Legacy function name for backward compatibility
export const sendOpenAi = async (
  messages: any[],
  userId: number,
  max = 65536,
  temp = 1
) => {
  console.log('[Legacy] sendOpenAi called, redirecting to Cerebras');
  return sendCerebras({
    messages,
    maxTokens: max,
    temperature: temp,
    stream: false
  });
};
