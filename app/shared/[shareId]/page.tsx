'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ShareableJourneyResponse } from '@/types/quiz';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PersonalizedResults from '@/components/PersonalizedResults';
import SharedJourneyView from '@/components/personalized/SharedJourneyView';
import '../../../app/globals.css';

export default function SharedJourneyPage() {
  const params = useParams();
  const shareId = params?.shareId as string;
  
  const [journeyData, setJourneyData] = useState<ShareableJourneyResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJourneyData = async () => {
      const timestamp = new Date().toISOString();
      console.log(`[SharedJourneyPage] ${timestamp} Fetching journey data for shareId:`, shareId);
      
      try {
        const response = await fetch(`/api/share/${shareId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load shared journey');
        }
        
        console.log(`[SharedJourneyPage] ${timestamp} Successfully loaded journey data:`, {
          parentName: data.data.parentName,
          sectionsCount: data.data.viewedSections?.length || 0,
          hasGeneratedContent: !!data.data.generatedContent
        });
        
        setJourneyData(data.data);
      } catch (err) {
        console.error(`[SharedJourneyPage] ${timestamp} Error loading journey:`, err);
        setError(err instanceof Error ? err.message : 'Failed to load shared journey');
      } finally {
        setIsLoading(false);
      }
    };

    if (shareId) {
      fetchJourneyData();
    }
  }, [shareId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-timeback-bg to-white flex items-center justify-center">
        <div className="backdrop-blur-md bg-white/30 rounded-3xl shadow-2xl border border-timeback-primary/20 p-12 text-center">
          <div className="relative">
            <div className="w-16 h-16 bg-timeback-primary rounded-full animate-pulse mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 bg-timeback-primary rounded-full animate-ping opacity-30 mx-auto"></div>
          </div>
          <p className="font-cal text-timeback-primary text-xl font-semibold">Loading personalized journey...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !journeyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-timeback-bg to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="backdrop-blur-md bg-white/80 rounded-3xl shadow-2xl border-2 border-timeback-primary p-12 max-w-md mx-auto">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-timeback-bg to-timeback-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-10 h-10 text-timeback-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-timeback-primary mb-4 font-cal">
              Journey Not Found
            </h2>
            <p className="text-timeback-primary mb-8 font-cal">
              {error || 'This shared journey could not be found or may no longer be available.'}
            </p>
            <a 
              href="/" 
              className="bg-timeback-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all duration-200 shadow-2xl hover:shadow-2xl transform hover:scale-105 font-cal inline-block"
            >
              Create Your Own Journey
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-timeback-bg to-white">
        {/* Shared Journey Banner */}
        <div className="bg-gradient-to-r from-timeback-primary to-timeback-primary/90 text-white py-6 shadow-lg">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <p className="font-cal text-lg font-semibold">
                You&apos;re viewing {journeyData.parentName}&apos;s personalized TimeBack journey
              </p>
            </div>
            <p className="font-cal text-sm mt-2 opacity-90">
              This journey has been viewed {journeyData.viewCount} {journeyData.viewCount === 1 ? 'time' : 'times'}
            </p>
          </div>
        </div>

        {/* Hero Section - Personalized Greeting + School Report Card */}
        <PersonalizedResults 
          quizData={journeyData.quizData} 
          preGeneratedContent={journeyData.generatedContent}
          isSharedView={true}
        />
        
        {/* Shared Journey Content - Static view of explored sections */}
        <SharedJourneyView 
          quizData={journeyData.quizData}
          generatedContent={journeyData.generatedContent}
          viewedSections={journeyData.viewedSections}
          parentName={journeyData.parentName}
        />

        {/* Call to Action */}
        <div className="py-16 px-4 bg-gradient-to-b from-transparent to-timeback-bg/20">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="backdrop-blur-md bg-white/80 rounded-3xl shadow-2xl border-2 border-timeback-primary p-12 transform transition-transform hover:scale-[1.02]">
              <div className="w-20 h-20 bg-gradient-to-br from-timeback-bg to-timeback-primary/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <svg className="w-10 h-10 text-timeback-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h2 className="font-cal text-4xl font-bold text-timeback-primary mb-6">
                Create Your Own Personalized Journey
              </h2>
              <p className="font-cal text-timeback-primary text-lg mb-8 max-w-2xl mx-auto">
                See how TimeBack can transform your child&apos;s education with a personalized learning experience tailored to their interests and needs.
              </p>
              <a 
                href="/quiz" 
                className="bg-gradient-to-r from-timeback-primary to-timeback-primary/90 text-white px-12 py-5 rounded-xl font-bold text-xl hover:from-timeback-primary/90 hover:to-timeback-primary transition-all duration-200 shadow-2xl hover:shadow-2xl transform hover:scale-105 font-cal inline-block"
              >
                Start Your Journey
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}