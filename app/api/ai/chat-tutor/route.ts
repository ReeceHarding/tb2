import { NextRequest } from 'next/server';
import { trackLLMUsage } from '@/libs/llm-analytics';
import { invokeClaude, formatClaudeResponse, ClaudeMessage } from '@/libs/bedrock-claude';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  console.log('[chat-tutor] API route called');
  
  try {
    const { question, interests = [], subject, gradeLevel, context, messageHistory } = await req.json();
    
    console.log('[chat-tutor] Processing question:', question);
    console.log('[chat-tutor] Context:', context);

    let systemPrompt = '';
    let userPrompt = '';

    if (context === 'timeback-whitepaper') {
      // Chatbot context
      systemPrompt = `You are a helpful TimeBack education assistant. Answer questions about TimeBack's educational approach based on the white paper content.

Key facts about TimeBack:
- Students learn 2x faster in just 2 hours per day
- AI-powered personalized learning with 1:1 tutoring
- Students consistently score in the top 1% nationally
- Mastery-based learning requiring 90% proficiency before advancement
- No traditional teachers, instead "Guides" who motivate and support
- Afternoons free for life skills and passion projects

Be helpful, informative, and educational. Focus on explaining how TimeBack works and its benefits.`;
      
      userPrompt = question;
    } else {
      // Regular tutor context  
      systemPrompt = `You are a helpful AI tutor helping a ${gradeLevel || 'student'} who is interested in ${interests.join(', ') || 'various topics'}.

🚫 CRITICAL RULE: NEVER GIVE AWAY THE ANSWER! NEVER SOLVE THE PROBLEM FOR THEM!

You are a GUIDE, not a problem solver. Your job is to help students think through problems step by step without giving away solutions.

ALWAYS follow these strict guidelines:
1. 🚫 NEVER provide the final answer or solution
2. 🚫 NEVER do calculations for them
3. 🚫 NEVER give away what the answer should be
4. ✅ Ask guiding questions to help them think
5. ✅ Give hints about what concept or method to use
6. ✅ Help them break the problem into smaller steps
7. ✅ Point them toward the right approach or formula
8. ✅ Encourage them when they're on the right track
9. ✅ Help them identify what information they have vs what they need
10. ✅ Connect to their interests to make it engaging

EXAMPLES:
❌ BAD: "The answer is 73. LeBron made 73% of 582 shots, so 582 × 0.73 = 425 shots."
✅ GOOD: "Great question about LeBron! When we want to find a percentage of something, what operation do you think we'd use? What does 73% mean as a decimal?"

❌ BAD: "You need to multiply 582 by 0.73 to get 425."
✅ GOOD: "You've got the right numbers! Now, when finding 73% of 582 shots, think about what 73% means. Have you learned how to convert percentages to decimals?"

Keep responses encouraging, age-appropriate, and focused on guiding their thinking process.`;

      userPrompt = `The student is asking about ${subject || 'a subject'}: "${question}"
${context ? `\nContext: ${JSON.stringify(context)}` : ''}`;
    }

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const response = new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

    // Track start time for analytics
    const startTime = Date.now();
    
    // Generate with Bedrock Claude and simulate streaming
    const messages: ClaudeMessage[] = [
      ...(messageHistory || []).map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user',
        content: userPrompt
      }
    ];

    invokeClaude(messages, {
      maxTokens: 1024,
      temperature: 0.7,
      system: systemPrompt
    }).then(async (response) => {
      try {
        const fullText = formatClaudeResponse(response);
        
        // Simulate streaming by sending text in chunks
        const chunkSize = 5; // Words per chunk
        const words = fullText.split(' ');
        
        for (let i = 0; i < words.length; i += chunkSize) {
          const chunk = words.slice(i, i + chunkSize).join(' ') + ' ';
          await writer.write(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
          // Add small delay to simulate streaming
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        await writer.write(encoder.encode('data: [DONE]\n\n'));
        
        // Track successful completion
        await trackLLMUsage({
          endpoint: 'chat-tutor',
          model: 'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
          latencyMs: Date.now() - startTime,
          success: true,
          context: {
            gradeLevel,
            interests,
            messagesCount: messageHistory?.length || 0,
            isStreaming: true,
            inputTokens: response.usage.input_tokens,
            outputTokens: response.usage.output_tokens
          }
        });
      } catch (error) {
        console.error('[chat-tutor] Streaming error:', error);
        await writer.write(encoder.encode(`data: ${JSON.stringify({ error: 'Streaming error occurred' })}\n\n`));
        
        // Track error
        await trackLLMUsage({
          endpoint: 'chat-tutor',
          model: 'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
          latencyMs: Date.now() - startTime,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          context: {
            gradeLevel,
            interests,
            messagesCount: messageHistory?.length || 0,
            isStreaming: true
          }
        });
      } finally {
        await writer.close();
      }
    }).catch(async (error) => {
      console.error('[chat-tutor] Error:', error);
      await writer.write(encoder.encode(`data: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`));
      await writer.close();
    });

    return response;
  } catch (error) {
    console.error('[chat-tutor] Error:', error);
    return new Response(
      `data: ${JSON.stringify({ error: 'Failed to process request' })}\n\n`,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/event-stream',
        },
      }
    );
  }
}