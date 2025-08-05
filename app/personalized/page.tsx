'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePostHog } from 'posthog-js/react';
import { QuizData, GeneratedContent } from '@/types/quiz';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PersonalizedResults from '@/components/PersonalizedResults';
import ProgressiveDisclosureContainer from '@/components/personalized/ProgressiveDisclosureContainer';
import { getCachedContent } from '@/libs/optimisticContentGeneration';

// Quiz data and generated content interfaces are now imported from @/types/quiz

export default function PersonalizedPage() {
  const { data: session, status } = useSession();
  const posthog = usePostHog();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const loadQuizData = async () => {
      const timestamp = new Date().toISOString();
      console.log(`[PersonalizedPage] ${timestamp} Starting quiz data loading process`);
      console.log(`[PersonalizedPage] ${timestamp} Auth status:`, status, 'Session:', !!session?.user?.email);

      let loadedQuizData: QuizData | null = null;
      let loadedGeneratedContent: GeneratedContent | null = null;
      let source: 'database' | 'localStorage' = 'localStorage';

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

      // Check for optimistically generated content
      const cachedContent = getCachedContent();
      if (cachedContent && !loadedGeneratedContent) {
        console.log(`[PersonalizedPage] ${timestamp} Found optimistically generated content in cache:`, {
          hasAfternoonActivities: !!cachedContent.afternoonActivities,
          hasSubjectExamples: !!cachedContent.subjectExamples,
          hasHowWeGetResults: !!cachedContent.howWeGetResults,
          hasLearningScience: !!cachedContent.learningScience,
          hasDataShock: !!cachedContent.dataShock,
          generationStatus: cachedContent.generationStatus,
          totalTime: cachedContent.completionTime ? cachedContent.completionTime - cachedContent.startTime : 'in progress'
        });
        
        // Use cached content if available
        loadedGeneratedContent = {
          afternoonActivities: cachedContent.afternoonActivities,
          subjectExamples: cachedContent.subjectExamples,
          howWeGetResults: cachedContent.howWeGetResults,
          learningScience: cachedContent.learningScience,
          dataShock: cachedContent.dataShock,
          allCompleted: Object.values(cachedContent.generationStatus).every(status => status === 'completed'),
          hasErrors: Object.values(cachedContent.generationStatus).some(status => status === 'error')
        };
      }

      // Set the loaded data
      setQuizData(loadedQuizData);
      setGeneratedContent(loadedGeneratedContent);

      console.log(`[PersonalizedPage] ${timestamp} Data loading complete:`, {
        source,
        hasQuizData: !!loadedQuizData,
        hasGeneratedContent: !!loadedGeneratedContent
      });

      // Track personalized page view with analytics
      posthog?.capture('personalized_page_viewed', {
        data_source: source,
        grade_level: loadedQuizData.selectedSchools?.[0]?.level,
        user_type: loadedQuizData.userType,
        parent_type: loadedQuizData.parentSubType,
        interests: loadedQuizData.kidsInterests,
        school_name: loadedQuizData.selectedSchools?.[0]?.name,
        is_authenticated: !!session?.user?.email
      });

      setIsLoading(false);
    };

    // Only start loading when session status is determined (not loading)
    if (status !== 'loading') {
      loadQuizData();
    }
  }, [status, session, posthog]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-timeback-bg to-white flex items-center justify-center">
        <div className="text-center p-8 font-cal">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-timeback-primary p-12 max-w-md mx-auto">
            <div className="mb-8">
              <div className="w-20 h-20 bg-timeback-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl font-cal">T</span>
              </div>
              <div className="w-16 h-16 border-4 border-timeback-bg border-t-timeback-primary rounded-full animate-spin mx-auto mb-6"></div>
            </div>
            <h2 className="text-2xl font-bold text-timeback-primary mb-4 font-cal">Creating Your Personalized Results</h2>
            <p className="text-timeback-primary font-cal">We&apos;re analyzing your quiz responses to build a custom learning experience just for you...</p>
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
        />
      </main>
      <Footer />
    </>
  );
}