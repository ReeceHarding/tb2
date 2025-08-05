'use client';

import React from 'react';
import { GraduationCap, Trophy, Award } from 'lucide-react';

export default function SATUniversityResults() {
  // Real SAT score data
  const satData = {
    alphaAverage: 1474,
    nationalAverage: 1028,
    difference: 446
  };

  // Real university destinations from Alpha graduates
  const universities = [
    'Stanford University',
    'Howard University',
    'The University of Texas at Austin',
    'Texas A&M University',
    'University of Southern California (USC)',
    'Vanderbilt University',
    'Northeastern University',
    'University College London (UCL)',
    'Savannah College of Art and Design (SCAD)',
    'Rochester Institute of Technology (RIT)',
    'Babson College',
    'Pratt Institute'
  ];

  // High school achievements
  const achievements = [
    { label: 'National Merit Scholars', value: '50%' },
    { label: 'AP Scholars with Distinction', value: '5 students' },
    { label: 'Average AP Score', value: '4.5/5' },
    { label: 'College Acceptance Rate', value: '100%' }
  ];

  return (
    <div className="bg-white rounded-xl border border-timeback-primary p-6">
      {/* Real Data Badge */}
      <div className="bg-timeback-bg border border-timeback-primary rounded-xl p-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-timeback-primary rounded-full"></div>
          <p className="text-sm font-medium text-timeback-primary font-cal">
            Real Data: Alpha High School Class of 2024 Results
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-timeback-primary font-cal" />
          <h3 className="text-lg font-semibold text-timeback-primary font-cal">
            High School Outcomes
          </h3>
        </div>
        <p className="text-sm text-timeback-primary font-cal">
          First graduating class achievements and college destinations
        </p>
      </div>

      {/* SAT Score Comparison */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-timeback-primary mb-3 font-cal">SAT Score Comparison</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 text-center border border-timeback-primary font-cal">
            <p className="text-sm text-timeback-primary mb-1 font-cal">National Average</p>
            <p className="text-3xl font-bold text-timeback-primary font-cal">{satData.nationalAverage}</p>
          </div>
          <div className="bg-timeback-bg rounded-xl p-4 text-center border border-timeback-primary font-cal">
            <p className="text-sm text-timeback-primary mb-1 font-cal">Alpha Students</p>
            <p className="text-3xl font-bold text-timeback-primary font-cal">{satData.alphaAverage}</p>
            <p className="text-xs text-timeback-primary mt-1 font-cal">+{satData.difference} points higher</p>
          </div>
        </div>
      </div>

      {/* Achievement Stats */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-timeback-primary mb-3 font-cal">Class Achievements</h4>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement, index) => (
            <div key={index} className="flex items-center gap-2">
              <Award className="w-4 h-4 text-timeback-primary flex-shrink-0 font-cal" />
              <div>
                <p className="text-xs text-timeback-primary font-cal">{achievement.label}</p>
                <p className="text-sm font-semibold text-timeback-primary font-cal">{achievement.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* University Destinations */}
      <div>
        <h4 className="text-sm font-semibold text-timeback-primary mb-3 flex items-center gap-2 font-cal">
          <GraduationCap className="w-4 h-4 text-timeback-primary font-cal" />
          University Destinations (Fall 2024)
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs font-cal">
          {universities.map((university, index) => (
            <div key={index} className="flex items-start gap-1">
              <span className="text-timeback-primary mt-0.5 font-cal">•</span>
              <span className="text-timeback-primary font-cal">{university}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 p-3 bg-timeback-bg rounded-xl border border-timeback-primary">
        <p className="text-xs text-timeback-primary font-cal">
          <strong>Note:</strong> These are actual results from Alpha High School&apos;s first graduating class. 
          Students used TimeBack for 10+ years without traditional academic teachers.
        </p>
      </div>
    </div>
  );
}