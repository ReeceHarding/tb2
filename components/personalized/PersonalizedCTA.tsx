'use client';

import React, { useState } from 'react';
import SchemaResponseRenderer from '@/components/SchemaResponseRenderer';

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
  const [question, setQuestion] = useState('');
  const [schemaResponse, setSchemaResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);

  console.log('[PersonalizedCTA] Rendering schema-based Q&A section');
  console.log('[PersonalizedCTA] Quiz data:', quizData);
  console.log('[PersonalizedCTA] Conversation history length:', conversationHistory.length);

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;
    
    const currentQuestion = question.trim();
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
      const errorMessage = 'I apologize, but I encountered an error processing your question. Please try asking again.';
      
      // Set error schema response
      setSchemaResponse({
        header: 'TIMEBACK | ERROR',
        main_heading: 'Something went wrong',
        description: errorMessage,
        key_points: [
          { label: 'Try Again', description: 'Please rephrase your question and try again' },
          { label: 'Contact Support', description: 'If the issue persists, our team is here to help' },
          { label: 'Browse Resources', description: 'Explore our other resources while we resolve this' }
        ],
        next_options: ['Ask a different question', 'Learn about TimeBack basics', 'Contact our team']
      });
      
      // Add error to conversation history
      const newHistory = [
        ...conversationHistory,
        { role: 'user' as const, content: currentQuestion },
        { role: 'assistant' as const, content: errorMessage }
      ];
      setConversationHistory(newHistory);
    } finally {
      setIsLoading(false);
      setQuestion(''); // Clear the question input after submission
    }
  };

  const handleNextOptionClick = (option: string) => {
    console.log('[PersonalizedCTA] Next option clicked:', option);
    setQuestion(option);
    // Don't auto-submit, let user review and modify the question if needed
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

        {/* Simple Question Input */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleQuestionSubmit} className="space-y-4">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask me anything about TimeBack..."
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-md border-2 border-timeback-primary rounded-xl text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:border-white/50 outline-none font-cal text-lg shadow-lg"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!question.trim() || isLoading}
              className="w-full bg-white text-timeback-primary px-6 py-4 rounded-xl font-bold hover:bg-timeback-bg hover:text-timeback-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl font-cal text-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-timeback-primary border-t-transparent rounded-full animate-spin"></div>
                  Getting your personalized answer...
                </div>
              ) : (
                'Get My Personalized Answer'
              )}
            </button>
          </form>

          {/* Schema Response Display */}
          {(schemaResponse || isLoading) && (
            <div className="mt-8 bg-white/10 backdrop-blur-md border-2 border-timeback-primary rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-6 font-cal">Your Personalized Answer:</h3>
              <div className="bg-white rounded-xl p-6 border border-timeback-primary">
                <SchemaResponseRenderer 
                  response={schemaResponse}
                  onNextOptionClick={handleNextOptionClick}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}
        </div>


      </div>
    </section>
  );
}