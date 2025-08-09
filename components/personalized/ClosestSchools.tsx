'use client';

import React, { useState, useEffect } from 'react';
import { getSchoolLevelColor, SchoolLocation } from '@/libs/school-locations';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { Coordinates, geolocationService } from '@/libs/geolocation-service';
import { OneTimeText } from '@/components/AnimatedHeading';

// Custom typewriter hook for LLM-like animation
const useTypewriter = (text: string, speed = 25, startDelay = 0) => {
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

interface QuizData {
  userType: string;
  parentSubType?: string;
  selectedSchools: Array<{
    id: string;
    name: string;
    city: string;
    state: string;
    level: string;
  }>;
  // learningGoals: string[]; - removed
  kidsInterests: string[];
  numberOfKids: number;
}

interface ClosestSchoolsProps {
  quizData: QuizData;
}

interface SchoolWithDistance extends SchoolLocation {
  distance: number;
  formattedDistance: string;
}

export default function ClosestSchools({ quizData }: ClosestSchoolsProps) {
  const [closestSchools, setClosestSchools] = useState<SchoolWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGettingIPLocation, setIsGettingIPLocation] = useState(false);
  const [isUsingBrowserLocation, setIsUsingBrowserLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<{ coordinates: Coordinates; address: string } | null>(null);
  
  // Typewriter animations for all text content
  const findSchoolsHeading = useTypewriter("Find TimeBack Schools Near You", 30, 0);
  const findSchoolsDescription = useTypewriter("Automatically detecting your location to find the closest TimeBack schools...", 25, 200);
  const ipLocationLoadingText = useTypewriter("Getting your location...", 25, 0);
  const browserLocationText = useTypewriter("Requesting browser location permission...", 25, 0);
  const loadingText = useTypewriter("Finding schools near you...", 25, 0);
  const schoolsNearHeading = useTypewriter("TimeBack Schools Near You", 30, 0);
  const schoolsNearDescription = useTypewriter(
    closestSchools.length > 0 
      ? `Found ${closestSchools.length} TimeBack schools in your area, sorted by distance`
      : "", 
    25, 
    200
  );
  const findingButtonText = useTypewriter("Finding Schools...", 25, 0);
  const findNearbyButtonText = useTypewriter("Find Nearby Schools", 30, 0);
  const viewDetailsButtonText = useTypewriter("View Details", 30, 0);
  const callSchoolButtonText = useTypewriter("Call School", 30, 100);

  // Only show this section if user has selected schools (indicating they went through school search)
  const hasSelectedSchools = quizData.selectedSchools && quizData.selectedSchools.length > 0;
  
  // Get the first selected school for location reference
  const primarySchool = hasSelectedSchools ? quizData.selectedSchools[0] : null;
  
  // Extract stable values for useEffect dependencies
  const primarySchoolId = primarySchool?.id;
  const primarySchoolCity = primarySchool?.city;
  const primarySchoolState = primarySchool?.state;

  // Try to find school address from geocoded data
  const findSchoolAddress = async (schoolId: string): Promise<string | null> => {
    try {
      const response = await fetch('/data/geocoded-schools.json');
      const schools = await response.json();
      const school = schools.find((s: any) => s.id === schoolId);
      if (school && school.fullAddress) {
        return school.fullAddress;
      }
      return null;
    } catch (error) {
      console.error('Error loading school data:', error);
      return null;
    }
  };

  // Find nearby schools using coordinates
  const findNearbySchools = async (coordinates: { lat: number; lng: number }) => {
    try {
      const response = await fetch('/api/schools/find-nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coordinates,
          includeTimeBack: true,
          includePublic: false,
          maxResults: 10
        })
      });

      if (!response.ok) {
        throw new Error('Failed to find nearby schools');
      }

      const data = await response.json();
      return data.timebackSchools || [];
    } catch (error) {
      console.error('Error finding nearby schools:', error);
      throw error;
    }
  };

  // Get user location from IP address with browser geolocation fallback
  const getUserLocationFromIP = async () => {
    console.log('[ClosestSchools] Getting user location from IP...');
    setIsGettingIPLocation(true);
    setError(null);

    try {
      // Get location from IP
      const response = await fetch('/api/geolocation/ip');
      
      if (!response.ok) {
        throw new Error('Failed to get location from IP');
      }

      const data = await response.json();
      
      if (data.success && data.location) {
        console.log('[ClosestSchools] Got location from IP:', data.location);
        setUserLocation({
          coordinates: data.location.coordinates,
          address: data.location.address
        });
        
        // Now find schools near this location
        await findSchoolsNearLocation(data.location.coordinates);
      } else {
        throw new Error(data.error || 'Failed to get location');
      }
    } catch (ipError) {
      console.error('[ClosestSchools] IP location failed, trying browser geolocation as fallback:', ipError);
      
      // Try browser geolocation as fallback
      try {
        setIsUsingBrowserLocation(true);
        const browserLocation = await geolocationService.getUserLocation();
        
        if (browserLocation.success && browserLocation.coordinates) {
          console.log('[ClosestSchools] Got location from browser:', browserLocation.coordinates);
          setUserLocation({
            coordinates: browserLocation.coordinates,
            address: browserLocation.address || 'Your current location'
          });
          
          // Now find schools near this location
          await findSchoolsNearLocation(browserLocation.coordinates);
        } else {
          throw new Error(browserLocation.error || 'Failed to get browser location');
        }
      } catch (browserError) {
        console.error('[ClosestSchools] Browser geolocation also failed:', browserError);
        setError('Unable to detect your location. Please enable location services and refresh the page.');
        setIsLoading(false);
      } finally {
        setIsUsingBrowserLocation(false);
      }
    } finally {
      setIsGettingIPLocation(false);
    }
  };

  // Find schools near given coordinates
  const findSchoolsNearLocation = async (coordinates: Coordinates) => {
    console.log('[ClosestSchools] Finding schools near coordinates:', coordinates);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/schools/find-nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coordinates,
          includeTimeBack: true,
          includePublic: false,
          maxResults: 10
        })
      });

      if (!response.ok) {
        throw new Error('Failed to find schools');
      }

      const data = await response.json();
      const schools = data.timebackSchools || [];
      
      if (schools.length > 0) {
        setClosestSchools(schools);
      } else {
        setError('No TimeBack schools found within 50 miles of your location.');
      }
    } catch (err) {
      console.error('[ClosestSchools] Error finding schools:', err);
      setError('Unable to find nearby schools. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeLocation = async () => {
      if (!hasSelectedSchools || !primarySchoolId) {
        setIsLoading(false);
        return;
      }

      // Automatically get user location from IP
      await getUserLocationFromIP();
    };

    initializeLocation();
  }, [hasSelectedSchools, primarySchoolId]);

  // Carousel navigation functions
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? closestSchools.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === closestSchools.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Don't render if user didn't select schools
  if (!hasSelectedSchools) {
    return null;
  }

  // Show loading state while getting IP location
  if (isGettingIPLocation) {
    return (
      <section className="max-w-7xl mx-auto py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="text-center font-cal">
          <h2 className="text-3xl lg:text-5xl font-bold text-timeback-primary mb-6 font-cal">
            {findSchoolsHeading.displayText}
          </h2>
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-timeback-primary"></div>
            <p className="text-xl text-timeback-primary font-cal">
              {isUsingBrowserLocation ? browserLocationText.displayText : ipLocationLoadingText.displayText}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="text-center font-cal">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-timeback-primary mx-auto"></div>
          <p className="mt-4 text-timeback-primary font-cal">{loadingText.displayText}</p>
        </div>
      </section>
    );
  }

  if (error && closestSchools.length === 0) {
    return (
      <section className="max-w-7xl mx-auto py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="text-center font-cal">
          <p className="text-timeback-primary font-cal">{error}</p>
        </div>
      </section>
    );
  }

  if (closestSchools.length === 0) {
    return null;
  }

  const currentSchool = closestSchools[currentIndex];

  return (
    <section className="max-w-7xl mx-auto py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12 font-cal">
        <h2 className="text-3xl lg:text-5xl font-bold text-timeback-primary mb-6 font-cal">
          {schoolsNearHeading.displayText}
        </h2>
        <p className="text-xl text-timeback-primary max-w-3xl mx-auto font-cal">
          {schoolsNearDescription.displayText}
        </p>

      </div>

      {/* Carousel Container with External Navigation */}
      <div className="relative w-full">
        {/* Modern Carousel Navigation Buttons - Positioned Outside */}
        {closestSchools.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 z-20 w-14 h-14 bg-white border-2 border-timeback-primary rounded-2xl shadow-2xl hover:bg-timeback-bg hover:scale-110 transition-all duration-300 flex items-center justify-center group hidden lg:flex"
              aria-label="Previous school"
            >
              <div className="w-0 h-0 border-t-[8px] border-b-[8px] border-r-[12px] border-t-transparent border-b-transparent border-r-timeback-primary group-hover:border-r-timeback-primary transition-colors duration-200 -translate-x-1"></div>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 z-20 w-14 h-14 bg-white border-2 border-timeback-primary rounded-2xl shadow-2xl hover:bg-timeback-bg hover:scale-110 transition-all duration-300 flex items-center justify-center group hidden lg:flex"
              aria-label="Next school"
            >
              <div className="w-0 h-0 border-t-[8px] border-b-[8px] border-l-[12px] border-t-transparent border-b-transparent border-l-timeback-primary group-hover:border-l-timeback-primary transition-colors duration-200 translate-x-1"></div>
            </button>
          </>
        )}

        {/* School Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-timeback-bg rounded-xl shadow-2xl overflow-hidden">
          {/* School header with level and distance */}
          <div className="bg-timeback-primary text-white p-4 font-cal">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium px-2 py-1 rounded bg-timeback-bg text-timeback-primary">
                {currentSchool.level} School
              </span>
              {currentSchool.formattedDistance && (
                <span className="text-sm bg-timeback-primary px-2 py-1 rounded font-cal">
                  {currentSchool.formattedDistance} away
                </span>
              )}
            </div>
          </div>

          {/* School details */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-timeback-primary mb-2 font-cal">
              {currentSchool.name}
            </h3>
            
            {/* Rating and rank info */}
            <div className="flex items-center gap-4 mb-4">
              {currentSchool.rating && currentSchool.rating > 0 && (
                <div className="flex items-center">
                  <span className="text-timeback-primary mr-1 font-cal">★</span>
                  <span className="text-sm font-medium font-cal">{currentSchool.rating}/10</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3 mb-4">
              {/* Address */}
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-timeback-primary mt-0.5 flex-shrink-0 font-cal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="text-timeback-primary text-sm font-cal">
                  <div>{currentSchool.address}</div>
                  <div>{`${currentSchool.city}, ${currentSchool.state} ${currentSchool.zipCode}`}</div>
                </div>
              </div>

              {/* Grades */}
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-timeback-primary flex-shrink-0 font-cal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-timeback-primary text-sm font-cal">Grades {currentSchool.level}</span>
              </div>

              {/* Enrollment */}
              {currentSchool.enrollment && (
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-timeback-primary flex-shrink-0 font-cal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-timeback-primary text-sm font-cal">{currentSchool.enrollment.toLocaleString()} students</span>
                </div>
              )}

              {/* Phone */}
              {currentSchool.phone && (
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-timeback-primary flex-shrink-0 font-cal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-timeback-primary text-sm font-cal">{currentSchool.phone}</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex space-x-3">
              {currentSchool.website && (
                <a
                  href={currentSchool.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-timeback-primary text-white text-center py-2 px-4 rounded-xl hover:bg-timeback-primary transition-colors duration-200 text-sm font-medium font-cal"
                >
                  {viewDetailsButtonText.displayText}
                </a>
              )}
              {currentSchool.phone && (
                <a
                  href={`tel:${currentSchool.phone}`}
                  className="flex-1 border border-timeback-primary text-timeback-primary text-center py-2 px-4 rounded-xl hover:bg-timeback-bg transition-colors duration-200 text-sm font-medium font-cal"
                >
                  {callSchoolButtonText.displayText}
                </a>
              )}
            </div>
          </div>
          </div>
        </div>

        {/* Carousel Indicators */}
        {closestSchools.length > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {closestSchools.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex 
                    ? 'bg-timeback-primary' 
                    : 'bg-timeback-primary/30'
                }`}
                aria-label={`Go to school ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>


    </section>
  );
}
