'use client';

import React from 'react';
import { PROGRESSIVE_DISCLOSURE_MAPPING, MainSection } from './ProgressiveDisclosureMapping';
import CustomQuestionSection from './CustomQuestionSection';

interface ProgressiveDisclosureHeroProps {
  onSectionSelect: (sectionId: string) => void;
  quizData: any;
}

export default function ProgressiveDisclosureHero({ onSectionSelect, quizData }: ProgressiveDisclosureHeroProps) {
  
  console.log('[ProgressiveDisclosureHero] Rendering hero buttons');

  // Get child's interests and school info for personalization
  const interests = quizData?.kidsInterests || [];
  const schoolName = quizData?.selectedSchools?.[0]?.name || 'your child&apos;s school';
  const gradeLevel = quizData?.selectedSchools?.[0]?.level || 'high school';

  return (
    <>
      <section className="max-w-7xl mx-auto py-20 lg:py-32 px-6 lg:px-12">
        <div className="text-center mb-16 font-cal">
          <div className="inline-flex items-center gap-2 backdrop-blur-sm bg-white/20 border border-timeback-primary rounded-full px-6 py-3 mb-8">
            <div className="w-3 h-3 bg-timeback-primary rounded-full animate-pulse"></div>
            <span className="text-timeback-primary font-bold text-sm font-cal">PERSONALIZED FOR YOU</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold text-timeback-primary mb-8 font-cal">
            Where do you want to start?
          </h2>
          <p className="text-2xl text-timeback-primary max-w-4xl mx-auto font-cal leading-relaxed mb-4">
            Click each section below to explore how TimeBack creates personalized learning experiences for your child
          </p>
          <p className="text-lg text-timeback-primary opacity-75 max-w-3xl mx-auto font-cal">
            Based on your {gradeLevel} student&apos;s interests in {interests.slice(0, 2).join(' and ')}
          </p>
        </div>

        {/* Main Exploration Buttons - Condensed to 2 rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {PROGRESSIVE_DISCLOSURE_MAPPING.filter(sec => sec.id !== 'custom-questions').map((section: MainSection, index: number) => (
            <button
              key={section.id}
              onClick={() => {
                console.log(`[ProgressiveDisclosureHero] User clicked section: ${section.id}`);
                onSectionSelect(section.id);
              }}
              className="backdrop-blur-md bg-white/10 border-2 border-timeback-primary rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <h3 className="text-lg font-bold text-timeback-primary font-cal leading-tight">
                {section.buttonText}
              </h3>
            </button>
          ))}
        </div>
      </section>

      {/* Custom Question Section - Independent Element */}
      <div className="mt-16">
        <CustomQuestionSection quizData={quizData} />
      </div>

      {/* Bottom CTA */}
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        <div className="text-center mt-16 mb-16">
          <div className="backdrop-blur-md bg-white/10 border border-timeback-primary rounded-xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-timeback-primary mb-4 font-cal">
              Ready to dive deeper?
            </h3>
            <p className="text-lg text-timeback-primary font-cal">
              Click any section above to explore our personalized learning platform in detail
            </p>
          </div>
        </div>
      </div>
    </>
  );
}