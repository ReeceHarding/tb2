'use client';

import React, { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
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

interface InteractiveLearnMoreProps {
  section: string;
  quizData: QuizData;
  onClose: () => void;
}

// Helper function to get section content for context
const getSectionContent = (section: string): string => {
  const contentMap: Record<string, string> = {
    'school-performance': 'Data showing TimeBack students consistently achieve 99th percentile results compared to traditional schools, with detailed analytics and performance metrics.',
    'timeback-intro': 'Overview of how TimeBack AI tutoring works with personalized learning, mastery-based progression, and adaptive curriculum.',
    'subject-examples': 'Examples of how TimeBack connects student interests to academic subjects like math, science, English, creating personalized problems and lessons.',
    'learning-science': 'The research and science behind mastery-based learning, spaced repetition, and personalized education approaches.',
    'competitors': 'Comparison between TimeBack and other educational approaches including Khan Academy, traditional tutoring, and other AI platforms.',
    'afternoon-activities': 'How TimeBack incorporates afternoon activities, real-world experiences, and interest-based learning outside of academics.',
    'speed-comparison': 'Data showing how TimeBack students complete academic subjects 6-10x faster than traditional school while achieving better results.',
            'cta': 'Information about getting started with TimeBack, enrollment process, and next steps for parents.'
  };
  
  return contentMap[section] || 'General TimeBack personalized education platform information';
};

export default function InteractiveLearnMore({ section, quizData, onClose }: InteractiveLearnMoreProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [showChat, setShowChat] = useState(false);

  // Initialize chat for the streaming interface
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/ai/chat-learn-more',
      body: {
        section,
        quizData,
        sectionContent: getSectionContent(section)
      }
    })
  });
  
  const [chatInput, setChatInput] = useState('');
  const isChatLoading = status === 'streaming' || status === 'submitted';

  console.log('[InteractiveLearnMore] Showing modal for section:', section);

  // Always generate questions when component mounts
  useEffect(() => {
    async function fetchQuestionsFromAPI() {
      console.log('[InteractiveLearnMore] Fetching questions for section:', section);
      setIsLoadingQuestions(true);

      try {
        const response = await fetch('/api/ai/generate-follow-up-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            section,
            quizData,
            sectionContent: getSectionContent(section)
          }),
        });

        const data = await response.json();
        
        if (data.success && data.questions) {
          console.log('[InteractiveLearnMore] Successfully generated questions:', data.questions);
          setGeneratedQuestions(data.questions);
        } else {
          console.warn('[InteractiveLearnMore] Failed to generate questions, using fallback');
          setGeneratedQuestions(data.questions || getContextualQuestions(section));
        }
      } catch (error) {
        console.error('[InteractiveLearnMore] Error fetching questions:', error);
        setGeneratedQuestions(getContextualQuestions(section));
      } finally {
        setIsLoadingQuestions(false);
      }
    }

    fetchQuestionsFromAPI();
  }, [section, quizData]);

  // Generate contextual questions based on the section (fallback)
  const getContextualQuestions = (sectionName: string) => {
    const questionMap: Record<string, string[]> = {
      'school-performance': [
        'How does TimeBack achieve 99th percentile results consistently?',
        'What specific teaching methods make the difference?',
        'How long does it typically take to see improvement?'
      ],
      'timeback-intro': [
        'How does the AI adapt to different learning styles?',
        'What makes TimeBack different from Khan Academy?',
        'Can you show me a real student example?'
      ],
      'subject-examples': [
        'How do you incorporate my child\'s interests into all subjects?',
        'What if my child loses interest in their current hobbies?',
        'Can you show more examples for different grade levels?'
      ],
      'learning-science': [
        'What research backs up the mastery-based approach?',
        'How do you ensure my child doesn\'t get bored?',
        'What about social learning and interaction with peers?'
      ],
      'competitors': [
        'How is TimeBack different from traditional tutoring?',
        'What about compared to other AI learning platforms?',
        'How do you ensure quality control with AI tutors?'
      ],
      'afternoon-activities': [
        'How do you find activities that match my child\'s interests?',
        'What if there are no activities available in our area?',
        'How do you track progress in these activities?'
      ],
      'cta': [
        'What are the next steps to get started?',
        'How much does TimeBack cost?',
        'What is your money-back guarantee policy?'
      ]
    };

    return questionMap[sectionName] || [
      'Can you tell me more about this?',
      'How does this specifically apply to my situation?',
      'What are the next steps?'
    ];
  };

  const handleQuestionSelect = async (question: string) => {
    console.log('[InteractiveLearnMore] Selected question:', question);
    setSelectedQuestion(question);
    setIsLoadingResponse(true);
    setAiResponse(null);

    try {
      // TODO: Replace with actual AI API call
      // For now, simulate AI response based on the question
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      
      const mockResponse = generateMockResponse(question, section, quizData);
      setAiResponse(mockResponse);
      
    } catch (error) {
      console.error('[InteractiveLearnMore] Error getting AI response:', error);
      setAiResponse('Sorry, I couldn\'t process your question right now. Please try again later.');
    } finally {
      setIsLoadingResponse(false);
    }
  };

  const handleCustomQuestion = async () => {
    if (!customQuestion.trim()) return;
    
    console.log('[InteractiveLearnMore] Custom question:', customQuestion);
    setSelectedQuestion(customQuestion);
    setIsLoadingResponse(true);
    setAiResponse(null);

    try {
      // TODO: Replace with actual AI API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResponse = generateMockResponse(customQuestion, section, quizData);
      setAiResponse(mockResponse);
      
    } catch (error) {
      console.error('[InteractiveLearnMore] Error getting AI response:', error);
      setAiResponse('Sorry, I couldn\'t process your question right now. Please try again later.');
    } finally {
      setIsLoadingResponse(false);
      setCustomQuestion('');
    }
  };

  // Generate contextual mock responses (will be replaced with real AI)
  const generateMockResponse = (question: string, sectionName: string, quiz: QuizData): string => {
    const schoolName = quiz.selectedSchools[0]?.name || 'your child\'s school';
    const primaryInterest = quiz.kidsInterests[0] || 'their interests';
    
    if (question.toLowerCase().includes('99th percentile')) {
      return `Great question! TimeBack achieves consistent 99th percentile results through our mastery-based learning system. Unlike traditional schools where students move on before fully understanding concepts, TimeBack ensures 90% mastery before progression. 

For students at ${schoolName}, we've seen similar improvements when they focus on true understanding rather than rushing through curriculum. Your child's interest in ${primaryInterest} becomes a powerful tool for engagement - we use it to make every lesson personally relevant.

The key is our AI tutor that adapts in real-time. If your child struggles with a concept, it automatically provides different explanations, examples, and practice problems until mastery is achieved. This individualized attention is what typically costs $100+ per hour with human tutors.`;
    }
    
    if (question.toLowerCase().includes('different') || question.toLowerCase().includes('khan academy')) {
      return `Excellent question! The main difference is structure and accountability. Khan Academy is self-paced, which sounds good but often leads to gaps in learning. Students can watch videos and move on without truly mastering the material.

TimeBack enforces mastery - your child cannot progress until they demonstrate 90% understanding. This might seem slower at first, but it's actually much faster because they build solid foundations. No more reviewing the same concepts repeatedly because they never fully learned them.

For your child who's interested in ${primaryInterest}, we make every lesson connect to what they care about. Khan Academy gives the same lesson to everyone - we personalize every single problem.`;
    }
    
    if (question.toLowerCase().includes('time') || question.toLowerCase().includes('long')) {
      return `Based on data from schools like Alpha School, most families see noticeable improvements within 2-4 weeks. However, every child is different.

Students at schools similar to ${schoolName} typically show:
- Week 1-2: Increased engagement and excitement about learning
- Week 3-4: Measurable improvement in understanding and confidence  
- Month 2-3: Significant test score improvements
- Month 6+: Performing 1-2 grade levels above peers

The beauty of TimeBack is that it adapts to your child's pace. Some children advance faster, others take more time to build strong foundations. Both approaches lead to exceptional results because we never compromise on mastery.`;
    }

    // Default response
    return `Thank you for that question about ${sectionName}. Based on your child's situation at ${schoolName} and their interest in ${primaryInterest}, here's what I can tell you:

This is a personalized response that takes into account your specific situation. Our AI system would provide detailed, research-backed information tailored to your family's needs.

Would you like me to elaborate on any specific aspect of this topic?`;
  };

  const getSectionTitle = (sectionName: string): string => {
    const titleMap: Record<string, string> = {
      'school-performance': 'School Performance Data',
      'timeback-intro': 'How TimeBack Works',
      'subject-examples': 'Personalized Learning Examples',
      'learning-science': 'Learning Science & Research',
      'competitors': 'TimeBack vs Alternatives',
      'afternoon-activities': 'Afternoon Activities',
      'cta': 'Getting Started'
    };
    
    return titleMap[sectionName] || 'Learn More';
  };

  const contextualQuestions = generatedQuestions.length > 0 ? generatedQuestions : getContextualQuestions(section);

  return (
    <div className="fixed inset-0 bg-timeback-primary bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-timeback-primary max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-timeback-primary text-white p-6 rounded-t-2xl font-cal">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold font-cal">{getSectionTitle(section)}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-timeback-bg transition-colors p-1 rounded-full hover:bg-white/20 font-cal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-white opacity-90 text-lg mt-2 font-cal">
            Ask a question to learn more about how this applies to your specific situation
          </p>
        </div>

        <div className="p-6">
          {!selectedQuestion ? (
            <>
              {/* Suggested Questions */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-timeback-primary mb-6 font-cal">
                  What would you like to know?
                </h3>
                {isLoadingQuestions ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-timeback-bg rounded-xl border border-timeback-primary"></div>
                      </div>
                    ))}
                    <div className="text-center py-6 font-cal">
                      <div className="flex items-center justify-center space-x-3">
                        <div className="w-5 h-5 border-2 border-timeback-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-timeback-primary text-lg font-cal">Generating personalized questions...</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contextualQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuestionSelect(question)}
                        className="w-full text-left p-6 border-2 border-timeback-primary rounded-xl hover:bg-timeback-bg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-cal"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-timeback-primary font-cal text-lg font-medium">{question}</span>
                          <svg className="w-6 h-6 text-timeback-primary font-cal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Question Input */}
              <div className="border-t-2 border-timeback-primary pt-8">
                <h3 className="text-2xl font-bold text-timeback-primary mb-6 font-cal">
                  Or ask your own question
                </h3>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomQuestion()}
                    placeholder="Type your question here..."
                    className="flex-1 px-6 py-4 border-2 border-timeback-primary rounded-xl focus:border-timeback-primary focus:ring-2 focus:ring-timeback-primary focus:ring-opacity-30 text-timeback-primary placeholder:text-timeback-primary placeholder:opacity-60 font-cal text-lg"
                  />
                  <button
                    onClick={handleCustomQuestion}
                    disabled={!customQuestion.trim()}
                    className="px-8 py-4 bg-timeback-primary text-white rounded-xl hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-bold font-cal text-lg transition-all duration-200 hover:shadow-2xl"
                  >
                    Ask
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Selected Question */}
              <div className="mb-8">
                <div className="bg-timeback-bg border-2 border-timeback-primary rounded-xl p-6">
                  <h3 className="font-bold text-timeback-primary mb-3 font-cal text-lg">Your Question:</h3>
                  <p className="text-timeback-primary font-cal text-lg">{selectedQuestion}</p>
                </div>
              </div>

              {/* AI Response */}
              <div className="mb-8">
                <h3 className="font-bold text-timeback-primary mb-4 font-cal text-2xl">Personalized Answer:</h3>
                {isLoadingResponse ? (
                  <div className="flex items-center space-x-4 p-6 bg-timeback-bg rounded-xl border border-timeback-primary">
                    <div className="w-6 h-6 border-2 border-timeback-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-timeback-primary font-cal text-lg">Generating personalized response...</span>
                  </div>
                ) : aiResponse ? (
                  <div className="prose max-w-none bg-white rounded-xl p-6 border-2 border-timeback-primary shadow-2xl">
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
                      {aiResponse}
                    </ReactMarkdown>
                  </div>
                ) : null}
              </div>

              {/* Ask Another Question */}
              <div className="border-t-2 border-timeback-primary pt-8">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <button
                    onClick={() => {
                      setSelectedQuestion(null);
                      setAiResponse(null);
                    }}
                    className="inline-flex items-center px-6 py-3 border-2 border-timeback-primary text-timeback-primary rounded-xl hover:bg-timeback-bg transition-all duration-200 font-bold font-cal text-lg"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                    </svg>
                    Ask Another Question
                  </button>
                  
                  <button
                    onClick={() => setShowChat(true)}
                    className="inline-flex items-center px-6 py-3 bg-timeback-primary text-white rounded-xl hover:bg-opacity-90 transition-all duration-200 font-bold font-cal text-lg shadow-2xl hover:shadow-2xl"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.001 8.001 0 01-7.7-6M3 12c0-4.418 3.582-8 8-8s8 3.582 8 8" />
                    </svg>
                    Start Live Chat
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Streaming Chat Interface */}
          {showChat && (
            <div className="border-t-2 border-timeback-primary mt-8 pt-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-timeback-primary font-cal">Live Chat with Education Expert</h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-timeback-primary hover:text-opacity-80 p-2 rounded-full hover:bg-timeback-bg transition-colors font-cal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Chat Messages */}
              <div className="bg-timeback-bg rounded-xl p-6 max-h-80 overflow-y-auto mb-6 border border-timeback-primary">
                {messages.length === 0 ? (
                  <div className="text-center text-timeback-primary py-12 font-cal">
                    <svg className="w-16 h-16 mx-auto mb-4 text-timeback-primary font-cal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.001 8.001 0 01-7.7-6M3 12c0-4.418 3.582-8 8-8s8 3.582 8 8" />
                    </svg>
                    <p className="text-lg font-cal">Ask me anything about {getSectionTitle(section)} and how it applies to your situation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-6 py-3 rounded-xl ${
                            message.role === 'user'
                              ? 'bg-timeback-primary text-white'
                              : 'bg-white border-2 border-timeback-primary text-timeback-primary'
                          }`}
                        >
                          <div className="text-sm leading-relaxed font-cal">
                            {message.parts.map((part, partIndex) => {
                              if (part.type === 'text') {
                                return (
                                  <ReactMarkdown 
                                    key={partIndex}
                                    components={{
                                      h1: ({children}) => <h1 className="text-base font-bold mb-2 font-cal">{children}</h1>,
                                      h2: ({children}) => <h2 className="text-sm font-bold mb-2 font-cal">{children}</h2>,
                                      h3: ({children}) => <h3 className="text-sm font-bold mb-1 font-cal">{children}</h3>,
                                      p: ({children}) => <p className="mb-2 last:mb-0 font-cal">{children}</p>,
                                      ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                      ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                      li: ({children}) => <li className="font-cal">{children}</li>,
                                      strong: ({children}) => <strong className="font-bold font-cal">{children}</strong>,
                                      em: ({children}) => <em className="italic font-cal">{children}</em>,
                                      code: ({children}) => <code className="bg-timeback-bg px-1 py-0.5 rounded text-xs font-mono border border-timeback-primary font-cal">{children}</code>,
                                      blockquote: ({children}) => <blockquote className="border-l-2 border-timeback-primary pl-2 my-2">{children}</blockquote>,
                                    }}
                                  >
                                    {part.text}
                                  </ReactMarkdown>
                                );
                              }
                              return null;
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border-2 border-timeback-primary px-6 py-3 rounded-xl">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-timeback-primary rounded-full animate-bounce"></div>
                            <div className="w-3 h-3 bg-timeback-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-3 h-3 bg-timeback-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Chat Input */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (chatInput.trim()) {
                    sendMessage({ text: chatInput });
                    setChatInput('');
                  }
                }}
                className="flex gap-3"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Ask about ${getSectionTitle(section)} and your specific situation...`}
                  className="flex-1 px-6 py-4 border-2 border-timeback-primary rounded-xl focus:border-timeback-primary focus:ring-2 focus:ring-timeback-primary focus:ring-opacity-30 text-timeback-primary placeholder:text-timeback-primary placeholder:opacity-60 font-cal text-lg"
                  disabled={isChatLoading}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="px-8 py-4 bg-timeback-primary text-white rounded-xl hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-bold font-cal text-lg"
                >
                  {isChatLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}