'use client';

import React, { useState } from 'react';
import { useQuiz, ParentSubType } from '../QuizContext';
import SchoolFinder from './SchoolFinder';
import SchoolPreview from './SchoolPreview';

interface ParentSubTypeStepProps {
  onNext: () => void;
  onPrev: () => void;
}

interface School {
  id: string;
  name: string;
  type: 'alpha' | 'other' | 'special';
  city: string;
  state: string;
  images: number;
  totalAssets: number;
  description?: string;
  address?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  fullAddress?: string;
}

export default function ParentSubTypeStep({ onNext }: ParentSubTypeStepProps) {
  const { state, dispatch } = useQuiz();
  const [showSchoolFinder, setShowSchoolFinder] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  console.log(`[ParentSubTypeStep] Current parent sub-type: ${state.parentSubType}`);

  const selectParentSubType = (subType: ParentSubType) => {
    console.log(`[ParentSubTypeStep] Selected parent sub-type: ${subType}`);
    dispatch({ type: 'SET_PARENT_SUB_TYPE', subType });
    
    // If they select "timeback-school", show the school finder instead of advancing
    if (subType === 'timeback-school') {
      setShowSchoolFinder(true);
    } else {
      // Auto-advance for other options
      setTimeout(() => {
        onNext();
      }, 200);
    }
  };

  const handleSchoolSelect = (school: School) => {
    setSelectedSchool(school);
  };

  const handleCloseSchoolFinder = () => {
    setShowSchoolFinder(false);
    setSelectedSchool(null);
    // Reset the parent sub-type selection
    dispatch({ type: 'SET_PARENT_SUB_TYPE', subType: null });
  };

  const handleBackToSchoolList = () => {
    setSelectedSchool(null);
  };

  // Parent sub-type options
  const parentSubTypes = [
    {
      id: 'timeback-school' as ParentSubType,
      title: 'I want to go to a TimeBack school',
      description: 'Find or apply to existing TimeBack schools',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 'homeschool' as ParentSubType,
      title: 'I want to homeschool',
      description: 'Use TimeBack curriculum for homeschooling',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'tutoring' as ParentSubType,
      title: 'I want after school tutoring',
      description: 'Supplement current education with TimeBack tutoring',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    }
  ];



  // Show school finder if "timeback-school" was selected
  if (showSchoolFinder) {
    // Show school preview if a school is selected
    if (selectedSchool) {
      return (
        <SchoolPreview
          school={selectedSchool}
          onClose={handleCloseSchoolFinder}
          onBack={handleBackToSchoolList}
        />
      );
    }

    // Show school finder list
    return (
      <div className="space-y-6">
        <SchoolFinder
          onSchoolSelect={handleSchoolSelect}
          selectedSchool={selectedSchool}
        />
        
        {/* Action Buttons */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border border-timeback-primary p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="text-sm text-timeback-primary font-cal">
                Select a school above to learn more, or continue with the quiz to explore other options.
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCloseSchoolFinder}
                  className="px-6 py-2 border border-timeback-primary text-timeback-primary rounded-xl hover:bg-timeback-bg transition-colors font-cal"
                >
                  Back to Options
                </button>
                <button
                  onClick={onNext}
                  className="px-6 py-2 bg-timeback-primary text-white rounded-xl hover:bg-timeback-primary transition-colors font-cal"
                >
                  Continue Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Parent Sub-Type Selection */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-timeback-primary mb-6 text-center font-cal">
          What are you most interested in?
        </h2>
        <p className="text-lg text-timeback-primary text-center mb-8 font-cal">
          Choose the option that best describes your learning goals
        </p>
        
        <div className="grid md:grid-cols-3 gap-6">
          {parentSubTypes.map((subType) => (
            <button
              key={subType.id}
              onClick={() => selectParentSubType(subType.id)}
              disabled={false}
              className={`p-6 rounded-xl border-2 text-center transition-all duration-200 ${
                state.parentSubType === subType.id
                  ? 'border-timeback-primary bg-timeback-bg shadow-2xl'
                  : 'border-timeback-primary bg-white hover:border-timeback-primary hover:bg-timeback-bg shadow-2xl hover:shadow-2xl'
              } cursor-pointer`}
            >
              <div className={`mb-4 flex justify-center ${
                state.parentSubType === subType.id ? 'text-timeback-primary' : 'text-timeback-primary'
              }`}>
                {subType.icon}
              </div>
              <h4 className={`font-semibold mb-3 text-lg font-cal ${
                state.parentSubType === subType.id ? 'text-timeback-primary' : 'text-timeback-primary'
              }`}>
                {subType.title}
              </h4>
              <p className={`text-sm font-cal ${
                state.parentSubType === subType.id ? 'text-timeback-primary' : 'text-timeback-primary'
              }`}>
                {subType.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}