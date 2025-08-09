'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SharedJourneyViewV2 from '@/components/personalized/SharedJourneyViewV2';

interface JourneyData {
  journeyId: string;
  title: string;
  createdAt: Date;
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

export default function SharedJourneyPageV2() {
  const params = useParams();
  const shareId = params?.shareId as string;
  
  const [journeyData, setJourneyData] = useState<JourneyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJourneyData = async () => {
      const timestamp = new Date().toISOString();
      console.log(`[SharedJourneyPageV2] ${timestamp} Fetching journey data for shareId:`, shareId);
      
      try {
        const response = await fetch(`/api/share/journey/${shareId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load shared journey');
        }
        
        console.log(`[SharedJourneyPageV2] ${timestamp} Successfully loaded journey data:`, {
          journeyId: data.data.journeyId,
          sectionsCount: data.data.sections?.length || 0,
          ownerName: data.data.ownerName
        });
        
        setJourneyData(data.data);
      } catch (err) {
        console.error(`[SharedJourneyPageV2] ${timestamp} Error loading journey:`, err);
        setError(err instanceof Error ? err.message : 'Failed to load shared journey');
      } finally {
        setIsLoading(false);
      }
    };

    if (shareId) {
      fetchJourneyData();
    }
  }, [shareId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-timeback-bg to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-timeback-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-timeback-primary font-cal text-lg">Loading journey...</p>
        </div>
      </div>
    );
  }

  if (error || !journeyData) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-timeback-bg to-white">
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <div className="backdrop-blur-md bg-white/10 rounded-2xl border-2 border-timeback-primary p-12 shadow-2xl">
              <h1 className="text-4xl font-bold text-timeback-primary mb-4 font-cal">
                Journey Not Found
              </h1>
              <p className="text-lg text-timeback-primary mb-8 font-cal">
                {error || 'This journey may have been removed or is no longer available.'}
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 bg-timeback-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-timeback-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl font-cal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main>
        <SharedJourneyViewV2
          journeyTitle={journeyData.title}
          ownerName={journeyData.ownerName}
          sections={journeyData.sections}
          userContext={journeyData.userContext}
        />
      </main>
      <Footer />
    </>
  );
}