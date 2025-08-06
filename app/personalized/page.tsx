'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { QuizData } from '@/types/quiz';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
import { smoothScrollToElement } from '@/lib/utils';
import '../ui-animations.css';

// Component imports for content display
import dynamic from 'next/dynamic';
const AfternoonActivities = dynamic(() => import('@/components/personalized/AfternoonActivities'));
const PersonalizedSubjectExamples = dynamic(() => import('@/components/personalized/PersonalizedSubjectExamples'));
const ClosestSchools = dynamic(() => import('@/components/personalized/ClosestSchools'));
const CustomQuestionSection = dynamic(() => import('@/components/personalized/CustomQuestionSection'));
const SchoolReportCard = dynamic(() => import('@/components/personalized/SchoolReportCard'));

export default function PersonalizedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State for user data
  const [userData, setUserData] = useState<Partial<QuizData>>({
    selectedSchools: [],
    kidsInterests: [],
    userType: 'parents',
    parentSubType: 'timeback-school'
  });
  
  // State for UI - simplified
  const [viewedComponents, setViewedComponents] = useState<string[]>([]);

  // Check if user is authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      console.log('[PersonalizedPage] User not authenticated, redirecting to auth');
      router.push('/auth');
    }
  }, [status, router]);

  // Load existing user data
  useEffect(() => {
    const loadExistingData = async () => {
      if (status === 'loading') return;
      
      const timestamp = new Date().toISOString();
      console.log(`[PersonalizedPage] ${timestamp} Loading existing user data`);
      
      // Load from localStorage
      const savedSchool = localStorage.getItem('timebackUserSchool');
      const savedGrade = localStorage.getItem('timebackUserGrade');
      const savedInterests = localStorage.getItem('timebackUserInterests');
      
      let updatedData: Partial<QuizData> = {
        selectedSchools: [],
        kidsInterests: [],
        userType: 'parents',
        parentSubType: 'timeback-school'
      };
      
      if (savedSchool) {
        try {
          updatedData.selectedSchools = JSON.parse(savedSchool);
        } catch (e) {
          console.error('Failed to parse saved school data:', e);
        }
      }
      
      if (savedGrade) {
        if (updatedData.selectedSchools && updatedData.selectedSchools.length > 0) {
          updatedData.selectedSchools[0].level = savedGrade;
        }
      }
      
      if (savedInterests) {
        try {
          updatedData.kidsInterests = JSON.parse(savedInterests);
        } catch (e) {
          console.error('Failed to parse saved interests:', e);
        }
      }
      
      // Load from database if authenticated
      if (status === 'authenticated' && session?.user?.email) {
        try {
          const response = await fetch('/api/quiz/save', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data?.quizData) {
              const dbData = result.data.quizData;
              if (dbData.selectedSchools?.length > 0) {
                updatedData.selectedSchools = dbData.selectedSchools;
              }
              if (dbData.kidsInterests?.length > 0) {
                updatedData.kidsInterests = dbData.kidsInterests;
              }
            }
          }
        } catch (error) {
          console.error('Failed to load data from database:', error);
        }
      }
      
      setUserData(updatedData);
      console.log(`[PersonalizedPage] ${timestamp} Loaded user data:`, updatedData);
    };
    
    loadExistingData();
  }, [status, session]);

  // Simplified section selection - just adds components to the page
  const handleSectionSelect = (sectionId: string) => {
    console.log(`[PersonalizedPage] Section selected: ${sectionId}`);
    
    if (!viewedComponents.includes(sectionId)) {
      const newViewedComponents = [...viewedComponents, sectionId];
      setViewedComponents(newViewedComponents);
      
      setTimeout(() => {
        const componentId = `viewed-component-${sectionId}`;
        smoothScrollToElement(componentId, 100, 'smooth');
      }, 100);
    } else {
      const componentId = `viewed-component-${sectionId}`;
      smoothScrollToElement(componentId, 100, 'smooth');
    }
  };

  // Component renderer for the growing page
  const renderComponent = (sectionId: string) => {
    console.log('[PersonalizedPage] Rendering component for section:', sectionId);
    
    switch (sectionId) {
      case 'what-is-timeback':
        return (
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 font-cal">
              <h2 className="text-4xl lg:text-6xl font-bold text-timeback-primary mb-8 font-cal">
                TimeBack is AI-Powered Education
              </h2>
              <p className="text-2xl text-timeback-primary max-w-5xl mx-auto font-cal leading-relaxed mb-8">
                We use artificial intelligence to eliminate the 6+ hours of wasted time in traditional education, allowing students to complete a full year of learning in just 2 hours per day.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <div className="backdrop-blur-md bg-white/10 border-2 border-timeback-primary rounded-xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-timeback-primary mb-4 font-cal">Traditional School</h3>
                <ul className="space-y-3 text-timeback-primary font-cal">
                  <li className="flex items-center gap-3">
                    <span className="text-red-500">✗</span>
                    6+ hours of wasted time daily
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-red-500">✗</span>
                    One-size-fits-all approach
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-red-500">✗</span>
                    Students fall behind or get bored
                  </li>
                </ul>
              </div>
              <div className="backdrop-blur-md bg-white/10 border-2 border-timeback-primary rounded-xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-timeback-primary mb-4 font-cal">TimeBack</h3>
                <ul className="space-y-3 text-timeback-primary font-cal">
                  <li className="flex items-center gap-3">
                    <span className="text-timeback-primary">✓</span>
                    2 hours of focused learning
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-timeback-primary">✓</span>
                    AI-personalized for each child
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-timeback-primary">✓</span>
                    6+ hours for passion projects
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'how-does-it-work':
        return (
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 font-cal">
              <h2 className="text-4xl lg:text-6xl font-bold text-timeback-primary mb-8 font-cal">
                How TimeBack Works
              </h2>
              <p className="text-2xl text-timeback-primary max-w-5xl mx-auto font-cal leading-relaxed mb-8">
                Our AI system creates a personalized learning experience that adapts to your child&apos;s pace and interests.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="backdrop-blur-md bg-white/10 border-2 border-timeback-primary rounded-xl p-8 shadow-xl text-center">
                <div className="text-4xl font-bold text-timeback-primary mb-4 font-cal">1</div>
                <h3 className="text-xl font-bold text-timeback-primary mb-4 font-cal">AI Assessment</h3>
                <p className="text-timeback-primary font-cal">AI identifies your child&apos;s learning style, pace, and knowledge gaps</p>
              </div>
              <div className="backdrop-blur-md bg-white/10 border-2 border-timeback-primary rounded-xl p-8 shadow-xl text-center">
                <div className="text-4xl font-bold text-timeback-primary mb-4 font-cal">2</div>
                <h3 className="text-xl font-bold text-timeback-primary mb-4 font-cal">Personalized Path</h3>
                <p className="text-timeback-primary font-cal">Creates a custom curriculum that adapts in real-time</p>
              </div>
              <div className="backdrop-blur-md bg-white/10 border-2 border-timeback-primary rounded-xl p-8 shadow-xl text-center">
                <div className="text-4xl font-bold text-timeback-primary mb-4 font-cal">3</div>
                <h3 className="text-xl font-bold text-timeback-primary mb-4 font-cal">Mastery Learning</h3>
                <p className="text-timeback-primary font-cal">Ensures 90%+ understanding before moving forward</p>
              </div>
            </div>
          </div>
        );

      case 'show-data': {
        const school = userData.selectedSchools?.[0];
        return (
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 font-cal">
              <h2 className="text-4xl lg:text-6xl font-bold text-timeback-primary mb-8 font-cal">
                Real Results from Real Students
              </h2>
              <p className="text-2xl text-timeback-primary max-w-5xl mx-auto font-cal leading-relaxed mb-8">
                {school ? `Students at ${school.name} are achieving incredible results` : 'Students across our network are achieving incredible results'}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="backdrop-blur-md bg-white/10 border-2 border-timeback-primary rounded-xl p-8 shadow-xl text-center">
                <div className="text-5xl font-bold text-timeback-primary mb-4 font-cal">2x</div>
                <h3 className="text-xl font-bold text-timeback-primary mb-4 font-cal">Learning Speed</h3>
                <p className="text-timeback-primary font-cal">Students complete curriculum 2x faster than traditional methods</p>
              </div>
              <div className="backdrop-blur-md bg-white/10 border-2 border-timeback-primary rounded-xl p-8 shadow-xl text-center">
                <div className="text-5xl font-bold text-timeback-primary mb-4 font-cal">94%</div>
                <h3 className="text-xl font-bold text-timeback-primary mb-4 font-cal">Mastery Rate</h3>
                <p className="text-timeback-primary font-cal">Of concepts achieved before advancing to next level</p>
              </div>
              <div className="backdrop-blur-md bg-white/10 border-2 border-timeback-primary rounded-xl p-8 shadow-xl text-center">
                <div className="text-5xl font-bold text-timeback-primary mb-4 font-cal">6+</div>
                <h3 className="text-xl font-bold text-timeback-primary mb-4 font-cal">Hours Saved</h3>
                <p className="text-timeback-primary font-cal">Daily time freed up for passion projects and family</p>
              </div>
            </div>
          </div>
        );
      }

      case 'example-question':
        return <PersonalizedSubjectExamples 
          interests={userData.kidsInterests} 
          onLearnMore={() => {}}
        />;

      case 'find-school':
        return <ClosestSchools quizData={userData as QuizData} />;

      case 'extra-hours':
        return <AfternoonActivities 
          interests={userData.kidsInterests}
          onLearnMore={() => {}}
        />;

      default:
        return null;
    }
  };

  // Generate follow-up questions for each component
  const getFollowUpQuestions = (sectionId: string): { id: string; text: string; }[] => {
    const questionMap: Record<string, { id: string; text: string; }[]> = {
      'what-is-timeback': [
        { id: 'how-does-it-work', text: 'How does it work?' },
        { id: 'show-data', text: 'Show me your data' },
        { id: 'find-school', text: 'Find a school near me' }
      ],
      'how-does-it-work': [
        { id: 'show-data', text: 'Show me your data' },
        { id: 'example-question', text: 'Show me an example question' },
        { id: 'extra-hours', text: 'What will my kid do with extra time?' }
      ],
      'show-data': [
        { id: 'example-question', text: 'Show me an example question' },
        { id: 'find-school', text: 'Find a school near me' },
        { id: 'extra-hours', text: 'What about the extra 6 hours?' }
      ],
      'example-question': [
        { id: 'find-school', text: 'Find a school near me' },
        { id: 'extra-hours', text: 'What about the extra 6 hours?' },
        { id: 'how-does-it-work', text: 'How does the AI work?' }
      ],
      'find-school': [
        { id: 'show-data', text: 'Show me school performance data' },
        { id: 'example-question', text: 'Show me an example question' },
        { id: 'extra-hours', text: 'What about the extra 6 hours?' }
      ],
      'extra-hours': [
        { id: 'find-school', text: 'Find a school near me' },
        { id: 'show-data', text: 'Show me your data' },
        { id: 'example-question', text: 'Show me an example question' }
      ]
    };

    return questionMap[sectionId] || [];
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-timeback-bg to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-timeback-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-timeback-bg to-white">
        {/* Initial exploration section */}
        <section className="max-w-7xl mx-auto py-20 lg:py-32 px-6 lg:px-12">
          <div className="text-center mb-16 font-cal">
            <div className="inline-flex items-center gap-2 backdrop-blur-sm bg-white/20 border border-timeback-primary rounded-full px-6 py-3 mb-8">
              <div className="w-3 h-3 bg-timeback-primary rounded-full animate-pulse"></div>
              <span className="text-timeback-primary font-bold text-sm font-cal">PERSONALIZED FOR YOU</span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold text-timeback-primary mb-8 font-cal">
              Where do you want to start?
            </h2>
            <p className="text-2xl text-timeback-primary max-w-4xl mx-auto font-cal leading-relaxed mb-4">
              Click each section below to explore how TimeBack creates personalized learning experiences for your child
            </p>
            {userData.selectedSchools?.[0]?.level && userData.kidsInterests?.length > 0 && (
              <p className="text-lg text-timeback-primary opacity-75 max-w-3xl mx-auto font-cal">
                Based on your {userData.selectedSchools[0].level} student&apos;s interests in{' '}
                {userData.kidsInterests.slice(0, 2).join(' and ')}
              </p>
            )}
          </div>

          {/* Main exploration buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            <button
              onClick={() => handleSectionSelect('what-is-timeback')}
              className="backdrop-blur-md bg-white/10 border-2 border-timeback-primary rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <h3 className="text-lg font-bold text-timeback-primary font-cal leading-tight">
                What is TimeBack?
              </h3>
            </button>
            
            <button
              onClick={() => handleSectionSelect('how-does-it-work')}
              className="backdrop-blur-md bg-white/10 border-2 border-timeback-primary rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <h3 className="text-lg font-bold text-timeback-primary font-cal leading-tight">
                How does it work?
              </h3>
            </button>
            
            <button
              onClick={() => handleSectionSelect('show-data')}
              className="backdrop-blur-md bg-white/10 border-2 border-timeback-primary rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <h3 className="text-lg font-bold text-timeback-primary font-cal leading-tight">
                Show me your data
              </h3>
            </button>
            
            <button
              onClick={() => handleSectionSelect('example-question')}
              className="backdrop-blur-md bg-white/10 border-2 border-timeback-primary rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <h3 className="text-lg font-bold text-timeback-primary font-cal leading-tight">
                Show me an example question tailored to my kid
              </h3>
            </button>
            
            <button
              onClick={() => handleSectionSelect('find-school')}
              className="backdrop-blur-md bg-white/10 border-2 border-timeback-primary rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <h3 className="text-lg font-bold text-timeback-primary font-cal leading-tight">
                Find a school near me
              </h3>
            </button>
            
            <button
              onClick={() => handleSectionSelect('extra-hours')}
              className="backdrop-blur-md bg-white/10 border-2 border-timeback-primary rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <h3 className="text-lg font-bold text-timeback-primary font-cal leading-tight">
                What will my kid do with the extra 6 hours they gain in their day?
              </h3>
            </button>
          </div>
        </section>

        {/* Render viewed components in order with follow-up questions */}
        {viewedComponents.map((componentId, index) => {
          const followUpQuestions = getFollowUpQuestions(componentId);
          
          return (
            <section 
              key={componentId} 
              id={`viewed-component-${componentId}`} 
              className="max-w-7xl mx-auto px-6 lg:px-12 pb-20"
            >
              <div className="mb-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 backdrop-blur-sm bg-white/20 border border-timeback-primary rounded-full px-6 py-3">
                    <div className="w-3 h-3 bg-timeback-primary rounded-full animate-pulse"></div>
                    <span className="text-timeback-primary font-bold text-sm font-cal">
                      SECTION {index + 1}
                    </span>
                  </div>
                </div>
                
                {/* Component content */}
                {renderComponent(componentId)}
                
                {/* Follow-up questions after each component */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-12">
                  {followUpQuestions.map((question: { id: string; text: string; }) => (
                    <button
                      key={question.id}
                      onClick={() => handleSectionSelect(question.id)}
                      className="backdrop-blur-md bg-white/10 border-2 border-timeback-primary rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <h3 className="text-sm font-bold text-timeback-primary font-cal leading-tight">
                        {question.text}
                      </h3>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        {/* CustomQuestionSection at bottom */}
        <section id="questions-section" className="max-w-7xl mx-auto px-6 lg:px-12 pb-20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 backdrop-blur-sm bg-white/20 border border-timeback-primary rounded-full px-6 py-3">
              <div className="w-3 h-3 bg-timeback-primary rounded-full animate-pulse"></div>
              <span className="text-timeback-primary font-bold text-sm font-cal">ASK ANYTHING</span>
            </div>
          </div>
          <CustomQuestionSection 
            quizData={userData as QuizData}
            interests={userData.kidsInterests}
            gradeLevel={userData.selectedSchools?.[0]?.level || 'high school'}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}