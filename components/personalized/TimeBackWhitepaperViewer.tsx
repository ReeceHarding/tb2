'use client'

import React, { useRef } from 'react'

interface TimeBackWhitepaperViewerProps {
  onLearnMore?: () => void
}

export default function TimeBackWhitepaperViewer({ onLearnMore }: TimeBackWhitepaperViewerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const tableOfContents = [
    { title: 'Executive Summary', id: 'executive-summary' },
    { title: 'Standardized Test Performance', id: 'test-performance' },
    { title: 'Why TimeBack Works', id: 'learning-science' },
    { title: 'Time to Subject Mastery', id: 'time-mastery' },
    { title: 'Daily Learning Structure', id: 'daily-structure' },
    { title: 'Parent Monitoring & Insights', id: 'parent-monitoring' },
    { title: 'Conclusion', id: 'conclusion' }
  ]

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    const container = scrollContainerRef.current
    
    if (element && container) {
      const containerRect = container.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()
      const scrollOffset = elementRect.top - containerRect.top + container.scrollTop - 20 // 20px offset for spacing
      
      container.scrollTo({
        top: scrollOffset,
        behavior: 'smooth'
      })
    }
  }
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12 font-cal">

        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-timeback-primary mb-6 font-cal">
          TimeBack Educational Whitepaper
        </h1>
        
        <p className="text-xl text-timeback-primary max-w-4xl mx-auto mb-8 font-cal leading-relaxed">
          The complete methodology, research data, and outcomes behind our revolutionary 2-hour learning model
        </p>
      </div>

      {/* Scrollable Content Container */}
      <div className="backdrop-blur-md bg-white/10 rounded-2xl border-2 border-timeback-primary shadow-2xl overflow-hidden">
        <div ref={scrollContainerRef} className="max-h-[80vh] overflow-y-auto scroll-smooth">
          {/* Content Header */}
          <div className="p-8 bg-timeback-primary text-white sticky top-0 z-10">
            <h2 className="text-2xl font-bold font-cal mb-2">
              Transforming Classrooms & Unlocking Potential with AI-Powered Mastery Learning
            </h2>
            <p className="font-cal opacity-90">
              Discover how students learn 2x the material in just 2 hours a day (with ~6x faster learning rate) while absolutely loving school
            </p>
          </div>

          {/* Main Content */}
          <div className="p-8 space-y-12">
            
            {/* Table of Contents */}
            <section>
              <h2 className="text-3xl font-bold text-timeback-primary mb-6 font-cal border-b-2 border-timeback-primary pb-2">
                Table of Contents
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {tableOfContents.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToSection(item.id)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-timeback-bg/30 hover:bg-timeback-bg/50 transition-colors cursor-pointer text-left w-full border-none"
                  >
                    <span className="text-timeback-primary font-bold text-sm font-cal">{index + 1}.</span>
                    <span className="text-timeback-primary font-cal">{item.title}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Executive Summary */}
            <section>
              <h2 id="executive-summary" className="text-3xl font-bold text-timeback-primary mb-6 font-cal border-b-2 border-timeback-primary pb-2">
                Executive Summary
              </h2>
              <div className="space-y-6">
                <p className="text-timeback-primary font-cal leading-relaxed text-lg">
                  In today's fast-paced world, traditional education systems are increasingly failing children. The current approach is outdated, filled with busy work, and often a colossal waste of time. Enter <strong>TimeBack</strong>—a transformative model that empowers students to crush academics in just 2 hours a day and learn 2x the material with AI-driven personalized education, freeing up 4 hours to develop life skills and explore interests.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-timeback-primary">
                    <h3 className="text-xl font-bold text-timeback-primary mb-4 font-cal">Key Highlights</h3>
                    <ul className="space-y-3 text-timeback-primary font-cal">
                      <li className="flex items-start gap-3">
                        <span className="text-timeback-primary mt-1">•</span>
                        <span><strong>Personalized, Mastery-Based Learning:</strong> Each student embarks on a tailored, mastery-based academic journey</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-timeback-primary mt-1">•</span>
                        <span><strong>The Gift of Time:</strong> With only two hours required to crush academics, students have afternoons for life skills</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-timeback-primary mt-1">•</span>
                        <span><strong>Guiding the Way:</strong> There are no academic teachers; Guides motivate and support students</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-timeback-primary">
                    <h3 className="text-xl font-bold text-timeback-primary mb-4 font-cal">Phenomenal Results</h3>
                    <ul className="space-y-3 text-timeback-primary font-cal">
                      <li className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-timeback-primary">99%</span>
                        <span>Average percentile in standardized tests</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-timeback-primary">2x</span>
                        <span>Faster learning compared to traditional school</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-timeback-primary">2hrs</span>
                        <span>Daily time spent on academics</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* MAP Test Results */}
            <section>
              <h2 id="test-performance" className="text-3xl font-bold text-timeback-primary mb-6 font-cal border-b-2 border-timeback-primary pb-2">
                Standardized Test Performance
              </h2>
              <p className="text-timeback-primary font-cal mb-6 leading-relaxed">
                MAP (Measures of Academic Progress) is a nationwide standardized test taken by millions of students. The report for the 2023/24 school year shows extraordinary results across all grade levels and subjects.
              </p>
              
              <div className="backdrop-blur-md bg-white/10 rounded-xl border border-timeback-primary overflow-hidden">
                <div className="p-4 bg-timeback-primary text-white">
                  <h3 className="text-lg font-bold font-cal">Spring 2024 MAP Results - Achievement Percentiles</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-timeback-bg border-b border-timeback-primary">
                        <th className="p-4 text-left font-bold text-timeback-primary font-cal">Grade</th>
                        <th className="p-4 text-center font-bold text-timeback-primary font-cal">Language</th>
                        <th className="p-4 text-center font-bold text-timeback-primary font-cal">Math</th>
                        <th className="p-4 text-center font-bold text-timeback-primary font-cal">Reading</th>
                        <th className="p-4 text-center font-bold text-timeback-primary font-cal">Science</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
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
                      ].map((row, index) => (
                        <tr key={row.grade} className={`border-b border-timeback-primary/20 ${index % 2 === 0 ? 'bg-white/10' : 'bg-timeback-bg/30'}`}>
                          <td className="p-4 font-bold text-timeback-primary font-cal">{row.grade}</td>
                          <td className="p-4 text-center font-cal">
                            {row.language !== '-' ? (
                              <span className="font-bold text-timeback-primary">{row.language}th</span>
                            ) : (
                              <span className="text-timeback-primary opacity-50">-</span>
                            )}
                          </td>
                          <td className="p-4 text-center font-cal">
                            <span className="font-bold text-timeback-primary">{row.math}th</span>
                          </td>
                          <td className="p-4 text-center font-cal">
                            <span className="font-bold text-timeback-primary">{row.reading}th</span>
                          </td>
                          <td className="p-4 text-center font-cal">
                            {row.science !== '-' ? (
                              <span className="font-bold text-timeback-primary">{row.science}th</span>
                            ) : (
                              <span className="text-timeback-primary opacity-50">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-timeback-bg/30 border-t border-timeback-primary">
                  <p className="text-sm text-timeback-primary font-cal">
                    <strong>Key Findings:</strong> Alpha students are in the top 1% nationwide, learning an average of 6.81x faster than traditional schools.
                  </p>
                </div>
              </div>
            </section>

            {/* Learning Science */}
            <section>
              <h2 id="learning-science" className="text-3xl font-bold text-timeback-primary mb-6 font-cal border-b-2 border-timeback-primary pb-2">
                Why TimeBack Works: Learning Science
              </h2>
              <div className="space-y-6">
                <p className="text-timeback-primary font-cal leading-relaxed">
                  Our remarkable results are achieved by leveraging learning science and eliminating the traditional teacher-in-front-of-classroom model. The TimeBack model is grounded in extensive learning science research, especially Benjamin Bloom's 2 Sigma Problem findings.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-timeback-primary">
                    <h3 className="text-xl font-bold text-timeback-primary mb-4 font-cal">Individualized Tutoring</h3>
                    <p className="text-timeback-primary font-cal mb-4">
                      80% of a standard classroom does not have the same background knowledge. Teachers must teach to the 'middle' - the average.
                    </p>
                    <p className="text-timeback-primary font-cal">
                      <strong>Solution:</strong> AI tutors provide personalized learning plans for each student's exact level and pace.
                    </p>
                  </div>
                  
                  <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-timeback-primary">
                    <h3 className="text-xl font-bold text-timeback-primary mb-4 font-cal">Mastery-Based Learning</h3>
                    <p className="text-timeback-primary font-cal mb-4">
                      Traditional classrooms move on to new concepts regardless of student understanding, creating knowledge gaps.
                    </p>
                    <p className="text-timeback-primary font-cal">
                      <strong>Solution:</strong> Students must achieve 100% mastery before progressing to the next concept.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Time to Mastery */}
            <section>
              <h2 id="time-mastery" className="text-3xl font-bold text-timeback-primary mb-6 font-cal border-b-2 border-timeback-primary pb-2">
                Time to Subject Mastery
              </h2>
              <p className="text-timeback-primary font-cal mb-6 leading-relaxed">
                Here's how students complete entire grade levels efficiently with our AI-powered approach:
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-timeback-primary">
                  <h3 className="text-xl font-bold text-timeback-primary mb-4 font-cal">Math</h3>
                  <div className="space-y-2 text-timeback-primary font-cal">
                    <div className="flex justify-between">
                      <span>Average Lessons:</span>
                      <span className="font-bold">123</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Minutes per Lesson:</span>
                      <span className="font-bold">18</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hours to Mastery:</span>
                      <span className="font-bold">54</span>
                    </div>
                  </div>
                </div>
                
                <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-timeback-primary">
                  <h3 className="text-xl font-bold text-timeback-primary mb-4 font-cal">Language</h3>
                  <div className="space-y-2 text-timeback-primary font-cal">
                    <div className="flex justify-between">
                      <span>Average Lessons:</span>
                      <span className="font-bold">102</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Minutes per Lesson:</span>
                      <span className="font-bold">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hours to Mastery:</span>
                      <span className="font-bold">30</span>
                    </div>
                  </div>
                </div>
                
                <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-timeback-primary">
                  <h3 className="text-xl font-bold text-timeback-primary mb-4 font-cal">Science</h3>
                  <div className="space-y-2 text-timeback-primary font-cal">
                    <div className="flex justify-between">
                      <span>Average Lessons:</span>
                      <span className="font-bold">41</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Minutes per Lesson:</span>
                      <span className="font-bold">11</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hours to Mastery:</span>
                      <span className="font-bold">12</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 backdrop-blur-md bg-timeback-bg/20 rounded-xl p-6 border border-timeback-primary">
                <h4 className="text-lg font-bold text-timeback-primary mb-3 font-cal">Key Insight</h4>
                <p className="text-timeback-primary font-cal leading-relaxed">
                  Students can complete an entire grade level in approximately 80 days using 30-minute sessions. With 180 school days in a year, students can easily complete 2 grade levels, achieving 2x learning speed.
                </p>
              </div>
            </section>

            {/* Daily Structure */}
            <section>
              <h2 id="daily-structure" className="text-3xl font-bold text-timeback-primary mb-6 font-cal border-b-2 border-timeback-primary pb-2">
                Daily Learning Structure
              </h2>
              <p className="text-timeback-primary font-cal mb-6 leading-relaxed">
                The 120-minute TimeBack block is structured using the Pomodoro technique for maximum focus and efficiency:
              </p>
              
              <div className="backdrop-blur-md bg-white/10 rounded-xl border border-timeback-primary overflow-hidden">
                <div className="p-4 bg-timeback-primary text-white">
                  <h3 className="text-lg font-bold font-cal">120 Minutes TimeBack Allocation</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[
                      { subject: 'Math', minutes: 25, description: 'Core mathematical concepts and problem-solving' },
                      { subject: 'Science & Social Science', minutes: 25, description: 'Scientific inquiry and social studies' },
                      { subject: 'Language & Writing', minutes: 25, description: 'Grammar, vocabulary, and writing skills' },
                      { subject: 'Reading', minutes: 25, description: 'Reading comprehension and literature' },
                      { subject: 'Additional Learning Concepts', minutes: 20, description: 'Math strategies, test-taking, DOK exercises' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-timeback-bg/30 border border-timeback-primary/20">
                        <div>
                          <h4 className="font-bold text-timeback-primary font-cal">{item.subject}</h4>
                          <p className="text-sm text-timeback-primary font-cal opacity-80">{item.description}</p>
                        </div>
                        <div className="text-2xl font-bold text-timeback-primary font-cal">
                          {item.minutes}min
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Parent Monitoring */}
            <section>
              <h2 id="parent-monitoring" className="text-3xl font-bold text-timeback-primary mb-6 font-cal border-b-2 border-timeback-primary pb-2">
                Parent Monitoring & Insights
              </h2>
              <p className="text-timeback-primary font-cal mb-6 leading-relaxed">
                Parents receive incredibly detailed data on what their child knows and doesn't know, far surpassing traditional school metrics.
              </p>
              
              <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-timeback-primary">
                <h3 className="text-xl font-bold text-timeback-primary mb-4 font-cal">Key Metrics Tracked</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-timeback-primary font-cal mb-3">Academic Progress</h4>
                    <ul className="space-y-2 text-timeback-primary font-cal">
                      <li>• MAP percentile achievement and growth</li>
                      <li>• Standardized test mastery (90% required)</li>
                      <li>• Knowledge grade vs. age grade</li>
                      <li>• Learning speed multiplier</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-timeback-primary font-cal mb-3">Learning Efficiency</h4>
                    <ul className="space-y-2 text-timeback-primary font-cal">
                      <li>• Minutes per day per subject</li>
                      <li>• Accuracy percentage (80-90% ideal)</li>
                      <li>• WASTE meter (time inefficiency)</li>
                      <li>• App usage and engagement</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Conclusion */}
            <section>
              <h2 id="conclusion" className="text-3xl font-bold text-timeback-primary mb-6 font-cal border-b-2 border-timeback-primary pb-2">
                Conclusion
              </h2>
              <div className="backdrop-blur-md bg-timeback-bg/20 rounded-xl p-8 border border-timeback-primary">
                <p className="text-timeback-primary font-cal leading-relaxed text-lg mb-6">
                  <strong>TimeBack</strong> is not just about accelerated academics. It's about giving students the tools to become lifelong learners, critical thinkers, and capable individuals. By mastering their studies in just 2 hours a day, students have more time to develop crucial life skills, pursue their passions, and enjoy their childhood.
                </p>
                <p className="text-timeback-primary font-cal leading-relaxed">
                  Choosing the right school for a child is a significant decision. Children have unlimited potential, and TimeBack has the tools to unlock it. This model redefines what's possible in education, revolutionizing how students learn and grow.
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
