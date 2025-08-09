'use client';

import React, { useState, useEffect } from 'react';
import { Check, ArrowRight } from 'lucide-react';

// Custom typewriter hook for LLM-like animation - speed up ~4x
const useTypewriter = (text: string, speed = 4, startDelay = 0) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) {
      setDisplayText('');
      setIsComplete(true);
      return;
    }

    setDisplayText('');
    setIsComplete(false);
    
    const timer = setTimeout(() => {
      let currentIndex = 0;
      
      const typeInterval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          setIsComplete(true);
          clearInterval(typeInterval);
        }
      }, speed);

      return () => clearInterval(typeInterval);
    }, startDelay);

    return () => clearTimeout(timer);
  }, [text, speed, startDelay]);

  return { displayText, isComplete };
};

// Hook for multiple options with staggered animations - speed up ~4x
const useOptionsTypewriter = (options: string[], speed = 4, baseDelay = 0) => {
  const optionAnimations = options.map((option, index) => 
    useTypewriter(option, speed, baseDelay + (index * 400)) // 400ms between each option
  );

  return optionAnimations;
};

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
  response: SchemaResponse | null;
  onNextOptionClick?: (option: string) => void;
  isLoading?: boolean;
  hideNextOptions?: boolean;
  onRegenerateClick?: (type: 'evidence' | 'simpler' | 'different') => void;
  onCustomQuestionSubmit?: (question: string) => void;
}

export default function SchemaResponseRenderer({ 
  response, 
  onNextOptionClick,
  isLoading = false,
  hideNextOptions = true,
  onRegenerateClick,
  onCustomQuestionSubmit
}: SchemaResponseRendererProps) {
  const [customQuestion, setCustomQuestion] = useState('');
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);
  const isErrorResponse = !!response && typeof response.header === 'string' && response.header.toUpperCase().includes('ERROR');
  
  const handleCustomQuestionSubmit = async () => {
    if (!customQuestion.trim() || !onCustomQuestionSubmit || isSubmittingCustom) return;
    
    setIsSubmittingCustom(true);
    try {
      await onCustomQuestionSubmit(customQuestion.trim());
      setCustomQuestion('');
    } finally {
      setIsSubmittingCustom(false);
    }
  };
  
  console.log('[SchemaResponseRenderer] 🎭 COMPONENT CALLED - isLoading:', isLoading);
  
  // Typewriter animations for all content - faster speeds
  const headerText = useTypewriter(response?.header || "", 4, 0);
  const mainHeadingText = useTypewriter(response?.main_heading || "", 5, 200);
  // Render full description with typewriter effect (no truncation)
  const rawDescription = response?.description || "";
  const descriptionText = useTypewriter(rawDescription, 4, 400);
  const keyInsightsText = useTypewriter("Key Insights", 5, 600);
  const exploreText = useTypewriter("What would you like to explore next?", 5, 800);
  const trustText = useTypewriter("All information sourced from TimeBack research and real student data", 4, 1000);
  
  // Typewriter animations for key points - 3x faster
  const keyPointAnimations = (response?.key_points || []).map((point, index) => ({
    label: useTypewriter(point.label, 4, 700 + (index * 200)),
    description: useTypewriter(point.description, 4, 750 + (index * 200))
  }));
  
  // Typewriter animations for next options - 3x faster
  const optionAnimations = useOptionsTypewriter(
    response?.next_options || [], 
    4, 
    900 // Start after explore text
  );
  console.log('[SchemaResponseRenderer] 🎭 RESPONSE RECEIVED:', response);
  console.log('[SchemaResponseRenderer] 🎭 RESPONSE TYPE:', typeof response);
  console.log('[SchemaResponseRenderer] 🎭 RESPONSE IS NULL?', response === null);
  console.log('[SchemaResponseRenderer] 🎭 RESPONSE IS UNDEFINED?', response === undefined);
  if (response) {
    console.log('[SchemaResponseRenderer] 🎭 RESPONSE KEYS:', Object.keys(response));
    console.log('[SchemaResponseRenderer] 🎭 HEADER:', response.header);
    console.log('[SchemaResponseRenderer] 🎭 MAIN_HEADING:', response.main_heading);
    console.log('[SchemaResponseRenderer] 🎭 DESCRIPTION:', response.description);
    console.log('[SchemaResponseRenderer] 🎭 KEY_POINTS:', response.key_points);
    console.log('[SchemaResponseRenderer] 🎭 NEXT_OPTIONS:', response.next_options);
  }

  if (isLoading) {
    return (
      <div className="space-y-8 font-cal animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header Badge Skeleton */}
        <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-timeback-primary/20 to-timeback-primary/10 rounded-2xl animate-pulse">
          <span className="flex h-3 w-3 rounded-full bg-white/30 mr-3"></span>
          <span className="h-4 bg-timeback-primary/20 rounded w-40"></span>
        </div>

        {/* Main Heading Skeleton */}
        <div className="space-y-3">
          <div className="h-10 sm:h-12 bg-gradient-to-r from-timeback-primary/20 to-timeback-primary/10 rounded-xl w-3/4 animate-pulse"></div>
          <div className="h-10 sm:h-12 bg-gradient-to-r from-timeback-primary/20 to-timeback-primary/10 rounded-xl w-1/2 animate-pulse" style={{animationDelay: '0.1s'}}></div>
        </div>

        {/* Description Skeleton */}
        <div className="space-y-3 max-w-4xl">
          <div className="h-6 bg-timeback-primary/10 rounded-lg w-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="h-6 bg-timeback-primary/10 rounded-lg w-5/6 animate-pulse" style={{animationDelay: '0.25s'}}></div>
          <div className="h-6 bg-timeback-primary/10 rounded-lg w-4/5 animate-pulse" style={{animationDelay: '0.3s'}}></div>
        </div>

        {/* Key Insights Section Skeleton */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-timeback-primary/30 mb-6 flex items-center gap-3 animate-pulse">
            <span className="w-8 h-1 bg-timeback-primary/20 rounded-full"></span>
            <span className="h-7 bg-timeback-primary/20 rounded-lg w-32"></span>
            <span className="w-8 h-1 bg-timeback-primary/20 rounded-full"></span>
          </h3>
          
          {/* Key Points Skeleton */}
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="group bg-gradient-to-br from-white/50 via-timeback-bg/5 to-white/50 border-2 border-timeback-primary/20 rounded-2xl p-8 shadow-xl animate-pulse" 
              style={{animationDelay: `${0.35 + i * 0.15}s`}}
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-timeback-primary/20 to-timeback-primary/10 rounded-2xl"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-7 bg-timeback-primary/20 rounded-lg w-2/3"></div>
                  <div className="space-y-2">
                    <div className="h-5 bg-timeback-primary/10 rounded w-full"></div>
                    <div className="h-5 bg-timeback-primary/10 rounded w-5/6"></div>
                    <div className="h-5 bg-timeback-primary/10 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Status Message */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <div className="relative">
            <div className="w-8 h-8 border-3 border-timeback-bg rounded-full animate-spin border-t-timeback-primary"></div>
            <div className="absolute inset-1 bg-timeback-primary/20 rounded-full animate-pulse"></div>
          </div>
          <span className="text-timeback-primary font-medium animate-pulse">TimeBack AI is crafting your personalized answer...</span>
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
        <span className="tracking-wide">{headerText.displayText}</span>
      </div>

      {/* Main Heading with Staggered Animation */}
      <h2 className="text-3xl sm:text-5xl font-bold text-timeback-primary leading-tight bg-gradient-to-br from-timeback-primary via-timeback-primary to-timeback-primary/80 bg-clip-text animate-in slide-in-from-bottom-4 delay-200">
        {mainHeadingText.displayText}
      </h2>

      {/* Description with Enhanced Typography and Line Break Support */}
      <div className="text-lg sm:text-xl text-timeback-primary leading-relaxed max-w-4xl animate-in slide-in-from-bottom-4 delay-300 space-y-4">
        {descriptionText.displayText.split('\n\n').filter(paragraph => paragraph.trim()).map((paragraph, index) => (
          <p key={index} className="leading-relaxed whitespace-pre-line">
            {paragraph.trim()}
          </p>
        ))}
      </div>

      {/* Key Points - The "1 2 3" Structure with Enhanced Animations */}
      <div className="space-y-6 animate-in slide-in-from-bottom-4 delay-400">
        <h3 className="text-2xl font-bold text-timeback-primary mb-6 flex items-center gap-3">
          <span className="w-8 h-1 bg-gradient-to-r from-timeback-primary to-timeback-bg rounded-full"></span>
          {keyInsightsText.displayText}
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
                  {keyPointAnimations[index]?.label.displayText || ''}
                </h4>
                <div className="text-timeback-primary leading-relaxed text-lg group-hover:text-timeback-primary/90 transition-colors duration-300 space-y-3">
                  {(keyPointAnimations[index]?.description.displayText || '').split('\n\n').filter(paragraph => paragraph.trim()).map((paragraph, pIndex) => (
                    <p key={pIndex} className="leading-relaxed whitespace-pre-line">
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Next Options - Enhanced Interactive Buttons (force-hidden for personalized page to prevent auto section) */}
      {!hideNextOptions && false && response.next_options && response.next_options.length > 0 && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 delay-700">
          <h3 className="text-2xl font-bold text-timeback-primary flex items-center gap-3">
            <span className="w-8 h-1 bg-gradient-to-r from-timeback-primary to-timeback-bg rounded-full"></span>
            {exploreText.displayText}
            <span className="w-8 h-1 bg-gradient-to-r from-timeback-bg to-timeback-primary rounded-full"></span>
          </h3>
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
            {response.next_options.map((option, index) => (
              <button
                key={index}
                onClick={() => onNextOptionClick?.(option)}
                className="group flex items-center justify-between p-6 bg-gradient-to-br from-white via-timeback-bg/5 to-white border-2 border-timeback-primary rounded-2xl hover:bg-gradient-to-br hover:from-timeback-bg transition-all duration-300 text-left shadow-xl hover:shadow-2xl"
                style={{animationDelay: `${800 + index * 100}ms`}}
              >
                <span className="text-timeback-primary font-semibold text-timeback-primary flex-1 pr-4 text-base leading-snug">
                  {optionAnimations[index]?.displayText || ''}
                </span>
                <div className="flex-shrink-0 w-10 h-10 bg-timeback-primary rounded-xl flex items-center justify-center shadow-lg">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Trust Indicator */}
      <div className="flex items-center gap-4 text-sm text-timeback-primary bg-gradient-to-r from-timeback-bg via-white to-timeback-bg border-2 border-timeback-primary rounded-2xl p-4 shadow-lg animate-in slide-in-from-bottom-4 delay-900">
        <div className="flex-shrink-0 w-8 h-8 bg-timeback-primary rounded-full flex items-center justify-center shadow-lg">
          <Check className="w-4 h-4 text-white" />
        </div>
        <span className="font-medium">{trustText.displayText}</span>
      </div>

      {/* Interactive Response Options - Only show for non-loading, completed responses */}
      {!isLoading && response && !isErrorResponse && (onRegenerateClick || onCustomQuestionSubmit) && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 delay-1000">
          {/* Regenerate Response Buttons */}
          {onRegenerateClick && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-timeback-primary flex items-center gap-3">
                <span className="w-6 h-1 bg-gradient-to-r from-timeback-primary to-timeback-bg rounded-full"></span>
                Write again with:
                <span className="w-6 h-1 bg-gradient-to-r from-timeback-bg to-timeback-primary rounded-full"></span>
              </h3>
              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
                <button
                  onClick={() => onRegenerateClick('evidence')}
                  className="group flex items-center justify-center p-4 bg-gradient-to-br from-white via-timeback-bg/5 to-white border-2 border-timeback-primary rounded-xl hover:bg-gradient-to-br hover:from-timeback-bg hover:to-timeback-bg/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <span className="text-timeback-primary font-semibold text-center font-cal">
                    More Evidence
                  </span>
                </button>
                <button
                  onClick={() => onRegenerateClick('simpler')}
                  className="group flex items-center justify-center p-4 bg-gradient-to-br from-white via-timeback-bg/5 to-white border-2 border-timeback-primary rounded-xl hover:bg-gradient-to-br hover:from-timeback-bg hover:to-timeback-bg/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <span className="text-timeback-primary font-semibold text-center font-cal">
                    Simpler Language
                  </span>
                </button>
                <button
                  onClick={() => onRegenerateClick('different')}
                  className="group flex items-center justify-center p-4 bg-gradient-to-br from-white via-timeback-bg/5 to-white border-2 border-timeback-primary rounded-xl hover:bg-gradient-to-br hover:from-timeback-bg hover:to-timeback-bg/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <span className="text-timeback-primary font-semibold text-center font-cal">
                    Different Approach
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Custom Follow-up Question Section */}
          {onCustomQuestionSubmit && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-timeback-primary flex items-center gap-3">
                <span className="w-6 h-1 bg-gradient-to-r from-timeback-primary to-timeback-bg rounded-full"></span>
                Ask a custom follow-up question:
                <span className="w-6 h-1 bg-gradient-to-r from-timeback-bg to-timeback-primary rounded-full"></span>
              </h3>
              <div className="space-y-4 bg-gradient-to-br from-white via-timeback-bg/5 to-white border-2 border-timeback-primary rounded-xl p-6 shadow-lg">
                <textarea
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="Type your specific question about TimeBack..."
                  className="w-full h-24 p-4 border-2 border-timeback-primary/30 rounded-xl resize-none focus:border-timeback-primary focus:outline-none focus:ring-2 focus:ring-timeback-primary/20 font-cal text-timeback-primary placeholder-timeback-primary/50 bg-white/80"
                  disabled={isSubmittingCustom}
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleCustomQuestionSubmit}
                    disabled={!customQuestion.trim() || isSubmittingCustom}
                    className="px-6 py-3 bg-gradient-to-r from-timeback-primary to-timeback-primary/90 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-cal"
                  >
                    {isSubmittingCustom ? 'Submitting...' : 'Ask Question'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}