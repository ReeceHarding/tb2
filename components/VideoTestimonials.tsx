'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SafeImage from './SafeImage';
import ErrorBoundary from './ErrorBoundary';
import type { Testimonial } from '@/libs/supabase';

interface VideoModalProps {
  testimonial: Testimonial | null;
  isOpen: boolean;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ testimonial, isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isOpen && testimonial) {
      setIsLoading(true);
      setHasError(false);
      
      // Track view count
      trackVideoView(testimonial.id);
    }
  }, [isOpen, testimonial]);

  const trackVideoView = async (testimonialId: string) => {
    try {
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testimonialId }),
      });
    } catch (error) {
      console.error('❌ Error tracking video view:', error);
    }
  };

  const handleVideoLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleVideoError = () => {
    console.error('❌ Video failed to load');
    setIsLoading(false);
    setHasError(true);
  };

  if (!isOpen || !testimonial) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
      onClick={onClose}
    >
      <div 
                    className="relative w-full max-w-4xl backdrop-blur-md bg-timeback-bg/90 rounded-xl shadow-2xl overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75 transition-opacity"
          aria-label="Close video"
        >
          ✕
        </button>

        {/* Video container */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
          {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-timeback-bg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-timeback-primary"></div>
            </div>
          )}
          
          {hasError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-timeback-bg">
              <div className="text-center">
                <p className="text-timeback-primary mb-4 font-cal">Unable to load video</p>
                <button
                  onClick={() => window.open(testimonial.video_url, '_blank')}
                  className="px-4 py-2 bg-timeback-primary text-white rounded-xl hover:bg-timeback-primary transition-colors font-cal"
                >
                  Open in New Tab
                </button>
              </div>
            </div>
          ) : (
            <video
              className="absolute inset-0 w-full h-full"
              controls
              autoPlay
              playsInline
              onLoadedData={handleVideoLoad}
              onError={handleVideoError}
              poster={testimonial.thumbnail_url || undefined}
            >
              <source src={testimonial.video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>


      </div>
    </div>
  );
};

interface VideoTestimonialsProps {
  featuredOnly?: boolean;
  limit?: number;
  className?: string;
  tag?: string; // Add tag filtering support
}

const VideoTestimonials: React.FC<VideoTestimonialsProps> = ({ 
  featuredOnly = true, 
  limit = 6,
  className = '',
  tag // Add tag parameter
}) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [allTestimonials, setAllTestimonials] = useState<Testimonial[]>([]);

  const fetchTestimonials = useCallback(async () => {
    console.log(`[VideoTestimonials] Fetching testimonials with tag: ${tag}, limit: ${limit}, featuredOnly: ${featuredOnly}`);
    try {
      const params = new URLSearchParams();
      if (featuredOnly) params.append('featured', 'true');
      if (limit) params.append('limit', limit.toString());
      if (tag) params.append('tag', tag);
      
      const response = await fetch(`/api/testimonials?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[VideoTestimonials] API response data:', data);
      setTestimonials(data.testimonials);
      console.log('[VideoTestimonials] Testimonials state set to:', data.testimonials.length, 'items');
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching testimonials:', err);
      setError(err instanceof Error ? err.message : 'Failed to load testimonials');
    } finally {
      setIsLoading(false);
      console.log('[VideoTestimonials] Loading finished. IsLoading:', false);
    }
  }, [featuredOnly, limit, tag]);

  const fetchAllTestimonials = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/testimonials');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setAllTestimonials(data.testimonials);
      setShowAll(true);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching all testimonials:', err);
      setError(err instanceof Error ? err.message : 'Failed to load all testimonials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAll = () => {
    if (showAll) {
      // Toggle back to limited view
      setShowAll(false);
    } else {
      // Fetch and show all testimonials
      fetchAllTestimonials();
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const openVideoModal = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
  };

  const closeVideoModal = () => {
    setSelectedTestimonial(null);
  };

  console.log('[VideoTestimonials] Rendering. Current testimonials state length:', testimonials.length);
  if (isLoading) {
    return (
      <div className={`flex justify-center items-center py-12 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-timeback-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-timeback-primary font-cal">Error loading testimonials: {error}</p>
        <button
          onClick={fetchTestimonials}
          className="mt-4 px-4 py-2 bg-timeback-primary text-white rounded-xl hover:bg-timeback-primary transition-colors font-cal"
        >
          Retry
        </button>
      </div>
    );
  }

  if (testimonials.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-timeback-primary font-cal">No video testimonials available</p>
      </div>
    );
  }

  // Determine which testimonials to display
  const displayTestimonials = showAll ? allTestimonials : testimonials;

  return (
    <ErrorBoundary 
      componentName="VideoTestimonials"
      fallbackMessage="Video testimonials are temporarily unavailable. Please refresh the page to try again."
    >
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {displayTestimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="group cursor-pointer backdrop-blur-md bg-timeback-bg/80 rounded-xl border border-timeback-primary overflow-hidden hover:shadow-xl transition-all duration-200"
            onClick={() => openVideoModal(testimonial)}
          >
            {/* Video thumbnail with play button */}
            <div className="relative aspect-video bg-timeback-bg">
              {testimonial.thumbnail_url ? (
                <SafeImage
                  src={testimonial.thumbnail_url}
                  alt={`${testimonial.title} thumbnail`}
                  fill
                  className="object-cover"
                  onError={() => {}}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-timeback-bg to-white flex items-center justify-center">
                  <div className="text-timeback-primary text-4xl">🎥</div>
                </div>
              )}
              
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-opacity">
                <div className="backdrop-blur-md bg-white/90 rounded-full p-4 group-hover:bg-white transition-all transform group-hover:scale-110">
                  <svg className="w-8 h-8 text-timeback-primary ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>

              {/* Duration badge */}
              {testimonial.duration_seconds && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {Math.floor(testimonial.duration_seconds / 60)}:{(testimonial.duration_seconds % 60).toString().padStart(2, '0')}
                </div>
              )}
            </div>


          </div>
        ))}
      </div>

      {/* View All Button */}
      {!showAll && testimonials.length >= (limit || 6) && (
        <div className="text-center mt-8">
          <button
            onClick={handleViewAll}
            className="inline-flex items-center gap-2 px-6 py-3 bg-timeback-primary text-white rounded-xl hover:bg-timeback-primary/90 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-cal"
          >
            <span>View All Student Testimonials</span>
            <svg 
              className="w-5 h-5 transition-transform duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Show Less Button */}
      {showAll && (
        <div className="text-center mt-8">
          <button
            onClick={handleViewAll}
            className="inline-flex items-center gap-2 px-6 py-3 bg-timeback-bg text-timeback-primary border border-timeback-primary rounded-xl hover:bg-timeback-primary hover:text-white transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-cal"
          >
            <svg 
              className="w-5 h-5 transition-transform duration-200 rotate-180" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>Show Less</span>
          </button>
        </div>
      )}

      {/* Video Modal */}
      <VideoModal
        testimonial={selectedTestimonial}
        isOpen={!!selectedTestimonial}
        onClose={closeVideoModal}
      />
    </ErrorBoundary>
  );
};

export default VideoTestimonials;