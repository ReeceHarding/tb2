'use client';

import React, { useState, useEffect, useCallback } from 'react';
// Removed unused imports - custom question functionality removed
import { cn } from '@/lib/utils';
import { usePostHog } from 'posthog-js/react';
import ReactMarkdown from 'react-markdown';
import { QuestionBank, FOLLOW_UP_QUESTIONS, MAIN_QUESTIONS } from '@/libs/question-bank';

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

interface FollowUpQuestionsProps {
  sectionId: string;
  context: any;
  onQuestionClick?: (_question: string) => void;
  clickedQuestions?: Set<string>;
  onQuestionClicked?: (_question: string) => void;
}

interface QuestionItem {
  text: string;
  isGenerated: boolean;
}

// Function to convert LaTeX notation to readable text
const preprocessMathContent = (content: string): string => {
  return content
    // Replace LaTeX \text{...} with just the text
    .replace(/\\text\{([^}]+)\}/g, '$1')
    // Replace LaTeX \times with ×
    .replace(/\\times/g, '×')
    // Replace other common LaTeX symbols
    .replace(/\\div/g, '÷')
    .replace(/\\pm/g, '±')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
    // Replace fractions like \frac{1}{2} with ½
    .replace(/\\frac\{1\}\{2\}/g, '½')
    .replace(/\\frac\{1\}\{3\}/g, '⅓')
    .replace(/\\frac\{1\}\{4\}/g, '¼')
    .replace(/\\frac\{2\}\{3\}/g, '⅔')
    .replace(/\\frac\{3\}\{4\}/g, '¾')
    // Remove any remaining backslashes from LaTeX commands
    .replace(/\\([a-zA-Z]+)/g, '$1');
};

export default function FollowUpQuestions({ 
  sectionId, 
  context, 
  onQuestionClick, 
  clickedQuestions = new Set(), 
  onQuestionClicked 
}: FollowUpQuestionsProps) {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(false);
  // Custom question input removed - replaced with predefined button options only
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});
  const [streamingQuestion, setStreamingQuestion] = useState<string | null>(null);
  const posthog = usePostHog();
  
  // Typewriter animations for questions (staggered)
  const questionTexts = questions.map(q => q.text);
  const questionAnimations = questionTexts.map((text, index) => 
    useTypewriter(text, 25, 300 + (index * 500)) // 500ms between each question
  );
  
  // Static text animations
  const exploreText = useTypewriter("Explore Further", 30, 0);
  // Custom question animation removed - replaced with predefined button options only
  const generatingText = useTypewriter("Generating more questions for you...", 25, 0);

  const generateQuestions = useCallback(async () => {
    console.log(`[FollowUpQuestions] Generating questions for section: ${sectionId}`);
    console.log(`[FollowUpQuestions] Clicked questions:`, Array.from(clickedQuestions));
    setLoading(true);
    
    try {
      let availableQuestions: QuestionItem[] = [];
      
      // First, try to get follow-up questions from the centralized question bank
      const followUpQuestions = QuestionBank.getAvailableQuestions('follow-up', Array.from(clickedQuestions));
      
      if (followUpQuestions.length > 0) {
        // Use follow-up questions from the bank
        availableQuestions = followUpQuestions.slice(0, 3).map(q => ({
          text: q.text,
          isGenerated: false
        }));
        console.log(`[FollowUpQuestions] Using follow-up questions from bank:`, availableQuestions.map(q => q.text));
      }
      
      // If we need more questions, get from main questions
      const neededQuestions = 3 - availableQuestions.length;
      if (neededQuestions > 0) {
        console.log(`[FollowUpQuestions] Need ${neededQuestions} more questions, getting from main question bank...`);
        
        const clickedTexts = Array.from(clickedQuestions).concat(availableQuestions.map(q => q.text));
        const mainQuestions = QuestionBank.getAvailableQuestions('main', clickedTexts);
        
        // Get random selection from main questions
        const additionalQuestions = QuestionBank.getRandomQuestions('main', neededQuestions, clickedTexts);
        
        availableQuestions = [
          ...availableQuestions,
          ...additionalQuestions.map(q => ({
            text: q.text,
            isGenerated: false
          }))
        ];
        console.log(`[FollowUpQuestions] Added main questions:`, additionalQuestions.map(q => q.text));
      }
      
      // If we still need more questions, fall back to generating them
      const stillNeededQuestions = 3 - availableQuestions.length;
      if (stillNeededQuestions > 0) {
        console.log(`[FollowUpQuestions] Need ${stillNeededQuestions} additional questions, generating with LLM...`);
        
        try {
          // Generate questions sequentially to prevent rate limits
          for (let i = 0; i < stillNeededQuestions; i++) {
            console.log(`[FollowUpQuestions] Generating question ${i + 1} of ${stillNeededQuestions} sequentially`);
            
            const response = await fetch('/api/ai/generate-question', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                quizData: context,
                interests: context.interests || [],
                gradeLevel: context.childGrade || 'high school',
                existingQuestions: [
                  ...availableQuestions.map(q => q.text),
                  ...Array.from(clickedQuestions),
                  ...questions.map(q => q.text) // Include all previously generated questions
                ],
                timestamp: Date.now() + i // Add small variation to prevent duplicates
              })
            });

            const questionData = await response.json();
            if (questionData.question) {
              availableQuestions.push({
                text: questionData.question,
                isGenerated: true
              });
              console.log(`[FollowUpQuestions] Successfully generated question ${i + 1}`);
            } else {
              console.warn(`[FollowUpQuestions] Failed to generate question ${i + 1}:`, questionData);
            }

            // Add small delay between requests to be respectful of rate limits
            if (i < stillNeededQuestions - 1) {
              console.log(`[FollowUpQuestions] Waiting 500ms before next question to respect rate limits`);
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        } catch (llmError) {
          console.error('[FollowUpQuestions] Error generating LLM questions:', llmError);
          // Add fallback generated questions
          const fallbackQuestions = [
            `How would this work for a ${context.childGrade || 'high school'} student like mine?`,
            'What specific steps should I take next?',
            'Can you show me real examples from other families?'
          ];
          
          for (let i = 0; i < stillNeededQuestions && i < fallbackQuestions.length; i++) {
            availableQuestions.push({
              text: fallbackQuestions[i],
              isGenerated: true
            });
          }
        }
      }

      console.log(`[FollowUpQuestions] Final questions:`, availableQuestions);
      setQuestions(availableQuestions);
      
    } catch (error) {
      console.error('[FollowUpQuestions] Error generating questions:', error);
      // Fallback to centralized question bank
      const fallbackQuestions = QuestionBank.getAvailableQuestions('follow-up', Array.from(clickedQuestions));
      if (fallbackQuestions.length > 0) {
        setQuestions(fallbackQuestions.slice(0, 3).map(q => ({
          text: q.text,
          isGenerated: false
        })));
      } else {
        // Ultimate fallback
        setQuestions([
          { text: 'How does this apply to my specific situation?', isGenerated: false },
          { text: 'Can you show me more detailed examples?', isGenerated: false },
          { text: 'What are the next steps I should take?', isGenerated: false }
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, [sectionId, context, generatedContent, clickedQuestions]);

  // Generate follow-up questions when component mounts or dependencies change
  useEffect(() => {
    generateQuestions();
  }, [generateQuestions]);

  // Regenerate questions if all visible questions have been clicked
  useEffect(() => {
    const visibleQuestions = questions.filter(q => !clickedQuestions.has(q.text));
    console.log(`[FollowUpQuestions] Visible questions: ${visibleQuestions.length}, Total questions: ${questions.length}, Clicked: ${clickedQuestions.size}`);
    
    if (questions.length > 0 && visibleQuestions.length === 0 && !loading) {
      console.log(`[FollowUpQuestions] All questions clicked, regenerating...`);
      generateQuestions();
    }
  }, [questions, clickedQuestions, loading, generateQuestions]);

  const handleQuestionClick = async (question: string, isGenerated: boolean) => {
    console.log(`[FollowUpQuestions] Question clicked: ${question} (isGenerated: ${isGenerated})`);
    posthog?.capture('follow_up_question_clicked', { sectionId, question, isGenerated });
    
    // Add to clicked questions to prevent showing again
    if (onQuestionClicked) {
      onQuestionClicked(question);
    }
    
    if (onQuestionClick) {
      onQuestionClick(question);
    }

    // Start streaming response
    setStreamingQuestion(question);
    setGeneratedContent(prev => ({ ...prev, [question]: '' }));

    try {
      let response;
      
      if (isGenerated) {
        // For generated questions, use the chat-tutor endpoint (custom input backend)
        console.log(`[FollowUpQuestions] Using chat-tutor endpoint for generated question`);
        response = await fetch('/api/ai/chat-tutor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question,
            interests: context.interests || [],
            subject: 'general',
            gradeLevel: context.childGrade || 'high school',
            context: {
              parentType: context.parentSubType,
              school: context.school?.name,
              numberOfKids: context.numberOfKids,
              selectedSchools: context.selectedSchools,
              kidsInterests: context.interests || [],
              source: 'ai-experience-generated-question',
              sectionId: sectionId,
              previousConversation: Object.keys(generatedContent).length > 0 ? 
                Object.entries(generatedContent).slice(-2).map(([q, content]) => `Q: ${q}\nA: ${content}`).join('\n') : 
                'No previous context'
            },
            messageHistory: [],
            responseFormat: 'text',
            quizData: context,
            stream: true
          })
        });
      } else {
        // For original follow-up questions, use the existing follow-up-content endpoint
        console.log(`[FollowUpQuestions] Using generate-follow-up-content endpoint for original question`);
        response = await fetch('/api/ai/generate-follow-up-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question,
            sectionId,
            context,
            previousContent: generatedContent
          })
        });
      }

      if (!response.ok) throw new Error('Failed to generate content');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let content = '';

      let done = false;
      while (!done) {
        const { done: isDone, value } = await reader.read();
        done = isDone;
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                content += data.content;
                setGeneratedContent(prev => ({ 
                  ...prev, 
                  [question]: preprocessMathContent(content)
                }));
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('[FollowUpQuestions] Error generating content:', error);
      setGeneratedContent(prev => ({ 
        ...prev, 
        [question]: preprocessMathContent('I apologize, but I encountered an error generating this content. Please try again.')
      }));
    } finally {
      setStreamingQuestion(null);
    }
  };

  // Custom question handler removed - replaced with predefined button options only

  if (loading) {
    return (
      <div className="mt-8 flex items-center justify-center">
        <div className="animate-pulse text-timeback-primary font-cal">Generating personalized questions...</div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-timeback-primary font-cal mb-4">{exploreText.displayText}</h3>
      </div>

      {/* Suggested Questions */}
      <div className="flex flex-wrap gap-3">
        {questions
          .filter(questionItem => !clickedQuestions.has(questionItem.text))
          .map((questionItem, index) => (
            <button
              key={index}
              onClick={() => handleQuestionClick(questionItem.text, questionItem.isGenerated)}
              disabled={streamingQuestion === questionItem.text}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-xl border-2 transition-all",
                "border-timeback-primary text-timeback-primary bg-transparent",
                "hover:bg-timeback-bg hover:shadow-sm",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                // Visual distinction for generated questions
                questionItem.isGenerated && "border-dashed italic"
              )}
              title={questionItem.isGenerated ? "AI-generated question" : "Context-specific question"}
            >
              {questionAnimations[index]?.displayText || ''}
            </button>
          ))}
        
        {/* Show message when no questions available */}
        {questions.length > 0 && questions.filter(q => !clickedQuestions.has(q.text)).length === 0 && !loading && (
          <div className="text-sm text-timeback-primary italic font-cal">
            {generatingText.displayText}
          </div>
        )}
      </div>

      {/* Custom Question Input removed - only predefined buttons now */}

      {/* Generated Content */}
      {Object.entries(generatedContent).map(([question, content]) => (
        <div key={question} className="mt-6 bg-timeback-bg rounded-xl p-6" data-generated-content="true">
          <h4 className="font-semibold text-timeback-primary mb-3 font-cal">{question}</h4>
          <div className="prose prose-sm max-w-none text-timeback-primary font-cal">
            {streamingQuestion === question ? (
              <div className="flex items-start gap-2">
                <div className="animate-pulse">
                  {preprocessMathContent(content || 'Generating response...')}
                </div>
                {content && <span className="animate-pulse">▊</span>}
              </div>
            ) : (
              <ReactMarkdown 
                components={{
                  h1: ({children}) => <h1 className="text-base font-bold text-timeback-primary mb-2 font-cal">{children}</h1>,
                  h2: ({children}) => <h2 className="text-sm font-bold text-timeback-primary mb-2 font-cal">{children}</h2>,
                  h3: ({children}) => <h3 className="text-sm font-bold text-timeback-primary mb-1 font-cal">{children}</h3>,
                  p: ({children}) => <p className="text-timeback-primary leading-relaxed mb-3 last:mb-0 font-cal">{children}</p>,
                  ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                  li: ({children}) => (
                    <li className="text-timeback-primary font-cal [&>p]:inline [&>p]:mr-2 [&>p:last-child]:mr-0">
                      {children}
                    </li>
                  ),
                  strong: ({children}) => <strong className="font-bold text-timeback-primary font-cal">{children}</strong>,
                  em: ({children}) => <em className="italic text-timeback-primary font-cal">{children}</em>,
                  code: ({children}) => <code className="bg-timeback-bg text-timeback-primary px-2 py-1 rounded text-xs font-mono border border-timeback-primary font-cal">{children}</code>,
                  blockquote: ({children}) => <blockquote className="border-l-4 border-timeback-primary pl-4 py-2 my-3 bg-timeback-bg text-timeback-primary font-cal">{children}</blockquote>,
                  table: ({children}) => <table className="w-full border-collapse border border-timeback-primary mb-3">{children}</table>,
                  th: ({children}) => <th className="border border-timeback-primary px-2 py-1 bg-timeback-bg text-timeback-primary font-bold font-cal">{children}</th>,
                  td: ({children}) => <td className="border border-timeback-primary px-2 py-1 text-timeback-primary font-cal">{children}</td>,
                }}
              >
                {content}
              </ReactMarkdown>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}