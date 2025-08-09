'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AIContentRenderer from '@/components/AIContentRenderer';
import { supabaseService } from '@/libs/supabase-service';
import { SECTION_SCHEMAS } from '@/libs/section-schemas';

interface GeneratedSection {
  id: string;
  sectionType: string;
  response: any;
  createdAt: Date;
}

export default function SharedJourneyPage() {
  const params = useParams();
  const shareId = params.shareId as string;
  
  const [journey, setJourney] = useState<any>(null);
  const [sections, setSections] = useState<GeneratedSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadJourney = async () => {
      if (!shareId) return;
      
      try {
        console.log('[SharedJourney] Loading journey:', shareId);
        
        // Get journey by share URL
        const journeyData = await supabaseService.getPublicJourney(shareId);
        
        if (!journeyData) {
          setError('Journey not found or is not public');
          return;
        }
        
        setJourney(journeyData);
        
        // Load content for all sections
        if (journeyData.sections && journeyData.sections.length > 0) {
          // Get all generated content for this journey
          const contentList = await supabaseService.getGeneratedContent(journeyData.userId);
          
          // Filter to only the sections in this journey
          const journeySections = contentList
            .filter(content => journeyData.sections.includes(content.id))
            .sort((a, b) => journeyData.sections.indexOf(a.id) - journeyData.sections.indexOf(b.id));
          
          setSections(journeySections);
        }
        
      } catch (err) {
        console.error('[SharedJourney] Error loading journey:', err);
        setError('Failed to load journey');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadJourney();
  }, [shareId]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-timeback-bg to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-timeback-primary border-t-transparent"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-timeback-bg to-white flex items-center justify-center">
        <div className="bg-red-50 rounded-2xl shadow-2xl p-8 border-2 border-red-500 max-w-md">
          <h1 className="text-2xl font-bold text-red-700 mb-2 font-cal">Error</h1>
          <p className="text-red-600 font-cal">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-timeback-bg to-white">
        <section className="max-w-7xl mx-auto py-20 lg:py-32 px-6 lg:px-12">
          {/* Journey Header */}
          <div className="text-center mb-16 font-cal">
            <div className="inline-flex items-center gap-2 backdrop-blur-sm bg-white/20 border border-timeback-primary rounded-full px-6 py-3 mb-8">
              <div className="w-3 h-3 bg-timeback-primary rounded-full animate-pulse"></div>
              <span className="text-timeback-primary font-bold text-sm font-cal">SHARED JOURNEY</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-timeback-primary mb-8 font-cal">
              {journey?.title || 'Learning Journey'}
            </h1>
            
            <p className="text-lg text-timeback-primary opacity-75 font-cal">
              Created on {new Date(journey?.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          {/* Journey Content */}
          <div className="space-y-12">
            {sections.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-timeback-primary font-cal">
                  No content in this journey yet.
                </p>
              </div>
            ) : (
              sections.map((section, index) => {
                const schema = SECTION_SCHEMAS[section.sectionType];
                if (!schema) return null;
                
                return (
                  <div key={section.id} className="relative">
                    {/* Section Number */}
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center gap-2 backdrop-blur-sm bg-white/20 border border-timeback-primary rounded-full px-6 py-3">
                        <span className="text-timeback-primary font-bold text-sm font-cal">
                          SECTION {index + 1}
                        </span>
                      </div>
                    </div>
                    
                    {/* Section Content */}
                    <AIContentRenderer
                      sectionId={section.sectionType}
                      schema={schema}
                      content={section.response}
                    />
                  </div>
                );
              })
            )}
          </div>
          
          {/* Call to Action */}
          <div className="mt-20 text-center">
            <div className="bg-timeback-bg/20 rounded-2xl shadow-2xl p-8 border-2 border-timeback-primary max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-timeback-primary mb-4 font-cal">
                Want to Create Your Own Journey?
              </h3>
              <p className="text-lg text-timeback-primary mb-6 font-cal">
                Join TimeBack to build a personalized learning experience for your child.
              </p>
              <a
                href="/auth"
                className="inline-block px-8 py-4 bg-timeback-primary text-white rounded-xl font-bold hover:bg-timeback-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl font-cal"
              >
                Get Started
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}