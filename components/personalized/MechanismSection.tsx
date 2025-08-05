'use client'

import { useEffect, useState } from 'react'

interface QuizData {
  grade: string
  kidsInterests?: string[]
}

interface GradePromptProps {
  onGradeSelect: (grade: string) => void
}

const hoursData: Record<string, { math: number, language: number, science: number }> = {
  'K': { math: 53, language: 25, science: 0 },
  '1': { math: 45, language: 38, science: 1 },
  '2': { math: 47, language: 43, science: 5 },
  '3': { math: 44, language: 44, science: 12 },
  '4': { math: 42, language: 45, science: 14 },
  '5': { math: 41, language: 46, science: 15 },
  '6': { math: 40, language: 47, science: 16 },
  '7': { math: 39, language: 48, science: 17 },
  '8': { math: 38, language: 49, science: 18 },
  '9': { math: 37, language: 50, science: 19 },
  '10': { math: 36, language: 51, science: 20 },
  '11': { math: 35, language: 52, science: 21 },
}

const gradeLabels = ['K', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th']

function GradePrompt({ onGradeSelect }: GradePromptProps) {
  console.log('🎓 GradePrompt component rendered - asking for child grade')
  
  return (
    <div className="text-center py-16 font-cal">
      <div className="max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-timeback-bg border border-timeback-primary rounded-full px-6 py-3 mb-6">
          <div className="w-2 h-2 bg-timeback-primary rounded-full"></div>
          <span className="text-timeback-primary font-bold text-sm font-cal">PERSONALIZED ANALYSIS</span>
        </div>
        
        <h3 className="text-3xl font-bold text-timeback-primary mb-4 font-cal">
          What grade is your child in?
        </h3>
        <p className="text-lg text-timeback-primary mb-8 font-cal">
          We&apos;ll show you personalized learning time comparisons based on your child&apos;s grade level
        </p>
        
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 max-w-lg mx-auto">
          {gradeLabels.map((grade) => (
            <button
              key={grade}
              onClick={() => {
                console.log(`📊 Grade selected: ${grade} for child's learning analysis`)
                onGradeSelect(grade)
              }}
              className="backdrop-blur-md bg-timeback-bg/80 border-2 border-timeback-primary text-timeback-primary py-3 px-4 rounded-xl font-cal font-bold hover:bg-timeback-bg transition-colors"
            >
              {grade}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function MechanismSection() {
  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null)
  const [showGradePrompt, setShowGradePrompt] = useState<boolean>(false)

  useEffect(() => {
    console.log('🔍 MechanismSection mounted - checking for existing quiz data')
    const data = localStorage.getItem('timebackQuizData')
    if (data) {
      const parsedData = JSON.parse(data)
      console.log('📋 Found existing quiz data:', parsedData)
      setQuizData(parsedData)
    } else {
      console.log('❌ No quiz data found - will show grade prompt')
      setShowGradePrompt(true)
    }
  }, [])

  const handleGradeSelect = (grade: string) => {
    console.log(`✅ Grade selected for child: ${grade}`)
    setSelectedGrade(grade)
    setShowGradePrompt(false)
    
    // Save the grade selection temporarily (you might want to save this differently)
    const tempQuizData = { grade: grade, kidsInterests: [] as string[] }
    setQuizData(tempQuizData)
  }

  // Determine which grade to use for the analysis
  const displayGrade = selectedGrade || quizData?.grade
  const userGrade = displayGrade?.replace(/st|nd|rd|th/, '') || null
  const userHours = userGrade ? hoursData[userGrade] : null
  const interests = quizData?.kidsInterests || []

  // Show grade prompt if no grade data is available
  if (showGradePrompt || !userGrade || !userHours) {
    return (
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
          <GradePrompt onGradeSelect={handleGradeSelect} />
        </div>
      </section>
    )
  }

  console.log(`📊 Displaying analysis for grade: ${userGrade}`)

  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        
        {/* Header */}
        <div className="text-center mb-16 font-cal">
          <div className="inline-flex items-center gap-2 backdrop-blur-sm backdrop-blur-md bg-timeback-bg/80/20 border border-timeback-primary rounded-full px-6 py-3 mb-6">
            <div className="w-2 h-2 bg-timeback-primary rounded-full"></div>
            <span className="text-timeback-primary font-bold text-sm font-cal">THE SCIENCE</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-timeback-primary mb-6 font-cal">
            How We Achieve 10x Results
          </h2>
          <p className="text-xl text-timeback-primary max-w-4xl mx-auto font-cal leading-relaxed">
            The scientific explanation behind our dramatic efficiency improvements
          </p>
        </div>

        {/* Time Comparison - Professional Design */}
        <div className="mb-16">
          <div className="backdrop-blur-md backdrop-blur-md bg-timeback-bg/80/10 rounded-3xl shadow-2xl border-2 border-timeback-primary overflow-hidden max-w-5xl mx-auto">
            {/* Card Header */}
            <div className="bg-timeback-primary text-white p-8 text-center font-cal">
              <h3 className="text-2xl font-bold font-cal mb-2">Learning Time Analysis</h3>
              <p className="font-cal opacity-90">Grade {displayGrade}: TimeBack vs Traditional School</p>
            </div>

            <div className="p-8">
              {/* Tab Navigation */}
              <div className="flex bg-timeback-bg rounded-xl p-2 mb-8 max-w-md mx-auto">
                <button className="flex-1 bg-timeback-primary text-white py-3 px-4 rounded-xl font-cal font-bold text-sm">
                  Hour Comparison
                </button>
                <button className="flex-1 text-timeback-primary py-3 px-4 rounded-xl font-cal font-bold text-sm hover:backdrop-blur-md bg-timeback-bg/80/20 transition-colors">
                  How It Works
                </button>
              </div>
                
              {/* Visual Bar Comparison */}
              <div className="space-y-8">
                {Object.entries(userHours).map(([subject, hours]) => {
                  const traditional = 180
                  const efficiency = Math.round(((traditional - hours) / traditional) * 100)
                  const barWidth = (hours / traditional) * 100
                  
                  return (
                    <div key={subject} className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold capitalize text-timeback-primary text-lg font-cal">{subject}</h4>
                        <div className="bg-timeback-bg border border-timeback-primary rounded-full px-4 py-2">
                          <span className="text-timeback-primary font-bold font-cal text-sm">{efficiency}% faster</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <span className="text-timeback-primary font-cal font-medium w-24">Traditional:</span>
                          <div className="flex-1 bg-timeback-bg rounded-full h-8 border border-timeback-primary">
                            <div className="bg-timeback-primary bg-opacity-50 h-8 rounded-full flex items-center justify-end pr-4" style={{width: '100%'}}>
                              <span className="text-timeback-primary font-bold font-cal text-sm">{traditional}h</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-timeback-primary font-cal font-medium w-24">TimeBack:</span>
                          <div className="flex-1 bg-timeback-bg rounded-full h-8 border border-timeback-primary">
                            <div className="bg-timeback-primary h-8 rounded-full flex items-center justify-end pr-4" style={{width: `${barWidth}%`}}>
                              <span className="text-white font-bold font-cal text-sm">{hours}h</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* How It Works - Mechanism Cards */}
        <div className="mb-16">
          <div className="text-center mb-12 font-cal">
            <h3 className="text-3xl font-bold text-timeback-primary mb-4 font-cal">The Four Core Mechanisms</h3>
            <p className="text-xl text-timeback-primary font-cal">How we eliminate waste and accelerate learning</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="backdrop-blur-md backdrop-blur-md bg-timeback-bg/80/10 rounded-2xl border-2 border-timeback-primary shadow-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 p-8 flex flex-col h-full">
              <div className="w-16 h-16 bg-timeback-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-timeback-primary mb-4 text-center font-cal">No Waiting Time</h4>
              <div className="flex-grow flex items-center justify-center mb-6">
                <p className="text-timeback-primary font-cal leading-relaxed text-center">
                  Traditional classrooms force fast learners to wait until the whole class is done.
                  {interests.includes('Gaming & Puzzles') && (
                    <span className="block mt-3 p-3 bg-timeback-bg rounded-xl text-sm font-cal">
                      <strong className="font-cal">For puzzle lovers:</strong> It&apos;s like being forced to wait for others to solve an easy puzzle you finished in 30 seconds.
                    </span>
                  )}
                </p>
              </div>
              
              {/* Adaptive learning paths badge - now sticks to bottom */}
              <div className="flex justify-center mt-auto">
                <div className="bg-timeback-primary text-white px-6 py-3 rounded-full text-lg font-bold shadow-2xl group-hover:scale-105 font-cal transition-transform duration-200" role="status" aria-label="Achievement: Adaptive learning paths">
                  Adaptive learning paths
                </div>
              </div>
            </div>
            
            <div className="backdrop-blur-md backdrop-blur-md bg-timeback-bg/80/10 rounded-2xl border-2 border-timeback-primary shadow-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 p-8 flex flex-col h-full">
              <div className="w-16 h-16 bg-timeback-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl font-cal">✓</span>
              </div>
              <h4 className="text-xl font-bold text-timeback-primary mb-4 text-center font-cal">Mastery-Based Progression</h4>
              <div className="flex-grow flex items-center justify-center mb-6">
                <p className="text-timeback-primary font-cal leading-relaxed text-center">
                  Students don&apos;t advance until they achieve 100% understanding, ensuring no knowledge gaps.
                </p>
              </div>
              
              {/* Adaptive learning paths badge - now sticks to bottom */}
              <div className="flex justify-center mt-auto">
                <div className="bg-timeback-primary text-white px-6 py-3 rounded-full text-lg font-bold shadow-2xl group-hover:scale-105 font-cal transition-transform duration-200" role="status" aria-label="Achievement: Adaptive learning paths">
                  Adaptive learning paths
                </div>
              </div>
            </div>
            
            <div className="backdrop-blur-md backdrop-blur-md bg-timeback-bg/80/10 rounded-2xl border-2 border-timeback-primary shadow-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 p-8 flex flex-col h-full">
              <div className="w-16 h-16 bg-timeback-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl font-cal">🤖</span>
              </div>
              <h4 className="text-xl font-bold text-timeback-primary mb-4 text-center font-cal">AI-Driven Efficiency</h4>
              <div className="flex-grow flex items-center justify-center mb-6">
                <p className="text-timeback-primary font-cal leading-relaxed text-center">
                  Personalized learning paths eliminate review of known material and adapt to each student&apos;s pace.
                </p>
              </div>
              
              {/* Adaptive learning paths badge - now sticks to bottom */}
              <div className="flex justify-center mt-auto">
                <div className="bg-timeback-primary text-white px-6 py-3 rounded-full text-lg font-bold shadow-2xl group-hover:scale-105 font-cal transition-transform duration-200" role="status" aria-label="Achievement: Adaptive learning paths">
                  Adaptive learning paths
                </div>
              </div>
            </div>
            
            <div className="backdrop-blur-md backdrop-blur-md bg-timeback-bg/80/10 rounded-2xl border-2 border-timeback-primary shadow-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 p-8 flex flex-col h-full">
              <div className="w-16 h-16 bg-timeback-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-timeback-primary mb-4 text-center font-cal">Waste Elimination</h4>
              <div className="flex-grow flex items-center justify-center mb-6">
                <p className="text-timeback-primary font-cal leading-relaxed text-center">
                  Traditional schools waste 60-80% of time on transitions, discipline, and redundant review.
                </p>
              </div>
              
              {/* Adaptive learning paths badge - now sticks to bottom */}
              <div className="flex justify-center mt-auto">
                <div className="bg-timeback-primary text-white px-6 py-3 rounded-full text-lg font-bold shadow-2xl group-hover:scale-105 font-cal transition-transform duration-200" role="status" aria-label="Achievement: Adaptive learning paths">
                  Adaptive learning paths
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Statistics - Professional Design */}
        <div className="text-center mb-12 font-cal">
          <h3 className="text-3xl font-bold text-timeback-primary mb-4 font-cal">The Numbers Don&apos;t Lie</h3>
          <p className="text-xl text-timeback-primary font-cal">Quantified results from our methodology</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="backdrop-blur-md backdrop-blur-md bg-timeback-bg/80/10 rounded-2xl border-2 border-timeback-primary shadow-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 p-6 text-center font-cal">
            <div className="w-12 h-12 bg-timeback-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg font-cal">%</span>
            </div>
            <div className="text-3xl font-bold text-timeback-primary mb-2 font-cal">60-80%</div>
            <div className="text-sm text-timeback-primary font-cal leading-relaxed">Waste Time in Traditional School</div>
            
            {/* Adaptive learning paths badge */}
            <div className="flex justify-center mt-4">
              <div className="bg-timeback-primary text-white px-4 py-2 rounded-full text-xs font-bold shadow-2xl group-hover:scale-105 font-cal transition-transform duration-200" role="status" aria-label="Achievement: Adaptive learning paths">
                Adaptive learning paths
              </div>
            </div>
          </div>
          
          <div className="backdrop-blur-md backdrop-blur-md bg-timeback-bg/80/10 rounded-2xl border-2 border-timeback-primary shadow-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 p-6 text-center font-cal">
            <div className="w-12 h-12 bg-timeback-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg font-cal">✓</span>
            </div>
            <div className="text-3xl font-bold text-timeback-primary mb-2 font-cal">100%</div>
            <div className="text-sm text-timeback-primary font-cal leading-relaxed">Mastery Required to Advance</div>
            
            {/* Adaptive learning paths badge */}
            <div className="flex justify-center mt-4">
              <div className="bg-timeback-primary text-white px-4 py-2 rounded-full text-xs font-bold shadow-2xl group-hover:scale-105 font-cal transition-transform duration-200" role="status" aria-label="Achievement: Adaptive learning paths">
                Adaptive learning paths
              </div>
            </div>
          </div>
          
          <div className="backdrop-blur-md backdrop-blur-md bg-timeback-bg/80/10 rounded-2xl border-2 border-timeback-primary shadow-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 p-6 text-center font-cal">
            <div className="w-12 h-12 bg-timeback-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg font-cal">×</span>
            </div>
            <div className="text-3xl font-bold text-timeback-primary mb-2 font-cal">3.9x</div>
            <div className="text-sm text-timeback-primary font-cal leading-relaxed">Faster (Top 20% Students)</div>
            
            {/* Adaptive learning paths badge */}
            <div className="flex justify-center mt-4">
              <div className="bg-timeback-primary text-white px-4 py-2 rounded-full text-xs font-bold shadow-2xl group-hover:scale-105 font-cal transition-transform duration-200" role="status" aria-label="Achievement: Adaptive learning paths">
                Adaptive learning paths
              </div>
            </div>
          </div>
          
          <div className="backdrop-blur-md backdrop-blur-md bg-timeback-bg/80/10 rounded-2xl border-2 border-timeback-primary shadow-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 p-6 text-center font-cal">
            <div className="w-12 h-12 bg-timeback-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg font-cal">AI</span>
            </div>
            <div className="text-3xl font-bold text-timeback-primary mb-2 font-cal">AI</div>
            <div className="text-sm text-timeback-primary font-cal leading-relaxed">Personalized Learning Paths</div>
            
            {/* Adaptive learning paths badge */}
            <div className="flex justify-center mt-4">
              <div className="bg-timeback-primary text-white px-4 py-2 rounded-full text-xs font-bold shadow-2xl group-hover:scale-105 font-cal transition-transform duration-200" role="status" aria-label="Achievement: Adaptive learning paths">
                Adaptive learning paths
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center mt-12">
          <button 
            onClick={() => {
              const dataSection = document.getElementById('data-section');
              if (dataSection) {
                dataSection.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }
            }}
            className="px-8 py-4 border-2 border-timeback-primary text-timeback-primary bg-transparent rounded-xl font-bold hover:bg-timeback-bg transition-all duration-200 shadow-lg hover:shadow-xl font-cal text-lg"
          >
            See the data
          </button>
        </div>
      </div>
    </section>
  )
}