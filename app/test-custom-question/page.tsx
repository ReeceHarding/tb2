'use client';

import React from 'react';
import CustomQuestionSection from '@/components/personalized/CustomQuestionSection';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TestCustomQuestionPage() {
  // Mock quiz data for testing
  const mockQuizData = {
    userType: 'Parent',
    grade: '5th Grade',
    selectedSchools: [
      {
        name: 'Local Elementary School',
        city: 'Austin',
        state: 'TX'
      }
    ],
    kidsInterests: ['Math', 'Science', 'Art'],
    numberOfKids: 1
  };

  // Mock viewed components
  const mockViewedComponents = [
    { mainSectionId: 'time-freedom', componentName: 'AfternoonActivities', timestamp: Date.now() },
    { mainSectionId: 'speed-comparison', componentName: 'SpeedComparison', timestamp: Date.now() },
    { mainSectionId: 'results', componentName: 'HowWeGetResults', timestamp: Date.now() }
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-timeback-bg to-white">
        <div className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
            <h1 className="text-4xl font-bold text-timeback-primary font-cal mb-4">
              Test Custom Question Feature
            </h1>
            <p className="text-lg text-timeback-primary opacity-75 font-cal">
              This is a test page to demonstrate the custom question functionality.
            </p>
          </div>
        </div>

        <CustomQuestionSection 
          quizData={mockQuizData}
          viewedComponents={mockViewedComponents}
        />
      </main>
      <Footer />
    </>
  );
}