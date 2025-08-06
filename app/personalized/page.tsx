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
  
  // Render tracking for debugging
  const [renderCount, setRenderCount] = useState(0);
  
  // Generate unique component instance ID for logging
  const componentId = React.useRef(`PersonalizedPage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  
  // State for user data
  const [userData, setUserData] = useState<Partial<QuizData>>({
    selectedSchools: [],
    kidsInterests: [],
    userType: 'parents',
    parentSubType: 'timeback-school'
  });
  
  // State for UI - simplified
  const [viewedComponents, setViewedComponents] = useState<string[]>([]);
  
  // Track component lifecycle
  useEffect(() => {
    const timestamp = new Date().toISOString();
    const instanceId = componentId.current;
    console.log(`🚀 [PersonalizedPage-${instanceId}] ${timestamp} COMPONENT MOUNTED`);
    console.log(`📊 [PersonalizedPage-${instanceId}] Initial state snapshot:`, {
      userData,
      viewedComponents,
      sessionStatus: status,
      hasSession: !!session
    });
    
    return () => {
      console.log(`💀 [PersonalizedPage-${instanceId}] ${new Date().toISOString()} COMPONENT UNMOUNTING`);
    };
  }, []);

  // Track all re-renders
  useEffect(() => {
    const newRenderCount = renderCount + 1;
    setRenderCount(newRenderCount);
    const timestamp = new Date().toISOString();
    const instanceId = componentId.current;
    
    if (newRenderCount > 1) {
      console.log(`🔄 [PersonalizedPage-${instanceId}] ${timestamp} RE-RENDER #${newRenderCount}`);
      console.log(`📊 [PersonalizedPage-${instanceId}] Current state:`, {
        userData: {
          selectedSchools: userData.selectedSchools?.length || 0,
          kidsInterests: userData.kidsInterests?.length || 0,
          userType: userData.userType,
          parentSubType: userData.parentSubType
        },
        viewedComponents: viewedComponents.length > 0 ? viewedComponents : 'none',
        sessionStatus: status,
        sessionEmail: session?.user?.email || 'none'
      });
    }
  }, [renderCount]);

  // Check if user is authenticated
  useEffect(() => {
    const timestamp = new Date().toISOString();
    const instanceId = componentId.current;
    
    console.log(`🔐 [PersonalizedPage-${instanceId}] ${timestamp} AUTH STATUS CHANGE:`, {
      status,
      hasSession: !!session,
      userEmail: session?.user?.email || 'none',
      userName: session?.user?.name || 'none'
    });
    
    if (status === 'unauthenticated') {
      console.log(`🚨 [PersonalizedPage-${instanceId}] ${timestamp} USER NOT AUTHENTICATED - REDIRECTING TO AUTH`);
      console.log(`🔄 [PersonalizedPage-${instanceId}] ${timestamp} Triggering router.push('/auth')`);
      router.push('/auth');
    } else if (status === 'authenticated') {
      console.log(`✅ [PersonalizedPage-${instanceId}] ${timestamp} USER AUTHENTICATED SUCCESSFULLY`);
      console.log(`👤 [PersonalizedPage-${instanceId}] User details:`, {
        email: session?.user?.email,
        name: session?.user?.name,
        image: session?.user?.image
      });
    } else if (status === 'loading') {
      console.log(`⏳ [PersonalizedPage-${instanceId}] ${timestamp} AUTHENTICATION STATUS LOADING...`);
    }
  }, [status, router, session]);

  // Load existing user data
  useEffect(() => {
    const loadExistingData = async () => {
      const timestamp = new Date().toISOString();
      const instanceId = componentId.current;
      
      if (status === 'loading') {
        console.log(`⏳ [PersonalizedPage-${instanceId}] ${timestamp} SKIPPING DATA LOAD - Auth status still loading`);
        return;
      }
      
      console.log(`💾 [PersonalizedPage-${instanceId}] ${timestamp} STARTING DATA LOAD PROCESS`);
      console.log(`🔍 [PersonalizedPage-${instanceId}] Auth context:`, {
        status,
        userEmail: session?.user?.email || 'none',
        canLoadFromDB: !!(status === 'authenticated' && session?.user?.email)
      });
      
      // Load from localStorage
      console.log(`📱 [PersonalizedPage-${instanceId}] ${timestamp} LOADING FROM LOCALSTORAGE...`);
      const savedSchool = localStorage.getItem('timebackUserSchool');
      const savedGrade = localStorage.getItem('timebackUserGrade');
      const savedInterests = localStorage.getItem('timebackUserInterests');
      
      console.log(`📱 [PersonalizedPage-${instanceId}] LocalStorage items found:`, {
        hasSchool: !!savedSchool,
        schoolData: savedSchool ? savedSchool.substring(0, 100) + '...' : 'none',
        hasGrade: !!savedGrade,
        gradeData: savedGrade || 'none',
        hasInterests: !!savedInterests,
        interestsData: savedInterests ? savedInterests.substring(0, 100) + '...' : 'none'
      });
      
      let updatedData: Partial<QuizData> = {
        selectedSchools: [],
        kidsInterests: [],
        userType: 'parents',
        parentSubType: 'timeback-school'
      };
      
      // Parse school data
      if (savedSchool) {
        try {
          console.log(`🏫 [PersonalizedPage-${instanceId}] ${timestamp} PARSING SCHOOL DATA...`);
          const parsedSchools = JSON.parse(savedSchool);
          updatedData.selectedSchools = parsedSchools;
          console.log(`✅ [PersonalizedPage-${instanceId}] School data parsed successfully:`, {
            schoolCount: parsedSchools.length,
            firstSchool: parsedSchools[0]?.name || 'none',
            schoolCity: parsedSchools[0]?.city || 'none'
          });
        } catch (e) {
          console.error(`❌ [PersonalizedPage-${instanceId}] FAILED TO PARSE SCHOOL DATA:`, e);
          console.error(`📄 [PersonalizedPage-${instanceId}] Raw school data:`, savedSchool);
        }
      } else {
        console.log(`🏫 [PersonalizedPage-${instanceId}] No school data in localStorage`);
      }
      
      // Parse grade data
      if (savedGrade) {
        console.log(`🎓 [PersonalizedPage-${instanceId}] ${timestamp} PROCESSING GRADE DATA: ${savedGrade}`);
        if (updatedData.selectedSchools && updatedData.selectedSchools.length > 0) {
          updatedData.selectedSchools[0].level = savedGrade;
          console.log(`✅ [PersonalizedPage-${instanceId}] Grade applied to school:`, {
            schoolName: updatedData.selectedSchools[0].name,
            grade: savedGrade
          });
        } else {
          console.log(`⚠️ [PersonalizedPage-${instanceId}] Grade found but no school to apply it to`);
        }
      } else {
        console.log(`🎓 [PersonalizedPage-${instanceId}] No grade data in localStorage`);
      }
      
      // Parse interests data
      if (savedInterests) {
        try {
          console.log(`🎯 [PersonalizedPage-${instanceId}] ${timestamp} PARSING INTERESTS DATA...`);
          const parsedInterests = JSON.parse(savedInterests);
          updatedData.kidsInterests = parsedInterests;
          console.log(`✅ [PersonalizedPage-${instanceId}] Interests parsed successfully:`, {
            interestCount: parsedInterests.length,
            interests: parsedInterests
          });
        } catch (e) {
          console.error(`❌ [PersonalizedPage-${instanceId}] FAILED TO PARSE INTERESTS DATA:`, e);
          console.error(`📄 [PersonalizedPage-${instanceId}] Raw interests data:`, savedInterests);
        }
      } else {
        console.log(`🎯 [PersonalizedPage-${instanceId}] No interests data in localStorage`);
      }
      
      console.log(`📱 [PersonalizedPage-${instanceId}] ${timestamp} LOCALSTORAGE LOAD COMPLETE`);
      console.log(`📊 [PersonalizedPage-${instanceId}] Data after localStorage:`, {
        schoolsCount: updatedData.selectedSchools?.length || 0,
        interestsCount: updatedData.kidsInterests?.length || 0,
        hasGrade: !!(updatedData.selectedSchools?.[0]?.level)
      });
      
      // Load from database if authenticated
      if (status === 'authenticated' && session?.user?.email) {
        try {
          console.log(`🗄️ [PersonalizedPage-${instanceId}] ${timestamp} LOADING FROM DATABASE...`);
          console.log(`🔑 [PersonalizedPage-${instanceId}] User email: ${session.user.email}`);
          
          const dbRequestStart = Date.now();
          const response = await fetch('/api/quiz/save', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          const dbRequestTime = Date.now() - dbRequestStart;
          console.log(`⏱️ [PersonalizedPage-${instanceId}] Database request completed in ${dbRequestTime}ms`);
          console.log(`📡 [PersonalizedPage-${instanceId}] Response status: ${response.status} ${response.statusText}`);

          if (response.ok) {
            const result = await response.json();
            console.log(`📋 [PersonalizedPage-${instanceId}] Database response:`, {
              success: result.success,
              hasData: !!result.data,
              hasQuizData: !!result.data?.quizData
            });
            
            if (result.success && result.data?.quizData) {
              const dbData = result.data.quizData;
              console.log(`🔍 [PersonalizedPage-${instanceId}] Database quiz data:`, {
                hasSchools: !!(dbData.selectedSchools?.length > 0),
                schoolsCount: dbData.selectedSchools?.length || 0,
                hasInterests: !!(dbData.kidsInterests?.length > 0),
                interestsCount: dbData.kidsInterests?.length || 0
              });
              
              if (dbData.selectedSchools?.length > 0) {
                console.log(`🏫 [PersonalizedPage-${instanceId}] OVERRIDING localStorage schools with database data`);
                console.log(`📊 [PersonalizedPage-${instanceId}] Database schools:`, dbData.selectedSchools.map((s: any) => ({ name: s.name, city: s.city, level: s.level })));
                updatedData.selectedSchools = dbData.selectedSchools;
              }
              if (dbData.kidsInterests?.length > 0) {
                console.log(`🎯 [PersonalizedPage-${instanceId}] OVERRIDING localStorage interests with database data`);
                console.log(`📊 [PersonalizedPage-${instanceId}] Database interests:`, dbData.kidsInterests);
                updatedData.kidsInterests = dbData.kidsInterests;
              }
            } else {
              console.log(`📭 [PersonalizedPage-${instanceId}] No quiz data found in database response`);
            }
          } else {
            console.error(`❌ [PersonalizedPage-${instanceId}] Database request failed:`, {
              status: response.status,
              statusText: response.statusText
            });
          }
        } catch (error) {
          console.error(`💥 [PersonalizedPage-${instanceId}] DATABASE LOAD ERROR:`, error);
          console.error(`🔍 [PersonalizedPage-${instanceId}] Error details:`, {
            message: error.message,
            stack: error.stack
          });
        }
      } else {
        console.log(`🔐 [PersonalizedPage-${instanceId}] ${timestamp} SKIPPING DATABASE LOAD - User not authenticated`);
        console.log(`📊 [PersonalizedPage-${instanceId}] Auth status:`, { status, hasEmail: !!session?.user?.email });
      }
      
      console.log(`📊 [PersonalizedPage-${instanceId}] ${timestamp} FINAL DATA SUMMARY:`, {
        schools: {
          count: updatedData.selectedSchools?.length || 0,
          firstSchool: updatedData.selectedSchools?.[0]?.name || 'none',
          grade: updatedData.selectedSchools?.[0]?.level || 'none'
        },
        interests: {
          count: updatedData.kidsInterests?.length || 0,
          list: updatedData.kidsInterests || []
        },
        userType: updatedData.userType,
        parentSubType: updatedData.parentSubType
      });
      
      console.log(`💾 [PersonalizedPage-${instanceId}] ${timestamp} UPDATING STATE WITH FINAL DATA...`);
      setUserData(updatedData);
      console.log(`✅ [PersonalizedPage-${instanceId}] ${timestamp} DATA LOAD PROCESS COMPLETE`);
    };
    
    loadExistingData();
  }, [status, session]);

  // Track userData state changes
  useEffect(() => {
    const timestamp = new Date().toISOString();
    const instanceId = componentId.current;
    
    // Skip logging initial state (empty arrays)
    const hasActualData = userData.selectedSchools?.length > 0 || userData.kidsInterests?.length > 0;
    if (!hasActualData) return;
    
    console.log(`📊 [PersonalizedPage-${instanceId}] ${timestamp} USER DATA STATE CHANGED`);
    console.log(`🔄 [PersonalizedPage-${instanceId}] New userData state:`, {
      selectedSchools: userData.selectedSchools?.map(school => ({
        name: school.name,
        city: school.city,
        state: school.state,
        level: school.level,
        id: school.id
      })) || [],
      kidsInterests: userData.kidsInterests || [],
      userType: userData.userType,
      parentSubType: userData.parentSubType
    });
    console.log(`📈 [PersonalizedPage-${instanceId}] Data completeness:`, {
      hasSchools: !!(userData.selectedSchools?.length > 0),
      hasInterests: !!(userData.kidsInterests?.length > 0),
      hasGrade: !!(userData.selectedSchools?.[0]?.level),
      dataCompleteness: [
        userData.selectedSchools?.length > 0 ? 'schools' : null,
        userData.kidsInterests?.length > 0 ? 'interests' : null,
        userData.selectedSchools?.[0]?.level ? 'grade' : null
      ].filter(Boolean).join(', ') || 'none'
    });
  }, [userData]);

  // Track viewedComponents state changes
  useEffect(() => {
    const timestamp = new Date().toISOString();
    const instanceId = componentId.current;
    
    // Skip logging initial empty state
    if (viewedComponents.length === 0) return;
    
    console.log(`📋 [PersonalizedPage-${instanceId}] ${timestamp} VIEWED COMPONENTS STATE CHANGED`);
    console.log(`🔄 [PersonalizedPage-${instanceId}] New viewedComponents state:`, {
      components: viewedComponents,
      count: viewedComponents.length,
      latest: viewedComponents[viewedComponents.length - 1],
      journey: viewedComponents.map((comp, idx) => `${idx + 1}. ${comp}`).join(' → ')
    });
    console.log(`📊 [PersonalizedPage-${instanceId}] Component stats:`, {
      totalSections: viewedComponents.length,
      uniqueSections: new Set(viewedComponents).size,
      hasRepeats: viewedComponents.length !== new Set(viewedComponents).size,
      sectionsViewed: viewedComponents
    });
  }, [viewedComponents]);

  // Simplified section selection - just adds components to the page
  const handleSectionSelect = (sectionId: string) => {
    const timestamp = new Date().toISOString();
    const instanceId = componentId.current;
    const userContext = {
      email: session?.user?.email || 'anonymous',
      name: session?.user?.name || 'unknown',
      authStatus: status
    };
    
    console.log(`🖱️ [PersonalizedPage-${instanceId}] ${timestamp} USER INTERACTION: Section Selected`);
    console.log(`🎯 [PersonalizedPage-${instanceId}] Target section: "${sectionId}"`);
    console.log(`👤 [PersonalizedPage-${instanceId}] User context:`, userContext);
    console.log(`📋 [PersonalizedPage-${instanceId}] Current viewed components:`, viewedComponents);
    console.log(`🔍 [PersonalizedPage-${instanceId}] Section already viewed: ${viewedComponents.includes(sectionId)}`);
    
    // Track user journey
    const userJourney = {
      totalSectionsViewed: viewedComponents.length,
      previousSections: [...viewedComponents],
      currentSelection: sectionId,
      isRevisit: viewedComponents.includes(sectionId)
    };
    console.log(`🗺️ [PersonalizedPage-${instanceId}] User journey state:`, userJourney);
    
    if (!viewedComponents.includes(sectionId)) {
      console.log(`➕ [PersonalizedPage-${instanceId}] ${timestamp} ADDING NEW COMPONENT TO PAGE`);
      const oldViewedComponents = [...viewedComponents];
      const newViewedComponents = [...viewedComponents, sectionId];
      
      console.log(`📊 [PersonalizedPage-${instanceId}] Component list change:`, {
        before: oldViewedComponents,
        after: newViewedComponents,
        added: sectionId,
        newTotal: newViewedComponents.length
      });
      
          setViewedComponents(newViewedComponents);
          
      console.log(`⏰ [PersonalizedPage-${instanceId}] Setting 100ms delay for scroll operation`);
      setTimeout(() => {
        const targetElementId = `viewed-component-${sectionId}`;
        console.log(`📍 [PersonalizedPage-${instanceId}] ${new Date().toISOString()} INITIATING SCROLL to element: ${targetElementId}`);
        console.log(`🎯 [PersonalizedPage-${instanceId}] Scroll parameters: offset=100, behavior=smooth`);
        
        try {
          smoothScrollToElement(targetElementId, 100, 'smooth');
          console.log(`✅ [PersonalizedPage-${instanceId}] Scroll function called successfully`);
        } catch (scrollError) {
          console.error(`❌ [PersonalizedPage-${instanceId}] SCROLL ERROR:`, scrollError);
        }
      }, 100);
      } else {
      console.log(`🔄 [PersonalizedPage-${instanceId}] ${timestamp} REVISITING EXISTING COMPONENT`);
      const targetElementId = `viewed-component-${sectionId}`;
      const existingIndex = viewedComponents.indexOf(sectionId);
      
      console.log(`📊 [PersonalizedPage-${instanceId}] Revisit details:`, {
        sectionId,
        existingIndex,
        totalComponents: viewedComponents.length,
        isAtTop: existingIndex === 0,
        isAtBottom: existingIndex === viewedComponents.length - 1
      });
      
      console.log(`📍 [PersonalizedPage-${instanceId}] SCROLLING TO EXISTING COMPONENT: ${targetElementId}`);
      try {
        smoothScrollToElement(targetElementId, 100, 'smooth');
        console.log(`✅ [PersonalizedPage-${instanceId}] Scroll to existing component initiated`);
      } catch (scrollError) {
        console.error(`❌ [PersonalizedPage-${instanceId}] REVISIT SCROLL ERROR:`, scrollError);
      }
    }
    
    // Log user engagement metrics
    const engagementMetrics = {
      sessionStartTime: componentId.current.split('-')[1], // Extract timestamp from componentId
      currentTime: Date.now(),
      sectionsExplored: viewedComponents.length,
      uniqueSections: new Set([...viewedComponents, sectionId]).size,
      clickTime: timestamp
    };
    console.log(`📈 [PersonalizedPage-${instanceId}] User engagement metrics:`, engagementMetrics);
    
    console.log(`🏁 [PersonalizedPage-${instanceId}] ${timestamp} SECTION SELECTION PROCESSING COMPLETE`);
  };

  // Component renderer for the growing page
  const renderComponent = (sectionId: string) => {
    const timestamp = new Date().toISOString();
    const instanceId = componentId.current;
    
    console.log(`🎨 [PersonalizedPage-${instanceId}] ${timestamp} RENDERING COMPONENT: "${sectionId}"`);
    console.log(`📊 [PersonalizedPage-${instanceId}] Render context:`, {
      sectionId,
      hasUserData: !!(userData.selectedSchools?.length || userData.kidsInterests?.length),
      userSchoolsCount: userData.selectedSchools?.length || 0,
      userInterestsCount: userData.kidsInterests?.length || 0,
      userGrade: userData.selectedSchools?.[0]?.level || 'none'
    });
    
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
                    <span className="text-timeback-primary">✗</span>
                    6+ hours of wasted time daily
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-timeback-primary">✗</span>
                    One-size-fits-all approach
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-timeback-primary">✗</span>
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
    const timestamp = new Date().toISOString();
    const instanceId = componentId.current;
    
    console.log(`❓ [PersonalizedPage-${instanceId}] ${timestamp} GENERATING FOLLOW-UP QUESTIONS`);
    console.log(`🎯 [PersonalizedPage-${instanceId}] Target section: "${sectionId}"`);
    
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

    const hasQuestionsForSection = sectionId in questionMap;
    const questions = questionMap[sectionId] || [];
    
    console.log(`📊 [PersonalizedPage-${instanceId}] Question mapping lookup:`, {
      sectionId,
      hasQuestionsForSection,
      questionsCount: questions.length,
      availableSections: Object.keys(questionMap),
      isValidSection: hasQuestionsForSection
    });
    
    if (hasQuestionsForSection) {
      console.log(`✅ [PersonalizedPage-${instanceId}] Questions found for "${sectionId}":`, 
        questions.map((q, idx) => `${idx + 1}. ${q.text} (${q.id})`));
      
      // Filter out questions for sections already viewed
      const availableQuestions = questions.filter(q => !viewedComponents.includes(q.id));
      const alreadyViewedQuestions = questions.filter(q => viewedComponents.includes(q.id));
      
      console.log(`🔍 [PersonalizedPage-${instanceId}] Question filtering:`, {
        totalQuestions: questions.length,
        availableQuestions: availableQuestions.length,
        alreadyViewed: alreadyViewedQuestions.length,
        viewedSections: viewedComponents,
        availableQuestionsDetail: availableQuestions.map(q => ({ id: q.id, text: q.text })),
        alreadyViewedDetail: alreadyViewedQuestions.map(q => ({ id: q.id, text: q.text }))
      });
      
      return availableQuestions.length > 0 ? availableQuestions : questions; // Show all if none available
    } else {
      console.warn(`⚠️ [PersonalizedPage-${instanceId}] NO QUESTIONS DEFINED for section "${sectionId}"`);
      console.log(`📋 [PersonalizedPage-${instanceId}] Available sections with questions:`, Object.keys(questionMap));
      return [];
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

          {/* Custom Question Form */}
          <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border-2 border-timeback-primary mb-8 shadow-2xl max-w-4xl mx-auto mt-12">
            <h2 className="text-3xl font-bold text-timeback-primary font-cal mb-4">
              Have a Specific Question?
            </h2>
            <p className="text-lg text-timeback-primary font-cal mb-6">
              Ask anything about TimeBack and get a personalized answer based on your child&apos;s needs.
            </p>
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const question = formData.get('question') as string;
              if (question.trim()) {
                handleSectionSelect('custom-question');
                // Scroll to custom question section after a brief delay
                setTimeout(() => {
                  const customSection = document.getElementById('questions-section');
                  if (customSection) {
                    customSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 100);
              }
            }}>
              <input 
                name="question"
                placeholder="Ask me anything about TimeBack..." 
                className="w-full px-6 py-4 bg-timeback-bg/50 border-2 border-timeback-primary rounded-xl text-timeback-primary placeholder-timeback-primary/50 focus:ring-2 focus:ring-timeback-primary focus:border-transparent outline-none font-cal text-lg shadow-lg backdrop-blur-sm" 
                type="text" 
              />
              <button 
                type="submit" 
                className="w-full bg-timeback-primary text-white px-6 py-4 rounded-xl font-bold hover:bg-timeback-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl font-cal text-lg"
              >
                Get My Personalized Answer
              </button>
            </form>
          </div>
        </section>

        {/* Render viewed components in order with follow-up questions */}
        {viewedComponents.map((componentIdString, index) => {
          const timestamp = new Date().toISOString();
          const instanceId = componentId.current;
          
          console.log(`🏗️ [PersonalizedPage-${instanceId}] ${timestamp} RENDERING COMPONENT SECTION`);
          console.log(`📊 [PersonalizedPage-${instanceId}] Section details:`, {
            componentId: componentIdString,
            sectionIndex: index,
            sectionNumber: index + 1,
            totalSections: viewedComponents.length,
            isFirst: index === 0,
            isLast: index === viewedComponents.length - 1,
            htmlId: `viewed-component-${componentIdString}`
          });
          
          const followUpQuestions = getFollowUpQuestions(componentIdString);
          
          console.log(`🎯 [PersonalizedPage-${instanceId}] Follow-up questions for "${componentIdString}":`, {
            questionsCount: followUpQuestions.length,
            questions: followUpQuestions.map(q => ({ id: q.id, text: q.text })),
            hasQuestions: followUpQuestions.length > 0
          });
          
          // Check if component can actually render
          const canRender = (() => {
            try {
              const testRender = renderComponent(componentIdString);
              return testRender !== null && testRender !== undefined;
            } catch (error) {
              console.error(`❌ [PersonalizedPage-${instanceId}] Component render test failed for "${componentIdString}":`, error);
              return false;
            }
          })();
          
          console.log(`✅ [PersonalizedPage-${instanceId}] Component render validation:`, {
            componentId: componentIdString,
            canRender,
            renderAttempt: timestamp
          });
          
          return (
          <section 
              key={componentIdString} 
              id={`viewed-component-${componentIdString}`} 
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
                {(() => {
                  console.log(`🎨 [PersonalizedPage-${instanceId}] ${new Date().toISOString()} CALLING renderComponent for "${componentIdString}"`);
                  const renderedComponent = renderComponent(componentIdString);
                  console.log(`📋 [PersonalizedPage-${instanceId}] Component rendered successfully:`, {
                    componentId: componentIdString,
                    hasContent: !!renderedComponent,
                    timestamp: new Date().toISOString()
                  });
                  return renderedComponent;
                })()}
                
                {/* Have a Specific Question form */}
                <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border-2 border-timeback-primary mb-8 shadow-2xl">
                  <h2 className="text-3xl font-bold text-timeback-primary font-cal mb-4">Have a Specific Question?</h2>
                  <p className="text-lg text-timeback-primary font-cal mb-6">Ask anything about TimeBack and get a personalized answer based on your child&apos;s needs.</p>
                  <form className="space-y-4">
                    <input 
                      placeholder="Ask me anything about TimeBack..." 
                      className="w-full px-6 py-4 bg-timeback-bg/50 border-2 border-timeback-primary rounded-xl text-timeback-primary placeholder-timeback-primary/50 focus:ring-2 focus:ring-timeback-primary focus:border-transparent outline-none font-cal text-lg shadow-xl backdrop-blur-sm" 
                      type="text" 
                      value=""
                    />
                    <button 
                      type="submit" 
                      disabled 
                      className="w-full bg-timeback-primary text-white px-6 py-4 rounded-xl font-bold hover:bg-timeback-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl font-cal text-lg"
                    >
                      Get My Personalized Answer
                    </button>
                  </form>
                </div>

                {/* Follow-up questions after each component */}
                {followUpQuestions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-12">
                    {followUpQuestions.map((question: { id: string; text: string; }, qIndex: number) => {
                      console.log(`🔘 [PersonalizedPage-${instanceId}] ${new Date().toISOString()} RENDERING FOLLOW-UP BUTTON`, {
                        componentId: componentIdString,
                        questionIndex: qIndex,
                        questionId: question.id,
                        questionText: question.text,
                        isAlreadyViewed: viewedComponents.includes(question.id)
                      });
                      
                      return (
                        <button
                          key={question.id}
                          onClick={() => {
                            console.log(`🖱️ [PersonalizedPage-${instanceId}] ${new Date().toISOString()} FOLLOW-UP QUESTION CLICKED`, {
                              sourceComponent: componentIdString,
                              targetComponent: question.id,
                              questionText: question.text,
                              clickContext: 'follow-up-question'
                            });
                            handleSectionSelect(question.id);
                          }}
                          className="backdrop-blur-md bg-white/10 border-2 border-timeback-primary rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          <h3 className="text-sm font-bold text-timeback-primary font-cal leading-tight">
                            {question.text}
                          </h3>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center mt-12">
                    <p className="text-timeback-primary text-sm font-cal opacity-70">
                      No follow-up questions available for this section
                </p>
              </div>
            )}
              </div>
          </section>
          );
        })}


      </main>
      <Footer />
    </>
  );
}