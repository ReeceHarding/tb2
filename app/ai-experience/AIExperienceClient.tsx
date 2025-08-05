'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePostHog } from 'posthog-js/react';
import { 
  MessageCircle, 
  X, 
  Brain,
  BarChart3,
  Clock,
  CheckCircle,
  School,
  Play,
  Target,
  BookOpen,
  TrendingUp,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PersonalizedSubjectExamples from '@/components/personalized/PersonalizedSubjectExamples';
import TimeBackVsCompetitors from '@/components/personalized/TimeBackVsCompetitors';
import SchoolSelectionModule from '@/components/ai-experience/SchoolSelectionModule';
import SubjectCompletionChart from '@/components/ai-experience/SubjectCompletionChart';
import MAPTestResults from '@/components/ai-experience/MAPTestResults';
import FollowUpQuestions from '@/components/ai-experience/FollowUpQuestions';
import AIChatbot from '@/components/ai-experience/AIChatbot';
import DailyLearningHours from '@/components/ai-experience/DailyLearningHours';
import LearningScienceExplanation from '@/components/ai-experience/LearningScienceExplanation';
import VideoTestimonials from '@/components/ai-experience/VideoTestimonials';
import SATUniversityResults from '@/components/ai-experience/SATUniversityResults';
import ActualStudyHoursChart from '@/components/ai-experience/ActualStudyHoursChart';

interface Section {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  question?: string;
  component?: React.ComponentType<any>;
}

export default function AIExperienceClient() {
  const posthog = usePostHog();
  const [userData, setUserData] = useState({
    name: '', // Will be populated from Google auth if needed
    childGrade: '',
    school: null as any,
    interests: [] as string[],
    mainConcerns: [] as string[],
  });
  
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [showChatbot, setShowChatbot] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  const scrollRefs = useRef<(HTMLDivElement | null)[]>([]);

  const sections: Section[] = [
    {
      id: 'welcome',
      title: 'Welcome to Your Personalized Journey',
      description: 'Let\'s explore how TimeBack can help your child reach the 98th percentile',
      icon: Brain,
      // No question needed since we're showing the self-tailoring website intro
    },
    {
      id: 'school-selection',
      title: 'School Comparison',
      description: 'See how your school&apos;s performance compares',
      icon: School,
      question: 'Which school does your child attend?',
      component: SchoolSelectionModule,
    },
    {
      id: 'test-results',
      title: 'Real MAP Test Results - Spring 2024',
      description: 'Actual data from Alpha School students showing 99th percentile achievement',
      icon: TrendingUp,
      component: MAPTestResults,
    },
    {
      id: 'time-comparison',
      title: 'Actual Learning Time Data',
      description: 'Real hours tracked from 500+ TimeBack students in 2023-24',
      icon: Clock,
      component: SubjectCompletionChart,
    },
    {
      id: 'daily-schedule',
      title: 'Daily Learning Schedule',
      description: 'Average daily study hours from our students (2023-24 school year)',
      icon: BarChart3,
      component: DailyLearningHours,
    },
    {
      id: 'hours-data',
      title: 'Actual Hours Data - Full School Year',
      description: 'Real tracking data from 500+ students showing daily study time',
      icon: BarChart3,
      component: ActualStudyHoursChart,
    },
    {
      id: 'subject-examples',
      title: 'Personalized Learning Examples',
      description: 'Real examples from your child&apos;s grade level',
      icon: BookOpen,
      component: PersonalizedSubjectExamples,
    },
    {
      id: 'competitors',
      title: 'Compare Educational Approaches',
      description: 'See how TimeBack differs from other options',
      icon: Target,
      component: TimeBackVsCompetitors,
    },
    {
      id: 'high-school',
      title: 'High School & College Results',
      description: 'Real SAT scores and university admissions data',
      icon: Award,
      component: SATUniversityResults,
    },
    {
      id: 'science',
      title: 'The Science Behind TimeBack',
      description: 'Research-backed methodology',
      icon: Brain,
      component: LearningScienceExplanation,
    },
    {
      id: 'testimonials',
      title: 'Success Stories',
      description: 'Hear from parents like you',
      icon: Play,
      component: VideoTestimonials,
    },
  ];

  useEffect(() => {
    posthog?.capture('ai_experience_page_view');
  }, [posthog]);

  useEffect(() => {
    if (currentSection > 0 && scrollRefs.current[currentSection]) {
      scrollRefs.current[currentSection]?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [currentSection]);

  const handleStart = () => {
    // Since we get the name from Google auth, we don't need to collect it here
    console.log('[AIExperience] Starting personalized journey');
    setHasStarted(true);
    setCurrentSection(1);
    setCompletedSections(new Set([0]));
    posthog?.capture('ai_experience_started');
  };

  const handleSchoolSelect = (school: any) => {
    setUserData(prev => ({ ...prev, school }));
    setCompletedSections(prev => new Set(Array.from(prev).concat(1)));
    setCurrentSection(2);
    posthog?.capture('school_selected', { 
      school_name: school.name,
      school_city: school.city,
      school_state: school.state
    });
  };

  const handleNextSection = () => {
    if (currentSection < sections.length - 1) {
      setCompletedSections(prev => new Set(Array.from(prev).concat(currentSection)));
      setCurrentSection(prev => prev + 1);
      
      // Scroll to next section after a short delay to allow render
      setTimeout(() => {
        if (scrollRefs.current[currentSection + 1]) {
          scrollRefs.current[currentSection + 1]?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
      
      posthog?.capture('section_advanced', { 
        from_section: sections[currentSection].id,
        to_section: sections[currentSection + 1].id
      });
    }
  };

  const renderSection = (section: Section, index: number) => {
    const Icon = section.icon;
    const Component = section.component;
    const isActive = index <= currentSection;
    const isCompleted = completedSections.has(index);
    const isVisible = index <= currentSection;

    // Don't render sections that haven't been reached yet
    if (!isVisible) return null;

    return (
      <div
        key={section.id}
        ref={el => { scrollRefs.current[index] = el; }}
        className={cn(
          "min-h-[60vh] py-12 transition-all duration-500",
          index === currentSection ? "animate-revealSection" : "animate-fadeIn"
        )}
      >
        <div className="max-w-4xl mx-auto px-4">
          {/* Section Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
              isCompleted ? "bg-timeback-primary" : isActive ? "bg-timeback-bg" : "bg-timeback-bg"
            )}>
              {isCompleted ? (
                <CheckCircle className="w-6 h-6 text-white font-cal" />
              ) : (
                <Icon className={cn(
                  "w-6 h-6",
                  isActive ? "text-timeback-primary" : "text-timeback-primary"
                )} />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-timeback-primary font-cal">{section.title}</h2>
              <p className="text-timeback-primary font-cal">{section.description}</p>
            </div>
          </div>

          {/* Section Content */}
          {index === 0 && !hasStarted ? (
            <div className="flex flex-col items-center justify-center text-center font-cal">
              {/* Self-Tailoring Website Intro */}
              <div className="mb-16 space-y-8">
                {/* Badge for credibility */}
                <div className="inline-flex items-center px-4 py-2 bg-timeback-primary border border-timeback-primary rounded-full mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-white mr-2"></span>
                  <span className="text-sm font-medium text-white font-cal">AI-Powered Educational Innovation</span>
                </div>

                {/* Main heading */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight font-cal">
                  <span className="text-timeback-primary font-cal">
                    The World{"'"}s First
                  </span>
                  <br />
                  <span className="text-timeback-primary font-cal">
                    Self-Tailoring Website
                  </span>
                </h1>

                {/* Enhanced description */}
                <div className="space-y-4 max-w-3xl mx-auto">
                  <p className="text-xl sm:text-2xl text-timeback-primary font-medium leading-relaxed font-cal">
                    Experience education that adapts to you
                  </p>
                  <p className="text-lg text-timeback-primary leading-relaxed font-cal">
                    Just like TimeBack creates personalized learning questions tailored to each student{`'`}s interests and level, we{`'`}ll generate a website experience customized specifically for you.
                  </p>
                </div>
              </div>

              {/* CTA button */}
              <button
                onClick={handleStart}
                className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-semibold bg-timeback-primary hover:bg-timeback-primary text-white rounded-xl shadow-2xl hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-timeback-bg font-cal"
              >
                <span className="mr-2">Get Started Now</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          ) : Component ? (
            <div className="space-y-6">
              {section.id === 'school-selection' ? (
                <Component onSchoolSelect={handleSchoolSelect} />
              ) : section.id === 'test-results' ? (
                <Component 
                  schoolName={userData.school?.name}
                  selectedGrade={userData.childGrade}
                />
              ) : section.id === 'subject-examples' ? (
                <Component 
                  interests={userData.interests}
                  onLearnMore={() => {}}
                  preGeneratedContent={null}
                />
              ) : section.id === 'competitors' ? (
                <Component 
                  section={section}
                  school={userData.school}
                />
              ) : (
                <Component gradeLevel={userData.childGrade} />
              )}
              
              {/* Follow-up Questions */}
              {isActive && index > 0 && (
                <FollowUpQuestions 
                  sectionId={section.id}
                  context={userData}
                />
              )}
              
              {/* Continue Button for sections without explicit actions */}
              {isActive && index === currentSection && index < sections.length - 1 && 
               section.id !== 'welcome' && section.id !== 'school-selection' && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleNextSection}
                    className="px-8 py-3 bg-timeback-primary text-white rounded-xl hover:bg-timeback-primary transition-colors flex items-center gap-2 shadow-2xl font-cal"
                  >
                    Continue to Next Section
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-timeback-primary">
        <div className="h-1 bg-timeback-bg">
          <div 
            className="h-full bg-timeback-primary transition-all duration-500"
            style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-8">
        {/* Real Data Badge */}
        {hasStarted && (
          <div className="max-w-4xl mx-auto px-4 mb-8">
            <div className="bg-timeback-primary border border-timeback-primary rounded-xl p-4 flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-timeback-primary font-cal" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1 font-cal">All Data is Real</h3>
                <p className="text-sm text-white font-cal">
                  Every statistic, chart, and result shown is from actual TimeBack students in the 2023-24 school year.
                  No simulations or projections - just real student outcomes from Alpha School.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {sections.map((section, index) => renderSection(section, index))}
      </div>

      {/* Floating Chatbot Button */}
      <button
        onClick={() => setShowChatbot(!showChatbot)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-timeback-primary text-white rounded-full shadow-2xl hover:bg-timeback-primary transition-colors flex items-center justify-center z-50 font-cal"
      >
        {showChatbot ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Chatbot Panel */}
      {showChatbot && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-xl shadow-2xl z-50 overflow-hidden">
          <AIChatbot 
            userData={userData}
            onClose={() => setShowChatbot(false)}
          />
        </div>
      )}
    </div>
  );
}