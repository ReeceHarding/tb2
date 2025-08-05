'use client';

import React, { useState } from 'react';
import { usePostHog } from 'posthog-js/react';
import ProgressiveDisclosureHero from './ProgressiveDisclosureHero';
import SectionExplorer from './SectionExplorer';
import { PROGRESSIVE_DISCLOSURE_MAPPING, MainSection, SectionMapping } from './ProgressiveDisclosureMapping';

interface ProgressiveDisclosureContainerProps {
  quizData: any;
  preGeneratedContent?: any;
}

interface NavigationState {
  currentMainSection: string | null;
  viewedComponents: Array<{
    mainSectionId: string;
    componentName: string;
    timestamp: number;
  }>;
  navigationHistory: Array<{
    type: 'main' | 'component';
    id: string;
    timestamp: number;
  }>;
}

export default function ProgressiveDisclosureContainer({ 
  quizData, 
  preGeneratedContent 
}: ProgressiveDisclosureContainerProps) {
  
  const posthog = usePostHog();
  
  // State management for progressive disclosure - cumulative component viewing
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentMainSection: null,
    viewedComponents: [],
    navigationHistory: []
  });

  const [isTransitioning, setIsTransitioning] = useState(false);

  console.log('[ProgressiveDisclosureContainer] Current navigation state:', navigationState);

  // Handle main section selection (from hero buttons) - adds component to cumulative page
  const handleMainSectionSelect = (sectionId: string) => {
    console.log(`[ProgressiveDisclosureContainer] Main section selected: ${sectionId}`);
    
    setIsTransitioning(true);
    
    // Track analytics
    posthog?.capture('progressive_disclosure_main_section_clicked', {
      section_id: sectionId,
      user_type: quizData?.userType,
      grade_level: quizData?.selectedSchools?.[0]?.level,
      interests: quizData?.kidsInterests
    });

    // Find the first component for this section
    const mainSection = PROGRESSIVE_DISCLOSURE_MAPPING.find(section => section.id === sectionId);
    const firstComponent = mainSection?.sections[0]?.components[0]?.name;

    if (firstComponent) {
      // Add component to viewed list if not already there
      setNavigationState(prev => {
        const alreadyViewed = prev.viewedComponents.some(
          comp => comp.componentName === firstComponent && comp.mainSectionId === sectionId
        );
        
        if (alreadyViewed) {
          return prev; // Don't add duplicates
        }

        return {
          currentMainSection: sectionId,
          viewedComponents: [
            ...prev.viewedComponents,
            {
              mainSectionId: sectionId,
              componentName: firstComponent,
              timestamp: Date.now()
            }
          ],
          navigationHistory: [
            ...prev.navigationHistory,
            { type: 'main' as const, id: sectionId, timestamp: Date.now() }
          ]
        };
      });
    }

    // Auto-scroll to the new section with enhanced reliability
    const scrollToNewComponent = () => {
      const newComponentElement = document.getElementById(`component-${firstComponent?.toLowerCase()}`);
      if (newComponentElement) {
        console.log(`[ProgressiveDisclosureContainer] Auto-scrolling to new component: ${firstComponent}`);
        // Scroll with slight offset for better visibility
        const elementTop = newComponentElement.offsetTop;
        const offsetPosition = elementTop - 80; // 80px offset from top
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        setIsTransitioning(false);
      } else {
        // Retry after a short delay if element not found
        setTimeout(scrollToNewComponent, 100);
      }
    };
    
    setTimeout(scrollToNewComponent, 200);
  };

  // Handle component selection (from follow-up questions) - adds component to cumulative page
  const handleComponentSelect = (componentId: string) => {
    console.log(`[ProgressiveDisclosureContainer] Component selected: ${componentId}`);
    
    setIsTransitioning(true);

    // Find which main section this component belongs to
    let componentMainSection = null;
    for (const section of PROGRESSIVE_DISCLOSURE_MAPPING) {
      for (const subSection of section.sections) {
        if (subSection.components.some(comp => comp.name === componentId)) {
          componentMainSection = section.id;
          break;
        }
      }
      if (componentMainSection) break;
    }

    // Track analytics
    posthog?.capture('progressive_disclosure_component_clicked', {
      main_section_id: componentMainSection,
      component_id: componentId,
      user_type: quizData?.userType,
      cumulative_components_count: navigationState.viewedComponents.length + 1
    });

    // Add component to viewed list if not already there
    setNavigationState(prev => {
      const alreadyViewed = prev.viewedComponents.some(
        comp => comp.componentName === componentId
      );
      
      if (alreadyViewed) {
        // Just scroll to existing component with enhanced reliability
        const scrollToExistingComponent = () => {
          const element = document.getElementById(`component-${componentId.toLowerCase()}`);
          if (element) {
            console.log(`[ProgressiveDisclosureContainer] Auto-scrolling to existing component: ${componentId}`);
            // Scroll with slight offset for better visibility
            const elementTop = element.offsetTop;
            const offsetPosition = elementTop - 80; // 80px offset from top
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          } else {
            // Retry after a short delay if element not found
            console.log(`[ProgressiveDisclosureContainer] Existing element not found, retrying scroll for: ${componentId}`);
            setTimeout(scrollToExistingComponent, 100);
          }
        };
        
        setTimeout(scrollToExistingComponent, 100);
        setIsTransitioning(false);
        return prev;
      }

      const newState: NavigationState = {
        ...prev,
        currentMainSection: componentMainSection,
        viewedComponents: [
          ...prev.viewedComponents,
          {
            mainSectionId: componentMainSection || 'unknown',
            componentName: componentId,
            timestamp: Date.now()
          }
        ],
        navigationHistory: [
          ...prev.navigationHistory,
          { type: 'component' as const, id: componentId, timestamp: Date.now() }
        ]
      };

      // Auto-scroll to new component after it's added with enhanced reliability
      const scrollToComponent = () => {
        const element = document.getElementById(`component-${componentId.toLowerCase()}`);
        if (element) {
          console.log(`[ProgressiveDisclosureContainer] Auto-scrolling to follow-up component: ${componentId}`);
          // Scroll with slight offset for better visibility
          const elementTop = element.offsetTop;
          const offsetPosition = elementTop - 80; // 80px offset from top
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          setIsTransitioning(false);
        } else {
          // Retry after a short delay if element not found
          console.log(`[ProgressiveDisclosureContainer] Element not found, retrying scroll for: ${componentId}`);
          setTimeout(scrollToComponent, 100);
        }
      };
      
      setTimeout(scrollToComponent, 200);

      return newState;
    });
  };

  // Handle back navigation - scroll to hero but keep cumulative components visible
  const handleBackNavigation = () => {
    console.log('[ProgressiveDisclosureContainer] Back navigation triggered');
    
    setIsTransitioning(true);

    posthog?.capture('progressive_disclosure_back_clicked', {
      from_main_section: navigationState.currentMainSection,
      cumulative_components_count: navigationState.viewedComponents.length
    });

    // Scroll to hero section while keeping components visible
    const heroElement = document.getElementById('progressive-disclosure-hero');
    if (heroElement) {
      heroElement.scrollIntoView({ behavior: 'smooth' });
    }

    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Get current main section data
  const getCurrentMainSection = (): MainSection | null => {
    if (!navigationState.currentMainSection) return null;
    return PROGRESSIVE_DISCLOSURE_MAPPING.find(section => section.id === navigationState.currentMainSection) || null;
  };

  return (
    <div className="min-h-screen">
      {/* Always show hero section - users can continue adding to their personalized page */}
      <div id="progressive-disclosure-hero">
        <ProgressiveDisclosureHero 
          onSectionSelect={handleMainSectionSelect}
          quizData={quizData}
        />
      </div>

      {/* Show all viewed components cumulatively - building the shareable page */}
      {navigationState.viewedComponents.length > 0 && (
        <div 
          id="progressive-disclosure-content"
          className={`transition-all duration-500 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
        >
          <SectionExplorer
            viewedComponents={navigationState.viewedComponents}
            onComponentSelect={handleComponentSelect}
            onBackNavigation={handleBackNavigation}
            quizData={quizData}
            preGeneratedContent={preGeneratedContent}
            isTransitioning={isTransitioning}
          />
        </div>
      )}
    </div>
  );
}