"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

// Typewriter component for the animated text effect
function TypewriterText({ text, speed = 100 }: { text: string; speed?: number }) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    console.log(`[TypewriterText] Starting typewriter effect for text: "${text}"`);
    console.log(`[TypewriterText] Speed: ${speed}ms per character`);
    
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        const newChar = text[currentIndex];
        console.log(`[TypewriterText] Adding character: "${newChar}" at index ${currentIndex}`);
        setDisplayText(prev => prev + newChar);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else {
      console.log(`[TypewriterText] Typewriter effect completed. Final text: "${displayText}"`);
    }
  }, [currentIndex, text, speed, displayText]);

  useEffect(() => {
    console.log(`[TypewriterText] Text prop changed, resetting typewriter effect`);
    setDisplayText("");
    setCurrentIndex(0);
  }, [text]);

  return (
    <span className="inline">
      {displayText}
      <span 
        className="inline-block align-text-bottom ml-1 w-0.5 bg-timeback-primary animate-pulse" 
        style={{ height: "0.9em" }}
      />
    </span>
  );
}

// A simple error boundary to show a nice error page if something goes wrong (Error Boundary)
// Users can contact support, go to the main page or try to reset/refresh to fix the error
export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  console.log(`[Error Page] Error occurred:`, error);
  console.log(`[Error Page] Error message: ${error?.message}`);
  console.log(`[Error Page] Rendering new 404-style error page`);

  // Check if this is an image configuration error
  const isImageError = error?.message?.includes('next/image') || 
                      error?.message?.includes('hostname') || 
                      error?.message?.includes('not configured under images');
  
  // Check if this is specifically a Supabase image error
  const isSupabaseImageError = error?.message?.includes('supabase.co') && isImageError;
  
  console.log(`[Error Page] Is image error: ${isImageError}`);
  console.log(`[Error Page] Is Supabase image error: ${isSupabaseImageError}`);

  return (
    <section 
      className="relative min-h-screen w-full text-timeback-primary pt-20 md:pt-24 flex items-center justify-center bg-timeback-bg font-cal"
    >
      {/* Background decorative elements */}
      <div className="absolute top-1/4 left-8 w-16 h-1 bg-white rounded-xl opacity-60 rotate-45"></div>
      <div className="absolute bottom-1/4 right-8 w-12 h-1 bg-white rounded-xl opacity-40 -rotate-12"></div>
      <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-white rounded-xl opacity-70"></div>

      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="text-center space-y-8 lg:space-y-12">
          
          {/* Large ERROR text */}
          <div style={{ opacity: 1, transform: "none" }}>
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-cal font-black text-white/20 mb-4">
              ERROR
            </h1>
          </div>

          {/* Main heading and typewriter section */}
          <div className="mb-10">
            <h2 
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-cal uppercase tracking-tight leading-tight mb-6" 
              style={{ opacity: 1, transform: "none" }}
            >
              <span className="block mb-2">Oops!</span>
            </h2>
            
            <div className="relative h-[4em] sm:h-[4.8em] md:h-[5.6em] lg:h-[6.4em]">
              <div className="absolute top-0 left-0 w-full">
                <span className="text-timeback-primary font-cal uppercase text-lg sm:text-xl md:text-2xl lg:text-3xl max-w-4xl mx-auto inline">
                  <TypewriterText text="you are getting more education from this error than most schools provide" speed={80} />
                </span>
              </div>
            </div>
          </div>

          {/* Description text */}
          <p 
            className="text-lg sm:text-xl md:text-2xl font-cal mb-12 text-timeback-primary/80 leading-relaxed tracking-wide max-w-2xl mx-auto" 
            style={{ opacity: 1, transform: "none" }}
          >
            Do not worry, we will get you back to learning faster than the school system could ever dream of.
          </p>

          {/* Error message - specific for image errors or generic */}
          <div className="mb-8">
            {isImageError ? (
              <div className="space-y-4">
                <p className="text-sm md:text-base font-cal text-timeback-primary/70 bg-white/10 rounded-xl p-4 max-w-2xl mx-auto">
                  <strong>What happened:</strong> {isSupabaseImageError ? 
                    'There was an issue loading some images from our content storage. This is a temporary configuration issue that our team is resolving.' :
                    'There was an issue loading images on this page. This is typically a temporary issue.'
                  }
                </p>
                {error?.message && (
                  <details className="text-sm md:text-base font-cal text-timeback-primary/70 bg-white/10 rounded-xl p-4 max-w-2xl mx-auto">
                    <summary className="cursor-pointer font-bold mb-2">Technical Details</summary>
                    <div className="mt-2 p-2 bg-white/5 rounded font-mono text-xs break-all">
                      {error.message}
                    </div>
                  </details>
                )}
              </div>
            ) : (
              <p className="text-sm md:text-base font-cal text-timeback-primary/70 bg-white/10 rounded-xl p-4 max-w-2xl mx-auto">
                <strong>What happened:</strong> Something unexpected occurred while processing your request. Our team has been notified and we are working to resolve this issue quickly.
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div 
            className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center" 
            style={{ opacity: 1, transform: "none" }}
          >
            <button 
              onClick={() => {
                console.log(`[Error Page] Refresh button clicked, attempting to reset error`);
                reset();
              }}
              className="group relative bg-white font-cal font-black uppercase tracking-wider text-base md:text-lg px-6 md:px-8 py-3 md:py-4 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl w-full sm:w-auto text-timeback-primary"
              tabIndex={0}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again - Fix This Learning Experience
              </span>
              <div className="absolute -inset-1 rounded-xl bg-timeback-bg opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10"></div>
            </button>

            <Link
              href="/"
              className="group relative border-2 border-timeback-primary font-cal font-black uppercase tracking-wider text-sm md:text-base px-4 md:px-6 py-2 md:py-3 rounded-xl transition-all duration-300 w-full sm:w-auto text-timeback-primary"
              tabIndex={0}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Start Learning Journey
              </span>
            </Link>
          </div>



        </div>
      </div>
    </section>
  );
}
