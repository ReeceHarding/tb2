'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuiz } from '../QuizContext';
import ContentGenerationService from '../../../libs/contentGeneration';
import { LoadingStepProps } from '@/types/quiz';

interface GenerationTask {
  id: string;
  name: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  progress: number;
  data?: any;
  error?: string;
}

export default function LoadingStep({ onNext, onPrev }: LoadingStepProps = {}) {
  const { state } = useQuiz();
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [generationTasks, setGenerationTasks] = useState<GenerationTask[]>([]);
  const [isGenerationComplete, setIsGenerationComplete] = useState(false);
  const [generationResults, setGenerationResults] = useState<any>(null);
  const [estimatedTime, setEstimatedTime] = useState(25); // Start countdown at 25 seconds
  const [currentContentIndex, setCurrentContentIndex] = useState(0); // For carousel navigation

  // Enhanced loading messages that reflect actual LLM generation
  const messages = [
    'Analyzing your quiz responses...',
    'Generating personalized afternoon activities...',
    'Creating custom subject examples...',
    'Building interactive questions...',
    'Crafting learning explanations...',
    'Optimizing content for your goals...',
    'Preparing your TimeBack experience...',
    'Almost ready to accelerate learning!'
  ];

  // Initialize and start parallel LLM content generation
  useEffect(() => {
    const startContentGeneration = async () => {
      const timestamp = new Date().toISOString();
      console.log(`[LoadingStep] ${timestamp} Starting parallel LLM content generation`);
      
      // Create quiz data object from state
      const quizData = {
        userType: state.userType,
        parentSubType: state.parentSubType,
        selectedSchools: state.selectedSchools,
        // learningGoals: state.learningGoals, - removed
        kidsInterests: state.kidsInterests,
        numberOfKids: state.numberOfKids
      };

      console.log(`[LoadingStep] ${timestamp} Quiz data prepared for generation:`, {
        userType: quizData.userType,
        schoolsCount: quizData.selectedSchools.length,
        // goalsCount: quizData.learningGoals.length, - removed
        interestsCount: quizData.kidsInterests.length
      });

      // Initialize content generation service with progress callback
      const contentService = new ContentGenerationService((tasks, allCompleted) => {
        const progressTimestamp = new Date().toISOString();
        console.log(`[LoadingStep] ${progressTimestamp} Content generation progress update:`, {
          totalTasks: tasks.length,
          completedTasks: tasks.filter(t => t.status === 'completed').length,
          errorTasks: tasks.filter(t => t.status === 'error').length,
          allCompleted
        });

        // Update generation tasks state
        setGenerationTasks([...tasks]);

        // Update overall progress based on task completion
        const overallProgress = contentService.getOverallProgress();
        setProgress(overallProgress);
        console.log(`[LoadingStep] ${progressTimestamp} Overall progress: ${overallProgress}%`);

        // When all generation is complete, prepare for redirect
        if (allCompleted && !isGenerationComplete) {
          console.log(`[LoadingStep] ${progressTimestamp} All LLM generation completed!`);
          setIsGenerationComplete(true);
        }
      });

      try {
        // Start all content generation in parallel
        const results = await contentService.generateAllContent(quizData);
        
        console.log(`[LoadingStep] ${timestamp} All content generation completed:`, {
          hasAfternoonActivities: !!results.afternoonActivities,
          hasSubjectExamples: !!results.subjectExamples,
          hasHowWeGetResults: !!results.howWeGetResults,
          hasFollowUpQuestions: !!results.followUpQuestions,
          allCompleted: results.allCompleted,
          hasErrors: results.hasErrors
        });

        // Store results for later use
        setGenerationResults(results);
        
        // Ensure progress reaches 100%
        setProgress(100);
        setIsGenerationComplete(true);

      } catch (error) {
        console.error(`[LoadingStep] ${timestamp} Error during content generation:`, error);
        
        // Even with errors, we should still proceed with fallback content
        setProgress(100);
        setIsGenerationComplete(true);
      }
    };

    // Start content generation when component mounts
    startContentGeneration();
  }, [state, isGenerationComplete]);

  // Countdown timer from 25 seconds
  useEffect(() => {
    console.log('[LoadingStep] Starting countdown from 25 seconds');
    
    const countdownInterval = setInterval(() => {
      setEstimatedTime(prev => {
        if (prev > 0) {
          // Speed up countdown when generation is complete
          if (isGenerationComplete && prev <= 3) {
            return Math.max(0, prev - 0.2); // Faster countdown in last 3 seconds
          }
          return prev - 1;
        }
        return 0;
      });
    }, 1000);
    
    return () => {
      console.log('[LoadingStep] Clearing countdown timer');
      clearInterval(countdownInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount
  
  // Speed up countdown at the end when complete
  useEffect(() => {
    if (isGenerationComplete && estimatedTime > 0 && estimatedTime <= 3) {
      console.log('[LoadingStep] Speeding up final countdown');
      const fastInterval = setInterval(() => {
        setEstimatedTime(prev => Math.max(0, prev - 0.1));
      }, 100);
      
      return () => clearInterval(fastInterval);
    }
  }, [isGenerationComplete, estimatedTime]);

  // Consistent message cycling (2 seconds per message like Clash Royale)
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % messages.length);
    }, 2000); // Consistent 2-second intervals

    return () => clearInterval(messageInterval);
  }, [messages.length]);

  console.log('[LoadingStep] Rendering loading step with progress:', progress, 'Generation complete:', isGenerationComplete, 'Current message index:', currentMessage);
  console.log('[LoadingStep] Generation tasks status:', generationTasks.map(t => ({ id: t.id, status: t.status, progress: t.progress })));

  // Log when generation becomes complete
  useEffect(() => {
    if (isGenerationComplete) {
      console.log('[LoadingStep] LLM content generation completed! Ready for redirect');
    }
  }, [isGenerationComplete]);

  // Handle redirection when generation is complete
  useEffect(() => {
    if (isGenerationComplete && progress === 100) {
      console.log('[LoadingStep] All content generated - showing completion effect');
      console.log('[LoadingStep] Starting 2-second countdown before redirecting to personalized page');
      
      // Start 2-second countdown before redirecting (shorter since generation took the time)
      const redirectTimer = setTimeout(() => {
        console.log('[LoadingStep] 2 seconds elapsed, redirecting to personalized page');
        console.log('[LoadingStep] Current URL before redirect:', window.location.href);
        console.log('[LoadingStep] Saving quiz data and generated content to localStorage');
        
        // Save quiz data and generated content to localStorage for personalized page
        try {
          const dataToSave = {
            userType: state.userType,
            parentSubType: state.parentSubType,
            selectedSchools: state.selectedSchools,
            // learningGoals: state.learningGoals, - removed
            kidsInterests: state.kidsInterests,
            numberOfKids: state.numberOfKids
          };

          localStorage.setItem('timebackQuizData', JSON.stringify(dataToSave));
          console.log('[LoadingStep] Quiz data saved successfully');

          // Save generated content if available
          if (generationResults) {
            localStorage.setItem('timebackGeneratedContent', JSON.stringify(generationResults));
            console.log('[LoadingStep] Generated content saved successfully:', {
              hasAfternoonActivities: !!generationResults.afternoonActivities,
              hasSubjectExamples: !!generationResults.subjectExamples,
              hasHowWeGetResults: !!generationResults.howWeGetResults,
              hasFollowUpQuestions: !!generationResults.followUpQuestions
            });
          }
        } catch (error) {
          console.error('[LoadingStep] Failed to save data:', error);
        }
        
        // Proceed to AuthStep using onNext callback (proper quiz flow)
        const timestamp = new Date().toISOString();
        if (onNext) {
          console.log(`[LoadingStep] ${timestamp} Content generation complete - proceeding to AuthStep via onNext callback`);
          onNext();
        } else {
          console.log(`[LoadingStep] ${timestamp} No onNext callback available - redirecting directly to personalized as fallback`);
          router.push('/personalized');
        }
      }, 2000); // Reduced to 2 seconds since actual generation time is the main delay
      
      return () => {
        console.log('[LoadingStep] Cleanup: clearing redirect timer');
        clearTimeout(redirectTimer);
      };
    }
  }, [isGenerationComplete, progress, state, generationResults, onNext, router]);

  // Content sections for the carousel - now with video as first section
  const contentSections = [
    // Section 1: Introduction Video
    (
      <div key="intro-video" className="w-full">
        <div className="bg-gradient-to-br from-timeback-bg to-white rounded-2xl p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-timeback-primary mb-4 text-center font-cal">
            Watch How TimeBack Transforms Education
          </h3>
          <div className="relative aspect-video bg-timeback-primary rounded-xl overflow-hidden shadow-2xl">
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/DgS9qJuN4nI?autoplay=1&mute=1&rel=0&modestbranding=1"
              title="TimeBack Introduction"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p className="text-center text-timeback-primary mt-4 text-sm font-cal">
            See real students share their TimeBack success stories
          </p>
        </div>
      </div>
    ),
    
    // Section 2: The Science Behind TimeBack
    (
      <div key="science-behind" className="bg-gradient-to-br from-timeback-bg to-white rounded-2xl p-8 shadow-sm">
        <h3 className="text-2xl font-bold text-timeback-primary mb-6 text-center font-cal">
          The Science Behind 2x Faster Learning
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm transform hover:scale-105 transition-transform">
            <div className="text-4xl mb-3 font-cal">🧠</div>
            <h4 className="font-semibold text-timeback-primary mb-2 font-cal">Spaced Repetition</h4>
            <p className="text-sm text-timeback-primary font-cal">
              Our AI optimizes review timing based on forgetting curves, ensuring information moves from short-term to long-term memory efficiently.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm transform hover:scale-105 transition-transform">
            <div className="text-4xl mb-3 font-cal">🎯</div>
            <h4 className="font-semibold text-timeback-primary mb-2 font-cal">Active Recall</h4>
            <p className="text-sm text-timeback-primary font-cal">
              Students actively retrieve information rather than passively review, strengthening neural pathways 3x faster.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm transform hover:scale-105 transition-transform">
            <div className="text-4xl mb-3 font-cal">⚡</div>
            <h4 className="font-semibold text-timeback-primary mb-2 font-cal">Flow State Learning</h4>
            <p className="text-sm text-timeback-primary font-cal">
              Perfectly calibrated challenge levels keep students in the optimal zone for accelerated skill acquisition.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm transform hover:scale-105 transition-transform">
            <div className="text-4xl mb-3 font-cal">🔄</div>
            <h4 className="font-semibold text-timeback-primary mb-2 font-cal">Immediate Feedback</h4>
            <p className="text-sm text-timeback-primary font-cal">
              Real-time correction prevents bad habits from forming and accelerates the mastery process.
            </p>
          </div>
        </div>
      </div>
    ),
    
    // Section 3: A Day in the Life
    (
      <div key="day-in-life" className="bg-gradient-to-br from-timeback-bg to-white rounded-2xl p-8 shadow-sm">
        <h3 className="text-2xl font-bold text-timeback-primary mb-6 text-center font-cal">
          A Day in the Life of a TimeBack Student
        </h3>
        <div className="space-y-4">
          <div className="flex items-center bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl mr-4 font-cal">🌅</div>
            <div className="flex-1">
              <div className="font-semibold text-timeback-primary font-cal">8:00 AM - 10:00 AM</div>
              <div className="text-sm text-timeback-primary font-cal">Focused academic learning with AI tutor - Math, Science, English</div>
            </div>
            <div className="text-timeback-primary font-bold font-cal">2 hrs</div>
          </div>
          <div className="flex items-center bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl mr-4 font-cal">🏃</div>
            <div className="flex-1">
              <div className="font-semibold text-timeback-primary font-cal">10:30 AM - 12:00 PM</div>
              <div className="text-sm text-timeback-primary font-cal">Sports practice - Soccer, basketball, or swimming</div>
            </div>
            <div className="text-timeback-primary font-bold font-cal">1.5 hrs</div>
          </div>
          <div className="flex items-center bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl mr-4 font-cal">🎨</div>
            <div className="flex-1">
              <div className="font-semibold text-timeback-primary font-cal">1:00 PM - 3:00 PM</div>
              <div className="text-sm text-timeback-primary font-cal">Creative pursuits - Art, music, drama, or coding</div>
            </div>
            <div className="text-purple-600 font-bold font-cal">2 hrs</div>
          </div>
          <div className="flex items-center bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl mr-4 font-cal">🚀</div>
            <div className="flex-1">
              <div className="font-semibold text-timeback-primary font-cal">3:30 PM - 5:00 PM</div>
              <div className="text-sm text-timeback-primary font-cal">Life skills - Entrepreneurship, public speaking, or community service</div>
            </div>
            <div className="text-orange-600 font-bold font-cal">1.5 hrs</div>
          </div>
        </div>
        <div className="mt-6 text-center bg-timeback-bg rounded-xl p-4 font-cal">
          <p className="text-timeback-primary font-semibold font-cal">
            Result: Well-rounded, happy kids who excel academically AND in life!
          </p>
        </div>
      </div>
    ),
    
    // Section 4: Parent Testimonials
    (
      <div key="parent-testimonials" className="bg-gradient-to-br from-timeback-bg to-white rounded-2xl p-8 shadow-sm">
        <h3 className="text-2xl font-bold text-timeback-primary mb-6 text-center font-cal">
          What Parents Are Saying
        </h3>
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm relative">
            <div className="absolute -top-3 -left-3 text-4xl text-orange-400 font-cal">&ldquo;</div>
            <p className="text-timeback-primary mb-3 italic font-cal">
              My daughter went from struggling in math to being 2 grade levels ahead in just 6 months. 
              But what really amazes me is how much happier she is now that she has time for gymnastics every day!
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-timeback-bg rounded-full mr-3"></div>
              <div>
                <div className="font-semibold text-timeback-primary font-cal">Jennifer M.</div>
                <div className="text-sm text-timeback-primary font-cal">Mother of 2</div>
              </div>
              <div className="ml-auto">
                <div className="flex text-yellow-400 font-cal">
                  ★★★★★
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm relative">
            <div className="absolute -top-3 -left-3 text-4xl text-orange-400 font-cal">&ldquo;</div>
            <p className="text-timeback-primary mb-3 italic font-cal">
              We were skeptical at first, but the results speak for themselves. Our son scored in the 99th 
              percentile on his standardized tests AND started his own small business at age 11!
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-timeback-bg rounded-full mr-3"></div>
              <div>
                <div className="font-semibold text-timeback-primary font-cal">David L.</div>
                <div className="text-sm text-timeback-primary font-cal">Father of 3</div>
              </div>
              <div className="ml-auto">
                <div className="flex text-yellow-400 font-cal">
                  ★★★★★
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    
    // Section 5: Fun Facts About Learning
    (
      <div key="fun-facts" className="bg-gradient-to-br from-timeback-bg to-white rounded-2xl p-8 shadow-sm">
        <h3 className="text-2xl font-bold text-timeback-primary mb-6 text-center font-cal">
          Did You Know? Fun Learning Facts!
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-indigo-500">
            <p className="text-sm text-timeback-primary font-cal">
              <span className="font-bold text-indigo-600 font-cal">Your brain</span> creates new neural pathways 
              every time you learn something new - and TimeBack optimizes this process!
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-timeback-primary">
            <p className="text-sm text-timeback-primary font-cal">
              <span className="font-bold text-timeback-primary font-cal">Students who play music</span> score 20% higher 
              in math - that&apos;s why TimeBack includes afternoon arts programs!
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
            <p className="text-sm text-timeback-primary font-cal">
              <span className="font-bold text-purple-600 font-cal">Physical exercise</span> increases brain function 
              by 30% - TimeBack students are active every single day!
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-teal-500">
            <p className="text-sm text-timeback-primary font-cal">
              <span className="font-bold text-teal-600 font-cal">Personalized learning</span> is 2-3x more effective 
              than one-size-fits-all education - exactly what TimeBack provides!
            </p>
          </div>
        </div>
        <div className="mt-6 text-center font-cal">
          <div className="inline-flex items-center bg-timeback-bg rounded-full px-6 py-3">
            <span className="text-timeback-primary font-semibold font-cal">
              Your personalized plan is being crafted by our AI right now!
            </span>
          </div>
        </div>
      </div>
    )
  ];

  return (
            <div className="min-h-screen bg-gradient-to-br from-timeback-bg to-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Compact Progress Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Animated Loading Icon */}
              <div className="relative">
                <div className="w-16 h-16 border-3 border-timeback-primary border-t-timeback-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-timeback-primary font-cal">{Math.min(Math.floor(progress), 100)}%</span>
                </div>
              </div>
              
              {/* Progress Info */}
              <div>
                <p className="text-lg font-semibold text-timeback-primary font-cal">{messages[currentMessage]}</p>
                <p className="text-sm text-timeback-primary font-cal">
                  {estimatedTime > 0 ? (
                    <>Time remaining: <span className="font-medium font-cal">
                      {estimatedTime <= 3 && isGenerationComplete ? estimatedTime.toFixed(1) : Math.ceil(estimatedTime)}s
                    </span></>
                  ) : progress < 100 ? (
                    <>Finalizing your experience...</>
                  ) : (
                    <>Your personalized plan is ready!</>
                  )}
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="flex-1 max-w-xs ml-6">
              <div className="w-full bg-timeback-bg rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-timeback-primary to-timeback-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Content Header */}
          <div className="bg-gradient-to-r from-timeback-primary to-timeback-primary text-white p-6 font-cal">
            <h2 className="text-2xl font-bold text-center font-cal">
              Discover What Makes TimeBack Different
            </h2>
            <p className="text-center text-white mt-2 font-cal">
              Learn how we revolutionize education while we prepare your personalized plan
            </p>
          </div>
          
          {/* Content Carousel Container */}
          <div className="relative">
            {/* Navigation Arrows - Now Inside the Container */}
            <button
              onClick={() => setCurrentContentIndex(Math.max(0, currentContentIndex - 1))}
              disabled={currentContentIndex === 0}
              className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-2xl ${
                currentContentIndex === 0 
                  ? 'bg-timeback-bg text-timeback-primary cursor-not-allowed opacity-50' 
                  : 'bg-white text-timeback-primary hover:bg-timeback-bg hover:shadow-2xl'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => setCurrentContentIndex(Math.min(contentSections.length - 1, currentContentIndex + 1))}
              disabled={currentContentIndex === contentSections.length - 1}
              className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-2xl ${
                currentContentIndex === contentSections.length - 1 
                  ? 'bg-timeback-bg text-timeback-primary cursor-not-allowed opacity-50' 
                  : 'bg-white text-timeback-primary hover:bg-timeback-bg hover:shadow-2xl'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Content Display Area */}
            <div className="overflow-hidden px-4 py-8">
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentContentIndex * 100}%)` }}
              >
                {contentSections.map((section, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4">
                    <div className="max-w-4xl mx-auto">
                      {section}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Indicators */}
            <div className="absolute bottom-4 left-0 right-0">
              <div className="flex justify-center items-center space-x-2">
                {contentSections.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentContentIndex(index)}
                    className={`transition-all duration-300 ${
                      index === currentContentIndex 
                        ? 'w-8 h-2 bg-timeback-primary rounded-full' 
                        : 'w-2 h-2 bg-timeback-bg hover:bg-timeback-bg rounded-full'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Completion Notification */}
        {progress === 100 && isGenerationComplete && (
                      <div className="mt-6 bg-timeback-bg border border-timeback-primary rounded-xl p-6 text-center font-cal">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-timeback-bg rounded-full mb-3">
              <svg className="w-6 h-6 text-timeback-primary font-cal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-timeback-primary font-semibold font-cal">Your personalized learning plan is ready!</p>
            <p className="text-timeback-primary text-sm mt-1 font-cal">Redirecting you to your results...</p>
          </div>
        )}
      </div>
    </div>
  );
}