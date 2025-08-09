'use client';

import React, { useState, useEffect } from 'react';
import { AnimatedHeading } from '@/components/AnimatedHeading';

// Fast AnimatedHeading configurations - all animations complete in under 2 seconds
const fastAnimationConfig = {
  typingSpeed: 15,
  deletingSpeed: 10,
  pauseDuration: 300
};

interface AfternoonActivitiesProps {
  interests: string[];
  quizData?: any;
  onLearnMore: (_section: string) => void;
  preGeneratedContent?: any;
  contentReady?: boolean;
}

interface ActivityContent {
  activity: string;
  description: string;
  timeRequired: string;
}

interface AfternoonContent {
  mainTitle: string;
  subtitle: string;
  secondaryInterestsText?: string;
  specificActivities: ActivityContent[];
  passionProjectName: string;
  passionDeepDive: {
    title: string;
    description: string;
    progression: string;
  };
  timeComparisonCustom: {
    traditional: string;
    timeback: string;
  };
}

interface TimeSlot {
  time: string;
  activity: string;
  description: string;
  slotType: 'morning' | 'learning' | 'completed' | 'interest' | 'social' | 'evening';
  isHighlight: boolean;
}



// PersonalizedDailyTimeline component - shows "The Liberated Life" timeline
export function PersonalizedDailyTimeline({ interests, quizData, onLearnMore, preGeneratedContent, contentReady = true }: AfternoonActivitiesProps) {
  console.log('[PersonalizedDailyTimeline] Rendering with interests:', interests);
  console.log('[PersonalizedDailyTimeline] Pre-generated content available:', !!preGeneratedContent);

  const primaryInterest = interests[0] || 'Reading';
  const grade = quizData?.selectedSchools?.[0]?.level || 'elementary';

  // Default timeline structure that will be personalized by AI
  const defaultTimeSlots: TimeSlot[] = [
    { time: '8:00 AM', activity: 'Relaxed Morning', description: 'No rush, healthy breakfast', slotType: 'morning', isHighlight: false },
    { time: '9:00 AM', activity: 'Focused Learning', description: 'AI-powered, personalized pace', slotType: 'learning', isHighlight: false },
    { time: '11:00 AM', activity: 'Done with School!', description: 'Entire day accomplished', slotType: 'completed', isHighlight: true },
    { time: '11:30 AM', activity: 'Reading Excellence Academy', description: '2-3 hours of focused practice', slotType: 'interest', isHighlight: false },
    { time: '2:30 PM', activity: `${primaryInterest} Projects`, description: 'Build, create, experiment', slotType: 'interest', isHighlight: false },
    { time: '4:00 PM', activity: 'Social & Physical', description: 'Friends, sports, activities', slotType: 'social', isHighlight: false },
    { time: '6:00 PM', activity: 'Family Time', description: 'Real connection, no stress', slotType: 'social', isHighlight: false },
    { time: '8:00 PM', activity: `Evening ${primaryInterest}`, description: `More time for ${primaryInterest}`, slotType: 'evening', isHighlight: false }
  ];

  // Use generated content if available, otherwise use default
  const timeSlots = preGeneratedContent?.timeSlots || defaultTimeSlots;
  const title = preGeneratedContent?.title || 'The Liberated Life';
  const totalFreeHours = preGeneratedContent?.totalFreeHours || '8+ Hours';

  // Fast animations

  return (
    <div className="backdrop-blur-md bg-gradient-to-b from-timeback-bg/20 to-timeback-bg/10 rounded-3xl p-6 lg:p-8 border border-timeback-primary/30 shadow-lg">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-timeback-bg text-timeback-primary px-4 py-2 rounded-full text-sm font-semibold mb-3">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
          </svg>
          TIMEBACK STUDENT
        </div>
        <h4 className="text-xl font-cal font-bold text-timeback-primary">{title}</h4>
      </div>

      <div className="space-y-3">
        {timeSlots.map((slot: TimeSlot, index: number) => (
          <div key={index} className="flex items-start gap-3">
            <div className="text-sm font-cal font-bold text-timeback-primary w-16 flex-shrink-0 pt-1">
              {slot.time}
            </div>
            <div className={`flex-1 rounded-xl p-3 ${
              slot.slotType === 'completed' 
                ? 'bg-timeback-primary text-white' 
                : slot.slotType === 'learning'
                ? 'bg-timeback-bg/50 border-2 border-timeback-primary/30'
                : slot.slotType === 'interest'
                ? 'bg-timeback-bg/40 border-2 border-timeback-primary/50 shadow-md'
                : 'bg-timeback-bg/30'
            }`}>
              <div className={`font-cal font-semibold text-sm ${
                slot.slotType === 'completed' ? 'text-white' : 'text-timeback-primary'
              }`}>
                {slot.activity}
              </div>
              <div className={`text-xs leading-relaxed ${
                slot.slotType === 'completed' ? 'text-white/90' : 'text-timeback-primary/80'
              }`}>
                {slot.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center bg-timeback-bg/30 rounded-2xl p-6">
        <div className="text-3xl lg:text-4xl font-cal font-bold text-timeback-primary mb-1">
          {totalFreeHours} for Life
        </div>
        <div className="text-timeback-primary/80 font-medium">Every. Single. Day.</div>
      </div>

      {/* Learn More button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => onLearnMore('personalized-daily-timeline')}
          className="bg-timeback-primary text-white px-6 py-3 rounded-xl font-cal font-semibold hover:bg-timeback-primary/90 transition-colors"
        >
          Personalize My Schedule
        </button>
      </div>
    </div>
  );
}

export default function AfternoonActivities({ interests, quizData, onLearnMore, preGeneratedContent, contentReady = true }: AfternoonActivitiesProps) {
  console.log('[AfternoonActivities] Rendering with interests:', interests);
  console.log('[AfternoonActivities] Pre-generated content available:', !!preGeneratedContent);

  const primaryInterest = interests[0] || 'their passions';
  
  // State for AI-generated content
  const [content, setContent] = useState<AfternoonContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fast animations that complete in under 2 seconds total

  // Use pre-generated content or generate on component mount
  useEffect(() => {
    const timestamp = new Date().toISOString();
    
    // Check for pre-generated afternoon activities content
    if (preGeneratedContent?.afternoonActivities) {
      console.log(`[AfternoonActivities] ${timestamp} Using pre-generated content`);
      setContent(preGeneratedContent.afternoonActivities);
      setIsLoading(false);
      setError(null);
      return;
    }

    // If contentReady is true but no pre-generated content, use fallback immediately
    if (contentReady) {
      console.log(`[AfternoonActivities] ${timestamp} Content ready but no pre-generated content, using fallback immediately`);
      setContent({
        mainTitle: `In the Afternoons, They Can Focus on ${primaryInterest}`,
        subtitle: `With 5-6 hours saved daily, they can truly master ${primaryInterest} and explore related activities.`,
        secondaryInterestsText: interests.length > 1 ? `They'll also have time for their other interests: ${interests.slice(1).join(', ')}` : '',
        specificActivities: [
          {
            activity: `Advanced ${primaryInterest} practice`,
            description: 'Dedicated time for skill development and mastery',
            timeRequired: '2 hours'
          },
          {
            activity: 'Creative projects',
            description: 'Personal projects that combine learning with passion',
            timeRequired: '1-2 hours'
          },
          {
            activity: 'Real world application',
            description: 'Applying skills in practical, meaningful ways',
            timeRequired: '1 hour'
          },
          {
            activity: 'Exploration and discovery',
            description: 'Time to explore new aspects of their interests',
            timeRequired: '1 hour'
          }
        ],
        passionProjectName: `${primaryInterest} Excellence Academy`,
        passionDeepDive: {
          title: `Mastering ${primaryInterest}`,
          description: `With consistent daily practice and exploration, they can develop real expertise in ${primaryInterest}.`,
          progression: 'From beginner curiosity to advanced skills and creative expression.'
        },
        timeComparisonCustom: {
          traditional: '6-8 hours in school + 2-3 hours homework = 1-2 hours for passions',
          timeback: '2 hours academics + done with learning = 5-6 hours for passions'
        }
      });
      setIsLoading(false);
      setError(null);
      return;
    }

    console.log(`[AfternoonActivities] ${timestamp} No pre-generated content, generating on-demand`);

    const generateContent = async () => {
      console.log('[AfternoonActivities] Generating personalized content');
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/ai/generate-afternoon-content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            interests,
            quizData
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          console.log('[AfternoonActivities] Content generated successfully:', data.content);
          console.log('[AfternoonActivities] Passion project name from API:', data.content?.passionProjectName);
          console.log('[AfternoonActivities] Fallback flag:', data.fallback);
          console.log('[AfternoonActivities] Using LLM generation:', !data.fallback);
          setContent(data.content);
        } else {
          throw new Error('Failed to generate content');
        }
      } catch (err) {
        console.error('[AfternoonActivities] Error generating content:', err);
        setError('Failed to generate personalized content');
        
        // Set fallback content
        console.log('[AfternoonActivities] Using component-level fallback for primary interest:', primaryInterest);
        setContent({
          mainTitle: `In the Afternoons, They Can Focus on ${primaryInterest}`,
          subtitle: `With 5-6 hours saved daily, they can truly master ${primaryInterest} and explore related activities.`,
          secondaryInterestsText: interests.length > 1 ? `They'll also have time for their other interests: ${interests.slice(1).join(', ')}` : '',
          specificActivities: [
            {
              activity: `Advanced ${primaryInterest} practice`,
              description: 'Dedicated time for skill development and mastery',
              timeRequired: '2 hours'
            },
            {
              activity: 'Creative projects',
              description: 'Personal projects that combine learning with passion',
              timeRequired: '1-2 hours'
            },
            {
              activity: 'Real world application',
              description: 'Applying skills in practical, meaningful ways',
              timeRequired: '1 hour'
            },
            {
              activity: 'Exploration and discovery',
              description: 'Time to explore new aspects of their interests',
              timeRequired: '1 hour'
            }
          ],
          passionProjectName: `${primaryInterest} Excellence Academy`,
          passionDeepDive: {
            title: `Mastering ${primaryInterest}`,
            description: `With consistent daily practice and exploration, they can develop real expertise in ${primaryInterest}.`,
            progression: 'From beginner curiosity to advanced skills and creative expression.'
          },
          timeComparisonCustom: {
            traditional: '6-8 hours in school + 2-3 hours homework = 1-2 hours for passions',
            timeback: '2 hours academics + done with learning = 5-6 hours for passions'
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    generateContent();
  }, [interests, quizData, primaryInterest, preGeneratedContent, contentReady]);

  // Loading state
  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto  py-20 lg:py-32 px-6 lg:px-12">
        <div className="text-center font-cal">
          <div className="backdrop-blur-md bg-white/10 rounded-2xl border-2 border-timeback-primary p-12 shadow-2xl max-w-md mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-timeback-bg border border-timeback-primary rounded-xl w-3/4 mx-auto mb-6"></div>
              <div className="h-6 bg-timeback-bg border border-timeback-primary rounded-xl w-1/2 mx-auto mb-8"></div>
            </div>
            <div className="w-16 h-16 border-4 border-timeback-bg border-t-timeback-primary rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-timeback-primary font-cal text-xl font-bold">Generating personalized afternoon activities for {primaryInterest}...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state (should not normally happen due to fallback)
  if (error && !content) {
    return (
      <section className="max-w-7xl mx-auto py-20 lg:py-32 px-6 lg:px-12">
        <div className="text-center font-cal">
          <div className="backdrop-blur-md bg-white/10 rounded-2xl border-2 border-timeback-primary p-12 shadow-2xl max-w-md mx-auto">
            <p className="text-timeback-primary font-cal text-xl font-bold">Unable to generate personalized content. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  // Main content (either AI-generated or fallback)
  if (!content) return null;

  return (
    <div className="backdrop-blur-md bg-white/15 rounded-3xl border border-timeback-primary/30 shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500">
      <div className="relative bg-gradient-to-r from-timeback-primary to-timeback-primary/90 p-6 lg:p-8">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
        <div className="relative flex items-center justify-center gap-3">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
          <h3 className="text-lg lg:text-xl font-bold text-white text-center font-cal">Your Child Gets Time Back</h3>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="p-6 lg:p-8">
        <section className="w-full font-cal animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Header Section */}
          <header className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-timeback-bg/10 border border-timeback-primary/20 rounded-full px-5 py-2 mb-6">
              <div className="w-2 h-2 bg-timeback-primary rounded-full"></div>
              <span className="text-timeback-primary font-cal font-semibold text-sm tracking-wide">TIME FREEDOM</span>
            </div>
            <AnimatedHeading 
              staticText="Finally, Your Child Gets Their"
              animatedMessages={["Time Back", "Freedom", "Life Back"]}
              className="mb-6"
              staticTextClassName=""
              animatedTextClassName=""
              typingSpeed={fastAnimationConfig.typingSpeed}
              deletingSpeed={fastAnimationConfig.deletingSpeed}
              pauseDuration={fastAnimationConfig.pauseDuration}
              oneTime={true}
            />
            <p className="text-xl lg:text-2xl text-timeback-primary/90 max-w-4xl mx-auto leading-relaxed">
              Traditional school steals 12 years of childhood. TimeBack gives it back.
            </p>
          </header>

      {/* Daily Schedule Comparison */}
      <div className="mb-20">
        <h3 className="text-2xl lg:text-3xl font-cal font-bold text-center text-timeback-primary mb-12">A Day in the Life</h3>
        
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {/* Traditional School Schedule */}
          <div className="bg-gradient-to-b from-red-50/50 to-red-100/30 rounded-3xl p-6 lg:p-8 border border-red-200/50 shadow-lg">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold mb-3">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Traditional School
              </div>
              <h4 className="text-xl font-cal font-bold text-red-800">The Exhausting Reality</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="text-sm font-cal font-bold text-red-700 w-16 flex-shrink-0 pt-1">7:00 AM</div>
                <div className="flex-1 bg-red-100/70 rounded-xl p-3">
                  <div className="font-cal font-semibold text-red-800 text-sm">Wake Up & Rush</div>
                  <div className="text-red-700 text-xs leading-relaxed">Get ready, breakfast, commute</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="text-sm font-cal font-bold text-red-700 w-16 flex-shrink-0 pt-1">8:00 AM</div>
                <div className="flex-1 bg-red-200/70 rounded-xl p-3">
                  <div className="font-cal font-semibold text-red-800 text-sm">School Begins</div>
                  <div className="text-red-700 text-xs leading-relaxed">Sitting in class, waiting for others</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="text-sm font-cal font-bold text-red-700 w-16 flex-shrink-0 pt-1">12:00 PM</div>
                <div className="flex-1 bg-red-200/70 rounded-xl p-3">
                  <div className="font-cal font-semibold text-red-800 text-sm">More School</div>
                  <div className="text-red-700 text-xs leading-relaxed">Busy work, more waiting</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="text-sm font-cal font-bold text-red-700 w-16 flex-shrink-0 pt-1">3:30 PM</div>
                <div className="flex-1 bg-red-100/70 rounded-xl p-3">
                  <div className="font-cal font-semibold text-red-800 text-sm">Finally Home</div>
                  <div className="text-red-700 text-xs leading-relaxed">Exhausted from the day</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="text-sm font-cal font-bold text-red-700 w-16 flex-shrink-0 pt-1">4:00 PM</div>
                <div className="flex-1 bg-red-200/70 rounded-xl p-3">
                  <div className="font-cal font-semibold text-red-800 text-sm">Homework</div>
                  <div className="text-red-700 text-xs leading-relaxed">2-3 hours of repetitive tasks</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="text-sm font-cal font-bold text-red-700 w-16 flex-shrink-0 pt-1">7:00 PM</div>
                <div className="flex-1 bg-red-100/70 rounded-xl p-3">
                  <div className="font-cal font-semibold text-red-800 text-sm">Dinner & Chores</div>
                  <div className="text-red-700 text-xs leading-relaxed">Family time squeezed in</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="text-sm font-cal font-bold text-red-700 w-16 flex-shrink-0 pt-1">8:30 PM</div>
                <div className="flex-1 bg-yellow-100 border-2 border-yellow-400 rounded-xl p-3">
                  <div className="font-cal font-semibold text-yellow-800 text-sm">Maybe 1 Hour Free</div>
                  <div className="text-yellow-700 text-xs leading-relaxed">If lucky, pursue {primaryInterest}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="text-sm font-cal font-bold text-red-700 w-16 flex-shrink-0 pt-1">9:30 PM</div>
                <div className="flex-1 bg-red-100/70 rounded-xl p-3">
                  <div className="font-cal font-semibold text-red-800 text-sm">Bedtime</div>
                  <div className="text-red-700 text-xs leading-relaxed">Repeat tomorrow</div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center bg-red-200/50 rounded-2xl p-6">
              <div className="text-3xl lg:text-4xl font-cal font-bold text-red-800 mb-1">10+ Hours Wasted</div>
              <div className="text-red-700 font-medium">Every. Single. Day.</div>
            </div>
          </div>
          
          {/* TimeBack Schedule */}
          <div className="bg-gradient-to-b from-timeback-bg/20 to-timeback-bg/10 rounded-3xl p-6 lg:p-8 border border-timeback-primary/30 shadow-lg">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-timeback-bg text-timeback-primary px-4 py-2 rounded-full text-sm font-semibold mb-3">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                TimeBack Student
              </div>
              <h4 className="text-xl font-cal font-bold text-timeback-primary">The Liberated Life</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="text-sm font-cal font-bold text-timeback-primary w-16 flex-shrink-0 pt-1">8:00 AM</div>
                <div className="flex-1 bg-timeback-bg/30 rounded-xl p-3">
                  <div className="font-cal font-semibold text-timeback-primary text-sm">Relaxed Morning</div>
                  <div className="text-timeback-primary/80 text-xs leading-relaxed">No rush, healthy breakfast</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="text-sm font-cal font-bold text-timeback-primary w-16 flex-shrink-0 pt-1">9:00 AM</div>
                <div className="flex-1 bg-timeback-bg/50 border-2 border-timeback-primary/30 rounded-xl p-3">
                  <div className="font-cal font-semibold text-timeback-primary text-sm">Focused Learning</div>
                  <div className="text-timeback-primary/80 text-xs leading-relaxed">AI-powered, personalized pace</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="text-sm font-cal font-bold text-white w-16 flex-shrink-0 pt-1">11:00 AM</div>
                <div className="flex-1 bg-timeback-primary rounded-xl p-3">
                  <div className="font-cal font-semibold text-white text-sm">Done with School!</div>
                  <div className="text-white/90 text-xs leading-relaxed">Entire day accomplished</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="text-sm font-cal font-bold text-timeback-primary w-16 flex-shrink-0 pt-1">11:30 AM</div>
                <div className="flex-1 bg-timeback-bg/40 border-2 border-timeback-primary/50 rounded-xl p-3 shadow-md">
                  <div className="font-cal font-semibold text-timeback-primary text-sm">{content?.passionProjectName || `${primaryInterest} Deep Dive`}</div>
                  <div className="text-timeback-primary/80 text-xs leading-relaxed">2-3 hours of focused practice</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="text-sm font-cal font-bold text-timeback-primary w-16 flex-shrink-0 pt-1">2:30 PM</div>
                <div className="flex-1 bg-timeback-bg/30 rounded-xl p-3">
                  <div className="font-cal font-semibold text-timeback-primary text-sm">Creative Projects</div>
                  <div className="text-timeback-primary/80 text-xs leading-relaxed">Build, create, experiment</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="text-sm font-cal font-bold text-timeback-primary w-16 flex-shrink-0 pt-1">4:00 PM</div>
                <div className="flex-1 bg-timeback-bg/30 rounded-xl p-3">
                  <div className="font-cal font-semibold text-timeback-primary text-sm">Social & Physical</div>
                  <div className="text-timeback-primary/80 text-xs leading-relaxed">Friends, sports, activities</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="text-sm font-cal font-bold text-timeback-primary w-16 flex-shrink-0 pt-1">6:00 PM</div>
                <div className="flex-1 bg-timeback-bg/30 rounded-xl p-3">
                  <div className="font-cal font-semibold text-timeback-primary text-sm">Family Time</div>
                  <div className="text-timeback-primary/80 text-xs leading-relaxed">Real connection, no stress</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="text-sm font-cal font-bold text-timeback-primary w-16 flex-shrink-0 pt-1">8:00 PM</div>
                <div className="flex-1 bg-timeback-bg/30 rounded-xl p-3">
                  <div className="font-cal font-semibold text-timeback-primary text-sm">Evening Interests</div>
                  <div className="text-timeback-primary/80 text-xs leading-relaxed">More time for {primaryInterest}</div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center bg-timeback-bg/30 rounded-2xl p-6">
              <div className="text-3xl lg:text-4xl font-cal font-bold text-timeback-primary mb-1">8+ Hours for Life</div>
              <div className="text-timeback-primary/80 font-medium">Every. Single. Day.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Message */}
      <div className="bg-gradient-to-r from-timeback-primary to-timeback-primary rounded-3xl p-8 lg:p-12 text-white text-center shadow-xl">
        <h3 className="text-3xl lg:text-4xl font-cal font-bold mb-6">That's Where The Name Comes From</h3>
        <p className="text-lg lg:text-xl mb-10 max-w-4xl mx-auto leading-relaxed opacity-95">
          TimeBack literally gives your child their time back. Instead of wasting 12 years in inefficient classrooms, they get to spend those years actually living, learning what they love, and becoming who they're meant to be.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 lg:gap-8 justify-center items-center max-w-2xl mx-auto">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/20 flex-1 max-w-xs">
            <div className="text-4xl lg:text-5xl font-cal font-bold mb-2">2</div>
            <div className="text-sm lg:text-base opacity-90">Hours of Efficient Learning</div>
          </div>
          <div className="text-2xl lg:text-3xl font-cal font-bold opacity-80">=</div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/20 flex-1 max-w-xs">
            <div className="text-4xl lg:text-5xl font-cal font-bold mb-2">8+</div>
            <div className="text-sm lg:text-base opacity-90">Hours for {primaryInterest} & Life</div>
          </div>
        </div>
      </div>








        </section>
      </div>
    </div>
  );
}