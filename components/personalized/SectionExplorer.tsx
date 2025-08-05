'use client';

import React from 'react';
import ErrorBoundary from '../ErrorBoundary';
import TrackedSection from '../TrackedSection';
import { getComponentByName, PROGRESSIVE_DISCLOSURE_MAPPING } from './ProgressiveDisclosureMapping';

interface SectionExplorerProps {
  viewedComponents: Array<{
    mainSectionId: string;
    componentName: string;
    timestamp: number;
  }>;
  onComponentSelect: (componentId: string) => void;
  onBackNavigation: () => void;
  quizData: any;
  preGeneratedContent?: any;
  isTransitioning: boolean;
}

export default function SectionExplorer({
  viewedComponents,
  onComponentSelect,
  onBackNavigation,
  quizData,
  preGeneratedContent,
  isTransitioning
}: SectionExplorerProps) {

  console.log('[SectionExplorer] Rendering cumulative components:', {
    viewedComponents: viewedComponents.map(c => c.componentName),
    isTransitioning
  });

  if (!viewedComponents || viewedComponents.length === 0) {
    return null;
  }

  // Get all available components that haven't been viewed yet for follow-up questions
  const getAllAvailableComponents = () => {
    const allComponents = PROGRESSIVE_DISCLOSURE_MAPPING.flatMap(section => 
      section.sections.flatMap(subSection =>
        subSection.components.map(comp => ({
          ...comp,
          sectionTitle: subSection.title,
          sectionId: subSection.id,
          mainSectionId: section.id
        }))
      )
    );
    
    // Filter out already viewed components
    const viewedComponentNames = viewedComponents.map(vc => vc.componentName);
    return allComponents.filter(comp => !viewedComponentNames.includes(comp.name));
  };

  const availableComponents = getAllAvailableComponents();

  return (
    <div className="min-h-screen">
      {/* Back to Top Navigation - always visible */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <button
          onClick={onBackNavigation}
          className="flex items-center gap-2 text-timeback-primary hover:text-opacity-75 transition-colors duration-200 font-cal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Explore Options
        </button>
      </div>

      {/* Render all viewed components cumulatively */}
      {viewedComponents.map((viewedComponent, index) => {
        const Component = getComponentByName(viewedComponent.componentName);
        if (!Component) {
          console.warn(`[SectionExplorer] Component not found: ${viewedComponent.componentName}`);
          return null;
        }

        const isLatest = index === viewedComponents.length - 1;

        return (
          <div 
            key={`${viewedComponent.componentName}-${viewedComponent.timestamp}`}
            id={`component-${viewedComponent.componentName.toLowerCase()}`}
            className={`transition-all duration-500 ${isTransitioning && isLatest ? 'opacity-50' : 'opacity-100'}`}
          >
            <TrackedSection 
              sectionName={`component_${viewedComponent.componentName.toLowerCase()}`}
              additionalData={{
                main_section: viewedComponent.mainSectionId,
                component: viewedComponent.componentName,
                user_type: quizData?.userType,
                grade_level: quizData?.selectedSchools?.[0]?.level,
                cumulative_position: index + 1,
                total_components: viewedComponents.length
              }}
            >
              <ErrorBoundary 
                componentName={viewedComponent.componentName}
                fallbackMessage={`${viewedComponent.componentName} component is temporarily unavailable. Please try again.`}
              >
                <Component
                  quizData={quizData}
                  interests={quizData?.kidsInterests}
                  gradeLevel={quizData?.selectedSchools?.[0]?.level || 'high school'}
                  learningGoals={[]}
                  preGeneratedContent={preGeneratedContent}
                  onLearnMore={() => {}} // Disable nested learn more for cumulative view
                />
              </ErrorBoundary>
            </TrackedSection>

            {/* Add separator between components except for the last one */}
            {!isLatest && (
              <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
                <div className="border-t border-timeback-primary opacity-20"></div>
              </div>
            )}
          </div>
        );
      })}

      {/* Follow-up Questions - Show after all components */}
      {availableComponents.length > 0 && (
        <section className="max-w-7xl mx-auto py-16 px-6 lg:px-12">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-timeback-primary font-cal mb-4">
              Continue Building Your Personalized Report
            </h3>
            <p className="text-lg text-timeback-primary opacity-75 font-cal">
              Add more insights to your shareable page
            </p>
          </div>
          
          <div className="grid gap-4 max-w-4xl mx-auto">
            {availableComponents.slice(0, 6).map((component, index) => {
              const displayName = component.name.replace(/([A-Z])/g, ' $1').trim();
              return (
                <button
                  key={component.name}
                  onClick={() => {
                    console.log(`[SectionExplorer] Follow-up component selected: ${component.name}`);
                    onComponentSelect(component.name);
                  }}
                  className="backdrop-blur-md bg-white/10 border-2 border-timeback-primary rounded-xl p-4 text-left hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-timeback-primary text-white rounded-full flex items-center justify-center font-bold text-lg font-cal">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-timeback-primary font-cal">
                            {displayName}
                          </h4>
                          <p className="text-sm text-timeback-primary opacity-75 font-cal">
                            {component.sectionTitle}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-6 flex-shrink-0">
                      <div className="w-6 h-6 text-timeback-primary group-hover:translate-x-1 transition-transform duration-200">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Progress indicator showing how much of the report has been built */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 backdrop-blur-sm bg-white/20 border border-timeback-primary rounded-full px-6 py-3">
              <div className="w-3 h-3 bg-timeback-primary rounded-full"></div>
              <span className="text-timeback-primary font-bold text-sm font-cal">
                {viewedComponents.length} sections added to your personalized report
              </span>
            </div>
          </div>
        </section>
      )}

      {/* End of report message when all components viewed */}
      {availableComponents.length === 0 && (
        <section className="max-w-7xl mx-auto py-16 px-6 lg:px-12 text-center">
          <div className="bg-gradient-to-br from-timeback-bg to-white rounded-xl p-8 border border-timeback-primary">
            <h3 className="text-3xl font-bold text-timeback-primary font-cal mb-4">
              Your Complete Personalized Report is Ready!
            </h3>
            <p className="text-lg text-timeback-primary opacity-75 font-cal mb-6">
              You have explored all available insights. This page is now ready to share with friends and family.
            </p>
            <div className="inline-flex items-center gap-2 bg-timeback-primary text-white rounded-full px-6 py-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-bold text-sm font-cal">
                Complete Report - {viewedComponents.length} Sections
              </span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}