'use client';

import React from 'react';
import { QuizData, GeneratedContent, ShareableJourneySection } from '@/types/quiz';
import { PROGRESSIVE_DISCLOSURE_MAPPING } from './ProgressiveDisclosureMapping';
import dynamic from 'next/dynamic';

// Dynamic imports for all possible components
const TimeBackVsCompetitors = dynamic(() => import('./TimeBackVsCompetitors'));
const LearningScienceSection = dynamic(() => import('./LearningScienceSection'));
const MechanismSection = dynamic(() => import('./MechanismSection'));
const HowWeGetResults = dynamic(() => import('./HowWeGetResults'));
const ImmediateDataShock = dynamic(() => import('./ImmediateDataShock'));
const CompletionTimeData = dynamic(() => import('./CompletionTimeData'));
const SpeedComparison = dynamic(() => import('./SpeedComparison'));
const PersonalizedSubjectExamples = dynamic(() => import('./PersonalizedSubjectExamples'));
const StudentJourneyCarousel = dynamic(() => import('./StudentJourneyCarousel'));
const AfternoonActivities = dynamic(() => import('./AfternoonActivities'));
const CustomQuestionSection = dynamic(() => import('./CustomQuestionSection'));

// Component mapping for dynamic rendering
const componentMap: Record<string, React.ComponentType<any>> = {
  TimeBackVsCompetitors,
  LearningScienceSection,
  MechanismSection,
  HowWeGetResults,
  ImmediateDataShock,
  CompletionTimeData,
  SpeedComparison,
  PersonalizedSubjectExamples,
  StudentJourneyCarousel,
  AfternoonActivities,
  AfternoonActivitiesExpanded: AfternoonActivities, // Same component with different context
  CustomQuestionSection,
};

interface SharedJourneyViewProps {
  quizData: QuizData;
  generatedContent: GeneratedContent | null;
  viewedSections: ShareableJourneySection[];
  parentName: string;
}

export default function SharedJourneyView({
  quizData,
  generatedContent,
  viewedSections,
  parentName
}: SharedJourneyViewProps) {
  const timestamp = new Date().toISOString();
  
  console.log(`[SharedJourneyView] ${timestamp} Rendering shared journey with:`, {
    sectionsCount: viewedSections.length,
    parentName: parentName
  });

  // Group sections by main section for better organization
  const groupedSections = viewedSections.reduce((acc, section) => {
    const mainSection = PROGRESSIVE_DISCLOSURE_MAPPING.find(ms => ms.id === section.sectionId);
    if (mainSection) {
      if (!acc[section.sectionId]) {
        acc[section.sectionId] = {
          mainSection,
          components: []
        };
      }
      acc[section.sectionId].components.push(section);
    }
    return acc;
  }, {} as Record<string, { mainSection: typeof PROGRESSIVE_DISCLOSURE_MAPPING[0], components: ShareableJourneySection[] }>);

  // Sort components within each section by timestamp
  Object.values(groupedSections).forEach(group => {
    group.components.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  });

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Journey Timeline Header */}
        <div className="text-center mb-12">
          <h2 className="font-cal text-3xl text-timeback-primary mb-4">
            {parentName}&apos;s Learning Journey
          </h2>
          <p className="font-cal text-timeback-primary text-lg max-w-2xl mx-auto">
            Explore the personalized content sections that {parentName} discovered about TimeBack&apos;s revolutionary approach to education.
          </p>
        </div>

        {/* Render sections in the order they were viewed */}
        <div className="space-y-8">
          {Object.entries(groupedSections).map(([sectionId, group]) => (
            <div key={sectionId} className="bg-white rounded-3xl shadow-2xl border-2 border-timeback-primary overflow-hidden">
              {/* Section Header */}
              <div className="bg-timeback-primary text-white p-6">
                <h3 className="font-cal text-2xl">{group.mainSection.buttonText}</h3>
                <p className="font-cal text-sm opacity-90 mt-2">{group.mainSection.description}</p>
              </div>

              {/* Section Components */}
              <div className="p-6 space-y-6">
                {group.components.map((component, index) => {
                  // Find the component configuration from the main section
                  let componentConfig = null;
                  let componentName = null;
                  
                  // Search through all sections in the main section to find the component
                  for (const section of group.mainSection.sections) {
                    const found = section.components.find(c => c.name === component.componentId);
                    if (found) {
                      componentConfig = found;
                      componentName = found.name;
                      break;
                    }
                  }
                  
                  if (!componentConfig || !componentName) {
                    console.warn(`[SharedJourneyView] ${timestamp} Component not found:`, component.componentId);
                    return null;
                  }

                  const Component = componentMap[componentName];
                  if (!Component) {
                    console.warn(`[SharedJourneyView] ${timestamp} Component mapping not found:`, componentName);
                    return null;
                  }

                  return (
                    <div key={`${component.componentId}-${index}`} className="border-t-2 border-timeback-bg pt-6 first:border-t-0 first:pt-0">
                      <Component 
                        quizData={quizData}
                        preGeneratedContent={generatedContent}
                        isSharedView={true}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {viewedSections.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-timeback-primary p-12 max-w-2xl mx-auto">
              <p className="font-cal text-timeback-primary text-xl">
                This journey doesn&apos;t have any explored sections yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}