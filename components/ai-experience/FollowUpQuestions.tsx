'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePostHog } from 'posthog-js/react';

interface FollowUpQuestionsProps {
  sectionId: string;
  context: any;
  onQuestionClick?: (_question: string) => void;
}

export default function FollowUpQuestions({ sectionId, context, onQuestionClick }: FollowUpQuestionsProps) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});
  const [streamingQuestion, setStreamingQuestion] = useState<string | null>(null);
  const posthog = usePostHog();

  const generateQuestions = useCallback(async () => {
    console.log(`[FollowUpQuestions] Generating questions for section: ${sectionId}`);
    setLoading(true);
    
    try {
      const response = await fetch('/api/ai/generate-follow-up-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId,
          context,
          previousContent: Object.keys(generatedContent)
        })
      });

      const data = await response.json();
      if (data.success && data.questions) {
        console.log(`[FollowUpQuestions] Generated questions:`, data.questions);
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('[FollowUpQuestions] Error generating questions:', error);
      // Fallback questions
      setQuestions([
        'How does this apply to my specific situation?',
        'Can you show me more detailed examples?',
        'What are the next steps I should take?'
      ]);
    } finally {
      setLoading(false);
    }
  }, [sectionId, context, generatedContent]);

  // Generate follow-up questions when component mounts or dependencies change
  useEffect(() => {
    generateQuestions();
  }, [generateQuestions]);

  const handleQuestionClick = async (question: string) => {
    console.log(`[FollowUpQuestions] Question clicked: ${question}`);
    posthog?.capture('follow_up_question_clicked', { sectionId, question });
    
    if (onQuestionClick) {
      onQuestionClick(question);
    }

    // Start streaming response
    setStreamingQuestion(question);
    setGeneratedContent(prev => ({ ...prev, [question]: '' }));

    try {
      const response = await fetch('/api/ai/generate-follow-up-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          sectionId,
          context,
          previousContent: generatedContent
        })
      });

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
                  [question]: content 
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
        [question]: 'I apologize, but I encountered an error generating this content. Please try again.' 
      }));
    } finally {
      setStreamingQuestion(null);
    }
  };

  const handleCustomQuestion = async () => {
    if (!customQuestion.trim()) return;
    
    console.log(`[FollowUpQuestions] Custom question submitted: ${customQuestion}`);
    posthog?.capture('custom_question_submitted', { sectionId, question: customQuestion });
    
    await handleQuestionClick(customQuestion);
    setCustomQuestion('');
    setShowCustomInput(false);
  };

  if (loading) {
    return (
      <div className="mt-8 flex items-center justify-center">
        <div className="animate-pulse text-timeback-primary font-cal">Generating personalized questions...</div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-timeback-primary font-cal">Explore Further</h3>
        <button
          onClick={() => setShowCustomInput(!showCustomInput)}
          className="text-sm text-timeback-primary hover:text-timeback-primary flex items-center gap-1 font-cal"
        >
          <Plus className="w-4 h-4" />
          Ask your own question
        </button>
      </div>

      {/* Suggested Questions */}
      <div className="flex flex-wrap gap-3">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => handleQuestionClick(question)}
            disabled={streamingQuestion === question}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-xl border-2 transition-all",
              "border-timeback-primary text-timeback-primary bg-transparent",
              "hover:bg-timeback-bg hover:shadow-sm",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {question}
          </button>
        ))}
      </div>

      {/* Custom Question Input */}
      {showCustomInput && (
        <div className="flex gap-2">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCustomQuestion()}
            placeholder="Type your question here..."
            className="flex-1 px-4 py-2 border border-timeback-primary rounded-xl focus:ring-2 focus:ring-timeback-primary focus:border-transparent"
          />
          <button
            onClick={handleCustomQuestion}
            disabled={!customQuestion.trim()}
            className="px-4 py-2 bg-timeback-primary text-white rounded-xl hover:bg-timeback-primary disabled:opacity-50 disabled:cursor-not-allowed font-cal"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Generated Content */}
      {Object.entries(generatedContent).map(([question, content]) => (
        <div key={question} className="mt-6 bg-timeback-bg rounded-xl p-6">
          <h4 className="font-semibold text-timeback-primary mb-3 font-cal">{question}</h4>
          <div className="prose prose-sm max-w-none text-timeback-primary font-cal">
            {streamingQuestion === question ? (
              <div className="flex items-start gap-2">
                <div className="animate-pulse">
                  {content || 'Generating response...'}
                </div>
                {content && <span className="animate-pulse">▊</span>}
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: content }} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}