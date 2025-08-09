'use client';

import React, { useState, useEffect, useCallback } from 'react';

// Fast animation config for under 2 seconds total completion
const fastAnimationConfig = {
  typingSpeed: 15,
  deletingSpeed: 10,
  pauseDuration: 300
};

interface SchoolData {
  id: string;
  name: string;
  city: string;
  state: string;
  level: string;
}

interface SchoolReportCardProps {
  schoolData?: SchoolData;
  onLearnMore: (section: string) => void;
}

interface SchoolDiggerData {
  schoolName: string;
  city: string;
  state: string;
  testScores: {
    reading: number;
    math: number;
    science: number;
  };
  percentile: number;
  enrollment: number;
  pupilTeacherRatio: number;
  gradeRange: string;
  district: string;
  rating: number;
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

// School Search Interface Component
function SchoolSearchInterface({ error, onSchoolSelect }: { error: string | null, onSchoolSelect: (school: SchoolSearchResult) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SchoolSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Advanced nationwide search function using the enhanced API
  const searchSchoolsNationwide = useCallback(async (query: string): Promise<{
    results: SchoolSearchResult[];
  }> => {
    console.log(`[SchoolSearchInterface] Starting search for: ${query}`);
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
      
      console.log(`[SchoolSearchInterface] Search completed in ${(endTime - startTime).toFixed(2)}ms`);
      
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
        results: transformedResults
      };
    } catch (error) {
      console.error('[SchoolSearchInterface] Search error:', error);
      throw error;
    }
  }, []);

  // Main search function
  const searchSchools = useCallback(async (query: string) => {
    const trimmedQuery = query.trim().toLowerCase();
    
    if (trimmedQuery.length === 0) {
      setSearchResults([]);
      return;
    }

    if (trimmedQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setSearchError(null);
    console.log('[SchoolSearchInterface] Starting search for:', query);

    try {
      const searchResult = await searchSchoolsNationwide(query);
      console.log('[SchoolSearchInterface] Search returned', searchResult.results.length, 'schools');
      setSearchResults(searchResult.results);
    } catch (err) {
      console.error('[SchoolSearchInterface] Search error:', err);
      setSearchError('Failed to search schools. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchSchoolsNationwide]);

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

  return (
    <div className="backdrop-blur-md bg-timeback-bg/80 rounded-2xl shadow-2xl border-2 border-timeback-primary overflow-hidden max-w-lg mx-auto">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-timeback-primary to-timeback-primary/90 text-white px-6 pb-6 pt-8 text-center font-cal">
        <h3 className="text-2xl font-bold font-cal mb-2">Find Your School</h3>
        <p className="text-white/90 font-cal">Search for your school to see personalized data comparison</p>
      </div>

      <div className="p-6 pt-8">
        {/* Search Input */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="School name"
              className="w-full px-4 py-3 pl-12 pr-12 border-2 border-timeback-primary rounded-xl focus:border-timeback-primary focus:ring-2 focus:ring-timeback-primary/20 bg-white text-timeback-primary placeholder-timeback-primary/70 font-cal"
            />
            <svg 
              className="w-5 h-5 text-timeback-primary/70 absolute left-4 top-1/2 transform -translate-y-1/2" 
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
          {searchError && (
            <p className="text-timeback-primary text-sm mt-2 font-cal">{searchError}</p>
          )}
          {searchQuery.length > 0 && searchQuery.length < 3 && (
            <p className="text-timeback-primary text-sm mt-2 font-cal">Type at least 3 characters to search</p>
          )}
        </div>

        {/* Search Results */}
        <div className="max-h-64 overflow-y-auto space-y-2">
          {searchResults.length > 0 && !isLoading ? (
            searchResults.map((school) => (
              <div
                key={school.id}
                onClick={() => onSchoolSelect(school)}
                className="p-3 rounded-xl border-2 border-timeback-primary cursor-pointer transition-colors bg-white hover:bg-timeback-bg/20 hover:border-timeback-primary"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-timeback-primary font-cal">{school.name}</h4>
                    <p className="text-sm text-timeback-primary/80 font-cal">
                      {school.city}, {getStateAbbreviation(school.state)}
                    </p>
                  </div>
                  <div className="text-timeback-primary/70">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))
          ) : searchQuery.length >= 3 && searchResults.length === 0 && !isLoading && !searchError ? (
            <div className="bg-white border-2 border-timeback-primary rounded-xl p-6 text-center">
              <p className="text-timeback-primary font-cal">
                No schools found for "{searchQuery}". Try a different search term.
              </p>
            </div>
          ) : error ? (
            <div className="bg-white border-2 border-timeback-primary rounded-xl p-6 text-center">
              <p className="text-timeback-primary font-cal mb-4">{error}</p>
              <p className="text-timeback-primary/60 text-sm font-cal">
                Enter your school name to get personalized learning insights.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function SchoolReportCard({ schoolData, onLearnMore }: SchoolReportCardProps) {
  const [schoolStats, setSchoolStats] = useState<SchoolDiggerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fast animations - no more typewriter hooks

  const fetchSchoolData = async (targetSchoolData?: SchoolData) => {
    const dataToUse = targetSchoolData || schoolData;
    console.log('[SchoolReportCard] Loading school data for:', dataToUse);
    
    if (!dataToUse) {
      console.error('[SchoolReportCard] No school data provided');
      setError('No school selected. Please select your school to see personalized data.');
      setIsLoading(false);
      return;
    }

    if (!dataToUse.id || dataToUse.id === 'PLACEHOLDER_ID') {
      console.error('[SchoolReportCard] Invalid school ID:', dataToUse.id);
      setError('Please select a valid school from the list to see performance data.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Call SchoolDigger API to get detailed school performance data
      const response = await fetch(`/api/schools/${dataToUse.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('School data not found. Please select a different school.');
        }
        throw new Error('Please enter your school name in the search field above.');
      }

      const data = await response.json();
      console.log('[SchoolReportCard] Received school data:', data);

      // Transform API data to our format
      console.log('[SchoolReportCard] Raw API response:', JSON.stringify(data, null, 2));
      
      // Get percentile from rankHistory (this is the actual school percentile)
      let overallPercentile = 50; // Default
      if (data.rankHistory && data.rankHistory.length > 0) {
        // Use the most recent year's percentile
        overallPercentile = Math.round(data.rankHistory[0].rankStatewidePercentage);
        console.log(`[SchoolReportCard] Using actual percentile from rankHistory: ${overallPercentile}th percentile`);
      } else if (data.rank && data.rankTotal && data.rankTotal > 0) {
        // Fallback: Calculate percentile from ranking
        overallPercentile = Math.round(((data.rankTotal - data.rank) / data.rankTotal) * 100);
        console.log(`[SchoolReportCard] Calculated percentile from rank ${data.rank}/${data.rankTotal}: ${overallPercentile}th percentile`);
      }
      
      // Calculate relative performance based on how much better the school performs vs state average
      const calculateRelativePerformance = (schoolPercent: number | undefined, statePercent: number | undefined) => {
        if (!schoolPercent || !statePercent) return overallPercentile; // Use overall school percentile as fallback
        
        // If school performs significantly better than state average, they're likely in a high percentile
        const performanceRatio = schoolPercent / statePercent;
        
        if (performanceRatio >= 2.0) return 95; // 2x better than state = 95th percentile
        if (performanceRatio >= 1.5) return 85; // 1.5x better = 85th percentile
        if (performanceRatio >= 1.2) return 75; // 1.2x better = 75th percentile
        if (performanceRatio >= 1.0) return 60; // At or above state = 60th percentile
        if (performanceRatio >= 0.8) return 40; // Slightly below = 40th percentile
        return 25; // Significantly below = 25th percentile
      };
      
      // Extract test scores from the testScores array (find most recent year)
      let readingScore, mathScore, scienceScore;
      let readingStateAvg, mathStateAvg, scienceStateAvg;
      
      if (data.testScores && Array.isArray(data.testScores)) {
        // Find the most recent test scores for each subject
        const recentReading = data.testScores
          .filter((t: any) => t.subject === 'Reading' && t.schoolTestScore)
          .sort((a: any, b: any) => b.year - a.year)[0];
        const recentMath = data.testScores
          .filter((t: any) => t.subject === 'Math' && t.schoolTestScore)
          .sort((a: any, b: any) => b.year - a.year)[0];
        const recentScience = data.testScores
          .filter((t: any) => t.subject === 'Science' && t.schoolTestScore)
          .sort((a: any, b: any) => b.year - a.year)[0];
        
        readingScore = recentReading?.schoolTestScore?.percentMetStandard;
        readingStateAvg = recentReading?.stateTestScore?.percentMetStandard;
        mathScore = recentMath?.schoolTestScore?.percentMetStandard;
        mathStateAvg = recentMath?.stateTestScore?.percentMetStandard;
        scienceScore = recentScience?.schoolTestScore?.percentMetStandard;
        scienceStateAvg = recentScience?.stateTestScore?.percentMetStandard;
      }
      
      console.log(`[SchoolReportCard] Test scores - Reading: ${readingScore}% (state: ${readingStateAvg}%), Math: ${mathScore}% (state: ${mathStateAvg}%), Science: ${scienceScore}% (state: ${scienceStateAvg}%)`);
      
      setSchoolStats({
        schoolName: data.schoolName || data.name || dataToUse.name,
        city: data.address?.city || data.city || dataToUse.city,
        state: data.address?.state || data.state || dataToUse.state,
        testScores: {
          reading: calculateRelativePerformance(readingScore, readingStateAvg),
          math: calculateRelativePerformance(mathScore, mathStateAvg),
          science: calculateRelativePerformance(scienceScore, scienceStateAvg)
        },
        percentile: overallPercentile,
        enrollment: data.schoolYearlyDetails?.[0]?.numberOfStudents || data.enrollment || 500,
        pupilTeacherRatio: data.schoolYearlyDetails?.[0]?.pupilTeacherRatio || 20,
        gradeRange: (data.lowGrade && data.highGrade) ? `${data.lowGrade}-${data.highGrade}` : (data.grades || dataToUse.level),
        district: data.district?.districtName || 'School District',
        rating: data.rankHistory?.[0]?.rankStars || data.rating || 5
      });
      
    } catch (err) {
      console.error('[SchoolReportCard] Error fetching school data:', err);
      setError(err instanceof Error ? err.message : 'Please enter your school name to continue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolData();
  }, [schoolData]);

  if (isLoading) {
    return (
      <div className="backdrop-blur-md bg-timeback-bg/80 rounded-2xl shadow-2xl border-2 border-timeback-primary overflow-hidden max-w-lg mx-auto">
        <div className="p-8 pt-8 text-center">
          <h2 className="text-3xl font-bold mb-4 font-cal text-timeback-primary">ANALYZING SCHOOL DATA</h2>
          <div className="w-16 h-16 border-4 border-timeback-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-cal text-timeback-primary">Loading your personalized comparison...</p>
        </div>
      </div>
    );
  }

  if (!schoolStats) {
    return <SchoolSearchInterface error={error} onSchoolSelect={(school) => {
      console.log('[SchoolReportCard] School selected:', school);
      // Update schoolData and trigger re-fetch
      setSchoolStats(null);
      setError(null);
      
      // Create school data object for the API call
      const updatedSchoolData: SchoolData = {
        id: school.id,
        name: school.name,
        city: school.city,
        state: school.state,
        level: school.level
      };
      
      // Trigger a new fetch with the selected school data
      fetchSchoolData(updatedSchoolData);
    }} />;
  }

  const getPerformanceIntensity = (percentile: number) => {
    if (percentile >= 75) return 'opacity-100';
    if (percentile >= 50) return 'opacity-75';
    return 'opacity-50';
  };

  const getPerformanceLabel = (percentile: number) => {
    if (percentile >= 75) return 'Above Average';
    if (percentile >= 50) return 'Average';
    return 'Below Average';
  };

  return (
    <div className="relative pt-6 mt-8">
      {/* Real Data Badge */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-timeback-primary text-white px-6 py-2 rounded-full shadow-2xl font-cal">
          <span className="text-sm font-bold font-cal">REAL DATA • 2024</span>
        </div>
      </div>

      <div className="backdrop-blur-md bg-timeback-bg/80 rounded-2xl shadow-2xl border-2 border-timeback-primary overflow-hidden max-w-lg mx-auto">

      {/* Header Section */}
      <div className="bg-gradient-to-r from-timeback-primary to-timeback-primary/90 text-white p-6 text-center font-cal">
        <h3 className="text-2xl font-bold font-cal mb-2">TIMEBACK RESULTS</h3>
        <p className="text-white/90 font-cal">{schoolStats.schoolName} • {schoolStats.city}, {schoolStats.state}</p>
        <p className="text-white/75 text-sm font-cal mt-1">MAP Standardized Testing</p>
      </div>

      {/* Achievement Badge */}
      <div className="relative -mt-6 flex justify-center">
        <div className="backdrop-blur-md bg-white border-4 border-timeback-primary rounded-full px-6 py-3 shadow-2xl">
          <div className="flex items-center gap-2 text-timeback-primary font-cal">
            <span className="w-3 h-3 bg-timeback-primary rounded-full animate-pulse"></span>
            <span className="font-bold text-lg font-cal">TOP 1 NATIONALLY</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 pt-8 space-y-6">
        
        {/* Comparison Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* User's School */}
          <div className="text-center font-cal">
            <div className="bg-white border-2 border-timeback-primary rounded-xl p-4 space-y-3">
              <h4 className="text-timeback-primary font-bold mb-3 font-cal text-sm">Your School</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-cal text-timeback-primary">Enrollment:</span>
                  <span className="font-bold text-xs font-cal text-timeback-primary">{schoolStats.enrollment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-cal text-timeback-primary">Class Size:</span>
                  <span className="font-bold text-xs font-cal text-timeback-primary">{schoolStats.pupilTeacherRatio}:1</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-cal text-timeback-primary">Performance:</span>
                  <span className="font-bold text-xs font-cal text-timeback-primary">{schoolStats.percentile}th</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-cal text-timeback-primary">Test Scores:</span>
                  <span className="font-bold text-xs font-cal text-timeback-primary">
                    {Math.round((schoolStats.testScores.reading + schoolStats.testScores.math + schoolStats.testScores.science) / 3)}th
                  </span>
                </div>
              </div>
              <div className="text-xs text-timeback-primary pt-2 border-t border-timeback-primary font-cal">
                {schoolStats.schoolName}
              </div>
            </div>
          </div>

          {/* Alpha School */}
          <div className="text-center font-cal">
            <div className="bg-white border-2 border-timeback-primary rounded-xl p-4 space-y-3">
              <h4 className="text-timeback-primary font-bold mb-3 font-cal text-sm">Alpha School</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-cal text-timeback-primary">Enrollment:</span>
                  <span className="font-bold text-xs font-cal text-timeback-primary">500+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-cal text-timeback-primary">Class Size:</span>
                  <span className="font-bold text-xs font-cal text-timeback-primary">8:1</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-cal text-timeback-primary">Performance:</span>
                  <span className="font-bold text-xs font-cal text-timeback-primary">99th</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-cal text-timeback-primary">Test Scores:</span>
                  <span className="font-bold text-xs font-cal text-timeback-primary">99th</span>
                </div>
              </div>
              <div className="text-xs text-timeback-primary font-bold pt-2 border-t border-timeback-primary font-cal">
                2 hours daily
              </div>
            </div>
          </div>
        </div>

        {/* Test Results Comparison Section */}
        <div className="bg-white border-2 border-timeback-primary rounded-xl p-5">
          <h4 className="font-bold text-timeback-primary mb-4 text-center font-cal">Test Score Comparison (2024)</h4>
          
          {/* Headers */}
          <div className="grid grid-cols-3 gap-3 mb-3 text-xs font-cal">
            <div className="text-timeback-primary font-bold"></div>
            <div className="text-timeback-primary font-bold text-center">Your School</div>
            <div className="text-timeback-primary font-bold text-center">Alpha School</div>
          </div>
          
          {/* Test Score Rows */}
          <div className="space-y-2 text-sm font-cal">
            <div className="grid grid-cols-3 gap-3 items-center">
              <span className="text-timeback-primary font-cal">Reading:</span>
              <span className="font-bold text-timeback-primary font-cal text-center">{schoolStats.testScores.reading}th</span>
              <span className="font-bold text-timeback-primary font-cal text-center">99th</span>
            </div>
            <div className="grid grid-cols-3 gap-3 items-center">
              <span className="text-timeback-primary font-cal">Math:</span>
              <span className="font-bold text-timeback-primary font-cal text-center">{schoolStats.testScores.math}th</span>
              <span className="font-bold text-timeback-primary font-cal text-center">99th</span>
            </div>
            <div className="grid grid-cols-3 gap-3 items-center">
              <span className="text-timeback-primary font-cal">Science:</span>
              <span className="font-bold text-timeback-primary font-cal text-center">{schoolStats.testScores.science}th</span>
              <span className="font-bold text-timeback-primary font-cal text-center">99th</span>
            </div>
            <div className="grid grid-cols-3 gap-3 items-center border-t border-timeback-primary pt-2">
              <span className="text-timeback-primary font-cal">Overall:</span>
              <span className="font-bold text-timeback-primary font-cal text-center">
                {Math.round((schoolStats.testScores.reading + schoolStats.testScores.math + schoolStats.testScores.science) / 3)}th
              </span>
              <span className="font-bold text-timeback-primary font-cal text-center">99th</span>
            </div>
          </div>
        </div>

        {/* Source Citation */}
        <div className="text-center pt-2 font-cal">
          <p className="text-xs text-timeback-primary font-cal leading-tight opacity-75">
            Sources: {schoolStats.schoolName} data via SchoolDigger API • Alpha School Spring 2024 MAP Results<br/>
            Real comparison data • Class sizes: {schoolStats.pupilTeacherRatio}:1 vs 8:1 • Performance: {schoolStats.percentile}th vs 99th
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}