'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useQuiz } from '../QuizContext';

interface SchoolSearchStepProps {
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

interface SearchMetrics {
  originalQuery: string;
  enhancedQuery: string;
  totalFound: number;
  afterFiltering: number;
  finalResults: number;
  strategies: string[];
  avgRelevanceScore: number;
}

interface SearchOptions {
  enableFuzzySearch: boolean;
  enableGeographicSearch: boolean;
  includeTestScores: boolean;
  sortBy: string;
  appliedFilters: {
    state: boolean;
    city: boolean;
    level: boolean;
  };
}

// Helper function to convert full state names to 2-letter abbreviations
function getStateAbbreviation(fullState: string): string {
  const stateMap: Record<string, string> = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
    'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
    'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
    'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
    'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
    'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
    'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
    'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
    'District of Columbia': 'DC'
  };
  return stateMap[fullState] || fullState; // Return abbreviation or original if not found
}

export default function SchoolSearchStep({ onNext }: SchoolSearchStepProps) {
  const { state, dispatch } = useQuiz();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SchoolSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const renderCount = React.useRef(0);
  renderCount.current += 1;
  const timestamp = new Date().toISOString();

  console.log(`[SchoolSearchStep] ${timestamp} Render #${renderCount.current} - Selected schools: ${state.selectedSchools.length}`);
  console.log(`[SchoolSearchStep] ${timestamp} Component state:`, {
    searchQuery: searchQuery.slice(0, 50) + (searchQuery.length > 50 ? '...' : ''),
    searchResults: searchResults.length,
    isLoading,
    error: error ? error.slice(0, 100) : null,
    selectedSchools: state.selectedSchools.length
  });
  console.log(`[SchoolSearchStep] ${timestamp} Received callbacks:`, {
    onNext: typeof onNext,
    onNextFunction: onNext.toString().slice(0, 100) + '...'
  });

  // Advanced nationwide search function using the enhanced API
  const searchSchoolsNationwide = useCallback(async (query: string): Promise<{
    results: SchoolSearchResult[];
    metrics?: SearchMetrics;
    options?: SearchOptions;
  }> => {
    console.log(`[SchoolSearchStep] Starting advanced nationwide search for: ${query}`);
    const startTime = performance.now();
    
    try {
      // Call the enhanced API with advanced search options
      const response = await fetch(`/api/schools/search?${new URLSearchParams({
        q: query.trim(),
        limit: '20',
        optimized: 'true',
        fuzzy: 'true',
        geographic: 'true',
        sortBy: 'relevance'
      })}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const endTime = performance.now();
      
      console.log(`[SchoolSearchStep] Nationwide search completed in ${(endTime - startTime).toFixed(2)}ms`);
      console.log('[SchoolSearchStep] Search metrics:', data.searchMetrics);
      
      // Transform API response to component format
      const transformedResults: SchoolSearchResult[] = (data.schoolMatches || []).map((school: any) => ({
        id: school.schoolid || school.id,
        name: school.schoolName || school.name,
        city: school.city,
        state: school.state, // No fallback - use actual state from API
        level: school.schoolLevel || school.level || 'K-12',
        district: school.districtName || school.district,
        address: school.address,
        searchSource: school.searchSource,
        relevanceScore: school.relevanceScore,
        rating: school.rating,
        enrollment: school.enrollment
      }));

      return {
        results: transformedResults,
        metrics: data.searchMetrics,
        options: data.searchOptions
      };
    } catch (error) {
      console.error('[SchoolSearchStep] Nationwide search error:', error);
      throw error;
    }
  }, []);

  // Enhanced search function with intelligent fallback strategies
  const performIntelligentSearch = useCallback(async (query: string): Promise<SchoolSearchResult[]> => {
    console.log('[SchoolSearchStep] Starting intelligent search with fallback strategies');
    
    try {
      // Primary strategy: Advanced nationwide search
      const searchResult = await searchSchoolsNationwide(query);
      
      // Store metrics for debugging and display
      
      if (searchResult.results.length > 0) {
        console.log('[SchoolSearchStep] Primary search successful:', searchResult.results.length, 'results');
        return searchResult.results;
      }
      
      // Fallback strategy 1: Try broader search if no results
      console.log('[SchoolSearchStep] Primary search yielded no results, trying fallback strategies');
      
      const fallbackTerms = [
        query.split(' ')[0], // First word only
        query.replace(/school|elementary|middle|high|academy/gi, '').trim(), // Remove common school terms
        ...query.split(' ').filter(word => word.length > 3) // Individual significant words
      ].filter(term => term.length > 2);
      
      for (const fallbackTerm of fallbackTerms) {
        if (fallbackTerm === query) continue; // Skip if same as original
        
        try {
          console.log('[SchoolSearchStep] Trying fallback search with term:', fallbackTerm);
          const fallbackResult = await searchSchoolsNationwide(fallbackTerm);
          
          if (fallbackResult.results.length > 0) {
            console.log('[SchoolSearchStep] Fallback search successful:', fallbackResult.results.length, 'results');
            return fallbackResult.results;
          }
        } catch (error) {
          console.warn('[SchoolSearchStep] Fallback search failed for term:', fallbackTerm, error);
          continue;
        }
      }
      
      console.log('[SchoolSearchStep] All search strategies exhausted, no results found');
      return [];
      
    } catch (error) {
      console.error('[SchoolSearchStep] All search strategies failed:', error);
      throw error;
    }
  }, [searchSchoolsNationwide]);

  // Main search function with intelligent nationwide search
  const searchSchools = useCallback(async (query: string) => {
    const trimmedQuery = query.trim().toLowerCase();
    const allowedSingleCharPrefixes = ['w', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'j', 'l', 'm', 'n', 'p', 'r', 's', 't'];
    
    // Allow single character searches for common city prefixes
    if (trimmedQuery.length === 1 && !allowedSingleCharPrefixes.includes(trimmedQuery)) {
      setSearchResults([]);
      return;
    }
    
    if (trimmedQuery.length === 0) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    console.log('[SchoolSearchStep] Starting intelligent nationwide search for:', query);

    try {
      // Use intelligent search with fallback strategies
      const schools = await performIntelligentSearch(query);
      
      console.log('[SchoolSearchStep] Intelligent search returned', schools.length, 'schools from across the U.S.');
      
      // Display all results (API already limits to reasonable number)
      setSearchResults(schools);
    } catch (err) {
      console.error('[SchoolSearchStep] Intelligent search error:', err);
      setError('Failed to search schools. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [performIntelligentSearch]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchSchools(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 1000); // 1 second debounce to prevent API rate limiting

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchSchools]);

  const addSchool = (school: any) => {
    const addTimestamp = new Date().toISOString();
    console.log(`[SchoolSearchStep] ${addTimestamp} addSchool CALLED with school:`, school.name);
    console.log(`[SchoolSearchStep] ${addTimestamp} Dispatching ADD_SCHOOL action`);
    dispatch({ type: 'ADD_SCHOOL', school });
    console.log(`[SchoolSearchStep] ${addTimestamp} School selected successfully - auto-advancing to next step`);
    
    // Auto-advance after selection with consistent 200ms delay
    setTimeout(() => {
      onNext();
    }, 200);
  };

  const removeSchool = (schoolId: string) => {
    const removeTimestamp = new Date().toISOString();
    console.log(`[SchoolSearchStep] ${removeTimestamp} removeSchool CALLED with schoolId:`, schoolId);
    console.log(`[SchoolSearchStep] ${removeTimestamp} Dispatching REMOVE_SCHOOL action`);
    dispatch({ type: 'REMOVE_SCHOOL', schoolId });
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step Heading */}
      <div className="mb-8 text-center font-cal">
        <h2 className="text-2xl font-bold text-timeback-primary mb-2 font-cal">Find Your School</h2>
        <p className="text-timeback-primary font-cal">Search for and select your school to continue with your personalized recommendations.</p>
      </div>

      {/* Search Input */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="School name"
            className="w-full px-4 py-3 pl-12 pr-12 border border-timeback-primary rounded-xl focus:border-timeback-primary focus:ring-2 focus:ring-timeback-bg"
          />
          <svg 
            className="w-5 h-5 text-timeback-primary absolute left-4 top-1/2 transform -translate-y-1/2 font-cal" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {isLoading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-timeback-primary"></div>
            </div>
          )}
        </div>
        {error && (
          <p className="text-timeback-primary text-sm mt-2 font-cal">{error}</p>
        )}
        {searchQuery.length > 0 && searchQuery.length < 3 && (
          <p className="text-timeback-primary text-sm mt-2 font-cal">Type at least 3 characters to search</p>
        )}
      </div>

      {/* Search Results - Fixed Height Container */}
      <div className="mb-8 h-[400px]">
        {searchResults.length > 0 && !isLoading ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {searchResults.map((school) => (
              <div
                key={school.id}
                onClick={() => addSchool(school)}
                className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                  state.selectedSchools.some(s => s.id === school.id)
                    ? 'bg-timeback-bg border-timeback-primary'
                    : 'bg-timeback-bg/50 border-timeback-primary hover:border-timeback-primary hover:bg-timeback-bg'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-timeback-primary font-cal">{school.name}</h4>
                    <p className="text-sm text-timeback-primary font-cal">
                      {school.city}, {getStateAbbreviation(school.state)}
                    </p>
                  </div>
                  {state.selectedSchools.some(s => s.id === school.id) && (
                    <div className="text-timeback-primary font-cal">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery.length >= 3 && searchResults.length === 0 && !isLoading && !error ? (
          <div className="bg-timeback-bg rounded-xl p-6 text-center font-cal">
            <p className="text-timeback-primary font-cal">
              No schools found for &quot;{searchQuery}&quot;. Try a different search term or check the spelling.
            </p>
          </div>
        ) : searchQuery.length > 0 && searchQuery.length < 3 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {/* Placeholder school cards with same structure but empty content */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((i) => (
              <div
                key={i}
                className="p-3 rounded-xl border cursor-pointer transition-colors bg-white border-timeback-primary hover:border-timeback-primary"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-timeback-primary font-cal">&nbsp;</h4>
                    <p className="text-sm text-timeback-primary font-cal">&nbsp;</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Selected Schools - Fixed Height Container */}
      <div className="mb-8 min-h-[100px]">
        {state.selectedSchools.length > 0 ? (
          <div>
            <h3 className="text-lg font-semibold text-timeback-primary mb-4 font-cal">Selected School:</h3>
            <div className="space-y-2">
              {state.selectedSchools.map((school) => (
                <div
                  key={school.id}
                  className="bg-timeback-bg border border-timeback-primary p-3 rounded-xl flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-medium text-timeback-primary font-cal">{school.name}</h4>
                    <p className="text-sm text-timeback-primary font-cal">{school.city}, {getStateAbbreviation(school.state)}</p>
                  </div>
                  <button
                    onClick={() => removeSchool(school.id)}
                    className="text-timeback-primary hover:text-timeback-primary font-cal"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-timeback-bg border border-timeback-primary p-3 rounded-xl flex justify-between items-center opacity-50">
            <div>
              <div className="h-4 bg-timeback-bg rounded w-48 mb-2"></div>
              <div className="h-3 bg-timeback-bg rounded w-32"></div>
            </div>
            <div className="w-5 h-5 bg-timeback-bg rounded"></div>
          </div>
        )}
      </div>


    </div>
  );
}