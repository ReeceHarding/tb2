'use client';

import React from 'react';
import { Clock, BookOpen, Zap, CheckCircle, BarChart } from 'lucide-react';

interface DailyLearningHoursProps {
  gradeLevel?: string;
}

export default function DailyLearningHours({ gradeLevel: _gradeLevel }: DailyLearningHoursProps) {
  // Real Daily Schedule based on actual Alpha School data
  const schedule = [
    { time: '25 minutes', activity: 'Math - Adaptive lessons at exact skill level', type: 'core', icon: BookOpen },
    { time: '25 minutes', activity: 'Reading - Personalized comprehension practice', type: 'core', icon: BookOpen },
    { time: '25 minutes', activity: 'Language Arts - Grammar & writing skills', type: 'core', icon: Zap },
    { time: '25 minutes', activity: 'Science/Social Studies - Rotating subjects', type: 'practice', icon: CheckCircle },
    { time: '20 minutes', activity: 'Additional Math & Test Prep', type: 'practice', icon: BarChart },
  ];

  return (
    <div className="backdrop-blur-md bg-timeback-bg/80 rounded-xl border border-timeback-primary p-6">
      {/* Real Data Badge */}
      <div className="bg-timeback-bg border border-timeback-primary rounded-xl p-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-timeback-primary rounded-full"></div>
          <p className="text-sm font-medium text-timeback-primary font-cal">
            Real Schedule: How Alpha Students Spend Their 2 Hours
          </p>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-timeback-primary font-cal" />
          <h3 className="text-lg font-semibold text-timeback-primary font-cal">
            Actual Daily Learning Schedule
          </h3>
        </div>
        <p className="text-sm text-timeback-primary font-cal">
          Proven structure used by 500+ students achieving 99th percentile
        </p>
      </div>

      <div className="space-y-3">
        {schedule.map((slot, index) => {
          const Icon = slot.icon;
          return (
            <div key={index} className="flex items-start gap-4 p-3 rounded-xl hover:bg-timeback-bg transition-colors border border-timeback-primary border-opacity-30">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  slot.type === 'core' ? 'bg-timeback-bg' : 'backdrop-blur-md bg-timeback-bg/80'
                } border border-timeback-primary`}>
                  <Icon className={`w-5 h-5 ${
                    slot.type === 'core' ? 'text-timeback-primary' : 'text-timeback-primary'
                  }`} />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-timeback-primary font-cal">{slot.activity}</p>
                <p className="text-xs text-timeback-primary font-cal mt-0.5">Duration: {slot.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="backdrop-blur-md bg-timeback-bg/80 rounded-xl p-4 text-center border border-timeback-primary font-cal">
          <p className="text-2xl font-bold text-timeback-primary font-cal">1.8</p>
          <p className="text-sm text-timeback-primary font-cal">Avg hours per day</p>
          <p className="text-xs text-timeback-primary font-cal mt-1">(Actual 2023-24 data)</p>
        </div>
        <div className="bg-timeback-bg rounded-xl p-4 text-center border border-timeback-primary font-cal">
          <p className="text-2xl font-bold text-timeback-primary font-cal">99th</p>
          <p className="text-sm text-timeback-primary font-cal">Percentile achieved</p>
          <p className="text-xs text-timeback-primary font-cal mt-1">(Not a goal - actual result)</p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-timeback-bg rounded-xl border border-timeback-primary">
        <p className="text-sm text-timeback-primary mb-2 font-cal">
          <strong>Key Data Points from 2023-24:</strong>
        </p>
        <ul className="text-xs text-timeback-primary space-y-1 font-cal">
          <li>• Average daily study time: 1.8 hours (some students as low as 1.4 hours)</li>
          <li>• No student exceeded 3 hours per day</li>
          <li>• 100% of students achieved grade-level mastery</li>
          <li>• Average of 2x faster progression than traditional schools</li>
        </ul>
      </div>
    </div>
  );
}