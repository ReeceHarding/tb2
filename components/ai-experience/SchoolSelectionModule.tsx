'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, School, MapPin, Users, Check } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

interface SchoolSearchResult {
  id: string;
  name: string;
  city: string;
  state: string;
  level: string;
  district?: string;
  address?: string;
  enrollment?: number;
  rating?: number;
}

interface SchoolSelectionModuleProps {
  onSchoolSelect: (_school: SchoolSearchResult) => void;
}

export default function SchoolSelectionModule({ onSchoolSelect }: SchoolSelectionModuleProps) {
  const posthog = usePostHog();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SchoolSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<SchoolSearchResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const searchSchools = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/schools/search?q=${encodeURIComponent(query)}&limit=6`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search schools');
      }

      const data = await response.json();
      setSearchResults(data.schools || data.schoolMatches || []);
      setShowResults(true);
    } catch (err) {
      console.error('School search error:', err);
      setError('Unable to search schools. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        searchSchools(searchQuery);
      }
    }, 1000); // 1 second debounce to prevent API rate limiting

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchSchools]);

  const handleSchoolSelect = (school: SchoolSearchResult) => {
    setSelectedSchool(school);
    setShowResults(false);
    onSchoolSelect(school);
    
    posthog?.capture('school_selected', {
      school_id: school.id,
      school_name: school.name,
      school_city: school.city,
      school_state: school.state
    });
  };

  return (
    <div className="relative">
      {/* Clean card design */}
      <div className="backdrop-blur-md bg-timeback-bg/80 rounded-xl border border-timeback-primary p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-timeback-primary mb-2 font-cal">
              Find Your School
            </h3>
            <p className="text-sm text-timeback-primary font-cal">
              Search for your school to compare academic performance
            </p>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-timeback-primary font-cal" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter school name or city..."
              className="w-full pl-10 pr-4 py-3 border border-timeback-primary rounded-xl focus:ring-2 focus:ring-timeback-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Selected School */}
          {selectedSchool && (
            <div className="bg-timeback-bg border border-timeback-primary rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <School className="w-5 h-5 text-timeback-primary font-cal" />
                    <h4 className="font-semibold text-timeback-primary font-cal">{selectedSchool.name}</h4>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-timeback-primary font-cal" />
                    <p className="text-sm text-timeback-primary font-cal">
                      {selectedSchool.city}, {selectedSchool.state}
                    </p>
                  </div>
                </div>
                <Check className="w-5 h-5 text-timeback-primary font-cal" />
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-4 font-cal">
              <div className="inline-flex items-center gap-2 text-timeback-primary font-cal">
                <div className="w-4 h-4 border-2 border-timeback-primary border-t-timeback-primary rounded-full animate-spin" />
                <span className="text-sm font-cal">Searching schools...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-timeback-bg border border-timeback-primary rounded-xl p-3">
              <p className="text-sm text-timeback-primary font-cal">{error}</p>
            </div>
          )}

          {/* Search Results */}
          {showResults && searchResults.length > 0 && !selectedSchool && (
            <div className="absolute top-full left-0 right-0 mt-2 backdrop-blur-md bg-timeback-bg/80 border border-timeback-primary rounded-xl shadow-2xl z-10 max-h-96 overflow-y-auto">
              {searchResults.map((school) => (
                <button
                  key={school.id}
                  onClick={() => handleSchoolSelect(school)}
                  className="w-full text-left px-4 py-3 hover:bg-timeback-bg transition-colors border-b border-timeback-primary last:border-0 font-cal"
                >
                  <div className="flex items-start gap-3">
                    <School className="w-5 h-5 text-timeback-primary mt-0.5 font-cal" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-timeback-primary truncate font-cal">
                        {school.name}
                      </h4>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-timeback-primary font-cal" />
                          <p className="text-sm text-timeback-primary font-cal">
                            {school.city}, {school.state}
                          </p>
                        </div>
                        {school.enrollment && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-timeback-primary font-cal" />
                            <p className="text-sm text-timeback-primary font-cal">
                              {school.enrollment.toLocaleString()} students
                            </p>
                          </div>
                        )}
                      </div>
                      {school.district && (
                        <p className="text-xs text-timeback-primary mt-1 font-cal">{school.district}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {showResults && searchResults.length === 0 && searchQuery.length >= 3 && !isLoading && (
            <div className="text-center py-4 font-cal">
              <p className="text-sm text-timeback-primary font-cal">
                No schools found. Try a different search term.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}