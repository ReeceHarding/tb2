'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { DynamicOnboardingProvider, useDynamicOnboarding } from '@/components/DynamicOnboardingContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowRight } from 'lucide-react';

// Import adapter components for dynamic data collection
import SchoolSearchAdapter from '@/components/dynamic-onboarding/SchoolSearchAdapter';
import GradeSelectionAdapter from '@/components/dynamic-onboarding/GradeSelectionAdapter';
import InterestsAdapter from '@/components/dynamic-onboarding/InterestsAdapter';

// Import personalized components
import SchoolReportCard from '@/components/personalized/SchoolReportCard';
import PersonalizedSubjectExamples from '@/components/personalized/PersonalizedSubjectExamples';
import ClosestSchools from '@/components/personalized/ClosestSchools';
import AfternoonActivities from '@/components/personalized/AfternoonActivities';

function DynamicAIContent() {
  const { data: session, status } = useSession();
  const { userData, updateUserData, hasRequiredData, markSectionViewed } = useDynamicOnboarding();
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isCollectingData, setIsCollectingData] = useState(false);
  const [dataToCollect, setDataToCollect] = useState<string | null>(null);

  useEffect(() => {
    console.log('[DynamicAI] Current user data:', userData);
    console.log('[DynamicAI] Auth status:', status, 'Session:', session?.user?.email);
  }, [userData, status, session]);

  // Landing screen before auth
  const LandingScreen = () => (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-timeback-bg to-white flex flex-col">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-8 lg:py-16 flex-1 overflow-y-auto">
        <div className="h-full flex items-center justify-center">
          <div className="w-full">
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-5xl mx-auto px-4 relative font-cal">
              <div className="absolute inset-0 -z-10 opacity-5">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-timeback-bg rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-timeback-bg rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-timeback-bg rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
              </div>
              <div className="mb-16 space-y-8">
                <div className="inline-flex items-center px-4 py-2 bg-timeback-bg border border-timeback-primary rounded-full mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-timeback-primary mr-2"></span>
                  <span className="text-sm font-medium text-timeback-primary font-cal">AI-Powered Educational Innovation</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight font-cal">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-timeback-primary to-timeback-primary font-cal">The World&apos;s First</span>
                  <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-timeback-primary to-timeback-primary font-cal">Self-Tailoring Website</span>
                </h1>
                <div className="space-y-4 max-w-3xl mx-auto">
                  <p className="text-xl sm:text-2xl text-timeback-primary font-medium leading-relaxed font-cal">Experience education that adapts to you</p>
                  <p className="text-lg sm:text-xl text-timeback-primary leading-relaxed font-cal">Just like TimeBack creates personalized learning questions tailored to each child&apos;s interests and level, we&apos;ll generate a website experience customized specifically for you.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mt-10">
                  <div className="text-center font-cal">
                    <div className="text-3xl font-bold text-timeback-primary font-cal">6</div>
                    <div className="text-sm text-timeback-primary font-cal">Quick Questions</div>
                  </div>
                  <div className="hidden sm:block w-px h-12 bg-timeback-bg"></div>
                  <div className="text-center font-cal">
                    <div className="text-3xl font-bold text-timeback-primary font-cal">100%</div>
                    <div className="text-sm text-timeback-primary font-cal">Personalized</div>
                  </div>
                  <div className="hidden sm:block w-px h-12 bg-timeback-bg"></div>
                  <div className="text-center font-cal">
                    <div className="text-3xl font-bold text-timeback-primary font-cal">30s</div>
                    <div className="text-sm text-timeback-primary font-cal">To Complete</div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowAuthScreen(true)}
                  className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-semibold bg-timeback-primary hover:bg-timeback-primary text-white rounded-xl shadow-2xl hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-timeback-bg font-cal"
                >
                  <span className="mr-2">Let&apos;s Get Started</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Auth screen
  const AuthScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-timeback-bg to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-timeback-primary">
        <h2 className="text-2xl font-bold text-timeback-primary mb-4 font-cal">Sign In to Continue</h2>
        <p className="text-timeback-primary mb-6 font-cal">
          This experience uses AI to generate personalized content. To protect against malicious actors and provide you with the best experience, please sign in with Google.
        </p>
        <button
          onClick={() => signIn('google')}
          className="w-full bg-timeback-primary text-white px-6 py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl font-cal flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>
        <button
          onClick={() => setShowAuthScreen(false)}
          className="w-full mt-3 text-timeback-primary font-cal hover:underline"
        >
          Go back
        </button>
      </div>
    </div>
  );

  // Main navigation after auth
  const MainNavigation = () => {
    const sections = [
      { 
        id: 'what-is-timeback',
        title: 'What is TimeBack?',
        requiredData: []
      },
      {
        id: 'how-it-works',
        title: 'How does it work?',
        requiredData: []
      },
      {
        id: 'show-data',
        title: 'Show me your data',
        requiredData: ['school', 'grade']
      },
      {
        id: 'example-question',
        title: 'Show me an example question tailored to my kid',
        requiredData: ['interests', 'grade']
      },
      {
        id: 'find-school',
        title: 'Find a school near me',
        requiredData: ['school']
      },
      {
        id: 'extra-hours',
        title: 'What will my kid do with the extra 6 hours they gain in their day?',
        requiredData: ['interests']
      }
    ];

    const handleSectionClick = (sectionId: string, requiredData: string[]) => {
      console.log('[DynamicAI] Section clicked:', sectionId, 'Required data:', requiredData);
      
      // Check if we have all required data
      if (!hasRequiredData(requiredData)) {
        console.log('[DynamicAI] Missing required data, starting collection');
        setActiveSection(sectionId);
        
        // Determine what data to collect first
        for (const req of requiredData) {
          if (!hasRequiredData([req])) {
            setDataToCollect(req);
            setIsCollectingData(true);
            break;
          }
        }
      } else {
        console.log('[DynamicAI] Has all required data, showing section');
        setActiveSection(sectionId);
        markSectionViewed(sectionId);
      }
    };

    return (
      <section className="max-w-7xl mx-auto py-20 lg:py-32 px-6 lg:px-12">
        <div className="text-center mb-16 font-cal">
          <div className="inline-flex items-center gap-2 backdrop-blur-sm bg-white/20 border border-timeback-primary rounded-full px-6 py-3 mb-8">
            <div className="w-3 h-3 bg-timeback-primary rounded-full animate-pulse"></div>
            <span className="text-timeback-primary font-bold text-sm font-cal">PERSONALIZED FOR YOU</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold text-timeback-primary mb-8 font-cal">Where do you want to start?</h2>
          <p className="text-2xl text-timeback-primary max-w-4xl mx-auto font-cal leading-relaxed mb-4">
            Click each section below to explore how TimeBack creates personalized learning experiences for your child
          </p>
          {userData.grade && userData.kidsInterests && userData.kidsInterests.length > 0 && (
            <p className="text-lg text-timeback-primary opacity-75 max-w-3xl mx-auto font-cal">
              Based on your {userData.grade} student&apos;s interests in {userData.kidsInterests.join(', ')}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => handleSectionClick(section.id, section.requiredData)}
              className="backdrop-blur-md bg-white/10 border-2 border-timeback-primary rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <h3 className="text-lg font-bold text-timeback-primary font-cal leading-tight">{section.title}</h3>
            </button>
          ))}
        </div>
        <div className="mt-16">
          <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
            <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border-2 border-timeback-primary mb-8 shadow-2xl">
              <h2 className="text-3xl font-bold text-timeback-primary font-cal mb-4">Have a Specific Question?</h2>
              <p className="text-lg text-timeback-primary font-cal mb-6">Ask anything about TimeBack and get a personalized answer based on your child&apos;s needs.</p>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); /* TODO: Implement chat */ }}>
                <input 
                  placeholder="Ask me anything about TimeBack..." 
                  className="w-full px-6 py-4 bg-white/50 border-2 border-timeback-primary rounded-xl text-timeback-primary placeholder-timeback-primary/50 focus:ring-2 focus:ring-timeback-primary focus:border-transparent outline-none font-cal text-lg shadow-lg backdrop-blur-sm" 
                  type="text" 
                />
                <button 
                  type="submit" 
                  className="w-full bg-timeback-primary text-white px-6 py-4 rounded-xl font-bold hover:bg-timeback-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl font-cal text-lg"
                >
                  Get My Personalized Answer
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Data collection modal
  const DataCollectionModal = () => {
    if (!isCollectingData || !dataToCollect) return null;

    const handleDataCollected = () => {
      console.log('[DynamicAI] Data collected:', dataToCollect);
      setIsCollectingData(false);
      setDataToCollect(null);
      
      // Check if we need more data for the active section
      if (activeSection) {
        const section = sections.find(s => s.id === activeSection);
        if (section) {
          for (const req of section.requiredData) {
            if (!hasRequiredData([req])) {
              setDataToCollect(req);
              setIsCollectingData(true);
              return;
            }
          }
        }
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {dataToCollect === 'school' && (
              <SchoolSearchAdapter 
                onNext={handleDataCollected}
                onPrev={() => {
                  setIsCollectingData(false);
                  setDataToCollect(null);
                }}
              />
            )}
            {dataToCollect === 'grade' && (
              <GradeSelectionAdapter
                onNext={handleDataCollected}
                onPrev={() => {
                  setIsCollectingData(false);
                  setDataToCollect(null);
                }}
              />
            )}
            {dataToCollect === 'interests' && (
              <InterestsAdapter
                onNext={handleDataCollected}
                onPrev={() => {
                  setIsCollectingData(false);
                  setDataToCollect(null);
                }}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  // Section content display
  const SectionContent = () => {
    if (!activeSection) return null;

    const renderSectionContent = () => {
      switch (activeSection) {
        case 'what-is-timeback':
          return (
            <div className="prose prose-lg mx-auto text-timeback-primary">
              <h2 className="font-cal text-timeback-primary">What is TimeBack?</h2>
              <p className="font-cal">TimeBack is a revolutionary AI-powered learning platform that helps students achieve 99th percentile academic results in just 2 hours per day.</p>
              <p className="font-cal">Our proven system combines:</p>
              <ul className="font-cal">
                <li>Personalized AI tutoring that adapts to each student</li>
                <li>Mastery-based progression ensuring deep understanding</li>
                <li>Engaging content tailored to student interests</li>
                <li>Real-time progress tracking and analytics</li>
              </ul>
            </div>
          );
        
        case 'how-it-works':
          return (
            <div className="prose prose-lg mx-auto text-timeback-primary">
              <h2 className="font-cal text-timeback-primary">How TimeBack Works</h2>
              <p className="font-cal">Our revolutionary approach includes:</p>
              <ol className="font-cal">
                <li><strong>AI-Powered Personalization:</strong> Every lesson adapts to your child&apos;s learning style and pace</li>
                <li><strong>18-Minute Focused Sessions:</strong> Optimized for maximum retention and engagement</li>
                <li><strong>Mastery Learning:</strong> Students progress only after demonstrating true understanding</li>
                <li><strong>Interest-Based Content:</strong> Math problems about soccer for sports fans, science through art for creative minds</li>
                <li><strong>Real-Time Support:</strong> AI tutors provide instant feedback and alternative explanations</li>
              </ol>
            </div>
          );
        
        case 'show-data':
          return <SchoolReportCard schoolData={userData.school} onLearnMore={() => {}} />;
        
        case 'example-question':
          return <PersonalizedSubjectExamples interests={userData.kidsInterests || []} onLearnMore={() => {}} />;
        
        case 'find-school':
          return <ClosestSchools quizData={{ 
            userType: userData.userType || 'parents',
            parentSubType: userData.parentSubType,
            selectedSchools: userData.school ? [userData.school] : [],
            kidsInterests: userData.kidsInterests || []
          } as any} />;
        
        case 'extra-hours':
          return <AfternoonActivities interests={userData.kidsInterests || []} onLearnMore={() => {}} />;
        
        default:
          return null;
      }
    };

    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <button
          onClick={() => setActiveSection(null)}
          className="mb-6 text-timeback-primary hover:underline font-cal"
        >
          ← Back to sections
        </button>
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-timeback-primary">
          {renderSectionContent()}
        </div>
      </div>
    );
  };

  // Define sections data
  const sections = [
    { 
      id: 'what-is-timeback',
      title: 'What is TimeBack?',
      requiredData: []
    },
    {
      id: 'how-it-works',
      title: 'How does it work?',
      requiredData: []
    },
    {
      id: 'show-data',
      title: 'Show me your data',
      requiredData: ['school', 'grade']
    },
    {
      id: 'example-question',
      title: 'Show me an example question tailored to my kid',
      requiredData: ['interests', 'grade']
    },
    {
      id: 'find-school',
      title: 'Find a school near me',
      requiredData: ['school']
    },
    {
      id: 'extra-hours',
      title: 'What will my kid do with the extra 6 hours they gain in their day?',
      requiredData: ['interests']
    }
  ];

  // Main render logic
  if (!userData.isAuthenticated && !showAuthScreen) {
    return <LandingScreen />;
  }

  if (showAuthScreen && !userData.isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-timeback-bg to-white">
        {!activeSection && <MainNavigation />}
        {activeSection && <SectionContent />}
        <DataCollectionModal />
      </main>
      <Footer />
    </>
  );
}

export default function DynamicAIPage() {
  return (
    <DynamicOnboardingProvider>
      <DynamicAIContent />
    </DynamicOnboardingProvider>
  );
}