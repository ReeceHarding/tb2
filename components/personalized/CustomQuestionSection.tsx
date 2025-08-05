'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

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
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;
    
    console.log('[CustomQuestionSection] Processing question:', question);
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
        console.log('[CustomQuestionSection] Got AI response, updating answer display');
        setAnswer(data.response);
      } else {
        throw new Error(data.error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('[CustomQuestionSection] Error processing question:', error);
      setAnswer('I apologize, but I encountered an error. Please try asking your question again.');
    } finally {
      setIsLoading(false);
    }
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

        {/* Simple Answer Display */}
        {answer && (
          <div className="mt-8 bg-white rounded-xl p-6 border border-timeback-primary shadow-lg">
            <h3 className="text-xl font-bold text-timeback-primary mb-4 font-cal">Your Personalized Answer:</h3>
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
        )}
      </div>
    </section>
  );
}