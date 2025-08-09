'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { animationVariants, createStaggerVariants } from "@/libs/animations";

// TypeScript interface for better type safety and maintainability
interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  result: string;
  ariaLabel?: string;
}

// Button configuration interface
interface ButtonConfig {
  id: string;
  text: string;
  ariaLabel: string;
  visibleSectionId?: string; // ID of section that, if visible, should hide this button
}

// Six-step TimeBack process in simple, actionable terms
const features: Feature[] = [
    {
      id: "find-starting-point",
      icon: (
        <svg 
          className="w-7 h-7" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
          role="img"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      ),
      title: "Step 1: Find Their Exact Knowledge Level",
      description: "Adaptive assessment identifies where your child actually is - not where they should be by age. Alpha School data shows students often test 3-4 grades ahead in some subjects while having gaps in others.",
      result: "True starting point",
      ariaLabel: "Assessment to determine exact academic starting point"
    },
    {
      id: "build-custom-path",
      icon: (
        <svg 
          className="w-7 h-7" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
          role="img"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" 
          />
        </svg>
      ),
      title: "Step 2: Create Personalized Learning Path",
      description: "Each student gets a truly individualized curriculum impossible in classrooms. Advanced in math? Jump ahead 3 grades. Need fraction mastery first? Software ensures 100% understanding before advancing. No more teaching to the middle.",
      result: "Custom curriculum",
      ariaLabel: "Personalized learning path creation based on individual needs"
    },
    {
      id: "learn-focused-bursts",
      icon: (
        <svg 
          className="w-7 h-7" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
          role="img"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      ),
      title: "Step 3: Learn in 2-Hour Daily Sessions", 
      description: "Students complete 4 focused 25-minute sessions: Math, Science, Language, and Reading. Data shows students finish entire grade levels in 80 days versus 180. 100% mastery required before advancing.",
      result: "2x faster learning",
      ariaLabel: "Concentrated learning sessions with complete mastery requirement"
    },
    {
      id: "get-help-when-stuck",
      icon: (
        <svg 
          className="w-7 h-7" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
          role="img"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      ),
      title: "Step 4: Immediate Help When Needed",
      description: "Struggle detection monitors progress constantly. The moment a student falters, software provides simpler explanations, additional practice, or prerequisite review. No more sitting confused for hours like in traditional classrooms.",
      result: "Zero frustration",
      ariaLabel: "Real time struggle detection with immediate assistance"
    },
    {
      id: "adjust-and-accelerate",
      icon: (
        <svg 
          className="w-7 h-7" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
          role="img"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M13 10V3L4 14h7v7l9-11h-7z" 
          />
        </svg>
      ),
      title: "Step 5: Stay in Optimal Learning Zone",
      description: "Software maintains 80-90% accuracy for peak learning. Below 80%? Material gets easier. Above 95%? Level up instantly. The WASTE meter ensures students use their 2 hours efficiently. Average student learns 6x faster.",
      result: "Peak performance",
      ariaLabel: "Continuous optimization for ideal learning progression"
    },
    {
      id: "complete-grades-fast",
      icon: (
        <svg 
          className="w-7 h-7" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
          role="img"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" 
          />
        </svg>
      ),
      title: "Step 6: Complete 2 Grades Per Year",
      description: "Alpha School data proves students complete grade levels in 80 days versus 180. That's 2 full grades per year, verified by MAP testing. Students still have afternoons free for sports, arts, and life skills.",
      result: "99th percentile",
      ariaLabel: "Accelerated grade completion in 80 days"
    }
];

// Button configurations for dynamic suggestion grid
const suggestionButtons: ButtonConfig[] = [
  { id: 'what-is-timeback', text: 'What is TimeBack?', ariaLabel: 'Learn what TimeBack is and how it works', visibleSectionId: 'how-timeback-works-heading' },
  { id: 'how-does-it-work', text: 'How does it work?', ariaLabel: "Understand how TimeBack's AI-powered learning system works", visibleSectionId: 'how-timeback-works-heading' },
  { id: 'show-data', text: 'Show me your data', ariaLabel: "View TimeBack's research data and educational outcomes", visibleSectionId: 'learning-science-heading' },
  { id: 'completion-time-data', text: 'Learning Speed Data', ariaLabel: 'See how fast students complete different subjects', visibleSectionId: 'actual-student-completion-hours' },
  { id: 'student-journey-carousel', text: 'Student Success Stories', ariaLabel: 'View success stories from students in your grade level' },
  { id: 'example-question', text: 'Example Tailored Question', ariaLabel: 'See a personalized example question for your child' },
  { id: 'extra-hours', text: 'Extra Hours Activities', ariaLabel: 'Learn what your child can do with their extra time' },
  { id: 'find-school', text: 'Find Nearby Schools', ariaLabel: 'Find TimeBack schools in your area', visibleSectionId: 'schools-using-timeback-heading' },
  { id: 'school-report-card', text: 'School Report Cards', ariaLabel: 'View detailed school comparison report cards' }
];

// Production-ready component with proper TypeScript interfaces and performance optimizations
const HowTimebackWorks: React.FC = React.memo(() => {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    // Check which sections are visible on the page
    const checkVisibleSections = () => {
      const sections = new Set<string>();
      
      // Check if main HowTimebackWorks content is visible
      if (document.getElementById('how-timeback-works-heading')) {
        sections.add('how-timeback-works-heading');
      }
      
      // Check if learning science section is visible
      if (document.getElementById('learning-science-heading')) {
        sections.add('learning-science-heading');
      }
      
      // Check if schools section is visible
      if (document.getElementById('schools-using-timeback-heading')) {
        sections.add('schools-using-timeback-heading');
      }
      
      // Check if actual student completion hours section is visible (from CompletionTimeData component)
      // Look for the specific text or component structure
      const headings = document.querySelectorAll('h2, h3');
      headings.forEach(heading => {
        if (heading.textContent?.includes('Actual Student Completion Hours')) {
          sections.add('actual-student-completion-hours');
        }
      });
      
      // Also check for the CompletionTimeData component's characteristic elements
      const gradeSelector = document.querySelector('select[class*="border-timeback-primary"]');
      const alphaVsTraditional = document.querySelector('h3')?.textContent?.includes('Alpha vs Traditional Hours');
      if (gradeSelector && alphaVsTraditional) {
        sections.add('actual-student-completion-hours');
      }
      
      setVisibleSections(sections);
      setShowSuggestions(true);
    };

    // Check on mount and after a short delay to ensure all components are rendered
    checkVisibleSections();
    const timer = setTimeout(checkVisibleSections, 100);

    return () => clearTimeout(timer);
  }, []);

  // Filter buttons based on visible sections
  const availableButtons = suggestionButtons.filter(button => {
    // If button has a visibleSectionId and that section is visible, hide the button
    if (button.visibleSectionId && visibleSections.has(button.visibleSectionId)) {
      return false;
    }
    return true;
  });

  const handleButtonClick = (buttonId: string) => {
    // This would need to be implemented based on your routing/scrolling logic
    console.log(`Button clicked: ${buttonId}`);
    // You could emit an event, navigate to a different page, or scroll to a section
  };
  return (
    <>
    {/* Dynamic Suggestion Grid */}
    {showSuggestions && availableButtons.length > 0 && (
      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div 
            variants={animationVariants.fadeInUp}
            whileInView="animate"
            initial="initial"
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-timeback-primary font-cal mb-4">
              What would you like to learn about?
            </h2>
            <p className="text-lg text-timeback-primary font-cal">
              Select a topic to explore more about TimeBack
            </p>
          </motion.div>
          
          <motion.div 
            variants={createStaggerVariants(0.1, 0.05)}
            whileInView="animate"
            initial="initial"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto"
          >
            {availableButtons.map((button) => (
              <motion.button
                key={button.id}
                variants={animationVariants.fadeInUp}
                onClick={() => handleButtonClick(button.id)}
                className="backdrop-blur-md bg-timeback-bg/20 border-2 border-timeback-primary rounded-xl p-4 text-center hover:bg-timeback-bg/40 transition-all duration-300 shadow-lg hover:shadow-xl"
                aria-label={button.ariaLabel}
              >
                <h3 className="text-lg font-bold text-timeback-primary font-cal leading-tight">
                  {button.text}
                </h3>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>
    )}
    
    <section 
      className="bg-timeback-bg py-20 lg:py-32" 
      aria-labelledby="how-timeback-works-heading"
      role="region"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Enhanced Header Section with improved visual hierarchy */}
        <motion.header 
          variants={animationVariants.fadeInUp}
          whileInView="animate"
          initial="initial"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20 lg:mb-28 font-cal"
        >
          <div className="inline-flex items-center gap-2 backdrop-blur-md bg-timeback-bg/80 border-2 border-timeback-primary rounded-full px-6 py-3 mb-8">
            <span className="w-3 h-3 bg-timeback-primary rounded-full animate-pulse"></span>
            <span className="text-timeback-primary font-bold text-lg font-cal">Learning, Accelerated</span>
          </div>
          
          <h2 
            id="how-timeback-works-heading"
            className="font-extrabold text-3xl md:text-5xl tracking-tight mb-6 bg-gradient-to-r from-timeback-primary via-timeback-primary to-timeback-primary bg-clip-text text-transparent font-cal"
          >
            How TimeBack Achieves 2x Learning in 2 Hours
          </h2>
          
          <p className="text-lg md:text-xl text-timeback-primary max-w-3xl mx-auto leading-relaxed font-cal">
            TimeBack replaces the classroom model with personalized software delivering true 1-on-1 instruction. Based on Bloom&apos;s 2 Sigma research and proven by 10 years at Alpha School, students achieve 100% mastery before advancing - impossible in traditional classrooms.
          </p>
        </motion.header>

        {/* Enhanced Features Grid with optimal spacing and visual balance */}
        <motion.div 
          variants={createStaggerVariants(0.2, 0.1)}
          whileInView="animate"
          initial="initial"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10"
          role="list"
          aria-label="Timeback learning features"
        >
          {features.map((feature) => (
            <motion.article 
              key={feature.id} 
              variants={animationVariants.fadeInUp}
              className="bg-white rounded-2xl border-2 border-timeback-primary p-8 shadow-2xl group flex flex-col h-full"
              role="listitem"
              aria-labelledby={`feature-title-${feature.id}`}
              aria-describedby={`feature-desc-${feature.id}`}
            >
              {/* Enhanced Feature Icon with improved visual design */}
              <div 
                className="mb-6 flex justify-center"
                aria-label={feature.ariaLabel}
                role="img"
              >
                <div className="w-20 h-20 bg-timeback-bg rounded-full flex items-center justify-center border-2 border-timeback-primary shadow-2xl">
                  <div className="text-timeback-primary font-cal">
                    {feature.icon}
                  </div>
                </div>
              </div>
              
              {/* Enhanced Feature Title with better spacing */}
              <h3 
                id={`feature-title-${feature.id}`}
                className="text-2xl font-bold text-timeback-primary mb-4 leading-tight font-cal text-center"
              >
                {feature.title}
              </h3>
              
              {/* Enhanced Feature Description with better readability - now grows to fill space */}
              <div className="flex-grow flex items-center justify-center mb-6">
                <p 
                  id={`feature-desc-${feature.id}`}
                  className="text-timeback-primary text-lg leading-relaxed font-cal text-center"
                >
                  {feature.description}
                </p>
              </div>

            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>

    {/* Learning Science Foundation Section */}
    <section 
      className="py-20 lg:py-32 bg-white" 
      aria-labelledby="learning-science-heading"
      role="region"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header Section */}
        <motion.header 
          variants={animationVariants.fadeInUp}
          whileInView="animate"
          initial="initial"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20 lg:mb-28 font-cal"
        >
          <div className="inline-flex items-center gap-2 bg-timeback-bg border-2 border-timeback-primary rounded-full px-6 py-3 mb-8">
            <span className="w-3 h-3 bg-timeback-primary rounded-full animate-pulse"></span>
            <span className="text-timeback-primary font-bold text-lg font-cal">Research-Backed</span>
          </div>
          
          <h2 
            id="learning-science-heading"
            className="font-extrabold text-3xl md:text-5xl tracking-tight mb-6 bg-gradient-to-r from-timeback-primary via-timeback-primary to-timeback-primary bg-clip-text text-transparent font-cal"
          >
            The Learning Science Behind TimeBack
          </h2>
          
          <p className="text-lg md:text-xl text-timeback-primary max-w-3xl mx-auto leading-relaxed font-cal">
            Over 40 years of research shows students can learn 2x, 5x, even 10x faster with individualized tutoring. Traditional classrooms simply cannot deliver these results—adaptive software finally can.
          </p>
        </motion.header>

        {/* Learning Science Cards */}
        <motion.div 
          variants={createStaggerVariants(0.2, 0.1)}
          whileInView="animate"
          initial="initial"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
          role="list"
          aria-label="Learning science foundations"
        >
          {/* Bloom's 2 Sigma Problem */}
          <motion.article 
            variants={animationVariants.fadeInUp}
            className="bg-timeback-bg rounded-2xl border-2 border-timeback-primary p-8 shadow-2xl"
            role="listitem"
          >
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-timeback-primary rounded-full flex items-center justify-center border-2 border-timeback-primary shadow-2xl">
                <div className="text-white font-cal text-3xl font-bold">2σ</div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-timeback-primary mb-4 leading-tight font-cal text-center">
              Bloom&apos;s 2 Sigma Problem
            </h3>
            <p className="text-timeback-primary text-lg leading-relaxed font-cal text-center mb-6">
              Benjamin Bloom&apos;s seminal research published over four decades ago proved that students with individual tutoring learn 2 standard deviations (2σ) faster than traditional classroom students—that&apos;s the difference between 50th percentile and 98th percentile performance.
            </p>
            <div className="bg-timeback-primary/10 rounded-xl p-4 border border-timeback-primary">
              <p className="text-timeback-primary font-bold text-center font-cal">
                &ldquo;The problem is finding methods that are both effective and practical for use in conventional classrooms.&rdquo;
              </p>
              <p className="text-timeback-primary text-sm text-center mt-2 font-cal">
                — Benjamin Bloom, 1984
              </p>
            </div>
          </motion.article>

          {/* Why Traditional Classrooms Fail */}
          <motion.article 
            variants={animationVariants.fadeInUp}
            className="bg-timeback-bg rounded-2xl border-2 border-timeback-primary p-8 shadow-2xl"
            role="listitem"
          >
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-timeback-primary rounded-full flex items-center justify-center border-2 border-timeback-primary shadow-2xl">
                <div className="text-white font-cal text-2xl font-bold">×</div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-timeback-primary mb-4 leading-tight font-cal text-center">
              Why Traditional Classrooms Fail
            </h3>
            <div className="space-y-4 text-timeback-primary font-cal">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-timeback-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <p className="text-lg leading-relaxed">
                  <strong>Classroom Diversity:</strong> 80% of students have different background knowledge levels—teachers must teach to the average
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-timeback-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p className="text-lg leading-relaxed">
                  <strong>Pacing Pressure:</strong> Must stick to lesson plans regardless of individual mastery—leaving gaps that snowball
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-timeback-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <p className="text-lg leading-relaxed">
                  <strong>No Individual Attention:</strong> One teacher cannot provide personalized paths for 25+ students simultaneously
                </p>
              </div>
            </div>
          </motion.article>
        </motion.div>

        {/* The TimeBack Solution */}
        <motion.div 
          variants={animationVariants.fadeInUp}
          whileInView="animate"
          initial="initial"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-16 bg-timeback-primary rounded-2xl p-8 lg:p-12 text-white text-center"
        >
          <h3 className="text-3xl font-bold mb-6 font-cal">
            The TimeBack Solution: Perfect Individual Tutoring at Scale
          </h3>
          <p className="text-xl leading-relaxed font-cal max-w-4xl mx-auto">
            For the first time in history, adaptive technology makes Bloom&apos;s ideal practical. Every student gets personalized instruction that adapts instantly, never moves forward without mastery, and provides exactly the right level of challenge. The result? Students consistently achieve what Bloom proved was possible: 2x learning with 99th percentile scores.
          </p>
        </motion.div>
      </div>
    </section>



    {/* Schools Using Timeback Section */}
    <section 
      className="py-20 lg:py-32" 
      aria-labelledby="schools-using-timeback-heading"
      role="region"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header Section */}
        <motion.header 
          variants={animationVariants.fadeInUp}
          whileInView="animate"
          initial="initial"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20 lg:mb-28 font-cal"
        >
          <div className="inline-flex items-center gap-2 bg-timeback-bg border-2 border-timeback-primary rounded-full px-6 py-3 mb-8">
            <span className="w-3 h-3 bg-timeback-primary rounded-full animate-pulse"></span>
            <span className="text-timeback-primary font-bold text-lg font-cal">Trusted by Leading Schools</span>
          </div>
          
          <h2 
            id="schools-using-timeback-heading"
            className="font-extrabold text-3xl md:text-5xl tracking-tight mb-6 bg-gradient-to-r from-timeback-primary via-timeback-primary to-timeback-primary bg-clip-text text-transparent font-cal"
          >
            Join the Pioneers Revolutionizing Education
          </h2>
          
          <p className="text-lg md:text-xl text-timeback-primary max-w-2xl mx-auto leading-relaxed font-cal">
            Alpha School has been pioneering TimeBack since the very first school opened in 2014. Now innovative schools nationwide are adopting this proven model where students achieve 99th percentile results while actually loving school.
          </p>
        </motion.header>

        {/* Schools Grid */}
        <motion.div 
          variants={createStaggerVariants(0.15, 0.08)}
          whileInView="animate"
          initial="initial"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
          role="list"
          aria-label="Schools using Timeback platform"
        >
          {/* Alpha School */}
          <motion.article 
            variants={animationVariants.fadeInUp}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-timeback-bg rounded-2xl border-2 border-timeback-primary p-8 shadow-2xl group flex flex-col h-full text-center"
            role="listitem"
          >
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 backdrop-blur-md bg-timeback-bg/90 rounded-full flex items-center justify-center border-2 border-timeback-primary shadow-2xl ">
                <div className="text-timeback-primary font-cal text-2xl font-bold">A</div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-timeback-primary mb-4 leading-tight font-cal">
              Alpha School
            </h3>
            <p className="text-timeback-primary text-base leading-relaxed font-cal mb-6 flex-grow">
              Premier microschool network pioneering AI-enhanced education for K-12 students.
            </p>
            <a 
              href="https://alpha.school/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-timeback-primary text-white px-6 py-3 rounded-full font-bold hover:bg-timeback-primary/90 transition-colors font-cal group-hover:scale-105 duration-200"
              aria-label="Visit Alpha School website"
            >
              Visit School
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </motion.article>

          {/* Sports Academy */}
          <motion.article 
            variants={animationVariants.fadeInUp}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-timeback-bg rounded-2xl border-2 border-timeback-primary p-8 shadow-2xl group flex flex-col h-full text-center"
            role="listitem"
          >
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 backdrop-blur-md bg-timeback-bg/90 rounded-full flex items-center justify-center border-2 border-timeback-primary shadow-2xl ">
                <div className="text-timeback-primary font-cal text-2xl font-bold">S</div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-timeback-primary mb-4 leading-tight font-cal">
              Sports Academy
            </h3>
            <p className="text-timeback-primary text-base leading-relaxed font-cal mb-6 flex-grow">
              Athletic-focused education combining sports excellence with accelerated academics.
            </p>
            <a 
              href="https://sportsacademy.school/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-timeback-primary text-white px-6 py-3 rounded-full font-bold hover:bg-timeback-primary/90 transition-colors font-cal group-hover:scale-105 duration-200"
              aria-label="Visit Sports Academy website"
            >
              Visit School
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </motion.article>

          {/* GT School */}
          <motion.article 
            variants={animationVariants.fadeInUp}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-timeback-bg rounded-2xl border-2 border-timeback-primary p-8 shadow-2xl group flex flex-col h-full text-center"
            role="listitem"
          >
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 backdrop-blur-md bg-timeback-bg/90 rounded-full flex items-center justify-center border-2 border-timeback-primary shadow-2xl ">
                <div className="text-timeback-primary font-cal text-xl font-bold">GT</div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-timeback-primary mb-4 leading-tight font-cal">
              GT School
            </h3>
            <p className="text-timeback-primary text-base leading-relaxed font-cal mb-6 flex-grow">
              Innovative learning environment designed for gifted and talented students.
            </p>
            <a 
              href="https://gt.school/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-timeback-primary text-white px-6 py-3 rounded-full font-bold hover:bg-timeback-primary/90 transition-colors font-cal group-hover:scale-105 duration-200"
              aria-label="Visit GT School website"
            >
              Visit School
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </motion.article>

          {/* NextGen Academy */}
          <motion.article 
            variants={animationVariants.fadeInUp}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-timeback-bg rounded-2xl border-2 border-timeback-primary p-8 shadow-2xl group flex flex-col h-full text-center"
            role="listitem"
          >
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 backdrop-blur-md bg-timeback-bg/90 rounded-full flex items-center justify-center border-2 border-timeback-primary shadow-2xl ">
                <div className="text-timeback-primary font-cal text-xl font-bold">NG</div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-timeback-primary mb-4 leading-tight font-cal">
              NextGen Academy
            </h3>
            <p className="text-timeback-primary text-base leading-relaxed font-cal mb-6 flex-grow">
              Future-focused school preparing students for tomorrow{"'"}s challenges.
            </p>
            <a 
              href="https://nextgenacademy.school/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-timeback-primary text-white px-6 py-3 rounded-full font-bold hover:bg-timeback-primary/90 transition-colors font-cal group-hover:scale-105 duration-200"
              aria-label="Visit NextGen Academy website"
            >
              Visit School
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </motion.article>

          {/* Novatio School */}
          <motion.article 
            variants={animationVariants.fadeInUp}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-timeback-bg rounded-2xl border-2 border-timeback-primary p-8 shadow-2xl group flex flex-col h-full text-center"
            role="listitem"
          >
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 backdrop-blur-md bg-timeback-bg/90 rounded-full flex items-center justify-center border-2 border-timeback-primary shadow-2xl ">
                <div className="text-timeback-primary font-cal text-xl font-bold">N</div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-timeback-primary mb-4 leading-tight font-cal">
              Novatio School
            </h3>
            <p className="text-timeback-primary text-base leading-relaxed font-cal mb-6 flex-grow">
              Modern educational institution emphasizing innovation and personalized learning.
            </p>
            <a 
              href="https://www.novatio.school/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-timeback-primary text-white px-6 py-3 rounded-full font-bold hover:bg-timeback-primary/90 transition-colors font-cal group-hover:scale-105 duration-200"
              aria-label="Visit Novatio School website"
            >
              Visit School
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </motion.article>

          {/* Unbound Academy */}
          <motion.article 
            variants={animationVariants.fadeInUp}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-timeback-bg rounded-2xl border-2 border-timeback-primary p-8 shadow-2xl group flex flex-col h-full text-center"
            role="listitem"
          >
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 backdrop-blur-md bg-timeback-bg/90 rounded-full flex items-center justify-center border-2 border-timeback-primary shadow-2xl ">
                <div className="text-timeback-primary font-cal text-xl font-bold">U</div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-timeback-primary mb-4 leading-tight font-cal">
              Unbound Academy
            </h3>
            <p className="text-timeback-primary text-base leading-relaxed font-cal mb-6 flex-grow">
              Flexible learning environment breaking traditional educational boundaries.
            </p>
            <a 
              href="https://unboundacademy.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-timeback-primary text-white px-6 py-3 rounded-full font-bold hover:bg-timeback-primary/90 transition-colors font-cal group-hover:scale-105 duration-200"
              aria-label="Visit Unbound Academy website"
            >
              Visit School
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </motion.article>

          {/* Nova Academy */}
          <motion.article 
            variants={animationVariants.fadeInUp}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-timeback-bg rounded-2xl border-2 border-timeback-primary p-8 shadow-2xl group flex flex-col h-full text-center"
            role="listitem"
          >
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 backdrop-blur-md bg-timeback-bg/90 rounded-full flex items-center justify-center border-2 border-timeback-primary shadow-2xl ">
                <div className="text-timeback-primary font-cal text-xl font-bold">NV</div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-timeback-primary mb-4 leading-tight font-cal">
              Nova Academy
            </h3>
            <p className="text-timeback-primary text-base leading-relaxed font-cal mb-6 flex-grow">
              Cutting-edge academy fostering excellence through innovative teaching methods.
            </p>
            <a 
              href="https://novaacademy.school/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-timeback-primary text-white px-6 py-3 rounded-full font-bold hover:bg-timeback-primary/90 transition-colors font-cal group-hover:scale-105 duration-200"
              aria-label="Visit Nova Academy website"
            >
              Visit School
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </motion.article>

          {/* Call to Action Card */}
          <motion.article 
            variants={animationVariants.fadeInUp}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-timeback-primary rounded-2xl border-2 border-timeback-primary p-8 shadow-2xl group flex flex-col h-full text-center text-white"
            role="listitem"
          >
            <div className="mb-6 flex justify-center">
                              <div className="w-16 h-16 backdrop-blur-md bg-timeback-bg/90 rounded-full flex items-center justify-center border-2 border-timeback-primary shadow-2xl ">
                <div className="text-timeback-primary font-cal text-2xl font-bold">+</div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-4 leading-tight font-cal">
              Your School Next?
            </h3>
            <p className="text-white text-base leading-relaxed font-cal mb-6 flex-grow">
              Join the growing network of schools revolutionizing education with Timeback.
            </p>
            <a 
              href="/quiz" 
              className="inline-flex items-center justify-center gap-2 bg-timeback-bg text-timeback-primary px-6 py-3 rounded-full font-bold hover:bg-timeback-bg/90 transition-colors font-cal group-hover:scale-105 duration-200"
              aria-label="Start quiz to join Timeback network"
            >
              Get Started
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </motion.article>
        </motion.div>
      </div>
    </section>
    </>
  );
});

// Display name for debugging and React DevTools
HowTimebackWorks.displayName = 'HowTimebackWorks';

export default HowTimebackWorks;