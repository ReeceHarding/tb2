'use client';

import React from 'react';
import { GeneratedContent } from '@/libs/unified-data-service';
import { SECTION_SCHEMAS } from '@/libs/section-schemas';
import AIContentRenderer from '@/components/AIContentRenderer';

interface SharedJourneyViewV2Props {
  journeyTitle: string;
  ownerName: string;
  sections: Array<{
    id: string;
    type: string;
    title: string;
    content: any;
    createdAt: Date;
  }>;
  userContext?: {
    interests: string[];
    grade: string | null;
    selectedSchools: any[];
  };
}

export default function SharedJourneyViewV2({
  journeyTitle,
  ownerName,
  sections,
  userContext
}: SharedJourneyViewV2Props) {
  console.log('[SharedJourneyViewV2] Rendering with:', {
    journeyTitle,
    ownerName,
    sectionsCount: sections.length,
    userContext
  });

  if (!sections || sections.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-timeback-bg to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-timeback-primary mb-4 font-cal">
              No Content Available
            </h1>
            <p className="text-lg text-timeback-primary opacity-75 font-cal">
              This journey doesn&apos;t have any content yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-timeback-bg to-white">
      {/* Hero Section */}
      <div className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 backdrop-blur-sm bg-white/20 border border-timeback-primary rounded-full px-6 py-3 mb-8">
              <div className="w-3 h-3 bg-timeback-primary rounded-full animate-pulse"></div>
              <span className="text-timeback-primary font-bold text-sm font-cal">SHARED JOURNEY</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-timeback-primary mb-4 font-cal">
              {journeyTitle || 'Personalized Learning Journey'}
            </h1>
            
            <p className="text-2xl text-timeback-primary opacity-90 font-cal">
              Created by {ownerName}
            </p>
            
            {userContext && (
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                {userContext.grade && (
                  <span className="backdrop-blur-sm bg-white/30 border border-timeback-primary rounded-full px-4 py-2 text-timeback-primary font-cal">
                    Grade: {userContext.grade}
                  </span>
                )}
                {userContext.interests.length > 0 && (
                  <span className="backdrop-blur-sm bg-white/30 border border-timeback-primary rounded-full px-4 py-2 text-timeback-primary font-cal">
                    Interests: {userContext.interests.slice(0, 2).join(', ')}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="pb-20">
        {sections.map((section, index) => {
          const schema = SECTION_SCHEMAS[section.type];
          
          if (!schema) {
            console.warn('[SharedJourneyViewV2] No schema found for section type:', section.type);
            return null;
          }

          return (
            <section
              key={section.id}
              id={`section-${section.id}`}
              className="max-w-7xl mx-auto px-6 lg:px-12 mb-20"
            >
              {/* Section Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 backdrop-blur-sm bg-white/20 border border-timeback-primary rounded-full px-6 py-3 mb-6">
                  <span className="text-timeback-primary font-bold text-sm font-cal">
                    SECTION {index + 1}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-timeback-primary font-cal">
                  {section.title}
                </h2>
              </div>

              {/* Section Content */}
              <div className="backdrop-blur-md bg-white/10 rounded-2xl border-2 border-timeback-primary p-8 shadow-2xl">
                <AIContentRenderer
                  sectionId={section.type}
                  schema={schema}
                  content={section.content}
                />
              </div>
            </section>
          );
        })}
      </div>

      {/* Call to Action */}
      <div className="pb-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <div className="backdrop-blur-md bg-timeback-bg/50 rounded-2xl border-2 border-timeback-primary p-12 shadow-2xl">
            <h3 className="text-3xl font-bold text-timeback-primary mb-6 font-cal">
              Want Your Own Personalized Journey?
            </h3>
            <p className="text-xl text-timeback-primary mb-8 font-cal">
              Create your own TimeBack learning journey tailored to your child&apos;s unique needs and interests.
            </p>
            <a
              href="/personalized"
              className="inline-flex items-center gap-3 bg-timeback-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-timeback-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl font-cal text-lg"
            >
              Start Your Journey
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}