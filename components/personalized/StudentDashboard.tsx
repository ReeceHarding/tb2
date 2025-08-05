'use client';

/**
 * StudentDashboard Component
 * Detailed modal view showing comprehensive student journey data
 * Uses TimeBack design system with data visualization
 */

import React, { useEffect } from 'react';
import { StudentJourneyData } from './StudentCard';
import { numberToGrade } from '@/libs/grade-utils';
import { Line } from 'recharts';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface StudentDashboardProps {
  student: StudentJourneyData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function StudentDashboard({ student, isOpen, onClose }: StudentDashboardProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen || !student) return null;
  
  // Prepare chart data
  const chartData = [];
  if (student.mapGrowth.reading) {
    chartData.push({
      term: 'Fall',
      Reading: student.mapGrowth.reading.fall,
      Math: student.mapGrowth.math?.fall || null
    });
    chartData.push({
      term: 'Winter',
      Reading: student.mapGrowth.reading.winter,
      Math: student.mapGrowth.math?.winter || null
    });
    chartData.push({
      term: 'Spring',
      Reading: student.mapGrowth.reading.spring,
      Math: student.mapGrowth.math?.spring || null
    });
  }
  
  const readingJump = student.mapGrowth.reading?.percentileJump || 0;
  const mathJump = student.mapGrowth.math?.percentileJump || 0;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      
      {/* Modal Content */}
      <div 
        className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200"
        >
          <span className="text-timeback-primary font-cal text-xl">×</span>
        </button>
        
        {/* Header */}
        <div className="bg-gradient-to-br from-timeback-bg to-white p-8 rounded-t-xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-cal font-bold text-timeback-primary mb-2">
                {student.story.headline}
              </h2>
              <p className="text-lg font-cal text-timeback-primary opacity-80">
                {numberToGrade(student.grade)} Student • {student.campus}
              </p>
            </div>
          </div>
        </div>
        
        {/* Content Sections */}
        <div className="p-8 space-y-8">
          {/* Growth Overview */}
          <div className="grid md:grid-cols-2 gap-6">
            {student.mapGrowth.reading && (
              <div className="bg-timeback-bg bg-opacity-20 rounded-xl p-6 border-2 border-timeback-primary">
                <h3 className="text-xl font-cal font-bold text-timeback-primary mb-4">
                  Reading Growth
                </h3>
                <div className="text-center">
                  <div className="text-5xl font-cal font-bold text-timeback-primary mb-2">
                    +{readingJump}
                  </div>
                  <p className="text-sm font-cal text-timeback-primary">
                    percentile points gained
                  </p>
                  <div className="mt-4 text-sm font-cal text-timeback-primary">
                    {student.mapGrowth.reading.fall} → {student.mapGrowth.reading.spring} RIT
                  </div>
                </div>
              </div>
            )}
            
            {student.mapGrowth.math && (
              <div className="bg-timeback-bg bg-opacity-20 rounded-xl p-6 border-2 border-timeback-primary">
                <h3 className="text-xl font-cal font-bold text-timeback-primary mb-4">
                  Math Growth
                </h3>
                <div className="text-center">
                  <div className="text-5xl font-cal font-bold text-timeback-primary mb-2">
                    +{mathJump}
                  </div>
                  <p className="text-sm font-cal text-timeback-primary">
                    percentile points gained
                  </p>
                  <div className="mt-4 text-sm font-cal text-timeback-primary">
                    {student.mapGrowth.math.fall} → {student.mapGrowth.math.spring} RIT
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Progress Chart */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border-2 border-timeback-primary p-6">
              <h3 className="text-xl font-cal font-bold text-timeback-primary mb-4">
                MAP Score Progression
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="term" tick={{ fill: '#0f33bb', fontFamily: 'Cal Sans' }} />
                    <YAxis tick={{ fill: '#0f33bb', fontFamily: 'Cal Sans' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '2px solid #0f33bb',
                        borderRadius: '8px',
                        fontFamily: 'Cal Sans'
                      }}
                    />
                    <Legend wrapperStyle={{ fontFamily: 'Cal Sans' }} />
                    {student.mapGrowth.reading && (
                      <Line 
                        type="monotone" 
                        dataKey="Reading" 
                        stroke="#0f33bb" 
                        strokeWidth={3}
                        dot={{ fill: '#0f33bb', r: 6 }}
                      />
                    )}
                    {student.mapGrowth.math && (
                      <Line 
                        type="monotone" 
                        dataKey="Math" 
                        stroke="#1abeff" 
                        strokeWidth={3}
                        dot={{ fill: '#1abeff', r: 6 }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {/* Time Commitment */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-timeback-primary p-6">
            <h3 className="text-xl font-cal font-bold text-timeback-primary mb-4">
              Daily Learning Time
            </h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-cal text-timeback-primary">
                Average Daily Time:
              </span>
              <span className="text-2xl font-cal font-bold text-timeback-primary">
                {(student.timeCommitment.totalDailyMinutes / 60).toFixed(1)} hours
              </span>
            </div>
            <div className="h-4 bg-timeback-bg rounded-full overflow-hidden">
              <div 
                className="h-full bg-timeback-primary rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, student.timeCommitment.vsTargetPercentage)}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-cal text-timeback-primary text-center">
              {student.timeCommitment.vsTargetPercentage}% of 2-hour target
            </p>
          </div>
          
          {/* Student Story */}
          <div className="bg-gradient-to-br from-timeback-bg to-white rounded-xl p-6">
            <h3 className="text-xl font-cal font-bold text-timeback-primary mb-4">
              The Journey
            </h3>
            <p className="text-lg font-cal text-timeback-primary mb-4">
              {student.story.keyMoment}
            </p>
            <div className="border-l-4 border-timeback-primary pl-4 mt-6">
              <p className="text-lg font-cal text-timeback-primary italic">
                {student.story.parentQuote}
              </p>
              <p className="text-sm font-cal text-timeback-primary mt-2 opacity-80">
                - Parent of {numberToGrade(student.grade)} student
              </p>
            </div>
          </div>
          
          {/* Key Attributes */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-lg border border-timeback-primary p-4">
              <h4 className="text-sm font-cal font-bold text-timeback-primary mb-2">
                Learning Style
              </h4>
              <p className="text-sm font-cal text-timeback-primary">
                {student.personality.learningStyle}
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-timeback-primary p-4">
              <h4 className="text-sm font-cal font-bold text-timeback-primary mb-2">
                Key Strengths
              </h4>
              <p className="text-sm font-cal text-timeback-primary">
                {student.personality.strengths.join(', ')}
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-timeback-primary p-4">
              <h4 className="text-sm font-cal font-bold text-timeback-primary mb-2">
                Interests
              </h4>
              <p className="text-sm font-cal text-timeback-primary">
                {student.personality.interests.join(', ')}
              </p>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="bg-timeback-primary rounded-xl p-6 text-center">
            <h3 className="text-2xl font-cal font-bold text-white mb-4">
              Your Child Can Achieve Similar Results
            </h3>
            <p className="text-lg font-cal text-white mb-6 opacity-90">
              Join TimeBack and give your child the personalized learning experience they deserve.
            </p>
            <button className="bg-white text-timeback-primary font-cal font-bold py-4 px-8 rounded-xl hover:shadow-xl transition-all duration-200">
              Start Your Journey Today →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}