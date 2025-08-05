'use client';

import React, { useState } from 'react';
import SchoolFinder from '@/components/quiz/steps/SchoolFinder';

// School Search Component - Using Quiz SchoolFinder with proper search prompts
export function SchoolSearchCollector({ 
  onNext, 
  onPrev 
}: { 
  onNext: (schools: any[]) => void;
  onPrev: () => void;
}) {
  const [selectedSchool, setSelectedSchool] = useState<any>(null);

  const handleSchoolSelect = (school: any) => {
    console.log('💠 [SchoolSearchCollector] School selected:', school);
    setSelectedSchool(school);
    onNext([school]);
  };

  return (
    <div className="space-y-6">
      {/* Custom header to match data collection flow */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border border-timeback-primary p-6">
          <h2 className="text-2xl font-bold text-timeback-primary mb-2 font-cal">
            Which school does your child attend?
          </h2>
          <p className="text-timeback-primary font-cal mb-4">
            Search for your child&apos;s school to get personalized insights about TimeBack learning opportunities.
          </p>
        </div>
      </div>

      {/* Use the quiz SchoolFinder component */}
      <SchoolFinder onSchoolSelect={handleSchoolSelect} />

      {/* Action buttons to match data collection flow */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border border-timeback-primary p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="text-sm text-timeback-primary font-cal">
              {selectedSchool 
                ? `Selected: ${selectedSchool.name}`
                : 'Select a school above to continue, or skip to explore other options.'
              }
            </div>
            <div className="flex gap-3">
              <button
                onClick={onPrev}
                className="px-6 py-2 border border-timeback-primary text-timeback-primary rounded-xl hover:bg-timeback-bg transition-colors font-cal"
              >
                Back
              </button>
              <button
                onClick={() => onNext([])}
                className="px-6 py-2 text-timeback-primary underline font-cal"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Grade Selection Component
export function GradeCollector({ 
  onNext, 
  onPrev 
}: { 
  onNext: (grade: string) => void;
  onPrev: () => void;
}) {
  const [selectedGrade, setSelectedGrade] = useState<string>('');

  const grades = [
    { value: 'kindergarten', label: 'Kindergarten' },
    { value: 'elementary', label: 'Elementary (1-5)' },
    { value: 'middle', label: 'Middle School (6-8)' },
    { value: 'high', label: 'High School (9-12)' }
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 backdrop-blur-md bg-white/10 rounded-xl shadow-lg border-2 border-timeback-primary">
      <h2 className="text-2xl font-bold text-timeback-primary mb-4 font-cal">
        What grade is your child in?
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {grades.map((grade) => (
          <button
            key={grade.value}
            onClick={() => setSelectedGrade(grade.value)}
            className={`p-4 border-2 rounded-xl font-cal transition-all ${
              selectedGrade === grade.value
                ? 'border-timeback-primary bg-timeback-bg text-timeback-primary'
                : 'border-timeback-primary text-timeback-primary hover:bg-timeback-bg'
            }`}
          >
            {grade.label}
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="px-6 py-2 border-2 border-timeback-primary text-timeback-primary rounded-xl font-bold hover:bg-timeback-bg transition-all font-cal"
        >
          Back
        </button>
        
        <button
          onClick={() => selectedGrade && onNext(selectedGrade)}
          disabled={!selectedGrade}
          className="px-6 py-2 bg-timeback-primary text-white rounded-xl font-bold hover:bg-opacity-90 disabled:opacity-50 transition-all font-cal"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// Interests Selection Component
export function InterestsCollector({ 
  onNext, 
  onPrev 
}: { 
  onNext: (interests: string[]) => void;
  onPrev: () => void;
}) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const interestOptions = [
    'Sports', 'Music', 'Art', 'Science', 'Technology', 'Reading',
    'Gaming', 'Dance', 'Theater', 'Math', 'History', 'Languages',
    'Nature', 'Animals', 'Cooking', 'Building', 'Writing', 'Photography'
  ];

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6 backdrop-blur-md bg-white/10 rounded-xl shadow-lg border-2 border-timeback-primary">
      <h2 className="text-2xl font-bold text-timeback-primary mb-4 font-cal">
        What are your child&apos;s interests?
      </h2>
      <p className="text-timeback-primary opacity-75 mb-6 font-cal">
        Select all that apply. This helps us personalize examples.
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {interestOptions.map((interest) => (
          <button
            key={interest}
            onClick={() => toggleInterest(interest)}
            className={`p-3 border-2 rounded-xl font-cal transition-all ${
              selectedInterests.includes(interest)
                ? 'border-timeback-primary bg-timeback-bg text-timeback-primary'
                : 'border-timeback-primary text-timeback-primary hover:bg-timeback-bg'
            }`}
          >
            {interest}
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="px-6 py-2 border-2 border-timeback-primary text-timeback-primary rounded-xl font-bold hover:bg-timeback-bg transition-all font-cal"
        >
          Back
        </button>
        
        <button
          onClick={() => onNext(selectedInterests)}
          disabled={selectedInterests.length === 0}
          className="px-6 py-2 bg-timeback-primary text-white rounded-xl font-bold hover:bg-opacity-90 disabled:opacity-50 transition-all font-cal"
        >
          Continue ({selectedInterests.length} selected)
        </button>
      </div>
    </div>
  );
}