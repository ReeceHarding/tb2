'use client';

/**
 * StudentJourneyLoader Component
 * Loading states for the student journey carousel feature
 * Strictly follows TimeBack design system
 */

import React from 'react';

interface StudentJourneyLoaderProps {
  message?: string;
}

export default function StudentJourneyLoader({ message = 'Finding students like your child...' }: StudentJourneyLoaderProps) {
  return (
    <div className="w-full py-8">
      {/* Main loading container */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-timeback-primary p-8 max-w-4xl mx-auto">
        <div className="flex flex-col items-center space-y-6">
          {/* Animated logo */}
          <div className="relative">
            <div className="w-24 h-24 bg-timeback-primary rounded-full flex items-center justify-center">
              <span className="text-white font-cal text-4xl font-bold">T</span>
            </div>
            <div className="absolute inset-0 w-24 h-24 border-4 border-timeback-bg border-t-timeback-primary rounded-full animate-spin"></div>
          </div>
          
          {/* Loading message */}
          <h3 className="text-2xl font-cal text-timeback-primary text-center">
            {message}
          </h3>
          
          {/* Progress indicator */}
          <div className="w-full max-w-md">
            <div className="h-3 bg-timeback-bg rounded-full overflow-hidden">
              <div className="h-full bg-timeback-primary rounded-full animate-pulse"
                   style={{
                     width: '70%',
                     animation: 'shimmer 2s ease-in-out infinite'
                   }}
              />
            </div>
          </div>
          
          {/* Informative text */}
          <p className="text-timeback-primary font-cal text-center max-w-lg">
            We&apos;re analyzing real student data to show you authentic growth stories from students 
            in your child&apos;s grade level who achieved remarkable results.
          </p>
        </div>
      </div>
      
      {/* Skeleton cards preview */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto opacity-50">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg border border-timeback-primary p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-timeback-bg rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-timeback-bg rounded w-full mb-2"></div>
              <div className="h-3 bg-timeback-bg rounded w-5/6 mb-4"></div>
              <div className="h-8 bg-timeback-bg rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Inline loader for smaller contexts
 */
export function InlineStudentLoader() {
  return (
    <div className="inline-flex items-center space-x-2 text-timeback-primary font-cal">
      <div className="w-4 h-4 border-2 border-timeback-bg border-t-timeback-primary rounded-full animate-spin"></div>
      <span className="text-sm">Loading student data...</span>
    </div>
  );
}