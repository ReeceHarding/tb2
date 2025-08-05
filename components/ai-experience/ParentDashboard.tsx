'use client';

import React, { useState } from 'react';
import { usePostHog } from 'posthog-js/react';

interface ParentDashboardProps {
  studentGrade?: string;
  selectedSchool?: any;
}

export default function ParentDashboard({ studentGrade, selectedSchool: _selectedSchool }: ParentDashboardProps) {
  const posthog = usePostHog();
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [showDetailed, setShowDetailed] = useState(false);

  const metrics = {
    overview: {
      title: 'Daily Snapshot',
      data: [
        { label: 'Time Spent Today', value: '1h 42m', target: '2h', percentage: 85 },
        { label: 'Lessons Completed', value: '8', target: '8', percentage: 100 },
        { label: 'Accuracy Rate', value: '92%', target: '85%', percentage: 108 },
        { label: 'Efficiency Score', value: '96%', target: '90%', percentage: 107 }
      ]
    },
    progress: {
      title: 'Grade Progress',
      subjects: [
        { name: 'Math', gradeLevel: 6, progress: 87, weeksToComplete: 4 },
        { name: 'Language', gradeLevel: 6, progress: 92, weeksToComplete: 3 },
        { name: 'Science', gradeLevel: 5, progress: 78, weeksToComplete: 6 },
        { name: 'Reading', gradeLevel: 7, progress: 100, weeksToComplete: 0 }
      ]
    },
    knowledge: {
      title: 'Knowledge Map',
      strengths: ['Multiplication', 'Grammar', 'Reading Comprehension', 'Scientific Method'],
      improvements: ['Long Division', 'Essay Writing', 'Chemistry Basics'],
      mastered: ['Addition/Subtraction', 'Vocabulary', 'Earth Science']
    }
  };

  const handleMetricClick = (metric: string) => {
    console.log('[ParentDashboard] Metric selected:', metric);
    setSelectedMetric(metric);
    posthog?.capture('parent_dashboard_metric_viewed', {
      metric_type: metric,
      student_grade: studentGrade
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 border border-timeback-primary">
      <h3 className="text-2xl font-bold text-timeback-primary mb-4 font-cal">
        Parent Dashboard: Complete Transparency
      </h3>
      <p className="text-timeback-primary mb-8 font-cal">
        Know exactly where your child stands academically. No more grade inflation or surprises.
        Get real-time insights that traditional schools can&apos;t provide.
      </p>

      {/* Metric Selector */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {Object.entries(metrics).map(([key, metric]) => (
          <button
            key={key}
            onClick={() => handleMetricClick(key)}
            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
              selectedMetric === key
                ? 'border-timeback-primary bg-timeback-bg'
                : 'border-timeback-primary bg-white hover:border-timeback-primary'
            }`}
          >
            <h4 className="font-bold text-timeback-primary mb-1 font-cal">{metric.title}</h4>
            <p className="text-sm text-timeback-primary font-cal">
              {key === 'overview' && 'Real-time learning metrics'}
              {key === 'progress' && 'Subject completion tracking'}
              {key === 'knowledge' && 'Strengths & gaps analysis'}
            </p>
          </button>
        ))}
      </div>

      {/* Metric Content */}
      <div className="mb-8">
        {selectedMetric === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            {metrics.overview.data.map((item, index) => (
              <div key={index} className="bg-timeback-bg rounded-xl p-6 border border-timeback-primary">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-timeback-primary font-cal">{item.label}</h5>
                  <span className={`text-sm font-medium ${
                    item.percentage >= 100 ? 'text-timeback-primary' : 'text-timeback-primary'
                  }`}>
                    {item.percentage}% of target
                  </span>
                </div>
                <div className="text-2xl font-bold text-timeback-primary mb-2 font-cal">{item.value}</div>
                <div className="w-full bg-timeback-bg rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      item.percentage >= 100 ? 'bg-timeback-primary' : 'bg-timeback-bg'
                    }`}
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedMetric === 'progress' && (
          <div className="space-y-4">
            {metrics.progress.subjects.map((subject, index) => (
              <div key={index} className="bg-timeback-bg rounded-xl p-6 border border-timeback-primary">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h5 className="font-bold text-timeback-primary font-cal">{subject.name}</h5>
                    <p className="text-sm text-timeback-primary font-cal">Grade {subject.gradeLevel}</p>
                  </div>
                  <div className="text-right font-cal">
                    <div className="text-2xl font-bold text-timeback-primary font-cal">{subject.progress}%</div>
                    <p className="text-sm text-timeback-primary font-cal">
                      {subject.weeksToComplete > 0 
                        ? `${subject.weeksToComplete} weeks left`
                        : 'Completed!'}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-timeback-bg rounded-full h-3">
                  <div 
                    className="bg-timeback-primary h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${subject.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedMetric === 'knowledge' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-timeback-bg rounded-xl p-6 border border-timeback-primary">
              <h5 className="font-bold text-timeback-primary mb-4 flex items-center gap-2 font-cal">
                <span className="text-2xl font-cal">💪</span> Strengths
              </h5>
              <ul className="space-y-2">
                {metrics.knowledge.strengths.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-timeback-primary rounded-full" />
                    <span className="text-timeback-primary font-cal">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-timeback-bg rounded-xl p-6 border border-timeback-primary">
              <h5 className="font-bold text-timeback-primary mb-4 flex items-center gap-2 font-cal">
                <span className="text-2xl font-cal">📈</span> Areas to Improve
              </h5>
              <ul className="space-y-2">
                {metrics.knowledge.improvements.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-timeback-bg rounded-full" />
                    <span className="text-timeback-primary font-cal">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-timeback-bg rounded-xl p-6 border border-timeback-primary">
              <h5 className="font-bold text-timeback-primary mb-4 flex items-center gap-2 font-cal">
                <span className="text-2xl font-cal">✅</span> Mastered
              </h5>
              <ul className="space-y-2">
                {metrics.knowledge.mastered.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-timeback-primary rounded-full" />
                    <span className="text-timeback-primary font-cal">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Parent Testimonial */}
      <div className="p-6 bg-timeback-bg rounded-xl border border-timeback-primary">
        <div className="flex items-start gap-4">
          <div className="text-4xl font-cal">👨‍👩‍👧</div>
          <div>
            <p className="text-timeback-primary italic mb-2 font-cal">
              &quot;Finally, I actually know what my daughter is learning! Her old school gave her all A&apos;s, 
              but MAP tests showed she was behind. Now I see daily progress and she&apos;s caught up in just 3 months.&quot;
            </p>
            <p className="text-sm text-timeback-primary font-cal">
              - Michael P., TimeBack parent
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-6 text-center font-cal">
        <button 
          onClick={() => {
            setShowDetailed(!showDetailed);
            posthog?.capture('parent_dashboard_detailed_view_toggle', {
              show_detailed: !showDetailed
            });
          }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-timeback-primary text-white rounded-xl hover:bg-timeback-primary transition-colors duration-300 font-cal"
        >
          {showDetailed ? 'Hide' : 'Show'} Detailed Analytics
          <svg className={`w-4 h-4 transition-transform duration-300 ${showDetailed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Detailed View */}
      {showDetailed && (
        <div className="mt-6 p-6 bg-timeback-bg rounded-xl border border-timeback-primary animate-fadeIn">
          <h5 className="font-bold text-timeback-primary mb-4 font-cal">Detailed Learning Analytics</h5>
          <div className="grid md:grid-cols-3 gap-4 text-sm font-cal">
            <div>
              <span className="text-timeback-primary font-cal">Learning Velocity:</span>
              <span className="ml-2 font-bold text-timeback-primary font-cal">2.3x</span>
            </div>
            <div>
              <span className="text-timeback-primary font-cal">MAP Percentile:</span>
              <span className="ml-2 font-bold text-timeback-primary font-cal">94th</span>
            </div>
            <div>
              <span className="text-timeback-primary font-cal">Time Efficiency:</span>
              <span className="ml-2 font-bold text-timeback-primary font-cal">92%</span>
            </div>
            <div>
              <span className="text-timeback-primary font-cal">Waste Percentage:</span>
              <span className="ml-2 font-bold text-timeback-primary font-cal">8%</span>
            </div>
            <div>
              <span className="text-timeback-primary font-cal">Days Active:</span>
              <span className="ml-2 font-bold text-timeback-primary font-cal">142</span>
            </div>
            <div>
              <span className="text-timeback-primary font-cal">Next Assessment:</span>
              <span className="ml-2 font-bold text-timeback-primary font-cal">Dec 15</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}