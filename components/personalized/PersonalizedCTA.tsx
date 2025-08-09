'use client';

import React, { useState } from 'react';
import SchemaResponseRenderer from '@/components/SchemaResponseRenderer';
import { QuestionBank, MAIN_QUESTIONS, GENERAL_QUESTIONS } from '@/libs/question-bank';

interface QuizData {
  userType: string;
  parentSubType: string;
  selectedSchools: Array<{
    id: string;
    name: string;
    city: string;
    state: string;
    level: string;
  }>;
  // learningGoals: string[]; - removed
  kidsInterests: string[];
  numberOfKids: number;
}

interface PersonalizedCTAProps {
  quizData: QuizData;
  onLearnMore: (section: string) => void;
}

export default function PersonalizedCTA({ quizData, onLearnMore }: PersonalizedCTAProps) {
  // Question input removed - replaced with predefined button options only
  const [schemaResponse, setSchemaResponse] = useState<any>(null);
  const [schemaResponses, setSchemaResponses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  
  // Predefined questions for button options - using centralized question bank
  const predefinedQuestions = [
    ...QuestionBank.getQuestionTexts('main').slice(0, 3), // First 3 main questions
    ...QuestionBank.getQuestionTexts('general').slice(0, 3) // First 3 general questions
  ];

  console.log('[PersonalizedCTA] Rendering schema-based Q&A section');
  console.log('[PersonalizedCTA] Quiz data:', quizData);
  console.log('[PersonalizedCTA] Conversation history length:', conversationHistory.length);

  const handlePredefinedQuestion = async (selectedQuestion: string) => {
    if (isLoading) return;
    
    const currentQuestion = selectedQuestion;
    console.log('[PersonalizedCTA] Processing question with schema format:', currentQuestion);
    setIsLoading(true);
    setSchemaResponse(null); // Clear previous response
    
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
          interests: quizData.kidsInterests,
          responseFormat: 'schema', // Request schema format
          quizData: {
            ...quizData,
            previousContent: previousContentSummary
          }, // Pass complete quiz data with conversation context
          messageHistory: conversationHistory, // Include conversation history
          context: {
            parentType: quizData.parentSubType,
            school: quizData.selectedSchools[0]?.name,
            numberOfKids: quizData.numberOfKids,
            selectedSchools: quizData.selectedSchools,
            kidsInterests: quizData.kidsInterests,
            previousContent: previousContentSummary
          }
        }),
      });

      const data = await response.json();
      
      if (data.success && data.responseFormat === 'schema') {
        console.log('[PersonalizedCTA] Got schema response:', data.response);
        setSchemaResponse(data.response);
        setSchemaResponses(prev => [...prev, data.response]);
        
        // Add to conversation history
        const newHistory = [
          ...conversationHistory,
          { role: 'user' as const, content: currentQuestion },
          { role: 'assistant' as const, content: JSON.stringify(data.response) }
        ];
        setConversationHistory(newHistory);
        console.log('[PersonalizedCTA] Updated conversation history:', newHistory.length, 'messages');
      } else if (data.success) {
        console.log('[PersonalizedCTA] Got plain text response, creating fallback schema');
        // Fallback: Convert plain text to basic schema format
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
        setSchemaResponses(prev => [...prev, fallbackResponse]);
        
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
      console.error('[PersonalizedCTA] Error processing question:', error);
      
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
      } else if (isTimeoutError) {
        errorMessage = 'Response taking longer than expected - try a simpler question.';
        errorResponse = {
          header: 'TIMEBACK | PROCESSING TIMEOUT',
          main_heading: 'AI Response Taking Too Long',
          description: 'Your question is being processed but is taking longer than expected. This usually means our AI is working extra hard to give you a detailed answer.',
          key_points: [
            { label: 'Complex Question', description: 'Your question requires detailed analysis' },
            { label: 'Try Simpler Version', description: 'Consider asking a more specific question' },
            { label: 'Quick Alternative', description: 'Ask about a specific aspect of TimeBack' }
          ],
          next_options: ['Ask a simpler question', 'How does TimeBack work?', 'What are the results?']
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
      setSchemaResponses(prev => [...prev, errorResponse]);
      
      // Add detailed error to conversation history for debugging
      const newHistory = [
        ...conversationHistory,
        { role: 'user' as const, content: currentQuestion },
        { role: 'assistant' as const, content: `${errorMessage} (Error: ${error instanceof Error ? error.message : 'Unknown error'})` }
      ];
      setConversationHistory(newHistory);
      
      // Track error for analytics
      console.error('[PersonalizedCTA] Error details for analytics:', {
        question: currentQuestion,
        errorType: isNetworkError ? 'network' : isServerError ? 'server' : isTimeoutError ? 'timeout' : 'unknown',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        component: 'PersonalizedCTA'
      });
    } finally {
      setIsLoading(false);
      // Question input removed - no need to clear
    }
  };

  const handleNextOptionClick = async (option: string) => {
    console.log('[PersonalizedCTA] Next option clicked:', option);
    // Instead of replacing the question, we submit the option directly
    // This will add a new response below the existing ones
    const currentQuestion = option;
    
    if (isLoading) return;
    
    setIsLoading(true);
    setSchemaResponse(null); // Clear single response state
    
    try {
      const response = await fetch('/api/ai/personalized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion,
          quizData,
          conversationHistory,
          source: 'personalized-cta',
          requestSchema: true,
          metadata: {
            timestamp: new Date().toISOString(),
            conversationLength: conversationHistory.length
          }
        }),
      });

      const data = await response.json();
      
      if (data.success && data.responseFormat === 'schema') {
        console.log('[PersonalizedCTA] Got schema response for next option:', data.response);
        setSchemaResponse(data.response);
        setSchemaResponses(prev => [...prev, data.response]);
        
        // Add to conversation history
        const newHistory = [
          ...conversationHistory,
          { role: 'user' as const, content: currentQuestion },
          { role: 'assistant' as const, content: JSON.stringify(data.response) }
        ];
        setConversationHistory(newHistory);
      }
    } catch (error) {
      console.error('[PersonalizedCTA] Error processing next option:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-timeback-primary py-16 lg:py-24 mb-16">
      <div className="text-center text-white px-4 md:px-8 max-w-7xl mx-auto font-cal">
        <h2 className="text-3xl lg:text-5xl font-bold mb-6 font-cal">
          Have Questions? We Have Answers
        </h2>
        <p className="text-xl text-white max-w-3xl mx-auto mb-12 font-cal">
          Get instant answers about TimeBack from our AI assistant, trained on everything about our approach.
        </p>

        {/* Predefined Question Buttons */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predefinedQuestions.map((questionText, index) => (
              <button
                key={index}
                onClick={() => handlePredefinedQuestion(questionText)}
                disabled={isLoading}
                className="backdrop-blur-md bg-white/10 border-2 border-white rounded-xl p-6 text-center hover:bg-white/20 hover:transform hover:-translate-y-1 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 shadow-xl hover:shadow-2xl min-h-[80px] flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={questionText}
              >
                <h3 className="text-base lg:text-lg font-bold text-white font-cal leading-snug group-hover:scale-105 transition-transform duration-200">
                  {questionText}
                </h3>
              </button>
            ))}
          </div>

          {/* Display all responses in sequence */}
          {schemaResponses.map((response, index) => (
            <div key={index} className="mt-8 backdrop-blur-md bg-timeback-bg/80/10 backdrop-blur-md border-2 border-timeback-primary rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-6 font-cal">
                {index === 0 ? 'Your Personalized Answer:' : `Follow-up Answer ${index}:`}
              </h3>
              <div className="backdrop-blur-md bg-timeback-bg/80 rounded-xl p-6 border border-timeback-primary">
                <SchemaResponseRenderer 
                  response={response}
                  onNextOptionClick={handleNextOptionClick}
                  isLoading={!response || !response.main_heading || !response.description}
                />
              </div>
            </div>
          ))}
          
          {/* Loading state for new responses */}
          {isLoading && (
            <div className="mt-8 backdrop-blur-md bg-timeback-bg/80/10 backdrop-blur-md border-2 border-timeback-primary rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-6 font-cal">
                {schemaResponses.length === 0 ? 'Your Personalized Answer:' : `Follow-up Answer ${schemaResponses.length}:`}
              </h3>
              <div className="backdrop-blur-md bg-timeback-bg/80 rounded-xl p-6 border border-timeback-primary">
                <SchemaResponseRenderer 
                  response={null}
                  onNextOptionClick={handleNextOptionClick}
                  isLoading={true}
                />
              </div>
            </div>
          )}
        </div>


      </div>
    </section>
  );
}