'use client';

import React, { useState, useEffect, useRef } from 'react';
import SchemaResponseRenderer from '@/components/SchemaResponseRenderer';
import { smoothScrollToElement } from '@/lib/utils';
import { AnimatedHeading } from '@/components/AnimatedHeading';

// Fast animation config for under 2 seconds total completion
const fastAnimationConfig = {
  typingSpeed: 15,
  deletingSpeed: 10,
  pauseDuration: 300
};

interface CustomQuestionSectionProps {
  interests?: string[];
  gradeLevel?: string;
  learningGoals?: string[];
  preGeneratedContent?: any;
  onLearnMore?: () => void;
}

export default function CustomQuestionSection({ 
  interests,
  gradeLevel,
  preGeneratedContent
}: CustomQuestionSectionProps) {
  // Question input removed - replaced with predefined button options only
  const [schemaResponse, setSchemaResponse] = useState<any>(null);
  const [schemaResponses, setSchemaResponses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [isGeneratingFollowUps, setIsGeneratingFollowUps] = useState(false);
  
  // Fixed hook usage - move useRef to top level
  const autoSubmittedRef = useRef(false);
  
  // Fast animations - no more typewriter hooks
  
  // Auto-submit preGenerated question if provided
  useEffect(() => {
    // Re-enable auto-submit for the INITIAL schema answer only (non-follow-up),
    // so clicking a hero question shows content immediately without generating follow-ups.
    if (preGeneratedContent?.autoSubmit && preGeneratedContent?.question && !isLoading && schemaResponses.length === 0 && !autoSubmittedRef.current) {
      // Guard: if an external response was already provided by the parent page (hero or follow-up form),
      // do NOT auto-submit again to avoid duplicate answers (which showed up as an extra "Follow-up Answer").
      const hasExternalResponse = typeof window !== 'undefined' && (
        (window as any).heroQuestionResponse || (window as any).followUpQuestionResponse
      );
      if (hasExternalResponse) {
        console.log('[CustomQuestionSection] ⛔ Skipping auto-submit because an external response is present on window');
        return;
      }
      // Strict one-time guard to avoid React Strict Mode double-invocation duplicating the initial response
      autoSubmittedRef.current = true;
      console.log('[CustomQuestionSection] 🤖 AUTO-SUBMITTING preGenerated question (initial answer only):', preGeneratedContent.question);
      handlePredefinedQuestion(preGeneratedContent.question);
    }
  }, [preGeneratedContent, isLoading, schemaResponses.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check for external responses from form submissions
  useEffect(() => {
    const checkExternalResponses = () => {
      console.log('[CustomQuestionSection] Checking for external responses...');
      
      // Check for hero form response
      if ((window as any).heroQuestionResponse && (window as any).heroQuestion) {
        console.log('[CustomQuestionSection] Found external hero response, adding to display');
        const heroResponse = (window as any).heroQuestionResponse;
        const heroQuestion = (window as any).heroQuestion;
        
        setSchemaResponses(prev => {
          // Check if this response is already added
          const existingIndex = prev.findIndex(resp => 
            resp.question === heroQuestion || resp.title === heroResponse.title
          );
          if (existingIndex === -1) {
            console.log('[CustomQuestionSection] Adding hero response - no duplicates found');
            return [...prev, { ...heroResponse, question: heroQuestion }];
          }
          console.log('[CustomQuestionSection] Hero response already exists, skipping duplicate');
          return prev;
        });
        
        // Add to conversation history
        setConversationHistory(prev => {
          const hasQuestion = prev.some(msg => msg.content === heroQuestion);
          if (!hasQuestion) {
            return [
              ...prev,
              { role: 'user' as const, content: heroQuestion },
              { role: 'assistant' as const, content: heroResponse.title || 'Generated response' }
            ];
          }
          return prev;
        });
        
        // Clear from window
        delete (window as any).heroQuestionResponse;
        delete (window as any).heroQuestion;
      }
      
      // Check for follow-up form response
      if ((window as any).followUpQuestionResponse && (window as any).followUpQuestion) {
        console.log('[CustomQuestionSection] Found external follow-up response, adding to display');
        const followUpResponse = (window as any).followUpQuestionResponse;
        const followUpQuestion = (window as any).followUpQuestion;
        
        setSchemaResponses(prev => {
          // Check if this response is already added
          const existingIndex = prev.findIndex(resp => 
            resp.question === followUpQuestion || resp.title === followUpResponse.title
          );
          if (existingIndex === -1) {
            console.log('[CustomQuestionSection] Adding follow-up response - no duplicates found');
            return [...prev, { ...followUpResponse, question: followUpQuestion }];
          }
          console.log('[CustomQuestionSection] Follow-up response already exists, skipping duplicate');
          return prev;
        });
        
        // Add to conversation history
        setConversationHistory(prev => {
          const hasQuestion = prev.some(msg => msg.content === followUpQuestion);
          if (!hasQuestion) {
            return [
              ...prev,
              { role: 'user' as const, content: followUpQuestion },
              { role: 'assistant' as const, content: followUpResponse.title || 'Generated response' }
            ];
          }
          return prev;
        });
        
        // Clear from window
        delete (window as any).followUpQuestionResponse;
        delete (window as any).followUpQuestion;
      }
    };
    
    // Check immediately (only once on mount)
    checkExternalResponses();
    
    // IMPORTANT: Only run once on mount, don't check continuously
    console.log('[CustomQuestionSection] External response check completed - will not run again');
  }, []);

  // Generate follow-up questions for a response
  const generateFollowUpQuestions = async (responseContent: any) => {
    console.log('[CustomQuestionSection] 🔍 GENERATE FOLLOW-UP QUESTIONS CALLED');
    console.log('[CustomQuestionSection] Response content:', responseContent);
    console.log('[CustomQuestionSection] Current schemaResponses length:', schemaResponses.length);
    console.log('[CustomQuestionSection] Conversation history length:', conversationHistory.length);
    
    setIsGeneratingFollowUps(true);
    try {
      // Get the most recent question and answer for context
      const mostRecentQuestion = conversationHistory.length >= 2 
        ? conversationHistory[conversationHistory.length - 2]?.content 
        : '';
      const mostRecentAnswer = conversationHistory.length >= 1 
        ? conversationHistory[conversationHistory.length - 1]?.content 
        : responseContent;

      // Build comprehensive context like chat-tutor does
      const requestBody = {
        // Legacy format for backward compatibility
        sectionId: 'custom-question',
        sectionContent: responseContent,
        userContext: {
          interests: interests,
          gradeLevel: gradeLevel
        },
        clickedQuestions: [] as string[], // Could be enhanced to track clicked questions in state
        
        // New comprehensive context (same as chat-tutor)
        messageHistory: conversationHistory,
        quizData: {
          childGrade: gradeLevel,
          kidsInterests: interests,
          learningGoals: [] as string[], // Could be passed from parent if available
          mainConcerns: ['academic achievement'], // Default concern
          selectedSchools: [] as any[], // Could be passed from parent if available
          userFirstName: 'Parent', // Could be passed from parent if available
          previousContent: conversationHistory.length > 0 
            ? conversationHistory.map((msg, index) => 
                `${msg.role === 'user' ? 'Q' : 'A'}${Math.floor(index/2) + 1}: ${msg.content}`
              ).join('\n')
            : 'No previous interactions'
        },
        userData: {
          userId: 'anonymous', // Could be enhanced with actual user ID
          childGrade: gradeLevel,
          interests: interests
        },
        interests: interests,
        gradeLevel: gradeLevel,
        context: 'schema-generation',
        
        // Current exchange context
        currentQuestion: mostRecentQuestion,
        currentAnswer: typeof responseContent === 'object' 
          ? responseContent.description || JSON.stringify(responseContent)
          : responseContent,
        
        // Additional context for follow-up generation
        question: mostRecentQuestion
      };

      console.log('[CustomQuestionSection] 📤 Sending comprehensive context to follow-up API:', {
        messageHistoryLength: conversationHistory.length,
        hasCurrentQuestion: !!mostRecentQuestion,
        hasCurrentAnswer: !!mostRecentAnswer,
        gradeLevel: gradeLevel,
        interests: interests
      });

      const response = await fetch('/api/ai/generate-follow-up-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('[CustomQuestionSection] 📋 Follow-up questions API response:', data);
      
      if (data.questions && Array.isArray(data.questions)) {
        console.log('[CustomQuestionSection] ✅ Prepared follow-up questions (will display buttons; no auto-answers)');
        setFollowUpQuestions(data.questions.slice(0, 3));
        console.log('[CustomQuestionSection] 🔒 Follow-up questions ready - only rendered after user clicks follow-up');
      } else {
        console.log('[CustomQuestionSection] ❌ No valid follow-up questions received');
        // Fallback to generic questions if API fails
        setFollowUpQuestions([
          "How would this approach work specifically for my child's situation?",
          "What evidence supports these methods for students like mine?",
          "What would be the next step to learn more about implementation?"
        ]);
      }
    } catch (error) {
      console.error('[CustomQuestionSection] ❌ Error generating follow-up questions:', error);
      // Fallback to generic questions on error
      setFollowUpQuestions([
        "How would this approach work specifically for my child's situation?",
        "What evidence supports these methods for students like mine?",
        "What would be the next step to learn more about implementation?"
      ]);
    } finally {
      setIsGeneratingFollowUps(false);
      console.log('[CustomQuestionSection] 🏁 Follow-up question generation completed');
    }
  };

  // Handler for regenerating responses with different styles
  const handleRegenerateResponse = async (originalResponse: any, type: 'evidence' | 'simpler' | 'different', responseIndex: number) => {
    console.log('[CustomQuestionSection] 🔄 REGENERATING RESPONSE:', { type, responseIndex, originalResponse });
    
    if (isLoading) {
      console.log('[CustomQuestionSection] ❌ Already loading, ignoring regenerate request');
      return;
    }

    setIsLoading(true);

    // Create modified question based on regeneration type
    let modifiedQuestion = originalResponse.question || 'Please regenerate this response';
    
    switch (type) {
      case 'evidence':
        modifiedQuestion += ' (Please provide more evidence and specific data from research. MANDATORY: Use \\n\\n for paragraph breaks between different concepts to improve readability.)';
        break;
      case 'simpler':
        modifiedQuestion += ' (Please use simpler language and explain concepts more basically. MANDATORY: Use \\n\\n for paragraph breaks between different concepts to improve readability. Break long explanations into digestible paragraphs.)';
        break;
      case 'different':
        modifiedQuestion += ' (Please provide a different approach or perspective. MANDATORY: Use \\n\\n for paragraph breaks between different concepts to improve readability.)';
        break;
    }

    try {
      console.log('[CustomQuestionSection] 📤 Sending regeneration request with modified question:', modifiedQuestion);

      const requestBody = {
        question: modifiedQuestion,
        userContext: {
          interests: interests || [],
          gradeLevel: gradeLevel || '',
          learningGoals: [] as string[]
        },
        conversationHistory: conversationHistory,
        responseFormat: 'schema'
      };

      const response = await fetch('/api/ai/chat-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.success && data.response) {
        console.log('[CustomQuestionSection] ✅ Got regenerated response, replacing at index:', responseIndex);
        
        // Replace the response at the specific index
        setSchemaResponses(prev => {
          const newArray = [...prev];
          newArray[responseIndex] = { ...data.response, question: modifiedQuestion };
          return newArray;
        });

        // Update conversation history
        setConversationHistory(prev => [
          ...prev,
          { role: 'user' as const, content: modifiedQuestion },
          { role: 'assistant' as const, content: data.response.main_heading || 'Regenerated response' }
        ]);

      } else {
        console.error('[CustomQuestionSection] ❌ Failed to regenerate response:', data);
      }
    } catch (error) {
      console.error('[CustomQuestionSection] ❌ Error regenerating response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for custom follow-up questions
  const handleCustomQuestion = async (question: string) => {
    console.log('[CustomQuestionSection] 🔍 CUSTOM QUESTION SUBMITTED:', question);
    
    if (isLoading) {
      console.log('[CustomQuestionSection] ❌ Already loading, ignoring custom question');
      return;
    }

    // Use the existing handlePredefinedQuestion logic
    await handlePredefinedQuestion(question);
  };

  // Predefined questions for button options
  const predefinedQuestions = [
    "What makes TimeBack different from traditional schools?",
    "How does the 2-hour learning work?", 
    "What do kids do with their extra time?",
    "How much does TimeBack cost?",
    "Can my child transfer credits?",
    "Is TimeBack accredited?",
    "What grade levels does TimeBack offer?",
    "How does personalized learning work?",
    "What if my child needs help?",
    "When can my child start?"
  ];

  const handlePredefinedQuestion = async (selectedQuestion: string) => {
    if (isLoading) return;
    
    const currentQuestion = selectedQuestion;
    console.log('[CustomQuestionSection] Processing question with schema format:', currentQuestion);
    setIsLoading(true);
    setSchemaResponse(null);
    
    // Smooth scroll to the loading state that will appear
    const loadingId = `custom-response-loading-${schemaResponses.length}`;
    console.log(`[CustomQuestionSection] Scrolling to loading state: ${loadingId}`);
    smoothScrollToElement(loadingId, 100, 'smooth', () => {
      console.log(`[CustomQuestionSection] Scroll completed to loading state`);
    });
    
    // Create previous content summary for context
    const previousContentSummary = conversationHistory.length > 0 
      ? conversationHistory.map((msg, index) => 
          `${msg.role === 'user' ? 'Q' : 'A'}${Math.floor(index/2) + 1}: ${msg.content}`
        ).join('\n')
      : 'No previous interactions';
    
    try {
      const response = await fetch('/api/ai/chat-tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: currentQuestion,
          interests: interests,
          responseFormat: 'schema',
          gradeLevel: gradeLevel,
          messageHistory: conversationHistory,
          context: {
            interests: interests,
            previousContent: previousContentSummary
          }
        }),
      });

      const data = await response.json();
      console.log('[CustomQuestionSection] 🔍 FULL API RESPONSE:', data);
      console.log('[CustomQuestionSection] 🔍 API Response keys:', Object.keys(data));
      console.log('[CustomQuestionSection] 🔍 Response format:', data.responseFormat);
      console.log('[CustomQuestionSection] 🔍 Success flag:', data.success);
      console.log('[CustomQuestionSection] 🔍 Schema response data:', data.response);
      
      if (data.success && data.responseFormat === 'schema') {
        console.log('[CustomQuestionSection] ✅ Got schema response, processing...');
        console.log('[CustomQuestionSection] 🎯 Schema response structure:', JSON.stringify(data.response, null, 2));
        setSchemaResponse(data.response);
        const newResponseIndex = schemaResponses.length;
        console.log('[CustomQuestionSection] 📝 Adding response to array, new index:', newResponseIndex);
        setSchemaResponses(prev => {
          const newArray = [...prev, data.response];
          console.log('[CustomQuestionSection] 📊 Updated responses array length:', newArray.length);
          console.log('[CustomQuestionSection] 📊 Last response in array:', newArray[newArray.length - 1]);
          return newArray;
        });
        
        // Add to conversation history
        const newHistory = [
          ...conversationHistory,
          { role: 'user' as const, content: currentQuestion },
          { role: 'assistant' as const, content: JSON.stringify(data.response) }
        ];
        setConversationHistory(newHistory);
        
        // Do NOT auto-generate follow-up questions. Wait for explicit user action.
        
        // Smooth scroll to the newly generated response
        const responseId = `custom-response-${newResponseIndex}`;
        console.log(`[CustomQuestionSection] Scrolling to new response: ${responseId}`);
        smoothScrollToElement(responseId, 100, 'smooth', () => {
          console.log(`[CustomQuestionSection] Scroll completed for response ${newResponseIndex}`);
        });
      } else if (data.success) {
        console.log('[CustomQuestionSection] Got plain text, creating fallback schema');
        const fallbackResponse = {
          header: 'TIMEBACK | PERSONALIZED ANSWER',
          main_heading: 'Your Question Answered',
          description: data.response,
          key_points: [
            { label: 'Key Insight', description: 'Based on your specific situation and interests' },
            { label: 'Personalized Approach', description: 'Tailored to your child\'s needs' },
            { label: 'Next Steps', description: 'Ready to learn more about TimeBack?' }
          ],
          next_options: ['What are TimeBack results?', 'How does scheduling work?', 'What about child interests?']
        };
        setSchemaResponse(fallbackResponse);
        const newResponseIndex = schemaResponses.length;
        setSchemaResponses(prev => [...prev, fallbackResponse]);
        
        // Add to conversation history
        const newHistory = [
          ...conversationHistory,
          { role: 'user' as const, content: currentQuestion },
          { role: 'assistant' as const, content: data.response }
        ];
        setConversationHistory(newHistory);
        
        // Do NOT auto-generate follow-up questions. Wait for explicit user action.
        
        // Smooth scroll to the newly generated response
        const responseId = `custom-response-${newResponseIndex}`;
        console.log(`[CustomQuestionSection] Scrolling to fallback response: ${responseId}`);
        smoothScrollToElement(responseId, 100, 'smooth', () => {
          console.log(`[CustomQuestionSection] Scroll completed for fallback response ${newResponseIndex}`);
        });
      } else {
        throw new Error(data.error || data.validationError || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('[CustomQuestionSection] Error processing question:', error);
      
      // Enhanced error handling with specific error types  
      const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
      const isServerError = error instanceof Error && error.message.includes('500');
      const isTimeoutError = error instanceof Error && error.message.includes('timeout');
      
      let errorResponse;
      let errorMessage = '';
      
      if (isNetworkError) {
        errorMessage = 'Network connection issue - please check your internet and try again.';
        errorResponse = {
          header: 'TIMEBACK | CONNECTION ERROR',
          main_heading: 'Network Connection Issue',
          description: 'Unable to connect to TimeBack AI. Please check your internet connection and try again.',
          key_points: [
            { label: 'Check Connection', description: 'Verify your internet connection is stable' },
            { label: 'Try Again', description: 'Click the button below to retry your question' },
            { label: 'Refresh Page', description: 'If problems persist, try refreshing the page' }
          ],
          next_options: ['Retry my question', 'Check TimeBack basics offline', 'Refresh page']
        };
      } else if (isServerError) {
        errorMessage = 'Server temporarily busy - please try again in a moment.';
        errorResponse = {
          header: 'TIMEBACK | SERVER ERROR',
          main_heading: 'Temporary Service Issue',
          description: 'Our AI service is temporarily experiencing high demand. Please try again in a moment.',
          key_points: [
            { label: 'High Demand', description: 'Many parents are exploring TimeBack right now' },
            { label: 'Try Again Soon', description: 'The service will be back to normal shortly' },
            { label: 'Browse Meanwhile', description: 'Explore our learning approach while you wait' }
          ],
          next_options: ['Try again in a moment', 'Learn about our approach', 'See student results']
        };
      } else {
        errorMessage = 'I apologize, but I encountered an error processing your question. Please try asking again.';
        errorResponse = {
          header: 'TIMEBACK | PROCESSING ERROR',
          main_heading: 'Unexpected Issue Occurred',
          description: 'I apologize, but I encountered an unexpected error while processing your question. Our team has been notified.',
          key_points: [
            { label: 'Automatic Report', description: 'This error has been automatically reported to our team' },
            { label: 'Try Different Question', description: 'Please try asking your question differently' },
            { label: 'Contact Support', description: 'For urgent questions, contact our support team directly' }
          ],
          next_options: ['Ask a different question', 'Learn about TimeBack basics', 'Contact our team']
        };
      }
      
      setSchemaResponse(errorResponse);
      const errorResponseIndex = schemaResponses.length;
      setSchemaResponses(prev => [...prev, errorResponse]);
      
      // Add detailed error to conversation history for debugging
      const newHistory = [
        ...conversationHistory,
        { role: 'user' as const, content: currentQuestion },
        { role: 'assistant' as const, content: `${errorMessage} (Error: ${error instanceof Error ? error.message : 'Unknown error'})` }
      ];
      setConversationHistory(newHistory);
      
      // Smooth scroll to the error response
      const responseId = `custom-response-${errorResponseIndex}`;
      console.log(`[CustomQuestionSection] Scrolling to error response: ${responseId}`);
      smoothScrollToElement(responseId, 100, 'smooth', () => {
        console.log(`[CustomQuestionSection] Scroll completed for error response ${errorResponseIndex}`);
      });
      
      // Track error for analytics
      console.error('[CustomQuestionSection] Error details for analytics:', {
        question: currentQuestion,
        errorType: isNetworkError ? 'network' : isServerError ? 'server' : isTimeoutError ? 'timeout' : 'unknown',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        component: 'CustomQuestionSection'
      });
    } finally {
      setIsLoading(false);
      // Question input removed - no need to clear
    }
  };

  // Listen for in-place regenerate requests from parent (e.g., "Show me the evidence")
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ type: 'evidence' | 'simpler' | 'different'; sectionId?: string }>;
      // If an origin sectionId was provided, only handle it when this instance matches.
      if (custom.detail?.sectionId && preGeneratedContent?.sectionId && custom.detail.sectionId !== preGeneratedContent.sectionId) {
        return;
      }
      if (!schemaResponses.length) return;
      const lastIndex = schemaResponses.length - 1;
      console.log('[CustomQuestionSection] 🔁 In-place regenerate event received:', custom.detail);
      handleRegenerateResponse(schemaResponses[lastIndex], custom.detail.type, lastIndex);
    };
    window.addEventListener('timeback:regenerate-current', handler as EventListener);
    return () => window.removeEventListener('timeback:regenerate-current', handler as EventListener);
  }, [schemaResponses, preGeneratedContent?.sectionId]);

  const handleNextOptionClick = async (option: string) => {
    console.log('[CustomQuestionSection] 🚨 NEXT OPTION CLICKED (THIS SHOULD NOT HAPPEN AUTOMATICALLY)');
    console.log('[CustomQuestionSection] Option clicked:', option);
    console.log('[CustomQuestionSection] Call stack:', new Error().stack);
    
    // PREVENT AUTOMATIC CLICKING - Only allow if user explicitly clicked
    console.log('[CustomQuestionSection] ⚠️ WARNING: Next option click detected - this may be causing the glitch');
    
    // Instead of replacing the question, we submit the option directly
    // This will add a new response below the existing ones
    const currentQuestion = option;
    
    if (isLoading) {
      console.log('[CustomQuestionSection] ❌ Already loading, ignoring next option click');
      return;
    }
    
    // Add additional safeguard - only allow one response at a time
    if (schemaResponses.length >= 2) {
      console.log('[CustomQuestionSection] ❌ Maximum responses reached, preventing automatic follow-up generation');
      return;
    }
    
    setIsLoading(true);
    setSchemaResponse(null); // Clear single response state
    
    // Smooth scroll to the loading state that will appear for next option
    const loadingId = `custom-response-loading-${schemaResponses.length}`;
    console.log(`[CustomQuestionSection] Scrolling to loading state for next option: ${loadingId}`);
    smoothScrollToElement(loadingId, 100, 'smooth', () => {
      console.log(`[CustomQuestionSection] Scroll completed to loading state for next option`);
    });
    
    try {
      const response = await fetch('/api/ai/personalized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion,
          conversationHistory,
          interests,
          gradeLevel,
          source: 'personalized-page',
          requestSchema: true,
          metadata: {
            timestamp: new Date().toISOString(),
            conversationLength: conversationHistory.length
          }
        }),
      });

      const data = await response.json();
      
      if (data.success && data.responseFormat === 'schema') {
        console.log('[CustomQuestionSection] Got schema response for next option:', data.response);
        setSchemaResponse(data.response);
        const newResponseIndex = schemaResponses.length;
        setSchemaResponses(prev => [...prev, data.response]);
        
        // Add to conversation history
        const newHistory = [
          ...conversationHistory,
          { role: 'user' as const, content: currentQuestion },
          { role: 'assistant' as const, content: JSON.stringify(data.response) }
        ];
        setConversationHistory(newHistory);
        
        // Smooth scroll to the newly generated response from next option
        const responseId = `custom-response-${newResponseIndex}`;
        console.log(`[CustomQuestionSection] Scrolling to next option response: ${responseId}`);
        smoothScrollToElement(responseId, 100, 'smooth', () => {
          console.log(`[CustomQuestionSection] Scroll completed for next option response ${newResponseIndex}`);
        });
      }
    } catch (error) {
      console.error('[CustomQuestionSection] Error processing next option:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Response Display */}
      {(() => {
        console.log('[CustomQuestionSection] 🎨 RENDERING RESPONSES - Total count:', schemaResponses.length);
        console.log('[CustomQuestionSection] 🎨 RENDERING RESPONSES - Array:', schemaResponses);
        return schemaResponses.map((response, index) => {
          console.log(`[CustomQuestionSection] 🎨 RENDERING Response ${index}:`, response);
          console.log(`[CustomQuestionSection] 🎨 Response ${index} keys:`, response ? Object.keys(response) : 'null');
          return (
            <div key={index} id={`custom-response-${index}`} className="mt-12 lg:mt-16">
              {/* Response Card with Enhanced Design */}
              <div className="backdrop-blur-md bg-white/15 rounded-3xl border border-timeback-primary/30 shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500">
                {/* Header with Gradient */}
                <div className="relative bg-gradient-to-r from-timeback-primary to-timeback-primary/90 p-6 lg:p-8">
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
                  <div className="relative flex items-center justify-center gap-3">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                    <h3 className="text-lg lg:text-xl font-bold text-white text-center font-cal">
                      {index === 0 ? "Your Personalized Answer" : `Follow-up Answer ${index}`}
                    </h3>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6 lg:p-8">
                  <SchemaResponseRenderer
                    response={response}
                    onNextOptionClick={(option) => {
                      console.log('[CustomQuestionSection] ⚠️ WARNING: Next option clicked from SchemaResponseRenderer:', option);
                      console.log('[CustomQuestionSection] This should NOT happen since hideNextOptions=true');
                      handleNextOptionClick(option);
                    }}
                    isLoading={!response || !response.main_heading || !response.description}
                    hideNextOptions={true}
                    onRegenerateClick={(type) => handleRegenerateResponse(response, type, index)}
                    onCustomQuestionSubmit={(question) => handleCustomQuestion(question)}
                  />
                </div>
              </div>
            </div>
          );
        });
      })()}
      
      {/* Enhanced Loading State */}
      {isLoading && (
        <div id={`custom-response-loading-${schemaResponses.length}`} className="mt-12 lg:mt-16">
          <div className="backdrop-blur-md bg-white/15 rounded-3xl border border-timeback-primary/30 shadow-2xl overflow-hidden animate-pulse">
            {/* Loading Header */}
            <div className="relative bg-gradient-to-r from-timeback-primary to-timeback-primary/90 p-6 lg:p-8">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
              <div className="relative flex items-center justify-center gap-3">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                <h3 className="text-lg lg:text-xl font-bold text-white text-center font-cal">
                  {schemaResponses.length === 0 ? "Your Personalized Answer" : `Follow-up Answer ${schemaResponses.length}`}
                </h3>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            {/* Loading Content */}
            <div className="p-6 lg:p-8">
              <SchemaResponseRenderer
                response={null}
                onNextOptionClick={(option) => {
                  console.log('[CustomQuestionSection] ⚠️ WARNING: Next option clicked from LOADING SchemaResponseRenderer:', option);
                  console.log('[CustomQuestionSection] This should DEFINITELY NOT happen during loading state');
                  handleNextOptionClick(option);
                }}
                isLoading={true}
                hideNextOptions={true}
                onRegenerateClick={() => {}}
                onCustomQuestionSubmit={() => {}}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Enhanced Follow-up Questions Section */}
      {followUpQuestions.length > 0 && schemaResponses.length > 0 && !isLoading && (
        <div className="mt-12 lg:mt-16">
          <div className="backdrop-blur-md bg-white/10 rounded-3xl border border-timeback-primary/30 shadow-2xl overflow-hidden">
            <div className="relative bg-gradient-to-r from-timeback-bg to-timeback-bg/90 p-6 lg:p-8">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
              <div className="relative flex items-center justify-center gap-3">
                <div className="w-2 h-2 bg-timeback-primary/60 rounded-full animate-pulse"></div>
                <h3 className="text-lg lg:text-xl font-bold text-timeback-primary text-center font-cal">
                  Want to learn more? Ask a follow-up question:
                </h3>
                <div className="w-2 h-2 bg-timeback-primary/60 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="p-6 lg:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {followUpQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      console.log('[CustomQuestionSection] 🖱️ Follow-up question clicked:', question);
                      handleCustomQuestion(question);
                    }}
                    className="backdrop-blur-md bg-white/10 border-2 border-timeback-primary rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl group"
                  >
                    <h4 className="text-lg font-bold text-timeback-primary font-cal leading-tight group-hover:text-timeback-primary transition-colors duration-300">
                      {question}
                    </h4>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}