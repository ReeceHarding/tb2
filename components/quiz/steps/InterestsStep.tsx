'use client';

import React, { useMemo, useState } from 'react';
import { useQuiz } from '../QuizContext';
import { startOptimisticGeneration } from '@/libs/optimisticContentGeneration';

interface InterestsStepProps {
  onNext: () => void;
  onPrev: () => void;
}

export default function InterestsStep({ onNext: _onNext, onPrev: _onPrev }: InterestsStepProps) {
  const { state, dispatch } = useQuiz();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(true);
  const [askedIntro, setAskedIntro] = useState<boolean>(state.kidsInterests.length > 0);
  const [introInput, setIntroInput] = useState<string>('');

  console.log('[InterestsStep] Selected interests:', state.kidsInterests.length);
  console.log('[InterestsStep] Selected category:', selectedCategory);

  // 8 main interest categories with SVG icons (no emojis per rules) and descriptions
  const mainCategories = useMemo(() => ([
    {
      id: 'sports',
      title: 'Sports & Fitness',
      desc: 'Physical activities & athletics',
      icon: (
        <svg className="w-6 h-6 text-timeback-primary" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20Zm0 2a8 8 0 015.657 13.657L6.343 6.343A7.965 7.965 0 0112 4Zm0 16a8 8 0 01-5.657-13.657l11.314 11.314A7.965 7.965 0 0112 20Z" />
        </svg>
      )
    },
    {
      id: 'arts',
      title: 'Arts & Creativity',
      desc: 'Visual arts, music & performance',
      icon: (
        <svg className="w-6 h-6 text-timeback-primary" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 3c-4.97 0-9 3.582-9 8 0 2.137 1.05 4.06 2.744 5.459.3.245.497.595.497.987V20a1 1 0 001.447.894L10 20l1.312.656c.312.156.687.156.999 0L13.624 20l1.312.656A1 1 0 0016.383 20v-.554c0-.392.196-.742.497-.987C19.95 15.06 21 13.137 21 11c0-4.418-4.03-8-9-8Zm-4 9a1 1 0 110-2 1 1 0 010 2Zm4 0a1 1 0 110-2 1 1 0 010 2Zm4 0a1 1 0 110-2 1 1 0 010 2Z" />
        </svg>
      )
    },
    {
      id: 'science',
      title: 'Science & Nature',
      desc: 'Exploration & discovery',
      icon: (
        <svg className="w-6 h-6 text-timeback-primary" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M7 2h10v2l-4 6v6l4 4v2H7v-2l4-4V10L7 4V2z" />
        </svg>
      )
    },
    {
      id: 'tech',
      title: 'Technology',
      desc: 'Gaming, coding & digital',
      icon: (
        <svg className="w-6 h-6 text-timeback-primary" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4 6h16a2 2 0 012 2v6a4 4 0 01-4 4h-2l-2 2h-4l-2-2H6a4 4 0 01-4-4V8a2 2 0 012-2zm3 3a1 1 0 100 2 1 1 0 000-2zm10 0h-4v2h4V9z" />
        </svg>
      )
    },
    {
      id: 'reading',
      title: 'Reading & Writing',
      desc: 'Literature & storytelling',
      icon: (
        <svg className="w-6 h-6 text-timeback-primary" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4 4h7a3 3 0 013 3v13H7a3 3 0 00-3 3V4zm16 0h-7a3 3 0 00-3 3v13h7a3 3 0 013 3V4z" />
        </svg>
      )
    },
    {
      id: 'building',
      title: 'Building & Making',
      desc: 'Hands-on construction',
      icon: (
        <svg className="w-6 h-6 text-timeback-primary" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M3 14l9-9 4 4-9 9H3v-4zm14.707-7.707l1.414 1.414-2 2-1.414-1.414 2-2z" />
        </svg>
      )
    },
    {
      id: 'social',
      title: 'Social & Culture',
      desc: 'People, history & languages',
      icon: (
        <svg className="w-6 h-6 text-timeback-primary" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-9 9a9 9 0 0118 0H3z" />
        </svg>
      )
    },
    {
      id: 'outdoor',
      title: 'Outdoor Adventures',
      desc: 'Nature & exploration',
      icon: (
        <svg className="w-6 h-6 text-timeback-primary" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l7 12H5L12 2zm0 5l-3 5h6l-3-5zM4 20h16v2H4v-2z" />
        </svg>
      )
    }
  ]), []);

  // Subcategories for each main category (8 each)
  const subcategories = {
    'sports': [
      'Basketball', 'Soccer', 'Swimming', 'Martial Arts',
      'Dance', 'Running', 'Baseball', 'Gymnastics'
    ],
    'arts': [
      'Drawing', 'Painting', 'Music', 'Theater',
      'Photography', 'Sculpture', 'Film Making', 'Fashion Design'
    ],
    'science': [
      'Biology', 'Chemistry', 'Physics', 'Astronomy',
      'Environmental Science', 'Geology', 'Marine Biology', 'Robotics'
    ],
    'tech': [
      'Video Games', 'Coding', 'App Design', '3D Modeling',
      'Web Development', 'AI & Machine Learning', 'Electronics', 'VR/AR'
    ],
    'reading': [
      'Fiction Stories', 'Poetry', 'Comics', 'Journalism',
      'Creative Writing', 'Research', 'Book Clubs', 'Storytelling'
    ],
    'building': [
      'LEGO Building', 'Woodworking', 'Model Making', 'Engineering',
      'Crafts', 'Architecture', 'DIY Projects', 'Invention'
    ],
    'social': [
      'History', 'Geography', 'Languages', 'Cultural Studies',
      'Community Service', 'Debate', 'Leadership', 'Travel'
    ],
    'outdoor': [
      'Hiking', 'Camping', 'Rock Climbing', 'Fishing',
      'Bird Watching', 'Gardening', 'Survival Skills', 'Nature Photography'
    ]
  };



  const handleCategoryClick = (categoryId: string) => {
    console.log('[InterestsStep] Category clicked:', categoryId);
    setSelectedCategory(categoryId);
    setShowCategories(false);
  };

  const handleSubcategoryClick = (subcategoryName: string) => {
    const isSelected = state.kidsInterests.includes(subcategoryName);
    const newInterests = isSelected 
      ? state.kidsInterests.filter(i => i !== subcategoryName)
      : [...state.kidsInterests, subcategoryName];
    
    console.log('[InterestsStep] Toggling subcategory interest:', subcategoryName, 'Selected:', !isSelected);
    dispatch({ type: 'SET_KIDS_INTERESTS', interests: newInterests });
  };

  const handleBackToCategories = () => {
    setShowCategories(true);
    setSelectedCategory(null);
  };

  const handleIntroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const timestamp = new Date().toISOString();
    const tokens = introInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    const deduped = Array.from(new Set([...(state.kidsInterests || []), ...tokens]));
    console.log(`[${timestamp}] [InterestsStep] Intro submit raw=`, introInput, 'parsed=', tokens, 'deduped=', deduped);
    if (deduped.length > 0) {
      dispatch({ type: 'SET_KIDS_INTERESTS', interests: deduped });
    }
    setAskedIntro(true);
    setShowCategories(true);
  };

  const getCategoryInterestCount = (categoryId: string) => {
    const catSubcategories = subcategories[categoryId as keyof typeof subcategories] || [];
    return catSubcategories.filter(sub => state.kidsInterests.includes(sub)).length;
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
    <div className="text-center space-y-6 font-cal">
      {/* Condensed Header Section */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 bg-timeback-bg border border-timeback-primary rounded-full px-3 py-1">
          <span className="w-1.5 h-1.5 bg-timeback-primary rounded-full"></span>
          <span className="text-timeback-primary font-semibold text-xs font-cal">FINAL STEP</span>
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-timeback-primary font-cal leading-tight">
          What sparks your child&apos;s curiosity?
        </h2>
        
        <p className="text-base text-timeback-primary font-cal max-w-2xl mx-auto">
          Click categories to see options and select what applies to your child
        </p>
      </div>

      {/* Intro freeform interests capture (shown first) */}
      {!askedIntro && (
        <div className="max-w-3xl mx-auto backdrop-blur-md bg-timeback-bg/80 rounded-2xl shadow-xl border border-timeback-primary p-6">
          <form onSubmit={handleIntroSubmit} className="space-y-4">
            <label className="block text-left text-timeback-primary font-cal font-bold" htmlFor="intro-interests">
              Before we begin, what are your child&apos;s interests? (comma-separated)
            </label>
            <input
              id="intro-interests"
              className="w-full px-4 py-3 border border-timeback-primary/70 rounded-xl focus:ring-2 focus:ring-timeback-primary/30 focus:border-timeback-primary outline-none text-timeback-primary placeholder:text-timeback-primary/60 font-cal bg-white backdrop-blur-sm shadow-sm"
              placeholder="e.g., basketball, drawing, astronomy"
              value={introInput}
              onChange={(e) => setIntroInput(e.target.value)}
              aria-label="Enter your child's interests"
            />
            <div className="flex justify-center">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 bg-timeback-primary text-white rounded-xl hover:bg-timeback-primary/90 transition-all duration-300 font-bold font-cal text-base shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-timeback-primary/30"
                aria-label="Continue to categories"
              >
                Continue
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Interest Selection Section */}
      {askedIntro && (
      <div className="space-y-4">
        {showCategories ? (
          <>
            {/* Main Categories View */}
            <h3 className="text-lg font-bold text-timeback-primary font-cal">
              What are your child's main interests?
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mainCategories.map((category) => {
                const count = getCategoryInterestCount(category.id);
                
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className="relative p-6 rounded-xl border-2 text-center transition-all duration-200 hover:bg-timeback-bg transform bg-white border-timeback-primary shadow-lg group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-center">{category.icon}</div>
                      <div className="font-bold text-timeback-primary font-cal">{category.title}</div>
                      <div className="text-xs text-timeback-primary font-cal opacity-80">
                        {category.desc}
                      </div>
                    </div>
                    {count > 0 && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-timeback-primary text-white rounded-full flex items-center justify-center text-xs font-bold font-cal">
                        {count}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {/* Subcategories View */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-timeback-primary font-cal">
                  Select specific {mainCategories.find(c => c.id === selectedCategory)?.title} interests:
                </h3>
                <button
                  onClick={handleBackToCategories}
                  className="px-4 py-2 text-timeback-primary hover:bg-timeback-bg rounded-xl transition-all duration-200 font-cal flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to categories
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selectedCategory && subcategories[selectedCategory as keyof typeof subcategories].map((subcategory) => {
                  const isSelected = state.kidsInterests.includes(subcategory);
                  return (
                    <button
                      key={subcategory}
                      onClick={() => handleSubcategoryClick(subcategory)}
                      className={`p-4 rounded-xl border-2 text-center transition-all duration-200 transform hover:scale-105 ${
                        isSelected
                          ? 'border-timeback-primary bg-timeback-primary text-white shadow-xl'
                          : 'border-timeback-primary bg-white text-timeback-primary hover:bg-timeback-bg shadow-lg'
                      }`}
                    >
                      <div className="font-semibold text-sm font-cal">
                        {subcategory}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
      )}

      {/* Selected Interests Display */}
      {askedIntro && state.kidsInterests.length > 0 && (
        <div className="bg-timeback-bg border-2 border-timeback-primary rounded-xl p-4">
          <h4 className="text-base font-bold text-timeback-primary mb-3 font-cal">
            Selected ({state.kidsInterests.length}):
          </h4>
          <div className="flex flex-wrap gap-2">
            {state.kidsInterests.map((interest, index) => (
              <span 
                key={index} 
                className="inline-flex items-center px-3 py-1 rounded-full bg-timeback-primary text-white text-xs font-bold font-cal"
              >
                {interest}
                <button
                  onClick={() => handleSubcategoryClick(interest)}
                  className="ml-1 text-white/80 hover:text-white font-cal"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Completion Section */}
      {askedIntro && (
      <div className="bg-gradient-to-r from-timeback-bg to-white border-2 border-timeback-primary rounded-xl p-6">
        <div className="text-center space-y-3 font-cal">
          <h3 className="text-lg font-bold text-timeback-primary font-cal">
            Ready to Continue?
          </h3>
          
          {state.kidsInterests.length > 0 ? (
            <p className="text-sm text-timeback-primary font-cal">
              We&apos;ll use these {state.kidsInterests.length} interest{state.kidsInterests.length > 1 ? 's' : ''} to personalize your experience.
            </p>
          ) : (
            <p className="text-sm text-timeback-primary font-cal">
              Please select at least one interest above to continue.
            </p>
          )}
          
          <button
            onClick={completeQuiz}
            disabled={state.kidsInterests.length === 0}
            className={`px-8 py-3 rounded-xl font-bold text-base transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-timeback-primary focus:ring-offset-2 font-cal ${
              state.kidsInterests.length > 0
                ? 'bg-timeback-primary text-white hover:bg-opacity-90 shadow-lg'
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
      )}
      
    </div>
  );
}