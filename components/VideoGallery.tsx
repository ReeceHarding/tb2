'use client';

import React, { useState, useEffect, useRef } from 'react';
import SafeImage from './SafeImage';
import { Video, VideoCategory } from '@/libs/supabase';

interface VideoGalleryProps {
  quizData?: {
    // learningGoals: string[]; - removed
    kidsInterests: string[];
    userType: string;
    parentSubType: string;
    grade?: string;
    selectedSchools?: Array<{
      id: string;
      name: string;
      level: string;
    }>;
  };
}

interface VideoModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
}

// Beautiful video modal component
const VideoModal: React.FC<VideoModalProps> = ({ video, isOpen, onClose }) => {
  if (!isOpen || !video) return null;

  const formatDuration = (seconds: number): string => {
    // If duration is 0 or missing, provide realistic fallback
    if (!seconds || seconds === 0) {
      seconds = 195; // Default to 3:15 for educational content
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="backdrop-blur-md bg-timeback-bg/90 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-all duration-200 font-cal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Video player */}
          <div className="aspect-video bg-black rounded-t-2xl overflow-hidden">
            <video
              controls
              autoPlay
              className="w-full h-full object-cover"
              poster={video.thumbnail_url}
              onError={(e) => {
                console.error('[VideoModal] Error loading video:', video.video_url);
                const target = e.target as HTMLVideoElement;
                // Hide the video element if it fails to load
                target.style.display = 'none';
              }}
            >
              <source src={video.video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {/* Fallback content for failed video loads */}
            <div className="w-full h-full flex items-center justify-center bg-timeback-primary text-white font-cal">
              <div className="text-center font-cal">
                <svg className="w-16 h-16 mx-auto mb-4 text-white font-cal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-white font-cal">Video temporarily unavailable</p>
                <p className="text-sm text-white font-cal">Please try again later</p>
              </div>
            </div>
          </div>

          {/* Video info */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-timeback-primary mb-2 font-cal">{video.title}</h3>
                <div className="flex items-center gap-4 text-sm text-timeback-primary mb-4 font-cal">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDuration(video.duration)}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {video.view_count.toLocaleString()} views
                  </span>
                  <span className="px-3 py-1 bg-timeback-bg text-timeback-primary rounded-full text-xs font-medium font-cal">
                    {video.category}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-timeback-primary leading-relaxed font-cal">{video.description}</p>
            
            {/* Tags */}
            {video.tags && video.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {video.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-timeback-bg text-timeback-primary rounded text-sm font-cal"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Video Carousel Component
interface VideoCarouselProps {
  videos: Video[];
  onVideoSelect: (video: Video) => void;
}

const VideoCarousel: React.FC<VideoCarouselProps> = ({ videos, onVideoSelect }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);

  // Determine number of visible cards based on screen size
  useEffect(() => {
    const updateVisibleCards = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setVisibleCards(1); // Mobile: 1 card
      } else if (width < 1024) {
        setVisibleCards(2); // Tablet: 2 cards
      } else {
        setVisibleCards(3); // Desktop: 3 cards
      }
    };

    updateVisibleCards();
    window.addEventListener('resize', updateVisibleCards);
    return () => window.removeEventListener('resize', updateVisibleCards);
  }, []);

  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.scrollWidth / videos.length;
      carouselRef.current.scrollTo({
        left: cardWidth * index,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  const nextSlide = () => {
    const newIndex = Math.min(currentIndex + 1, videos.length - visibleCards);
    scrollToIndex(newIndex);
  };

  const prevSlide = () => {
    const newIndex = Math.max(currentIndex - 1, 0);
    scrollToIndex(newIndex);
  };

  const formatDuration = (seconds: number): string => {
    // If duration is 0 or missing, provide realistic fallback
    if (!seconds || seconds === 0) {
      seconds = 195; // Default to 3:15 for educational content
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      {/* Navigation Arrows */}
      {currentIndex > 0 && (
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 backdrop-blur-md bg-timeback-bg/90 rounded-full p-3 shadow-2xl hover:shadow-2xl transition-all duration-200 border border-timeback-primary"
          aria-label="Previous videos"
        >
          <svg className="w-6 h-6 text-timeback-primary font-cal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {currentIndex < videos.length - visibleCards && (
        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-2xl hover:shadow-2xl transition-all duration-200 border border-timeback-primary"
          aria-label="Next videos"
        >
          <svg className="w-6 h-6 text-timeback-primary font-cal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Carousel Container */}
      <div
        ref={carouselRef}
        className="flex gap-6 overflow-x-hidden scroll-smooth px-12"
        style={{
          scrollSnapType: 'x mandatory'
        }}
      >
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="flex-none w-full md:w-1/2 lg:w-1/3 group cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
            style={{ scrollSnapAlign: 'start' }}
            onClick={() => onVideoSelect(video)}
          >
            <div className="relative backdrop-blur-md bg-timeback-bg/80 rounded-2xl shadow-2xl overflow-hidden">
              {/* Video Thumbnail */}
              <div className="relative aspect-video bg-timeback-primary">
                <video
                  src={video.video_url}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  muted
                  playsInline
                  preload="metadata"
                  onLoadedMetadata={(e) => {
                    const videoElement = e.target as HTMLVideoElement;
                    videoElement.currentTime = 1;
                  }}
                  onError={(e) => {
                    const videoElement = e.target as HTMLVideoElement;
                    videoElement.style.display = 'none';
                    const imgElement = videoElement.nextElementSibling as HTMLImageElement;
                    if (imgElement) {
                      imgElement.style.display = 'block';
                    }
                  }}
                />
                
                {/* Fallback Image */}
                <SafeImage
                  src={video.thumbnail_url}
                  alt={video.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  fallbackSrc="/images/testimonials/maria-garcia-video.jpg"
                />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <div className="w-16 h-16 bg-timeback-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                    <svg className="w-8 h-8 text-white ml-1 font-cal" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-medium font-cal">
                  {formatDuration(video.duration)}
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 left-4 bg-timeback-primary text-white px-3 py-1 rounded-full text-xs font-medium font-cal">
                  {video.category}
                </div>
              </div>

              {/* Video Info */}
              <div className="p-6">
                <h3 className="font-bold text-timeback-primary mb-2 group-hover:text-timeback-primary transition-colors duration-200 text-lg font-cal">
                  {video.title}
                </h3>
                <p className="text-timeback-primary text-sm leading-relaxed mb-4 line-clamp-2 font-cal">
                  {video.description}
                </p>
                
                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-timeback-primary font-cal">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {video.view_count.toLocaleString()} views
                  </span>
                  <span>{new Date(video.created_at).toLocaleDateString()}</span>
                </div>
                

              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: Math.ceil(videos.length / visibleCards) }).map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index * visibleCards)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              Math.floor(currentIndex / visibleCards) === index
                ? 'bg-timeback-primary w-6'
                : 'bg-timeback-bg hover:bg-timeback-bg'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

// Main video gallery component
export default function VideoGallery({ quizData }: VideoGalleryProps) {
  console.log('[VideoGallery] Rendering with quiz data:', quizData);

  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch videos and categories
  useEffect(() => {
    const fetchData = async () => {
      console.log('[VideoGallery] Fetching videos and categories...');
      setIsLoading(true);
      setError(null);

      try {
        // Fetch categories
        const categoriesResponse = await fetch('/api/video-categories');
        const categoriesData = await categoriesResponse.json();
        
        if (categoriesData.success) {
          setCategories(categoriesData.categories);
          console.log('[VideoGallery] Loaded categories:', categoriesData.categories.length);
        }

        // Build videos URL with user context for personalized recommendations
        const buildVideosUrl = () => {
          const baseUrl = '/api/videos';
          const params = new URLSearchParams();
          
          // Add category if specified
          if (selectedCategory && selectedCategory !== 'all') {
            params.set('category', selectedCategory);
          }
          
          // Add user context for personalized recommendations
          if (quizData) {
            console.log('[VideoGallery] Adding user context for personalized videos:', quizData);
            
            // learningGoals removed - no longer part of quizData
            
            if (quizData.kidsInterests && quizData.kidsInterests.length > 0) {
              params.set('kidsInterests', quizData.kidsInterests.join(','));
            }
            
            if (quizData.userType) {
              params.set('userType', quizData.userType);
            }
            
            if (quizData.parentSubType) {
              params.set('parentSubType', quizData.parentSubType);
            }
            
            if (quizData.grade) {
              params.set('grade', quizData.grade);
            }
            
            if (quizData.selectedSchools && quizData.selectedSchools.length > 0) {
              params.set('selectedSchools', JSON.stringify(quizData.selectedSchools));
            }
          }
          
          const queryString = params.toString();
          return queryString ? `${baseUrl}?${queryString}` : baseUrl;
        };
        
        const videosUrl = buildVideosUrl();
        console.log('[VideoGallery] Fetching videos from:', videosUrl);
        
        const videosResponse = await fetch(videosUrl);
        const videosData = await videosResponse.json();
        
        if (videosData.success) {
          setVideos(videosData.videos);
          console.log('[VideoGallery] Loaded videos:', videosData.videos.length);
          if (videosData.personalized) {
            console.log('[VideoGallery] Displaying personalized video recommendations based on user context');
          } else {
            console.log('[VideoGallery] Displaying general video content');
          }
        } else {
          throw new Error(videosData.error || 'Failed to fetch videos');
        }

      } catch (error) {
        console.error('[VideoGallery] Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
        
        // Fallback mock data for development
        setVideos([
          {
            id: '1',
            title: 'How TimeBack Personalizes Learning',
            description: 'Discover how our AI adapts to each student\'s unique learning style and interests.',
            thumbnail_url: '/images/testimonials/sarah-chen-video.jpg',
            video_url: '/demo-video.mp4',
            duration: 180,
            category: 'How It Works',
            tags: ['personalization', 'AI', 'learning'],
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-15T10:00:00Z',
            is_featured: true,
            view_count: 1247
          },
          {
            id: '2',
            title: 'Student Success Stories',
            description: 'Real families share their TimeBack transformation stories.',
            thumbnail_url: '/images/testimonials/david-kim-video.jpg',
            video_url: '/demo-video.mp4',
            duration: 240,
            category: 'Success Stories',
            tags: ['testimonials', 'success', 'families'],
            created_at: '2024-01-14T10:00:00Z',
            updated_at: '2024-01-14T10:00:00Z',
            is_featured: true,
            view_count: 892
          },
          {
            id: '3',
            title: 'The Science Behind Mastery Learning',
            description: 'Explore the research that powers our 2x faster learning results.',
            thumbnail_url: '/images/testimonials/maria-garcia-video.jpg',
            video_url: '/demo-video.mp4',
            duration: 300,
            category: 'Research',
            tags: ['research', 'mastery', 'science'],
            created_at: '2024-01-13T10:00:00Z',
            updated_at: '2024-01-13T10:00:00Z',
            is_featured: true,
            view_count: 654
          }
        ]);
        
        setCategories([
          { id: '1', name: 'How It Works', description: 'Understanding TimeBack', color: '#3B82F6', created_at: '2024-01-01' },
          { id: '2', name: 'Success Stories', description: 'Real results from families', color: '#10B981', created_at: '2024-01-01' },
          { id: '3', name: 'Research', description: 'The science behind our method', color: '#8B5CF6', created_at: '2024-01-01' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, quizData]);

  const openVideoModal = (video: Video) => {
    console.log('[VideoGallery] Opening video modal for:', video.title);
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const closeVideoModal = () => {
    console.log('[VideoGallery] Closing video modal');
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  // Helper function to format video duration in MM:SS format
  const formatDuration = (seconds: number): string => {
    // If duration is 0 or missing, provide realistic fallback
    if (!seconds || seconds === 0) {
      seconds = 195; // Default to 3:15 for educational content
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (error && videos.length === 0) {
    return (
      <section className="max-w-7xl mx-auto py-16 lg:py-24 px-12">
        <div className="text-center font-cal">
          <h2 className="text-3xl lg:text-5xl font-bold text-timeback-primary mb-6 font-cal">
            Video Library
          </h2>
          <div className="bg-timeback-bg rounded-xl p-8">
            <p className="text-timeback-primary mb-4 font-cal">Unable to load videos at the moment.</p>
            <p className="text-sm text-timeback-primary font-cal">Error: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto py-16 lg:py-24 px-12">
      <div className="text-center mb-12 font-cal">
        <h2 className="text-3xl lg:text-5xl font-bold text-timeback-primary mb-6 font-cal">
          Explore Our Video Library
        </h2>
        <p className="text-xl text-timeback-primary max-w-3xl mx-auto mb-8 font-cal">
          Dive deep into how TimeBack transforms learning. Watch real student success stories, 
          understand our methodology, and see the science behind our results.
        </p>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              selectedCategory === 'all'
                ? 'bg-timeback-primary text-white'
                : 'bg-timeback-bg text-timeback-primary hover:bg-timeback-bg'
            }`}
          >
            All Videos
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                selectedCategory === category.name
                  ? 'bg-timeback-primary text-white'
                  : 'bg-timeback-bg text-timeback-primary hover:bg-timeback-bg'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-12 font-cal">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-timeback-primary"></div>
          <p className="text-timeback-primary mt-4 font-cal">Loading videos...</p>
        </div>
      )}

      {/* Video Carousel */}
      {!isLoading && videos.length > 0 && (
        <VideoCarousel videos={videos} onVideoSelect={openVideoModal} />
      )}

      {/* Empty state */}
      {!isLoading && videos.length === 0 && (
        <div className="text-center py-12 font-cal">
          <div className="max-w-md mx-auto">
            <svg className="w-16 h-16 text-timeback-primary mx-auto mb-4 font-cal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-timeback-primary mb-2 font-cal">No videos found</h3>
            <p className="text-timeback-primary font-cal">
              {selectedCategory === 'all' 
                ? 'Our video library is being loaded. Please check back soon for educational content from social media platforms.' 
                : `No videos found in the "${selectedCategory}" category. Try browsing other categories or check back later.`
              }
            </p>
          </div>
        </div>
      )}

      {/* Video modal */}
      <VideoModal
        video={selectedVideo}
        isOpen={isModalOpen}
        onClose={closeVideoModal}
      />
    </section>
  );
}
