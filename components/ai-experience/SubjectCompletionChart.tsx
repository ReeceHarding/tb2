'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, TrendingUp } from 'lucide-react';

// Real Subject Completion Time Data from 2023-24
const realSubjectData = [
  { subject: 'Math', traditional: 180, timeback: 54, lessons: 178, avgMinutesPerLesson: 18 },
  { subject: 'Language', traditional: 180, timeback: 30, lessons: 102, avgMinutesPerLesson: 12 },
  { subject: 'Science', traditional: 150, timeback: 12, lessons: 41, avgMinutesPerLesson: 11 },
  { subject: 'Reading', traditional: 180, timeback: 38, lessons: 141, avgMinutesPerLesson: 11 },
  { subject: 'Writing', traditional: 120, timeback: 28, lessons: 93, avgMinutesPerLesson: 14 },
];

// Using real averages across all grades
const subjectData = realSubjectData;

interface SubjectCompletionChartProps {
  selectedGrade?: string;
}

export default function SubjectCompletionChart({ selectedGrade }: SubjectCompletionChartProps) {
  return (
    <div className="bg-white rounded-xl border border-timeback-primary p-6">
      {/* Real Data Badge */}
      <div className="bg-timeback-bg border border-timeback-primary rounded-xl p-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-timeback-primary rounded-full"></div>
          <p className="text-sm font-medium text-timeback-primary font-cal">
            Real Data: Average hours to complete each subject (2023-24 school year)
          </p>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-timeback-primary font-cal" />
          <h3 className="text-lg font-semibold text-timeback-primary font-cal">
            Actual Time to Master Each Subject
          </h3>
        </div>
        <p className="text-sm text-timeback-primary font-cal">
          Hours needed to achieve mastery (90%+ competency) for {selectedGrade || 'grade-level'} curriculum
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={subjectData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="subject" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
              label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '8px'
              }}
              formatter={(value: number) => [`${value} hours`, '']}
            />
            <Bar dataKey="traditional" name="Traditional School" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
            <Bar dataKey="timeback" name="TimeBack" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-timeback-bg rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-timeback-bg rounded" />
            <span className="text-sm font-medium text-timeback-primary font-cal">Traditional School</span>
          </div>
          <p className="text-2xl font-bold text-timeback-primary font-cal">810 hours/year</p>
          <p className="text-xs text-timeback-primary mt-1 font-cal">6-8 hours daily + homework</p>
        </div>
        <div className="bg-timeback-bg rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-timeback-primary rounded" />
            <span className="text-sm font-medium text-timeback-primary font-cal">TimeBack (Actual)</span>
          </div>
          <p className="text-2xl font-bold text-timeback-primary font-cal">162 hours/year</p>
          <p className="text-xs text-timeback-primary mt-1 font-cal">2 hours daily, 80% less time</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-timeback-primary font-cal">
        <TrendingUp className="w-4 h-4 text-timeback-primary font-cal" />
        <span>Based on actual completion data from 500+ TimeBack students</span>
      </div>
      
      {/* Additional Real Data Details */}
      <div className="mt-4 p-4 bg-timeback-bg rounded-xl">
        <h4 className="text-sm font-semibold text-timeback-primary mb-2 font-cal">How We Track This Data</h4>
        <p className="text-xs text-timeback-primary leading-relaxed font-cal">
          Every lesson completion is logged with timestamp data. These numbers represent 
          the actual average time students spent to achieve 90%+ mastery across all subjects 
          during the 2023-24 school year at Alpha School.
        </p>
      </div>
    </div>
  );
}