import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
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
${whitepaperContent || 'TimeBack enables students to learn 2x the material in just 2 hours per day (≈6x faster learning rate) through AI-powered personalized learning'}
</white_paper_content>

<user_context>
<name>${userData?.name || 'Parent'}</name>
<school>${userData?.school?.name || 'Local school'} in ${userData?.school?.city || 'your area'}, ${userData?.school?.state || 'USA'}</school>
<grade>${userData?.studentGrade || 'K-12'}</grade>
<interests>${userData?.interests?.join(', ') || 'various subjects'}</interests>
</user_context>

<section_context>
Current section: ${section || 'General inquiry'}
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

    // Start streaming response

    // Use Cerebras API for generation
    const cerebrasUrl = 'https://api.cerebras.ai/v1/chat/completions';
    const cerebrasKey = process.env.CEREBRAS_API_KEY || '';
    
    fetch(cerebrasUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cerebrasKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-4-scout-17b-16e-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 1024,
        temperature: 0.2,
        stream: true
      })
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error(`Cerebras API error: ${response.status}`);
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response body reader');
      }
      
      let done = false;
      while (!done) {
        const result = await reader.read();
        done = result.done;
        
        if (result.value) {
          const chunk = decoder.decode(result.value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  await writer.write(encoder.encode(`data: ${JSON.stringify({ text: content })}\n\n`));
                }
              } catch (e) {
                console.error('[generate-follow-up-content] Parse error:', e);
              }
            }
          }
        }
      }
      
      await writer.write(encoder.encode('data: [DONE]\n\n'));
      await writer.close();
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