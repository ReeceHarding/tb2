'use client';

import React from "react";
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
      title: "Step 1: Precise Knowledge Assessment",
      description: "Our AI identifies exactly where your child is academically - not where they should be by age. Students often test years ahead in some subjects while having critical gaps in others that traditional schools miss entirely.",
      result: "True starting point",
      ariaLabel: "AI assessment to determine exact academic starting point"
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
      title: "Step 2: 1-on-1 AI Tutoring Path",
      description: "AI creates a truly individualized learning path impossible in traditional classrooms. Each student gets their own AI tutor that adapts instantly - advanced in math? Jump to 5th grade. Need to master fractions first? The AI waits until mastery is achieved.",
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
      title: "Step 3: Structured 120-Minute Day", 
      description: "Students complete 4 focused 25-minute sessions (Math, Science/Social Science, Language/Writing, Reading) plus 20 minutes for learning strategies. Using Pomodoro Technique, no advancing until 100% mastery is achieved.",
      result: "Deep understanding",
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
      title: "Step 4: Speed Bumps & Struggle Detectors",
      description: "Our AI uses Speed Bumps and Struggle Detectors to monitor progress constantly. The moment your child struggles, AI intervenes with simpler explanations, additional examples, or prerequisite review - no sitting confused like in traditional classrooms.",
      result: "Zero frustration",
      ariaLabel: "Real time struggle detection with immediate AI assistance"
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
      title: "Step 5: Optimal Challenge Zone",
      description: "AI maintains 80-95% accuracy for peak learning. Below 70%? Material is too hard - get support. Above 95%? Too easy - level up instantly. The WASTE meter tracks engagement to ensure efficient 2 hour learning.",
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
      description: "Focused 30-minute lessons with AI corrective sessions mean students finish entire grade levels in 80 days versus traditional 180 days. Two complete grades per year while still having afternoons free for life skills and passions.",
      result: "2x grade completion",
      ariaLabel: "Accelerated grade completion in 80 days"
    }
];

// Production-ready component with proper TypeScript interfaces and performance optimizations
const HowTimebackWorks: React.FC = React.memo(() => {
  return (
    <>
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
            We eliminated the traditional teacher-led classroom model that learning science research has proven ineffective for over 40 years. Built on Benjamin Bloom&apos;s 2 Sigma Problem and extensive research, our AI tutors deliver true 1-on-1 mastery learning where students achieve 100% understanding before advancing - something impossible in traditional classrooms.
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
            Over 40 years of research shows students can learn 2x, 5x, even 10x faster with individualized tutoring. Traditional classrooms simply cannot deliver these results—but AI can.
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
              Benjamin Bloom&apos;s seminal 1984 research proved that students with individual tutoring learn 2 standard deviations (2σ) faster than traditional classroom students—that&apos;s the difference between 50th percentile and 98th percentile performance.
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

        {/* The AI Solution */}
        <motion.div 
          variants={animationVariants.fadeInUp}
          whileInView="animate"
          initial="initial"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-16 bg-timeback-primary rounded-2xl p-8 lg:p-12 text-white text-center"
        >
          <h3 className="text-3xl font-bold mb-6 font-cal">
            The AI Solution: Perfect Individual Tutoring at Scale
          </h3>
          <p className="text-xl leading-relaxed font-cal max-w-4xl mx-auto">
            For the first time in history, AI makes Bloom&apos;s ideal practical. Every student gets their own infinitely patient tutor that adapts instantly, never moves forward without mastery, and provides exactly the right level of challenge. The result? Students consistently achieve what Bloom proved was possible: 2x learning speed with true understanding.
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
            Alpha School pioneered TimeBack over 10 years. Now innovative schools nationwide are adopting this proven model where students achieve 99th percentile results while actually loving school.
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