'use client';

import React, { useState, useEffect } from 'react';

interface AfternoonActivitiesProps {
  interests: string[];
  quizData?: any;
  onLearnMore: (_section: string) => void;
  preGeneratedContent?: any;
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



export default function AfternoonActivities({ interests, quizData, onLearnMore, preGeneratedContent }: AfternoonActivitiesProps) {
  console.log('[AfternoonActivities] Rendering with interests:', interests);
  console.log('[AfternoonActivities] Pre-generated content available:', !!preGeneratedContent);

  const primaryInterest = interests[0] || 'their passions';
  
  // State for AI-generated content
  const [content, setContent] = useState<AfternoonContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
              activity: 'Real-world application',
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
  }, [interests, quizData, primaryInterest, preGeneratedContent]);

  // Loading state
  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto bg-gradient-to-br from-timeback-bg to-white py-20 lg:py-32 px-6 lg:px-12">
        <div className="text-center font-cal">
          <div className="bg-white rounded-2xl border-2 border-timeback-primary p-12 shadow-2xl max-w-md mx-auto">
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
      <section className="max-w-7xl mx-auto bg-gradient-to-br from-timeback-bg to-white py-20 lg:py-32 px-6 lg:px-12">
        <div className="text-center font-cal">
          <div className="bg-white rounded-2xl border-2 border-timeback-primary p-12 shadow-2xl max-w-md mx-auto">
            <p className="text-timeback-primary font-cal text-xl font-bold">Unable to generate personalized content. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  // Main content (either AI-generated or fallback)
  if (!content) return null;

  return (
    <section className="max-w-7xl mx-auto bg-gradient-to-br from-timeback-bg to-white py-20 lg:py-32 px-6 lg:px-12">
      <div className="text-center mb-16 font-cal">
        <div className="inline-flex items-center gap-2 bg-white border border-timeback-primary rounded-full px-6 py-3 mb-8">
          <div className="w-3 h-3 bg-timeback-primary rounded-full animate-pulse"></div>
          <span className="text-timeback-primary font-bold text-sm font-cal">TIME FREEDOM</span>
        </div>
        <h2 className="text-4xl lg:text-6xl font-bold text-timeback-primary mb-8 font-cal">
          Finally, Your Child Gets Their Time Back
        </h2>
        <p className="text-2xl text-timeback-primary max-w-5xl mx-auto font-cal leading-relaxed">
          Traditional school steals 12 years of childhood. TimeBack gives it back.
        </p>
      </div>

      {/* Daily Schedule Comparison */}
      <div className="mb-20">
        <h3 className="text-3xl font-bold text-center text-timeback-primary mb-12 font-cal">A Day in the Life</h3>
        
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Traditional School Schedule */}
          <div className="bg-white rounded-2xl p-8 border-2 border-timeback-primary shadow-2xl">
            <h4 className="text-2xl font-bold text-timeback-primary mb-8 text-center font-cal">Traditional School</h4>
            
            <div className="space-y-4">
              {/* Morning */}
              <div className="flex items-center gap-4">
                <div className="text-lg font-bold text-timeback-primary w-24 font-cal">7:00 AM</div>
                <div className="flex-1 bg-timeback-bg rounded-xl p-4">
                  <div className="font-bold text-timeback-primary font-cal">Wake Up & Rush</div>
                  <div className="text-timeback-primary font-cal">Get ready, breakfast, commute</div>
                </div>
              </div>
              
              {/* School Hours */}
              <div className="flex items-center gap-4">
                <div className="text-lg font-bold text-timeback-primary w-24 font-cal">8:00 AM</div>
                <div className="flex-1 bg-timeback-bg rounded-xl p-4">
                  <div className="font-bold text-timeback-primary font-cal">School</div>
                  <div className="text-timeback-primary font-cal">Sitting in class, waiting for others</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-lg font-bold text-timeback-primary w-24 font-cal">12:00 PM</div>
                <div className="flex-1 bg-timeback-bg rounded-xl p-4">
                  <div className="font-bold text-timeback-primary font-cal">More School</div>
                  <div className="text-timeback-primary font-cal">Busy work, more waiting</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-lg font-bold text-timeback-primary w-24 font-cal">3:30 PM</div>
                <div className="flex-1 bg-timeback-bg rounded-xl p-4">
                  <div className="font-bold text-timeback-primary font-cal">Finally Home</div>
                  <div className="text-timeback-primary font-cal">Exhausted from the day</div>
                </div>
              </div>
              
              {/* Homework */}
              <div className="flex items-center gap-4">
                <div className="text-lg font-bold text-timeback-primary w-24 font-cal">4:00 PM</div>
                <div className="flex-1 bg-timeback-bg rounded-xl p-4">
                  <div className="font-bold text-timeback-primary font-cal">Homework</div>
                  <div className="text-timeback-primary font-cal">2-3 hours of repetitive tasks</div>
                </div>
              </div>
              
              {/* Dinner */}
              <div className="flex items-center gap-4">
                <div className="text-lg font-bold text-timeback-primary w-24 font-cal">7:00 PM</div>
                <div className="flex-1 bg-timeback-bg rounded-xl p-4">
                  <div className="font-bold text-timeback-primary font-cal">Dinner & Chores</div>
                  <div className="text-timeback-primary font-cal">Family time squeezed in</div>
                </div>
              </div>
              
              {/* Tiny bit of free time */}
              <div className="flex items-center gap-4">
                <div className="text-lg font-bold text-timeback-primary w-24 font-cal">8:30 PM</div>
                <div className="flex-1 bg-timeback-bg rounded-xl p-4 border-2 border-timeback-primary">
                  <div className="font-bold text-timeback-primary font-cal">Maybe 1 Hour Free</div>
                  <div className="text-timeback-primary font-cal">If lucky, pursue {primaryInterest}</div>
                </div>
              </div>
              
              {/* Bed */}
              <div className="flex items-center gap-4">
                <div className="text-lg font-bold text-timeback-primary w-24 font-cal">9:30 PM</div>
                <div className="flex-1 bg-timeback-bg rounded-xl p-4">
                  <div className="font-bold text-timeback-primary font-cal">Bedtime</div>
                  <div className="text-timeback-primary font-cal">Repeat tomorrow</div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center font-cal">
              <div className="text-4xl font-bold text-timeback-primary font-cal">10+ Hours Wasted</div>
              <div className="text-lg text-timeback-primary font-cal">Every. Single. Day.</div>
            </div>
          </div>
          
          {/* TimeBack Schedule */}
          <div className="bg-timeback-bg rounded-2xl p-8 border-2 border-timeback-primary shadow-2xl">
            <h4 className="text-2xl font-bold text-timeback-primary mb-8 text-center font-cal">TimeBack Student</h4>
            
            <div className="space-y-4">
              {/* Morning */}
              <div className="flex items-center gap-4">
                <div className="text-lg font-bold text-timeback-primary w-24 font-cal">8:00 AM</div>
                <div className="flex-1 bg-white rounded-xl p-4 border border-timeback-primary">
                  <div className="font-bold text-timeback-primary font-cal">Relaxed Morning</div>
                  <div className="text-timeback-primary font-cal">No rush, healthy breakfast</div>
                </div>
              </div>
              
              {/* Learning Time */}
              <div className="flex items-center gap-4">
                <div className="text-lg font-bold text-timeback-primary w-24 font-cal">9:00 AM</div>
                <div className="flex-1 bg-white rounded-xl p-4 border-2 border-timeback-primary">
                  <div className="font-bold text-timeback-primary font-cal">Focused Learning</div>
                  <div className="text-timeback-primary font-cal">AI-powered, personalized pace</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-lg font-bold text-timeback-primary w-24 font-cal">11:00 AM</div>
                <div className="flex-1 bg-timeback-primary rounded-xl p-4 border-2 border-timeback-primary">
                  <div className="font-bold text-white font-cal">Done with School!</div>
                  <div className="text-white font-cal">Entire day accomplished</div>
                </div>
              </div>
              
              {/* Passion Time */}
              <div className="flex items-center gap-4">
                <div className="text-lg font-bold text-timeback-primary w-24 font-cal">11:30 AM</div>
                <div className="flex-1 bg-white rounded-xl p-4 border-2 border-timeback-primary shadow-2xl">
                  <div className="font-bold text-timeback-primary font-cal">{content?.passionProjectName || `${primaryInterest} Deep Dive`}</div>
                  <div className="text-timeback-primary font-cal">2-3 hours of focused practice</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-lg font-bold text-timeback-primary w-24 font-cal">2:30 PM</div>
                <div className="flex-1 bg-white rounded-xl p-4 border border-timeback-primary">
                  <div className="font-bold text-timeback-primary font-cal">Creative Projects</div>
                  <div className="text-timeback-primary font-cal">Build, create, experiment</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-lg font-bold text-timeback-primary w-24 font-cal">4:00 PM</div>
                <div className="flex-1 bg-white rounded-xl p-4 border border-timeback-primary">
                  <div className="font-bold text-timeback-primary font-cal">Social & Physical</div>
                  <div className="text-timeback-primary font-cal">Friends, sports, activities</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-lg font-bold text-timeback-primary w-24 font-cal">6:00 PM</div>
                <div className="flex-1 bg-white rounded-xl p-4 border border-timeback-primary">
                  <div className="font-bold text-timeback-primary font-cal">Family Time</div>
                  <div className="text-timeback-primary font-cal">Real connection, no stress</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-lg font-bold text-timeback-primary w-24 font-cal">8:00 PM</div>
                <div className="flex-1 bg-white rounded-xl p-4 border border-timeback-primary">
                  <div className="font-bold text-timeback-primary font-cal">Evening Interests</div>
                  <div className="text-timeback-primary font-cal">More time for {primaryInterest}</div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center font-cal">
              <div className="text-4xl font-bold text-timeback-primary font-cal">8+ Hours for Life</div>
              <div className="text-lg text-timeback-primary font-cal">Every. Single. Day.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Message */}
      <div className="bg-gradient-to-r from-timeback-primary to-timeback-primary rounded-2xl p-12 text-white text-center shadow-2xl font-cal">
        <h3 className="text-4xl font-bold mb-6 font-cal">That&apos;s Where The Name Comes From</h3>
        <p className="text-2xl mb-8 max-w-4xl mx-auto font-cal leading-relaxed">
          TimeBack literally gives your child their time back. Instead of wasting 12 years in inefficient classrooms, 
          they get to spend those years actually living, learning what they love, and becoming who they&apos;re meant to be.
        </p>
        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
          <div className="bg-white bg-opacity-20 rounded-2xl p-8 border border-white border-opacity-30">
            <div className="text-5xl font-bold mb-3 font-cal">2</div>
            <div className="text-lg font-cal">Hours of Efficient Learning</div>
          </div>
          <div className="text-4xl font-cal">=</div>
          <div className="bg-white bg-opacity-20 rounded-2xl p-8 border border-white border-opacity-30">
            <div className="text-5xl font-bold mb-3 font-cal">8+</div>
            <div className="text-lg font-cal">Hours for {primaryInterest} & Life</div>
          </div>
        </div>
      </div>







      {/* Learn More button */}
      <div className="flex justify-center mt-12">
        <button 
          onClick={() => onLearnMore('afternoon-activities')}
          className="px-8 py-4 border-2 border-timeback-primary text-timeback-primary bg-transparent rounded-xl hover:bg-timeback-bg transition-all duration-200 transform hover:scale-105 font-bold font-cal text-lg shadow-2xl hover:shadow-2xl"
        >
          Get AI insights on maximizing my child&apos;s free time
        </button>
      </div>
    </section>
  );
}