'use client';

import React, { useState } from 'react';
import { usePostHog } from 'posthog-js/react';

interface StudentExperienceProps {
  studentGrade?: string;
  selectedSubjects?: string[];
}

export default function StudentExperience({ studentGrade, selectedSubjects }: StudentExperienceProps) {
  const posthog = usePostHog();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [_hoveredFeature, _setHoveredFeature] = useState<string | null>(null);

  const features = [
    {
      id: 'dashboard',
      title: 'Personal Dashboard',
      description: 'Visual progress tracking with Jenga towers showing mastery',
      details: [
        'See exactly which lessons are completed',
        'Track daily goals and streaks',
        'Visual representation of grade progression',
        'Real-time achievement updates'
      ]
    },
    {
      id: 'ai-tutor',
      title: 'AI Tutor Experience',
      description: 'Personalized 1:1 tutoring that adapts to each student',
      details: [
        'Instant feedback on every answer',
        'Adaptive difficulty based on performance',
        'Multiple explanation methods (visual, audio, text)',
        'Never judges, infinitely patient'
      ]
    },
    {
      id: 'lessons',
      title: '18-Minute Lessons',
      description: 'Optimized for peak focus and retention',
      details: [
        'Bite-sized content prevents overwhelm',
        'Interactive practice problems',
        'Immediate mastery verification',
        'Fun animations and rewards'
      ]
    },
    {
      id: 'struggle',
      title: 'Struggle Detection',
      description: 'AI identifies challenges before frustration sets in',
      details: [
        'Automatic easier lesson recommendations',
        'Speed bump alerts for guides',
        'Alternative explanation methods',
        'Confidence-building support'
      ]
    }
  ];

  const handleTabClick = (tabId: string) => {
    console.log('[StudentExperience] Tab clicked:', tabId);
    setActiveTab(tabId);
    posthog?.capture('student_experience_tab_viewed', {
      tab_id: tabId,
      student_grade: studentGrade
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 border border-timeback-primary">
      <h3 className="text-2xl font-bold text-timeback-primary mb-4 font-cal">
        The Student Experience: Learning That Feels Like Play
      </h3>
      <p className="text-timeback-primary mb-8 font-cal">
        See how TimeBack transforms learning from a chore into an adventure. 
        Students love our approach because it respects their time and intelligence.
      </p>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-timeback-primary">
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => handleTabClick(feature.id)}
            className={`px-4 py-3 font-medium transition-all duration-300 relative ${
              activeTab === feature.id
                ? 'text-timeback-primary'
                : 'text-timeback-primary hover:text-timeback-primary'
            }`}
          >
            {feature.title}
            {activeTab === feature.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-timeback-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Feature Details */}
        <div className="space-y-6">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={`transition-all duration-300 ${
                activeTab === feature.id ? 'block' : 'hidden'
              }`}
            >
              <h4 className="text-xl font-bold text-timeback-primary mb-3 font-cal">
                {feature.title}
              </h4>
              <p className="text-timeback-primary mb-4 font-cal">
                {feature.description}
              </p>
              <ul className="space-y-2">
                {feature.details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-timeback-primary mt-0.5 flex-shrink-0 font-cal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-timeback-primary font-cal">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Interactive Demo */}
        <div className="bg-timeback-bg rounded-xl p-6 border border-timeback-primary">
          <div className="aspect-w-16 aspect-h-9 mb-4">
            {activeTab === 'dashboard' && (
              <div className="w-full h-64 bg-white rounded-xl p-4 border border-timeback-primary">
                <div className="text-sm font-medium text-timeback-primary mb-2 font-cal">Daily Progress</div>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {['Math', 'Science', 'Language', 'Reading'].map((subject, index) => (
                    <div key={subject} className="text-center font-cal">
                      <div className={`h-20 ${
                        (selectedSubjects && selectedSubjects.includes(subject.toLowerCase())) || !selectedSubjects
                          ? 'bg-timeback-primary' 
                          : 'bg-timeback-bg'
                      } rounded-t-lg relative overflow-hidden`}>
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-timeback-bg transition-all duration-1000"
                          style={{ height: `${[85, 100, 75, 90][index]}%` }}
                        />
                      </div>
                      <div className="text-xs mt-1 font-medium text-timeback-primary font-cal">{subject}</div>
                    </div>
                  ))}
                </div>
                <div className="text-center font-cal">
                  <div className="text-2xl font-bold text-timeback-primary font-cal">Level 5</div>
                  <div className="text-sm text-timeback-primary font-cal">85% to Level 6</div>
                </div>
              </div>
            )}

            {activeTab === 'ai-tutor' && (
              <div className="w-full h-64 bg-white rounded-xl p-4 border border-timeback-primary">
                <div className="mb-3">
                  <div className="text-sm text-timeback-primary mb-2 font-cal">AI Tutor says:</div>
                  <div className="bg-timeback-bg rounded-xl p-3 border border-timeback-primary">
                    <p className="text-sm text-timeback-primary font-cal">
                      &quot;Great job! You got 4 out of 5 correct. Let&apos;s review why 7 × 8 = 56, not 54. 
                      Think of it as 7 groups of 8 items...&quot;
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 px-3 bg-timeback-primary text-white rounded-xl text-sm font-medium font-cal">
                    Show me another way
                  </button>
                  <button className="flex-1 py-2 px-3 bg-timeback-bg text-timeback-primary rounded-xl text-sm font-medium font-cal">
                    I understand
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'lessons' && (
              <div className="w-full h-64 bg-white rounded-xl p-4 border border-timeback-primary">
                <div className="text-center mb-4 font-cal">
                  <div className="text-4xl font-bold text-timeback-primary mb-2 font-cal">18:00</div>
                  <div className="text-sm text-timeback-primary font-cal">Average lesson time</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-timeback-bg rounded">
                    <span className="text-sm font-medium font-cal">Introduction</span>
                    <span className="text-sm text-timeback-primary font-cal">3 min</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-timeback-bg rounded">
                    <span className="text-sm font-medium font-cal">Practice Problems</span>
                    <span className="text-sm text-timeback-primary font-cal">10 min</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-timeback-bg rounded">
                    <span className="text-sm font-medium font-cal">Mastery Check</span>
                    <span className="text-sm text-timeback-primary font-cal">5 min</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'struggle' && (
              <div className="w-full h-64 bg-white rounded-xl p-4 border border-timeback-primary">
                <div className="text-center mb-4 font-cal">
                  <div className="text-6xl mb-2 font-cal">🚨</div>
                  <div className="text-lg font-medium text-timeback-primary font-cal">Struggle Detected</div>
                </div>
                <div className="bg-timeback-bg rounded-xl p-3 mb-3">
                  <p className="text-sm text-timeback-primary text-center font-cal">
                    &quot;Looks like fractions are tricky right now. Let&apos;s try a visual approach!&quot;
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button className="py-2 px-3 bg-timeback-bg text-timeback-primary rounded text-sm font-medium font-cal">
                    Easier lesson
                  </button>
                  <button className="py-2 px-3 bg-timeback-bg text-timeback-primary rounded text-sm font-medium font-cal">
                    Video help
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="text-sm text-timeback-primary text-center font-cal">
            Interactive demo - Click tabs to explore different features
          </div>
        </div>
      </div>

      {/* Student Testimonial */}
      <div className="mt-8 p-6 bg-timeback-bg rounded-xl border border-timeback-primary">
        <div className="flex items-start gap-4">
          <div className="text-4xl font-cal">💬</div>
          <div>
            <p className="text-timeback-primary italic mb-2 font-cal">
              &quot;I love that I can move as fast as I want! In my old school, I had to wait for everyone else. 
              Now I&apos;m already doing {studentGrade ? `${parseInt(studentGrade) + 2}th` : '8th'} grade math!&quot;
            </p>
            <p className="text-sm text-timeback-primary font-cal">
              - Sarah, {studentGrade || '6th'} grade TimeBack student
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}