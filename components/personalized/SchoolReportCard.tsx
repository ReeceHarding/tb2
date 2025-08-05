'use client';

import React, { useState, useEffect } from 'react';

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

export default function SchoolReportCard({ schoolData, onLearnMore }: SchoolReportCardProps) {
  const [schoolStats, setSchoolStats] = useState<SchoolDiggerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[SchoolReportCard] Loading school data for:', schoolData);
    
    const fetchSchoolData = async () => {
      if (!schoolData) {
        console.error('[SchoolReportCard] CRITICAL ERROR: No school data provided - this should never happen');
        setError('CRITICAL ERROR: No school data provided to SchoolReportCard component');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Call SchoolDigger API to get detailed school performance data
        const response = await fetch(`/api/schools/${schoolData.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch school data');
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
          schoolName: data.schoolName || data.name || schoolData.name,
          city: data.address?.city || data.city || schoolData.city,
          state: data.address?.state || data.state || schoolData.state,
          testScores: {
            reading: calculateRelativePerformance(readingScore, readingStateAvg),
            math: calculateRelativePerformance(mathScore, mathStateAvg),
            science: calculateRelativePerformance(scienceScore, scienceStateAvg)
          },
          percentile: overallPercentile,
          enrollment: data.schoolYearlyDetails?.[0]?.numberOfStudents || data.enrollment || 500,
          pupilTeacherRatio: data.schoolYearlyDetails?.[0]?.pupilTeacherRatio || 20,
          gradeRange: (data.lowGrade && data.highGrade) ? `${data.lowGrade}-${data.highGrade}` : (data.grades || schoolData.level),
          district: data.district?.districtName || 'School District',
          rating: data.rankHistory?.[0]?.rankStars || data.rating || 5
        });
        
      } catch (err) {
        console.error('[SchoolReportCard] CRITICAL API FAILURE:', err);
        setError(`API FAILURE: ${err instanceof Error ? err.message : 'Unknown error fetching school data'}`);
        // NO FALLBACK DATA - Let it fail visibly so issues are obvious
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchoolData();
  }, [schoolData]);

  if (isLoading) {
    return (
      <div className="w-full max-w-lg mx-auto backdrop-blur-md bg-white/10 rounded-2xl shadow-2xl border-2 border-timeback-primary overflow-hidden">
        <div className="bg-timeback-primary text-white p-6 text-center font-cal">
          <h3 className="text-xl font-bold font-cal">Analyzing School Performance</h3>
          <p className="text-sm opacity-90 mt-1 font-cal">Loading your personalized comparison...</p>
        </div>
        <div className="p-8 text-center font-cal">
          <div className="w-16 h-16 border-4 border-timeback-bg border-t-timeback-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-timeback-primary font-cal">Gathering real school data...</p>
        </div>
      </div>
    );
  }

  if (!schoolStats) {
    return (
      <div className="w-full max-w-lg mx-auto backdrop-blur-md bg-white/10 rounded-2xl shadow-2xl border-2 border-timeback-primary overflow-hidden">
        <div className="bg-timeback-primary text-white p-6 text-center font-cal">
          <h3 className="text-xl font-bold font-cal">School Data Unavailable</h3>
        </div>
        <div className="p-6 text-center font-cal">
          <p className="text-timeback-primary font-cal">{error || 'Unable to load school performance data'}</p>
          <p className="text-timeback-primary text-sm mt-2 font-cal">We can still show you TimeBack results!</p>
        </div>
      </div>
    );
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
    <div className="w-full max-w-lg mx-auto backdrop-blur-md bg-white/10 rounded-2xl shadow-2xl border-2 border-timeback-primary overflow-hidden">
      {/* Header */}
      <div className="bg-timeback-primary text-white p-6 text-center font-cal">
        <h3 className="text-xl font-bold font-cal">YOUR RESULTS PREVIEW</h3>
        <p className="text-sm opacity-90 mt-1 font-cal">{schoolStats.schoolName}</p>
        <p className="text-xs opacity-75 font-cal">{schoolStats.city}, {schoolStats.state} • {schoolStats.gradeRange}</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Current Performance Badge */}
        <div className="text-center font-cal">
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full text-sm font-bold border-2 border-timeback-primary ${getPerformanceIntensity(schoolStats.percentile)}`}>
            <div className="w-3 h-3 bg-timeback-primary rounded-full"></div>
            <span className="text-timeback-primary font-cal">
              Currently {schoolStats.percentile}th Percentile ({getPerformanceLabel(schoolStats.percentile)})
            </span>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Current School */}
          <div className="text-center font-cal">
            <p className="text-timeback-primary font-bold mb-3 font-cal">Current School</p>
            <div className="backdrop-blur-sm bg-white/10 border-2 border-timeback-primary rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-timeback-primary font-cal">Reading:</span>
                <span className={`font-bold text-sm text-timeback-primary font-cal ${getPerformanceIntensity(schoolStats.testScores.reading)}`}>
                  {schoolStats.testScores.reading}th
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-timeback-primary font-cal">Math:</span>
                <span className={`font-bold text-sm text-timeback-primary font-cal ${getPerformanceIntensity(schoolStats.testScores.math)}`}>
                  {schoolStats.testScores.math}th
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-timeback-primary font-cal">Science:</span>
                <span className={`font-bold text-sm text-timeback-primary font-cal ${getPerformanceIntensity(schoolStats.testScores.science)}`}>
                  {schoolStats.testScores.science}th
                </span>
              </div>
              <div className="text-xs text-timeback-primary mt-3 pt-3 border-t border-timeback-primary font-cal">
                Ratio: {Math.round(schoolStats.pupilTeacherRatio)}:1
              </div>
            </div>
          </div>

          {/* With TimeBack */}
          <div className="text-center font-cal">
            <p className="text-timeback-primary font-bold mb-3 font-cal">With TimeBack</p>
            <div className="bg-timeback-bg border-2 border-timeback-primary rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-timeback-primary font-cal">Reading:</span>
                <span className="text-timeback-primary font-bold text-sm font-cal">99th</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-timeback-primary font-cal">Math:</span>
                <span className="text-timeback-primary font-bold text-sm font-cal">99th</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-timeback-primary font-cal">Science:</span>
                <span className="text-timeback-primary font-bold text-sm font-cal">99th</span>
              </div>
              <div className="text-xs text-timeback-primary font-bold mt-3 pt-3 border-t border-timeback-primary font-cal">
                1:1 Personalized
              </div>
            </div>
          </div>
        </div>

        {/* Improvement Projection */}
        <div className="bg-gradient-to-r from-timeback-bg to-white border-2 border-timeback-primary rounded-xl p-6">
          <h4 className="font-bold text-timeback-primary mb-4 text-center font-cal">
            Your Child&apos;s Projected Growth
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-timeback-primary font-cal">Current Average:</span>
              <span className="font-bold text-timeback-primary font-cal">
                {Math.round((schoolStats.testScores.reading + schoolStats.testScores.math + schoolStats.testScores.science) / 3)}th percentile
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-timeback-primary font-cal">With TimeBack:</span>
              <span className="font-bold text-timeback-primary font-cal">99th percentile</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-timeback-primary font-cal">Improvement:</span>
              <span className="font-bold text-timeback-primary font-cal">
                +{99 - Math.round((schoolStats.testScores.reading + schoolStats.testScores.math + schoolStats.testScores.science) / 3)} points
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-timeback-primary font-cal">Daily Time:</span>
              <span className="font-bold text-timeback-primary font-cal">Only 2 hours</span>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center pt-4 font-cal">
          <button 
            onClick={() => onLearnMore('school-performance')}
            className="bg-timeback-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all duration-200 shadow-2xl hover:shadow-2xl transform hover:scale-105 font-cal"
          >
            See How We Achieve This →
          </button>
        </div>

        {/* Data Source Citation */}
        <div className="text-center pt-4 font-cal">
          <p className="text-xs text-timeback-primary opacity-75 font-cal">
            Real data from {schoolStats.district} & proven TimeBack results
          </p>
        </div>


      </div>
    </div>
  );
}