'use client';

import React, { useState } from 'react';
import ErrorBoundary from './ErrorBoundary';
import TrackedSection from './TrackedSection';
import SchoolReportCard from './personalized/SchoolReportCard';
import InteractiveLearnMore from './personalized/InteractiveLearnMore';

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
  kidsInterests: string[];
  numberOfKids: number;
}

interface GeneratedContent {
  afternoonActivities?: any;
  subjectExamples?: any;
  howWeGetResults?: any;
  followUpQuestions?: any;
  allCompleted: boolean;
  hasErrors: boolean;
}

interface PersonalizedResultsProps {
  quizData: QuizData;
  preGeneratedContent?: GeneratedContent | null;
  isSharedView?: boolean;
}

// Removed QuestionCache interface - questions will be generated on-demand

// Removed getSectionContent - it's defined in InteractiveLearnMore where it's actually used

// PersonalizedResults now only renders the hero section with greeting and school report card
// All other content sections are handled by the ProgressiveDisclosureContainer
export default function PersonalizedResults({ quizData, preGeneratedContent }: PersonalizedResultsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  // Cache for optimistically generated questions for all sections
  // Removed questionCache - questions will be generated on-demand when user opens Learn More
  
  // Removed improved copywriting state - now using static text

  console.log('[PersonalizedResults] Rendering with quiz data:', quizData);
  console.log('[PersonalizedResults] Pre-generated content available:', {
    hasContent: !!preGeneratedContent,
    hasAfternoonActivities: !!preGeneratedContent?.afternoonActivities,
    hasSubjectExamples: !!preGeneratedContent?.subjectExamples,
    hasHowWeGetResults: !!preGeneratedContent?.howWeGetResults,
    hasFollowUpQuestions: !!preGeneratedContent?.followUpQuestions
  });

  // Removed allSections - no longer needed since we generate questions on-demand

  // Removed copywriting improvement useEffect - now using static text

  // Removed optimistic generation - questions will be generated on-demand when user clicks Learn More

  // Generate personalized greeting based on quiz data
  const getPersonalizedGreeting = () => {
    return {
      title: `Here's Your Personalized TimeBack Plan`,
      subtitle: 'This is an interactive site where you can learn how we\'ll tailor Timeback to get your kid the results they deserve.',
      valueProp: 'Help your high schooler master their grade-level curriculum in 2-3 months instead of 9 months'
    };
  };

  const greeting = getPersonalizedGreeting();

  return (
    <div className="min-h-screen">
      {/* Hero Section - Personalized Results */}
      <TrackedSection 
        sectionName="hero_personalized_greeting"
        className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-24"
        additionalData={{
          user_type: quizData.userType,
          grade_level: quizData.selectedSchools[0]?.level
        }}
      >
        <div className="backdrop-blur-md bg-white/10 rounded-3xl shadow-2xl border-2 border-timeback-primary p-8 lg:p-12">
          {/* Success Badge */}
          <div className="text-center mb-8 font-cal">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-timeback-primary rounded-full px-6 py-3 mb-6">
              <div className="w-3 h-3 bg-timeback-primary rounded-full animate-pulse"></div>
              <span className="text-timeback-primary font-bold text-sm font-cal">ASSESSMENT COMPLETE</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Personalized Greeting */}
            <div className="text-center lg:text-left space-y-6 font-cal">
              <h1 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl xl:text-6xl tracking-tight text-timeback-primary font-cal leading-tight">
                {greeting.title}
              </h1>
              <p className="text-xl lg:text-2xl text-timeback-primary font-cal leading-relaxed">
                {greeting.subtitle}
              </p>
              
              {/* Quick Stats Preview */}
              <div className="grid grid-cols-2 gap-4 pt-6">
                <div className="backdrop-blur-sm bg-white/20 border border-timeback-primary rounded-xl p-4 text-center font-cal">
                  <div className="text-2xl font-bold text-timeback-primary font-cal">2hrs</div>
                  <div className="text-sm text-timeback-primary font-cal">Daily Learning</div>
                </div>
                <div className="backdrop-blur-sm bg-white/20 border border-timeback-primary rounded-xl p-4 text-center font-cal">
                  <div className="text-2xl font-bold text-timeback-primary font-cal">10x</div>
                  <div className="text-sm text-timeback-primary font-cal">Faster Progress</div>
                </div>
              </div>
            </div>

            {/* Right Column - School Report Card */}
            <div className="flex justify-center lg:justify-end">
              <ErrorBoundary 
                componentName="SchoolReportCard"
                fallbackMessage="School report card is temporarily unavailable. Please refresh to try again."
              >
                <SchoolReportCard 
                  schoolData={quizData.selectedSchools[0]} 
                  onLearnMore={(section) => setExpandedSection(section)}
                />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </TrackedSection>

      {/* Interactive Learn More Modal */}
      {expandedSection && (
        <InteractiveLearnMore
          section={expandedSection}
          quizData={quizData}
          onClose={() => setExpandedSection(null)}
        />
      )}
    </div>
  );
}