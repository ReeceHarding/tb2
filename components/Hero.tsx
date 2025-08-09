"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { animationVariants, createStaggerVariants, shouldReduceMotion, getReducedMotionTransition } from "@/libs/animations";
import TestimonialsAvatars from "./TestimonialsAvatars";
import ButtonAIExperience from "./ButtonAIExperience";
import SafeImage from "./SafeImage";

// Simple array of messages to cycle through
const typewriterMessages = [
  "learn 2x the material in just 2 hours a day?",
  "complete 2 grade levels in one year?", 
  "score in the 99th percentile on MAP tests?"
];

// Clean, simple typewriter component
const TypewriterText = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(typewriterMessages[0].length); // Start with first message fully typed
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(true); // Start paused to show the first message

  useEffect(() => {
    const currentMessage = typewriterMessages[messageIndex];
    
    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, 2000);
      return () => clearTimeout(pauseTimer);
    }

    const speed = isDeleting ? 30 : 80;

    const timer = setTimeout(() => {
      if (isDeleting) {
        if (charIndex > 0) {
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setMessageIndex((messageIndex + 1) % typewriterMessages.length);
        }
      } else {
        if (charIndex < currentMessage.length) {
          setCharIndex(charIndex + 1);
        } else {
          setIsPaused(true);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, messageIndex, isPaused]);

  const currentText = typewriterMessages[messageIndex].substring(0, charIndex);

  return (
    <span className="font-cal text-timeback-primary">
      {currentText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

const Hero = () => {
  // Animation variants for staggered content reveal - Optimized for speed
  const containerVariants = createStaggerVariants(0.05, 0.05);  // 50ms stagger, 50ms initial delay
  
  const heroContentVariants = {
    initial: shouldReduceMotion() ? { opacity: 0 } : { opacity: 0, y: 20 },  // Respect reduced motion
    animate: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: getReducedMotionTransition({
        duration: 0.25,  // Reduced from 0.8s to 0.25s (industry standard)
        delay,
        ease: [0.23, 1, 0.32, 1] as const,
      })
    }),
  };

  return (
    <section className="bg-timeback-bg min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto w-full px-6 sm:px-8 lg:px-12 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div 
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="space-y-8 lg:space-y-10 text-center lg:text-left font-cal"
          >
            
            {/* SEO-optimized headline with clean typography */}
            <motion.div 
              variants={heroContentVariants}
              custom={0.05}
              className="space-y-4"
            >
              <h1 className="font-extrabold tracking-tight leading-tight font-cal text-timeback-primary text-3xl sm:text-4xl lg:text-5xl">
                <span className="block mb-2">
                  What if your child could 
                </span>
                <span className="block h-[2.4em] overflow-hidden">
                  <TypewriterText />
                </span>
              </h1>

            </motion.div>

            {/* Improved subheading with better spacing */}
            <motion.p 
              variants={heroContentVariants}
              custom={0.1}  // Reduced from 1.0s to 100ms stagger
              className="text-base sm:text-lg lg:text-xl text-timeback-primary leading-relaxed font-cal max-w-2xl mx-auto lg:mx-0 font-medium"
            >
              Traditional schools are failing our children—wasting 6+ hours daily on outdated methods while less than 50% perform at grade level. 
              But what if there was a proven way for your child to excel academically in just 2 hours, leaving 4 hours for life skills, passions, and actually enjoying childhood? 
              <span className="block mt-3 font-bold font-cal flex items-center justify-center lg:justify-start gap-2">
                Welcome to 
                <SafeImage 
                  alt="TimeBack AI-powered personalized learning platform for homeschool families" 
                  src="/images/logos/BluetimeBackLogo.png" 
                  width={120} 
                  height={32} 
                  className="h-6 w-auto object-contain" 
                />
                .
              </span>
            </motion.p>
            
            {/* CTA Button with improved styling */}
            <motion.div 
              variants={heroContentVariants}
              custom={0.15}  // Reduced from 1.2s to 150ms stagger
              className="pt-4"
            >
              <ButtonAIExperience extraStyle="w-full sm:w-auto px-12 py-4 text-lg font-bold shadow-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300" />
            </motion.div>

            {/* Social proof moved with better spacing */}
            <motion.div 
              variants={heroContentVariants}
              custom={0.2}  // Reduced from 1.4s to 200ms stagger
              className="pt-6"
            >
              <TestimonialsAvatars priority={true} />
            </motion.div>
          </motion.div>
          {/* Right Content - Professional Report Card */}
          <motion.div 
            variants={animationVariants.fadeInRight}
            initial="initial"
            animate="animate"
            className="relative pt-6"
          >
            {/* Floating badge */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
              <div className="bg-timeback-primary text-white px-6 py-2 rounded-full shadow-2xl font-cal">
                <span className="text-sm font-bold font-cal">REAL DATA • 2024</span>
              </div>
            </div>

            {/* Main Report Card */}
            <div className="backdrop-blur-md bg-timeback-bg/80 rounded-2xl shadow-2xl border-2 border-timeback-primary overflow-hidden max-w-lg mx-auto">
              
              {/* Header Section */}
              <div className="bg-gradient-to-r from-timeback-primary to-timeback-primary/90 text-white p-6 text-center font-cal">
                <h3 className="text-2xl font-bold font-cal mb-2">TIMEBACK RESULTS</h3>
                <p className="text-white/90 font-cal">Alpha School • Academic Year 2023-24</p>
                <p className="text-white/75 text-sm font-cal mt-1">MAP Standardized Testing</p>
              </div>

              {/* Achievement Badge */}
              <div className="relative -mt-6 flex justify-center">
                                  <div className="backdrop-blur-md bg-white border-4 border-timeback-primary rounded-full px-6 py-3 shadow-2xl">
                  <div className="flex items-center gap-2 text-timeback-primary font-cal">
                    <span className="w-3 h-3 bg-timeback-primary rounded-full animate-pulse"></span>
                    <span className="font-bold text-lg font-cal">TOP 1% NATIONALLY</span>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 pt-8 space-y-6">
                
                {/* Comparison Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Traditional School */}
                  <div className="text-center font-cal">
                    <div className="bg-white border-2 border-timeback-primary rounded-xl p-4 space-y-3">
                      <h4 className="text-timeback-primary font-bold mb-3 font-cal text-sm">Traditional School</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-cal text-timeback-primary">Daily Time:</span>
                          <span className="font-bold text-xs font-cal text-timeback-primary">6-8 hrs</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-cal text-timeback-primary">Love School:</span>
                          <span className="font-bold text-xs font-cal text-timeback-primary">~30%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-cal text-timeback-primary">At Grade Level:</span>
                          <span className="font-bold text-xs font-cal text-timeback-primary">&lt;50%</span>
                        </div>
                      </div>
                      <div className="text-xs text-timeback-primary pt-2 border-t border-timeback-primary font-cal">
                        + 2-3 hrs homework
                      </div>
                    </div>
                  </div>

                  {/* With Timeback */}
                  <div className="text-center font-cal">
                    <div className="bg-white border-2 border-timeback-primary rounded-xl p-4 space-y-3">
                      <h4 className="text-timeback-primary font-bold mb-3 font-cal text-sm">With Timeback</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-cal text-timeback-primary">Daily Time:</span>
                          <span className="font-bold text-xs font-cal text-timeback-primary">2 hours</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-cal text-timeback-primary">Love School:</span>
                          <span className="font-bold text-xs font-cal text-timeback-primary">90%+</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-cal text-timeback-primary">At Grade Level:</span>
                          <span className="font-bold text-xs font-cal text-timeback-primary">99%</span>
                        </div>
                      </div>
                      <div className="text-xs text-timeback-primary font-bold pt-2 border-t border-timeback-primary font-cal">
                        Zero homework
                      </div>
                    </div>
                  </div>
                </div>

                {/* Test Results Section */}
                <div className="bg-white border-2 border-timeback-primary rounded-xl p-5">
                  <h4 className="font-bold text-timeback-primary mb-4 text-center font-cal">MAP Test Results (Spring 2024)</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm font-cal">
                    <div className="flex justify-between items-center">
                      <span className="text-timeback-primary font-cal">Reading:</span>
                      <span className="font-bold text-timeback-primary font-cal">99th %</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-timeback-primary font-cal">Language:</span>
                      <span className="font-bold text-timeback-primary font-cal">99th %</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-timeback-primary font-cal">Science:</span>
                      <span className="font-bold text-timeback-primary font-cal">99th %</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-timeback-primary font-cal">SAT Avg:</span>
                      <span className="font-bold text-timeback-primary font-cal">1470+</span>
                    </div>
                  </div>
                </div>

                {/* Source Citation */}
                <div className="text-center pt-2 font-cal">
                  <p className="text-xs text-timeback-primary font-cal leading-tight opacity-75">
                    Source: Alpha School Spring 2024 MAP Results<br/>
                    500+ students • Top 1-2% every subject • &lt;2 hours daily
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
