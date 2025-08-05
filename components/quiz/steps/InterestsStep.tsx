'use client';

import React, { useState } from 'react';
import { useQuiz } from '../QuizContext';
import { startOptimisticGeneration } from '@/libs/optimisticContentGeneration';

interface InterestsStepProps {
  onNext: () => void;
  onPrev: () => void;
}

export default function InterestsStep({ onNext: _onNext, onPrev: _onPrev }: InterestsStepProps) {
  const { state, dispatch } = useQuiz();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  console.log('[InterestsStep] Selected interests:', state.kidsInterests.length);
  console.log('[InterestsStep] Expanded category:', expandedCategory);

  // Broad, encompassing interest categories with max 8 subcategories each
  const interestCategories = {
    'Physical & Sports': [
      'Team Sports', 'Individual Sports', 'Swimming & Water Sports', 'Martial Arts & Combat Sports',
      'Dance & Movement', 'Outdoor Adventures', 'Fitness & Training', 'Motor Sports & Racing'
    ],
    'Creative & Artistic': [
      'Visual Arts & Drawing', 'Music & Instruments', 'Performance & Theater', 'Digital & Media Arts',
      'Crafts & Making', 'Fashion & Design', 'Photography & Film', 'Creative Writing & Storytelling'
    ],
    'STEM & Discovery': [
      'Science Experiments', 'Engineering & Building', 'Math & Logic Puzzles', 'Nature & Environmental Study',
      'Space & Astronomy', 'Biology & Life Sciences', 'Chemistry & Physics', 'Research & Investigation'
    ],
    'Technology & Digital': [
      'Video Games & Gaming', 'Programming & Coding', 'Robotics & AI', 'Digital Creation & Apps',
      'Virtual & Augmented Reality', 'Electronics & Hardware', 'Web Development', '3D Design & Printing'
    ],
    'Language & Culture': [
      'Reading & Literature', 'Writing & Journalism', 'History & Geography', 'World Languages',
      'Cultural Studies', 'Communication & Public Speaking', 'Research & Academic Studies', 'Philosophy & Ideas'
    ]
  };



  const handleCategoryClick = (categoryName: string) => {
    console.log('[InterestsStep] Category clicked:', categoryName);
    
    if (expandedCategory === categoryName) {
      // If clicking the same expanded category, collapse it
      setExpandedCategory(null);
      console.log('[InterestsStep] Collapsing category:', categoryName);
    } else {
      // Expand the clicked category
      setExpandedCategory(categoryName);
      console.log('[InterestsStep] Expanding category:', categoryName);
    }
  };

  const toggleSubcategoryInterest = (subcategoryName: string) => {
    const isSelected = state.kidsInterests.includes(subcategoryName);
    const newInterests = isSelected 
      ? state.kidsInterests.filter(i => i !== subcategoryName)
      : [...state.kidsInterests, subcategoryName];
    
    console.log('[InterestsStep] Toggling subcategory interest:', subcategoryName, 'Selected:', !isSelected);
    dispatch({ type: 'SET_KIDS_INTERESTS', interests: newInterests });
  };

  const isCategorySelected = (categoryName: string) => {
    const subcategories = interestCategories[categoryName as keyof typeof interestCategories] || [];
    return subcategories.some(subcategory => state.kidsInterests.includes(subcategory));
  };

  const completeQuiz = () => {
    console.log('[InterestsStep] Complete Quiz button clicked - going directly to AuthStep');
    console.log('[InterestsStep] Current interests:', state.kidsInterests);
    
    // Save state to localStorage
    const savedState = { ...state, isCompleted: false, isLoading: false }; // Not completed until after auth
    localStorage.setItem('timeback-quiz-state', JSON.stringify(savedState));
    console.log('[InterestsStep] Quiz state saved to localStorage');

    // Start optimistic content generation in the background
    console.log('[InterestsStep] Starting optimistic content generation');
    const quizData = {
      userType: state.userType,
      parentSubType: state.parentSubType,
      selectedSchools: state.selectedSchools,
      kidsInterests: state.kidsInterests,
      numberOfKids: state.numberOfKids
    };
    
    // Fire and forget - don't await
    startOptimisticGeneration(quizData).catch(error => {
      console.error('[InterestsStep] Error in optimistic content generation:', error);
    });
    
    console.log('[InterestsStep] Optimistic generation started in background');

    // Go directly to AuthStep (skipping LoadingStep)
    dispatch({ type: 'SET_STEP', step: 6 }); // AuthStep is now step 6 (InterestsStep is step 5)
    console.log('[InterestsStep] Moving directly to AuthStep (LoadingStep removed)');
  };





  return (
    <div className="text-center space-y-8 font-cal">
      {/* Enhanced Header Section */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 bg-timeback-bg border border-timeback-primary rounded-full px-4 py-2 mb-4">
          <span className="w-2 h-2 bg-timeback-primary rounded-full"></span>
          <span className="text-timeback-primary font-semibold text-sm font-cal">FINAL STEP</span>
        </div>
        
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-timeback-primary font-cal leading-tight">
          What sparks your child&apos;s curiosity?
        </h2>
        
        <p className="text-xl text-timeback-primary font-cal max-w-3xl mx-auto">
          Help us personalize their learning by sharing what they love to do, explore, and create
        </p>
      </div>

      {/* Recursive Interest Categories Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-timeback-primary mb-4 font-cal">
            Choose Interest Categories
          </h3>
          <p className="text-timeback-primary font-cal mb-6">
            Click any category to see specific options and select what applies to your child
          </p>
        </div>
        
        <div className="space-y-4">
          {Object.keys(interestCategories).map((categoryName) => {
            const isExpanded = expandedCategory === categoryName;
            const isSelected = isCategorySelected(categoryName);
            const subcategories = interestCategories[categoryName as keyof typeof interestCategories];
            
            return (
              <div key={categoryName} className="space-y-3">
                {/* Main Category Button */}
                <button
                  onClick={() => handleCategoryClick(categoryName)}
                  className={`w-full p-6 rounded-xl border-2 text-left transition-all duration-300 transform hover:scale-102 ${
                    isExpanded
                      ? 'border-timeback-primary bg-timeback-primary text-white shadow-2xl scale-102'
                      : isSelected
                      ? 'border-timeback-primary bg-timeback-bg text-timeback-primary shadow-xl'
                      : 'border-timeback-primary/30 bg-white text-timeback-primary hover:border-timeback-primary hover:bg-timeback-bg'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-lg font-cal">
                      {categoryName}
                    </div>
                    <div className="flex items-center gap-3">
                      {isSelected && (
                        <span className={`text-sm font-cal ${isExpanded ? 'text-white/80' : 'text-timeback-primary'}`}>
                          {subcategories.filter(sub => state.kidsInterests.includes(sub)).length} selected
                        </span>
                      )}
                      <svg 
                        className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Subcategories Popup */}
                {isExpanded && (
                  <div className="bg-white border-2 border-timeback-primary rounded-xl p-6 shadow-2xl transform animate-in slide-in-from-top-2 duration-300">
                    <h4 className="text-lg font-bold text-timeback-primary mb-4 font-cal">
                      Select from {categoryName}:
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {subcategories.map((subcategory) => {
                        const isSubSelected = state.kidsInterests.includes(subcategory);
                        return (
                          <button
                            key={subcategory}
                            onClick={() => toggleSubcategoryInterest(subcategory)}
                            className={`p-3 rounded-xl border-2 text-center transition-all duration-200 transform hover:scale-105 ${
                              isSubSelected
                                ? 'border-timeback-primary bg-timeback-primary text-white shadow-xl scale-105'
                                : 'border-timeback-primary/30 bg-timeback-bg text-timeback-primary hover:border-timeback-primary'
                            }`}
                          >
                            <div className="font-semibold text-sm font-cal">
                              {subcategory}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Close Button */}
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => setExpandedCategory(null)}
                        className="px-6 py-2 text-timeback-primary font-cal font-semibold hover:bg-timeback-bg rounded-xl transition-all duration-200"
                      >
                        Close Category
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Interests Display */}
      {state.kidsInterests.length > 0 && (
        <div className="bg-timeback-bg border-2 border-timeback-primary rounded-2xl p-8">
          <h4 className="text-lg font-bold text-timeback-primary mb-4 font-cal">
            Selected Interests ({state.kidsInterests.length}):
          </h4>
          <div className="flex flex-wrap gap-3">
            {state.kidsInterests.map((interest, index) => (
              <span 
                key={index} 
                className="inline-flex items-center px-4 py-2 rounded-full bg-timeback-primary text-white text-sm font-bold font-cal"
              >
                {interest}
                <button
                  onClick={() => toggleSubcategoryInterest(interest)}
                  className="ml-2 text-white/80 hover:text-white font-cal"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Completion Section */}
      <div className="bg-gradient-to-r from-timeback-bg to-white border-2 border-timeback-primary rounded-2xl p-8">
        <div className="text-center space-y-4 font-cal">
          <h3 className="text-2xl font-bold text-timeback-primary font-cal">
            Ready to Create Your Personalized Experience?
          </h3>
          
          {state.kidsInterests.length > 0 ? (
            <p className="text-timeback-primary font-cal">
              Perfect! We&apos;ll use these {state.kidsInterests.length} interest{state.kidsInterests.length > 1 ? 's' : ''} to personalize your TimeBack experience.
            </p>
          ) : (
            <p className="text-timeback-primary font-cal">
              Please select at least one interest above to continue, or add your own custom interest.
            </p>
          )}
          
          <button
            onClick={completeQuiz}
            disabled={state.kidsInterests.length === 0}
            className={`px-12 py-4 rounded-xl font-bold text-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-timeback-primary focus:ring-offset-2 font-cal ${
              state.kidsInterests.length > 0
                ? 'bg-timeback-primary text-white hover:bg-opacity-90 shadow-2xl hover:shadow-2xl transform hover:scale-105'
                : 'bg-timeback-bg text-timeback-primary cursor-not-allowed'
            }`}
          >
            {state.kidsInterests.length > 0 
              ? 'Complete Assessment →'
              : 'Add at least one interest to continue'
            }
        </button>
        </div>
      </div>
      
    </div>
  );
}