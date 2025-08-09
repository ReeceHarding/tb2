'use client';

/**
 * StudentJourneyCarousel Component
 * Main carousel component that fetches and displays student journeys
 * Integrates with API and manages state for the entire feature
 */

import React, { useState, useEffect, useRef } from 'react';
import { gradeToNumber } from '@/libs/grade-utils';
import { Grade } from '@/types/quiz';
import StudentCard, { StudentJourneyData } from './StudentCard';
import StudentDashboard from './StudentDashboard';
import StudentJourneyLoader from './StudentJourneyLoader';
import SkepticalTransition from './SkepticalTransition';
import GradeSelector from '@/components/GradeSelector';

interface StudentJourneyCarouselProps {
  grade?: Grade | null;
  schoolName?: string;
  onGradeSelected?: (grade: Grade) => void;
}

export default function StudentJourneyCarousel({ grade, schoolName, onGradeSelected }: StudentJourneyCarouselProps) {
  const [journeys, setJourneys] = useState<StudentJourneyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentJourneyData | null>(null);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(grade || null);
  
  // Convert grade string to number
  const gradeNumber = gradeToNumber(selectedGrade);
  
  // Fetch student journeys when grade changes
  useEffect(() => {
    const fetchJourneys = async () => {
      if (gradeNumber === null) {
        console.log('[StudentJourneyCarousel] No grade selected, waiting for user selection');
        setIsLoading(false);
        return;
      }
      
      console.log(`[StudentJourneyCarousel] Fetching journeys for grade ${gradeNumber}...`);
      
      try {
        const response = await fetch(`/api/student-journeys?grade=${gradeNumber}&limit=8`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch student journeys: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`[StudentJourneyCarousel] Received ${data.journeys?.length || 0} journeys`);
        
        if (data.journeys && data.journeys.length > 0) {
          setJourneys(data.journeys);
        } else {
          setError('No student journeys found for this grade level');
        }
      } catch (err) {
        console.error('[StudentJourneyCarousel] Error fetching journeys:', err);
        setError('Failed to load student journeys. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJourneys();
  }, [gradeNumber]);
  
  // Handle grade selection
  const handleGradeSelect = (newGrade: Grade) => {
    console.log(`[StudentJourneyCarousel] Grade selected: ${newGrade}`);
    setSelectedGrade(newGrade);
    setIsLoading(true);
    setError(null);
    setJourneys([]);
    if (onGradeSelected) {
      onGradeSelected(newGrade);
    }
  };
  
  // Carousel navigation functions
  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.scrollWidth / journeys.length;
      carouselRef.current.scrollTo({
        left: cardWidth * index,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };
  
  const scrollPrev = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    scrollToIndex(newIndex);
  };
  
  const scrollNext = () => {
    const newIndex = Math.min(journeys.length - 1, currentIndex + 1);
    scrollToIndex(newIndex);
  };
  
  // Handle card click
  const handleCardClick = (student: StudentJourneyData) => {
    console.log(`[StudentJourneyCarousel] Opening dashboard for student ${student.id}`);
    setSelectedStudent(student);
    setIsDashboardOpen(true);
  };
  
  // Handle dashboard close
  const handleDashboardClose = () => {
    console.log('[StudentJourneyCarousel] Closing dashboard');
    setIsDashboardOpen(false);
    // Keep selectedStudent for animation purposes
    setTimeout(() => setSelectedStudent(null), 300);
  };
  
  if (gradeNumber === null) {
    return (
      <GradeSelector 
        onGradeSelect={handleGradeSelect}
        selectedGrade={selectedGrade}
        title="Select a grade to see student journeys"
        description="Choose the grade level to view personalized success stories from students"
      />
    );
  }
  
  return (
    <div className="w-full">
      {/* Skeptical Transition Section */}
      <SkepticalTransition grade={gradeNumber} schoolName={schoolName} />
      
      {/* Main Carousel Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-cal font-bold text-timeback-primary mb-4">
              Students Like Your Child
            </h2>
            <p className="text-xl font-cal text-timeback-primary opacity-90 max-w-3xl mx-auto">
              Real students. Real results. These {grade} students achieved remarkable growth 
              with just 2 hours of personalized learning each day.
            </p>
          </div>
          
          {/* Loading State */}
          {isLoading && <StudentJourneyLoader />}
          
          {/* Error State */}
          {error && !isLoading && (
            <div className="backdrop-blur-md bg-timeback-bg/80 rounded-xl shadow-lg border-2 border-timeback-primary p-8 max-w-2xl mx-auto text-center">
              <div className="text-timeback-primary mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-lg font-cal text-timeback-primary">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-6 bg-timeback-primary text-white font-cal font-bold py-3 px-6 rounded-xl hover:bg-opacity-90 transition-all duration-200"
              >
                Try Again
              </button>
            </div>
          )}
          
          {/* Carousel Content */}
          {!isLoading && !error && journeys.length > 0 && (
            <>
              {/* Carousel Container */}
              <div className="relative">
                {/* Modern Previous Button */}
                <button
                  onClick={scrollPrev}
                  disabled={currentIndex === 0}
                  className={`
                    absolute left-1 top-1/2 -translate-y-1/2 z-20
                    w-12 h-12 bg-white border-2 border-timeback-primary rounded-xl shadow-xl flex items-center justify-center group
                    transition-all duration-300
                    ${currentIndex === 0 
                      ? 'opacity-40 cursor-not-allowed scale-90' 
                      : 'hover:bg-timeback-bg hover:scale-105 cursor-pointer'}
                  `}
                  aria-label="Previous student"
                >
                  <div className={`w-0 h-0 border-t-[6px] border-b-[6px] border-r-[10px] border-t-transparent border-b-transparent transition-colors duration-200 -translate-x-0.5 ${
                    currentIndex === 0 ? 'border-r-gray-400' : 'border-r-timeback-primary group-hover:border-r-timeback-primary'
                  }`}></div>
                </button>
                
                {/* Cards Container */}
                <div
                  ref={carouselRef}
                  className="flex gap-6 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory hide-scrollbar"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  }}
                >
                  {journeys.map((journey, index) => (
                    <div
                      key={journey.id}
                      className="flex-none w-full md:w-1/2 lg:w-1/3 snap-center"
                    >
                      <StudentCard
                        student={journey}
                        onClick={() => handleCardClick(journey)}
                        isActive={index === currentIndex}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Modern Next Button */}
                <button
                  onClick={scrollNext}
                  disabled={currentIndex === journeys.length - 1}
                  className={`
                    absolute right-1 top-1/2 -translate-y-1/2 z-20
                    w-12 h-12 bg-white border-2 border-timeback-primary rounded-xl shadow-xl flex items-center justify-center group
                    transition-all duration-300
                    ${currentIndex === journeys.length - 1 
                      ? 'opacity-40 cursor-not-allowed scale-90' 
                      : 'hover:bg-timeback-bg hover:scale-105 cursor-pointer'}
                  `}
                  aria-label="Next student"
                >
                  <div className={`w-0 h-0 border-t-[6px] border-b-[6px] border-l-[10px] border-t-transparent border-b-transparent transition-colors duration-200 translate-x-0.5 ${
                    currentIndex === journeys.length - 1 ? 'border-l-gray-400' : 'border-l-timeback-primary group-hover:border-l-timeback-primary'
                  }`}></div>
                </button>
              </div>
              
              {/* Pagination Dots */}
              <div className="flex justify-center mt-8 space-x-2">
                {journeys.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToIndex(index)}
                    className={`
                      w-3 h-3 rounded-full transition-all duration-200
                      ${index === currentIndex 
                        ? 'bg-timeback-primary w-8' 
                        : 'bg-timeback-primary bg-opacity-30 hover:bg-opacity-50'}
                    `}
                    aria-label={`Go to student ${index + 1}`}
                  />
                ))}
              </div>
              
              {/* Summary Stats */}
              <div className="mt-12 text-center">
                <p className="text-lg font-cal text-timeback-primary">
                  Showing <span className="font-bold">{journeys.length}</span> of many success stories 
                  from <span className="font-bold">{grade}</span> students who achieved 
                  <span className="font-bold"> 10+ percentile</span> growth
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Student Dashboard Modal */}
      <StudentDashboard
        student={selectedStudent}
        isOpen={isDashboardOpen}
        onClose={handleDashboardClose}
      />
      
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}