'use client';

import React, { useState } from 'react';
import { useDynamicOnboarding } from '../DynamicOnboardingContext';

interface GradeSelectionAdapterProps {
  onNext: () => void;
  onPrev: () => void;
}

const GRADE_OPTIONS = [
  { value: 'K', label: 'Kindergarten' },
  { value: '1st', label: '1st Grade' },
  { value: '2nd', label: '2nd Grade' },
  { value: '3rd', label: '3rd Grade' },
  { value: '4th', label: '4th Grade' },
  { value: '5th', label: '5th Grade' },
  { value: '6th', label: '6th Grade' },
  { value: '7th', label: '7th Grade' },
  { value: '8th', label: '8th Grade' },
  { value: '9th', label: '9th Grade' },
  { value: '10th', label: '10th Grade' },
  { value: '11th', label: '11th Grade' },
  { value: '12th', label: '12th Grade' }
];

export default function GradeSelectionAdapter({ onNext, onPrev }: GradeSelectionAdapterProps) {
  const { userData, updateUserData } = useDynamicOnboarding();
  const [selectedGrade, setSelectedGrade] = useState(userData.grade || '');

  const handleGradeSelect = (grade: string) => {
    console.log('[GradeSelectionAdapter] Grade selected:', grade);
    setSelectedGrade(grade);
    updateUserData({ grade });
  };

  const handleNext = () => {
    if (selectedGrade) {
      console.log('[GradeSelectionAdapter] Proceeding with grade:', selectedGrade);
      onNext();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-timeback-primary mb-2 font-cal">What grade is your child in?</h2>
      <p className="text-timeback-primary mb-6 font-cal">We&apos;ll show you grade-specific examples and data</p>

      {/* Grade Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {GRADE_OPTIONS.map((grade) => (
          <button
            key={grade.value}
            onClick={() => handleGradeSelect(grade.value)}
            className={`p-4 border-2 rounded-xl transition-all font-cal ${
              selectedGrade === grade.value
                ? 'border-timeback-primary bg-timeback-bg text-timeback-primary'
                : 'border-timeback-primary/30 hover:border-timeback-primary hover:bg-timeback-bg/50 text-timeback-primary'
            }`}
          >
            {grade.label}
          </button>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="px-6 py-3 border-2 border-timeback-primary text-timeback-primary rounded-xl font-bold hover:bg-timeback-bg transition-all font-cal"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedGrade}
          className={`px-6 py-3 rounded-xl font-bold transition-all font-cal ${
            selectedGrade
              ? 'bg-timeback-primary text-white hover:bg-opacity-90'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}