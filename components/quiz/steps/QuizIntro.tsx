'use client';

import React from 'react';

interface QuizIntroProps {
  onNext: () => void;
}

export default function QuizIntro({ onNext }: QuizIntroProps) {
  console.log('[QuizIntro] Rendering intro step');

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-5xl mx-auto px-4 relative font-cal">
      {/* Background pattern for visual interest */}
      <div className="absolute inset-0 -z-10 opacity-5">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-timeback-bg rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-timeback-bg rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-timeback-bg rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section with enhanced styling */}
      <div className="mb-16 space-y-8">
        {/* Badge for credibility */}
        <div className="inline-flex items-center px-4 py-2 bg-timeback-bg border border-timeback-primary rounded-full mb-6">
          <span className="flex h-2 w-2 rounded-full bg-timeback-primary mr-2"></span>
          <span className="text-sm font-medium text-timeback-primary font-cal">AI-Powered Educational Innovation</span>
        </div>

        {/* Main heading with gradient */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight font-cal">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-timeback-primary to-timeback-primary font-cal">
            The World{`'`}s First
          </span>
          <br />
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-timeback-primary to-timeback-primary font-cal">
            Self-Tailoring Website
          </span>
        </h1>

        {/* Enhanced description with better hierarchy */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <p className="text-xl sm:text-2xl text-timeback-primary font-medium leading-relaxed font-cal">
            Experience education that adapts to you
          </p>
          <p className="text-lg sm:text-xl text-timeback-primary leading-relaxed font-cal">
            Just like TimeBack creates personalized learning questions tailored to each child{`'`}s interests and level, we{`'`}ll generate a website experience customized specifically for you.
          </p>
        </div>

        {/* Quick stats for credibility */}
        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mt-10">
          <div className="text-center font-cal">
            <div className="text-3xl font-bold text-timeback-primary font-cal">6</div>
            <div className="text-sm text-timeback-primary font-cal">Quick Questions</div>
          </div>
          <div className="hidden sm:block w-px h-12 bg-timeback-bg"></div>
          <div className="text-center font-cal">
            <div className="text-3xl font-bold text-timeback-primary font-cal">100%</div>
            <div className="text-sm text-timeback-primary font-cal">Personalized</div>
          </div>
          <div className="hidden sm:block w-px h-12 bg-timeback-bg"></div>
          <div className="text-center font-cal">
            <div className="text-3xl font-bold text-timeback-primary font-cal">30s</div>
            <div className="text-sm text-timeback-primary font-cal">To Complete</div>
          </div>
        </div>
      </div>

      {/* Enhanced CTA button */}
      <div className="relative">
        <button
          onClick={onNext}
          className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-semibold bg-timeback-primary hover:bg-timeback-primary text-white rounded-xl shadow-2xl hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-timeback-bg font-cal"
        >
          <span className="mr-2">Let{`'`}s Get Started</span>
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}