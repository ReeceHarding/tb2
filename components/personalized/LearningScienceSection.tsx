'use client';

import React, { useState } from 'react';

interface LearningScienceSectionProps {
  learningGoals: string[];
  interests?: string[];
  quizData?: any;
  gradeLevel?: string;
  onLearnMore: (_section: string) => void;
}





export default function LearningScienceSection({ 
  learningGoals, 
  interests = [], 
  quizData: _quizData, 
  gradeLevel: _gradeLevel, 
  onLearnMore: _onLearnMore 
}: LearningScienceSectionProps) {
  const [showStudyLinks, setShowStudyLinks] = useState(true);
  const [expandedStudy, setExpandedStudy] = useState<string | null>(null);
  
  console.log('[LearningScienceSection] Rendering with learning goals:', learningGoals);
  console.log('[LearningScienceSection] Interests:', interests);

  return (
    <section className="max-w-7xl mx-auto  py-20 lg:py-32 px-6 lg:px-12">
      {/* Header */}
      <div className="text-center mb-16 font-cal">
        <div className="inline-flex items-center gap-2 backdrop-blur-sm bg-white/20 border border-timeback-primary rounded-full px-6 py-3 mb-8">
          <div className="w-3 h-3 bg-timeback-primary rounded-full animate-pulse"></div>
          <span className="text-timeback-primary font-bold text-sm font-cal">SCIENTIFIC RESEARCH</span>
        </div>
        <h2 className="text-4xl lg:text-6xl font-bold text-timeback-primary mb-8 font-cal">
          Here&apos;s the Science Behind TimeBack
        </h2>
        <p className="text-2xl text-timeback-primary max-w-5xl mx-auto font-cal leading-relaxed">
          Our revolutionary approach is backed by decades of peer-reviewed research from the world&apos;s leading educational institutions. 
          Each study below demonstrates how TimeBack transforms theoretical breakthroughs into practical results for your child.
        </p>
      </div>

      {/* Research Studies Section - AI-Enhanced */}
      <div className="py-8 mb-8">
        
        {!showStudyLinks ? (
          <div className="text-center font-cal">
            <button
              onClick={() => setShowStudyLinks(true)}
              className="px-8 py-4 backdrop-blur-md bg-white/10 border-2 border-timeback-primary text-timeback-primary rounded-xl hover:bg-white/20 transition-all duration-200 font-bold font-cal shadow-2xl hover:shadow-2xl transform hover:scale-105"
            >
              See The Research Behind TimeBack
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Research paper cards in grid layout */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Bloom's 2 Sigma Problem - Research Paper Card */}
              <div className="backdrop-blur-md bg-white/10 rounded-xl shadow-2xl hover:shadow-2xl transition-all duration-300 overflow-hidden group border-2 border-timeback-primary">
                {/* Paper preview image */}
                <div className="relative h-48  overflow-hidden">
                  <div className="absolute inset-0 p-6">
                    <div className="backdrop-blur-sm bg-white/30 rounded-xl shadow-sm p-4 transform rotate-3 group-hover:rotate-2 transition-transform border border-timeback-primary">
                      <div className="space-y-2">
                        <div className="h-2 bg-timeback-bg border border-timeback-primary rounded w-3/4"></div>
                        <div className="h-2 bg-timeback-bg border border-timeback-primary rounded w-full"></div>
                        <div className="h-2 bg-timeback-bg border border-timeback-primary rounded w-5/6"></div>
                        <div className="mt-4">
                          <div className="h-20 bg-timeback-bg border border-timeback-primary rounded flex items-center justify-center">
                            <div className="text-timeback-primary font-bold text-2xl font-cal">2σ</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-timeback-primary text-white px-3 py-1 rounded-full text-xs font-bold font-cal">
                    MIT • 1984
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <h4 className="text-xl font-bold text-timeback-primary mb-2 font-cal">{`Bloom's 2 Sigma Problem`}</h4>
                  <p className="text-sm text-timeback-primary mb-3 font-cal">Benjamin S. Bloom • Educational Researcher</p>
                  
                  <p className="text-timeback-primary mb-4 font-cal">
                    Groundbreaking research demonstrating that 1-on-1 tutoring produces a 2 standard deviation improvement - 
                    moving average students to the top 2% of achievement.
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-timeback-primary font-cal">
                      <span className="flex items-center gap-1 font-cal">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Education Theory
                      </span>
                      <span className="flex items-center gap-1 font-cal">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        8 pages
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setExpandedStudy(expandedStudy === 'blooms' ? null : 'blooms')}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-timeback-bg hover:bg-timeback-primary text-timeback-primary hover:text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 border border-timeback-primary font-cal"
                  >
                    {expandedStudy === 'blooms' ? 'Hide Details' : 'View Abstract'}
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${
                        expandedStudy === 'blooms' ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {expandedStudy === 'blooms' && (
                    <div className="mt-4 pt-4 border-t border-timeback-primary border-opacity-30">
                      <h5 className="font-semibold text-timeback-primary mb-2 font-cal">How TimeBack Applies This Research:</h5>
                      <p className="text-timeback-primary mb-3 font-cal">
                        {`TimeBack's`} AI tutors provide exactly what Bloom discovered - personalized 1-on-1 instruction that adapts to each student. 
                        This is why our students consistently achieve 2x faster learning and reach the 98th percentile.
                      </p>
                      <a 
                        href="https://web.mit.edu/5.95/readings/bloom-two-sigma.pdf" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-timeback-primary hover:text-timeback-primary hover:opacity-80 text-sm font-medium group font-cal"
                      >
                        Read full paper (PDF)
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Mastery Learning - Research Paper Card */}
              <div className="backdrop-blur-md bg-white/10 rounded-xl shadow-2xl hover:shadow-2xl transition-all duration-300 overflow-hidden group border-2 border-timeback-primary">
                {/* Paper preview image */}
                <div className="relative h-48  overflow-hidden">
                  <div className="absolute inset-0 p-6">
                    <div className="backdrop-blur-sm bg-white/30 rounded-xl shadow-sm p-4 transform -rotate-3 group-hover:-rotate-2 transition-transform border border-timeback-primary">
                      <div className="space-y-2">
                        <div className="h-2 bg-timeback-bg border border-timeback-primary rounded w-5/6"></div>
                        <div className="h-2 bg-timeback-bg border border-timeback-primary rounded w-full"></div>
                        <div className="h-2 bg-timeback-bg border border-timeback-primary rounded w-4/5"></div>
                        <div className="mt-4">
                          <div className="h-20 bg-timeback-bg border border-timeback-primary rounded flex items-center justify-center">
                            <svg className="w-12 h-12 text-timeback-primary font-cal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-timeback-primary text-white px-3 py-1 rounded-full text-xs font-bold font-cal">
                    ERIC • 1968
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <h4 className="text-xl font-bold text-timeback-primary mb-2 font-cal">Mastery-Based Learning</h4>
                  <p className="text-sm text-timeback-primary mb-3 font-cal">James H. Block & Benjamin S. Bloom • Educational Psychology</p>
                  
                  <p className="text-timeback-primary mb-4 font-cal">
                    Revolutionary approach requiring 90% mastery before advancement, eliminating learning gaps and ensuring 
                    deep understanding of each concept.
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-timeback-primary font-cal">
                      <span className="flex items-center gap-1 font-cal">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Learning Theory
                      </span>
                      <span className="flex items-center gap-1 font-cal">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        12 pages
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setExpandedStudy(expandedStudy === 'mastery' ? null : 'mastery')}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-timeback-bg hover:bg-timeback-primary text-timeback-primary hover:text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 border border-timeback-primary font-cal"
                  >
                    {expandedStudy === 'mastery' ? 'Hide Details' : 'View Abstract'}
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${
                        expandedStudy === 'mastery' ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {expandedStudy === 'mastery' && (
                    <div className="mt-4 pt-4 border-t border-timeback-primary border-opacity-30">
                      <h5 className="font-semibold text-timeback-primary mb-2 font-cal">How TimeBack Applies This Research:</h5>
                      <p className="text-timeback-primary mb-3 font-cal">
                        TimeBack requires 90% mastery before any student advances. Our AI continuously assesses understanding, 
                        ensuring no knowledge gaps form. This prevents the cumulative learning deficits seen in traditional education.
                      </p>
                      <a 
                        href="https://files.eric.ed.gov/fulltext/ED382567.pdf" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-timeback-primary hover:text-timeback-primary hover:opacity-80 text-sm font-medium group font-cal"
                      >
                        Read full paper (PDF)
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Zone of Proximal Development - Research Paper Card */}
              <div className="backdrop-blur-md bg-white/10 rounded-xl shadow-2xl hover:shadow-2xl transition-all duration-300 overflow-hidden group border-2 border-timeback-primary">
                {/* Paper preview image */}
                <div className="relative h-48  overflow-hidden">
                  <div className="absolute inset-0 p-6">
                    <div className="backdrop-blur-sm bg-white/30 rounded-xl shadow-sm p-4 transform rotate-2 group-hover:rotate-1 transition-transform border border-timeback-primary">
                      <div className="space-y-2">
                        <div className="h-2 bg-timeback-bg border border-timeback-primary rounded w-4/5"></div>
                        <div className="h-2 bg-timeback-bg border border-timeback-primary rounded w-full"></div>
                        <div className="h-2 bg-timeback-bg border border-timeback-primary rounded w-3/4"></div>
                        <div className="mt-4">
                          <div className="h-20 bg-timeback-bg border border-timeback-primary rounded flex items-center justify-center">
                            <svg className="w-12 h-12 text-timeback-primary font-cal" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2M6.5,12.5L7.5,16.5L11.5,17.5L7.5,18.5L6.5,22.5L5.5,18.5L1.5,17.5L5.5,16.5L6.5,12.5M17.5,12.5L18.5,16.5L22.5,17.5L18.5,18.5L17.5,22.5L16.5,18.5L12.5,17.5L16.5,16.5L17.5,12.5Z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-timeback-primary text-white px-3 py-1 rounded-full text-xs font-bold font-cal">
                    USSR • 1978
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <h4 className="text-xl font-bold text-timeback-primary mb-2 font-cal">Zone of Proximal Development</h4>
                  <p className="text-sm text-timeback-primary mb-3 font-cal">Lev Vygotsky • Developmental Psychology</p>
                  
                  <p className="text-timeback-primary mb-4 font-cal">
                    Learning happens best when content is just slightly challenging. This theory established the optimal 
                    difficulty zone for accelerated learning and skill acquisition.
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-timeback-primary font-cal">
                      <span className="flex items-center gap-1 font-cal">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Learning Theory
                      </span>
                      <span className="flex items-center gap-1 font-cal">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        15 pages
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setExpandedStudy(expandedStudy === 'zpd' ? null : 'zpd')}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-timeback-bg hover:bg-timeback-primary text-timeback-primary hover:text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 border border-timeback-primary font-cal"
                  >
                    {expandedStudy === 'zpd' ? 'Hide Details' : 'View Abstract'}
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${
                        expandedStudy === 'zpd' ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {expandedStudy === 'zpd' && (
                    <div className="mt-4 pt-4 border-t border-timeback-primary border-opacity-30">
                      <h5 className="font-semibold text-timeback-primary mb-2 font-cal">How TimeBack Applies This Research:</h5>
                      <p className="text-timeback-primary mb-3 font-cal">
                        {`TimeBack's`} AI continuously adjusts difficulty to keep students in their optimal learning zone, 
                        never too easy or too hard. This ensures maximum learning velocity while maintaining engagement.
                      </p>
                      <a 
                        href="https://www.simplypsychology.org/zone-of-proximal-development.html" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-timeback-primary hover:text-timeback-primary hover:opacity-80 text-sm font-medium group font-cal"
                      >
                        Learn about ZPD
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Adaptive Learning Technology - Research Paper Card */}
              <div className="backdrop-blur-md bg-white/10 rounded-xl shadow-2xl hover:shadow-2xl transition-all duration-300 overflow-hidden group border-2 border-timeback-primary">
                {/* Paper preview image */}
                <div className="relative h-48  overflow-hidden">
                  <div className="absolute inset-0 p-6">
                    <div className="backdrop-blur-sm bg-white/30 rounded-xl shadow-sm p-4 transform -rotate-2 group-hover:-rotate-1 transition-transform border border-timeback-primary">
                      <div className="space-y-2">
                        <div className="h-2 bg-timeback-bg border border-timeback-primary rounded w-full"></div>
                        <div className="h-2 bg-timeback-bg border border-timeback-primary rounded w-4/5"></div>
                        <div className="h-2 bg-timeback-bg border border-timeback-primary rounded w-5/6"></div>
                        <div className="mt-4">
                          <div className="h-20 bg-timeback-bg border border-timeback-primary rounded flex items-center justify-center">
                            <svg className="w-12 h-12 text-timeback-primary font-cal" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,19H5V5H19V19Z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-timeback-primary text-white px-3 py-1 rounded-full text-xs font-bold font-cal">
                    RAND • 2017
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <h4 className="text-xl font-bold text-timeback-primary mb-2 font-cal">Adaptive Learning Technology</h4>
                  <p className="text-sm text-timeback-primary mb-3 font-cal">RAND Corporation • Educational Technology Research</p>
                  
                  <p className="text-timeback-primary mb-4 font-cal">
                    Comprehensive study demonstrating that AI-driven adaptive learning systems can accelerate student 
                    achievement by 2x compared to traditional instruction methods.
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-timeback-primary font-cal">
                      <span className="flex items-center gap-1 font-cal">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        EdTech Research
                      </span>
                      <span className="flex items-center gap-1 font-cal">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        42 pages
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setExpandedStudy(expandedStudy === 'adaptive' ? null : 'adaptive')}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-timeback-bg hover:bg-timeback-primary text-timeback-primary hover:text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 border border-timeback-primary font-cal"
                  >
                    {expandedStudy === 'adaptive' ? 'Hide Details' : 'View Abstract'}
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${
                        expandedStudy === 'adaptive' ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {expandedStudy === 'adaptive' && (
                    <div className="mt-4 pt-4 border-t border-timeback-primary border-opacity-30">
                      <h5 className="font-semibold text-timeback-primary mb-2 font-cal">How TimeBack Applies This Research:</h5>
                      <p className="text-timeback-primary mb-3 font-cal">
                        {`TimeBack's`} AI continuously monitors every student interaction, instantly identifying knowledge gaps 
                        and providing targeted support. This creates the individualized learning plan that research proves accelerates learning 2x faster.
                      </p>
                      <a 
                        href="https://www.rand.org/pubs/research_reports/RR2852.html" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-timeback-primary hover:text-timeback-primary hover:opacity-80 text-sm font-medium group font-cal"
                      >
                        Read RAND study on adaptive learning
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </div>

            </div>

            <div className="text-center pt-4 font-cal">
              <button
                onClick={() => setShowStudyLinks(false)}
                className="px-6 py-3 text-timeback-primary hover:text-timeback-primary hover:opacity-80 font-medium hover:bg-timeback-bg rounded-xl transition-colors duration-200 font-cal"
              >
                {`Hide Research`}
              </button>
            </div>
          </div>
        )}
      </div>



      {/* Learn More button */}
      <div className="flex justify-center mt-8">
        <button 
                      onClick={() => _onLearnMore('learning-science')}
          className="px-6 py-3 border-2 border-timeback-primary text-timeback-primary bg-transparent rounded-xl hover:bg-timeback-bg transition-all duration-200 transform hover:scale-105 font-cal"
        >
          Get AI insights on the research behind our methods
        </button>
      </div>
    </section>
  );
}