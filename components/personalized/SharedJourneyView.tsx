'use client';

import React from 'react';
import { QuizData, GeneratedContent, ShareableJourneySection } from '@/types/quiz';
import { sectionMappings, mainSections } from './ProgressiveDisclosureMapping';
import dynamic from 'next/dynamic';

// Dynamic imports for all possible components
const AfternoonActivities = dynamic(() => import('./AfternoonActivities'));
const HowWeGetResults = dynamic(() => import('./HowWeGetResults'));
const LearningScience = dynamic(() => import('./LearningScience'));
const DataShock = dynamic(() => import('./DataShock'));
const SubjectExamples = dynamic(() => import('./SubjectExamples'));
const ClosestSchools = dynamic(() => import('./ClosestSchools'));
const WhatsNext = dynamic(() => import('./WhatsNext'));
const DeeperDiveIntro = dynamic(() => import('./DeeperDiveIntro'));
const MoreSchoolOptions = dynamic(() => import('./MoreSchoolOptions'));
const TeacherSupport = dynamic(() => import('./TeacherSupport'));
const CustomQuestionSection = dynamic(() => import('./CustomQuestionSection'));

// Component mapping for dynamic rendering
const componentMap: Record<string, React.ComponentType<any>> = {
  AfternoonActivities,
  HowWeGetResults,
  LearningScience,
  DataShock,
  SubjectExamples,
  ClosestSchools,
  WhatsNext,
  DeeperDiveIntro,
  MoreSchoolOptions,
  TeacherSupport,
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
    const mainSection = mainSections.find(ms => ms.id === section.sectionId);
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
  }, {} as Record<string, { mainSection: typeof mainSections[0], components: ShareableJourneySection[] }>);

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
            {parentName}'s Learning Journey
          </h2>
          <p className="font-cal text-timeback-primary text-lg max-w-2xl mx-auto">
            Explore the personalized content sections that {parentName} discovered about TimeBack's revolutionary approach to education.
          </p>
        </div>

        {/* Render sections in the order they were viewed */}
        <div className="space-y-8">
          {Object.entries(groupedSections).map(([sectionId, group]) => (
            <div key={sectionId} className="bg-white rounded-3xl shadow-2xl border-2 border-timeback-primary overflow-hidden">
              {/* Section Header */}
              <div className="bg-timeback-primary text-white p-6">
                <h3 className="font-cal text-2xl">{group.mainSection.title}</h3>
                <p className="font-cal text-sm opacity-90 mt-2">{group.mainSection.subtitle}</p>
              </div>

              {/* Section Components */}
              <div className="p-6 space-y-6">
                {group.components.map((component, index) => {
                  const mapping = sectionMappings[sectionId];
                  const componentConfig = mapping?.components.find(c => c.id === component.componentId);
                  
                  if (!componentConfig || !componentConfig.component) {
                    console.warn(`[SharedJourneyView] ${timestamp} Component not found:`, component.componentId);
                    return null;
                  }

                  const Component = componentMap[componentConfig.component.name];
                  if (!Component) {
                    console.warn(`[SharedJourneyView] ${timestamp} Component mapping not found:`, componentConfig.component.name);
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
                This journey doesn't have any explored sections yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}