'use client';

import { useState } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { SchoolLocation } from '@/libs/school-locations';
import { MapPinIcon, SparklesIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/20/solid';

interface School extends SchoolLocation {
  distance: number;
  formattedDistance: string;
}

interface FindSchoolsNearMeProps {
  onSchoolsFound?: (schools: School[]) => void;
  maxResults?: number;
  className?: string;
}

export default function FindSchoolsNearMe({ 
  onSchoolsFound, 
  maxResults = 5,
  className = ''
}: FindSchoolsNearMeProps) {
  const { location, isLoading: isGettingLocation, error: locationError, getUserLocation } = useGeolocation();
  const [schools, setSchools] = useState<{
    timebackSchools: School[];
    publicSchools: School[];
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleFindSchools = async () => {
    console.log('[FindSchoolsNearMe] Starting school search...');
    setSearchError(null);
    setIsSearching(true);
    
    try {
      // Get user location if not already available
      if (!location?.coordinates) {
        console.log('[FindSchoolsNearMe] Getting user location first...');
        await getUserLocation();
        // Wait a bit for the hook to update
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Check again after getting location
      let currentLocation = location?.coordinates;
      
      // If browser geolocation failed, try IP geolocation as fallback
      if (!currentLocation) {
        console.log('[FindSchoolsNearMe] Browser geolocation failed, trying IP geolocation...');
        
        try {
          const ipResponse = await fetch('/api/geolocation/ip');
          if (ipResponse.ok) {
            const ipData = await ipResponse.json();
            if (ipData.success && ipData.location?.coordinates) {
              currentLocation = ipData.location.coordinates;
              console.log('[FindSchoolsNearMe] Got location from IP:', ipData.location.city);
            }
          }
        } catch (ipError) {
          console.error('[FindSchoolsNearMe] IP geolocation also failed:', ipError);
        }
        
        // If still no location, show error
        if (!currentLocation) {
          throw new Error('Unable to get your location. Please enable location services or try refreshing the page.');
        }
      }
      
      console.log('[FindSchoolsNearMe] Searching near:', currentLocation);
      
      // Search for schools
      const response = await fetch('/api/schools/find-nearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordinates: currentLocation,
          includeTimeBack: true,
          includePublic: true,
          maxResults
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to find schools');
      }
      
      const data = await response.json();
      console.log('[FindSchoolsNearMe] Found schools:', {
        timebackCount: data.timebackSchools?.length || 0,
        publicCount: data.publicSchools?.length || 0
      });
      
      setSchools(data);
      setShowResults(true);
      
      // Notify parent component
      if (onSchoolsFound) {
        const allSchools = [...(data.timebackSchools || []), ...(data.publicSchools || [])];
        onSchoolsFound(allSchools);
      }
      
    } catch (error) {
      console.error('[FindSchoolsNearMe] Error:', error);
      setSearchError(error instanceof Error ? error.message : 'Failed to find schools');
    } finally {
      setIsSearching(false);
    }
  };

  const isLoading = isGettingLocation || isSearching;

  return (
    <div className={`${className}`}>
      {/* Find Schools Button */}
      <button
        onClick={handleFindSchools}
        disabled={isLoading}
        className="w-full bg-timeback-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-timeback-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl font-cal text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            {isGettingLocation ? 'Getting Your Location...' : 'Searching for Schools...'}
          </>
        ) : (
          <>
            <MapPinIcon className="w-6 h-6" />
            Click here to grant us your location
          </>
        )}
      </button>

      {/* Error Display */}
      {(locationError || searchError) && (
        <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <p className="text-red-700 font-cal flex items-center gap-2">
            <XCircleIcon className="w-5 h-5" />
            {locationError || searchError}
          </p>
        </div>
      )}

      {/* User Location Display */}
      {location?.address && !showResults && (
        <div className="mt-4 p-4 bg-timeback-bg/30 border-2 border-timeback-primary rounded-xl">
          <p className="text-timeback-primary font-cal flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5" />
            Your location: {location.address}
          </p>
        </div>
      )}

      {/* Results Display */}
      {showResults && schools && (
        <div className="mt-8 space-y-6">
          {/* TimeBack Schools */}
          {schools.timebackSchools.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold text-timeback-primary font-cal mb-4 flex items-center gap-2">
                <SparklesIcon className="w-6 h-6" />
                TimeBack Schools Near You
              </h3>
              <div className="space-y-4">
                {schools.timebackSchools.map((school) => (
                  <SchoolCard key={school.id} school={school} isTimeBack={true} />
                ))}
              </div>
            </div>
          )}

          {/* Public Schools */}
          {schools.publicSchools.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold text-timeback-primary font-cal mb-4 flex items-center gap-2">
                <AcademicCapIcon className="w-6 h-6" />
                Other Schools in Your Area
              </h3>
              <div className="space-y-4">
                {schools.publicSchools.map((school) => (
                  <SchoolCard key={school.id} school={school} isTimeBack={false} />
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {schools.timebackSchools.length === 0 && schools.publicSchools.length === 0 && (
            <div className="text-center py-8">
              <p className="text-timeback-primary font-cal text-lg">
                No schools found within 25 miles of your location.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// School Card Component
function SchoolCard({ school, isTimeBack }: { school: School; isTimeBack: boolean }) {
  return (
    <div className={`p-6 rounded-xl border-2 ${isTimeBack ? 'bg-timeback-bg/20 border-timeback-primary' : 'bg-white border-timeback-primary/30'} shadow-lg hover:shadow-xl transition-all duration-300`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="text-lg font-bold text-timeback-primary font-cal">
            {school.name}
          </h4>
          <p className="text-sm text-timeback-primary/80 font-cal mt-1">
            {school.address && `${school.address}, `}
            {school.city}, {school.state} {school.zipCode}
          </p>
        </div>
        <div className="text-right ml-4">
          <p className="text-lg font-bold text-timeback-primary font-cal">
            {school.formattedDistance}
          </p>
          <p className="text-sm text-timeback-primary/60 font-cal">away</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {/* School Type Badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-cal ${
          isTimeBack 
            ? 'bg-timeback-primary text-white' 
            : 'bg-timeback-bg text-timeback-primary'
        }`}>
          {isTimeBack ? 'TimeBack School' : school.isPrivate ? 'Private' : school.isCharter ? 'Charter' : 'Public'}
        </span>
        
        {/* Grade Level Badge */}
        <span className="px-3 py-1 bg-timeback-bg text-timeback-primary rounded-full text-xs font-cal">
          {school.level || 'K-12'}
        </span>
        
        {/* Rating Badge */}
        {school.rating > 0 && (
          <span className="px-3 py-1 bg-timeback-bg text-timeback-primary rounded-full text-xs font-cal">
            ★ {school.rating}/10
          </span>
        )}
      </div>

      {/* Features can be added when available */}

      {/* Contact Info */}
      {(school.phone || school.website) && (
        <div className="mt-4 pt-3 border-t border-timeback-primary/20">
          {school.phone && (
            <p className="text-sm text-timeback-primary font-cal">
              📞 {school.phone}
            </p>
          )}
          {school.website && (
            <a 
              href={school.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-timeback-primary underline font-cal hover:text-timeback-primary/80"
            >
              Visit Website →
            </a>
          )}
        </div>
      )}
    </div>
  );
}