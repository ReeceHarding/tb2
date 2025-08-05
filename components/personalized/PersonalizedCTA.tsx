'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

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
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  console.log('[PersonalizedCTA] Rendering simple Q&A section');

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;
    
    console.log('[PersonalizedCTA] Processing question:', question);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai/chat-tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
          interests: quizData.kidsInterests,
          context: {
            parentType: quizData.parentSubType,
            school: quizData.selectedSchools[0]?.name,
            numberOfKids: quizData.numberOfKids
          }
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('[PersonalizedCTA] Got AI response, updating answer display');
        setAnswer(data.response);
      } else {
        throw new Error(data.error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('[PersonalizedCTA] Error processing question:', error);
      setAnswer('I apologize, but I encountered an error. Please try asking your question again.');
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

          {/* Simple Answer Display */}
          {answer && (
            <div className="mt-8 bg-white/10 backdrop-blur-md border-2 border-timeback-primary rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4 font-cal">Your Personalized Answer:</h3>
              <div className="bg-white rounded-xl p-4 border border-timeback-primary">
                <ReactMarkdown 
                  components={{
                    h1: ({children}) => <h1 className="text-lg font-bold mb-3 text-timeback-primary font-cal">{children}</h1>,
                    h2: ({children}) => <h2 className="text-base font-semibold mb-2 text-timeback-primary font-cal">{children}</h2>,
                    h3: ({children}) => <h3 className="text-base font-semibold mb-2 text-timeback-primary font-cal">{children}</h3>,
                    p: ({children}) => <p className="leading-relaxed mb-3 last:mb-0 text-timeback-primary font-cal">{children}</p>,
                    ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1 text-timeback-primary font-cal">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal list-inside mb-3 space-y-1 text-timeback-primary font-cal">{children}</ol>,
                    li: ({children}) => <li className="text-timeback-primary font-cal">{children}</li>,
                    strong: ({children}) => <strong className="font-semibold text-timeback-primary font-cal">{children}</strong>,
                    em: ({children}) => <em className="italic text-timeback-primary font-cal">{children}</em>,
                    code: ({children}) => <code className="bg-timeback-bg text-timeback-primary px-2 py-1 rounded text-sm font-mono">{children}</code>,
                    blockquote: ({children}) => <blockquote className="border-l-4 border-timeback-primary pl-4 my-3 text-timeback-primary font-cal">{children}</blockquote>,
                  }}
                >
                  {answer}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>


      </div>
    </section>
  );
}