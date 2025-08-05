'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePostHog } from 'posthog-js/react';
import { QuizData, GeneratedContent } from '@/types/quiz';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PersonalizedResults from '@/components/PersonalizedResults';
import ProgressiveDisclosureContainer from '@/components/personalized/ProgressiveDisclosureContainer';
import { getCachedContent, getGenerationStatus } from '@/libs/optimisticContentGeneration';
import '../ui-animations.css';

// Quiz data and generated content interfaces are now imported from @/types/quiz

export default function PersonalizedPage() {
  const { data: session, status } = useSession();
  const posthog = usePostHog();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contentReadyStatus, setContentReadyStatus] = useState({
    dataLoaded: false,
    coreContentGenerated: false,
    pageStable: false
  });


  // Comprehensive loading system - wait for all content to be stable
  useEffect(() => {
    const loadQuizData = async () => {
      const timestamp = new Date().toISOString();
      console.log(`[PersonalizedPage] ${timestamp} Starting comprehensive data loading process`);
      console.log(`[PersonalizedPage] ${timestamp} Auth status:`, status, 'Session:', !!session?.user?.email);

      let loadedQuizData: QuizData | null = null;
      let loadedGeneratedContent: GeneratedContent | null = null;
      let source: 'database' | 'localStorage' = 'localStorage';

      // Phase 1: Load quiz data
      console.log(`[PersonalizedPage] ${timestamp} Phase 1: Loading quiz data`);
      
      // Try to load from database first if user is authenticated
      if (status === 'authenticated' && session?.user?.email) {
        console.log(`[PersonalizedPage] ${timestamp} User authenticated, attempting to load from database`);
        
        try {
          const response = await fetch('/api/quiz/save', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (response.ok) {
            const result = await response.json();
            console.log(`[PersonalizedPage] ${timestamp} Database response:`, {
              success: result.success,
              hasQuizData: !!result.data?.quizData,
              hasGeneratedContent: !!result.data?.generatedContent,
              hasCompletedQuiz: result.data?.hasCompletedQuiz
            });

            if (result.success && result.data?.quizData && result.data.hasCompletedQuiz) {
              loadedQuizData = result.data.quizData;
              loadedGeneratedContent = result.data.generatedContent;
              source = 'database';
              console.log(`[PersonalizedPage] ${timestamp} Successfully loaded from database:`, {
                userType: loadedQuizData.userType,
                schoolsCount: loadedQuizData.selectedSchools?.length || 0,
                interestsCount: loadedQuizData.kidsInterests?.length || 0
              });
            } else {
              console.log(`[PersonalizedPage] ${timestamp} No completed quiz found in database, falling back to localStorage`);
            }
          } else {
            console.log(`[PersonalizedPage] ${timestamp} Database request failed, falling back to localStorage:`, response.status);
          }
        } catch (error) {
          console.error(`[PersonalizedPage] ${timestamp} Error loading from database:`, error);
          console.log(`[PersonalizedPage] ${timestamp} Falling back to localStorage`);
        }
      } else {
        console.log(`[PersonalizedPage] ${timestamp} User not authenticated or session loading, using localStorage`);
      }

      // Fallback to localStorage if no database data found
      if (!loadedQuizData) {
        console.log(`[PersonalizedPage] ${timestamp} Loading from localStorage`);
        
        const savedQuizData = localStorage.getItem('timebackQuizData');
        const savedGeneratedContent = localStorage.getItem('timebackGeneratedContent');
        
        if (savedQuizData) {
          try {
            const parsedQuizData = JSON.parse(savedQuizData);
            console.log(`[PersonalizedPage] ${timestamp} Found localStorage quiz data:`, {
              userType: parsedQuizData.userType,
              schoolsCount: parsedQuizData.selectedSchools?.length || 0,
              interestsCount: parsedQuizData.kidsInterests?.length || 0
            });
            loadedQuizData = parsedQuizData;
            source = 'localStorage';
          } catch (error) {
            console.error(`[PersonalizedPage] ${timestamp} Failed to parse localStorage quiz data:`, error);
          }
        }

        if (savedGeneratedContent) {
          try {
            const parsedGeneratedContent = JSON.parse(savedGeneratedContent);
            console.log(`[PersonalizedPage] ${timestamp} Found localStorage generated content:`, {
              hasAfternoonActivities: !!parsedGeneratedContent.afternoonActivities,
              hasSubjectExamples: !!parsedGeneratedContent.subjectExamples,
              hasHowWeGetResults: !!parsedGeneratedContent.howWeGetResults,
              hasFollowUpQuestions: !!parsedGeneratedContent.followUpQuestions,
              allCompleted: parsedGeneratedContent.allCompleted,
              hasErrors: parsedGeneratedContent.hasErrors
            });
            loadedGeneratedContent = parsedGeneratedContent;
          } catch (error) {
            console.error(`[PersonalizedPage] ${timestamp} Failed to parse localStorage generated content:`, error);
          }
        }
      }

      // Check if we have any quiz data at all
      if (!loadedQuizData) {
        console.warn(`[PersonalizedPage] ${timestamp} No quiz data found in database or localStorage, redirecting to quiz`);
        window.location.href = '/quiz';
        return;
      }

      // Mark data as loaded
      setContentReadyStatus(prev => ({ ...prev, dataLoaded: true }));
      
      // Phase 2: Wait for optimistic content generation to complete
      console.log(`[PersonalizedPage] ${timestamp} Phase 2: Waiting for core content generation`);
      
      const waitForCoreContent = async () => {
        let attempts = 0;
        const maxAttempts = 60; // Wait up to 30 seconds (500ms * 60)
        
        while (attempts < maxAttempts) {
          const cachedContent = getCachedContent();
          const generationStatus = getGenerationStatus();
          
          if (cachedContent && generationStatus) {
            console.log(`[PersonalizedPage] ${timestamp} Checking content generation status (attempt ${attempts + 1}):`, {
              afternoonActivities: generationStatus.afternoonActivities,
              subjectExamples: generationStatus.subjectExamples,
              howWeGetResults: generationStatus.howWeGetResults,
              hasCompletionTime: !!cachedContent.completionTime
            });
            
            // Check if core content is ready (at least 3 of 5 sections completed or errored)
            const completedSections = Object.values(generationStatus).filter(
              status => status === 'completed' || status === 'error'
            ).length;
            
            if (completedSections >= 3 || cachedContent.completionTime) {
              console.log(`[PersonalizedPage] ${timestamp} Core content generation complete! Completed sections: ${completedSections}`);
              
              // Use the optimistically generated content
              if (!loadedGeneratedContent) {
                loadedGeneratedContent = {
                  afternoonActivities: cachedContent.afternoonActivities,
                  subjectExamples: cachedContent.subjectExamples,
                  howWeGetResults: cachedContent.howWeGetResults,
                  learningScience: cachedContent.learningScience,
                  dataShock: cachedContent.dataShock,
                  allCompleted: Object.values(generationStatus).every(status => status === 'completed'),
                  hasErrors: Object.values(generationStatus).some(status => status === 'error')
                };
              }
              
              setContentReadyStatus(prev => ({ ...prev, coreContentGenerated: true }));
              break;
            }
          }
          
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        if (attempts >= maxAttempts) {
          console.warn(`[PersonalizedPage] ${timestamp} Content generation timeout, proceeding anyway`);
          setContentReadyStatus(prev => ({ ...prev, coreContentGenerated: true }));
        }
      };

      await waitForCoreContent();

      // Phase 3: Set data and wait for page stability
      console.log(`[PersonalizedPage] ${timestamp} Phase 3: Setting data and ensuring page stability`);
      
      setQuizData(loadedQuizData);
      setGeneratedContent(loadedGeneratedContent);

      // Wait a moment for React to process the state updates
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mark page as stable
      setContentReadyStatus(prev => ({ ...prev, pageStable: true }));

      console.log(`[PersonalizedPage] ${timestamp} All phases complete - page ready to display:`, {
        source,
        hasQuizData: !!loadedQuizData,
        hasGeneratedContent: !!loadedGeneratedContent,
        totalLoadTime: Date.now() - new Date(timestamp).getTime()
      });

      // Track personalized page view with analytics
      posthog?.capture('personalized_page_viewed', {
        data_source: source,
        grade_level: loadedQuizData.selectedSchools?.[0]?.level,
        user_type: loadedQuizData.userType,
        parent_type: loadedQuizData.parentSubType,
        interests: loadedQuizData.kidsInterests,
        school_name: loadedQuizData.selectedSchools?.[0]?.name,
        is_authenticated: !!session?.user?.email,
        content_ready: true
      });

      // Wait one more moment to ensure everything is settled
      setTimeout(() => {
        setIsLoading(false);
      }, 200);
    };

    // Only start loading when session status is determined (not loading)
    if (status !== 'loading') {
      loadQuizData();
    }
  }, [status, session, posthog]);

  // Monitor content ready status
  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`[PersonalizedPage] ${timestamp} Content ready status:`, contentReadyStatus);
  }, [contentReadyStatus]);

  if (isLoading) {
    const getLoadingMessage = () => {
      if (!contentReadyStatus.dataLoaded) {
        return {
          title: "Loading Your Data",
          description: "Retrieving your quiz responses and preferences..."
        };
      } else if (!contentReadyStatus.coreContentGenerated) {
        return {
          title: "Generating Personalized Content", 
          description: "Our AI is creating custom content based on your child's interests..."
        };
      } else if (!contentReadyStatus.pageStable) {
        return {
          title: "Preparing Your Experience",
          description: "Finalizing your personalized learning report..."
        };
      } else {
        return {
          title: "Almost Ready",
          description: "Just a moment more..."
        };
      }
    };

    const { title, description } = getLoadingMessage();
    const progress = Object.values(contentReadyStatus).filter(Boolean).length / 3;

    return (
      <div className="min-h-screen bg-gradient-to-br from-timeback-bg to-white flex items-center justify-center">
        <div className="text-center p-8 font-cal">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-timeback-primary p-12 max-w-md mx-auto">
            <div className="mb-8">
              <div className="w-20 h-20 bg-timeback-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl font-cal">T</span>
              </div>
              <div className="w-16 h-16 border-4 border-timeback-bg border-t-timeback-primary rounded-full animate-spin mx-auto mb-6"></div>
              
              {/* Progress bar */}
              <div className="w-full bg-timeback-bg rounded-full h-2 mb-4">
                <div 
                  className="bg-timeback-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress * 100}%` }}
                ></div>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-timeback-primary mb-4 font-cal">{title}</h2>
            <p className="text-timeback-primary font-cal">{description}</p>
            
            {/* Phase indicators */}
            <div className="mt-6 flex justify-center space-x-2">
              <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${contentReadyStatus.dataLoaded ? 'bg-timeback-primary' : 'bg-timeback-bg'}`}></div>
              <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${contentReadyStatus.coreContentGenerated ? 'bg-timeback-primary' : 'bg-timeback-bg'}`}></div>
              <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${contentReadyStatus.pageStable ? 'bg-timeback-primary' : 'bg-timeback-bg'}`}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-timeback-bg to-white flex items-center justify-center">
        <div className="text-center p-8 font-cal">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-timeback-primary p-12 max-w-md mx-auto">
            <div className="mb-8">
              <div className="w-20 h-20 bg-timeback-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-2xl font-cal">T</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-timeback-primary mb-4 font-cal">Take Your Assessment First</h2>
            <p className="text-timeback-primary mb-8 font-cal">Complete our personalized learning assessment to see your custom results.</p>
            <a 
              href="/quiz" 
              className="bg-timeback-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all duration-200 shadow-2xl hover:shadow-2xl transform hover:scale-105 font-cal"
            >
              Start Assessment →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-timeback-bg to-white">
        {/* Hero Section - Personalized Greeting + School Report Card */}
        <PersonalizedResults 
          quizData={quizData} 
          preGeneratedContent={generatedContent}
        />
        
        {/* Progressive Disclosure System - All Content Sections */}
        <ProgressiveDisclosureContainer 
          quizData={quizData}
          preGeneratedContent={generatedContent}
          contentReady={contentReadyStatus.pageStable}
        />
      </main>
      <Footer />
    </>
  );
}