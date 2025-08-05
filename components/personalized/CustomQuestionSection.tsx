'use client';

import React, { useState } from 'react';
import SchemaResponseRenderer from '@/components/SchemaResponseRenderer';

interface CustomQuestionSectionProps {
  quizData: any;
  interests?: string[];
  gradeLevel?: string;
  learningGoals?: string[];
  preGeneratedContent?: any;
  onLearnMore?: () => void;
}

export default function CustomQuestionSection({ 
  quizData, 
  interests,
  gradeLevel
}: CustomQuestionSectionProps) {
  const [question, setQuestion] = useState('');
  const [schemaResponse, setSchemaResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;
    
    const currentQuestion = question.trim();
    console.log('[CustomQuestionSection] Processing question with schema format:', currentQuestion);
    setIsLoading(true);
    setSchemaResponse(null);
    
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
          interests: quizData?.kidsInterests || interests,
          responseFormat: 'schema',
          quizData: {
            ...quizData,
            previousContent: previousContentSummary
          },
          gradeLevel: gradeLevel,
          messageHistory: conversationHistory,
          context: {
            parentType: quizData?.parentSubType,
            school: quizData?.selectedSchools?.[0]?.name,
            numberOfKids: quizData?.numberOfKids,
            selectedSchools: quizData?.selectedSchools,
            kidsInterests: quizData?.kidsInterests || interests,
            previousContent: previousContentSummary
          }
        }),
      });

      const data = await response.json();
      
      if (data.success && data.responseFormat === 'schema') {
        console.log('[CustomQuestionSection] Got schema response:', data.response);
        setSchemaResponse(data.response);
        
        // Add to conversation history
        const newHistory = [
          ...conversationHistory,
          { role: 'user' as const, content: currentQuestion },
          { role: 'assistant' as const, content: JSON.stringify(data.response) }
        ];
        setConversationHistory(newHistory);
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
          next_options: ['Tell me about TimeBack results', 'How does the daily schedule work?', 'What about my child\'s specific interests?']
        };
        setSchemaResponse(fallbackResponse);
        
        // Add to conversation history
        const newHistory = [
          ...conversationHistory,
          { role: 'user' as const, content: currentQuestion },
          { role: 'assistant' as const, content: data.response }
        ];
        setConversationHistory(newHistory);
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
      
      // Add detailed error to conversation history for debugging
      const newHistory = [
        ...conversationHistory,
        { role: 'user' as const, content: currentQuestion },
        { role: 'assistant' as const, content: `${errorMessage} (Error: ${error instanceof Error ? error.message : 'Unknown error'})` }
      ];
      setConversationHistory(newHistory);
      
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
      setQuestion(''); // Clear the question input after submission
    }
  };

  const handleNextOptionClick = (option: string) => {
    console.log('[CustomQuestionSection] Next option clicked:', option);
    setQuestion(option);
  };

  return (
    <section className="max-w-7xl mx-auto py-16 px-6 lg:px-12">
      {/* Simple Question Input */}
      <div className="backdrop-blur-md bg-white/10 rounded-xl p-8 border-2 border-timeback-primary mb-8">
        <h2 className="text-3xl font-bold text-timeback-primary font-cal mb-4">
          Have a Specific Question?
        </h2>
        <p className="text-lg text-timeback-primary opacity-75 font-cal mb-6">
          Ask anything about TimeBack and get a personalized answer based on your child&apos;s needs.
        </p>
        
        <form onSubmit={handleQuestionSubmit} className="space-y-4">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask me anything about TimeBack..."
            className="w-full px-6 py-4 bg-white border-2 border-timeback-primary rounded-xl text-timeback-primary placeholder-timeback-primary/50 focus:ring-2 focus:ring-timeback-primary focus:border-transparent outline-none font-cal text-lg shadow-lg"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            className="w-full bg-timeback-primary text-white px-6 py-4 rounded-xl font-bold hover:bg-timeback-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl font-cal text-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Getting your personalized answer...
              </div>
            ) : (
              'Get My Personalized Answer'
            )}
          </button>
        </form>

        {/* Schema Response Display */}
        {(schemaResponse || isLoading) && (
          <div className="mt-8 bg-white rounded-xl p-6 border border-timeback-primary shadow-lg">
            <h3 className="text-xl font-bold text-timeback-primary mb-4 font-cal">Your Personalized Answer:</h3>
            <SchemaResponseRenderer 
              response={schemaResponse}
              onNextOptionClick={handleNextOptionClick}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </section>
  );
}