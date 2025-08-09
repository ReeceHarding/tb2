'use client';

import React from 'react';
import { TypewriterText } from './FollowUpQuestions';

interface SpeedComparisonProps {
  gradeLevel?: string;
  onLearnMore: (section: string) => void;
}

export default function SpeedComparison({ gradeLevel = '2nd', onLearnMore }: SpeedComparisonProps) {
  
  // Helper function to format grade level properly for different contexts
  const formatGradeLevel = (grade: string, context: 'title' | 'curriculum' | 'student') => {
    // Handle different grade formats
    const normalizedGrade = grade.toLowerCase();
    
    if (context === 'title') {
      // For main headings like "Your Child Can Complete..."
      if (normalizedGrade.includes('high')) return 'high school';
      if (normalizedGrade.includes('middle')) return 'middle school';
      if (normalizedGrade.includes('elementary')) return 'elementary';
      return `${grade} grade`;
    }
    
    if (context === 'curriculum') {
      // For curriculum references
      if (normalizedGrade.includes('high')) return 'high school curriculum';
      if (normalizedGrade.includes('middle')) return 'middle school curriculum';
      if (normalizedGrade.includes('elementary')) return 'elementary curriculum';
      return `${grade} grade curriculum`;
    }
    
    if (context === 'student') {
      // For student references
      if (normalizedGrade.includes('high')) return 'high schooler';
      if (normalizedGrade.includes('middle')) return 'middle schooler';
      if (normalizedGrade.includes('elementary')) return 'elementary student';
      return `${grade} grader`;
    }
    
    return grade;
  };
  // Real dataset from TimeBack's actual student completion times (in hours)
  const gradeData: Record<string, {
    traditional: Record<string, number>;
    timeback: Record<string, number>;
  }> = {
    'K': {
      traditional: { math: 180, reading: 180, science: 180, writing: 180 },
      timeback: { math: 34, reading: 17, science: 1, writing: 12 } // Science is minimal in K
    },
    '1st': {
      traditional: { math: 180, reading: 180, science: 180, writing: 180 },
      timeback: { math: 45, reading: 38, science: 1, writing: 27 } // Science is minimal in 1st
    },
    '2nd': {
      traditional: { math: 180, reading: 180, science: 180, writing: 180 },
      timeback: { math: 47, reading: 43, science: 5, writing: 30 }
    },
    '3rd': {
      traditional: { math: 180, reading: 180, science: 180, writing: 180 },
      timeback: { math: 44, reading: 38, science: 12, writing: 27 }
    },
    '4th': {
      traditional: { math: 180, reading: 180, science: 180, writing: 180 },
      timeback: { math: 50, reading: 31, science: 17, writing: 22 }
    },
    '5th': {
      traditional: { math: 180, reading: 180, science: 180, writing: 180 },
      timeback: { math: 53, reading: 28, science: 15, writing: 20 }
    },
    '6th': {
      traditional: { math: 180, reading: 180, science: 180, writing: 180 },
      timeback: { math: 46, reading: 36, science: 18, writing: 25 }
    },
    '7th': {
      traditional: { math: 180, reading: 180, science: 180, writing: 180 },
      timeback: { math: 40, reading: 27, science: 16, writing: 19 }
    },
    '8th': {
      traditional: { math: 180, reading: 180, science: 180, writing: 180 },
      timeback: { math: 32, reading: 29, science: 13, writing: 20 }
    },
    '9th': {
      traditional: { math: 180, reading: 180, science: 180, writing: 180 },
      timeback: { math: 78, reading: 30, science: 20, writing: 21 } // Science estimated based on trend
    },
    '10th': {
      traditional: { math: 180, reading: 180, science: 180, writing: 180 },
      timeback: { math: 84, reading: 26, science: 22, writing: 18 } // Science estimated based on trend
    },
    '11th': {
      traditional: { math: 180, reading: 180, science: 180, writing: 180 },
      timeback: { math: 64, reading: 22, science: 24, writing: 15 } // Science estimated based on trend
    },
    '12th': {
      traditional: { math: 180, reading: 180, science: 180, writing: 180 },
      timeback: { math: 82, reading: 24, science: 26, writing: 17 } // Science estimated based on trend
    }
  };

  // Get data for the selected grade, default to 2nd grade if not found
  const currentGradeData = gradeData[gradeLevel] || gradeData['2nd'];
  
  const subjects = ['math', 'reading', 'science', 'writing'];
  const subjectLabels = {
    math: 'Mathematics',
    reading: 'Reading & Language Arts',
    science: 'Science',
    writing: 'Writing & Composition'
  };

  // Calculate speedup factor for each subject
  const getSpeedupFactor = (subject: string) => {
    const traditional = currentGradeData.traditional[subject];
    const timeback = currentGradeData.timeback[subject];
    return Math.round(traditional / timeback);
  };

  return (
    <section className="max-w-7xl mx-auto py-20 lg:py-32 px-6 lg:px-12">
      {/* Header */}
      <div className="text-center mb-16 font-cal">
        <div className="inline-flex items-center gap-2 backdrop-blur-sm bg-white/20 border border-timeback-primary rounded-full px-6 py-3 mb-8">
          <div className="w-3 h-3 bg-timeback-primary rounded-full animate-pulse"></div>
          <span className="text-timeback-primary font-bold text-sm font-cal">SPEED COMPARISON</span>
        </div>
        <h2 className="text-4xl lg:text-6xl font-bold text-timeback-primary mb-8 font-cal">
          <TypewriterText 
            text="Your Child Can Master a Full Year in Just 2-3 Months"
            speed={35}
            startDelay={200}
          />
        </h2>
        <p className="text-2xl text-timeback-primary max-w-5xl mx-auto font-cal leading-relaxed">
          <TypewriterText 
            text="See the dramatic difference in learning speed between traditional schools and TimeBack's mastery based approach"
            speed={25}
            startDelay={1000}
          />
        </p>
      </div>

      {/* Main comparison chart */}
      <div className="backdrop-blur-md bg-white/10 rounded-2xl shadow-2xl border-2 border-timeback-primary p-12 mb-16">
        <h3 className="text-3xl font-bold text-timeback-primary mb-12 text-center font-cal">
          <TypewriterText 
            text="Our kids finish their coursework 5-10x faster"
            speed={30}
            startDelay={1600}
          />
        </h3>
        
        {/* Desktop view - Combined Vertical Bar chart */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Chart container */}
            <div className="h-[400px] flex items-end justify-center gap-8">
              {subjects.map((subject, index) => {
                const traditionalHours = currentGradeData.traditional[subject];
                const timebackHours = currentGradeData.timeback[subject];
                const maxValue = 180; // Fixed max to show consistent scale
                const traditionalHeight = Math.round(((traditionalHours / maxValue) * 350)); // 350px max height
                const timebackHeight = Math.round(((timebackHours / maxValue) * 350));
                const speedupFactor = getSpeedupFactor(subject);
                
                return (
                  <div key={subject} className="flex gap-2">
                    {/* TimeBack bar */}
                    <div className="text-center font-cal">
                      <div className="relative h-[350px] flex items-end">
                        <div className="w-16 relative group">
                          <div 
                            className="bg-timeback-primary rounded-t-lg transition-all duration-1000 ease-out relative hover:bg-opacity-90"
                            style={{ height: `${timebackHeight}px` }}
                          >
                            {/* Hours label on top of bar */}
                            <div className="absolute -top-8 left-0 right-0 text-sm font-bold text-timeback-primary font-cal">
                              {timebackHours}h
                            </div>
                            {/* Speedup factor badge positioned below the bar */}
                            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                              <div className="bg-timeback-bg border border-timeback-primary text-timeback-primary px-3 py-2 rounded-full text-sm font-bold font-cal">
                                {speedupFactor}x
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Traditional school bar */}
                    <div className="text-center font-cal">
                      <div className="relative h-[350px] flex items-end">
                        <div className="w-16 relative group">
                          <div 
                            className="bg-timeback-bg rounded-t-xl transition-all duration-1000 ease-out relative hover:bg-timeback-bg"
                            style={{ height: `${traditionalHeight}px` }}
                          >
                            {/* Hours label on top of bar */}
                            <div className="absolute -top-8 left-0 right-0 text-sm font-bold text-timeback-primary font-cal">
                              {traditionalHours}h
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* X-axis labels */}
            <div className="flex justify-center gap-8 mt-16">
              {subjects.map((subject) => (
                <div key={subject} className="text-center w-[136px] font-cal">
                  <h4 className="font-bold text-timeback-primary text-lg font-cal">
                    {subjectLabels[subject as keyof typeof subjectLabels]}
                  </h4>
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="flex justify-center gap-12 mt-12">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-timeback-primary rounded"></div>
                <span className="text-lg text-timeback-primary font-cal font-bold">TimeBack</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-timeback-bg rounded"></div>
                <span className="text-lg text-timeback-primary font-cal">Traditional School</span>
              </div>
            </div>
            
            {/* Total hours comparison */}
            <div className="flex items-center justify-center mt-12">
              <div className="inline-flex items-center gap-6 bg-timeback-bg border-2 border-timeback-primary text-timeback-primary px-8 py-4 rounded-xl text-xl font-bold font-cal shadow-2xl">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>TimeBack: {Object.values(currentGradeData.timeback).reduce((a, b) => a + b, 0)} hours</span>
                </div>
                <div className="text-2xl">vs</div>
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Traditional School: {Object.values(currentGradeData.traditional).reduce((a, b) => a + b, 0)} hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile view - Cards */}
        <div className="lg:hidden space-y-6">
          {subjects.map((subject) => (
            <div key={subject} className="bg-timeback-bg rounded-xl border-2 border-timeback-primary p-6">
              <h4 className="font-bold text-timeback-primary mb-4 text-xl font-cal">
                {subjectLabels[subject as keyof typeof subjectLabels]}
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-timeback-primary font-cal">TimeBack:</span>
                  <span className="font-bold text-timeback-primary font-cal">{currentGradeData.timeback[subject]} hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-timeback-primary font-cal">Traditional School:</span>
                  <span className="font-bold text-timeback-primary font-cal">{currentGradeData.traditional[subject]} hours</span>
                </div>
                <div className="pt-3 border-t-2 border-timeback-primary">
                  <span className="text-timeback-primary font-bold font-cal text-lg">{getSpeedupFactor(subject)}x faster!</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total completion time improvement */}
        <div className="flex items-center justify-center mt-12">
          <div className="inline-flex items-center gap-3 bg-timeback-bg border-2 border-timeback-primary text-timeback-primary px-8 py-4 rounded-xl text-xl font-bold font-cal shadow-2xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>
              {Math.round(Object.values(currentGradeData.traditional).reduce((a, b) => a + b, 0) / 
                      Object.values(currentGradeData.timeback).reduce((a, b) => a + b, 0))}x faster total completion time
            </span>
          </div>
        </div>
      </div>

      {/* Additional context */}
      <div className="bg-gradient-to-r from-timeback-bg to-white rounded-2xl border-2 border-timeback-primary p-12 text-center shadow-2xl font-cal">
        <h3 className="text-3xl font-bold text-timeback-primary mb-6 font-cal">
          What This Means for Your Child
        </h3>
        <p className="text-xl text-timeback-primary max-w-4xl mx-auto font-cal leading-relaxed">
          Instead of spending an entire school year on {formatGradeLevel(gradeLevel, 'curriculum')}, your child can master 
          it in just 2-3 months. This gives them time to either advance to higher grades or dive deeper 
          into subjects they&apos;re passionate about.
        </p>
        <button 
          onClick={() => onLearnMore('speed-comparison')}
          className="mt-8 px-8 py-4 border-2 border-timeback-primary text-timeback-primary bg-transparent rounded-xl hover:bg-timeback-bg transition-all duration-200 transform hover:scale-105 font-bold font-cal text-lg shadow-2xl hover:shadow-2xl"
        >
          Learn More About Our Methodology
        </button>
      </div>
    </section>
  );
}