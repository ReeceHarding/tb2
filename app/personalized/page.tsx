'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePostHog } from 'posthog-js/react';
import { QuizData, GeneratedContent } from '@/types/quiz';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PersonalizedResults from '@/components/PersonalizedResults';
import ProgressiveDisclosureContainer from '@/components/personalized/ProgressiveDisclosureContainer';
import { getCachedContent, getGenerationStatus, startOptimisticGeneration } from '@/libs/optimisticContentGeneration';
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
      const startTime = performance.now();
      const timestamp = new Date().toISOString();
      console.log(`🚀 [PersonalizedPage] ${timestamp} ========== STARTING COMPREHENSIVE DATA LOADING PROCESS ==========`);
      console.log(`🔐 [PersonalizedPage] ${timestamp} Auth status: ${status}, Session exists: ${!!session?.user?.email}, User email: ${session?.user?.email || 'none'}`);
      console.log(`📊 [PersonalizedPage] ${timestamp} Initial content ready status:`, contentReadyStatus);

      let loadedQuizData: QuizData | null = null;
      let loadedGeneratedContent: GeneratedContent | null = null;
      let source: 'database' | 'localStorage' = 'localStorage';

      // Phase 1: Load quiz data
      console.log(`📋 [PersonalizedPage] ${timestamp} ===== PHASE 1: LOADING QUIZ DATA =====`);
      
      // Try to load from database first if user is authenticated
      if (status === 'authenticated' && session?.user?.email) {
        console.log(`🔑 [PersonalizedPage] ${timestamp} User authenticated (${session.user.email}), attempting database load`);
        
        const dbStartTime = performance.now();
        try {
          console.log(`🌐 [PersonalizedPage] ${timestamp} Making GET request to /api/quiz/save...`);
          const response = await fetch('/api/quiz/save', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          const dbLatency = performance.now() - dbStartTime;
          console.log(`⏱️ [PersonalizedPage] ${timestamp} Database request completed in ${dbLatency.toFixed(2)}ms, status: ${response.status}`);

          if (response.ok) {
            const result = await response.json();
            console.log(`✅ [PersonalizedPage] ${timestamp} Database response structure:`, {
              success: result.success,
              hasData: !!result.data,
              hasQuizData: !!result.data?.quizData,
              hasGeneratedContent: !!result.data?.generatedContent,
              hasCompletedQuiz: result.data?.hasCompletedQuiz,
              dataKeys: result.data ? Object.keys(result.data) : []
            });

            if (result.success && result.data?.quizData && result.data.hasCompletedQuiz) {
              loadedQuizData = result.data.quizData;
              loadedGeneratedContent = result.data.generatedContent;
              source = 'database';
              console.log(`🎯 [PersonalizedPage] ${timestamp} Successfully loaded from database:`, {
                userType: loadedQuizData.userType,
                parentSubType: loadedQuizData.parentSubType,
                schoolsCount: loadedQuizData.selectedSchools?.length || 0,
                interestsCount: loadedQuizData.kidsInterests?.length || 0,
                interests: loadedQuizData.kidsInterests || [],
                hasGeneratedContent: !!loadedGeneratedContent
              });
            } else {
              console.log(`⚠️ [PersonalizedPage] ${timestamp} Database data incomplete - success: ${result.success}, hasQuizData: ${!!result.data?.quizData}, hasCompletedQuiz: ${result.data?.hasCompletedQuiz}`);
              console.log(`🔄 [PersonalizedPage] ${timestamp} Falling back to localStorage`);
            }
          } else {
            console.log(`❌ [PersonalizedPage] ${timestamp} Database request failed with status ${response.status}, falling back to localStorage`);
          }
        } catch (error) {
          const dbLatency = performance.now() - dbStartTime;
          console.error(`💥 [PersonalizedPage] ${timestamp} Database error after ${dbLatency.toFixed(2)}ms:`, error);
          console.log(`🔄 [PersonalizedPage] ${timestamp} Error details:`, {
            name: error.name,
            message: error.message,
            stack: error.stack?.split('\n').slice(0, 3)
          });
          console.log(`🔄 [PersonalizedPage] ${timestamp} Falling back to localStorage due to error`);
        }
      } else {
        console.log(`🔒 [PersonalizedPage] ${timestamp} User not authenticated (status: ${status}) or session loading, using localStorage directly`);
      }

      // Fallback to localStorage if no database data found
      if (!loadedQuizData) {
        console.log(`💾 [PersonalizedPage] ${timestamp} ===== LOADING FROM LOCALSTORAGE =====`);
        
        const localStartTime = performance.now();
        const savedQuizData = localStorage.getItem('timebackQuizData');
        const savedGeneratedContent = localStorage.getItem('timebackGeneratedContent');
        
        console.log(`🔍 [PersonalizedPage] ${timestamp} LocalStorage inspection:`, {
          hasQuizData: !!savedQuizData,
          hasGeneratedContent: !!savedGeneratedContent,
          quizDataSize: savedQuizData ? `${savedQuizData.length} chars` : 'none',
          generatedContentSize: savedGeneratedContent ? `${savedGeneratedContent.length} chars` : 'none'
        });
        
        if (savedQuizData) {
          try {
            console.log(`📖 [PersonalizedPage] ${timestamp} Parsing localStorage quiz data...`);
            const parsedQuizData = JSON.parse(savedQuizData);
            console.log(`✅ [PersonalizedPage] ${timestamp} Successfully parsed localStorage quiz data:`, {
              userType: parsedQuizData.userType,
              parentSubType: parsedQuizData.parentSubType,
              schoolsCount: parsedQuizData.selectedSchools?.length || 0,
              interestsCount: parsedQuizData.kidsInterests?.length || 0,
              interests: parsedQuizData.kidsInterests || [],
              dataKeys: Object.keys(parsedQuizData),
              isCompleted: !!parsedQuizData.isCompleted
            });
            loadedQuizData = parsedQuizData;
            source = 'localStorage';
          } catch (error) {
            console.error(`💥 [PersonalizedPage] ${timestamp} Failed to parse localStorage quiz data:`, error);
            console.log(`🔍 [PersonalizedPage] ${timestamp} Raw quiz data sample:`, savedQuizData.substring(0, 200) + '...');
          }
        } else {
          console.log(`❌ [PersonalizedPage] ${timestamp} No quiz data found in localStorage`);
        }

        if (savedGeneratedContent) {
          try {
            console.log(`📖 [PersonalizedPage] ${timestamp} Parsing localStorage generated content...`);
            const parsedGeneratedContent = JSON.parse(savedGeneratedContent);
            console.log(`✅ [PersonalizedPage] ${timestamp} Successfully parsed localStorage generated content:`, {
              hasAfternoonActivities: !!parsedGeneratedContent.afternoonActivities,
              hasSubjectExamples: !!parsedGeneratedContent.subjectExamples,
              hasHowWeGetResults: !!parsedGeneratedContent.howWeGetResults,
              hasLearningScience: !!parsedGeneratedContent.learningScience,
              hasDataShock: !!parsedGeneratedContent.dataShock,
              hasFollowUpQuestions: !!parsedGeneratedContent.followUpQuestions,
              allCompleted: parsedGeneratedContent.allCompleted,
              hasErrors: parsedGeneratedContent.hasErrors,
              contentKeys: Object.keys(parsedGeneratedContent)
            });
            loadedGeneratedContent = parsedGeneratedContent;
          } catch (error) {
            console.error(`💥 [PersonalizedPage] ${timestamp} Failed to parse localStorage generated content:`, error);
            console.log(`🔍 [PersonalizedPage] ${timestamp} Raw generated content sample:`, savedGeneratedContent.substring(0, 200) + '...');
          }
        } else {
          console.log(`❌ [PersonalizedPage] ${timestamp} No generated content found in localStorage`);
        }
        
        const localLatency = performance.now() - localStartTime;
        console.log(`⏱️ [PersonalizedPage] ${timestamp} LocalStorage processing completed in ${localLatency.toFixed(2)}ms`);
      }

      // Check if we have any quiz data at all
      if (!loadedQuizData) {
        console.error(`🚨 [PersonalizedPage] ${timestamp} CRITICAL: No quiz data found in any source!`);
        console.log(`🔄 [PersonalizedPage] ${timestamp} Redirecting to quiz page for data collection`);
        window.location.href = '/quiz';
        return;
      }

      console.log(`✅ [PersonalizedPage] ${timestamp} Phase 1 Complete - Quiz data loaded from ${source}`);

      // Mark data as loaded
      console.log(`📊 [PersonalizedPage] ${timestamp} Updating content ready status: dataLoaded = true`);
      setContentReadyStatus(prev => ({ ...prev, dataLoaded: true }));
      
      // Phase 2: Wait for optimistic content generation to complete
      console.log(`🤖 [PersonalizedPage] ${timestamp} ===== PHASE 2: WAITING FOR CONTENT GENERATION =====`);
      
      const waitForCoreContent = async () => {
        const contentStartTime = performance.now();
        let attempts = 0;
        const maxAttempts = 60; // Wait up to 30 seconds (500ms * 60)
        
        console.log(`⏳ [PersonalizedPage] ${timestamp} Starting content generation monitoring (max ${maxAttempts} attempts)`);
        
        // Check if content generation needs to be started
        let initialCachedContent = getCachedContent();
        if (!initialCachedContent && loadedQuizData) {
          console.log(`🚀 [PersonalizedPage] ${timestamp} No cached content found, starting content generation...`);
          try {
            startOptimisticGeneration(loadedQuizData).catch(error => {
              console.error(`💥 [PersonalizedPage] ${timestamp} Failed to start content generation:`, error);
            });
            // Give it a moment to initialize
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`💥 [PersonalizedPage] ${timestamp} Error initiating content generation:`, error);
          }
        }
        
        while (attempts < maxAttempts) {
          const checkStart = performance.now();
          const cachedContent = getCachedContent();
          const generationStatus = getGenerationStatus();
          
          console.log(`🔍 [PersonalizedPage] ${timestamp} Content check #${attempts + 1}:`, {
            hasCachedContent: !!cachedContent,
            hasGenerationStatus: !!generationStatus,
            cacheStartTime: cachedContent?.startTime ? new Date(cachedContent.startTime).toISOString() : 'none',
            cacheCompletionTime: cachedContent?.completionTime ? new Date(cachedContent.completionTime).toISOString() : 'none'
          });
          
          if (cachedContent && generationStatus) {
            const statusDetails = {
              afternoonActivities: generationStatus.afternoonActivities,
              subjectExamples: generationStatus.subjectExamples,
              howWeGetResults: generationStatus.howWeGetResults,
              learningScience: generationStatus.learningScience,
              dataShock: generationStatus.dataShock,
              hasCompletionTime: !!cachedContent.completionTime,
              totalGenerationTime: cachedContent.completionTime ? `${cachedContent.completionTime - cachedContent.startTime}ms` : 'in progress'
            };
            
            console.log(`📋 [PersonalizedPage] ${timestamp} Generation status details:`, statusDetails);
            
            // Check if core content is ready (at least 3 of 5 sections completed or errored)
            const completedSections = Object.values(generationStatus).filter(
              status => status === 'completed' || status === 'error'
            ).length;
            const errorSections = Object.values(generationStatus).filter(
              status => status === 'error'
            ).length;
            
            console.log(`📊 [PersonalizedPage] ${timestamp} Content completion summary:`, {
              completedSections,
              errorSections,
              totalSections: Object.values(generationStatus).length,
              completionThreshold: 3,
              meetsThreshold: completedSections >= 3,
              allCompleted: cachedContent.completionTime
            });
            
            if (completedSections >= 3 || cachedContent.completionTime) {
              const contentLatency = performance.now() - contentStartTime;
              console.log(`🎉 [PersonalizedPage] ${timestamp} PHASE 2 COMPLETE! Content generation ready after ${contentLatency.toFixed(2)}ms`);
              console.log(`📈 [PersonalizedPage] ${timestamp} Final content stats:`, {
                completedSections,
                errorSections,
                successRate: `${Math.round((completedSections - errorSections) / Object.values(generationStatus).length * 100)}%`
              });
              
              // Use the optimistically generated content
              if (!loadedGeneratedContent) {
                console.log(`🔄 [PersonalizedPage] ${timestamp} Using optimistically generated content as primary source`);
                loadedGeneratedContent = {
                  afternoonActivities: cachedContent.afternoonActivities,
                  subjectExamples: cachedContent.subjectExamples,
                  howWeGetResults: cachedContent.howWeGetResults,
                  learningScience: cachedContent.learningScience,
                  dataShock: cachedContent.dataShock,
                  allCompleted: Object.values(generationStatus).every(status => status === 'completed'),
                  hasErrors: Object.values(generationStatus).some(status => status === 'error')
                };
                console.log(`✅ [PersonalizedPage] ${timestamp} Generated content structure:`, {
                  hasAfternoonActivities: !!loadedGeneratedContent.afternoonActivities,
                  hasSubjectExamples: !!loadedGeneratedContent.subjectExamples,
                  hasHowWeGetResults: !!loadedGeneratedContent.howWeGetResults,
                  hasLearningScience: !!loadedGeneratedContent.learningScience,
                  hasDataShock: !!loadedGeneratedContent.dataShock,
                  allCompleted: loadedGeneratedContent.allCompleted,
                  hasErrors: loadedGeneratedContent.hasErrors
                });
              } else {
                console.log(`ℹ️ [PersonalizedPage] ${timestamp} Using existing loaded generated content (skipping optimistic cache)`);
              }
              
              console.log(`📊 [PersonalizedPage] ${timestamp} Updating content ready status: coreContentGenerated = true`);
              setContentReadyStatus(prev => ({ ...prev, coreContentGenerated: true }));
              break;
            } else {
              console.log(`⏳ [PersonalizedPage] ${timestamp} Still waiting... ${completedSections}/5 sections complete (need 3+)`);
            }
          } else {
            console.log(`❓ [PersonalizedPage] ${timestamp} Content cache not yet available (cache: ${!!cachedContent}, status: ${!!generationStatus})`);
          }
          
          attempts++;
          const checkLatency = performance.now() - checkStart;
          console.log(`⏱️ [PersonalizedPage] ${timestamp} Check #${attempts} completed in ${checkLatency.toFixed(2)}ms, waiting 500ms...`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        if (attempts >= maxAttempts) {
          const totalWaitTime = performance.now() - contentStartTime;
          console.warn(`⏰ [PersonalizedPage] ${timestamp} Content generation timeout after ${totalWaitTime.toFixed(2)}ms (${attempts} attempts)`);
          console.log(`🔄 [PersonalizedPage] ${timestamp} Proceeding with whatever content is available`);
          console.log(`📊 [PersonalizedPage] ${timestamp} Updating content ready status: coreContentGenerated = true (timeout)`);
          setContentReadyStatus(prev => ({ ...prev, coreContentGenerated: true }));
        }
      };

      await waitForCoreContent();

      // Phase 3: Set data and wait for page stability  
      console.log(`🎯 [PersonalizedPage] ${timestamp} ===== PHASE 3: FINALIZING PAGE STABILITY =====`);
      
      const phase3StartTime = performance.now();
      console.log(`📝 [PersonalizedPage] ${timestamp} Setting React state with loaded data...`);
      console.log(`📊 [PersonalizedPage] ${timestamp} Final data summary:`, {
        quizDataKeys: loadedQuizData ? Object.keys(loadedQuizData) : [],
        generatedContentKeys: loadedGeneratedContent ? Object.keys(loadedGeneratedContent) : [],
        dataSource: source,
        userInterests: loadedQuizData?.kidsInterests || [],
        userType: loadedQuizData?.userType || 'unknown'
      });
      
      setQuizData(loadedQuizData);
      setGeneratedContent(loadedGeneratedContent);

      console.log(`⏳ [PersonalizedPage] ${timestamp} Waiting for React state updates to settle (300ms)...`);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log(`📊 [PersonalizedPage] ${timestamp} Updating content ready status: pageStable = true`);
      setContentReadyStatus(prev => ({ ...prev, pageStable: true }));

      const totalLoadTime = performance.now() - startTime;
      const phase3Time = performance.now() - phase3StartTime;
      
      console.log(`🎉 [PersonalizedPage] ${timestamp} ========== ALL PHASES COMPLETE - PAGE READY ==========`);
      console.log(`📈 [PersonalizedPage] ${timestamp} Performance Summary:`, {
        totalLoadTime: `${totalLoadTime.toFixed(2)}ms`,
        phase3Time: `${phase3Time.toFixed(2)}ms`,
        dataSource: source,
        hasQuizData: !!loadedQuizData,
        hasGeneratedContent: !!loadedGeneratedContent,
        contentSections: loadedGeneratedContent ? Object.keys(loadedGeneratedContent).length : 0
      });

      // Track personalized page view with analytics
      console.log(`📊 [PersonalizedPage] ${timestamp} Sending analytics event: personalized_page_viewed`);
      const analyticsData = {
        data_source: source,
        grade_level: loadedQuizData.selectedSchools?.[0]?.level,
        user_type: loadedQuizData.userType,
        parent_type: loadedQuizData.parentSubType,
        interests: loadedQuizData.kidsInterests,
        school_name: loadedQuizData.selectedSchools?.[0]?.name,
        is_authenticated: !!session?.user?.email,
        content_ready: true,
        load_time_ms: Math.round(totalLoadTime),
        has_generated_content: !!loadedGeneratedContent
      };
      console.log(`📊 [PersonalizedPage] ${timestamp} Analytics data:`, analyticsData);
      
      posthog?.capture('personalized_page_viewed', analyticsData);

      console.log(`⏳ [PersonalizedPage] ${timestamp} Final stabilization delay (200ms) before displaying page...`);
      setTimeout(() => {
        console.log(`✅ [PersonalizedPage] ${timestamp} LOADING COMPLETE - Displaying personalized page to user`);
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
    console.log(`[PersonalizedPage] Loading state - contentReadyStatus:`, contentReadyStatus);
    
    const progress = Object.values(contentReadyStatus).filter(Boolean).length / 3;
    console.log(`[PersonalizedPage] Loading progress: ${(progress * 100).toFixed(0)}%`);

    // Determine current phase and appropriate messaging
    const getCurrentPhase = () => {
      if (!contentReadyStatus.dataLoaded) {
        return {
          phase: 1,
          title: "Loading Your Data",
          message: "Retrieving your quiz results and preferences...",
          detail: "This usually takes 2-3 seconds",
          icon: "DATA"
        };
      } else if (!contentReadyStatus.coreContentGenerated) {
        return {
          phase: 2,
          title: "Generating Personalized Content",
          message: "Our AI is creating custom recommendations just for you...",
          detail: "This may take 15-30 seconds",
          icon: "AI"
        };
      } else if (!contentReadyStatus.pageStable) {
        return {
          phase: 3,
          title: "Finalizing Your Experience",
          message: "Putting the finishing touches on your personalized page...",
          detail: "Almost ready!",
          icon: "DONE"
        };
      }
      return {
        phase: 3,
        title: "Getting Ready",
        message: "Preparing your personalized experience...",
        detail: "Just a moment more",
        icon: "PREP"
      };
    };

    const currentPhase = getCurrentPhase();
    const progressPercentage = Math.max(progress * 100, 10); // Minimum 10% to show activity

    return (
      <div className="min-h-screen bg-gradient-to-br from-timeback-bg to-white flex items-center justify-center p-4">
        <div className="text-center font-cal">
          <div className="bg-white rounded-xl shadow-2xl border border-timeback-primary p-8 max-w-md mx-auto">
            {/* Minimalistic TimeBack logo */}
            <div className="w-16 h-16 bg-timeback-primary rounded-xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-xl font-cal">T</span>
            </div>
            
            {/* Phase indicator with icon */}
            <div className="mb-4">
              <div className="text-xs font-bold text-timeback-primary bg-timeback-bg/20 px-2 py-1 rounded mb-2 inline-block">
                {currentPhase.icon}
              </div>
              <h3 className="text-lg font-bold text-timeback-primary font-cal mb-1">
                {currentPhase.title}
              </h3>
              <p className="text-timeback-primary font-cal text-sm opacity-80">
                Phase {currentPhase.phase} of 3
              </p>
            </div>
            
            {/* Enhanced spinner with pulse effect */}
            <div className="relative mb-6">
              <div className="w-10 h-10 border-4 border-timeback-bg border-t-timeback-primary rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 w-10 h-10 border-2 border-timeback-primary/20 rounded-full mx-auto animate-pulse"></div>
            </div>
            
            {/* Enhanced progress indicator with percentage */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-timeback-primary font-cal opacity-60">Progress</span>
                <span className="text-xs text-timeback-primary font-cal font-bold">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-timeback-bg/30 rounded-full h-2 relative overflow-hidden">
                <div 
                  className="bg-timeback-primary h-2 rounded-full transition-all duration-1000 ease-out relative"
                  style={{ width: `${progressPercentage}%` }}
                >
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform translate-x-[-100%] animate-pulse"></div>
                </div>
              </div>
            </div>
            
            {/* Dynamic status message */}
            <div className="mb-4">
              <p className="text-timeback-primary font-cal text-sm font-medium mb-1">
                {currentPhase.message}
              </p>
              <p className="text-timeback-primary font-cal text-xs opacity-60">
                {currentPhase.detail}
              </p>
            </div>

            {/* Phase indicators */}
            <div className="flex justify-center space-x-2 mt-4">
              {[1, 2, 3].map((phaseNum) => (
                <div
                  key={phaseNum}
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    phaseNum <= currentPhase.phase
                      ? 'bg-timeback-primary scale-110'
                      : phaseNum === currentPhase.phase + 1
                      ? 'bg-timeback-primary/50 animate-pulse'
                      : 'bg-timeback-bg/40'
                  }`}
                />
              ))}
            </div>

            {/* Helpful tip for longer waits */}
            {currentPhase.phase === 2 && (
              <div className="mt-4 p-3 bg-timeback-bg/20 rounded-lg">
                <p className="text-timeback-primary font-cal text-xs opacity-70">
                  <span className="font-bold">TIP:</span> We&apos;re creating custom content based on your interests and school choices
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!quizData) {
    console.log(`[PersonalizedPage] No quiz data found, redirecting user to assessment`);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-timeback-bg to-white flex items-center justify-center p-4">
        <div className="text-center font-cal">
          <div className="bg-white rounded-xl shadow-2xl border border-timeback-primary p-8 max-w-sm mx-auto">
            {/* Minimalistic TimeBack logo */}
            <div className="w-16 h-16 bg-timeback-primary rounded-xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-xl font-cal">T</span>
            </div>
            
            <h2 className="text-xl font-bold text-timeback-primary mb-3 font-cal">Take Your Assessment</h2>
            <p className="text-timeback-primary mb-6 font-cal text-sm">Complete our assessment to see your personalized results.</p>
            
            <a 
              href="/quiz" 
              className="bg-timeback-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all duration-200 shadow-xl hover:shadow-2xl font-cal inline-block"
            >
              Start Assessment
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