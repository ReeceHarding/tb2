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
      title: "Step 1: Find Your Starting Point",
      description: "AI tests your child in minutes to discover exactly what they know and what they need to learn.",
      result: "Precise placement",
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
      title: "Step 2: Build Your Custom Path",
      description: "AI creates a personalized learning journey just for your child, filling gaps and accelerating through concepts they already know.",
      result: "Tailored curriculum",
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
      title: "Step 3: Learn in Focused Bursts", 
      description: "Your child learns in 25-minute focused sessions. They must master each concept 100% before moving forward.",
      result: "True mastery",
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
      title: "Step 4: Get Help When Stuck",
      description: "AI instantly detects when your child struggles and provides immediate support with easier explanations or practice problems.",
      result: "Instant support",
      ariaLabel: "Real-time struggle detection with immediate AI assistance"
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
      title: "Step 5: Adjust and Accelerate",
      description: "The system continuously adapts, making lessons easier or harder based on your child's performance to maintain optimal difficulty.",
      result: "Optimal pacing",
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
      title: "Step 6: Complete Grades Fast",
      description: "Your child finishes complete grade levels in just 80 days instead of 180.",
      result: "2x faster progress",
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
          <div className="inline-flex items-center gap-2 bg-white border-2 border-timeback-primary rounded-full px-6 py-3 mb-8">
            <span className="w-3 h-3 bg-timeback-primary rounded-full animate-pulse"></span>
            <span className="text-timeback-primary font-bold text-lg font-cal">Learning, Accelerated</span>
          </div>
          
          <h2 
            id="how-timeback-works-heading"
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight mb-8 text-timeback-primary font-cal leading-tight"
          >
            How Timeback Works
          </h2>
          
          <p className="max-w-4xl mx-auto text-xl sm:text-2xl lg:text-3xl text-timeback-primary leading-relaxed font-cal font-medium">
            AI-powered learning system that helps children complete grade levels in 80 days with just 2 hours of daily study.
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

    {/* Schools Using Timeback Section */}
    <section 
      className="bg-white py-20 lg:py-32" 
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
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight mb-8 text-timeback-primary font-cal leading-tight"
          >
            Schools Using Timeback
          </h2>
          
          <p className="max-w-4xl mx-auto text-xl sm:text-2xl lg:text-3xl text-timeback-primary leading-relaxed font-cal font-medium">
            Join the innovative schools already transforming education with AI-powered learning.
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
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-2 border-timeback-primary shadow-2xl ">
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
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-2 border-timeback-primary shadow-2xl ">
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
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-2 border-timeback-primary shadow-2xl ">
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
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-2 border-timeback-primary shadow-2xl ">
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
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-2 border-timeback-primary shadow-2xl ">
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
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-2 border-timeback-primary shadow-2xl ">
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
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-2 border-timeback-primary shadow-2xl ">
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
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-2 border-white shadow-2xl ">
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
              className="inline-flex items-center justify-center gap-2 bg-white text-timeback-primary px-6 py-3 rounded-full font-bold hover:bg-white/90 transition-colors font-cal group-hover:scale-105 duration-200"
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