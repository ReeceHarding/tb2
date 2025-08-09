'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { animationVariants, createStaggerVariants, ANIMATION_CONFIG } from '@/libs/animations';
import { PROGRESSIVE_DISCLOSURE_MAPPING, MainSection } from './ProgressiveDisclosureMapping';
import CustomQuestionSection from './CustomQuestionSection';

interface ProgressiveDisclosureHeroProps {
  onSectionSelect: (sectionId: string) => void;
  quizData: any;
}

export default function ProgressiveDisclosureHero({ onSectionSelect, quizData }: ProgressiveDisclosureHeroProps) {
  
  console.log('[ProgressiveDisclosureHero] Rendering hero buttons');
  console.log('[ProgressiveDisclosureHero] Animation test - component mounting with entrance animations');

  // State for LLM generated questions
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Get child's interests and school info for personalization
  const interests = quizData?.kidsInterests || [];
  const gradeLevel = quizData?.selectedSchools?.[0]?.level || 'high school';

  // LLM question generation function
  const generateLLMQuestion = useCallback(async () => {
    console.log('[ProgressiveDisclosureHero] Generating LLM question with timestamp:', new Date().toISOString());
    
    if (isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [generateLLMQuestion] Starting generation for user with interests:`, interests);
      console.log(`[${timestamp}] [generateLLMQuestion] Grade level:`, gradeLevel);
      console.log(`[${timestamp}] [generateLLMQuestion] Quiz data:`, quizData);
      
      const response = await fetch('/api/ai/generate-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizData,
          interests,
          gradeLevel,
          existingQuestions: PROGRESSIVE_DISCLOSURE_MAPPING.map(section => section.buttonText).concat(generatedQuestions),
          timestamp
        }),
      });

      console.log(`[${timestamp}] [generateLLMQuestion] API response status:`, response.status);

      if (!response.ok) {
        console.error(`[${timestamp}] [generateLLMQuestion] API error:`, response.status, response.statusText);
        throw new Error(`Failed to generate question: ${response.status}`);
      }

      const data = await response.json();
      console.log(`[${timestamp}] [generateLLMQuestion] Generated question received:`, data.question);
      
      const newQuestion = data.question;
      setGeneratedQuestions(prev => [...prev, newQuestion]);
      
      // Trigger the question as a new section
      onSectionSelect(`generated-${Date.now()}`);
      
    } catch (error) {
      console.error('[generateLLMQuestion] Error generating question:', error);
      // Fallback to a default personalized question
      const fallbackQuestion = `What specifically would help ${gradeLevel} students interested in ${interests.slice(0, 2).join(' and ')} succeed with TimeBack?`;
      setGeneratedQuestions(prev => [...prev, fallbackQuestion]);
      onSectionSelect(`generated-${Date.now()}`);
    } finally {
      setIsGenerating(false);
    }
  }, [quizData, interests, gradeLevel, generatedQuestions, onSectionSelect, isGenerating]);

  return (
    <>
      <motion.section 
        key="progressive-hero-section"
        className="max-w-7xl mx-auto py-24 lg:py-40 px-6 lg:px-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: ANIMATION_CONFIG.duration.fast }}
      >
        {/* Header Section with Enhanced Typography Hierarchy */}
        <motion.header 
          className="text-center mb-20 lg:mb-24 font-cal"
          variants={createStaggerVariants(ANIMATION_CONFIG.delays.medium, ANIMATION_CONFIG.delays.short)}
          initial="initial"
          animate="animate"
        >
          {/* Status Badge */}
          <motion.div 
            className="inline-flex items-center gap-3 backdrop-blur-sm bg-white/25 border border-timeback-primary/30 rounded-full px-8 py-4 mb-10 shadow-lg hover:shadow-xl transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: {
                duration: ANIMATION_CONFIG.duration.medium,
                ease: ANIMATION_CONFIG.easing.smooth,
                delay: 0.1
              }
            }}
          >
            <div className="w-3 h-3 bg-timeback-primary rounded-full animate-pulse shadow-sm"></div>
            <span className="text-timeback-primary font-bold text-sm font-cal tracking-wider uppercase">
              PERSONALIZED FOR YOU
            </span>
          </motion.div>
          
          {/* Main Heading */}
          <motion.h1 
            className="text-5xl lg:text-7xl xl:text-8xl font-bold text-timeback-primary mb-12 font-cal leading-[0.9] tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: {
                duration: ANIMATION_CONFIG.duration.slow,
                ease: ANIMATION_CONFIG.easing.smooth,
                delay: 0.3
              }
            }}
          >
            Where do you want to start?
          </motion.h1>
          
          {/* Primary Description */}
          <motion.p 
            className="text-xl lg:text-2xl xl:text-3xl text-timeback-primary max-w-5xl mx-auto font-cal leading-relaxed mb-6 font-medium"
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: {
                duration: ANIMATION_CONFIG.duration.slow,
                ease: ANIMATION_CONFIG.easing.smooth,
                delay: 0.5
              }
            }}
          >
            Click each section below to explore how TimeBack creates personalized learning experiences for your child
          </motion.p>
          
          {/* Personalization Context */}
          {interests.length > 0 && (
            <motion.div 
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: {
                  duration: ANIMATION_CONFIG.duration.slow,
                  ease: ANIMATION_CONFIG.easing.smooth,
                  delay: 0.7
                }
              }}
            >
              <p className="text-base lg:text-lg text-timeback-primary/80 font-cal leading-relaxed">
                Based on your <span className="font-semibold text-timeback-primary">{gradeLevel}</span> student&apos;s interests in{' '}
                <span className="font-semibold text-timeback-primary">
                  {interests.slice(0, 2).join(' and ')}
                </span>
              </p>
            </motion.div>
          )}
        </motion.header>

        {/* Main Action Grid - Sophisticated Layout */}
        <div className="space-y-8 lg:space-y-12">
          {/* Primary Actions - Top Row */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto"
            variants={createStaggerVariants(ANIMATION_CONFIG.delays.medium, ANIMATION_CONFIG.delays.short)}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            {PROGRESSIVE_DISCLOSURE_MAPPING.slice(0, 3).map((section: MainSection, index: number) => (
              <motion.button
                key={section.id}
                onClick={() => {
                  console.log(`[ProgressiveDisclosureHero] User clicked section: ${section.id}`);
                  onSectionSelect(section.id);
                }}
                className="group relative backdrop-blur-md bg-white/15 border-2 border-timeback-primary/40 rounded-2xl p-8 lg:p-10 text-center hover:bg-white/25 hover:border-timeback-primary/60 transition-all duration-500 shadow-xl hover:shadow-2xl hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-timeback-primary/30 focus:border-timeback-primary min-h-[140px] lg:min-h-[160px] flex items-center justify-center"
                aria-label={`Explore ${section.buttonText}`}
                variants={animationVariants.fadeInUp}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="space-y-2">
                  <h3 className="text-base lg:text-lg xl:text-xl font-bold text-timeback-primary font-cal leading-tight group-hover:scale-105 transition-transform duration-300">
                    {section.buttonText}
                  </h3>
                  <div className="w-8 h-0.5 bg-timeback-primary/30 mx-auto group-hover:bg-timeback-primary/60 transition-colors duration-300"></div>
                </div>
              </motion.button>
            ))}
          </motion.div>

          {/* Secondary Actions - Bottom Rows */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto"
            variants={createStaggerVariants(ANIMATION_CONFIG.delays.medium, ANIMATION_CONFIG.delays.short)}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            {PROGRESSIVE_DISCLOSURE_MAPPING.slice(3).map((section: MainSection, index: number) => (
              <motion.button
                key={section.id}
                onClick={() => {
                  console.log(`[ProgressiveDisclosureHero] User clicked section: ${section.id}`);
                  onSectionSelect(section.id);
                }}
                className="group relative backdrop-blur-md bg-white/12 border-2 border-timeback-primary/30 rounded-2xl p-6 lg:p-8 text-left hover:bg-white/20 hover:border-timeback-primary/50 transition-all duration-400 shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-timeback-primary/30 focus:border-timeback-primary min-h-[120px] flex items-center"
                aria-label={`Explore ${section.buttonText}`}
                variants={animationVariants.fadeInUp}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="space-y-3 w-full">
                  <h3 className="text-sm lg:text-base font-bold text-timeback-primary font-cal leading-tight group-hover:text-timeback-primary/90 transition-colors duration-300">
                    {section.buttonText}
                  </h3>
                  <div className="w-6 h-0.5 bg-timeback-primary/20 group-hover:bg-timeback-primary/40 group-hover:w-12 transition-all duration-300"></div>
                </div>
                <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                  <svg className="w-5 h-5 text-timeback-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.button>
            ))}
            
            {/* AI Generation Button - Special Treatment */}
            <motion.button
              onClick={() => {
                console.log(`[ProgressiveDisclosureHero] User clicked LLM generation`);
                generateLLMQuestion();
              }}
              disabled={isGenerating}
              className={`group relative backdrop-blur-md border-2 rounded-2xl p-6 lg:p-8 text-left transition-all duration-400 shadow-lg focus:outline-none focus:ring-4 focus:ring-timeback-primary/30 min-h-[120px] flex items-center border-dashed ${
                isGenerating 
                  ? 'bg-white/8 border-timeback-primary/20 cursor-not-allowed opacity-60' 
                  : 'bg-white/12 border-timeback-primary/40 hover:bg-white/20 hover:border-timeback-primary/60 hover:shadow-xl hover:-translate-y-0.5'
              }`}
              aria-label="Generate a personalized question for your child"
              variants={animationVariants.fadeInUp}
              whileHover={!isGenerating ? { y: -4, scale: 1.02 } : {}}
              whileTap={!isGenerating ? { scale: 0.95 } : {}}
            >
              <div className="space-y-3 w-full">
                <h3 className="text-sm lg:text-base font-bold text-timeback-primary font-cal leading-tight">
                  {isGenerating ? (
                    <span className="flex items-center gap-3">
                      <motion.div 
                        className="w-5 h-5 border-2 border-timeback-primary border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Generating your question...
                    </span>
                  ) : (
                    'Ask me something else personalized to your child'
                  )}
                </h3>
                {!isGenerating && (
                  <div className="w-6 h-0.5 bg-timeback-primary/20 group-hover:bg-timeback-primary/40 group-hover:w-12 transition-all duration-300"></div>
                )}
              </div>
              {!isGenerating && (
                <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                  <svg className="w-5 h-5 text-timeback-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              )}
            </motion.button>
          </motion.div>
        </div>

        {/* Integrated Custom Question Section */}
        <motion.div 
          className="mt-20 lg:mt-24"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={animationVariants.fadeInUp}
        >
          <div className="max-w-4xl mx-auto">
            {/* Section Divider */}
            <motion.div 
              className="flex items-center justify-center mb-12"
              variants={{
                initial: { opacity: 0, scaleX: 0 },
                animate: { 
                  opacity: 1, 
                  scaleX: 1,
                  transition: {
                    duration: ANIMATION_CONFIG.duration.slow,
                    ease: ANIMATION_CONFIG.easing.smooth,
                    delay: ANIMATION_CONFIG.delays.short
                  }
                }
              }}
            >
              <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-timeback-primary/20 to-transparent"></div>
              <motion.div 
                className="px-6"
                variants={{
                  initial: { scale: 0 },
                  animate: { 
                    scale: 1,
                    transition: {
                      duration: ANIMATION_CONFIG.duration.medium,
                      ease: ANIMATION_CONFIG.easing.smooth,
                      delay: ANIMATION_CONFIG.delays.medium
                    }
                  }
                }}
              >
                <div className="w-2 h-2 bg-timeback-primary/40 rounded-full"></div>
              </motion.div>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-timeback-primary/20 to-transparent"></div>
            </motion.div>
            
            {/* Custom Question Component with Enhanced Integration */}
            <motion.div 
              className="backdrop-blur-md bg-white/10 border border-timeback-primary/20 rounded-3xl p-8 lg:p-12 shadow-2xl"
              variants={{
                initial: { opacity: 0, y: 30, scale: 0.95 },
                animate: { 
                  opacity: 1, 
                  y: 0,
                  scale: 1,
                  transition: {
                    duration: ANIMATION_CONFIG.duration.slow,
                    ease: ANIMATION_CONFIG.easing.smooth,
                    delay: ANIMATION_CONFIG.delays.long
                  }
                }
              }}
              whileHover={{
                y: -2,
                transition: {
                  duration: ANIMATION_CONFIG.duration.fast,
                  ease: ANIMATION_CONFIG.easing.smooth
                }
              }}
            >
              <CustomQuestionSection />
            </motion.div>
          </div>
        </motion.div>
      </motion.section>
    </>
  );
}