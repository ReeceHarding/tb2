'use client';

import React, { useState, useEffect } from 'react';

// Custom typewriter hook for LLM-like animation
const useTypewriter = (text: string, speed = 25, startDelay = 0) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) {
      setDisplayText('');
      setIsComplete(true);
      return;
    }

    setDisplayText('');
    setIsComplete(false);
    
    const timer = setTimeout(() => {
      let currentIndex = 0;
      
      const typeInterval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          setIsComplete(true);
          clearInterval(typeInterval);
        }
      }, speed);

      return () => clearInterval(typeInterval);
    }, startDelay);

    return () => clearTimeout(timer);
  }, [text, speed, startDelay]);

  return { displayText, isComplete };
};

// Hook for multiple questions with staggered animations
const useQuestionTypewriter = (questions: string[], speed = 25, baseDelay = 0) => {
  const questionAnimations = questions.map((question, index) => 
    useTypewriter(question, speed, baseDelay + (index * 800)) // 800ms between each question
  );

  return questionAnimations;
};

// Reusable TypewriterText component for any text animation
export const TypewriterText = ({ 
  text, 
  speed = 25, 
  startDelay = 0, 
  className = '',
  as: Component = 'span',
  onComplete,
  ...props 
}: {
  text: string;
  speed?: number;
  startDelay?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  onComplete?: () => void;
  [key: string]: any;
}) => {
  const { displayText, isComplete } = useTypewriter(text, speed, startDelay);

  React.useEffect(() => {
    if (isComplete && onComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  return React.createElement(Component, { className, ...props }, displayText);
};

interface FollowUpQuestionsProps {
  sectionId: string;
  sectionContent: any;
  userContext: any;
  onQuestionClick: (question: string) => void;
  // onCustomQuestion removed - replaced with predefined button options only
}

export default function FollowUpQuestions({
  sectionId,
  sectionContent,
  userContext,
  onQuestionClick
  // onCustomQuestion removed - replaced with predefined button options only
}: FollowUpQuestionsProps) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Custom question input removed - replaced with predefined button options only
  
  // Typewriter animations for all text content
  const headingText = useTypewriter("Want to learn more? Ask a follow-up question:", 30, 0);
  // Custom question input animations removed - replaced with predefined button options only
  
  // Typewriter animations for questions (only when not loading)
  const questionAnimations = useQuestionTypewriter(
    isLoading ? [] : questions, 
    25, 
    500 // Start after heading loads
  );

  useEffect(() => {
    generateQuestions();
  }, [sectionId, sectionContent]);

  const generateQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/generate-follow-up-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId, sectionContent, userContext })
      });
      
      const data = await response.json();
      if (data.questions?.length > 0) {
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('Failed to generate follow-up questions:', error);
      // Use fallback questions
      setQuestions([
        "How does this work?",
        "What are next steps?",
        "Any real family examples?"
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Custom question submit handler removed - replaced with predefined button options only

  return (
    <div className="mt-8 p-6 bg-timeback-bg rounded-xl border border-timeback-primary shadow-lg">
      <h3 className="text-xl font-bold text-timeback-primary mb-4 font-cal">
        {headingText.displayText}
      </h3>
      
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-white rounded-xl animate-pulse border border-timeback-primary" />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {questions.map((question, index) => (
              <button
                key={index}
                onClick={() => onQuestionClick(question)}
                className="w-full text-left p-4 bg-white border border-timeback-primary rounded-xl hover:bg-timeback-bg transition-all duration-200 group font-cal"
              >
                <div className="flex items-center justify-between">
                  <span className="text-timeback-primary group-hover:text-timeback-primary font-cal">
                    {questionAnimations[index]?.displayText || ''}
                  </span>
                  <svg 
                    className="w-5 h-5 text-timeback-primary group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          {/* Custom question input removed - only predefined button options now */}
        </>
      )}
    </div>
  );
}