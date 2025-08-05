'use client';

import React from 'react';

interface QuizData {
  userType: string;
  parentSubType: string;
  selectedSchools: Array<{
    id: string;
    name: string;
    city: string;
    state: string;
    level: string;
  }>;
  learningGoals: string[];
  kidsInterests: string[];
  numberOfKids: number;
}

interface TimeBackIntroVideoProps {
  quizData: QuizData;
  onLearnMore: (section: string) => void;
}

export default function TimeBackIntroVideo({ quizData, onLearnMore }: TimeBackIntroVideoProps): null {
  console.log('[TimeBackIntroVideo] Rendering with quiz data:', quizData);

  return null;
}