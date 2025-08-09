// Removed Bedrock imports - using Cerebras directly

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  console.log('[chat-learn-more] Processing streaming chat request');

  try {
    const { messages, section, quizData, sectionContent } = await request.json();
    
    console.log('[chat-learn-more] Section:', section);
    console.log('[chat-learn-more] Messages count:', messages?.length || 0);
    console.log('[chat-learn-more] Quiz data keys:', Object.keys(quizData || {}));

    // Build comprehensive context for the AI assistant
    const userContext = `
USER CONTEXT:
- User Type: ${quizData?.userType || 'Not specified'}
- Parent Sub-type: ${quizData?.parentSubType || 'Not specified'}
- Number of Kids: ${quizData?.numberOfKids || 'Not specified'}
- Kids Interests: ${quizData?.kidsInterests?.join(', ') || 'Not specified'}
- Learning Goals: ${quizData?.learningGoals?.join(', ') || 'Not specified'}
- Selected Schools: ${quizData?.selectedSchools?.map((s: any) => `${s.name} (${s.city}, ${s.state})`).join(', ') || 'Not specified'}

SECTION CONTEXT:
- Current Section: ${section}
- Section Content: ${sectionContent || 'General TimeBack education information'}
`;

    const sectionDescriptions: Record<string, string> = {
      'school-performance': 'School performance data showing how TimeBack students achieve 99th percentile results compared to traditional schools',
      'timeback-intro': 'Introduction to how TimeBack AI tutoring works with personalized learning',
      'subject-examples': 'How TimeBack connects student interests to academic subjects like math, science, and English through personalized examples',
      'learning-science': 'The research foundation behind TimeBack\'s mastery-based learning approach and spaced repetition methods',
      'competitors': 'Comparison between TimeBack and other educational approaches like Khan Academy, ChatGPT, and traditional tutoring',
      'afternoon-activities': 'How students can maximize their free time with saved hours to pursue their interests and passions',
      'timeback-vs-competitors': 'Detailed comparison between TimeBack and other educational solutions showing why TimeBack\'s approach is superior',
      'speed-comparison': 'Data showing how TimeBack students complete subjects 6-10x faster than traditional school',
      'cta': 'Getting started with TimeBack and next steps for enrollment'
    };

    // Map sections to user intent based on the button they clicked
    const sectionIntents: Record<string, string> = {
      'afternoon-activities': 'The parent wants AI insights on maximizing their child\'s free time and how TimeBack creates more opportunities for pursuing interests.',
      'subject-examples': 'The parent wants AI analysis of how TimeBack\'s personalized learning methods would specifically apply to their child.',
      'learning-science': 'The parent wants AI insights on the research foundation behind TimeBack\'s methods and why they work.',
      'timeback-vs-competitors': 'The parent wants an AI comparison of TimeBack vs other solutions tailored to their specific situation.',
      'school-performance': 'The parent wants to understand how TimeBack\'s performance data applies to their child\'s current school situation.',
      'speed-comparison': 'The parent wants to understand how the time savings would specifically benefit their family.',
      'timeback-intro': 'The parent wants personalized insights about how TimeBack\'s approach would work for their child.'
    };

    const userIntent = sectionIntents[section] || 'The parent wants personalized insights about TimeBack\'s education approach.';

    const systemPrompt = `You are an expert education consultant and parent advisor specializing in TimeBack's personalized AI education platform. You are helping a parent who is viewing information about: ${sectionDescriptions[section] || 'TimeBack education information'}.

${userContext}

SPECIFIC USER INTENT: ${userIntent}

IMPORTANT GUIDELINES:
- Always provide specific, actionable answers tailored to this parent's situation
- Reference their kids' interests, school context, and learning goals when relevant
- Focus on practical implementation, real results, and addressing concerns
- Use data and specific examples when possible
- Be conversational and empathetic - you understand parent concerns
- Never use hyphens or dashes in your responses
- Keep responses concise but comprehensive (2-4 paragraphs max)
- If you don't have specific information, be honest but provide general guidance

CONTEXT ABOUT TIMEBACK:
- AI-powered personalized learning platform
- Students achieve 99th percentile results consistently
- 6-10x faster completion than traditional school (2 hours/day academics)
- Mastery-based learning (90% understanding before advancing)
- Connects to student interests for engagement
- Afternoon activities for real-world application
- Based on Alpha School model with proven results

PRICING INFORMATION:
- When asked about pricing, cost, or how much TimeBack costs, respond with:
  "TimeBack is currently in beta testing phase. We're working on finalizing our pricing structure to ensure it's accessible to all families who want to give their children the best education possible. To be among the first to know when we launch and receive special early access pricing, I encourage you to join our waitlist by clicking the 'Get Started' button on this page. We'll also send you more information about how TimeBack can specifically help your child excel."
- Emphasize the value of getting on the waitlist for early access
- Never quote specific prices or make up pricing information
- Always redirect to the waitlist signup

Answer the parent's questions in a helpful, specific way that addresses their unique situation and concerns.`;

    console.log('[chat-learn-more] System prompt length:', systemPrompt.length);

    // Use Cerebras API for streaming
    const cerebrasUrl = 'https://api.cerebras.ai/v1/chat/completions';
    const cerebrasKey = process.env.CEREBRAS_API_KEY || '';
    
    // Convert messages to Cerebras format
    const cerebrasMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    ];
    
    console.log('[chat-learn-more] Sending to Cerebras...');
    
    const response = await fetch(cerebrasUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cerebrasKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-4-scout-17b-16e-instruct',
        messages: cerebrasMessages,
        max_completion_tokens: 2048,
        temperature: 0.2,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`Cerebras API error: ${response.status}`);
    }
    
    console.log('[chat-learn-more] Streaming response initiated');
    
    // Return streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        if (!reader) {
          controller.close();
          return;
        }
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || '';
                  if (content) {
                    controller.enqueue(encoder.encode(content));
                  }
                } catch (e) {
                  console.error('[chat-learn-more] Parse error:', e);
                }
              }
            }
          }
        } finally {
          controller.close();
        }
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('[chat-learn-more] Error:', error);
    
    return Response.json(
      { 
        success: false, 
        error: 'Failed to process chat request. Please try again.' 
      },
      { status: 500 }
    );
  }
}