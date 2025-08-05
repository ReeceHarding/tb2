'use client';

import React from 'react';
import { Brain, Zap, Target, Users } from 'lucide-react';

export default function LearningScienceExplanation() {
  const principles = [
    {
      icon: Brain,
      title: 'Cognitive Load Theory',
      description: 'Based on Sweller&apos;s research, we optimize learning by managing cognitive load through bite-sized, focused lessons.',
      stat: '40% better retention'
    },
    {
      icon: Zap,
      title: 'Spaced Repetition',
      description: 'Using Ebbinghaus&apos;s forgetting curve research, we time reviews for maximum long-term retention.',
      stat: '2x faster mastery'
    },
    {
      icon: Target,
      title: 'Mastery Learning',
      description: 'Following Bloom&apos;s framework, students achieve 90%+ understanding before advancing.',
      stat: '98th percentile results'
    },
    {
      icon: Users,
      title: 'Testing Effect',
      description: 'Based on Roediger & Butler&apos;s studies, frequent low-stakes testing enhances learning.',
      stat: '50% better recall'
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-timeback-primary p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-timeback-primary mb-2 font-cal">
          Research-Backed Learning Science
        </h3>
        <p className="text-sm text-timeback-primary font-cal">
          TimeBack&apos;s methodology is built on decades of educational research
        </p>
      </div>

      <div className="grid gap-4">
        {principles.map((principle, index) => {
          const Icon = principle.icon;
          return (
            <div key={index} className="border border-timeback-primary rounded-xl p-4 hover:bg-timeback-bg transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-timeback-bg rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-timeback-primary font-cal" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-timeback-primary mb-1 font-cal">{principle.title}</h4>
                  <p className="text-sm text-timeback-primary mb-2 font-cal">{principle.description}</p>
                  <div className="inline-flex items-center px-2.5 py-1 bg-timeback-bg rounded-full">
                    <span className="text-xs font-medium text-timeback-primary font-cal">{principle.stat}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-timeback-bg rounded-xl">
        <h4 className="font-medium text-timeback-primary mb-2 font-cal">The TimeBack Difference</h4>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-timeback-primary rounded-full mt-1.5 flex-shrink-0" />
            <span className="text-sm text-timeback-primary font-cal">
              AI adapts to each child&apos;s unique learning style and pace
            </span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-timeback-primary rounded-full mt-1.5 flex-shrink-0" />
            <span className="text-sm text-timeback-primary font-cal">
              Real-time adjustments based on comprehension and retention
            </span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-timeback-primary rounded-full mt-1.5 flex-shrink-0" />
            <span className="text-sm text-timeback-primary font-cal">
              Eliminates ineffective busy work and redundant practice
            </span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-timeback-primary rounded-full mt-1.5 flex-shrink-0" />
            <span className="text-sm text-timeback-primary font-cal">
              Focuses on deep understanding over surface-level memorization
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}