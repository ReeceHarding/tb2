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
        <div className="text-center">
          <div className="w-16 h-16 bg-timeback-primary rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="font-cal text-timeback-primary text-xl">Loading personalized journey...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !journeyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-timeback-bg to-white flex items-center justify-center">
        <div className="text-center p-8 font-cal">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-timeback-primary p-12 max-w-md mx-auto">
            <div className="mb-8">
              <div className="w-20 h-20 bg-timeback-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-2xl font-cal">!</span>
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
              Create Your Own Journey →
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
        <div className="bg-timeback-primary text-white py-4">
          <div className="container mx-auto px-4 text-center">
            <p className="font-cal text-lg">
              You&apos;re viewing {journeyData.parentName}&apos;s personalized TimeBack journey
            </p>
            <p className="font-cal text-sm mt-1 opacity-90">
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
        <div className="py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-timeback-primary p-12">
              <h2 className="font-cal text-3xl text-timeback-primary mb-6">
                Create Your Own Personalized Journey
              </h2>
              <p className="font-cal text-timeback-primary text-lg mb-8 max-w-2xl mx-auto">
                See how TimeBack can transform your child&apos;s education with a personalized learning experience tailored to their interests and needs.
              </p>
              <a 
                href="/quiz" 
                className="bg-timeback-primary text-white px-12 py-5 rounded-xl font-bold text-xl hover:bg-opacity-90 transition-all duration-200 shadow-2xl hover:shadow-2xl transform hover:scale-105 font-cal inline-block"
              >
                Start Your Journey →
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}