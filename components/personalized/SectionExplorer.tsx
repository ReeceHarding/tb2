'use client';

import React, { useState } from 'react';
import SchemaResponseRenderer from '@/components/SchemaResponseRenderer';
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
  contentReady?: boolean;
}

export default function SectionExplorer({
  viewedComponents,
  onComponentSelect,
  onBackNavigation,
  quizData,
  preGeneratedContent,
  isTransitioning,
  contentReady = true
}: SectionExplorerProps) {

  // Simple question answer states - must be at top level
  const [question, setQuestion] = useState('');
  const [schemaResponse, setSchemaResponse] = useState<any>(null);
  const [isLoadingQA, setIsLoadingQA] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);

  console.log('[SectionExplorer] Rendering cumulative components:', {
    viewedComponents: viewedComponents?.map(c => c.componentName) || [],
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
    const filteredComponents = allComponents.filter(comp => !viewedComponentNames.includes(comp.name));
    return filteredComponents;
  };

  const availableComponents = getAllAvailableComponents();

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoadingQA) return;
    
    const currentQuestion = question.trim();
    console.log('[SectionExplorer] Processing question with schema format:', currentQuestion);
    setIsLoadingQA(true);
    setSchemaResponse(null);
    
    // Create previous content summary for context
    const previousContentSummary = conversationHistory.length > 0 
      ? conversationHistory.map((msg, index) => 
          `${msg.role === 'user' ? 'Q' : 'A'}${Math.floor(index/2) + 1}: ${msg.content}`
        ).join('\n')
      : 'No previous interactions';
    
    try {
      const res = await fetch('/api/ai/chat-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion,
          interests: quizData?.kidsInterests,
          responseFormat: 'schema',
          quizData: {
            ...quizData,
            previousContent: previousContentSummary
          },
          messageHistory: conversationHistory,
          context: {
            parentType: quizData?.parentSubType,
            school: quizData?.selectedSchools?.[0]?.name,
            numberOfKids: quizData?.numberOfKids,
            selectedSchools: quizData?.selectedSchools,
            kidsInterests: quizData?.kidsInterests,
            previousContent: previousContentSummary
          }
        })
      });
      const data = await res.json();
      
      if (data.success && data.responseFormat === 'schema') {
        console.log('[SectionExplorer] Got schema response:', data.response);
        setSchemaResponse(data.response);
        
        // Add to conversation history
        const newHistory = [
          ...conversationHistory,
          { role: 'user' as const, content: currentQuestion },
          { role: 'assistant' as const, content: JSON.stringify(data.response) }
        ];
        setConversationHistory(newHistory);
      } else if (data.success) {
        console.log('[SectionExplorer] Got plain text, creating fallback schema');
        const fallbackResponse = {
          header: 'TIMEBACK | PERSONALIZED ANSWER',
          main_heading: 'Your Question Answered',
          description: data.response,
          key_points: [
            { label: 'Key Insight', description: 'Based on your specific situation and interests' },
            { label: 'Personalized Approach', description: 'Tailored to your child\'s needs' },
            { label: 'Next Steps', description: 'Ready to learn more about TimeBack?' }
          ],
          next_options: ['Tell me about TimeBack results', 'How does the daily schedule work?', 'What about my child\'s specific interests?']
        };
        setSchemaResponse(fallbackResponse);
        
        // Add to conversation history
        const newHistory = [
          ...conversationHistory,
          { role: 'user' as const, content: currentQuestion },
          { role: 'assistant' as const, content: data.response }
        ];
        setConversationHistory(newHistory);
      } else {
        throw new Error(data.error || data.validationError || 'Failed to get response');
      }
    } catch (err) {
      console.error('[SectionExplorer] QA error', err);
      const errorMessage = 'Sorry, something went wrong. Please try asking your question again.';
      
      setSchemaResponse({
        header: 'TIMEBACK | ERROR',
        main_heading: 'Something went wrong',
        description: errorMessage,
        key_points: [
          { label: 'Try Again', description: 'Please rephrase your question and try again' },
          { label: 'Contact Support', description: 'If the issue persists, our team is here to help' },
          { label: 'Browse Resources', description: 'Explore our other resources while we resolve this' }
        ],
        next_options: ['Ask a different question', 'Learn about TimeBack basics', 'Contact our team']
      });
      
      // Add error to conversation history
      const newHistory = [
        ...conversationHistory,
        { role: 'user' as const, content: currentQuestion },
        { role: 'assistant' as const, content: errorMessage }
      ];
      setConversationHistory(newHistory);
    } finally {
      setIsLoadingQA(false);
      setQuestion(''); // Clear the question input after submission
    }
  };

  const handleNextOptionClick = async (option: string) => {
    console.log('[SectionExplorer] Next option clicked:', option);
    setQuestion(option);
    // Auto-submit the selected question for seamless flow
    setTimeout(() => {
      handleQuestionSubmit({ preventDefault: () => {} } as React.FormEvent);
    }, 50);
  };

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
                  contentReady={contentReady}
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

          {/* Personalized Q&A */}
          <div className="mt-12 text-center">
            <form onSubmit={handleQuestionSubmit} className="flex flex-col gap-4 items-center max-w-xl mx-auto w-full">
              <input
                type="text"
                value={question}
                onChange={(e)=>setQuestion(e.target.value)}
                placeholder="Ask anything about TimeBack..."
                className="w-full px-6 py-4 bg-white/10 backdrop-blur-md border-2 border-timeback-primary rounded-xl text-timeback-primary placeholder-timeback-primary/60 focus:ring-2 focus:ring-timeback-primary focus:border-transparent outline-none font-cal"
                disabled={isLoadingQA}
              />
              <button
                type="submit"
                disabled={!question.trim() || isLoadingQA}
                className="bg-timeback-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-timeback-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg font-cal"
              >
                {isLoadingQA ? 'Getting answer...' : 'Get Personalized Answer'}
              </button>
            </form>
            {(schemaResponse || isLoadingQA) && (
              <div className="mt-6 bg-white rounded-xl p-6 border border-timeback-primary shadow-lg text-left max-w-4xl mx-auto">
                <SchemaResponseRenderer 
                  response={schemaResponse}
                  onNextOptionClick={handleNextOptionClick}
                  isLoading={isLoadingQA}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* End of report message when all components viewed */}
      {availableComponents.length === 0 && (
        <section className="max-w-7xl mx-auto py-16 px-6 lg:px-12 text-center">
          <div className="backdrop-blur-md bg-white/10 rounded-xl p-8 border-2 border-timeback-primary">
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