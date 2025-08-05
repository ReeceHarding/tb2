'use client';

import React from 'react';
import { useQuiz, Grade } from '../QuizContext';

interface GradeSelectionStepProps {
  onNext: () => void;
  onPrev: () => void;
}

export default function GradeSelectionStep({ onNext }: GradeSelectionStepProps) {
  const { state, dispatch } = useQuiz();

  console.log(`[GradeSelectionStep] Current grade: ${state.grade}`);

  const selectGrade = (grade: Grade) => {
    console.log(`[GradeSelectionStep] Selected grade: ${grade}`);
    dispatch({ type: 'SET_GRADE', grade });
    // Auto-advance after selection
    setTimeout(() => {
      onNext();
    }, 200);
  };

  // Grade options from Kindergarten to 12th grade
  const gradeOptions = [
    { id: 'K' as Grade, title: 'Kindergarten', description: 'Age 5-6' },
    { id: '1st' as Grade, title: '1st Grade', description: 'Age 6-7' },
    { id: '2nd' as Grade, title: '2nd Grade', description: 'Age 7-8' },
    { id: '3rd' as Grade, title: '3rd Grade', description: 'Age 8-9' },
    { id: '4th' as Grade, title: '4th Grade', description: 'Age 9-10' },
    { id: '5th' as Grade, title: '5th Grade', description: 'Age 10-11' },
    { id: '6th' as Grade, title: '6th Grade', description: 'Age 11-12' },
    { id: '7th' as Grade, title: '7th Grade', description: 'Age 12-13' },
    { id: '8th' as Grade, title: '8th Grade', description: 'Age 13-14' },
    { id: '9th' as Grade, title: '9th Grade', description: 'Age 14-15' },
    { id: '10th' as Grade, title: '10th Grade', description: 'Age 15-16' },
    { id: '11th' as Grade, title: '11th Grade', description: 'Age 16-17' },
    { id: '12th' as Grade, title: '12th Grade', description: 'Age 17-18' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Grade Selection */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-timeback-primary mb-6 text-center font-cal">
          What grade is your child in?
        </h2>
        
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
          {gradeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => selectGrade(option.id)}
              className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                state.grade === option.id
                  ? 'border-timeback-primary bg-timeback-bg'
                  : 'border-timeback-primary bg-white hover:border-timeback-primary hover:bg-timeback-bg'
              }`}
            >
              <h3 className={`font-semibold mb-1 font-cal ${
                state.grade === option.id ? 'text-timeback-primary' : 'text-timeback-primary'
              }`}>
                {option.title}
              </h3>
              <p className={`text-sm font-cal ${
                state.grade === option.id ? 'text-timeback-primary' : 'text-timeback-primary'
              }`}>
                {option.description}
              </p>
            </button>
          ))}
        </div>
      </div>


    </div>
  );
}