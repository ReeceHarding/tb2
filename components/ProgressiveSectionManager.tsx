'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { unifiedDataService } from '@/libs/unified-data-service';
import { SECTION_SCHEMAS, hasRequiredData, getMissingData } from '@/libs/section-schemas';
import ProgressiveDataCollection from './ProgressiveDataCollection';
import AIContentRenderer from './AIContentRenderer';
import { smoothScrollToElement } from '@/lib/utils';
import FollowUpQuestions from './personalized/FollowUpQuestions';
import { fieldMapper } from '@/libs/supabase-service';

interface GeneratedSection {
  id: string;
  sectionId: string;
  content: any;
  generatedAt: Date;
}

interface ProgressiveSectionManagerProps {
  onSectionGenerated?: (section: GeneratedSection) => void;
  className?: string;
}

export default function ProgressiveSectionManager({ 
  onSectionGenerated,
  className = ''
}: ProgressiveSectionManagerProps) {
  const { data: session } = useSession();
  const [generatedSections, setGeneratedSections] = useState<GeneratedSection[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<Record<string, any>>({});
  const [showDataCollection, setShowDataCollection] = useState(false);
  const [currentJourneyId, setCurrentJourneyId] = useState<string | null>(null);

  // Initialize user data from unified data service
  useEffect(() => {
    const loadUserData = async () => {
      if (!session?.user?.email) return;
      
      console.log('[ProgressiveSectionManager] Loading user data for:', session.user.email);
      
      // Get user profile or create if doesn't exist
      let profile = await unifiedDataService.getUserProfile(session.user.email);
      
      if (!profile) {
        // Create a new user profile
        console.log('[ProgressiveSectionManager] Creating new user profile for:', session.user.email);
        const newProfile = await unifiedDataService.saveUserProfile(session.user.email, {
          email: session.user.email,
          firstName: session.user.name?.split(' ')[0] || '',
          lastName: session.user.name?.split(' ').slice(1).join(' ') || ''
        });
        profile = newProfile;
      }
      
      if (profile) {
        // Get all section data
        const sectionDataList = await unifiedDataService.getAllSectionData(profile.id);
        
        // Merge all section data into userData
        const mergedData: Record<string, any> = {
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          userId: profile.id
        };
        
        sectionDataList.forEach(sectionData => {
          Object.assign(mergedData, sectionData.data);
        });
        
        setUserData(mergedData);
        console.log('[ProgressiveSectionManager] Loaded user data:', mergedData);
        
        // Get or create journey
        const journeys = await unifiedDataService.getJourneysByUser(profile.id);
        if (journeys.length > 0) {
          // Use the most recent journey
          setCurrentJourneyId(journeys[0].id);
        } else {
          // Create a new journey
          const journey = await unifiedDataService.createJourney(
            profile.id,
            `Learning Journey - ${new Date().toLocaleDateString()}`
          );
          if (journey) {
            setCurrentJourneyId(journey.id);
          }
        }
      }
    };
    
    loadUserData();
  }, [session]);

  // Load previously generated sections
  useEffect(() => {
    const loadGeneratedSections = async () => {
      if (!session?.user?.email || !userData.userId) return;
      
      const generatedContent = await unifiedDataService.getGeneratedContent(userData.userId);
      
      const sections: GeneratedSection[] = generatedContent.map(content => ({
        id: content.id,
        sectionId: content.sectionType,
        content: content.response,
        generatedAt: new Date(content.createdAt)
      }));
      
      setGeneratedSections(sections);
      console.log('[ProgressiveSectionManager] Loaded generated sections:', sections.length);
    };
    
    loadGeneratedSections();
  }, [session, userData.userId]);

  // Handle section selection
  const handleSectionSelect = useCallback(async (sectionId: string) => {
    console.log('[ProgressiveSectionManager] Section selected:', sectionId);
    setActiveSectionId(sectionId);
    setError(null);
    
    // Check if section already generated
    const existingSection = generatedSections.find(s => s.sectionId === sectionId);
    if (existingSection) {
      console.log('[ProgressiveSectionManager] Section already generated, scrolling to it');
      smoothScrollToElement(`section-${sectionId}`, -100);
      return;
    }
    
    // Check if section is interactive
    const schema = SECTION_SCHEMAS[sectionId];
    if (schema?.isInteractive) {
      console.log('[ProgressiveSectionManager] Section is interactive, adding without generation');
      // For interactive sections, add them without pre-generation
      const interactiveSection: GeneratedSection = {
        id: crypto.randomUUID(),
        sectionId,
        content: null, // No pre-generated content for interactive sections
        generatedAt: new Date()
      };
      setGeneratedSections(prev => [...prev, interactiveSection]);
      
      // Scroll to the interactive section
      setTimeout(() => {
        smoothScrollToElement(`section-${sectionId}`, -100);
      }, 100);
      return;
    }
    
    // Check if we have required data
    const missingData = getMissingData(sectionId, userData);
    if (missingData.length > 0) {
      console.log('[ProgressiveSectionManager] Missing data:', missingData);
      setShowDataCollection(true);
      return;
    }
    
    // Generate the section
    await generateSection(sectionId);
  }, [generatedSections, userData]);

  // Handle data collection completion
  const handleDataCollected = useCallback(async (collectedData: Record<string, any>) => {
    console.log('[ProgressiveSectionManager] Data collected:', collectedData);
    
    // Update user data FIRST with collected data before mapping
    const mergedData = { ...userData, ...collectedData };
    
    // Map collected data to standard field names
    const mappedData = fieldMapper.mapQuizToAI(mergedData);
    console.log('[ProgressiveSectionManager] Mapped data after collection:', mappedData);
    
    // Update state with the mapped data
    setUserData(mappedData);
    
    // Save to unified data service
    if (session?.user?.email && userData.userId) {
      // Save the mapped data
      await unifiedDataService.saveUserProfile(session.user.email, mappedData);
      
      // Save each piece of data as section data
      for (const [key, value] of Object.entries(mappedData)) {
        await unifiedDataService.saveSectionData(
          userData.userId,
          `data-${key}`,
          { [key]: value }
        );
      }
    }
    
    // Hide data collection form
    setShowDataCollection(false);
    
    // Generate the section with new data
    if (activeSectionId) {
      await generateSection(activeSectionId);
    }
  }, [userData, session, activeSectionId]);

  // Generate a section using AI
  const generateSection = async (sectionId: string) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log('[ProgressiveSectionManager] Generating section:', sectionId);
      
      const schema = SECTION_SCHEMAS[sectionId];
      if (!schema) {
        throw new Error(`Unknown section: ${sectionId}`);
      }
      
      // Map quiz data to AI expected field names
      const mappedUserData = fieldMapper.mapQuizToAI(userData);
      console.log('[ProgressiveSectionManager] Mapped user data:', mappedUserData);
      
      // Make API call to generate content
      const response = await fetch('/api/ai/chat-tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: `Generate content for ${schema.name}`,
          sectionId,
          sectionSchema: schema,
          userData: mappedUserData,
          userContext: {
            email: session?.user?.email || userData.email || '',
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            userId: userData.userId || session?.user?.id || ''
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate content: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[ProgressiveSectionManager] Generated content:', data);
      
      // Create new section
      const newSection: GeneratedSection = {
        id: crypto.randomUUID(),
        sectionId,
        content: data.response || data,
        generatedAt: new Date()
      };
      
      // Add to generated sections
      setGeneratedSections(prev => [...prev, newSection]);
      
      // Save to unified data service
      if (userData.userId) {
        const savedContent = await unifiedDataService.saveGeneratedContent(
          userData.userId,
          sectionId,
          `Generate content for ${schema.name}`,
          newSection.content,
          schema
        );
        
        // Add to journey
        if (currentJourneyId && savedContent) {
          await unifiedDataService.addSectionToJourney(currentJourneyId, savedContent.id);
        }
      }
      
      // Notify parent component
      if (onSectionGenerated) {
        onSectionGenerated(newSection);
      }
      
      // Scroll to new section
      setTimeout(() => {
        smoothScrollToElement(`section-${sectionId}`, -100);
      }, 100);
      
    } catch (err) {
      console.error('[ProgressiveSectionManager] Error generating section:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  // Available sections for selection
  const availableSections = Object.entries(SECTION_SCHEMAS).map(([id, schema]) => ({
    id,
    name: schema.name,
    description: schema.description,
    isGenerated: generatedSections.some(s => s.sectionId === id),
    hasRequiredData: hasRequiredData(id, userData)
  }));

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Section Selector */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-timeback-primary">
        <h2 className="text-3xl font-bold text-timeback-primary mb-6 font-cal">
          Build Your Personalized Learning Journey
        </h2>
        <p className="text-lg text-timeback-primary mb-8 font-cal">
          Click on any section below to generate personalized content for your child&apos;s education.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableSections.map(section => (
            <button
              key={section.id}
              onClick={() => handleSectionSelect(section.id)}
              disabled={isGenerating}
              className={`
                p-6 rounded-xl border-2 transition-all duration-300 text-left
                ${section.isGenerated 
                  ? 'bg-green-50 border-green-500 hover:shadow-lg' 
                  : 'bg-white border-timeback-primary hover:bg-timeback-bg/10 hover:shadow-lg'
                }
                ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-timeback-primary mb-2 font-cal">
                    {section.name}
                  </h3>
                  <p className="text-sm text-timeback-primary font-cal">
                    {section.description}
                  </p>
                </div>
                {section.isGenerated && (
                  <span className="ml-4 text-green-600 text-2xl">✓</span>
                )}
              </div>
              {!section.hasRequiredData && !section.isGenerated && (
                <p className="text-xs text-timeback-primary/60 mt-2 font-cal">
                  Requires additional information
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Data Collection Form */}
      {showDataCollection && activeSectionId && (
        <ProgressiveDataCollection
          sectionId={activeSectionId}
          currentData={userData}
          onDataCollected={handleDataCollected}
          onCancel={() => {
            setShowDataCollection(false);
            setActiveSectionId(null);
          }}
        />
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-timeback-primary">
          <div className="flex items-center justify-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-timeback-primary"></div>
            <p className="text-lg text-timeback-primary font-cal">
              Generating personalized content...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 rounded-2xl shadow-2xl p-8 border-2 border-red-500">
          <h3 className="text-xl font-bold text-red-700 mb-2 font-cal">Error</h3>
          <p className="text-red-600 font-cal">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl font-cal hover:bg-red-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Generated Sections */}
      <div className="space-y-8">
        {generatedSections.map(section => {
          const schema = SECTION_SCHEMAS[section.sectionId];
          if (!schema) return null;
          
          // Handle interactive sections differently
          if (schema.isInteractive && section.sectionId === 'custom-question') {
            // Lazy load the CustomQuestionSection component
            const CustomQuestionSection = React.lazy(() => import('./personalized/CustomQuestionSection'));
            
            return (
              <div key={section.id} id={`section-${section.sectionId}`}>
                <React.Suspense fallback={
                  <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border-2 border-timeback-primary shadow-2xl">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-timeback-primary mx-auto"></div>
                  </div>
                }>
                  <CustomQuestionSection
                    interests={userData.interests || []}
                    gradeLevel={userData.gradeLevel || 'high school'}
                  />
                </React.Suspense>
              </div>
            );
          }
          
          return (
            <div key={section.id} id={`section-${section.sectionId}`}>
              <AIContentRenderer
                sectionId={section.sectionId}
                schema={schema}
                content={section.content}
              />
              <FollowUpQuestions
                sectionId={section.sectionId}
                sectionContent={section.content}
                userContext={userData}
                onQuestionClick={async (question) => {
                  // Handle follow-up question by generating new content
                  console.log('[ProgressiveSectionManager] Follow-up question clicked:', question);
                  // TODO: Implement iterative content generation
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Journey Summary */}
      {generatedSections.length > 0 && (
        <div className="bg-timeback-bg/20 rounded-2xl shadow-2xl p-8 border-2 border-timeback-primary">
          <h3 className="text-2xl font-bold text-timeback-primary mb-4 font-cal">
            Your Learning Journey So Far
          </h3>
          <p className="text-lg text-timeback-primary mb-4 font-cal">
                          You&apos;ve explored {generatedSections.length} personalized sections:
          </p>
          <ul className="space-y-2">
            {generatedSections.map(section => {
              const schema = SECTION_SCHEMAS[section.sectionId];
              return (
                <li key={section.id} className="flex items-center text-timeback-primary font-cal">
                  <span className="text-green-600 mr-2">✓</span>
                  {schema?.name || section.sectionId}
                  <span className="text-sm text-timeback-primary/60 ml-2">
                    ({new Date(section.generatedAt).toLocaleDateString()})
                  </span>
                </li>
              );
            })}
          </ul>
          
          {currentJourneyId && (
            <div className="mt-6 pt-6 border-t border-timeback-primary/20">
              <p className="text-timeback-primary font-cal mb-3">
                Share your journey with friends and family:
              </p>
              <button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/journey/share', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ journeyId: currentJourneyId })
                    });
                    
                    if (response.ok) {
                      const data = await response.json();
                      // Copy to clipboard
                      navigator.clipboard.writeText(data.shareUrl);
                      alert('Share link copied to clipboard!');
                    }
                  } catch (error) {
                    console.error('Error creating share link:', error);
                  }
                }}
                className="px-6 py-3 bg-timeback-primary text-white rounded-xl font-bold hover:bg-timeback-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl font-cal"
              >
                Get Shareable Link
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}