'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDynamicOnboarding } from '../DynamicOnboardingContext';

interface SchoolSearchAdapterProps {
  onNext: () => void;
  onPrev: () => void;
}

interface SchoolSearchResult {
  id: string;
  name: string;
  city: string;
  state: string;
  level: string;
  district?: string;
  address?: string;
  searchSource?: string;
  relevanceScore?: number;
  rating?: number;
  enrollment?: number;
}

export default function SchoolSearchAdapter({ onNext, onPrev }: SchoolSearchAdapterProps) {
  const { userData, updateUserData } = useDynamicOnboarding();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SchoolSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<SchoolSearchResult | null>(userData.school || null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Search for schools using the API
  const searchSchools = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    console.log('[SchoolSearchAdapter] Searching for schools:', query);
    setIsSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch(`/api/schools/search?q=${encodeURIComponent(query)}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to search schools');
      }

      const data = await response.json();
      console.log('[SchoolSearchAdapter] Search results:', data);
      
      if (data.success && Array.isArray(data.schools)) {
        setSearchResults(data.schools);
      } else {
        setSearchResults([]);
        setError(data.error || 'No schools found');
      }
    } catch (error) {
      console.error('[SchoolSearchAdapter] Search error:', error);
      setError('Failed to search schools. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchSchools(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, searchSchools]);

  const handleSelectSchool = (school: SchoolSearchResult) => {
    console.log('[SchoolSearchAdapter] School selected:', school);
    setSelectedSchool(school);
    updateUserData({ 
      school,
      grade: school.level // Extract grade from school level
    });
  };

  const handleNext = () => {
    if (selectedSchool) {
      console.log('[SchoolSearchAdapter] Proceeding with selected school:', selectedSchool);
      onNext();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-timeback-primary mb-2 font-cal">Which school does your child attend?</h2>
      <p className="text-timeback-primary mb-6 font-cal">Search for your school to see personalized data comparisons</p>

      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Type your school name or city..."
          className="w-full px-4 py-3 border-2 border-timeback-primary rounded-xl focus:ring-2 focus:ring-timeback-bg focus:border-transparent outline-none font-cal"
        />
      </div>

      {/* Selected School */}
      {selectedSchool && (
        <div className="mb-6 p-4 bg-timeback-bg border-2 border-timeback-primary rounded-xl">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-timeback-primary font-cal">{selectedSchool.name}</h3>
              <p className="text-timeback-primary font-cal text-sm">{selectedSchool.city}, {selectedSchool.state}</p>
              <p className="text-timeback-primary font-cal text-sm">{selectedSchool.level}</p>
            </div>
            <button
              onClick={() => {
                setSelectedSchool(null);
                updateUserData({ school: undefined, grade: undefined });
              }}
              className="text-timeback-primary hover:text-timeback-primary/80"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Search Results */}
      {isSearching && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-timeback-primary"></div>
        </div>
      )}

      {!isSearching && searchResults.length > 0 && (
        <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
          {searchResults.map((school) => (
            <button
              key={school.id}
              onClick={() => handleSelectSchool(school)}
              className={`w-full text-left p-4 border-2 rounded-xl transition-all ${
                selectedSchool?.id === school.id
                  ? 'border-timeback-primary bg-timeback-bg'
                  : 'border-timeback-primary/30 hover:border-timeback-primary hover:bg-timeback-bg/50'
              }`}
            >
              <h3 className="font-bold text-timeback-primary font-cal">{school.name}</h3>
              <p className="text-timeback-primary font-cal text-sm">{school.city}, {school.state}</p>
              <p className="text-timeback-primary font-cal text-sm">{school.level}</p>
            </button>
          ))}
        </div>
      )}

      {!isSearching && hasSearched && searchResults.length === 0 && searchQuery && (
        <p className="text-timeback-primary text-center py-4 font-cal">No schools found. Try a different search.</p>
      )}

      {error && (
        <p className="text-red-600 text-center py-4 font-cal">{error}</p>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onPrev}
          className="px-6 py-3 border-2 border-timeback-primary text-timeback-primary rounded-xl font-bold hover:bg-timeback-bg transition-all font-cal"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedSchool}
          className={`px-6 py-3 rounded-xl font-bold transition-all font-cal ${
            selectedSchool
              ? 'bg-timeback-primary text-white hover:bg-opacity-90'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}