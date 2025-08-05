'use client'

import { useEffect, useState } from 'react'

interface QuizData {
  grade: string
  selectedSchools?: Array<{name: string, rating: number}>
}

const mapData = [
  { grade: 'K', language: '-', math: '99', reading: '99', science: '-' },
  { grade: '1', language: '-', math: '99', reading: '99', science: '-' },
  { grade: '2', language: '99', math: '99', reading: '99', science: '99' },
  { grade: '3', language: '99', math: '96', reading: '99', science: '99' },
  { grade: '4', language: '99', math: '94', reading: '99', science: '99' },
  { grade: '5', language: '99', math: '99', reading: '99', science: '99' },
  { grade: '6', language: '99', math: '99', reading: '99', science: '99' },
  { grade: '7', language: '99', math: '99', reading: '99', science: '99' },
  { grade: '8', language: '99', math: '97', reading: '99', science: '99' },
  { grade: '9', language: '99', math: '99', reading: '99', science: '99' },
  { grade: '10', language: '99', math: '99', reading: '99', science: '99' },
  { grade: '11', language: '99', math: '98', reading: '99', science: '99' },
]

export default function ImmediateDataShock() {
  const [quizData, setQuizData] = useState<QuizData | null>(null)

  useEffect(() => {
    const data = localStorage.getItem('timebackQuizData')
    if (data) setQuizData(JSON.parse(data))
  }, [])

  const userGrade = quizData?.grade?.replace(/st|nd|rd|th/, '') || null
  const topSchool = quizData?.selectedSchools?.[0]

  return (
    <section className="bg-gradient-to-br from-timeback-bg to-white py-20 lg:py-32">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        
        {/* Header */}
        <div className="text-center mb-16 font-cal">
          <div className="inline-flex items-center gap-2 backdrop-blur-sm bg-white/20 border border-timeback-primary rounded-full px-6 py-3 mb-6">
            <div className="w-2 h-2 bg-timeback-primary rounded-full"></div>
            <span className="text-timeback-primary font-bold text-sm font-cal">SPRING 2024 RESULTS</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-timeback-primary mb-6 font-cal">
            Proof: Real Student Results
          </h1>
          
          <p className="text-xl text-timeback-primary max-w-4xl mx-auto mb-8 font-cal leading-relaxed">
            Third-party standardized test data from Alpha School students. 
            MAP tests are administered by NWEA to millions of students nationwide.
          </p>

          {/* Personalized Context */}
          {userGrade && (
            <div className="backdrop-blur-md bg-white/10 border-2 border-timeback-primary rounded-2xl p-6 max-w-3xl mx-auto mb-8">
              <div className="text-center text-timeback-primary font-cal">
                <span className="font-bold font-cal">Your {userGrade === 'K' ? 'kindergartener' : `${userGrade}th grader`}</span> would be in the highlighted row below.
                {topSchool && ` For comparison, ${topSchool.name} has a ${topSchool.rating}/10 rating.`}
              </div>
            </div>
          )}
        </div>

        {/* Data Table - Professional Design */}
        <div className="backdrop-blur-md bg-white/10 rounded-2xl border-2 border-timeback-primary shadow-2xl overflow-hidden mb-12">
          <div className="p-6 bg-timeback-primary">
            <h3 className="text-xl font-bold text-white text-center font-cal">MAP Test Achievement Percentiles</h3>
            <p className="text-white text-center text-sm mt-2 font-cal opacity-90">Standardized test results across all grade levels</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-timeback-bg border-b-2 border-timeback-primary">
                  <th className="font-bold text-timeback-primary p-4 text-left font-cal">Grade</th>
                  <th className="font-bold text-center text-timeback-primary p-4 font-cal">Language</th>
                  <th className="font-bold text-center text-timeback-primary p-4 font-cal">Math</th>
                  <th className="font-bold text-center text-timeback-primary p-4 font-cal">Reading</th>
                  <th className="font-bold text-center text-timeback-primary p-4 font-cal">Science</th>
                </tr>
              </thead>
              <tbody>
                {mapData.map((row, index) => {
                  const isUserGrade = row.grade === userGrade
                  return (
                    <tr 
                      key={row.grade}
                      className={`border-b border-timeback-primary border-opacity-20 hover:bg-timeback-bg transition-colors duration-200 ${
                        isUserGrade ? 'bg-timeback-bg border-l-4 border-l-timeback-primary' : index % 2 === 0 ? 'bg-white' : 'bg-timeback-bg bg-opacity-30'
                      }`}
                    >
                      <td className={`p-4 font-cal ${isUserGrade ? 'font-bold text-timeback-primary' : 'font-medium text-timeback-primary'}`}>
                        {row.grade}
                      </td>
                      <td className="text-center p-4 font-cal">
                        {row.language !== '-' ? (
                          <span className={`font-bold font-cal ${isUserGrade ? 'text-timeback-primary text-lg' : 'text-timeback-primary'}`}>
                            {row.language}th
                          </span>
                        ) : (
                          <span className="text-timeback-primary opacity-50 font-cal">-</span>
                        )}
                      </td>
                      <td className="text-center p-4 font-cal">
                        {row.math !== '-' ? (
                          <span className={`font-bold font-cal ${isUserGrade ? 'text-timeback-primary text-lg' : 'text-timeback-primary'}`}>
                            {row.math}th
                          </span>
                        ) : (
                          <span className="text-timeback-primary opacity-50 font-cal">-</span>
                        )}
                      </td>
                      <td className="text-center p-4 font-cal">
                        {row.reading !== '-' ? (
                          <span className={`font-bold font-cal ${isUserGrade ? 'text-timeback-primary text-lg' : 'text-timeback-primary'}`}>
                            {row.reading}th
                          </span>
                        ) : (
                          <span className="text-timeback-primary opacity-50 font-cal">-</span>
                        )}
                      </td>
                      <td className="text-center p-4 font-cal">
                        {row.science !== '-' ? (
                          <span className={`font-bold font-cal ${isUserGrade ? 'text-timeback-primary text-lg' : 'text-timeback-primary'}`}>
                            {row.science}th
                          </span>
                        ) : (
                          <span className="text-timeback-primary opacity-50 font-cal">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-timeback-bg border-t border-timeback-primary">
            <p className="text-sm text-timeback-primary text-center font-cal">
              Source: TimeBack Educational Whitepaper, Spring 2024 MAP Results
            </p>
          </div>
        </div>

        {/* Key Insights - Professional Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="backdrop-blur-md bg-white/10 rounded-2xl border-2 border-timeback-primary shadow-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="p-8 text-center font-cal">
              <div className="w-16 h-16 bg-timeback-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl font-cal">%</span>
              </div>
              <div className="text-4xl font-bold text-timeback-primary mb-3 font-cal">99%</div>
              <div className="text-timeback-primary font-cal leading-relaxed">Average Percentile Across All Subjects</div>
            </div>
          </div>
          
          <div className="backdrop-blur-md bg-white/10 rounded-2xl border-2 border-timeback-primary shadow-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="p-8 text-center font-cal">
              <div className="w-16 h-16 bg-timeback-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl font-cal">#</span>
              </div>
              <div className="text-4xl font-bold text-timeback-primary mb-3 font-cal">12</div>
              <div className="text-timeback-primary font-cal leading-relaxed">Grades Tested (K-11)</div>
            </div>
          </div>
          
          <div className="backdrop-blur-md bg-white/10 rounded-2xl border-2 border-timeback-primary shadow-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="p-8 text-center font-cal">
              <div className="w-16 h-16 bg-timeback-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg font-cal">✓</span>
              </div>
              <div className="text-4xl font-bold text-timeback-primary mb-3 font-cal">NWEA</div>
              <div className="text-timeback-primary font-cal leading-relaxed">Third-Party Administrator</div>
            </div>
          </div>
        </div>

        {/* Call to Action - Professional Button */}
        <div className="text-center font-cal">
          <div className="bg-gradient-to-r from-timeback-bg to-white border-2 border-timeback-primary rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-timeback-primary mb-4 font-cal">Want the Complete Analysis?</h3>
            <p className="text-timeback-primary mb-6 font-cal">Review our full methodology and detailed statistical analysis</p>
            <a 
              href="/data/timeback-whitepaper.md" 
              className="bg-timeback-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all duration-200 shadow-2xl hover:shadow-2xl transform hover:scale-105 font-cal inline-flex items-center gap-2"
              target="_blank"
            >
              <span>View Complete Methodology</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}