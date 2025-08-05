import { NextRequest } from 'next/server';
import { invokeClaude, formatClaudeResponse, ClaudeMessage } from '@/libs/bedrock-claude';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  console.log('[generate-follow-up-content] API route called');
  
  try {
    const { question, section, userData, whitepaperContent, previousContent } = await req.json();
    
    console.log('[generate-follow-up-content] Processing question:', question);
    console.log('[generate-follow-up-content] Section:', section);

    const systemPrompt = `# TimeBack Education Expert

You are a TimeBack education expert helping parents understand how TimeBack can benefit their child. Generate helpful, informative responses based on the TimeBack white paper content.

## Response Guidelines

- **Tone**: Educational, helpful, and encouraging without being salesy
- **Content**: Based on facts from the white paper, personalized to the user's context
- **Format**: Clear paragraphs with specific examples and data points
- **Length**: 2-3 paragraphs that directly answer the question
- **Personalization**: Reference the user's school, grade, or interests when relevant

## Important Rules

- Never use hyphens in your response
- Focus on educational value and helping parents understand
- Use specific data and examples from the white paper
- Keep responses neutral and informative
- Address the parent directly when appropriate`;

    const userPrompt = `<white_paper_content>
${whitepaperContent || 'TimeBack enables students to learn 2x faster in just 2 hours per day through AI-powered personalized learning'}
</white_paper_content>

<user_context>
<name>${userData.name || 'Parent'}</name>
<school>${userData.school?.name || 'Local school'} in ${userData.school?.city || 'your area'}, ${userData.school?.state || 'USA'}</school>
<grade>${userData.studentGrade || 'K-12'}</grade>
<interests>${userData.interests?.join(', ') || 'various subjects'}</interests>
</user_context>

<section_context>
Current section: ${section}
Previous content shown: ${previousContent || 'Initial explanation'}
</section_context>

<user_question>
${question}
</user_question>

Please provide a helpful, educational response that answers this question based on TimeBack's approach and benefits. Focus on being informative and neutral rather than promotional.`;

    // Create a TransformStream for streaming
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start the streaming response
    const response = new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

    // Generate content with Bedrock Claude and simulate streaming
    const messages: ClaudeMessage[] = [
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
      } catch (error) {
        console.error('[generate-follow-up-content] Streaming error:', error);
        await writer.write(encoder.encode(`data: ${JSON.stringify({ error: 'Streaming error occurred' })}\n\n`));
      } finally {
        await writer.close();
      }
    }).catch(async (error) => {
      console.error('[generate-follow-up-content] Error:', error);
      await writer.write(encoder.encode(`data: ${JSON.stringify({ error: 'Failed to generate content' })}\n\n`));
      await writer.close();
    });

    return response;
  } catch (error) {
    console.error('[generate-follow-up-content] Error:', error);
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