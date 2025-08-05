'use client';

import React from 'react';
import { useQuiz, UserType } from '../QuizContext';
import { 
  UsersIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

interface UserTypeStepProps {
  onNext: () => void;
  onPrev: () => void;
}

export default function UserTypeStep({ onNext }: UserTypeStepProps) {
  const { state, dispatch } = useQuiz();

  const selectUserType = (userType: UserType) => {
    console.log(`[UserTypeStep] selectUserType CALLED with: ${userType}`);
    dispatch({ type: 'SET_USER_TYPE', userType });
    
    // Auto-advance after selection
    setTimeout(() => {
      if (userType === 'parents' || userType === 'student') {
        onNext();
      }
    }, 200);
  };



  // Streamlined user type options - only show enabled options for better UX
  const userTypeOptions = [
    { 
      id: 'parents' as UserType, 
      title: 'Parents', 
      description: 'I\'m a parent looking for the best educational experience for my child',
      longDescription: 'Discover how TimeBack can help your child achieve academic excellence while having more time for family, hobbies, and personal growth.',
      icon: UsersIcon,
      gradient: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'student' as UserType, 
      title: 'Student', 
      description: 'I\'m a student who wants to accelerate my learning and achieve more',
      longDescription: 'Experience personalized learning that adapts to your pace, helping you master subjects faster while pursuing your passions.',
      icon: AcademicCapIcon,
      gradient: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="text-center space-y-8 font-cal">
      {/* Enhanced Header Section */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 bg-timeback-bg border border-timeback-primary rounded-full px-4 py-2 mb-4">
          <span className="w-2 h-2 bg-timeback-primary rounded-full"></span>
          <span className="text-timeback-primary font-semibold text-sm font-cal">STEP 1</span>
        </div>
        
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-timeback-primary font-cal leading-tight">
          Let&apos;s get started!
        </h2>
        
        <p className="text-xl text-timeback-primary font-cal max-w-2xl mx-auto">
          Tell us who you are so we can personalize your TimeBack experience
        </p>
      </div>

      {/* Enhanced User Type Selection */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {userTypeOptions.map((option) => {
          const Icon = option.icon as React.ComponentType<React.SVGProps<SVGSVGElement>>;
          const isSelected = state.userType === option.id;
          
          return (
            <button
              key={option.id}
              onClick={() => selectUserType(option.id)}
              className={`group p-8 rounded-2xl border-2 text-center transition-all duration-300 transform hover:scale-105 ${
                isSelected
                  ? 'border-timeback-primary bg-timeback-bg shadow-2xl scale-105'
                  : 'border-timeback-primary/30 bg-timeback-bg/50 hover:border-timeback-primary hover:bg-timeback-bg hover:shadow-2xl'
              }`}
            >
              {/* Icon Container */}
              <div className="mb-6 flex justify-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isSelected 
                    ? 'bg-timeback-primary shadow-2xl' 
                    : 'bg-timeback-bg border-2 border-timeback-primary group-hover:bg-timeback-primary'
                }`}>
                  <Icon className={`w-10 h-10 transition-colors duration-300 ${
                    isSelected 
                      ? 'text-white' 
                      : 'text-timeback-primary group-hover:text-white'
                  }`} />
                </div>
              </div>
              
              {/* Content */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-timeback-primary font-cal">
                  {option.title}
                </h3>
                
                <p className="text-lg text-timeback-primary font-cal leading-relaxed">
                  {option.description}
                </p>
                
                {/* Long Description - Shown on Hover/Selection */}
                <div className={`transition-all duration-300 overflow-hidden ${
                  isSelected 
                    ? 'max-h-24 opacity-100' 
                    : 'max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100'
                }`}>
                  <div className="pt-4 border-t border-timeback-primary/20">
                    <p className="text-sm text-timeback-primary font-cal leading-relaxed">
                      {option.longDescription}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Selection Indicator */}
              {isSelected && (
                <div className="mt-6 flex justify-center">
                  <div className="bg-timeback-primary text-white px-4 py-2 rounded-full text-sm font-bold font-cal">
                    ✓ Selected
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Progress Indicator */}
      <div className="pt-8">
        <p className="text-sm text-timeback-primary font-cal opacity-75">
          Your selection will automatically advance to the next step
        </p>
      </div>
    </div>
  );
}