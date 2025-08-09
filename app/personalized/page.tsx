'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { usePostHog } from 'posthog-js/react';
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
const FindSchoolsNearMe = dynamic(() => import('@/components/personalized/FindSchoolsNearMe'));
const CustomQuestionSection = dynamic(() => import('@/components/personalized/CustomQuestionSection'));
const SchoolReportCard = dynamic(() => import('@/components/personalized/SchoolReportCard'));
const CompletionTimeData = dynamic(() => import('@/components/personalized/CompletionTimeData'));
const TimeBackVsCompetitors = dynamic(() => import('@/components/personalized/TimeBackVsCompetitors'));
const StudentJourneyCarousel = dynamic(() => import('@/components/personalized/StudentJourneyCarousel'));
const VideoTestimonials = dynamic(() => import('@/components/VideoTestimonials'));
const ImmediateDataShock = dynamic(() => import('@/components/personalized/ImmediateDataShock'));
const MAPTestResults = dynamic(() => import('@/components/ai-experience/MAPTestResults'));
const TimeBackWhitepaperViewer = dynamic(() => import('@/components/personalized/TimeBackWhitepaperViewer'));

// Predetermined Section Component with Typewriter Animations
interface PredeterminedSectionProps {
  sectionId: string;
  question: string;
  interests: string[];
  gradeLevel: string;
}

const PredeterminedSection: React.FC<PredeterminedSectionProps> = ({ 
  sectionId, 
  question, 
  interests, 
  gradeLevel 
}) => {
  console.log(`🎭 [PredeterminedSection] Rendering section "${sectionId}" with question: "${question}"`);
  
  return (
    <div key={`predetermined-${sectionId}`}>
      <CustomQuestionSection 
        interests={interests}
        gradeLevel={gradeLevel}
        preGeneratedContent={{
          question: question,
          autoSubmit: true,
          sectionId: sectionId
        }}
      />
    </div>
  );
};

export default function PersonalizedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const posthog = usePostHog();
  
  // Render tracking for debugging
  const renderCount = React.useRef(0);
  
  // Generate unique component instance ID for logging
  const componentId = React.useRef(`PersonalizedPage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  
  // PostHog tracking state
  const sessionStartTime = useRef<number>(Date.now());
  const sectionStartTimes = useRef<Record<string, number>>({});
  const questionInteractions = useRef<Array<{
    questionId: string;
    questionText: string;
    timestamp: number;
    timeFromSessionStart: number;
    timeFromLastInteraction: number;
    source: 'main-grid' | 'follow-up' | 'search-form';
    previousSection?: string;
  }>>([]);
  const searchQueries = useRef<Array<{
    query: string;
    timestamp: number;
    timeFromSessionStart: number;
    source: 'hero-form' | 'follow-up-form';
    context?: string;
  }>>([]);
  
  // State for user data
  const [userData, setUserData] = useState<Partial<QuizData>>({
    selectedSchools: [],
    kidsInterests: [],
    userType: 'parents',
    parentSubType: 'timeback-school'
  });
  
  // State for UI - simplified (do not pre-render any section to avoid auto follow-up API calls)
  const [viewedComponents, setViewedComponents] = useState<string[]>([]);
  
  // State for components that have actually generated content (not just viewed)
  const [componentsWithContent, setComponentsWithContent] = useState<string[]>([]);
  
  // State for generated content from database
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  
  // State for custom question input (fixing the input glitch)
  const [customQuestionInput, setCustomQuestionInput] = useState<string>('');
  console.log(`🔍 [PersonalizedPage] Custom question input state initialized:`, { customQuestionInput });
  
  // PostHog session tracking initialization
  useEffect(() => {
    if (!posthog) return;
    
    // Track page visit with session start
    const sessionId = `personalized-${sessionStartTime.current}`;
    posthog.capture('personalized_page_visited', {
      session_id: sessionId,
      timestamp: new Date().toISOString(),
      user_authenticated: status === 'authenticated',
      user_email: session?.user?.email || null,
      user_has_quiz_data: !!(userData.selectedSchools?.length || userData.kidsInterests?.length),
      grade_level: userData.selectedSchools?.[0]?.level || null,
      interests_count: userData.kidsInterests?.length || 0,
      schools_selected: userData.selectedSchools?.length || 0,
    });
    
    console.log(`📊 [PostHog] Session started for personalized page:`, { sessionId });
  }, [posthog, status, session?.user?.email]);

  // Helper function to track question interactions
  const trackQuestionInteraction = (
    questionId: string, 
    questionText: string, 
    source: 'main-grid' | 'follow-up' | 'search-form',
    previousSection?: string
  ) => {
    if (!posthog) return;
    
    const now = Date.now();
    const timeFromSessionStart = now - sessionStartTime.current;
    const lastInteraction = questionInteractions.current[questionInteractions.current.length - 1];
    const timeFromLastInteraction = lastInteraction ? now - lastInteraction.timestamp : 0;
    
    const interaction = {
      questionId,
      questionText,
      timestamp: now,
      timeFromSessionStart,
      timeFromLastInteraction,
      source,
      previousSection
    };
    
    questionInteractions.current.push(interaction);
    
    // Start timing for this section
    sectionStartTimes.current[questionId] = now;
    
    posthog.capture('question_clicked', {
      question_id: questionId,
      question_text: questionText,
      source,
      previous_section: previousSection,
      time_from_session_start_ms: timeFromSessionStart,
      time_from_last_interaction_ms: timeFromLastInteraction,
      total_questions_clicked: questionInteractions.current.length,
      session_id: `personalized-${sessionStartTime.current}`,
      timestamp: new Date().toISOString(),
      user_journey: questionInteractions.current.map(i => i.questionId),
      user_authenticated: status === 'authenticated',
      grade_level: userData.selectedSchools?.[0]?.level || null,
      interests: userData.kidsInterests || [],
    });
    
    console.log(`📊 [PostHog] Question clicked:`, interaction);
  };

  // Helper function to track search queries
  const trackSearchQuery = (
    query: string,
    source: 'hero-form' | 'follow-up-form',
    context?: string
  ) => {
    if (!posthog || !query.trim()) return;
    
    const now = Date.now();
    const timeFromSessionStart = now - sessionStartTime.current;
    
    const searchEvent = {
      query: query.trim(),
      timestamp: now,
      timeFromSessionStart,
      source,
      context
    };
    
    searchQueries.current.push(searchEvent);
    
    posthog.capture('custom_question_searched', {
      search_query: query.trim(),
      query_length: query.trim().length,
      source,
      context,
      time_from_session_start_ms: timeFromSessionStart,
      total_searches_in_session: searchQueries.current.length,
      session_id: `personalized-${sessionStartTime.current}`,
      timestamp: new Date().toISOString(),
      user_authenticated: status === 'authenticated',
      grade_level: userData.selectedSchools?.[0]?.level || null,
      interests: userData.kidsInterests || [],
      current_section: viewedComponents[viewedComponents.length - 1] || null,
      sections_viewed: viewedComponents,
    });
    
    console.log(`📊 [PostHog] Search query tracked:`, searchEvent);
  };

  // Helper function to track section timing
  const trackSectionTiming = (sectionId: string) => {
    if (!posthog || !sectionStartTimes.current[sectionId]) return;
    
    const now = Date.now();
    const sectionDuration = now - sectionStartTimes.current[sectionId];
    
    posthog.capture('section_time_spent', {
      section_id: sectionId,
      duration_ms: sectionDuration,
      duration_seconds: Math.round(sectionDuration / 1000),
      session_id: `personalized-${sessionStartTime.current}`,
      timestamp: new Date().toISOString(),
      user_authenticated: status === 'authenticated',
      sections_viewed_before: viewedComponents.slice(0, viewedComponents.indexOf(sectionId)),
      total_sections_viewed: viewedComponents.length,
    });
    
    console.log(`📊 [PostHog] Section timing tracked:`, { sectionId, durationMs: sectionDuration });
  };

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
      
      // Track session end
      if (posthog) {
        const sessionDuration = Date.now() - sessionStartTime.current;
        posthog.capture('personalized_page_session_ended', {
          session_id: `personalized-${sessionStartTime.current}`,
          session_duration_ms: sessionDuration,
          session_duration_minutes: Math.round(sessionDuration / 60000),
          total_questions_clicked: questionInteractions.current.length,
          total_searches: searchQueries.current.length,
          sections_viewed: viewedComponents,
          unique_sections_viewed: new Set(viewedComponents).size,
          timestamp: new Date().toISOString(),
        });
      }
    };
  }, []);

  // Track all re-renders
  useEffect(() => {
    renderCount.current += 1;
    const timestamp = new Date().toISOString();
    const instanceId = componentId.current;
    
    if (renderCount.current > 1) {
      console.log(`🔄 [PersonalizedPage-${instanceId}] ${timestamp} RE-RENDER #${renderCount.current}`);
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
  });

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
      console.log(`🚨 [PersonalizedPage-${instanceId}] ${timestamp} USER NOT AUTHENTICATED - ALLOWING ACCESS WITH LOCAL DATA`);
      console.log(`📱 [PersonalizedPage-${instanceId}] ${timestamp} User can view personalized content based on localStorage quiz data`);
      // Allow unauthenticated users to view personalized content based on localStorage
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
      const savedViewed = localStorage.getItem('timebackViewedComponents');
      
      console.log(`📱 [PersonalizedPage-${instanceId}] LocalStorage items found:`, {
        hasSchool: !!savedSchool,
        schoolData: savedSchool ? savedSchool.substring(0, 100) + '...' : 'none',
        hasGrade: !!savedGrade,
        gradeData: savedGrade || 'none',
        hasInterests: !!savedInterests,
        interestsData: savedInterests ? savedInterests.substring(0, 100) + '...' : 'none',
        hasViewed: !!savedViewed
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

      // Restore viewed components list to persist page state across refresh
      if (savedViewed) {
        try {
          const parsedViewed = JSON.parse(savedViewed);
          if (Array.isArray(parsedViewed) && parsedViewed.length > 0) {
            console.log(`🧭 [PersonalizedPage-${instanceId}] Restoring viewed components from localStorage:`, parsedViewed);
            setViewedComponents(parsedViewed);
          }
        } catch (e) {
          console.error(`❌ [PersonalizedPage-${instanceId}] FAILED TO PARSE viewed components:`, e);
        }
      }
      
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
            
            // Handle generated content from database
            if (result.success && result.data?.generatedContent) {
              console.log(`🤖 [PersonalizedPage-${instanceId}] Generated content found in database:`, {
                hasContent: !!result.data.generatedContent,
                generatedAt: result.data.generatedContent.generatedAt,
                hasSubjectExamples: !!result.data.generatedContent.subjectExamples,
                hasAfternoonActivities: !!result.data.generatedContent.afternoonActivities,
                allCompleted: result.data.generatedContent.allCompleted
              });
              setGeneratedContent(result.data.generatedContent);
            } else {
              console.log(`📭 [PersonalizedPage-${instanceId}] No generated content found in database`);
              setGeneratedContent(null);
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

    // Persist viewed components so refresh keeps the same page
    try {
      localStorage.setItem('timebackViewedComponents', JSON.stringify(viewedComponents));
    } catch (e) {
      console.error(`❌ [PersonalizedPage-${instanceId}] Failed to persist viewedComponents:`, e);
    }
  }, [viewedComponents]);

  // Normalize instance-suffixed IDs back to their base section IDs
  const getBaseSectionId = (id: string): string => {
    return id && id.includes('__') ? id.split('__')[0] : id;
  };

  // Simplified section selection - just adds components to the page
  const handleSectionSelect = (sectionId: string, source: 'main-grid' | 'follow-up' | 'search-form' = 'main-grid') => {
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

    // Get question text for tracking
    const getQuestionText = (id: string): string => {
      const questionMap: Record<string, string> = {
        'what-is-timeback': 'What is TimeBack?',
        'how-does-it-work': 'How does it work?',
        'show-data': 'Show me your data',
        'completion-time-data': 'Learning Speed Data',
        'student-journey-carousel': 'Student Success Stories',
        'timeback-vs-competitors': 'Is Timeback a chatbot?',
        'example-question': 'Example Tailored Question',
        'extra-hours': 'Extra Hours Activities',
        'find-school': 'Find Nearby Schools',
        'school-report-card': 'School Report Cards',
        'custom-question': 'Custom Question',
        'methodology-whitepaper': 'Methodology Whitepaper'
      };
      const base = getBaseSectionId(id);
      return questionMap[base] || base;
    };

    // Track timing for previous section if we're switching
    if (viewedComponents.length > 0) {
      const currentSection = viewedComponents[viewedComponents.length - 1];
      if (currentSection !== sectionId) {
        trackSectionTiming(currentSection);
      }
    }

    // Track the question interaction with PostHog
    const previousSection = viewedComponents.length > 0 ? viewedComponents[viewedComponents.length - 1] : undefined;
    trackQuestionInteraction(sectionId, getQuestionText(sectionId), source, previousSection);
    
    // Determine whether to create a fresh instance (for duplicate selections from follow-up/search) or revisit
    const shouldCreateNewInstance = viewedComponents.includes(sectionId) && source !== 'main-grid';

    if (!viewedComponents.includes(sectionId) || shouldCreateNewInstance) {
      console.log(`➕ [PersonalizedPage-${instanceId}] ${timestamp} ADDING NEW COMPONENT TO PAGE`);
      const oldViewedComponents = [...viewedComponents];
      const newSectionId = !viewedComponents.includes(sectionId)
        ? sectionId
        : `${sectionId}__${Date.now()}`; // create a unique instance id for duplicate selections
      const newViewedComponents = [...viewedComponents, newSectionId];
      
      console.log(`📊 [PersonalizedPage-${instanceId}] Component list change:`, {
        before: oldViewedComponents,
        after: newViewedComponents,
        added: newSectionId,
        newTotal: newViewedComponents.length
      });
      
          setViewedComponents(newViewedComponents);
          
          // For most sections, they immediately have content (except custom-question which waits for user input)
          if (getBaseSectionId(newSectionId) !== 'custom-question') {
            setComponentsWithContent(prev => 
              prev.includes(newSectionId) ? prev : [...prev, newSectionId]
            );
            console.log(`📝 [PersonalizedPage-${instanceId}] Added "${newSectionId}" to componentsWithContent (predefined content)`);
          } else {
            console.log(`⏳ [PersonalizedPage-${instanceId}] "${newSectionId}" will be added to componentsWithContent after user generates content`);
          }
          
      console.log(`⏰ [PersonalizedPage-${instanceId}] Setting 300ms delay for scroll operation (increased for dynamic components)`);
      setTimeout(() => {
        const targetElementId = `viewed-component-${newSectionId}`;
        console.log(`📍 [PersonalizedPage-${instanceId}] ${new Date().toISOString()} INITIATING SCROLL to NEW element: ${targetElementId}`);
        console.log(`🎯 [PersonalizedPage-${instanceId}] Scroll parameters: offset=100, behavior=smooth`);
        
        try {
          smoothScrollToElement(targetElementId, 100, 'smooth', () => {
            console.log(`✅ [PersonalizedPage-${instanceId}] Scroll completed for: ${targetElementId}`);
          });
          console.log(`✅ [PersonalizedPage-${instanceId}] Scroll function called successfully`);
        } catch (scrollError) {
          console.error(`❌ [PersonalizedPage-${instanceId}] SCROLL ERROR:`, scrollError);
        }
      }, 300);
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

  // Mapping of section IDs to their corresponding questions for chat-tutor API with typewriter animations
  // Only include sections that should use typewriter animations, not ones with specialized components
  const sectionQuestionMapping: Record<string, string> = {
    // Keep this intentionally brief to avoid long blurbs
    'what-is-timeback': 'What is TimeBack? Answer briefly.',
    'how-does-it-work': 'How does TimeBack work? Explain the process and methodology step by step.'
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
    
    // Check if this is a predetermined section with typewriter animations
    const predeterminedQuestion = sectionQuestionMapping[sectionId];
    if (predeterminedQuestion) {
      console.log(`🎭 [PersonalizedPage-${instanceId}] Using typewriter animations for predetermined section: ${sectionId}`);
      return (
        <PredeterminedSection
          sectionId={sectionId}
          question={predeterminedQuestion}
          interests={userData.kidsInterests || []}
          gradeLevel={userData.selectedSchools?.[0]?.level || 'high school'}
        />
      );
    }

    switch (sectionId) {
      // Keep some sections that need special components
      case 'show-data': {
        return (
          <div className="max-w-7xl mx-auto">
            {/* Replace chart with whitepaper table view */}
            <div className="mb-16" id="viewed-component-methodology-whitepaper">
              <TimeBackWhitepaperViewer onLearnMore={() => {}} />
            </div>
          </div>
        );
      }

      case 'example-question':
        return <PersonalizedSubjectExamples 
          interests={userData.kidsInterests} 
          onLearnMore={() => {}}
          preGeneratedContent={generatedContent}
          contentReady={!!generatedContent}
          onInterestsChange={async (newInterests) => {
            const timestamp = new Date().toISOString();
            console.log(`[PersonalizedPage] ${timestamp} onInterestsChange received:`, newInterests);
            // Update local state
            setUserData(prev => ({ ...prev, kidsInterests: newInterests }));
            // Persist to localStorage for unauth flows
            try {
              localStorage.setItem('timebackUserInterests', JSON.stringify(newInterests));
            } catch (e) {
              console.error('[PersonalizedPage] Failed to save interests to localStorage:', e);
            }
            // Persist to backend if authenticated
            try {
              const res = await fetch('/api/quiz/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  quizData: { kidsInterests: newInterests },
                  partial: true
                })
              });
              console.log('[PersonalizedPage] Persist interests response:', res.status, res.statusText);
            } catch (e) {
              console.error('[PersonalizedPage] Failed to persist interests to backend:', e);
            }
          }}
        />;

      case 'find-school':
        // Use FindSchoolsNearMe for users without selected schools, ClosestSchools for users with quiz data
        const hasSelectedSchools = userData.selectedSchools && userData.selectedSchools.length > 0;
        
        if (hasSelectedSchools) {
          console.log('[PersonalizedPage] Rendering ClosestSchools - user has selected schools');
          return <ClosestSchools quizData={userData as QuizData} />;
        } else {
          console.log('[PersonalizedPage] Rendering FindSchoolsNearMe - user has no selected schools');
          return <FindSchoolsNearMe 
            onSchoolsFound={async (schoolData) => {
              console.log('[PersonalizedPage] Schools found via FindSchoolsNearMe:', schoolData);
              try {
                if (Array.isArray(schoolData) && schoolData.length > 0) {
                  // Persist first N as candidate selections; do not force-select
                  const topSchool = schoolData[0];
                  const selectedSchools = [
                    {
                      id: topSchool.id,
                      name: topSchool.name,
                      city: topSchool.city,
                      state: topSchool.state,
                      level: topSchool.level
                    }
                  ];
                  setUserData(prev => ({ ...prev, selectedSchools }));
                  localStorage.setItem('timebackUserSchool', JSON.stringify(selectedSchools));
                  // Persist city/state derived from school for location context
                  const quizData: any = {
                    selectedSchools,
                    locationCity: topSchool.city,
                    locationState: topSchool.state
                  };
                  await fetch('/api/quiz/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quizData, partial: true })
                  });
                }
              } catch (e) {
                console.error('[PersonalizedPage] Failed to persist schools/location:', e);
              }
            }}
            maxResults={10}
            className="w-full"
          />;
        }

      case 'extra-hours':
        return <AfternoonActivities 
          interests={userData.kidsInterests}
          onLearnMore={() => {}}
        />;

      case 'school-report-card':
        const school = userData.selectedSchools?.[0];
        return <SchoolReportCard 
          schoolData={school || undefined}
          onLearnMore={() => {}}
        />;

      case 'completion-time-data':
        return <CompletionTimeData onLearnMore={() => handleSectionSelect('methodology-whitepaper', 'follow-up')} />;

      case 'timeback-vs-competitors':
        return <TimeBackVsCompetitors onLearnMore={() => {}} />;

      case 'student-journey-carousel':
        return <VideoTestimonials tag="student" featuredOnly={false} limit={8} />;

      case 'video-testimonials':
        return <VideoTestimonials tag="parent" featuredOnly={false} limit={8} />;

      case 'custom-question':
        return <CustomQuestionSection 
          interests={userData.kidsInterests || []}
          gradeLevel={userData.selectedSchools?.[0]?.level || 'high school'}
        />;

      case 'methodology-whitepaper':
        return <TimeBackWhitepaperViewer onLearnMore={() => {}} />;

      default:
        // Handle AI-generated questions by calling the chat-tutor API like predefined questions
        if (sectionId.startsWith('ai-custom-') || sectionId.startsWith('ai-fallback-') || sectionId.startsWith('ai-loading-')) {
          // Find the original question text from our AI-generated questions
          const questionObj = aiGeneratedQuestions.find(q => q.id === sectionId);
          const questionText = questionObj?.text || sectionId.replace(/^ai-(custom|fallback|loading)-\d+$/, 'Custom personalized question');
          
          console.log(`🤖 [PersonalizedPage-${instanceId}] Rendering AI-generated question response for: "${questionText}"`);
          
          // Use the same CustomQuestionSection component that handles chat-tutor API calls
          return <CustomQuestionSection 
            interests={userData.kidsInterests || []}
            gradeLevel={userData.selectedSchools?.[0]?.level || 'high school'}
          />;
        }
        
        console.warn(`[PersonalizedPage] Unknown section ID: ${sectionId}`);
        return (
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 font-cal">
              <h2 className="text-4xl lg:text-6xl font-bold text-timeback-primary mb-8 font-cal">
                Content Coming Soon
              </h2>
              <p className="text-2xl text-timeback-primary max-w-5xl mx-auto font-cal leading-relaxed mb-8">
                This section is being prepared for you. Please try another section while we get this ready.
              </p>
            </div>
          </div>
        );
    }
  };

  // Generate AI-powered follow-up questions
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState<{ id: string; text: string; }[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  const generateAIQuestions = (): { id: string; text: string; }[] => {
    // If we already have generated questions, return them
    if (aiGeneratedQuestions.length >= 3) {
      return aiGeneratedQuestions.slice(0, 3);
    }
    
    // If we're currently generating, return fallback questions
    if (isGeneratingQuestions) {
      return [
        { id: 'ai-loading-1', text: 'Generating personalized question...' },
        { id: 'ai-loading-2', text: 'Creating tailored experience...' },
        { id: 'ai-loading-3', text: 'Preparing custom content...' }
      ];
    }
    
    // Generate questions asynchronously
    generatePersonalizedQuestions();
    
    // Return fallback questions while generating
    const fallbackQuestions = [
      "What specific concerns do you have about your child's education?",
      "How does TimeBack compare to your current school options?",
      "What activities would your child enjoy with extra time?"
    ];
    
    return fallbackQuestions.map((text, index) => ({
      id: `ai-fallback-${index + 1}`,
      text
    }));
  };

  const generatePersonalizedQuestions = async () => {
    if (isGeneratingQuestions || aiGeneratedQuestions.length >= 3) {
      return;
    }
    
    setIsGeneratingQuestions(true);
    
    try {
      const response = await fetch('/api/ai/generate-follow-up-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionId: 'initial-questions',
          sectionContent: {
            context: 'initial page load',
            purpose: 'generate personalized entry questions'
          },
          userContext: {
            interests: userData.kidsInterests || [],
            gradeLevel: userData.selectedSchools?.[0]?.level || 'elementary',
            parentType: userData.parentSubType || 'unknown',
            schoolCount: userData.selectedSchools?.length || 0
          },
          clickedQuestions: viewedComponents // Avoid questions similar to already viewed components
        }),
      });

      const data = await response.json();
      console.log('[generatePersonalizedQuestions] Generated questions:', data);
      
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        const formattedQuestions = data.questions.slice(0, 3).map((text: string, index: number) => ({
          id: `ai-custom-${index + 1}`,
          text
        }));
        setAiGeneratedQuestions(formattedQuestions);
      } else {
        // Fallback if API fails
        const fallbackQuestions = [
          "What specific concerns do you have about your child's education?",
          "How does TimeBack compare to your current school options?",
          "What activities would your child enjoy with extra time?"
        ].map((text, index) => ({
          id: `ai-fallback-${index + 1}`,
          text
        }));
        setAiGeneratedQuestions(fallbackQuestions);
      }
    } catch (error) {
      console.error('[generatePersonalizedQuestions] Error:', error);
      // Fallback questions on error
      const fallbackQuestions = [
        "What specific concerns do you have about your child's education?",
        "How does TimeBack compare to your current school options?", 
        "What activities would your child enjoy with extra time?"
      ].map((text, index) => ({
        id: `ai-fallback-${index + 1}`,
        text
      }));
      setAiGeneratedQuestions(fallbackQuestions);
    } finally {
      setIsGeneratingQuestions(false);
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
        { id: 'example-question', text: 'Show me an example question' }
      ],
      'how-does-it-work': [
        { id: 'show-data', text: 'Show me your data' },
        { id: 'example-question', text: 'Show me an example question' },
        { id: 'extra-hours', text: 'What will my kid do with extra time?' }
      ],
      'show-data': [
        { id: 'example-question', text: 'Show me an example question' },
        { id: 'find-school', text: 'Find Nearby Schools' },
        { id: 'extra-hours', text: 'What about the extra 6 hours?' }
      ],
      'example-question': [
        { id: 'find-school', text: 'Find Nearby Schools' },
        { id: 'extra-hours', text: 'What about the extra 6 hours?' },
        { id: 'how-does-it-work', text: 'How does the AI work?' }
      ],
      'find-school': [
        { id: 'show-data', text: 'Show me school performance data' },
        { id: 'example-question', text: 'Show me an example question' },
        { id: 'extra-hours', text: 'What about the extra 6 hours?' }
      ],
      'extra-hours': [
        { id: 'find-school', text: 'Find Nearby Schools' },
        { id: 'show-data', text: 'Show me your data' },
        { id: 'example-question', text: 'Show me an example question' }
      ],
      'school-report-card': [
        { id: 'find-school', text: 'Find Nearby Schools' },
        { id: 'completion-time-data', text: 'How fast do students learn?' },
        { id: 'student-journey-carousel', text: 'Show me student success stories' }
      ],
      'completion-time-data': [
        { id: 'student-journey-carousel', text: 'See student journeys' },
        { id: 'example-question', text: 'Show me example questions' },
        { id: 'extra-hours', text: 'What about the extra time?' }
      ],
      'timeback-vs-competitors': [
        { id: 'show-data', text: 'Show me the research data' },
        { id: 'video-testimonials', text: 'Hear from real families' },
        { id: 'find-school', text: 'Find Nearby Schools' }
      ],
      'student-journey-carousel': [
        { id: 'video-testimonials', text: 'Watch video testimonials' },
        { id: 'example-question', text: 'See personalized questions' },
        { id: 'find-school', text: 'Find Nearby Schools' }
      ],
      'video-testimonials': [
        { id: 'find-school', text: 'Find Nearby Schools' },
        { id: 'school-report-card', text: 'View school details' },
        { id: 'what-is-timeback', text: 'Learn about TimeBack' }
      ],
      'methodology-whitepaper': [
        { id: 'find-school', text: 'Find Nearby Schools' },
        { id: 'example-question', text: 'See personalized questions' },
        { id: 'video-testimonials', text: 'Watch parent testimonials' }
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
        viewedComponentsCount: viewedComponents.length,
        availableQuestionsDetail: availableQuestions.map(q => ({ id: q.id, text: q.text })),
        alreadyViewedDetail: alreadyViewedQuestions.map(q => ({ id: q.id, text: q.text }))
      });
      
      // Always try to return 3 questions
      let questionsToReturn = availableQuestions.slice(0, 3);
      
      // If we don't have enough available questions, reuse previously viewed ones to keep three total.
      if (questionsToReturn.length < 3) {
        console.log(`⚠️ [PersonalizedPage-${instanceId}] Not enough unviewed questions (${questionsToReturn.length}/3)`);
        const neededCount = 3 - questionsToReturn.length;
        const reusedQuestions = alreadyViewedQuestions.slice(0, neededCount);
        questionsToReturn = [...questionsToReturn, ...reusedQuestions];
        console.log(`♻️ [PersonalizedPage-${instanceId}] Reusing ${reusedQuestions.length} viewed questions to maintain 3 total`);
      }
      
      return questionsToReturn;
    } else {
      console.warn(`⚠️ [PersonalizedPage-${instanceId}] NO QUESTIONS DEFINED for section "${sectionId}"`);
      console.log(`📋 [PersonalizedPage-${instanceId}] Available sections with questions:`, Object.keys(questionMap));
      
      // Return default questions for sections without specific questions
      const defaultQuestions = [
        { id: 'what-is-timeback', text: 'What is TimeBack?' },
        { id: 'find-school', text: 'Find a school near me' },
        { id: 'show-data', text: 'Show me your data' }
      ];
      
      // Filter out already viewed default questions
      const availableDefaults = defaultQuestions.filter(q => !viewedComponents.includes(q.id));

      // Do NOT auto-generate with AI. Only show static defaults (up to 3).
      const staticOnly = availableDefaults.slice(0, 3);
      console.log(`🎯 [PersonalizedPage-${instanceId}] Using static default follow-up questions only (no AI):`, staticOnly);
      return staticOnly;
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

          </div>

          {/* Main exploration buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {(() => {
              // Create array of all button configs - ORDER IS HARDCODED AS REQUESTED
              const allButtons = [
                { id: 'what-is-timeback', text: 'What is TimeBack?', ariaLabel: 'Learn what TimeBack is and how it works' },
                { id: 'how-does-it-work', text: 'How does it work?', ariaLabel: "Understand how TimeBack's AI-powered learning system works" },
                { id: 'show-data', text: 'Show me your data', ariaLabel: "View TimeBack's research data and educational outcomes" },
                { id: 'completion-time-data', text: 'Learning Speed Data', ariaLabel: 'See how fast students complete different subjects' },
                { id: 'student-journey-carousel', text: 'Student Success Stories', ariaLabel: 'View success stories from students in your grade level' },
                { id: 'example-question', text: 'Example Tailored Question', ariaLabel: 'See a personalized example question for your child' },
                { id: 'extra-hours', text: 'Extra Hours Activities', ariaLabel: 'Learn what your child can do with their extra time' },
                { id: 'find-school', text: 'Find Nearby Schools', ariaLabel: 'Find TimeBack schools in your area' },
                { id: 'school-report-card', text: 'School Report Cards', ariaLabel: 'View detailed school comparison report cards' }
              ];

              // Use hardcoded order - NO RANDOMIZATION
              const orderedButtons = allButtons;
              
              return orderedButtons.map((button) => (
            <button
                  key={button.id}
                  onClick={() => handleSectionSelect(button.id, 'main-grid')}
                  className="backdrop-blur-md bg-white/10 border-2 border-timeback-primary rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
                  aria-label={button.ariaLabel}
                >
                  <h3 className="text-lg font-bold text-timeback-primary font-cal leading-tight">
                    {button.text}
              </h3>
            </button>
              ));
            })()}
          </div>

          {/* Custom Question Form */}
          <div className="rounded-2xl p-8 border-2 border-timeback-primary mb-8 shadow-2xl max-w-5xl mx-auto mt-12">
            <h2 className="text-3xl font-bold text-timeback-primary font-cal mb-4">
              Have a Specific Question?
            </h2>
            <p className="text-lg text-timeback-primary font-cal mb-6">
              Ask anything about TimeBack and get a personalized answer based on your child&apos;s needs.
            </p>
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const timestamp = new Date().toISOString();
              const formData = new FormData(e.currentTarget);
              const question = formData.get('question') as string;
              
              console.log(`🔍 [PersonalizedPage-HeroInput] ${timestamp} Hero form submitted:`, {
                question,
                questionLength: question?.length,
                trimmedQuestion: question?.trim(),
                isEmpty: !question || !question.trim()
              });
              
              if (question.trim()) {
                // Track the search query with PostHog
                trackSearchQuery(question, 'hero-form', 'Initial hero section search');
                
                // Track that user is engaging with custom search (before showing custom-question section)
                if (posthog) {
                  posthog.capture('hero_search_form_submitted', {
                    search_query: question.trim(),
                    query_length: question.trim().length,
                    session_id: `personalized-${sessionStartTime.current}`,
                    timestamp: new Date().toISOString(),
                    sections_viewed_before_search: viewedComponents,
                    user_authenticated: status === 'authenticated',
                    time_before_first_search_ms: Date.now() - sessionStartTime.current,
                  });
                }
                // Call AI API directly with the user's question
                try {
                  console.log('🚀 [PersonalizedPage-HeroInput] Calling AI API with question:', question);
                  const response = await fetch('/api/ai/chat-tutor', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      question: question,
                      interests: userData.kidsInterests || [],
                      responseFormat: 'schema',
                      gradeLevel: userData.selectedSchools?.[0]?.level || 'high-school',
                      messageHistory: [],
                      context: {
                        interests: userData.kidsInterests || [],
                        previousContent: 'User submitted custom question from hero form'
                      }
                    }),
                  });

                  const data = await response.json();
                  console.log('✅ [PersonalizedPage-HeroInput] AI API response:', data);
                  
                  if (data.success && data.responseFormat === 'schema') {
                    // Show the custom question section with the response
                    handleSectionSelect('custom-question', 'search-form');
                    // Store the response for the CustomQuestionSection to display
                    (window as any).heroQuestionResponse = data.response;
                    (window as any).heroQuestion = question;
                    
                    // Mark custom-question component as having generated content (enables follow-up questions)
                    setComponentsWithContent(prev => 
                      prev.includes('custom-question') ? prev : [...prev, 'custom-question']
                    );
                    
                    // Scroll to custom question section after a brief delay
                    setTimeout(() => {
                      const customSection = document.getElementById('questions-section');
                      if (customSection) {
                        customSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 100);
                  }
                } catch (error) {
                  console.error('❌ [PersonalizedPage-HeroInput] AI API error:', error);
                  // Still show the section even if there's an error
                  handleSectionSelect('custom-question', 'search-form');
                }
                
                // Clear the form
                (e.target as HTMLFormElement).reset();
              }
            }}>
              <textarea 
                name="question"
                placeholder="Ask me anything about TimeBack..." 
                className="w-full px-6 py-4 bg-timeback-bg/50 border-2 border-timeback-primary rounded-xl text-timeback-primary placeholder-timeback-primary/50 focus:ring-2 focus:ring-timeback-primary focus:border-transparent outline-none font-cal text-lg shadow-lg backdrop-blur-sm resize-none"
                rows={3}
                autoComplete="off"
              />
              <button
                type="submit" 
                className="w-full bg-timeback-primary text-white px-6 py-4 rounded-xl font-bold hover:bg-timeback-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl font-cal text-lg"
              >
                Get My Personalized Answer
              </button>
            </form>
            </div>

            {/* Embedded actions directly below the custom question input (no share button) */}
            {viewedComponents.length > 0 && (
              <div className="max-w-5xl mx-auto mt-4">
                <button
                  onClick={() => {
                    try {
                      localStorage.removeItem('timebackViewedComponents');
                      localStorage.removeItem('timebackUserInterests');
                      localStorage.removeItem('timebackUserSchool');
                      localStorage.removeItem('timebackUserGrade');
                    } catch {}
                    setViewedComponents([]);
                    setComponentsWithContent([]);
                    setUserData({ selectedSchools: [], kidsInterests: [], userType: 'parents', parentSubType: 'timeback-school' });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full px-6 py-3 border-2 border-timeback-primary text-timeback-primary rounded-xl font-bold hover:bg-timeback-bg transition-all font-cal shadow-md"
                >
                  Start Fresh
                </button>
              </div>
            )}
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
          
          const followUpQuestions = getFollowUpQuestions(getBaseSectionId(componentIdString));
          
          console.log(`🎯 [PersonalizedPage-${instanceId}] Follow-up questions for "${componentIdString}":`, {
            questionsCount: followUpQuestions.length,
            questions: followUpQuestions.map(q => ({ id: q.id, text: q.text })),
            hasQuestions: followUpQuestions.length > 0
          });
          
          // Check if component has actual content to show
          const hasActualContent = (() => {
            if (componentIdString === 'custom-question') {
              // For custom-question, only show section if it has generated responses
              const hasContent = componentsWithContent.includes(componentIdString);
              console.log(`🔍 [PersonalizedPage-${instanceId}] Custom question content check:`, {
                componentIdString,
                hasContent,
                componentsWithContent
              });
              return hasContent;
            }
            // For other components, they should always be able to render
            try {
              const testRender = renderComponent(componentIdString);
              const hasContent = testRender !== null && testRender !== undefined;
              console.log(`✅ [PersonalizedPage-${instanceId}] Component "${componentIdString}" content check:`, {
                hasContent,
                renderResult: hasContent ? 'valid' : 'null/undefined'
              });
              return hasContent;
            } catch (error) {
              console.error(`❌ [PersonalizedPage-${instanceId}] Component render test failed for "${componentIdString}":`, error);
              return false;
            }
          })();
          
          console.log(`✅ [PersonalizedPage-${instanceId}] Component content validation:`, {
            componentId: componentIdString,
            hasActualContent,
            componentsWithContent: componentsWithContent,
            renderAttempt: timestamp
          });
          
          // Don't render section if component has no actual content (only for custom-question)
          if (!hasActualContent && componentIdString === 'custom-question') {
            console.log(`🚫 [PersonalizedPage-${instanceId}] SKIPPING EMPTY CUSTOM-QUESTION SECTION - no generated content to display`);
            return null;
          }
          
          // For all other components, always render (they should have predefined content)
          if (!hasActualContent && componentIdString !== 'custom-question') {
            console.warn(`⚠️ [PersonalizedPage-${instanceId}] Component "${componentIdString}" has no content but will render anyway with fallback`);
          }
          
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
                {renderComponent(componentIdString)}
                
                {/* Combined Question Suggestions and Form Component - Hides after new content is generated */}
                {(() => {
                  // Only show if this is the last (most recent) component in the list
                  const isLastComponent = index === viewedComponents.length - 1;
                  
                  if (!isLastComponent) {
                    console.log(`🚫 [PersonalizedPage-${instanceId}] ${new Date().toISOString()} HIDING QUESTIONS SECTION - Not last component`, {
                      componentIndex: index,
                      totalComponents: viewedComponents.length,
                      isLast: isLastComponent
                    });
                    return null;
                  }
                  
                  console.log(`✅ [PersonalizedPage-${instanceId}] ${new Date().toISOString()} SHOWING QUESTIONS SECTION - Is last component`, {
                    componentIndex: index,
                    totalComponents: viewedComponents.length,
                    hasFollowUpQuestions: followUpQuestions.length > 0
                  });
                  
                  return (
                    <div className="mt-12">
                      {/* Follow-up questions - Only show after component has generated content */}
                      {followUpQuestions.length > 0 && componentsWithContent.includes(componentIdString) && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-5xl mx-auto">
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
                                  handleSectionSelect(question.id, 'follow-up');
                                }}
                                className="backdrop-blur-md bg-white/10 border-2 border-timeback-primary rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
                              >
                                <h3 className="text-lg font-bold text-timeback-primary font-cal leading-tight">
                                  {question.text}
                                </h3>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Have a Specific Question Form - Shows below the 3 follow-up questions */}
                      {followUpQuestions.length > 0 && componentsWithContent.includes(componentIdString) && (
                        <div className="rounded-2xl p-8 border-2 border-timeback-primary mb-8 shadow-2xl max-w-5xl mx-auto mt-12">
                          <h2 className="text-3xl font-bold text-timeback-primary font-cal mb-4">
                            Have a Specific Question?
                          </h2>
                          <p className="text-lg text-timeback-primary font-cal mb-6">
                            Ask anything about TimeBack and get a personalized answer based on your child&apos;s needs.
                          </p>
                          <form className="space-y-4" onSubmit={async (e) => {
                            e.preventDefault();
                            const timestamp = new Date().toISOString();
                            const formData = new FormData(e.currentTarget);
                            const question = formData.get('question') as string;
                            
                            console.log(`🔍 [PersonalizedPage-FollowUpForm] ${timestamp} Follow-up form submitted:`, {
                              question,
                              questionLength: question?.length,
                              trimmedQuestion: question?.trim(),
                              isEmpty: !question || !question.trim(),
                              sourceComponent: componentIdString
                            });
                            
                            if (question.trim()) {
                              // Track the search query with PostHog
                              trackSearchQuery(question, 'follow-up-form', `Follow-up search from ${componentIdString} section`);
                              
                              // Track follow-up form submission
                              if (posthog) {
                                posthog.capture('follow_up_search_form_submitted', {
                                  search_query: question.trim(),
                                  query_length: question.trim().length,
                                  source_section: componentIdString,
                                  session_id: `personalized-${sessionStartTime.current}`,
                                  timestamp: new Date().toISOString(),
                                  sections_viewed_before_search: viewedComponents,
                                  user_authenticated: status === 'authenticated',
                                  total_sections_viewed: viewedComponents.length,
                                });
                              }
                              
                              // Call AI API directly with the user's question
                              try {
                                console.log('🚀 [PersonalizedPage-FollowUpForm] Calling AI API with question:', question);
                                const response = await fetch('/api/ai/chat-tutor', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({
                                    question: question,
                                    interests: userData.kidsInterests || [],
                                    responseFormat: 'schema',
                                    gradeLevel: userData.selectedSchools?.[0]?.level || 'high-school',
                                    messageHistory: [],
                                    context: {
                                      interests: userData.kidsInterests || [],
                                      previousContent: `User submitted custom question from follow-up form after viewing ${componentIdString}`
                                    }
                                  }),
                                });

                                if (response.ok) {
                                  const result = await response.json();
                                  console.log('✅ [PersonalizedPage-FollowUpForm] AI API response received:', result);
                                  
                                  if (result.success && result.responseFormat === 'schema') {
                                    // Store the response for the CustomQuestionSection to display
                                    (window as any).followUpQuestionResponse = result.response;
                                    (window as any).followUpQuestion = question;
                                    
                                    // Show the custom question section with the response
                                    handleSectionSelect('custom-question', 'search-form');
                                    
                                    // Mark custom-question component as having generated content
                                    setComponentsWithContent(prev => 
                                      prev.includes('custom-question') ? prev : [...prev, 'custom-question']
                                    );
                                  }
                                  
                                  // Clear the form
                                  (e.target as HTMLFormElement).reset();
                                } else {
                                  console.error('❌ [PersonalizedPage-FollowUpForm] AI API error:', response.statusText);
                                }
                              } catch (error) {
                                console.error('💥 [PersonalizedPage-FollowUpForm] AI API call failed:', error);
                              }
                            }
                          }}>
                            <textarea
                              name="question"
                              placeholder="Ask me anything about TimeBack..."
                              className="w-full px-6 py-4 bg-timeback-bg/50 border-2 border-timeback-primary rounded-xl text-timeback-primary placeholder-timeback-primary/50 focus:ring-2 focus:ring-timeback-primary focus:border-transparent outline-none font-cal text-lg shadow-lg backdrop-blur-sm resize-none"
                              rows={3}
                              autoComplete="off"
                            />
                            <button
                              type="submit"
                              className="w-full bg-timeback-primary text-white px-6 py-4 rounded-xl font-bold hover:bg-timeback-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl font-cal text-lg"
                            >
                              Get My Personalized Answer
                            </button>
                          </form>
                        </div>
                      )}
                      
                      {/* Show message when no follow-up questions are available */}
                      {followUpQuestions.length === 0 && (
                        <div className="text-center mt-8">
                          <p className="text-timeback-primary text-sm font-cal opacity-70">
                            No follow-up questions available for this section
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
          </section>
          );
        })}

        {/* Bottom actions removed per request; actions are embedded below the custom question section. */}

      </main>
      <Footer />
    </>
  );
}