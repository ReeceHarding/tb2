'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { QuizData } from '@/types/quiz';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
import '../ui-animations.css';

// Component imports for data collection
import dynamic from 'next/dynamic';
import { SchoolSearchCollector, GradeCollector, InterestsCollector } from '@/components/personalized/DataCollectionComponents';

// Component imports for content display
const TimeBackVsCompetitors = dynamic(() => import('@/components/personalized/TimeBackVsCompetitors'));
const MechanismSection = dynamic(() => import('@/components/personalized/MechanismSection'));
const LearningScienceSection = dynamic(() => import('@/components/personalized/LearningScienceSection'));
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

  // Handle section selection
  const handleSectionSelect = (sectionId: string) => {
    console.log(`[PersonalizedPage] Section selected: ${sectionId}`);
    
    const requirements = dataRequirements[sectionId] || [];
    
    if (hasRequiredData(requirements)) {
      // We have all required data, show the component
      setSelectedSection(sectionId);
      setIsCollectingData(false);
      setDataNeeded(null);
      
      // Add to viewed components if not already there
      if (!viewedComponents.includes(sectionId)) {
        setViewedComponents([...viewedComponents, sectionId]);
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
        // We have all data now, show the component
        setIsCollectingData(false);
        setDataNeeded(null);
        
        // Add to viewed components
        if (!viewedComponents.includes(selectedSection)) {
          setViewedComponents([...viewedComponents, selectedSection]);
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
          <div className="space-y-8">
            <TimeBackVsCompetitors onLearnMore={() => {}} />
            <MechanismSection />
            <LearningScienceSection 
              learningGoals={[]} 
              onLearnMore={() => {}}
            />
      </div>
    );
      case 'how-does-it-work':
        return <MechanismSection />;
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

          {/* Custom Question Section */}
          <div className="mt-16">
            <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
              <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border-2 border-timeback-primary mb-8 shadow-2xl">
                <h2 className="text-3xl font-bold text-timeback-primary font-cal mb-4">
                  Have a Specific Question?
                </h2>
                <p className="text-lg text-timeback-primary font-cal mb-6">
                  Ask anything about TimeBack and get a personalized answer based on your child&apos;s needs.
                </p>
                <button
                  onClick={() => handleSectionSelect('custom-question')}
                  className="w-full bg-timeback-primary text-white px-6 py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl font-cal text-lg"
                >
                  Ask My Question
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Render selected section content or data collection */}
        {selectedSection && (
          <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-20">
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

        {/* Show all viewed components (growing page) */}
        {viewedComponents.length > 0 && !selectedSection && (
          <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-20">
            <h3 className="text-2xl font-bold text-timeback-primary font-cal mb-8 text-center">
              Your Personalized TimeBack Report
            </h3>
            {viewedComponents.map((componentId) => {
              // Render each viewed component based on its ID
              let content = null;
              switch (componentId) {
                case 'what-is-timeback':
                  content = (
                    <div className="space-y-8">
                      <TimeBackVsCompetitors onLearnMore={() => {}} />
                      <MechanismSection />
                      <LearningScienceSection 
                        learningGoals={[]} 
                        onLearnMore={() => {}}
                      />
                    </div>
                  );
                  break;
                case 'how-does-it-work':
                  content = <MechanismSection />;
                  break;
                case 'show-data':
                  content = <SchoolReportCard 
                    schoolData={userData.selectedSchools?.[0]}
                    onLearnMore={() => {}} 
                  />;
                  break;
                case 'example-question':
                  content = <PersonalizedSubjectExamples 
                    interests={userData.kidsInterests} 
                    onLearnMore={() => {}}
                  />;
                  break;
                case 'find-school':
                  content = <ClosestSchools quizData={userData as QuizData} />;
                  break;
                case 'extra-hours':
                  content = <AfternoonActivities 
                    interests={userData.kidsInterests}
                    onLearnMore={() => {}}
                  />;
                  break;
                case 'custom-question':
                  content = <CustomQuestionSection 
                    quizData={userData as QuizData}
                    interests={userData.kidsInterests}
                    gradeLevel={userData.selectedSchools?.[0]?.level || 'high school'}
                  />;
                  break;
              }
              
              return (
                <div key={componentId} className="mb-12">
                  {content}
                  <div className="mt-8 border-t border-timeback-primary opacity-20"></div>
                </div>
              );
            })}
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}