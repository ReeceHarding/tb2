'use client';

/**
 * StudentCard Component
 * Individual student preview card for the journey carousel
 * Shows key metrics and growth data with TimeBack design
 */

import React from 'react';
import { numberToGrade } from '@/libs/grade-utils';

export interface StudentJourneyData {
  id: string;
  grade: number;
  campus: string;
  mapGrowth: {
    reading?: {
      fall: number | null;
      winter: number | null;
      spring: number | null;
      percentileJump: number;
    };
    math?: {
      fall: number | null;
      winter: number | null;
      spring: number | null;
      percentileJump: number;
    };
  };
  timeCommitment: {
    totalDailyMinutes: number;
    averageWeekdayMinutes: number;
    vsTargetPercentage: number;
  };
  progression: {
    startingLevel: string;
    endingLevel: string;
    monthsToAchieve: number;
    subjectsImproved: number;
  };
  personality: {
    learningStyle: string;
    strengths: string[];
    interests: string[];
    challenge: string;
  };
  story: {
    headline: string;
    keyMoment: string;
    parentQuote: string;
  };
  highlights: {
    biggestWin: string;
    mostImprovedSubject: string;
    dailyHabitThatWorked: string;
  };
}

interface StudentCardProps {
  student: StudentJourneyData;
  onClick: () => void;
  isActive?: boolean;
}

export default function StudentCard({ student, onClick, isActive = false }: StudentCardProps) {
  // Calculate the biggest percentile jump
  const readingJump = student.mapGrowth.reading?.percentileJump || 0;
  const mathJump = student.mapGrowth.math?.percentileJump || 0;
  const biggestJump = Math.max(readingJump, mathJump);
  const biggestSubject = readingJump > mathJump ? 'Reading' : 'Math';
  
  // Convert daily minutes to hours for display
  const dailyHours = (student.timeCommitment.totalDailyMinutes / 60).toFixed(1);
  
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl shadow-lg border-2 
        ${isActive ? 'border-timeback-primary scale-105' : 'border-timeback-primary border-opacity-30'}
        p-6 cursor-pointer transition-all duration-200 
        hover:shadow-xl hover:scale-105 hover:border-opacity-100
        h-full flex flex-col
      `}
    >
      {/* Student ID and Grade */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-cal font-bold text-timeback-primary">
            Student {student.id.replace('Anon#', '')}
          </h3>
          <p className="text-sm font-cal text-timeback-primary opacity-80">
            {numberToGrade(student.grade)} • {student.campus}
          </p>
        </div>
        <div className="bg-timeback-bg rounded-xl px-3 py-1">
          <span className="text-xs font-cal font-bold text-timeback-primary">
            {student.progression.monthsToAchieve} months
          </span>
        </div>
      </div>
      
      {/* Main Achievement */}
      <div className="backdrop-blur-md bg-white/10 rounded-xl p-4 mb-4 flex-grow border-2 border-timeback-primary">
        <div className="text-center">
          <div className="text-3xl font-cal font-bold text-timeback-primary mb-1">
            +{biggestJump}
          </div>
          <div className="text-sm font-cal text-timeback-primary">
            percentile jump in {biggestSubject}
          </div>
        </div>
      </div>
      
      {/* Time Commitment */}
      <div className="border-t border-timeback-primary border-opacity-20 pt-4 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-cal text-timeback-primary">Daily Time:</span>
          <span className="text-sm font-cal font-bold text-timeback-primary">
            {dailyHours} hours/day
          </span>
        </div>
        <div className="mt-2 h-2 bg-timeback-bg rounded-full overflow-hidden">
          <div 
            className="h-full bg-timeback-primary rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, student.timeCommitment.vsTargetPercentage)}%` }}
          />
        </div>
      </div>
      
      {/* Key Strength */}
      <div className="mb-4">
        <p className="text-xs font-cal text-timeback-primary italic line-clamp-2">
          &quot;{student.personality.strengths[0]}&quot;
        </p>
      </div>
      
      {/* Call to Action */}
      <button className="w-full bg-timeback-primary text-white font-cal font-bold py-3 px-4 rounded-xl hover:bg-opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl">
        View Full Journey →
      </button>
    </div>
  );
}

/**
 * Skeleton card for loading state
 */
export function StudentCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-timeback-primary border-opacity-30 p-6 h-full animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="h-5 bg-timeback-bg rounded w-24 mb-2"></div>
          <div className="h-4 bg-timeback-bg rounded w-32"></div>
        </div>
        <div className="h-6 bg-timeback-bg rounded w-20"></div>
      </div>
      
      <div className="bg-timeback-bg rounded-xl p-4 mb-4 h-24"></div>
      
      <div className="border-t border-timeback-primary border-opacity-20 pt-4 mb-4">
        <div className="h-4 bg-timeback-bg rounded w-full mb-2"></div>
        <div className="h-2 bg-timeback-bg rounded-full"></div>
      </div>
      
      <div className="h-8 bg-timeback-bg rounded w-full mb-4"></div>
      <div className="h-12 bg-timeback-bg rounded-xl w-full"></div>
    </div>
  );
}