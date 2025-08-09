'use client'

import React, { useEffect, useState } from 'react'
import { TypewriterText } from './FollowUpQuestions'

interface QuizData {
  grade: string
  selectedSchools?: Array<{name: string, rating: number}>
}

interface CompletionTimeDataProps {
  onLearnMore?: () => void
}

interface CompletionData {
  grade: string
  math: { lessons: number, avgMinutes: number, totalHours: number }
  language: { lessons: number, avgMinutes: number, totalHours: number }
  science: { lessons: number, avgMinutes: number, totalHours: number }
}

const completionData: CompletionData[] = [
  { grade: 'K', math: { lessons: 106, avgMinutes: 30, totalHours: 53 }, language: { lessons: 50, avgMinutes: 30, totalHours: 25 }, science: { lessons: 0, avgMinutes: 0, totalHours: 0 } },
  { grade: '1', math: { lessons: 90, avgMinutes: 30, totalHours: 45 }, language: { lessons: 76, avgMinutes: 30, totalHours: 38 }, science: { lessons: 2, avgMinutes: 30, totalHours: 1 } },
  { grade: '2', math: { lessons: 94, avgMinutes: 30, totalHours: 47 }, language: { lessons: 86, avgMinutes: 30, totalHours: 43 }, science: { lessons: 10, avgMinutes: 30, totalHours: 5 } },
  { grade: '3', math: { lessons: 88, avgMinutes: 30, totalHours: 44 }, language: { lessons: 88, avgMinutes: 30, totalHours: 44 }, science: { lessons: 24, avgMinutes: 30, totalHours: 12 } },
  { grade: '4', math: { lessons: 84, avgMinutes: 30, totalHours: 42 }, language: { lessons: 90, avgMinutes: 30, totalHours: 45 }, science: { lessons: 28, avgMinutes: 30, totalHours: 14 } },
  { grade: '5', math: { lessons: 82, avgMinutes: 30, totalHours: 41 }, language: { lessons: 92, avgMinutes: 30, totalHours: 46 }, science: { lessons: 30, avgMinutes: 30, totalHours: 15 } },
  { grade: '6', math: { lessons: 80, avgMinutes: 30, totalHours: 40 }, language: { lessons: 94, avgMinutes: 30, totalHours: 47 }, science: { lessons: 32, avgMinutes: 30, totalHours: 16 } },
  { grade: '7', math: { lessons: 78, avgMinutes: 30, totalHours: 39 }, language: { lessons: 96, avgMinutes: 30, totalHours: 48 }, science: { lessons: 34, avgMinutes: 30, totalHours: 17 } },
  { grade: '8', math: { lessons: 76, avgMinutes: 30, totalHours: 38 }, language: { lessons: 98, avgMinutes: 30, totalHours: 49 }, science: { lessons: 36, avgMinutes: 30, totalHours: 18 } },
  { grade: '9', math: { lessons: 74, avgMinutes: 30, totalHours: 37 }, language: { lessons: 100, avgMinutes: 30, totalHours: 50 }, science: { lessons: 38, avgMinutes: 30, totalHours: 19 } },
  { grade: '10', math: { lessons: 72, avgMinutes: 30, totalHours: 36 }, language: { lessons: 102, avgMinutes: 30, totalHours: 51 }, science: { lessons: 40, avgMinutes: 30, totalHours: 20 } },
  { grade: '11', math: { lessons: 70, avgMinutes: 30, totalHours: 35 }, language: { lessons: 104, avgMinutes: 30, totalHours: 52 }, science: { lessons: 42, avgMinutes: 30, totalHours: 21 } },
]

export default function CompletionTimeData({ onLearnMore }: CompletionTimeDataProps) {
  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [selectedGrade, setSelectedGrade] = useState<string>('5')

  useEffect(() => {
    const data = localStorage.getItem('timebackQuizData')
    if (data) {
      const parsed = JSON.parse(data)
      setQuizData(parsed)
      const grade = parsed.grade?.replace(/st|nd|rd|th/, '') || '5'
      setSelectedGrade(grade)
    }
  }, [])

  const gradeData = completionData.find(d => d.grade === selectedGrade) || completionData[4]
  const topSchool = quizData?.selectedSchools?.[0]

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header with Grade Selector */}
        <div className="text-center mb-12 font-cal">
          <h2 className="text-3xl lg:text-4xl font-bold text-timeback-primary mb-4 font-cal">
            <TypewriterText 
              text="Actual Student Completion Hours"
              speed={30}
              startDelay={200}
            />
          </h2>
          <p className="text-lg text-timeback-primary mb-6 font-cal">
            <TypewriterText 
              text="Measured completion times by grade level - not theoretical estimates"
              speed={25}
              startDelay={800}
            />
          </p>
          
          <div className="flex justify-center items-center gap-4">
            <span className="text-sm font-medium text-timeback-primary font-cal">View data for grade:</span>
            <select 
              className="px-3 py-2 font-cal rounded-xl border-2 border-timeback-primary text-timeback-primary focus:outline-none focus:ring-4 focus:ring-timeback-primary focus:ring-opacity-30 focus:border-timeback-primary transition-all duration-200 w-32" 
              value={selectedGrade} 
              onChange={(e) => setSelectedGrade(e.target.value)}
            >
              {completionData.map(item => (
                <option key={item.grade} value={item.grade}>
                  Grade {item.grade}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main comparison chart with vertical bars */}
        <div className="rounded-2xl shadow-2xl border-2 border-timeback-primary p-12 mb-16">
          <h3 className="text-3xl font-bold text-timeback-primary mb-12 text-center font-cal">
            <TypewriterText 
              text={`Grade ${selectedGrade} - Alpha vs Traditional Hours`}
              speed={30}
              startDelay={1400}
            />
          </h3>
          
          {/* Desktop view - Combined Vertical Bar chart */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Chart container */}
              <div className="h-[400px] flex items-end justify-center gap-8">
                {(['math', 'language', 'science'] as const).map((subject, index) => {
                  const alphaHours = gradeData[subject].totalHours;
                  const traditionalHours = 180; // Fixed traditional hours
                  const maxValue = 180; // Fixed max to show consistent scale
                  const alphaHeight = Math.round(((alphaHours / maxValue) * 350)); // 350px max height
                  const traditionalHeight = Math.round(((traditionalHours / maxValue) * 350));
                  const speedupFactor = Math.round(traditionalHours / alphaHours);
                  
                  return (
                    <div key={subject} className="flex gap-2">
                      {/* Alpha bar (left) */}
                      <div className="text-center font-cal">
                        <div className="relative h-[350px] flex items-end">
                          <div className="w-16 relative group">
                            <div 
                              className="bg-timeback-primary rounded-t-lg transition-all duration-1000 ease-out relative hover:bg-opacity-90"
                              style={{ height: `${alphaHeight}px` }}
                            >
                              {/* Hours label on top of bar */}
                              <div className="absolute -top-8 left-0 right-0 text-sm font-bold text-timeback-primary font-cal">
                                {alphaHours}h
                              </div>
                              {/* Speedup factor badge positioned below the bar */}
                              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                <div className="bg-timeback-bg border border-timeback-primary text-timeback-primary px-3 py-2 rounded-full text-sm font-bold font-cal">
                                  {speedupFactor}x
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Traditional school bar (right) */}
                      <div className="text-center font-cal">
                        <div className="relative h-[350px] flex items-end">
                          <div className="w-16 relative group">
                            <div 
                              className="bg-timeback-bg rounded-t-xl transition-all duration-1000 ease-out relative hover:bg-timeback-bg"
                              style={{ height: `${traditionalHeight}px` }}
                            >
                              {/* Hours label on top of bar */}
                              <div className="absolute -top-8 left-0 right-0 text-sm font-bold text-timeback-primary font-cal">
                                {traditionalHours}h
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* X-axis labels */}
              <div className="flex justify-center gap-8 mt-16">
                {(['math', 'language', 'science'] as const).map((subject) => (
                  <div key={subject} className="text-center w-[136px] font-cal">
                    <h4 className="font-bold text-timeback-primary text-lg font-cal capitalize">
                      {subject === 'language' ? 'Language Arts' : subject}
                    </h4>
                  </div>
                ))}
              </div>
              
              {/* Legend */}
              <div className="flex justify-center gap-12 mt-12">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-timeback-primary rounded"></div>
                  <span className="text-lg text-timeback-primary font-cal font-bold">Alpha (TimeBack)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-timeback-bg rounded"></div>
                  <span className="text-lg text-timeback-primary font-cal">Traditional School</span>
                </div>
              </div>
              
              {/* Total hours comparison */}
              <div className="flex items-center justify-center mt-12">
                <div className="inline-flex items-center gap-6 bg-timeback-bg border-2 border-timeback-primary text-timeback-primary px-8 py-4 rounded-xl text-xl font-bold font-cal shadow-2xl">
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Alpha: {gradeData.math.totalHours + gradeData.language.totalHours + gradeData.science.totalHours} hours</span>
                  </div>
                  <div className="text-2xl">vs</div>
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Traditional School: 540 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile view - Cards */}
          <div className="lg:hidden space-y-6">
            {(['math', 'language', 'science'] as const).map((subject) => (
              <div key={subject} className="bg-timeback-bg rounded-xl border-2 border-timeback-primary p-6">
                <h4 className="font-bold text-timeback-primary mb-4 text-xl font-cal capitalize">
                  {subject === 'language' ? 'Language Arts' : subject}
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-timeback-primary font-cal">Alpha (TimeBack):</span>
                    <span className="font-bold text-timeback-primary font-cal">{gradeData[subject].totalHours} hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-timeback-primary font-cal">Traditional School:</span>
                    <span className="font-bold text-timeback-primary font-cal">180 hours</span>
                  </div>
                  <div className="pt-3 border-t-2 border-timeback-primary">
                    <span className="text-timeback-primary font-bold font-cal text-lg">{Math.round(180 / gradeData[subject].totalHours)}x faster!</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total completion time improvement */}
          <div className="flex items-center justify-center mt-12">
            <div className="inline-flex items-center gap-3 bg-timeback-bg border-2 border-timeback-primary text-timeback-primary px-8 py-4 rounded-xl text-xl font-bold font-cal shadow-2xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <TypewriterText 
                text={`${Math.round(540 / (gradeData.math.totalHours + gradeData.language.totalHours + gradeData.science.totalHours))}x faster total completion time`}
                speed={25}
                startDelay={2000}
              />
            </div>
          </div>
        </div>

        {/* Performance Tier Comparison */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card bg-base-100 shadow-2xl border border-timeback-primary group hover:bg-timeback-bg hover:shadow-2xl transition-all duration-300 ease-in-out">
            <div className="card-body">
              <h3 className="card-title text-center justify-center text-lg text-timeback-primary group-hover:text-timeback-primary transition-colors duration-200 font-cal">
                <TypewriterText 
                  text="Top 20% Students"
                  speed={30}
                  startDelay={2400}
                />
              </h3>
              <div className="text-center font-cal">
                <div className="text-3xl font-bold text-timeback-primary mb-2 font-cal">3.9x</div>
                <div className="text-sm text-timeback-primary font-cal">Faster than traditional pace</div>
                <div className="text-xs text-timeback-primary mt-2 font-cal">~46 hours per grade level</div>
              </div>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-2xl border border-timeback-primary group hover:bg-timeback-bg hover:shadow-2xl transition-all duration-300 ease-in-out">
            <div className="card-body">
              <h3 className="card-title text-center justify-center text-lg text-timeback-primary group-hover:text-timeback-primary transition-colors duration-200 font-cal">Top 2/3 Students</h3>
              <div className="text-center font-cal">
                <div className="text-3xl font-bold text-timeback-primary mb-2 font-cal">2.6x</div>
                <div className="text-sm text-timeback-primary font-cal">Faster than traditional pace</div>
                <div className="text-xs text-timeback-primary mt-2 font-cal">~69 hours per grade level</div>
              </div>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-2xl border border-timeback-primary group hover:bg-timeback-bg hover:shadow-2xl transition-all duration-300 ease-in-out">
            <div className="card-body">
              <h3 className="card-title text-center justify-center text-lg text-timeback-primary group-hover:text-timeback-primary transition-colors duration-200 font-cal">All Students</h3>
              <div className="text-center font-cal">
                <div className="text-3xl font-bold text-timeback-primary mb-2 font-cal">2.2x</div>
                <div className="text-sm text-timeback-primary font-cal">Faster than traditional pace</div>
                <div className="text-xs text-timeback-primary mt-2 font-cal">~82 hours per grade level</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Citation */}
        <div className="text-center mt-12 font-cal">
                  <p className="text-sm text-timeback-primary font-cal">
          This isn&#39;t theoretical - these are measured completion times from real students.
        </p>
          <button 
            onClick={() => onLearnMore?.()}
            className="text-timeback-primary hover:opacity-80 underline text-sm mt-2 inline-block font-cal bg-transparent border-none cursor-pointer"
          >
            View Complete Data Methodology →
          </button>
        </div>
      </div>
    </section>
  )
}