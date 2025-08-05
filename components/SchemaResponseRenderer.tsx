'use client';

import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

interface SchemaResponse {
  header: string;
  main_heading: string;
  description: string;
  key_points: Array<{
    label: string;
    description: string;
  }>;
  next_options: string[];
}

interface SchemaResponseRendererProps {
  response: SchemaResponse;
  onNextOptionClick?: (option: string) => void;
  isLoading?: boolean;
}

export default function SchemaResponseRenderer({ 
  response, 
  onNextOptionClick,
  isLoading = false 
}: SchemaResponseRendererProps) {
  console.log('[SchemaResponseRenderer] Rendering schema response:', response);

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Enhanced Loading Animation */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <div className="w-10 h-10 border-4 border-timeback-bg rounded-full animate-spin border-t-timeback-primary shadow-lg"></div>
            <div className="absolute inset-2 bg-timeback-primary rounded-full opacity-20 animate-pulse"></div>
          </div>
          <div className="space-y-1">
            <div className="text-timeback-primary font-cal font-bold text-lg">TimeBack AI is crafting your personalized answer</div>
            <div className="text-timeback-primary/70 font-cal text-sm">Analyzing your child&apos;s unique learning profile...</div>
          </div>
        </div>
        
        {/* Skeleton Animation with Staggered Effects */}
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div className="h-6 bg-gradient-to-r from-timeback-bg via-timeback-bg/70 to-timeback-bg rounded-xl w-1/3 animate-pulse shadow-md"></div>
          
          {/* Main Heading Skeleton */}
          <div className="space-y-3">
            <div className="h-8 bg-gradient-to-r from-timeback-bg via-timeback-bg/70 to-timeback-bg rounded-xl w-3/4 animate-pulse shadow-md" style={{animationDelay: '0.1s'}}></div>
            <div className="h-8 bg-gradient-to-r from-timeback-bg via-timeback-bg/70 to-timeback-bg rounded-xl w-1/2 animate-pulse shadow-md" style={{animationDelay: '0.15s'}}></div>
          </div>
          
          {/* Description Skeleton */}
          <div className="space-y-2">
            <div className="h-5 bg-gradient-to-r from-timeback-bg via-timeback-bg/70 to-timeback-bg rounded-lg w-full animate-pulse shadow-md" style={{animationDelay: '0.2s'}}></div>
            <div className="h-5 bg-gradient-to-r from-timeback-bg via-timeback-bg/70 to-timeback-bg rounded-lg w-5/6 animate-pulse shadow-md" style={{animationDelay: '0.25s'}}></div>
            <div className="h-5 bg-gradient-to-r from-timeback-bg via-timeback-bg/70 to-timeback-bg rounded-lg w-4/5 animate-pulse shadow-md" style={{animationDelay: '0.3s'}}></div>
          </div>
          
          {/* Key Points Skeleton */}
          <div className="space-y-6">
            <div className="h-6 bg-gradient-to-r from-timeback-bg via-timeback-bg/70 to-timeback-bg rounded-lg w-1/4 animate-pulse shadow-md" style={{animationDelay: '0.35s'}}></div>
            {[1,2,3].map(i => (
              <div key={i} className="border-2 border-timeback-bg/50 rounded-xl p-6 bg-gradient-to-br from-white to-timeback-bg/10 shadow-lg animate-pulse" style={{animationDelay: `${0.4 + i * 0.1}s`}}>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-timeback-bg rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-gradient-to-r from-timeback-bg via-timeback-bg/70 to-timeback-bg rounded-lg w-2/3"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gradient-to-r from-timeback-bg via-timeback-bg/70 to-timeback-bg rounded w-full"></div>
                      <div className="h-4 bg-gradient-to-r from-timeback-bg via-timeback-bg/70 to-timeback-bg rounded w-4/5"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Next Options Skeleton */}
          <div className="space-y-4">
            <div className="h-6 bg-gradient-to-r from-timeback-bg via-timeback-bg/70 to-timeback-bg rounded-lg w-2/5 animate-pulse shadow-md" style={{animationDelay: '0.7s'}}></div>
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-16 bg-gradient-to-r from-timeback-bg via-timeback-bg/70 to-timeback-bg rounded-xl animate-pulse shadow-lg border-2 border-timeback-bg/50" style={{animationDelay: `${0.75 + i * 0.1}s`}}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="text-center py-8">
        <p className="text-timeback-primary font-cal">No response available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-cal animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Badge with Enhanced Animation */}
      <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-timeback-primary to-timeback-primary/90 text-white rounded-2xl text-sm font-bold shadow-xl hover:shadow-2xl transition-all duration-300 animate-in slide-in-from-left-2 delay-100">
        <span className="flex h-3 w-3 rounded-full bg-white mr-3 animate-pulse shadow-lg"></span>
        <span className="tracking-wide">{response.header}</span>
      </div>

      {/* Main Heading with Staggered Animation */}
      <h2 className="text-3xl sm:text-5xl font-bold text-timeback-primary leading-tight bg-gradient-to-br from-timeback-primary via-timeback-primary to-timeback-primary/80 bg-clip-text animate-in slide-in-from-bottom-4 delay-200">
        {response.main_heading}
      </h2>

      {/* Description with Enhanced Typography */}
      <p className="text-lg sm:text-xl text-timeback-primary leading-relaxed max-w-4xl animate-in slide-in-from-bottom-4 delay-300">
        {response.description}
      </p>

      {/* Key Points - The "1 2 3" Structure with Enhanced Animations */}
      <div className="space-y-6 animate-in slide-in-from-bottom-4 delay-400">
        <h3 className="text-2xl font-bold text-timeback-primary mb-6 flex items-center gap-3">
          <span className="w-8 h-1 bg-gradient-to-r from-timeback-primary to-timeback-bg rounded-full"></span>
          Key Insights
          <span className="w-8 h-1 bg-gradient-to-r from-timeback-bg to-timeback-primary rounded-full"></span>
        </h3>
        {response.key_points?.map((point, index) => (
          <div 
            key={index}
            className="group bg-gradient-to-br from-white via-timeback-bg/10 to-white border-2 border-timeback-primary rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:border-timeback-primary/80 animate-in slide-in-from-bottom-4"
            style={{animationDelay: `${500 + index * 150}ms`}}
          >
            <div className="flex items-start gap-6">
              {/* Enhanced Number Badge */}
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-timeback-primary to-timeback-primary/80 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                {index + 1}
              </div>
              
              <div className="flex-1 space-y-4">
                <h4 className="text-2xl font-bold text-timeback-primary group-hover:text-timeback-primary transition-colors duration-300">
                  {point.label}
                </h4>
                <p className="text-timeback-primary leading-relaxed text-lg group-hover:text-timeback-primary/90 transition-colors duration-300">
                  {point.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Next Options - Enhanced Interactive Buttons */}
      {response.next_options && response.next_options.length > 0 && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 delay-700">
          <h3 className="text-2xl font-bold text-timeback-primary flex items-center gap-3">
            <span className="w-8 h-1 bg-gradient-to-r from-timeback-primary to-timeback-bg rounded-full"></span>
            What would you like to explore next?
            <span className="w-8 h-1 bg-gradient-to-r from-timeback-bg to-timeback-primary rounded-full"></span>
          </h3>
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
            {response.next_options.map((option, index) => (
              <button
                key={index}
                onClick={() => onNextOptionClick?.(option)}
                className="group flex items-center justify-between p-6 bg-gradient-to-br from-white via-timeback-bg/5 to-white border-2 border-timeback-primary rounded-2xl hover:bg-gradient-to-br hover:from-timeback-bg hover:via-timeback-bg/80 hover:to-timeback-bg transition-all duration-500 text-left shadow-xl hover:shadow-2xl hover:scale-[1.03] hover:border-timeback-primary/80 animate-in slide-in-from-bottom-4"
                style={{animationDelay: `${800 + index * 100}ms`}}
              >
                <span className="text-timeback-primary font-semibold group-hover:text-timeback-primary flex-1 pr-4 text-base leading-snug">
                  {option}
                </span>
                <div className="flex-shrink-0 w-10 h-10 bg-timeback-primary group-hover:bg-timeback-primary/90 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-all duration-300 shadow-lg">
                  <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Trust Indicator */}
      <div className="flex items-center gap-4 text-sm text-timeback-primary bg-gradient-to-r from-timeback-bg via-white to-timeback-bg border-2 border-timeback-primary rounded-2xl p-4 shadow-lg animate-in slide-in-from-bottom-4 delay-900">
        <div className="flex-shrink-0 w-8 h-8 bg-timeback-primary rounded-full flex items-center justify-center shadow-md">
          <Check className="w-4 h-4 text-white" />
        </div>
        <span className="font-medium">All information sourced from TimeBack research and real student data</span>
      </div>
    </div>
  );
}