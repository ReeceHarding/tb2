'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { QuizData } from '@/types/quiz';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
import { smoothScrollToElement } from '@/lib/utils';
import '../ui-animations.css';

// Component imports for data collection
import dynamic from 'next/dynamic';
import { SchoolSearchCollector, GradeCollector, InterestsCollector } from '@/components/personalized/DataCollectionComponents';

// Component imports for content display
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
  
  // State for UI
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isCollectingData, setIsCollectingData] = useState(false);
  const [dataNeeded, setDataNeeded] = useState<string | null>(null);
  const [viewedComponents, setViewedComponents] = useState<string[]>([]);
  
  // Data requirements mapping
  const dataRequirements: Record<string, string[]> = {
    'what-is-timeback': [], // No data required
    'how-does-it-work': [], // No data initially
    'show-data': ['school', 'grade'],
    'example-question': ['interests'],
    'find-school': ['location'],
    'extra-hours': ['interests'],
    'custom-question': ['grade', 'interests']
  };


  // Check if user is authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      console.log('[PersonalizedPage] User not authenticated, redirecting to auth');
      router.push('/auth');
    }
  }, [status, router]);

  // Load any existing user data from localStorage and database
  useEffect(() => {
    const loadExistingData = async () => {
      if (status === 'loading') return;
      
      const timestamp = new Date().toISOString();
      console.log(`[PersonalizedPage] ${timestamp} Loading existing user data`);
      
      // Try to load from localStorage first
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
        // Grade is stored directly as a string
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
      
      // Try to load from database if authenticated
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
              // Merge database data with localStorage data
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

  // Function to check if we have required data for a section
  const hasRequiredData = (requirements: string[]): boolean => {
    for (const req of requirements) {
      switch (req) {
        case 'school':
          if (!userData.selectedSchools || userData.selectedSchools.length === 0) return false;
          break;
        case 'grade':
          if (!userData.selectedSchools?.[0]?.level) return false;
          break;
        case 'interests':
          if (!userData.kidsInterests || userData.kidsInterests.length === 0) return false;
          break;
        case 'location':
          if (!userData.selectedSchools?.[0]?.city && !userData.selectedSchools?.[0]?.state) return false;
          break;
      }
    }
    return true;
  };

  // Handle section selection - now adds to growing page instead of replacing content
  const handleSectionSelect = (sectionId: string) => {
    console.log(`[PersonalizedPage] Section selected: ${sectionId}`);
    
    const requirements = dataRequirements[sectionId] || [];
    
    if (hasRequiredData(requirements)) {
      // We have all required data, add the component to viewed components
      if (!viewedComponents.includes(sectionId)) {
        const newViewedComponents = [...viewedComponents, sectionId];
        setViewedComponents(newViewedComponents);
        
        // Clear any temporary selection state
        setSelectedSection(null);
        setIsCollectingData(false);
        setDataNeeded(null);
        
        // Smooth scroll to the newly added component in the growing page
        const componentId = `viewed-component-${sectionId}`;
        console.log(`[PersonalizedPage] Scrolling to newly added component: ${componentId}`);
        smoothScrollToElement(componentId, 100, 'smooth', () => {
          console.log(`[PersonalizedPage] Smooth scroll completed for new component: ${sectionId}`);
        });
      } else {
        // Component already exists, just scroll to it
        const componentId = `viewed-component-${sectionId}`;
        console.log(`[PersonalizedPage] Component already exists, scrolling to: ${componentId}`);
        smoothScrollToElement(componentId, 100, 'smooth');
      }
    } else {
      // We need to collect data first
      const missingData = requirements.find(req => {
        switch (req) {
          case 'school':
            return !userData.selectedSchools || userData.selectedSchools.length === 0;
          case 'grade':
            return !userData.selectedSchools?.[0]?.level;
          case 'interests':
            return !userData.kidsInterests || userData.kidsInterests.length === 0;
          case 'location':
            return !userData.selectedSchools?.[0]?.city && !userData.selectedSchools?.[0]?.state;
          default:
            return false;
        }
      });
      
      setSelectedSection(sectionId);
      setIsCollectingData(true);
      setDataNeeded(missingData || null);
      
      // Smooth scroll to the data collection section
      smoothScrollToElement('selected-content-section', 100, 'smooth', () => {
        console.log(`[PersonalizedPage] Smooth scroll completed for data collection: ${sectionId}`);
      });
    }
  };

  // Save data to localStorage and database
  const saveUserData = async (dataType: string, data: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[PersonalizedPage] ${timestamp} Saving ${dataType} data:`, data);
    
    // Save to localStorage
    switch (dataType) {
      case 'school':
        localStorage.setItem('timebackUserSchool', JSON.stringify(data));
        setUserData(prev => ({ ...prev, selectedSchools: data }));
        break;
      case 'grade':
        localStorage.setItem('timebackUserGrade', data);
        setUserData(prev => ({
          ...prev,
          selectedSchools: prev.selectedSchools?.map((school, idx) => 
            idx === 0 ? { ...school, level: data } : school
          )
        }));
        break;
      case 'interests':
        localStorage.setItem('timebackUserInterests', JSON.stringify(data));
        setUserData(prev => ({ ...prev, kidsInterests: data }));
              break;
    }
    
    // Save to database if authenticated
    if (status === 'authenticated' && session?.user?.email) {
      try {
        // Prepare the quiz data update based on what was collected
        let quizDataUpdate = { ...userData };
        
        if (dataType === 'school') {
          quizDataUpdate.selectedSchools = data;
        } else if (dataType === 'grade') {
          // For grade, we need to update the existing school data
          if (quizDataUpdate.selectedSchools && quizDataUpdate.selectedSchools.length > 0) {
            quizDataUpdate.selectedSchools[0].level = data;
          }
        } else if (dataType === 'interests') {
          quizDataUpdate.kidsInterests = data;
        }
        
        const response = await fetch('/api/quiz/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quizData: quizDataUpdate,
            partial: true // Indicate this is a partial save
          })
        });
        
        if (!response.ok) {
          console.error('Failed to save to database:', await response.text());
        } else {
          console.log(`[PersonalizedPage] Successfully saved ${dataType} to database`);
        }
      } catch (error) {
        console.error('Error saving to database:', error);
      }
    }
  };

  // Handle data collection completion
  const handleDataCollected = (dataType: string, data: any) => {
    console.log(`[PersonalizedPage] Data collected for ${dataType}:`, data);
    
    saveUserData(dataType, data);
    
    // Check if we now have all required data for the selected section
    if (selectedSection) {
      const requirements = dataRequirements[selectedSection] || [];
      const updatedData = { ...userData };
      
      if (dataType === 'school') updatedData.selectedSchools = data;
      if (dataType === 'grade' && updatedData.selectedSchools?.[0]) {
        updatedData.selectedSchools[0].level = data;
      }
      if (dataType === 'interests') updatedData.kidsInterests = data;
      
      // Check if we have all required data now
      const stillMissing = requirements.find(req => {
        switch (req) {
          case 'school':
            return !updatedData.selectedSchools || updatedData.selectedSchools.length === 0;
          case 'grade':
            return !updatedData.selectedSchools?.[0]?.level;
          case 'interests':
            return !updatedData.kidsInterests || updatedData.kidsInterests.length === 0;
          case 'location':
            return !updatedData.selectedSchools?.[0]?.city && !updatedData.selectedSchools?.[0]?.state;
          default:
            return false;
        }
      });
      
      if (!stillMissing) {
        // We have all data now, add the component to the growing page
        setIsCollectingData(false);
        setDataNeeded(null);
        
        // Add to viewed components
        if (selectedSection && !viewedComponents.includes(selectedSection)) {
          const newViewedComponents = [...viewedComponents, selectedSection];
          setViewedComponents(newViewedComponents);
          
          // Clear the temporary selected section state
          setSelectedSection(null);
          
          // Smooth scroll to the newly added component
          const componentId = `viewed-component-${selectedSection}`;
          console.log(`[PersonalizedPage] Data collection complete, scrolling to new component: ${componentId}`);
          smoothScrollToElement(componentId, 100, 'smooth', () => {
            console.log(`[PersonalizedPage] Scroll completed for new component after data collection: ${selectedSection}`);
          });
        }
      } else {
        // Still need more data
        setDataNeeded(stillMissing);
      }
    }
  };

  // Render the appropriate content based on selected section
  const renderSectionContent = () => {
    if (!selectedSection) return null;
    
    if (isCollectingData && dataNeeded) {
      // Show data collection component
      switch (dataNeeded) {
        case 'school':
        case 'location':
          return (
            <SchoolSearchCollector
              onNext={(schools: any) => handleDataCollected('school', schools)}
              onPrev={() => {
                setSelectedSection(null);
                setIsCollectingData(false);
                setDataNeeded(null);
              }}
            />
          );
        case 'grade':
          return (
            <GradeCollector
              onNext={(grade: string) => handleDataCollected('grade', grade)}
              onPrev={() => {
                setDataNeeded('school');
              }}
            />
          );
        case 'interests':
          return (
            <InterestsCollector
              onNext={(interests: string[]) => handleDataCollected('interests', interests)}
              onPrev={() => {
                setSelectedSection(null);
                setIsCollectingData(false);
                setDataNeeded(null);
              }}
            />
          );
      }
    }
    
        // Show the actual component
    switch (selectedSection) {
      case 'what-is-timeback':
        return (
          <div className="max-w-7xl mx-auto py-20 lg:py-32 px-6 lg:px-12">
            <div className="text-center mb-16 font-cal">
              <div className="inline-flex items-center gap-2 bg-timeback-bg border border-timeback-primary rounded-full px-6 py-3 mb-8">
                <div className="w-3 h-3 bg-timeback-primary rounded-full animate-pulse"></div>
                <span className="text-timeback-primary font-bold text-sm font-cal">WHAT IS TIMEBACK</span>
              </div>
              <h2 className="text-4xl lg:text-6xl font-bold text-timeback-primary mb-8 font-cal">
                TimeBack is AI-Powered Education
              </h2>
              <p className="text-2xl text-timeback-primary max-w-5xl mx-auto font-cal leading-relaxed mb-8">
                We use artificial intelligence to eliminate the 6+ hours of wasted time in traditional education, allowing students to complete a full year of learning in just 2 hours per day.
              </p>
            </div>

            {/* Key Benefits Cards */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="backdrop-blur-md bg-white/10 rounded-2xl border-2 border-timeback-primary shadow-2xl p-8 text-center">
                <div className="w-16 h-16 bg-timeback-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-2xl font-cal">10x</span>
                </div>
                <h3 className="text-xl font-bold text-timeback-primary mb-4 font-cal">10x Faster Learning</h3>
                <p className="text-timeback-primary font-cal">Complete a full year of curriculum in just 2 months with our AI-powered approach</p>
              </div>
              
              <div className="backdrop-blur-md bg-white/10 rounded-2xl border-2 border-timeback-primary shadow-2xl p-8 text-center">
                <div className="w-16 h-16 bg-timeback-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-xl font-cal">✓</span>
                </div>
                <h3 className="text-xl font-bold text-timeback-primary mb-4 font-cal">100% Mastery</h3>
                <p className="text-timeback-primary font-cal">Students must achieve complete understanding before advancing to the next concept</p>
              </div>
              
              <div className="backdrop-blur-md bg-white/10 rounded-2xl border-2 border-timeback-primary shadow-2xl p-8 text-center">
                <div className="w-16 h-16 bg-timeback-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-xl font-cal">🎯</span>
                </div>
                <h3 className="text-xl font-bold text-timeback-primary mb-4 font-cal">Personalized Path</h3>
                <p className="text-timeback-primary font-cal">AI adapts to each student&apos;s pace and learning style for optimal results</p>
              </div>
            </div>

            {/* Follow-up Question Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto mt-16">
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
                onClick={() => handleSectionSelect('whats-the-science')}
                className="backdrop-blur-md bg-white/10 border-2 border-timeback-primary rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <h3 className="text-lg font-bold text-timeback-primary font-cal leading-tight">
                  What&apos;s the science?
                </h3>
              </button>
            </div>
          </div>
        );
      case 'how-does-it-work':
        return (
          <section className="bg-timeback-bg py-20 lg:py-32" aria-labelledby="how-timeback-works-heading" role="region">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
              <header className="text-center mb-20 lg:mb-28 font-cal" style={{opacity: 1, transform: 'none'}}>
                <div className="inline-flex items-center gap-2 bg-white border-2 border-timeback-primary rounded-full px-6 py-3 mb-8">
                  <span className="w-3 h-3 bg-timeback-primary rounded-full animate-pulse"></span>
                  <span className="text-timeback-primary font-bold text-lg font-cal">Learning, Accelerated</span>
                </div>
                <h2 id="how-timeback-works-heading" className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight mb-8 text-timeback-primary font-cal leading-tight">How AI-Powered Personalized Learning Works</h2>
                <p className="max-w-4xl mx-auto text-xl sm:text-2xl lg:text-3xl text-timeback-primary leading-relaxed font-cal font-medium">Our adaptive AI tutoring system helps homeschool children achieve mastery-based learning and complete grade levels in 80 days with just 2 hours of daily study.</p>
              </header>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10" role="list" aria-label="Timeback learning features">
                <article className="bg-white rounded-2xl border-2 border-timeback-primary p-8 shadow-2xl group flex flex-col h-full" role="listitem">
                  <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 bg-timeback-bg rounded-full flex items-center justify-center border-2 border-timeback-primary shadow-2xl">
                      <div className="text-timeback-primary font-cal">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" role="img">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-timeback-primary mb-4 leading-tight font-cal text-center">Step 1: Find Your Starting Point</h3>
                  <div className="flex-grow flex items-center justify-center mb-6">
                    <p className="text-timeback-primary text-lg leading-relaxed font-cal text-center">AI tests your child in minutes to discover exactly what they know and what they need to learn.</p>
                  </div>
                </article>
                <article className="bg-white rounded-2xl border-2 border-timeback-primary p-8 shadow-2xl group flex flex-col h-full" role="listitem">
                  <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 bg-timeback-bg rounded-full flex items-center justify-center border-2 border-timeback-primary shadow-2xl">
                      <div className="text-timeback-primary font-cal">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" role="img">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-timeback-primary mb-4 leading-tight font-cal text-center">Step 2: Build Your Custom Path</h3>
                  <div className="flex-grow flex items-center justify-center mb-6">
                    <p className="text-timeback-primary text-lg leading-relaxed font-cal text-center">AI creates a personalized learning journey just for your child, filling gaps and accelerating through concepts they already know.</p>
                  </div>
                </article>
                <article className="bg-white rounded-2xl border-2 border-timeback-primary p-8 shadow-2xl group flex flex-col h-full" role="listitem">
                  <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 bg-timeback-bg rounded-full flex items-center justify-center border-2 border-timeback-primary shadow-2xl">
                      <div className="text-timeback-primary font-cal">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" role="img">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-timeback-primary mb-4 leading-tight font-cal text-center">Step 3: Learn in Focused Bursts</h3>
                  <div className="flex-grow flex items-center justify-center mb-6">
                    <p className="text-timeback-primary text-lg leading-relaxed font-cal text-center">Your child learns in 25-minute focused sessions. They must master each concept 100% before moving forward.</p>
                  </div>
                </article>
                <article className="bg-white rounded-2xl border-2 border-timeback-primary p-8 shadow-2xl group flex flex-col h-full" role="listitem">
                  <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 bg-timeback-bg rounded-full flex items-center justify-center border-2 border-timeback-primary shadow-2xl">
                      <div className="text-timeback-primary font-cal">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" role="img">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-timeback-primary mb-4 leading-tight font-cal text-center">Step 4: Get Help When Stuck</h3>
                  <div className="flex-grow flex items-center justify-center mb-6">
                    <p className="text-timeback-primary text-lg leading-relaxed font-cal text-center">AI instantly detects when your child struggles and provides immediate support with easier explanations or practice problems.</p>
                  </div>
                </article>
                <article className="bg-white rounded-2xl border-2 border-timeback-primary p-8 shadow-2xl group flex flex-col h-full" role="listitem">
                  <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 bg-timeback-bg rounded-full flex items-center justify-center border-2 border-timeback-primary shadow-2xl">
                      <div className="text-timeback-primary font-cal">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" role="img">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-timeback-primary mb-4 leading-tight font-cal text-center">Step 5: Adjust and Accelerate</h3>
                  <div className="flex-grow flex items-center justify-center mb-6">
                    <p className="text-timeback-primary text-lg leading-relaxed font-cal text-center">The system continuously adapts, making lessons easier or harder based on your child&apos;s performance to maintain optimal difficulty.</p>
                  </div>
                </article>
                <article className="bg-white rounded-2xl border-2 border-timeback-primary p-8 shadow-2xl group flex flex-col h-full" role="listitem">
                  <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 bg-timeback-bg rounded-full flex items-center justify-center border-2 border-timeback-primary shadow-2xl">
                      <div className="text-timeback-primary font-cal">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" role="img">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-timeback-primary mb-4 leading-tight font-cal text-center">Step 6: Complete Grades Fast</h3>
                  <div className="flex-grow flex items-center justify-center mb-6">
                    <p className="text-timeback-primary text-lg leading-relaxed font-cal text-center">Your child finishes complete grade levels in just 80 days instead of 180.</p>
                  </div>
                </article>
              </div>
              
              {/* Follow-up Question Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto mt-16">
                <button
                  onClick={() => handleSectionSelect('whats-the-science')}
                  className="backdrop-blur-md bg-white/10 border-2 border-timeback-primary rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <h3 className="text-lg font-bold text-timeback-primary font-cal leading-tight">
                    What&apos;s the science?
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
                    Show me an example question
                  </h3>
                </button>
              </div>
            </div>
          </section>
        );
      case 'show-data':
        return <SchoolReportCard 
          schoolData={userData.selectedSchools?.[0]}
          onLearnMore={() => {}} 
        />;
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
      case 'whats-the-science':
        return (
          <section className="max-w-7xl mx-auto  py-20 lg:py-32 px-6 lg:px-12">
            <div className="text-center mb-16 font-cal">
              <div className="inline-flex items-center gap-2 backdrop-blur-sm bg-white/20 border border-timeback-primary rounded-full px-6 py-3 mb-8">
                <div className="w-3 h-3 bg-timeback-primary rounded-full animate-pulse"></div>
                <span className="text-timeback-primary font-bold text-sm font-cal">SCIENTIFIC RESEARCH</span>
              </div>
              <h2 className="text-4xl lg:text-6xl font-bold text-timeback-primary mb-8 font-cal">Here&apos;s the Science Behind TimeBack</h2>
              <p className="text-2xl text-timeback-primary max-w-5xl mx-auto font-cal leading-relaxed">Our revolutionary approach is backed by decades of peer-reviewed research from the world&apos;s leading educational institutions. Each study below demonstrates how TimeBack transforms theoretical breakthroughs into practical results for your child.</p>
            </div>
            <div className="py-8 mb-8">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="backdrop-blur-md bg-white/10 rounded-xl shadow-2xl hover:shadow-2xl transition-all duration-300 overflow-hidden group border-2 border-timeback-primary">
                    <div className="relative h-48  overflow-hidden">
                      <div className="absolute inset-0 p-6">
                        <div className="backdrop-blur-sm bg-white/30 rounded-xl shadow-sm p-4 transform rotate-3 group-hover:rotate-2 transition-transform border border-timeback-primary">
                          <div className="space-y-2">
                            <div className="h-2 bg-timeback-bg border border-timeback-primary rounded w-3/4"></div>
                            <div className="h-2 bg-timeback-bg border border-timeback-primary rounded w-full"></div>
                            <div className="h-2 bg-timeback-bg border border-timeback-primary rounded w-5/6"></div>
                            <div className="mt-4">
                              <div className="h-20 bg-timeback-bg border border-timeback-primary rounded flex items-center justify-center">
                                <div className="text-timeback-primary font-bold text-2xl font-cal">2σ</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 bg-timeback-primary text-white px-3 py-1 rounded-full text-xs font-bold font-cal">MIT • 1984</div>
                    </div>
                    <div className="p-6">
                      <h4 className="text-xl font-bold text-timeback-primary mb-2 font-cal">Bloom&apos;s 2 Sigma Problem</h4>
                      <p className="text-sm text-timeback-primary mb-3 font-cal">Benjamin S. Bloom • Educational Researcher</p>
                      <p className="text-timeback-primary mb-4 font-cal">Groundbreaking research demonstrating that 1-on-1 tutoring produces a 2 standard deviation improvement - moving average students to the top 2% of achievement.</p>
                    </div>
                  </div>
                  <div className="backdrop-blur-md bg-white/10 rounded-xl shadow-2xl hover:shadow-2xl transition-all duration-300 overflow-hidden group border-2 border-timeback-primary">
                    <div className="relative h-48  overflow-hidden">
                      <div className="absolute inset-0 p-6">
                        <div className="backdrop-blur-sm bg-white/30 rounded-xl shadow-sm p-4 transform -rotate-3 group-hover:-rotate-2 transition-transform border border-timeback-primary">
                          <div className="space-y-2">
                            <div className="h-2 bg-timeback-bg border border-timeback-primary rounded w-5/6"></div>
                            <div className="h-2 bg-timeback-bg border border-timeback-primary rounded w-full"></div>
                            <div className="h-2 bg-timeback-bg border border-timeback-primary rounded w-4/5"></div>
                            <div className="mt-4">
                              <div className="h-20 bg-timeback-bg border border-timeback-primary rounded flex items-center justify-center">
                                <svg className="w-12 h-12 text-timeback-primary font-cal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 bg-timeback-primary text-white px-3 py-1 rounded-full text-xs font-bold font-cal">ERIC • 1968</div>
                    </div>
                    <div className="p-6">
                      <h4 className="text-xl font-bold text-timeback-primary mb-2 font-cal">Mastery-Based Learning</h4>
                      <p className="text-sm text-timeback-primary mb-3 font-cal">James H. Block &amp; Benjamin S. Bloom • Educational Psychology</p>
                      <p className="text-timeback-primary mb-4 font-cal">Revolutionary approach requiring 90% mastery before advancement, eliminating learning gaps and ensuring deep understanding of each concept.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      case 'custom-question':
        return <CustomQuestionSection 
          quizData={userData as QuizData}
          interests={userData.kidsInterests}
          gradeLevel={userData.selectedSchools?.[0]?.level || 'high school'}
        />;
      default:
        return null;
    }
  };

  // Render content for viewed components (similar to renderSectionContent but for the accumulating page)
  const renderSectionContentForComponent = (sectionId: string) => {
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
        {/* Main exploration UI */}
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

          {/* Main Exploration Buttons */}
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

        {/* Render viewed components in order they were selected */}
        {viewedComponents.map((componentId, index) => (
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
              {renderSectionContent()}
            </div>
          </section>
        ))}

        {/* Render selected section content or data collection */}
        {selectedSection && (
          <section id="selected-content-section" className="max-w-7xl mx-auto px-6 lg:px-12 pb-20">
            {isCollectingData && (
              <div className="mb-6 text-center">
                <p className="text-lg text-timeback-primary font-cal">
                  We need a bit more information to personalize this section for you.
                </p>
              </div>
            )}
            {renderSectionContent()}
          </section>
        )}

        {/* Persistent CustomQuestionSection at bottom of page */}
        <section id="persistent-questions-section" className="max-w-7xl mx-auto px-6 lg:px-12 pb-20">
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