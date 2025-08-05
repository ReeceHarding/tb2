import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

// Initialize Bedrock client with environment variables
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence: null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export async function invokeClaude(
  messages: ClaudeMessage[],
  options: {
    maxTokens?: number;
    temperature?: number;
    system?: string;
  } = {}
): Promise<ClaudeResponse> {
  const {
    maxTokens = 1024,
    temperature = 0.7,
    system
  } = options;

  const requestBody: any = {
    anthropic_version: "bedrock-2023-05-31",
    messages,
    max_tokens: maxTokens,
    temperature
  };

  if (system) {
    requestBody.system = system;
  }

  try {
    const command = new InvokeModelCommand({
      modelId: "us.anthropic.claude-3-7-sonnet-20250219-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(requestBody)
    });

    const response = await bedrockClient.send(command);
    
    if (!response.body) {
      throw new Error('No response body from Bedrock');
    }

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return responseBody;
  } catch (error) {
    console.error('Bedrock Claude API Error:', error);
    throw new Error(`Bedrock Claude API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to format Anthropic-style response for compatibility
export function formatClaudeResponse(response: ClaudeResponse): string {
  if (response.content && response.content.length > 0) {
    return response.content[0].text;
  }
  throw new Error('Invalid Claude response format');
}