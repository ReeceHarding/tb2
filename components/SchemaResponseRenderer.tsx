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
      <div className="space-y-6 animate-pulse">
        <div className="h-4 bg-timeback-bg rounded w-1/3"></div>
        <div className="h-8 bg-timeback-bg rounded w-2/3"></div>
        <div className="h-20 bg-timeback-bg rounded"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-timeback-primary rounded-xl p-4">
              <div className="h-6 bg-timeback-bg rounded w-1/2 mb-2"></div>
              <div className="h-16 bg-timeback-bg rounded"></div>
            </div>
          ))}
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
    <div className="space-y-8 font-cal">
      {/* Header Badge */}
      <div className="inline-flex items-center px-4 py-2 bg-timeback-primary text-white rounded-xl text-sm font-semibold">
        <span className="flex h-2 w-2 rounded-full bg-white mr-2"></span>
        {response.header}
      </div>

      {/* Main Heading */}
      <h2 className="text-3xl sm:text-4xl font-bold text-timeback-primary leading-tight">
        {response.main_heading}
      </h2>

      {/* Description */}
      <p className="text-lg text-timeback-primary leading-relaxed">
        {response.description}
      </p>

      {/* Key Points - The "1 2 3" Structure */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-timeback-primary mb-4">Key Insights</h3>
        {response.key_points?.map((point, index) => (
          <div 
            key={index}
            className="bg-gradient-to-br from-timeback-bg to-white border-2 border-timeback-primary rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              {/* Number Badge */}
              <div className="flex-shrink-0 w-8 h-8 bg-timeback-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              
              <div className="flex-1">
                <h4 className="text-xl font-bold text-timeback-primary mb-3">
                  {point.label}
                </h4>
                <p className="text-timeback-primary leading-relaxed">
                  {point.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Next Options - Interactive Buttons */}
      {response.next_options && response.next_options.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-timeback-primary">What would you like to explore next?</h3>
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
            {response.next_options.map((option, index) => (
              <button
                key={index}
                onClick={() => onNextOptionClick?.(option)}
                className="group flex items-center justify-between p-4 bg-white border-2 border-timeback-primary rounded-xl hover:bg-timeback-bg transition-all duration-300 text-left shadow-lg hover:shadow-xl"
              >
                <span className="text-timeback-primary font-medium group-hover:text-timeback-primary flex-1 pr-3">
                  {option}
                </span>
                <ArrowRight className="w-5 h-5 text-timeback-primary group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trust Indicator */}
      <div className="flex items-center gap-2 text-sm text-timeback-primary bg-timeback-bg border border-timeback-primary rounded-xl p-3">
        <Check className="w-4 h-4 text-timeback-primary" />
        <span>All information sourced from TimeBack research and real student data</span>
      </div>
    </div>
  );
}