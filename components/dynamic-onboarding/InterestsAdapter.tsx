'use client';

import React, { useState } from 'react';
import { useDynamicOnboarding } from '../DynamicOnboardingContext';
import { 
  Music, 
  Palette, 
  Code, 
  FlaskConical, 
  Dumbbell, 
  Book, 
  Camera, 
  Gamepad2,
  Globe,
  Heart,
  Lightbulb,
  PencilRuler,
  Sparkles,
  TreePine,
  Users,
  Zap
} from 'lucide-react';

interface InterestsAdapterProps {
  onNext: () => void;
  onPrev: () => void;
}

const INTEREST_OPTIONS = [
  { value: 'music', label: 'Music', icon: Music },
  { value: 'art', label: 'Art & Drawing', icon: Palette },
  { value: 'coding', label: 'Coding', icon: Code },
  { value: 'science', label: 'Science', icon: FlaskConical },
  { value: 'sports', label: 'Sports', icon: Dumbbell },
  { value: 'reading', label: 'Reading', icon: Book },
  { value: 'photography', label: 'Photography', icon: Camera },
  { value: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { value: 'languages', label: 'Languages', icon: Globe },
  { value: 'animals', label: 'Animals', icon: Heart },
  { value: 'inventing', label: 'Inventing', icon: Lightbulb },
  { value: 'building', label: 'Building', icon: PencilRuler },
  { value: 'dance', label: 'Dance', icon: Sparkles },
  { value: 'nature', label: 'Nature', icon: TreePine },
  { value: 'socializing', label: 'Socializing', icon: Users },
  { value: 'technology', label: 'Technology', icon: Zap }
];

export default function InterestsAdapter({ onNext, onPrev }: InterestsAdapterProps) {
  const { userData, updateUserData } = useDynamicOnboarding();
  const [selectedInterests, setSelectedInterests] = useState<string[]>(userData.kidsInterests || []);

  const handleInterestToggle = (interest: string) => {
    console.log('[InterestsAdapter] Interest toggled:', interest);
    const newInterests = selectedInterests.includes(interest)
      ? selectedInterests.filter(i => i !== interest)
      : [...selectedInterests, interest];
    
    setSelectedInterests(newInterests);
    updateUserData({ kidsInterests: newInterests });
  };

  const handleNext = () => {
    if (selectedInterests.length > 0) {
      console.log('[InterestsAdapter] Proceeding with interests:', selectedInterests);
      onNext();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-timeback-primary mb-2 font-cal">What are your child&apos;s interests?</h2>
      <p className="text-timeback-primary mb-6 font-cal">
        Select all that apply. We&apos;ll create personalized learning examples based on these interests.
      </p>

      {/* Interests Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
        {INTEREST_OPTIONS.map((interest) => {
          const Icon = interest.icon;
          const isSelected = selectedInterests.includes(interest.value);
          
          return (
            <button
              key={interest.value}
              onClick={() => handleInterestToggle(interest.value)}
              className={`p-4 border-2 rounded-xl transition-all flex flex-col items-center gap-2 font-cal ${
                isSelected
                  ? 'border-timeback-primary bg-timeback-bg text-timeback-primary'
                  : 'border-timeback-primary/30 hover:border-timeback-primary hover:bg-timeback-bg/50 text-timeback-primary'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm font-medium">{interest.label}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Count */}
      <p className="text-center text-timeback-primary mb-6 font-cal">
        {selectedInterests.length > 0 
          ? `Selected: ${selectedInterests.length} interest${selectedInterests.length !== 1 ? 's' : ''}`
          : 'Please select at least one interest'
        }
      </p>

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
          disabled={selectedInterests.length === 0}
          className={`px-6 py-3 rounded-xl font-bold transition-all font-cal ${
            selectedInterests.length > 0
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