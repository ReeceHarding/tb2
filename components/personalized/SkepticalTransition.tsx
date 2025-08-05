'use client';

/**
 * SkepticalTransition Component
 * Addresses parent skepticism before showing student journeys
 * Uses compelling copy and TimeBack design
 */

import React from 'react';
import { numberToGrade } from '@/libs/grade-utils';

interface SkepticalTransitionProps {
  grade: number;
  schoolName?: string;
}

export default function SkepticalTransition({ grade }: SkepticalTransitionProps) {
  const gradeString = numberToGrade(grade);
  
  return (
    <div className="w-full py-16 bg-gradient-to-br from-white to-timeback-bg">
      <div className="max-w-4xl mx-auto px-4">
        {/* Main Headline */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-cal font-bold text-timeback-primary mb-6">
            &ldquo;But Does It Really Work?&rdquo;
          </h2>
          <p className="text-xl font-cal text-timeback-primary opacity-90 max-w-2xl mx-auto">
            We get it. Two hours sounds too good to be true. That&rsquo;s why we&rsquo;re showing you 
            real {gradeString} students who proved it&rsquo;s possible.
          </p>
        </div>
        
        {/* Trust Indicators */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="backdrop-blur-md bg-timeback-bg/80 rounded-xl shadow-lg border-2 border-timeback-primary p-6 text-center">
            <div className="text-3xl font-cal font-bold text-timeback-primary mb-2">
              309
            </div>
            <p className="text-sm font-cal text-timeback-primary">
              Real Students Tracked
            </p>
          </div>
          
          <div className="backdrop-blur-md bg-timeback-bg/80 rounded-xl shadow-lg border-2 border-timeback-primary p-6 text-center">
            <div className="text-3xl font-cal font-bold text-timeback-primary mb-2">
              800+
            </div>
            <p className="text-sm font-cal text-timeback-primary">
              MAP Test Scores Analyzed
            </p>
          </div>
          
          <div className="backdrop-blur-md bg-timeback-bg/80 rounded-xl shadow-lg border-2 border-timeback-primary p-6 text-center">
            <div className="text-3xl font-cal font-bold text-timeback-primary mb-2">
              85%
            </div>
            <p className="text-sm font-cal text-timeback-primary">
              Show Significant Growth
            </p>
          </div>
        </div>
        
        {/* The Promise */}
        <div className="backdrop-blur-md bg-timeback-bg/80 rounded-xl shadow-2xl border-2 border-timeback-primary p-8 mb-8">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-16 h-16 bg-timeback-primary rounded-full flex items-center justify-center">
              <span className="text-white font-cal text-2xl font-bold">!</span>
            </div>
            <div className="flex-grow">
              <h3 className="text-2xl font-cal font-bold text-timeback-primary mb-3">
                Here&rsquo;s What We&rsquo;re About to Show You
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-timeback-primary font-cal mr-2">•</span>
                  <span className="text-lg font-cal text-timeback-primary">
                    Students in {gradeString} who jumped 10-85 percentile points
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-timeback-primary font-cal mr-2">•</span>
                  <span className="text-lg font-cal text-timeback-primary">
                    Actual daily time commitments (spoiler: it&rsquo;s around 2 hours)
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-timeback-primary font-cal mr-2">•</span>
                  <span className="text-lg font-cal text-timeback-primary">
                    Real MAP test progressions from Fall to Spring
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-timeback-primary font-cal mr-2">•</span>
                  <span className="text-lg font-cal text-timeback-primary">
                    Parent testimonials from families just like yours
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="text-center">
          <p className="text-lg font-cal text-timeback-primary mb-4">
            Meet students who transformed their academic journey
          </p>
          <div className="animate-bounce">
            <svg 
              className="w-8 h-8 mx-auto text-timeback-primary"
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}