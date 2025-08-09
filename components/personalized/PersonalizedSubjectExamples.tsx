'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { AnimatedHeading } from '@/components/AnimatedHeading';

// Fast AnimatedHeading configurations - all animations complete in under 2 seconds
const fastAnimationConfig = {
  typingSpeed: 15,
  deletingSpeed: 10,
  pauseDuration: 300
};

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
  contentReady?: boolean;
  onInterestsChange?: (interests: string[]) => void;
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

export default function PersonalizedSubjectExamples({ interests = [], onLearnMore, preGeneratedContent, contentReady = true, onInterestsChange }: PersonalizedSubjectExamplesProps) {
  const [activeTab, setActiveTab] = useState('math');
  const [questions, setQuestions] = useState<Record<string, QuestionData | null>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [showSolution, setShowSolution] = useState<Record<string, boolean>>({});
  const [showInterestCollector, setShowInterestCollector] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState<boolean>(true);
  const [collectedInterests, setCollectedInterests] = useState<string[]>([]);
  
  // State for question input within computer screen
  const [questionInput, setQuestionInput] = useState('');
  const [isQuestionLoading, setIsQuestionLoading] = useState(false);
  const [questionResponses, setQuestionResponses] = useState<Array<{question: string, answer: string}>>([]);
  
  // State for LLM-generated preview text
  const [interestsPreview, setInterestsPreview] = useState<string>('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);
  
  // Ref for auto-scrolling chat messages
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fast animations that complete in under 2 seconds total
  

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

  const effectiveInterests = useMemo(() => (
    (collectedInterests && collectedInterests.length > 0) ? collectedInterests : interests
  ), [collectedInterests, interests]);

  const generateQuestion = useCallback(async (subject: string, interestsOverride?: string[]) => {
    const useInterests = interestsOverride && interestsOverride.length > 0 ? interestsOverride : effectiveInterests;
    console.log(`[PersonalizedSubjectExamples] Generating ${subject} question for interests:`, useInterests);
    
    setLoadingStates(prev => ({ ...prev, [subject]: true }));
    
    try {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interests: useInterests,
          subject: subject,
          gradeLevel: '6th' // Could be dynamic based on quiz data
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[PersonalizedSubjectExamples] API returned ${response.status}:`, errorText);
        throw new Error(`API error ${response.status}: ${errorText.substring(0, 200)}`);
      }

      const result = await response.json();
      console.log(`[PersonalizedSubjectExamples] ${subject} question generated:`, result);

      if (result.success) {
        setQuestions(prev => ({ ...prev, [subject]: result.data }));
      } else {
        console.error(`[PersonalizedSubjectExamples] Failed to generate ${subject} question:`, result.error);
        console.error(`[PersonalizedSubjectExamples] Full result:`, result);
        // Set fallback content
        setQuestions(prev => ({ 
          ...prev, 
          [subject]: {
            question: `Here's how ${subject} connects to ${(useInterests && useInterests[0]) || 'your interests'}...`,
            solution: 'Solution would be generated here.',
            learningObjective: `${subject} concepts`,
            interestConnection: `Related to ${(useInterests && useInterests[0]) || 'student interests'}`,
            nextSteps: 'Continue with more advanced problems'
          }
        }));
      }
    } catch (error) {
      console.error(`[PersonalizedSubjectExamples] Error generating ${subject} question:`, error);
      console.error(`[PersonalizedSubjectExamples] Error details:`, {
        message: error instanceof Error ? error.message : 'Unknown error',
        interests: useInterests,
        subject,
        gradeLevel: '6th',
        timestamp: new Date().toISOString()
      });
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
            interests: useInterests,
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
            question: `${subject} problem related to ${(useInterests && useInterests[0]) || 'your interests'} (AI temporarily unavailable)`,
            solution: 'Solution would be provided when AI service is restored.',
            learningObjective: `Core ${subject} concepts`,
            interestConnection: `Connected to ${(useInterests && useInterests[0]) || 'student interests'}`,
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
  }, [effectiveInterests]);

  // Track if questions have been initialized to prevent infinite re-renders
  const questionsInitialized = useRef(false);

  // Reset initialization when interests change
  const prevInterests = useRef<string[]>([]);
  useEffect(() => {
    const interestsChanged = JSON.stringify(prevInterests.current) !== JSON.stringify(interests);
    if (interestsChanged) {
      console.log('[PersonalizedSubjectExamples] Interests changed, resetting initialization:', {
        previous: prevInterests.current,
        current: interests
      });
      questionsInitialized.current = false;
      setQuestions({}); // Clear existing questions
      setLoadingStates({}); // Clear loading states
      prevInterests.current = [...interests];
    }
  }, [interests]);

  useEffect(() => {
    console.log('[PersonalizedSubjectExamples] useEffect ready for on-demand generation. No auto-generation on mount. Interests:', interests);
    if (!questionsInitialized.current) {
      questionsInitialized.current = true;
    }
  }, [interests]);

  // Auto-scroll removed to prevent unwanted scrolling behavior

  const handleTabChange = (subjectId: string) => {
    console.log(`[PersonalizedSubjectExamples] Switching to ${subjectId} tab`);
    setActiveTab(subjectId);
    // Defer generation until user clicks the action button after providing interests
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
    
    // Add user question to chat immediately
    setQuestionResponses(prev => [...prev, {
      question: userQuestion,
      answer: ''
    }]);
    
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
            interests: effectiveInterests,
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

      // Handle JSON response instead of streaming
      console.log('[PersonalizedSubjectExamples] Processing JSON response from chat-tutor API');
      const data = await response.json();
      
      if (data.success && data.response) {
        const fullResponse = data.response;
        console.log('[PersonalizedSubjectExamples] Full response received:', fullResponse.length, 'characters');

        // Update the last question response with the AI answer
        setQuestionResponses(prev => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1].answer = fullResponse;
          }
          return updated;
        });
      } else {
        throw new Error(data.error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('[PersonalizedSubjectExamples] Error with question:', error);
      // Update the last question response with error message
      setQuestionResponses(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1].answer = 'I apologize, but I encountered an error processing your question. Please try asking again.';
        }
        return updated;
      });
    } finally {
      setIsQuestionLoading(false);
    }
  };

  const currentQuestion = questions[activeTab];
  const isLoading = loadingStates[activeTab];

  // Interests collector (adapted inline from quiz UI)
  const collectorMainCategories = useMemo(() => ([
    { id: 'sports', title: 'Sports & Fitness', desc: 'Physical activities & athletics' },
    { id: 'arts', title: 'Arts & Creativity', desc: 'Visual arts, music & performance' },
    { id: 'science', title: 'Science & Nature', desc: 'Exploration & discovery' },
    { id: 'tech', title: 'Technology', desc: 'Gaming, coding & digital' },
    { id: 'reading', title: 'Reading & Writing', desc: 'Literature & storytelling' },
    { id: 'building', title: 'Building & Making', desc: 'Hands-on construction' },
    { id: 'social', title: 'Social & Culture', desc: 'People, history & languages' },
    { id: 'outdoor', title: 'Outdoor Adventures', desc: 'Nature & exploration' }
  ]), []);

  const collectorSubcategories: Record<string, string[]> = useMemo(() => ({
    sports: ['Basketball','Soccer','Swimming','Martial Arts','Dance','Running','Baseball','Gymnastics'],
    arts: ['Drawing','Painting','Music','Theater','Photography','Sculpture','Film Making','Fashion Design'],
    science: ['Biology','Chemistry','Physics','Astronomy','Environmental Science','Geology','Marine Biology','Robotics'],
    tech: ['Video Games','Coding','App Design','3D Modeling','Web Development','AI & Machine Learning','Electronics','VR/AR'],
    reading: ['Fiction Stories','Poetry','Comics','Journalism','Creative Writing','Research','Book Clubs','Storytelling'],
    building: ['LEGO Building','Woodworking','Model Making','Engineering','Crafts','Architecture','DIY Projects','Invention'],
    social: ['History','Geography','Languages','Cultural Studies','Community Service','Debate','Leadership','Travel'],
    outdoor: ['Hiking','Camping','Rock Climbing','Fishing','Bird Watching','Gardening','Survival Skills','Nature Photography']
  }), []);

  const toggleLocalInterest = (name: string) => {
    setCollectedInterests((prev) => prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]);
  };

  const onCollectorContinue = async () => {
    const timestamp = new Date().toISOString();
    console.log(`[PersonalizedSubjectExamples] ${timestamp} Collected interests:`, collectedInterests);
    setShowInterestCollector(false);
    if (onInterestsChange) {
      try {
        onInterestsChange(collectedInterests);
      } catch (e) {
        console.error('[PersonalizedSubjectExamples] onInterestsChange handler error:', e);
      }
    }
    if (!questions[activeTab] && !loadingStates[activeTab]) {
      await generateQuestion(activeTab, collectedInterests);
    }
  };

  return (
    <div className="backdrop-blur-md bg-white/15 rounded-3xl border border-timeback-primary/30 shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500">
      <div className="relative bg-gradient-to-r from-timeback-primary to-timeback-primary/90 p-6 lg:p-8">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
        <div className="relative flex items-center justify-center gap-3">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
          <h3 className="text-lg lg:text-xl font-bold text-white text-center font-cal">Interactive Learning Experience</h3>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="p-6 lg:p-8">
        <section className="w-full font-cal animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section with improved spacing and hierarchy */}
      <header className="text-center mb-16 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-3 backdrop-blur-md bg-timeback-bg/80 border border-timeback-primary rounded-full px-6 py-3 mb-8 shadow-lg">
          <div className="w-3 h-3 bg-timeback-primary rounded-full animate-pulse"></div>
          <span className="text-timeback-primary font-bold text-sm font-cal tracking-wide">INTERACTIVE LEARNING</span>
        </div>
        <AnimatedHeading 
          staticText="Learning Through Your Child's"
          animatedMessages={["Interests", "Passions", "Curiosity"]}
          className="mb-6"
          staticTextClassName=""
          animatedTextClassName=""
          typingSpeed={fastAnimationConfig.typingSpeed}
          deletingSpeed={fastAnimationConfig.deletingSpeed}
          pauseDuration={fastAnimationConfig.pauseDuration}
          oneTime={true}
        />
        <div className="text-lg sm:text-xl lg:text-2xl text-timeback-primary max-w-4xl mx-auto font-cal leading-relaxed">
          {isPreviewLoading ? (
            <div className="flex justify-center">
              <div className="animate-pulse bg-timeback-bg rounded-xl border border-timeback-primary px-32 py-4">&nbsp;</div>
            </div>
          ) : (
            <p>{interestsPreview}</p>
          )}
        </div>
      </header>

      {/* Subject Learning Interface */}
      <div className="max-w-5xl mx-auto backdrop-blur-md bg-timeback-bg/80 rounded-2xl shadow-xl border border-timeback-primary overflow-hidden">
        
        {/* Improved Mobile-Responsive Tabs */}
        <div className="border-b border-timeback-primary bg-gradient-to-r from-timeback-bg/50 to-timeback-bg/80">
          <div className="flex overflow-x-auto scrollbar-hide">
            <div className="flex min-w-full">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => handleTabChange(subject.id)}
                  className={`flex-1 min-w-[140px] sm:min-w-0 px-4 sm:px-6 lg:px-8 py-6 text-center transition-all duration-300 group relative ${
                    activeTab === subject.id
                      ? 'bg-timeback-primary text-white shadow-lg'
                      : 'text-timeback-primary hover:text-white hover:bg-timeback-primary/10'
                  }`}
                  aria-label={`Switch to ${subject.name} examples`}
                  role="tab"
                  aria-selected={activeTab === subject.id}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                      activeTab === subject.id ? 'bg-white/20' : 'group-hover:bg-timeback-primary/20'
                    }`}>
                      {subject.icon}
                    </div>
                    <div>
                      <div className="font-bold text-base lg:text-lg font-cal">{subject.name}</div>
                      <div className="text-xs lg:text-sm opacity-90 font-cal">{subject.description}</div>
                    </div>
                  </div>
                  
                  {/* Active indicator */}
                  {activeTab === subject.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/50"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area with improved spacing */}
        <div className="p-6 sm:p-8 lg:p-12">
          {showInterestCollector ? (
            <div className="space-y-6 lg:space-y-8">
              <div className="text-center space-y-3 font-cal">
                <div className="inline-flex items-center gap-2 bg-timeback-bg border border-timeback-primary rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 bg-timeback-primary rounded-full"></span>
                  <span className="text-timeback-primary font-semibold text-xs font-cal">TELL US THEIR INTERESTS</span>
                </div>
                <h3 className="text-2xl font-bold text-timeback-primary font-cal">What sparks your child's curiosity?</h3>
                <p className="text-base text-timeback-primary font-cal max-w-2xl mx-auto">Select a category and pick specific interests. Then continue to see a personalized {activeTab} question.</p>
              </div>
              {showCategories ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {collectorMainCategories.map((c) => (
                    <button key={c.id} onClick={() => { setSelectedCategory(c.id); setShowCategories(false); }} className="relative p-6 rounded-xl border-2 text-center transition-all duration-200 bg-white border-timeback-primary hover:bg-timeback-bg shadow-lg">
                      <div className="space-y-2">
                        <div className="font-bold text-timeback-primary font-cal">{c.title}</div>
                        <div className="text-xs text-timeback-primary font-cal opacity-80">{c.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-timeback-primary font-cal">Select specific {collectorMainCategories.find(x => x.id === selectedCategory)?.title} interests</h4>
                    <button onClick={() => { setShowCategories(true); setSelectedCategory(null); }} className="px-4 py-2 text-timeback-primary hover:bg-timeback-bg rounded-xl transition-all duration-200 font-cal flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      Back
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {selectedCategory && collectorSubcategories[selectedCategory].map((sub) => {
                      const isSelected = collectedInterests.includes(sub);
                      return (
                        <button key={sub} onClick={() => toggleLocalInterest(sub)} className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${isSelected ? 'border-timeback-primary bg-timeback-primary text-white shadow-xl' : 'border-timeback-primary bg-white text-timeback-primary hover:bg-timeback-bg shadow-lg'}`}>
                          <div className="font-semibold text-sm font-cal">{sub}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="bg-timeback-bg border-2 border-timeback-primary rounded-xl p-4">
                <h5 className="text-base font-bold text-timeback-primary mb-3 font-cal">Selected ({collectedInterests.length}):</h5>
                <div className="flex flex-wrap gap-2">
                  {collectedInterests.map((i) => (
                    <span key={i} className="inline-flex items-center px-3 py-1 rounded-full bg-timeback-primary text-white text-xs font-bold font-cal">{i}</span>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <button onClick={onCollectorContinue} disabled={collectedInterests.length === 0} className="px-8 py-3 rounded-xl font-bold text-base transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-timeback-primary focus:ring-offset-2 font-cal bg-timeback-primary text-white hover:bg-opacity-90 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  Continue to {activeTab} Example →
                </button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="text-center py-12 lg:py-16">
              <div className="bg-white/30 backdrop-blur-lg rounded-2xl border border-timeback-primary/50 p-8 max-w-md mx-auto shadow-lg">
                <div className="relative mb-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-3 border-timeback-primary/30 border-t-timeback-primary mx-auto"></div>
                  <div className="absolute inset-0 rounded-full bg-timeback-primary/10 animate-pulse"></div>
                </div>
                <h3 className="text-timeback-primary text-xl font-cal font-bold mb-2">Creating your personalized {activeTab} question</h3>
                <p className="text-timeback-primary/80 text-sm font-cal">Connecting {effectiveInterests && effectiveInterests[0] ? effectiveInterests[0] : 'your interests'} to {activeTab} concepts</p>
                <div className="mt-4 flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-timeback-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-timeback-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-timeback-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          ) : currentQuestion ? (
            <div className="space-y-6 lg:space-y-8">
              {/* Question Card */}
              <div className="p-4">
                <p className="font-cal text-timeback-primary">{currentQuestion.question}</p>
              </div>

              {/* Solution Toggle Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => toggleSolution(activeTab)}
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-timeback-primary text-white rounded-xl hover:bg-timeback-primary/90 transition-all duration-300 font-bold font-cal text-base lg:text-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-timeback-primary/30"
                  aria-expanded={showSolution[activeTab]}
                >
                  <svg className={`w-5 h-5 transition-transform duration-300 ${showSolution[activeTab] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {showSolution[activeTab] ? 'Hide Solution' : 'Show Solution & Explanation'}
                </button>
              </div>

              {/* Solution Section */}
              {showSolution[activeTab] && (
                <div className="bg-white/30 backdrop-blur-lg border border-timeback-primary/50 rounded-2xl p-6 lg:p-8 space-y-6 shadow-lg animate-in slide-in-from-top duration-300">
                  <div className="flex items-center gap-3 pb-4 border-b border-timeback-primary/30">
                    <div className="w-8 h-8 bg-timeback-primary rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                      </svg>
                    </div>
                    <h4 className="text-xl lg:text-2xl font-bold text-timeback-primary font-cal">Step-by-Step Solution</h4>
                  </div>
                  
                  <div className="text-timeback-primary leading-relaxed font-cal prose prose-lg max-w-none">
                    <ReactMarkdown 
                      components={{
                        h1: ({children}) => <h1 className="text-xl font-bold text-timeback-primary mb-3 font-cal">{children}</h1>,
                        h2: ({children}) => <h2 className="text-lg font-bold text-timeback-primary mb-3 font-cal">{children}</h2>,
                        h3: ({children}) => <h3 className="text-base font-bold text-timeback-primary mb-2 font-cal">{children}</h3>,
                        p: ({children}) => <p className="text-timeback-primary leading-relaxed mb-4 font-cal">{children}</p>,
                        ul: ({children}) => <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>,
                        li: ({children}) => (
                          <li className="text-timeback-primary font-cal [&>p]:inline [&>p]:mr-2 [&>p:last-child]:mr-0">
                            {children}
                          </li>
                        ),
                        strong: ({children}) => <strong className="font-bold text-timeback-primary font-cal">{children}</strong>,
                        em: ({children}) => <em className="italic text-timeback-primary font-cal">{children}</em>,
                        code: ({children}) => <code className="bg-timeback-primary/10 text-timeback-primary px-2 py-1 rounded text-sm font-mono border border-timeback-primary/30 font-cal">{children}</code>,
                        blockquote: ({children}) => <blockquote className="border-l-4 border-timeback-primary pl-4 py-2 my-3 bg-timeback-primary/5 text-timeback-primary font-cal rounded-r">{children}</blockquote>,
                      }}
                    >
                      {currentQuestion.solution}
                    </ReactMarkdown>
                  </div>
                  
                  <div className="bg-timeback-primary/10 rounded-xl p-4 lg:p-6 border border-timeback-primary/30">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-timeback-primary rounded-md flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z"/>
                        </svg>
                      </div>
                      <div>
                        <h5 className="font-bold text-timeback-primary mb-2 font-cal">Next Steps</h5>
                        <p className="text-timeback-primary font-cal leading-relaxed">{currentQuestion.nextSteps}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Interactive Chat Interface */}
              <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-timeback-primary/30">
                <div className="bg-white/20 backdrop-blur-lg border border-timeback-primary/50 rounded-2xl shadow-xl overflow-hidden">
                  
                  {/* Chat Header */}
                  <div className="bg-gradient-to-r from-timeback-primary/10 to-timeback-primary/5 border-b border-timeback-primary/30 p-4 lg:p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-timeback-primary rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M6,9H18V11H6M14,14H6V12H14M18,8H6V6H18"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-timeback-primary text-lg lg:text-xl font-cal">Ask About This Problem</h4>
                        <p className="text-timeback-primary/80 font-cal text-sm lg:text-base">Get clarification or additional examples</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area with better responsive height */}
                  <div className="h-64 sm:h-80 lg:h-96 overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-6 bg-gradient-to-b from-white/10 to-transparent">
                    {questionResponses.length === 0 && (
                      <div className="flex justify-start">
                        <div className="flex gap-3 max-w-[85%] lg:max-w-[80%]">
                          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-timeback-primary/80 backdrop-blur-sm border border-timeback-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,6V8H13V6H11M11,10V18H13V10H11Z"/>
                            </svg>
                          </div>
                          <div className="bg-white/40 backdrop-blur-sm border border-timeback-primary/40 rounded-2xl px-4 lg:px-6 py-3 lg:py-4 shadow-lg">
                            <p className="text-timeback-primary font-cal text-sm lg:text-base">Hi! I'm here to help you understand this {activeTab} problem. What would you like to know?</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {questionResponses.map((response, index) => (
                      <div key={index} className="space-y-3 lg:space-y-4">
                        {/* User Question */}
                        <div className="flex justify-end">
                          <div className="flex gap-3 max-w-[85%] lg:max-w-[80%] flex-row-reverse">
                            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-timeback-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                              <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                              </svg>
                            </div>
                            <div className="bg-timeback-primary text-white px-4 lg:px-6 py-3 lg:py-4 rounded-2xl shadow-lg font-cal">
                              <p className="font-cal text-sm lg:text-base">{response.question}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* AI Response */}
                        <div className="flex justify-start">
                          <div className="flex gap-3 max-w-[85%] lg:max-w-[80%]">
                            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-timeback-primary/80 backdrop-blur-sm border border-timeback-primary rounded-full flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,6V8H13V6H11M11,10V18H13V10H11Z"/>
                              </svg>
                            </div>
                            <div className="bg-white/40 backdrop-blur-sm border border-timeback-primary/40 rounded-2xl px-4 lg:px-6 py-3 lg:py-4 shadow-lg">
                              <ReactMarkdown 
                                components={{
                                  h1: ({children}) => <h1 className="text-base lg:text-lg font-bold text-timeback-primary mb-2 font-cal">{children}</h1>,
                                  h2: ({children}) => <h2 className="text-sm lg:text-base font-bold text-timeback-primary mb-2 font-cal">{children}</h2>,
                                  h3: ({children}) => <h3 className="text-sm font-bold text-timeback-primary mb-1 font-cal">{children}</h3>,
                                  p: ({children}) => <p className="text-timeback-primary leading-relaxed mb-2 last:mb-0 font-cal text-sm lg:text-base">{children}</p>,
                                  ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                  ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                  li: ({children}) => (
                                    <li className="text-timeback-primary font-cal text-sm lg:text-base [&>p]:inline [&>p]:mr-2 [&>p:last-child]:mr-0">
                                      {children}
                                    </li>
                                  ),
                                  strong: ({children}) => <strong className="font-bold text-timeback-primary font-cal">{children}</strong>,
                                  em: ({children}) => <em className="italic text-timeback-primary font-cal">{children}</em>,
                                  code: ({children}) => <code className="bg-timeback-primary/10 text-timeback-primary px-2 py-1 rounded text-xs font-mono border border-timeback-primary/30 font-cal">{children}</code>,
                                  blockquote: ({children}) => <blockquote className="border-l-4 border-timeback-primary pl-3 py-2 my-2 bg-timeback-primary/5 text-timeback-primary font-cal rounded-r">{children}</blockquote>,
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
                        <div className="flex gap-3 max-w-[85%] lg:max-w-[80%]">
                          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-timeback-primary/80 backdrop-blur-sm border border-timeback-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,6V8H13V6H11M11,10V18H13V10H11Z"/>
                            </svg>
                          </div>
                          <div className="bg-white/40 backdrop-blur-sm border border-timeback-primary/40 rounded-2xl px-4 lg:px-6 py-3 lg:py-4 shadow-lg">
                            <div className="flex items-center gap-3">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-timeback-primary rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-timeback-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-2 h-2 bg-timeback-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                              </div>
                              <span className="text-timeback-primary font-cal text-sm lg:text-base">TimeBack AI is thinking...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Enhanced Input Area */}
                  <div className="border-t border-timeback-primary/30 p-4 lg:p-6 bg-gradient-to-r from-timeback-primary/5 to-transparent">
                    <form onSubmit={handleQuestionSubmit} className="flex gap-3 lg:gap-4">
                      <input
                        type="text"
                        value={questionInput}
                        onChange={(e) => setQuestionInput(e.target.value)}
                        placeholder={`Ask about this ${activeTab} problem, need clarification, or want more examples...`}
                        className="flex-1 px-4 lg:px-6 py-3 lg:py-4 border border-timeback-primary/50 rounded-xl focus:ring-2 focus:ring-timeback-primary/30 focus:border-timeback-primary outline-none text-timeback-primary placeholder:text-timeback-primary/60 font-cal text-sm lg:text-base bg-white/50 backdrop-blur-sm shadow-sm"
                        disabled={isQuestionLoading}
                        aria-label="Ask a question about this problem"
                      />
                      <button
                        type="submit"
                        disabled={!questionInput.trim() || isQuestionLoading}
                        className="bg-timeback-primary text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-bold hover:bg-timeback-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 font-cal text-sm lg:text-base shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-timeback-primary/30"
                        aria-label="Send question"
                      >
                        {isQuestionLoading ? (
                          <div className="w-4 h-4 lg:w-5 lg:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : null}
                        Ask
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 lg:py-16">
              <div className="bg-white/30 backdrop-blur-lg rounded-2xl border border-timeback-primary/50 p-6 lg:p-8 max-w-md mx-auto shadow-lg">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-timeback-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-timeback-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
                    </svg>
                  </div>
                  <p className="text-timeback-primary mb-6 font-cal text-lg lg:text-xl">Ready to see how {activeTab} connects to {interests && interests[0] ? interests[0] : 'your interests'}?</p>
                </div>
                <button
                  onClick={() => {
                    if (!effectiveInterests || effectiveInterests.length === 0) {
                      console.log('[PersonalizedSubjectExamples] No interests present. Showing interest collector.');
                      setCollectedInterests([]);
                      setShowCategories(true);
                      setSelectedCategory(null);
                      setShowInterestCollector(true);
                    } else {
                      generateQuestion(activeTab);
                    }
                  }}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-timeback-primary text-white rounded-xl hover:bg-timeback-primary/90 transition-all duration-300 font-bold font-cal text-base lg:text-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-timeback-primary/30"
                  aria-label={`Generate personalized ${activeTab} question`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate My Question
                </button>
              </div>
            </div>
          )}
        </div>
      </div>






        </section>
      </div>
    </div>
  );
}