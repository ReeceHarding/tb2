'use client'

import React, { useEffect, useState } from 'react'

interface QuizData {
  grade: string
  selectedSchools?: Array<{name: string, rating: number}>
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

interface CompletionTimeDataProps {
  userGrade?: string;
  schoolName?: string;
}

export default function CompletionTimeData({ userGrade, schoolName }: CompletionTimeDataProps = {}) {
  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [selectedGrade, setSelectedGrade] = useState<string>('5')

  useEffect(() => {
    // First check props, then fallback to localStorage
    if (userGrade) {
      const grade = userGrade.replace(/st|nd|rd|th/, '') || '5'
      setSelectedGrade(grade)
    } else {
      const data = localStorage.getItem('timebackQuizData')
      if (data) {
        const parsed = JSON.parse(data)
        setQuizData(parsed)
        const grade = parsed.grade?.replace(/st|nd|rd|th/, '') || '5'
        setSelectedGrade(grade)
      }
    }
  }, [userGrade])

  const gradeData = completionData.find(d => d.grade === selectedGrade) || completionData[4]
  const topSchool = schoolName || quizData?.selectedSchools?.[0]

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-12 font-cal">
          <h2 className="text-3xl lg:text-4xl font-bold text-timeback-primary mb-4 font-cal">
            Actual Student Completion Hours
          </h2>
          <p className="text-lg text-timeback-primary mb-6 font-cal">
            Measured completion times by grade level - not theoretical estimates
          </p>
        </div>

        {/* Table View */}
        <div className="mb-12">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full bg-white border-2 border-timeback-primary rounded-xl shadow-xl">
              <thead>
                <tr className="bg-timeback-bg text-timeback-primary">
                  <th className="font-cal text-lg">Grade</th>
                  <th className="font-cal text-lg text-center">Math Hours</th>
                  <th className="font-cal text-lg text-center">Language Hours</th>
                  <th className="font-cal text-lg text-center">Science Hours</th>
                  <th className="font-cal text-lg text-center">Total Hours</th>
                  <th className="font-cal text-lg text-center">vs Traditional (540h)</th>
                </tr>
              </thead>
              <tbody>
                {completionData.map((data) => {
                  const totalHours = data.math.totalHours + data.language.totalHours + data.science.totalHours;
                  const isUserGrade = data.grade === selectedGrade;
                  return (
                    <tr 
                      key={data.grade} 
                      className={isUserGrade ? 'bg-timeback-bg border-4 border-timeback-primary' : ''}
                    >
                      <td className={`font-cal font-bold ${isUserGrade ? 'text-timeback-primary text-xl' : 'text-timeback-primary'}`}>
                        Grade {data.grade}
                        {isUserGrade && <span className="ml-2 badge badge-primary font-cal">Your Grade</span>}
                      </td>
                      <td className={`font-cal text-center ${isUserGrade ? 'text-timeback-primary font-bold text-lg' : 'text-timeback-primary'}`}>
                        {data.math.totalHours}h
                      </td>
                      <td className={`font-cal text-center ${isUserGrade ? 'text-timeback-primary font-bold text-lg' : 'text-timeback-primary'}`}>
                        {data.language.totalHours}h
                      </td>
                      <td className={`font-cal text-center ${isUserGrade ? 'text-timeback-primary font-bold text-lg' : 'text-timeback-primary'}`}>
                        {data.science.totalHours}h
                      </td>
                      <td className={`font-cal text-center ${isUserGrade ? 'text-timeback-primary font-bold text-lg' : 'text-timeback-primary'}`}>
                        {totalHours}h
                      </td>
                      <td className={`font-cal text-center ${isUserGrade ? 'text-timeback-primary font-bold text-lg' : 'text-timeback-primary'}`}>
                        <span className="badge badge-success font-cal">
                          {Math.round(((540 - totalHours) / 540) * 100)}% faster
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Grade Selector for Detailed View */}
        <div className="text-center mb-12 font-cal">
          <div className="flex justify-center items-center gap-4">
            <span className="text-sm font-medium text-timeback-primary font-cal">View detailed breakdown for grade:</span>
            <select 
              className="px-3 py-2 font-cal rounded-xl border-2 border-timeback-primary text-timeback-primary bg-white focus:outline-none focus:ring-4 focus:ring-timeback-primary focus:ring-opacity-30 focus:border-timeback-primary transition-all duration-200 w-32" 
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

        {/* Grade-Specific Data */}
        <div className="mb-12">
          <div className="card bg-base-100 shadow-2xl max-w-4xl mx-auto border border-timeback-primary">
            <div className="card-body">
              <h2 className="card-title text-center justify-center text-timeback-primary font-cal">
                Grade {selectedGrade} Detailed Breakdown
              </h2>
              {topSchool && (
                <p className="text-center text-timeback-primary font-cal">
                  vs {typeof topSchool === 'string' ? topSchool : topSchool.name}&#39;s traditional 180-hour allocation per subject
                </p>
              )}
              
              {/* Visual Comparison */}
              <div className="mt-8 space-y-6">
                <div className="bg-timeback-bg p-4 rounded-xl">
                  <h3 className="text-center text-lg font-semibold text-timeback-primary mb-4 font-cal">Hours to Complete Each Subject</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {(['math', 'language', 'science'] as const).map((subject) => {
                      const hours = gradeData[subject].totalHours
                      const percentage = (hours / 180) * 100
                      return (
                        <div key={subject} className="text-center font-cal">
                          <div className="radial-progress text-timeback-primary font-cal" style={{"--value": percentage, "--size": "6rem", "--thickness": "0.5rem"} as React.CSSProperties}>
                            <span className="text-xl font-bold font-cal">{hours}h</span>
                          </div>
                          <p className="mt-2 text-sm font-medium capitalize text-timeback-primary font-cal">{subject}</p>
                          <p className="text-xs text-timeback-primary font-cal">vs 180h traditional</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="divider my-8"></div>
              
              {/* Subject Breakdowns */}
              <div className="grid md:grid-cols-3 gap-8">
                {/* Math */}
                <div className="text-center font-cal">
                  <h3 className="text-xl font-bold text-timeback-primary mb-4 font-cal">Mathematics</h3>
                  <div className="space-y-4">
                    <div className="text-4xl font-bold text-timeback-primary font-cal">
                      {gradeData.math.totalHours}h
                    </div>
                    <div className="text-sm text-timeback-primary space-y-1 font-cal">
                      <div>{gradeData.math.lessons} lessons × {gradeData.math.avgMinutes} min avg</div>
                      <div>= {gradeData.math.totalHours} total hours</div>
                    </div>
                    <div className="badge badge-sm bg-timeback-bg text-timeback-primary font-cal">
                      {Math.round(((180 - gradeData.math.totalHours) / 180) * 100)}% faster than traditional 180h
                    </div>
                  </div>
                </div>

                {/* Language Arts */}
                <div className="text-center font-cal">
                  <h3 className="text-xl font-bold text-timeback-primary mb-4 font-cal">Language Arts</h3>
                  <div className="space-y-4">
                    <div className="text-4xl font-bold text-timeback-primary font-cal">
                      {gradeData.language.totalHours}h
                    </div>
                    <div className="text-sm text-timeback-primary space-y-1 font-cal">
                      <div>{gradeData.language.lessons} lessons × {gradeData.language.avgMinutes} min avg</div>
                      <div>= {gradeData.language.totalHours} total hours</div>
                    </div>
                    <div className="badge badge-sm bg-timeback-bg text-timeback-primary font-cal">
                      {Math.round(((180 - gradeData.language.totalHours) / 180) * 100)}% faster than traditional 180h
                    </div>
                  </div>
                </div>

                {/* Science */}
                <div className="text-center font-cal">
                  <h3 className="text-xl font-bold text-timeback-primary mb-4 font-cal">Science</h3>
                  <div className="space-y-4">
                    <div className="text-4xl font-bold text-timeback-primary font-cal">
                      {gradeData.science.totalHours}h
                    </div>
                    <div className="text-sm text-timeback-primary space-y-1 font-cal">
                      <div>{gradeData.science.lessons} lessons × {gradeData.science.avgMinutes} min avg</div>
                      <div>= {gradeData.science.totalHours} total hours</div>
                    </div>
                    <div className="badge badge-sm bg-timeback-bg text-timeback-primary font-cal">
                      {gradeData.science.totalHours > 0 
                        ? `${Math.round(((180 - gradeData.science.totalHours) / 180) * 100)}% faster than traditional 180h`
                        : 'Not applicable for grade K'
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown Collapse */}
              <div className="collapse collapse-arrow bg-base-200 mt-8">
                <input type="checkbox" /> 
                <div className="collapse-title text-timeback-primary font-medium font-cal">
                  How These Hours Were Measured
                </div>
                <div className="collapse-content"> 
                  <div className="grid md:grid-cols-2 gap-4 text-sm pt-4 font-cal">
                    <div>
                      <h4 className="font-semibold mb-2 text-timeback-primary font-cal">Data Collection:</h4>
                      <ul className="space-y-1 text-timeback-primary font-cal">
                        <li>• Tracked every student lesson completion</li>
                        <li>• Recorded actual time spent per lesson</li>
                        <li>• Measured only active learning time</li>
                        <li>• Excluded breaks and transitions</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-timeback-primary font-cal">Quality Standards:</h4>
                      <ul className="space-y-1 text-timeback-primary font-cal">
                        <li>• 100% mastery required to advance</li>
                        <li>• Minimum 80% on all assessments</li>
                        <li>• Comprehensive final evaluations</li>
                        <li>• MAP test validation in Spring 2024</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Tier Comparison */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card bg-base-100 shadow-2xl border border-timeback-primary group hover:bg-timeback-bg hover:shadow-2xl transition-all duration-300 ease-in-out">
            <div className="card-body">
              <h3 className="card-title text-center justify-center text-lg text-timeback-primary group-hover:text-timeback-primary transition-colors duration-200 font-cal">Top 20% Students</h3>
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
          <a 
            href="/data/timeback-whitepaper.md" 
            className="text-timeback-primary hover:opacity-80 underline text-sm mt-2 inline-block font-cal"
            target="_blank"
          >
            View Complete Data Methodology →
          </a>
        </div>
      </div>
    </section>
  )
}