'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface HowWeGetResultsProps {
  gradeLevel?: string;
  interests: string[];
  learningGoals: string[];
  onLearnMore: (_section: string) => void;
  preGeneratedContent?: any;
  contentReady?: boolean;
}

export default function HowWeGetResults({ 
  gradeLevel = '2nd', 
  interests, 
  learningGoals,
  onLearnMore: _onLearnMore,
  preGeneratedContent,
  contentReady = true 
}: HowWeGetResultsProps) {
  
  // Helper function to format grade level properly for different contexts
  const formatGradeLevel = useCallback((grade: string, context: 'title' | 'curriculum' | 'student') => {
    const normalizedGrade = grade.toLowerCase();
    
    if (context === 'student') {
      if (normalizedGrade.includes('high')) return 'high schooler';
      if (normalizedGrade.includes('middle')) return 'middle schooler';
      if (normalizedGrade.includes('elementary')) return 'elementary student';
      return `${grade} grader`;
    }
    
    return grade;
  }, []);
  const [content, setContent] = useState<{
    title: string;
    subtitle: string;
    points: Array<{ title: string; description: string }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log('[HowWeGetResults] Pre-generated content available:', !!preGeneratedContent);

  // Function to handle card clicks with smooth scrolling
  const handleCardClick = (cardTitle: string) => {
    console.log('[HowWeGetResults] Card clicked:', cardTitle);
    let sectionId = '';
    
    switch (cardTitle) {
      case 'No More Waiting':
      case 'Actual Completion Times':
      case 'No Wasted Time':
        sectionId = 'personalized-learning-section';
        break;
      case 'AI That Actually Works':
        sectionId = 'problem-solution-section';
        break;
      case 'Real Data, Real Results':
      case 'Proven by Data':
        sectionId = 'results-data-section';
        break;
      default:
        sectionId = 'personalized-learning-section';
    }
    
    // Smooth scroll to the target section
    const targetElement = document.getElementById(sectionId);
    if (targetElement) {
      targetElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const generateContent = useCallback(async () => {
    console.log('[HowWeGetResults] Generating content for grade:', gradeLevel, 'interests:', interests);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/generate-fallback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'how_we_get_results',
          interests: interests,
          gradeLevel: gradeLevel,
          learningGoals: learningGoals,
          context: {
            primaryInterest: interests[0] || 'learning',
            primaryGoal: learningGoals[0] || 'academic excellence'
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      console.log('[HowWeGetResults] Generated content:', data);
      
      if (data.content) {
        setContent(data.content);
      } else {
        // Fallback content if AI fails
        setContent({
          title: 'Preview the Site',
          subtitle: 'Click each section below to explore how TimeBack creates personalized learning experiences for your child',
          points: [
            {
              title: 'No More Waiting',
              description: 'See how our platform eliminates time-wasting and delivers focused, efficient learning experiences'
            },
            {
              title: 'AI That Actually Works',
              description: 'Explore how our AI adapts every lesson to your child\'s pace and interests for maximum engagement'
            },
            {
              title: 'Real Data, Real Results',
              description: 'View actual student completion data and performance metrics from our personalized learning platform'
            }
          ]
        });
      }
    } catch (error) {
      console.error('[HowWeGetResults] Error generating content:', error);
      // Fallback content
      setContent({
        title: 'Preview the Site',
        subtitle: 'Click each section below to explore how TimeBack creates personalized learning experiences for your child',
        points: [
          {
            title: 'Actual Completion Times',
            description: 'Click to see real data on how our students progress through their curriculum'
          },
          {
            title: 'No Wasted Time', 
            description: 'Explore how we eliminate unnecessary busy work and focus on efficient learning'
          },
          {
            title: 'Proven by Data',
            description: 'View the measurable results and performance metrics from our personalized platform'
          }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  }, [gradeLevel, interests, learningGoals]);

  useEffect(() => {
    const timestamp = new Date().toISOString();
    
    if (preGeneratedContent) {
      console.log(`[HowWeGetResults] ${timestamp} Using pre-generated content`);
      
      // Use pre-generated content if available and properly formatted
      if (preGeneratedContent.success && preGeneratedContent.content) {
        setContent(preGeneratedContent.content);
        setIsLoading(false);
        return;
      }
    }

    // If contentReady is true but no pre-generated content, use fallback immediately
    if (contentReady) {
      console.log(`[HowWeGetResults] ${timestamp} Content ready but no pre-generated content, using fallback immediately`);
      setContent({
        title: `How We Personalize Learning for Your ${formatGradeLevel(gradeLevel, 'student')}`,
        subtitle: 'AI-powered education that adapts to your child\'s unique interests and learning style',
        points: [
          {
            title: 'AI That Actually Works',
            description: 'Discover how our advanced AI creates personalized content that matches your child\'s interests'
          },
          {
            title: 'No More Waiting',
            description: 'See how students move at their own pace, finishing academics in just 2 hours daily'
          },
          {
            title: 'Real Results', 
            description: 'Learn about the measurable outcomes and academic achievements from our personalized approach'
          },
          {
            title: 'No Wasted Time', 
            description: 'Explore how we eliminate unnecessary busy work and focus on efficient learning'
          },
          {
            title: 'Proven by Data',
            description: 'View the measurable results and performance metrics from our personalized platform'
          }
        ]
      });
      setIsLoading(false);
      return;
    }

    console.log(`[HowWeGetResults] ${timestamp} No pre-generated content, generating on-demand`);
    generateContent();
  }, [gradeLevel, interests, learningGoals, preGeneratedContent, generateContent, contentReady, formatGradeLevel]);

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto py-20 lg:py-32 px-6 lg:px-12">
        <div className="text-center font-cal">
          <div className="backdrop-blur-md bg-white/10 rounded-2xl border-2 border-timeback-primary p-12 shadow-2xl">
            <div className="w-20 h-20 border-4 border-timeback-bg border-t-timeback-primary rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-2xl text-timeback-primary font-cal">Personalizing your content...</p>
            <p className="text-lg text-timeback-primary opacity-75 mt-3 font-cal">Creating a custom experience based on your responses</p>
          </div>
        </div>
      </section>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <>
    <section className="max-w-7xl mx-auto py-20 lg:py-32 px-6 lg:px-12">
      <div className="text-center mb-16 font-cal">
        <div className="inline-flex items-center gap-2 backdrop-blur-sm bg-white/20 border border-timeback-primary rounded-full px-6 py-3 mb-8">
          <div className="w-3 h-3 bg-timeback-primary rounded-full animate-pulse"></div>
          <span className="text-timeback-primary font-bold text-sm font-cal">PERSONALIZED FOR YOU</span>
        </div>
        <h2 className="text-4xl lg:text-6xl font-bold text-timeback-primary mb-8 font-cal">
          {content.title}
        </h2>
        <p className="text-2xl text-timeback-primary max-w-4xl mx-auto font-cal leading-relaxed">
          {content.subtitle}
        </p>
      </div>

      {/* Key Points */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
        {content.points.map((point, index) => (
          <div 
            key={index} 
            className="backdrop-blur-md bg-white/10 rounded-2xl shadow-2xl p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 border-2 border-timeback-primary hover:bg-white/20 group"
            onClick={() => handleCardClick(point.title)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick(point.title);
              }
            }}
          >
            <div className="text-center mb-6 font-cal">
              <div className="w-16 h-16 bg-timeback-primary rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <span className="text-white font-bold text-2xl font-cal">{index + 1}</span>
              </div>
            </div>
            <h3 className="font-bold text-2xl text-timeback-primary mb-4 font-cal text-center">
              {point.title}
            </h3>
            <p className="text-timeback-primary mb-6 font-cal text-lg leading-relaxed text-center">
              {point.description}
            </p>
            <div className="text-center font-cal">
              <div className="inline-flex items-center text-timeback-primary font-bold font-cal group-hover:gap-3 transition-all duration-200">
                <span>Click to explore</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Visual Call to Action */}
      <div className="text-center font-cal mt-16">
        <div className="bg-gradient-to-r from-timeback-bg to-white border-2 border-timeback-primary rounded-2xl p-8 max-w-2xl mx-auto">
          <p className="text-2xl text-timeback-primary mb-6 font-cal font-bold">
            Ready to dive deeper?
          </p>
          <p className="text-lg text-timeback-primary mb-8 font-cal">
            Click any section above to explore our personalized learning platform in detail
          </p>
          <svg className="w-12 h-12 text-timeback-primary mx-auto animate-bounce font-cal" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
          </svg>
        </div>
      </div>
    </section>

    {/* Section 1: Personalized Learning */}
    <section id="personalized-learning-section" className="max-w-7xl mx-auto py-20 lg:py-32 px-6 lg:px-12">
      <div className="bg-white rounded-2xl shadow-2xl p-12 border-2 border-timeback-primary">
        <div className="text-center mb-12 font-cal">
          <div className="w-20 h-20 bg-timeback-primary rounded-full flex items-center justify-center mx-auto shadow-2xl mb-6">
            <span className="text-white font-bold text-3xl font-cal">1</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold text-timeback-primary mb-8 font-cal">
            How does learning become personal for your {formatGradeLevel(gradeLevel, 'student')}?
          </h2>
          <p className="text-2xl text-timeback-primary max-w-4xl mx-auto font-cal leading-relaxed">
            Every child learns differently. Our AI creates a completely personalized curriculum based on your child interests in {interests.slice(0, 2).join(' and ')}, ensuring they stay engaged while mastering {gradeLevel} standards.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-timeback-bg rounded-xl p-8">
            <h3 className="text-2xl font-bold text-timeback-primary mb-4 font-cal">Traditional Learning</h3>
            <ul className="space-y-3 text-timeback-primary font-cal">
              <li className="flex items-start gap-3">
                <span className="text-timeback-primary font-bold">✗</span>
                <span>One-size-fits-all curriculum</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-timeback-primary font-bold">✗</span>
                <span>Fixed pace regardless of mastery</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-timeback-primary font-bold">✗</span>
                <span>Generic content that bores students</span>
              </li>
            </ul>
          </div>
          
          <div className="backdrop-blur-md bg-white/10 rounded-xl p-8 border-2 border-timeback-primary">
            <h3 className="text-2xl font-bold text-timeback-primary mb-4 font-cal">TimeBack Learning</h3>
            <ul className="space-y-3 text-timeback-primary font-cal">
              <li className="flex items-start gap-3">
                <span className="text-timeback-primary font-bold">✓</span>
                <span>AI adapts to your child learning style</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-timeback-primary font-bold">✓</span>
                <span>Accelerate through mastered concepts</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-timeback-primary font-bold">✓</span>
                <span>Content built around their interests</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    {/* Section 2: The Problem We Solve */}
    <section id="problem-solution-section" className="max-w-7xl mx-auto py-20 lg:py-32 px-6 lg:px-12">
      <div className="bg-white rounded-2xl shadow-2xl p-12 border-2 border-timeback-primary">
        <div className="text-center mb-12 font-cal">
          <div className="w-20 h-20 bg-timeback-primary rounded-full flex items-center justify-center mx-auto shadow-2xl mb-6">
            <span className="text-white font-bold text-3xl font-cal">2</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold text-timeback-primary mb-8 font-cal">
            What is the real problem with traditional education?
          </h2>
          <p className="text-2xl text-timeback-primary max-w-4xl mx-auto font-cal leading-relaxed">
            Most students spend 80% of their time on material they have already mastered or content that does not connect to their interests. Our AI eliminates this waste.
          </p>
        </div>
        
        <div className="backdrop-blur-md bg-white/10 rounded-xl p-8 mb-8 border-2 border-timeback-primary">
          <h3 className="text-3xl font-bold text-timeback-primary mb-6 font-cal text-center">The Time Waste Crisis</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-timeback-primary mb-2 font-cal">6.5</div>
              <div className="text-lg text-timeback-primary font-cal">Hours per day in traditional school</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-timeback-primary mb-2 font-cal">2.1</div>
              <div className="text-lg text-timeback-primary font-cal">Hours of actual learning time</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-timeback-primary mb-2 font-cal">4.4</div>
              <div className="text-lg text-timeback-primary font-cal">Hours wasted daily</div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-bold text-timeback-primary mb-4 font-cal">Our AI Solution</h3>
          <p className="text-lg text-timeback-primary font-cal max-w-3xl mx-auto">
            TimeBack AI analyzes your child mastery in real-time, skipping unnecessary review and focusing time on concepts that need attention. The result? Learning that is both faster and more effective.
          </p>
        </div>
      </div>
    </section>

    {/* Section 3: Real Data & Results */}
    <section id="results-data-section" className="max-w-7xl mx-auto py-20 lg:py-32 px-6 lg:px-12">
      <div className="bg-white rounded-2xl shadow-2xl p-12 border-2 border-timeback-primary">
        <div className="text-center mb-12 font-cal">
          <div className="w-20 h-20 bg-timeback-primary rounded-full flex items-center justify-center mx-auto shadow-2xl mb-6">
            <span className="text-white font-bold text-3xl font-cal">3</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold text-timeback-primary mb-8 font-cal">
            What results can you expect for your {formatGradeLevel(gradeLevel, 'student')}?
          </h2>
          <p className="text-2xl text-timeback-primary max-w-4xl mx-auto font-cal leading-relaxed">
            Real data from families using TimeBack shows dramatic improvements in both learning speed and comprehension rates.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-timeback-bg rounded-xl p-8">
            <h3 className="text-2xl font-bold text-timeback-primary mb-6 font-cal">Learning Speed</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-timeback-primary font-cal">Traditional Schools:</span>
                <span className="text-2xl font-bold text-timeback-primary font-cal">6.5 hrs/day</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-timeback-primary font-cal">TimeBack Average:</span>
                <span className="text-2xl font-bold text-timeback-primary font-cal">2.1 hrs/day</span>
              </div>
              <div className="text-center pt-4">
                <div className="text-3xl font-bold text-timeback-primary font-cal">68% Faster</div>
                <div className="text-sm text-timeback-primary font-cal">Time savings per day</div>
              </div>
            </div>
          </div>
          
          <div className="backdrop-blur-md bg-white/10 rounded-xl p-8 border-2 border-timeback-primary">
            <h3 className="text-2xl font-bold text-timeback-primary mb-6 font-cal">Comprehension Rates</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-timeback-primary font-cal">Traditional Methods:</span>
                <span className="text-2xl font-bold text-timeback-primary font-cal">67%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-timeback-primary font-cal">TimeBack Students:</span>
                <span className="text-2xl font-bold text-timeback-primary font-cal">89%</span>
              </div>
              <div className="text-center pt-4">
                <div className="text-3xl font-bold text-timeback-primary font-cal">+33%</div>
                <div className="text-sm text-timeback-primary font-cal">Better comprehension</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-timeback-bg to-white rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-timeback-primary mb-4 font-cal">The Bottom Line</h3>
          <p className="text-lg text-timeback-primary font-cal max-w-3xl mx-auto">
            Students using TimeBack complete their {gradeLevel} curriculum 68% faster while achieving 33% better comprehension rates. That means your child gets back 4+ hours per day for the activities they love: {interests.slice(0, 3).join(', ')}.
          </p>
        </div>
      </div>
    </section>
    </>
  );
}