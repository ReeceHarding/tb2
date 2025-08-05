'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

interface QuestionData {
  question: string;
  solution: string;
  learningObjective: string;
  interestConnection: string;
  nextSteps: string;
  followUpQuestions?: string[];
}



interface PersonalizedSubjectExamplesProps {
  interests: string[];
  onLearnMore: (section: string) => void;
  preGeneratedContent?: any;
}

const subjects = [
  { 
    id: 'math', 
    name: 'Math', 
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
      </svg>
    ), 
    description: 'Numbers meet your passions' 
  },
  { 
    id: 'physics', 
    name: 'Physics', 
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ), 
    description: 'How things move and work' 
  },
  { 
    id: 'science', 
    name: 'Science', 
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9,2V8H7.5A2.5,2.5 0 0,0 5,10.5V11.5A2.5,2.5 0 0,0 7.5,14H8V16H16V14H16.5A2.5,2.5 0 0,0 19,11.5V10.5A2.5,2.5 0 0,0 16.5,8H15V2H9M11,4H13V8H11V4M7.5,10H16.5A0.5,0.5 0 0,1 17,10.5V11.5A0.5,0.5 0 0,1 16.5,12H7.5A0.5,0.5 0 0,1 7,11.5V10.5A0.5,0.5 0 0,1 7.5,10M10,18V22H14V18H10Z"/>
      </svg>
    ), 
    description: 'Explore the world around us' 
  },
  { 
    id: 'english', 
    name: 'English', 
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,19H5V5H19V19Z"/>
        <path d="M16.5,17H15L13.5,14H10.5L9,17H7.5L10.25,10H13.75L16.5,17M12,11.25L11,13.5H13L12,11.25Z"/>
      </svg>
    ), 
    description: 'Stories from your interests' 
  }
];

export default function PersonalizedSubjectExamples({ interests = [], onLearnMore, preGeneratedContent }: PersonalizedSubjectExamplesProps) {
  const [activeTab, setActiveTab] = useState('math');
  const [questions, setQuestions] = useState<Record<string, QuestionData | null>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [showSolution, setShowSolution] = useState<Record<string, boolean>>({});
  
  // State for question input within computer screen
  const [questionInput, setQuestionInput] = useState('');
  const [isQuestionLoading, setIsQuestionLoading] = useState(false);
  const [questionResponses, setQuestionResponses] = useState<Array<{question: string, answer: string}>>([]);
  
  // State for LLM-generated preview text
  const [interestsPreview, setInterestsPreview] = useState<string>('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);
  

  console.log('[PersonalizedSubjectExamples] Rendering with interests:', interests);
  console.log('[PersonalizedSubjectExamples] Pre-generated content available:', {
    hasContent: !!preGeneratedContent,
    hasQuestions: !!preGeneratedContent?.questions,
    hasFallback: !!preGeneratedContent?.fallback
  });

  // Initialize with pre-generated content if available
  useEffect(() => {
    const timestamp = new Date().toISOString();
    
    if (preGeneratedContent?.questions) {
      console.log(`[PersonalizedSubjectExamples] ${timestamp} Loading pre-generated questions`);
      
      // Convert pre-generated content to expected format
      if (preGeneratedContent.questions.success && preGeneratedContent.questions.data) {
        console.log(`[PersonalizedSubjectExamples] ${timestamp} Using pre-generated questions data`);
        setQuestions(preGeneratedContent.questions.data);
      }
    }
    
    if (preGeneratedContent?.fallback) {
      console.log(`[PersonalizedSubjectExamples] ${timestamp} Pre-generated fallback content available`);
      // Fallback content handling can be implemented if needed
    }
  }, [preGeneratedContent]);

  // Generate interests preview text on mount
  useEffect(() => {
    const generatePreviewText = async () => {
      if (!interests || interests.length === 0) {
        setInterestsPreview('Discover how we personalize learning to match your child\'s unique interests and passions.');
        setIsPreviewLoading(false);
        return;
      }

      console.log('[PersonalizedSubjectExamples] Generating preview text for interests:', interests);
      
      try {
        const prompt = `Given a child's interests: ${interests.join(', ')}, create a natural, conversational sentence that explains how their interests will make learning engaging.

Generate a complete, standalone sentence that feels personalized and warm. The sentence should:
1. Mention the specific interests naturally (e.g., "your child's love of Harry Potter" or "their fascination with dinosaurs")
2. Connect these interests to making education engaging/powerful/exciting
3. Sound like a knowledgeable educator speaking warmly to a parent
4. Be conversational and avoid templated language
5. Be between 15-30 words

CRITICAL INSTRUCTIONS:
- Create a COMPLETE sentence, not a fragment
- Never use hyphens or quotes
- Make it feel like natural speech, not marketing copy
- Don't use generic phrases like "transform" or "opportunities"

Example outputs for different interests:
- For Harry Potter: "Here's how we'll use your child's love of Harry Potter to make every subject as captivating as their favorite magical stories."
- For sports: "Watch as your child's passion for basketball brings math, physics, and teamwork lessons to life in ways they'll actually enjoy."
- For video games: "Your child's fascination with Minecraft becomes the foundation for engaging lessons in engineering, creativity, and problem-solving across all subjects."
- For multiple interests: "We'll weave your child's love of dinosaurs and space exploration into every lesson, making learning feel like an exciting adventure."`;

        const response = await fetch('/api/ai/improve-copywriting', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rawText: interests.join(' and '),
            type: 'interests_preview',
            prompt: prompt
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate preview text');
        }

        const data = await response.json();
        console.log('[PersonalizedSubjectExamples] Generated preview text:', data);
        
        if (data.success && data.improvedCopy) {
          setInterestsPreview(data.improvedCopy);
        } else {
          // Fallback to natural format
          setInterestsPreview(`Discover how we use your child's interests in ${interests.join(' and ')} to make learning genuinely exciting.`);
        }
      } catch (error) {
        console.error('[PersonalizedSubjectExamples] Error generating preview text:', error);
        // Fallback to natural format
        setInterestsPreview(`Discover how we use your child's interests in ${interests.join(' and ')} to make learning genuinely exciting.`);
      } finally {
        setIsPreviewLoading(false);
      }
    };

    generatePreviewText();
  }, [interests]);

  const generateQuestion = useCallback(async (subject: string) => {
    console.log(`[PersonalizedSubjectExamples] Generating ${subject} question for interests:`, interests);
    
    setLoadingStates(prev => ({ ...prev, [subject]: true }));
    
    try {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interests: interests,
          subject: subject,
          gradeLevel: '6th' // Could be dynamic based on quiz data
        }),
      });

      const result = await response.json();
      console.log(`[PersonalizedSubjectExamples] ${subject} question generated:`, result);

      if (result.success) {
        setQuestions(prev => ({ ...prev, [subject]: result.data }));
      } else {
        console.error(`[PersonalizedSubjectExamples] Failed to generate ${subject} question:`, result.error);
        // Set fallback content
        setQuestions(prev => ({ 
          ...prev, 
          [subject]: {
            question: `Here's how ${subject} connects to ${interests[0] || 'your interests'}...`,
            solution: 'Solution would be generated here.',
            learningObjective: `${subject} concepts`,
            interestConnection: `Related to ${interests[0] || 'student interests'}`,
            nextSteps: 'Continue with more advanced problems'
          }
        }));
      }
    } catch (error) {
      console.error(`[PersonalizedSubjectExamples] Error generating ${subject} question:`, error);
      console.log(`[PersonalizedSubjectExamples] Attempting to generate LLM-based fallback content for ${subject}...`);
      
      // Try to generate fallback content using LLM instead of hardcoded strings
      try {
        const fallbackResponse = await fetch('/api/ai/generate-fallback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'question_fallback',
            interests: interests,
            subject: subject,
            gradeLevel: '6th'
          }),
        });

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.success) {
            console.log(`[PersonalizedSubjectExamples] Successfully generated LLM fallback content for ${subject}`);
            setQuestions(prev => ({ ...prev, [subject]: fallbackData.data }));
            return;
          }
        }
        throw new Error('Fallback API failed');
      } catch (fallbackError) {
        console.error(`[PersonalizedSubjectExamples] Fallback LLM generation also failed for ${subject}:`, fallbackError);
        // Ultimate fallback with minimal hardcoded content (only when both AI calls fail)
        setQuestions(prev => ({ 
          ...prev, 
          [subject]: {
            question: `${subject} problem related to ${interests[0] || 'your interests'} (AI temporarily unavailable)`,
            solution: 'Solution would be provided when AI service is restored.',
            learningObjective: `Core ${subject} concepts`,
            interestConnection: `Connected to ${interests[0] || 'student interests'}`,
            nextSteps: 'Try again when AI service is available',
            followUpQuestions: [
              'Please try your question again',
              'AI service will be restored shortly',
              'Thank you for your patience'
            ]
          }
        }));
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, [subject]: false }));
    }
  }, [interests]);

  // Track if questions have been initialized to prevent infinite re-renders
  const questionsInitialized = useRef(false);

  useEffect(() => {
    // Only generate questions once on mount, not on every state change
    if (questionsInitialized.current || Object.keys(questions).length > 0) {
      return;
    }

    // Generate questions for all subjects in parallel on mount
    const subjectsToGenerate = subjects.filter(subject => 
      !questions[subject.id] && !loadingStates[subject.id]
    );
    
    if (subjectsToGenerate.length > 0) {
      console.log(`[PersonalizedSubjectExamples] Generating questions for ${subjectsToGenerate.length} subjects in parallel`);
      questionsInitialized.current = true;
      
      // Generate all questions in parallel
      Promise.all(subjectsToGenerate.map(subject => generateQuestion(subject.id)))
        .then(() => {
          console.log('[PersonalizedSubjectExamples] All parallel question generation completed');
        })
        .catch(error => {
          console.error('[PersonalizedSubjectExamples] Error in parallel question generation:', error);
        });
    }
  }, [interests, generateQuestion, loadingStates, questions]);

  const handleTabChange = (subjectId: string) => {
    console.log(`[PersonalizedSubjectExamples] Switching to ${subjectId} tab`);
    setActiveTab(subjectId);
    // Questions are now generated in parallel on mount, no need to generate on tab change
  };

  const toggleSolution = (subject: string) => {
    console.log(`[PersonalizedSubjectExamples] Toggling solution for ${subject}`);
    setShowSolution(prev => ({ ...prev, [subject]: !prev[subject] }));
  };

  // Handle new question input within computer screen
  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim() || isQuestionLoading) return;
    
    const userQuestion = questionInput.trim();
    console.log('[PersonalizedSubjectExamples] Processing new question:', userQuestion);
    
    setQuestionInput('');
    setIsQuestionLoading(true);
    
    try {
      console.log('[PersonalizedSubjectExamples] Sending question to chat-tutor API');
      const response = await fetch('/api/ai/chat-tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userQuestion,
          interests: interests,
          subject: activeTab,
          gradeLevel: '6th',
          context: currentQuestion ? {
            subject: activeTab,
            question: currentQuestion.question
          } : null
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (!reader) {
        throw new Error('No response body');
      }

      console.log('[PersonalizedSubjectExamples] Reading streaming response');
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const result = await reader.read();
        if (result.done) break;
        const value = result.value;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullResponse += parsed.text;
              } else if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (e) {
              console.error('[PersonalizedSubjectExamples] Error parsing chunk:', e);
            }
          }
        }
      }

      console.log('[PersonalizedSubjectExamples] Full response received:', fullResponse.length, 'characters');

      if (fullResponse) {
        // Create a new question data structure from the AI response
        const newQuestionData: QuestionData = {
          question: userQuestion,
          solution: fullResponse,
          learningObjective: `Exploring ${activeTab} through your question`,
          interestConnection: `Connected to ${interests[0] || 'your interests'}`,
          nextSteps: `Continue exploring ${activeTab} concepts`
        };
        
        // Replace the current question with the new one
        setQuestions(prev => ({ ...prev, [activeTab]: newQuestionData }));
        setShowSolution(prev => ({ ...prev, [activeTab]: true })); // Auto-show the response
      } else {
        throw new Error('No response content received');
      }
    } catch (error) {
      console.error('[PersonalizedSubjectExamples] Error with question:', error);
      // Show error in the computer interface
      const errorQuestionData: QuestionData = {
        question: userQuestion,
        solution: 'I apologize, but I encountered an error processing your question. Please try asking again.',
        learningObjective: `${activeTab} question`,
        interestConnection: `Related to ${interests[0] || 'your interests'}`,
        nextSteps: 'Try asking your question again'
      };
      setQuestions(prev => ({ ...prev, [activeTab]: errorQuestionData }));
      setShowSolution(prev => ({ ...prev, [activeTab]: true }));
    } finally {
      setIsQuestionLoading(false);
    }
  };

  const currentQuestion = questions[activeTab];
  const isLoading = loadingStates[activeTab];

  return (
    <section className="w-full bg-gradient-to-br from-white to-timeback-bg py-20 lg:py-32 px-6 lg:px-12">
      <div className="text-center mb-16 font-cal">
        <div className="inline-flex items-center gap-2 bg-white border border-timeback-primary rounded-full px-6 py-3 mb-8">
          <div className="w-3 h-3 bg-timeback-primary rounded-full animate-pulse"></div>
          <span className="text-timeback-primary font-bold text-sm font-cal">INTERACTIVE LEARNING</span>
        </div>
        <h2 className="text-4xl lg:text-6xl font-bold text-timeback-primary mb-8 font-cal">
          Learning Through Your Child&apos;s Interests
        </h2>
        <p className="text-2xl text-timeback-primary max-w-5xl mx-auto font-cal leading-relaxed">
          {isPreviewLoading ? (
            <span className="inline-flex items-center">
              <span className="animate-pulse bg-timeback-bg rounded-xl border border-timeback-primary px-32 py-3">&nbsp;</span>
            </span>
          ) : (
            <>{interestsPreview}</>
          )}
        </p>
      </div>

      {/* Subject Learning Examples */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl border-2 border-timeback-primary overflow-hidden">
        <div className="flex border-b-2 border-timeback-primary overflow-x-auto">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => handleTabChange(subject.id)}
              className={`flex-1 min-w-0 px-8 py-6 text-center transition-all duration-300 ${
                activeTab === subject.id
                  ? 'bg-timeback-primary text-white'
                  : 'text-timeback-primary hover:text-white hover:bg-timeback-bg'
              }`}
            >
              <div className="mb-2 flex justify-center">{subject.icon}</div>
              <div className="font-bold text-lg font-cal">{subject.name}</div>
              <div className="text-sm opacity-90 font-cal">{subject.description}</div>
            </button>
          ))}
        </div>

        {/* Question Content */}
        <div className="p-12">
          {isLoading ? (
            <div className="text-center py-16 font-cal">
              <div className="bg-timeback-bg rounded-2xl border-2 border-timeback-primary p-8 max-w-md mx-auto">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-timeback-bg border-t-timeback-primary mx-auto mb-6"></div>
                <p className="text-timeback-primary text-xl font-cal font-bold">Generating your personalized {activeTab} question...</p>
                <p className="text-timeback-primary opacity-75 mt-3 font-cal">Connecting {interests && interests[0] ? interests[0] : 'your interests'} to {activeTab} concepts</p>
              </div>
            </div>
          ) : currentQuestion ? (
            <div className="space-y-8">
              {/* Question */}
              <div className="bg-timeback-bg rounded-2xl p-8 border-2 border-timeback-primary">
                <h3 className="text-2xl font-bold text-timeback-primary mb-4 font-cal">Your Personalized Question:</h3>
                <p className="text-timeback-primary leading-relaxed text-lg font-cal">{currentQuestion.question}</p>
              </div>

              {/* Solution Toggle */}
              <div className="flex justify-center">
                <button
                  onClick={() => toggleSolution(activeTab)}
                  className="px-8 py-4 bg-timeback-primary text-white rounded-xl hover:bg-opacity-90 transition-all duration-200 font-bold font-cal text-lg shadow-2xl hover:shadow-2xl transform hover:scale-105"
                >
                  {showSolution[activeTab] ? 'Hide Solution' : 'Show Solution & Explanation'}
                </button>
              </div>

              {/* Solution */}
              {showSolution[activeTab] && (
                <div className="bg-white border-2 border-timeback-primary rounded-2xl p-8 space-y-6 shadow-2xl">
                  <h4 className="text-2xl font-bold text-timeback-primary flex items-center gap-3 font-cal">
                    <svg className="w-6 h-6 text-timeback-primary font-cal" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                    Step-by-Step Solution:
                  </h4>
                  <div className="text-timeback-primary leading-relaxed font-cal">
                    <ReactMarkdown 
                      components={{
                        h1: ({children}) => <h1 className="text-2xl font-bold text-timeback-primary mb-4 font-cal">{children}</h1>,
                        h2: ({children}) => <h2 className="text-xl font-bold text-timeback-primary mb-3 font-cal">{children}</h2>,
                        h3: ({children}) => <h3 className="text-lg font-bold text-timeback-primary mb-2 font-cal">{children}</h3>,
                        p: ({children}) => <p className="text-timeback-primary leading-relaxed mb-4 font-cal text-lg">{children}</p>,
                        ul: ({children}) => <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>,
                        li: ({children}) => <li className="text-timeback-primary font-cal">{children}</li>,
                        strong: ({children}) => <strong className="font-bold text-timeback-primary font-cal">{children}</strong>,
                        em: ({children}) => <em className="italic text-timeback-primary font-cal">{children}</em>,
                        code: ({children}) => <code className="bg-timeback-bg text-timeback-primary px-2 py-1 rounded text-sm font-mono border border-timeback-primary font-cal">{children}</code>,
                        blockquote: ({children}) => <blockquote className="border-l-4 border-timeback-primary pl-6 py-3 my-4 bg-timeback-bg text-timeback-primary font-cal">{children}</blockquote>,
                      }}
                    >
                      {currentQuestion.solution}
                    </ReactMarkdown>
                  </div>
                  
                  <div className="bg-timeback-bg rounded-2xl p-6 border border-timeback-primary">
                    <h5 className="font-bold text-timeback-primary mb-3 flex items-center gap-3 font-cal text-lg">
                      <svg className="w-6 h-6 text-timeback-primary font-cal" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z"/>
                      </svg>
                      What is next:
                    </h5>
                    <p className="text-timeback-primary font-cal text-lg">{currentQuestion.nextSteps}</p>
                  </div>
                </div>
              )}

              {/* Interactive Chat Interface - ChatGPT Style */}
              <div className="mt-10 pt-8 border-t-2 border-timeback-primary">
                <div className="bg-white border-2 border-timeback-primary rounded-2xl shadow-2xl h-[600px] flex flex-col">
                  {/* Chat Header */}
                  <div className="flex items-center justify-between p-6 border-b-2 border-timeback-primary bg-timeback-bg rounded-t-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-timeback-primary rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white font-cal" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M6,9H18V11H6M14,14H6V12H14M18,8H6V6H18"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-timeback-primary text-xl font-cal">Ask About This Problem</h4>
                        <p className="text-timeback-primary opacity-75 font-cal">Get clarification or additional examples</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area - Expanded */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-timeback-bg">
                    {questionResponses.length === 0 && (
                      <div className="text-center text-timeback-primary mt-12 font-cal">
                        <svg className="w-16 h-16 mx-auto mb-6 text-timeback-primary font-cal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-lg font-cal">Ask a question about this {activeTab} problem to get started!</p>
                      </div>
                    )}
                    
                    {questionResponses.map((response, index) => (
                      <div key={index} className="space-y-4">
                        {/* User Question */}
                        <div className="flex justify-end">
                          <div className="flex gap-4 max-w-[80%] flex-row-reverse">
                            <div className="w-10 h-10 bg-timeback-primary rounded-full flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-white font-cal" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                              </svg>
                            </div>
                            <div className="bg-timeback-primary text-white px-6 py-4 rounded-2xl shadow-2xl font-cal">
                              <p className="font-cal">{response.question}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* AI Response */}
                        <div className="flex justify-start">
                          <div className="flex gap-4 max-w-[80%]">
                            <div className="w-10 h-10 bg-white border-2 border-timeback-primary rounded-full flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-timeback-primary font-cal" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,6V8H13V6H11M11,10V18H13V10H11Z"/>
                              </svg>
                            </div>
                            <div className="bg-white border-2 border-timeback-primary rounded-2xl px-6 py-4 shadow-2xl">
                              <ReactMarkdown 
                                components={{
                                  h1: ({children}) => <h1 className="text-lg font-bold text-timeback-primary mb-3 font-cal">{children}</h1>,
                                  h2: ({children}) => <h2 className="text-base font-bold text-timeback-primary mb-2 font-cal">{children}</h2>,
                                  h3: ({children}) => <h3 className="text-sm font-bold text-timeback-primary mb-1 font-cal">{children}</h3>,
                                  p: ({children}) => <p className="text-timeback-primary leading-relaxed mb-3 last:mb-0 font-cal">{children}</p>,
                                  ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                                  ol: ({children}) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                                  li: ({children}) => <li className="text-timeback-primary font-cal">{children}</li>,
                                  strong: ({children}) => <strong className="font-bold text-timeback-primary font-cal">{children}</strong>,
                                  em: ({children}) => <em className="italic text-timeback-primary font-cal">{children}</em>,
                                  code: ({children}) => <code className="bg-timeback-bg text-timeback-primary px-2 py-1 rounded text-xs font-mono border border-timeback-primary font-cal">{children}</code>,
                                  blockquote: ({children}) => <blockquote className="border-l-4 border-timeback-primary pl-4 py-2 my-3 bg-timeback-bg text-timeback-primary font-cal">{children}</blockquote>,
                                }}
                              >
                                {response.answer}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isQuestionLoading && (
                      <div className="flex justify-start">
                        <div className="flex gap-4 max-w-[80%]">
                          <div className="w-10 h-10 bg-white border-2 border-timeback-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-timeback-primary font-cal" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,6V8H13V6H11M11,10V18H13V10H11Z"/>
                            </svg>
                          </div>
                          <div className="bg-white border-2 border-timeback-primary rounded-2xl px-6 py-4 shadow-2xl">
                            <div className="flex items-center gap-3">
                              <div className="flex space-x-1">
                                <div className="w-3 h-3 bg-timeback-primary rounded-full animate-bounce"></div>
                                <div className="w-3 h-3 bg-timeback-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-3 h-3 bg-timeback-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                              </div>
                              <span className="text-timeback-primary font-cal">TimeBack AI is thinking...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Area - Bottom Position (ChatGPT Style) */}
                  <div className="border-t-2 border-timeback-primary p-6 bg-white rounded-b-2xl">
                    <form onSubmit={handleQuestionSubmit} className="flex gap-4">
                      <input
                        type="text"
                        value={questionInput}
                        onChange={(e) => setQuestionInput(e.target.value)}
                        placeholder={`Ask about this ${activeTab} problem, need clarification, or want more examples...`}
                        className="flex-1 px-6 py-4 border-2 border-timeback-primary rounded-xl focus:ring-2 focus:ring-timeback-primary focus:ring-opacity-30 focus:border-timeback-primary outline-none text-timeback-primary placeholder:text-timeback-primary placeholder:opacity-60 font-cal text-lg"
                        disabled={isQuestionLoading}
                      />
                      <button
                        type="submit"
                        disabled={!questionInput.trim() || isQuestionLoading}
                        className="bg-timeback-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-cal text-lg shadow-2xl hover:shadow-2xl"
                      >
                        {isQuestionLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        )}
                        Ask
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 font-cal">
              <div className="bg-timeback-bg rounded-2xl border-2 border-timeback-primary p-8 max-w-md mx-auto">
                <p className="text-timeback-primary mb-6 font-cal text-xl">Ready to see how {activeTab} connects to {interests && interests[0] ? interests[0] : 'your interests'}?</p>
                <button
                  onClick={() => generateQuestion(activeTab)}
                  className="px-8 py-4 bg-timeback-primary text-white rounded-xl hover:bg-opacity-90 transition-all duration-200 font-bold font-cal text-lg shadow-2xl hover:shadow-2xl transform hover:scale-105"
                >
                  Generate My Question
                </button>
              </div>
            </div>
          )}
        </div>
      </div>





      {/* Learn More button */}
      <div className="flex justify-center mt-12">
        <button 
          onClick={() => onLearnMore('subject-examples')}
          className="px-8 py-4 border-2 border-timeback-primary text-timeback-primary bg-transparent rounded-xl hover:bg-timeback-bg transition-all duration-200 transform hover:scale-105 font-bold font-cal text-lg shadow-2xl hover:shadow-2xl"
        >
          Get AI analysis of how this applies to my child
        </button>
      </div>
    </section>
  );
}