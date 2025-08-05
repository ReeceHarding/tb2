'use client';

import React from 'react';
import { QuizProvider } from '@/components/quiz/QuizContext';
import ParentSubTypeStep from '@/components/quiz/steps/ParentSubTypeStep';

// Temporary test page to test school finder components without authentication
export default function TestSchoolFinderPage() {
  const handleNext = () => {
    console.log('Next step would be called');
  };

  const handlePrev = () => {
    console.log('Previous step would be called');
  };

  return (
    <div className="min-h-screen bg-timeback-bg py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 font-cal">
            <h1 className="text-3xl font-bold text-timeback-primary mb-4 font-cal">
              School Finder Test Page
            </h1>
            <p className="text-lg text-timeback-primary font-cal">
              Testing the school finder components for the &ldquo;Find a School&rdquo; flow
            </p>
          </div>
          
          <QuizProvider>
            <ParentSubTypeStep onNext={handleNext} onPrev={handlePrev} />
          </QuizProvider>
        </div>
      </div>
    </div>
  );
}