'use client';

import React from 'react';
import Image from 'next/image';

interface TimeBackVsCompetitorsProps {
  onLearnMore: (section: string) => void;
}

const CheckIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="text-timeback-primary"
    aria-hidden="true"
  >
    <path d="M20 6 9 17l-5-5"></path>
  </svg>
);

const MonitorIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="text-timeback-primary"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
  </svg>
);

const VoiceIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="text-timeback-primary"
    aria-hidden="true"
  >
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

const LightningIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="text-timeback-primary"
    aria-hidden="true"
  >
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
  </svg>
);





export default function TimeBackVsCompetitors({ onLearnMore }: TimeBackVsCompetitorsProps) {
  console.log('[TimeBackVsCompetitors] Rendering comparison section');

  return (
    <section className="max-w-7xl mx-auto py-20 lg:py-32 px-6 lg:px-12" aria-labelledby="comparison-heading">
      {/* Header */}
      <header className="text-center mb-20 font-cal">
        <h2 id="comparison-heading" className="text-4xl lg:text-6xl font-bold text-timeback-primary mb-8 font-cal leading-tight">
          Why TimeBack vs. Other Solutions
        </h2>
        <p className="text-xl lg:text-2xl text-timeback-primary max-w-5xl mx-auto font-cal leading-relaxed">
          See how our structured, mastery-based approach compares to ChatGPT, Khan Academy, and traditional tutoring.
        </p>
      </header>

      {/* Explanatory Section - TimeBack is NOT a Chatbot */}
      <article className="text-center mb-20" aria-labelledby="timeback-explanation">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-timeback-bg to-white rounded-2xl shadow-xl p-8 lg:p-12 border-2 border-timeback-primary mb-12">
            <h3 id="timeback-explanation" className="text-3xl lg:text-4xl font-bold text-timeback-primary mb-6 font-cal">
              TimeBack Is NOT a Chatbot
            </h3>
            <p className="text-lg lg:text-xl text-timeback-primary leading-relaxed font-cal max-w-4xl mx-auto">
              Unlike simple AI chatbots, TimeBack is a comprehensive <strong>mastery-based learning system</strong> that revolutionizes education. Our AI doesn't just answer questions—it actively monitors your child's learning journey, detects when they're struggling or bored, and adapts in real time to keep them engaged and progressing.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-timeback-primary hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-timeback-bg rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <MonitorIcon />
                </div>
                <h4 className="text-xl font-bold text-timeback-primary font-cal">
                  AI-Powered Monitoring
              </h4>
              </div>
              <p className="text-timeback-primary font-cal leading-relaxed">
                Our AI continuously watches your child's learning patterns, identifying exactly when they're bored, frustrated, or ready for more challenging material—then instantly adapts their lesson plan.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-timeback-primary hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-timeback-bg rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <VoiceIcon />
                </div>
                <h4 className="text-xl font-bold text-timeback-primary font-cal">
                  Voice Agent Conversations
              </h4>
              </div>
              <p className="text-timeback-primary font-cal leading-relaxed">
                Students interact with intelligent voice agents that understand their interests and learning style, creating personalized questions and conversations that keep them motivated and engaged.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-timeback-primary hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-timeback-bg rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <CheckIcon />
                </div>
                <h4 className="text-xl font-bold text-timeback-primary font-cal">
                  100% Mastery Required
              </h4>
              </div>
              <p className="text-timeback-primary font-cal leading-relaxed">
                No student moves forward until they've completely mastered each concept. Our AI ensures true understanding, not just completion, creating a rock-solid foundation for advanced learning.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-timeback-primary hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-timeback-bg rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <LightningIcon />
                </div>
                <h4 className="text-xl font-bold text-timeback-primary font-cal">
                  Personalized Question Generation
              </h4>
              </div>
              <p className="text-timeback-primary font-cal leading-relaxed">
                The AI generates custom questions perfectly matched to your child's interests and ability level, making learning feel like an exciting game rather than boring homework.
              </p>
            </div>
          </div>
          
          <div className="bg-timeback-primary text-white rounded-2xl p-8 lg:p-10 shadow-xl">
            <p className="text-xl lg:text-2xl font-bold font-cal mb-3">
              The Result: Students learn 2x the material in just 2 hours per day (often 6–8x faster)
            </p>
            <p className="font-cal opacity-90 text-lg">
              While consistently scoring in the 99th percentile on standardized tests—because true mastery creates extraordinary results.
            </p>
          </div>
        </div>
      </article>

      {/* Competitor Comparison Table */}
      <section className="mb-16" aria-labelledby="comparison-table-heading">
        <h3 id="comparison-table-heading" className="sr-only">Detailed Comparison Table</h3>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-timeback-primary" role="table" aria-label="TimeBack vs competitors comparison">
            <thead className="bg-timeback-bg">
              <tr>
                <th scope="col" className="text-left p-6 font-semibold text-timeback-primary border-b border-timeback-primary border-opacity-30 font-cal">Feature</th>
                <th scope="col" className="text-center p-6 font-semibold text-timeback-primary border-b border-timeback-primary border-opacity-30 bg-timeback-primary bg-opacity-10 font-cal">
                  <div className="flex justify-center">
                    <Image alt="TimeBack" src="https://igwtslivaqqgiswawdep.supabase.co/storage/v1/object/public/logos/competitors/timeback-logo.png" width={120} height={32} className="h-8 w-auto object-contain" />
                  </div>
                </th>
                <th scope="col" className="text-center p-6 font-semibold text-timeback-primary border-b border-timeback-primary border-opacity-30 font-cal">
                  <div className="flex justify-center">
                    <Image alt="Khan Academy" src="https://igwtslivaqqgiswawdep.supabase.co/storage/v1/object/public/logos/competitors/khan-academy-logo.png" width={120} height={32} className="h-8 w-auto object-contain" />
                  </div>
                </th>
                <th scope="col" className="text-center p-6 font-semibold text-timeback-primary border-b border-timeback-primary border-opacity-30 font-cal">
                  <div className="text-sm font-medium font-cal">Traditional School</div>
                </th>
                <th scope="col" className="text-center p-6 font-semibold text-timeback-primary border-b border-timeback-primary border-opacity-30 font-cal">
                  <div className="flex items-center justify-center gap-2">
                    <Image alt="ChatGPT" src="https://igwtslivaqqgiswawdep.supabase.co/storage/v1/object/public/logos/competitors/chatgpt-logo.png" width={120} height={32} className="h-8 w-auto object-contain" />
                    <span className="text-sm font-cal">ChatGPT</span>
                  </div>
                </th>
                <th scope="col" className="text-center p-6 font-semibold text-timeback-primary border-b border-timeback-primary border-opacity-30 font-cal">
                  <div className="text-sm font-medium font-cal">Private Tutor</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-timeback-primary border-opacity-20">
                <td className="p-6 font-medium text-timeback-primary font-cal">Learning Speed</td>
                <td className="p-6 text-center font-bold text-timeback-primary bg-timeback-bg font-cal">10x faster</td>
                <td className="p-6 text-center text-timeback-primary font-cal">Standard pace</td>
                <td className="p-6 text-center text-timeback-primary font-cal">1x pace</td>
                <td className="p-6 text-center text-timeback-primary font-cal">Unstructured</td>
                <td className="p-6 text-center text-timeback-primary font-cal">2x faster</td>
              </tr>
              <tr className="border-b border-timeback-primary border-opacity-20">
                <td className="p-6 font-medium text-timeback-primary font-cal">Personalization</td>
                <td className="p-6 text-center bg-timeback-bg font-cal">
                  <span className="inline-flex items-center gap-1 text-timeback-primary font-medium font-cal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                    AI-Powered
                  </span>
                </td>
                <td className="p-6 text-center font-cal">
                  <span className="inline-flex items-center gap-1 text-timeback-primary font-cal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                    One size fits all
                  </span>
                </td>
                <td className="p-6 text-center font-cal">
                  <span className="inline-flex items-center gap-1 text-timeback-primary font-cal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                    One size fits all
                  </span>
                </td>
                <td className="p-6 text-center font-cal">
                  <span className="text-timeback-primary font-medium font-cal">Conversational</span>
                </td>
                <td className="p-6 text-center font-cal">
                  <span className="inline-flex items-center gap-1 text-timeback-primary font-medium font-cal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                    Human-limited
                  </span>
                </td>
              </tr>
              <tr className="border-b border-timeback-primary border-opacity-20">
                <td className="p-6 font-medium text-timeback-primary font-cal">Mastery Guarantee</td>
                <td className="p-6 text-center bg-timeback-bg font-cal">
                  <span className="inline-flex items-center gap-1 text-timeback-primary font-medium font-cal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                    100% Required
                  </span>
                </td>
                <td className="p-6 text-center font-cal">
                  <span className="inline-flex items-center gap-1 text-timeback-primary font-cal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                    Optional
                  </span>
                </td>
                <td className="p-6 text-center font-cal">
                  <span className="inline-flex items-center gap-1 text-timeback-primary font-cal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                    70% passing
                  </span>
                </td>
                <td className="p-6 text-center font-cal">
                  <span className="inline-flex items-center gap-1 text-timeback-primary font-cal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                    None
                  </span>
                </td>
                <td className="p-6 text-center font-cal">
                  <span className="text-timeback-primary font-medium font-cal">Varies by tutor</span>
                </td>
              </tr>
              <tr className="border-b border-timeback-primary border-opacity-20">
                <td className="p-6 font-medium text-timeback-primary font-cal">Daily Time</td>
                <td className="p-6 text-center font-bold text-timeback-primary bg-timeback-bg font-cal">2 hours</td>
                <td className="p-6 text-center text-timeback-primary font-cal">4-6 hours</td>
                <td className="p-6 text-center text-timeback-primary font-cal">6-8 hours</td>
                <td className="p-6 text-center text-timeback-primary font-cal">Unlimited</td>
                <td className="p-6 text-center text-timeback-primary font-cal">1-2 hours</td>
              </tr>
              <tr>
                <td className="p-6 font-medium text-timeback-primary font-cal">Success Rate</td>
                <td className="p-6 text-center bg-timeback-bg font-cal">
                  <span className="inline-flex items-center gap-1 text-timeback-primary font-medium font-cal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                    98th percentile
                  </span>
                </td>
                <td className="p-6 text-center font-cal">
                  <span className="text-timeback-primary font-medium font-cal">No data</span>
                </td>
                <td className="p-6 text-center font-cal">
                  <span className="text-timeback-primary font-medium font-cal">50th percentile</span>
                </td>
                <td className="p-6 text-center font-cal">
                  <span className="inline-flex items-center gap-1 text-timeback-primary font-cal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                    Harmful
                  </span>
                </td>
                <td className="p-6 text-center font-cal">
                  <span className="text-timeback-primary font-medium font-cal">Variable</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-8">
          <div className="bg-white rounded-2xl border-2 border-timeback-primary shadow-2xl p-8">
            <div className="flex items-center justify-center mb-8">
              <Image alt="TimeBack" src="https://igwtslivaqqgiswawdep.supabase.co/storage/v1/object/public/logos/competitors/timeback-logo.png" width={120} height={32} className="h-8 w-auto object-contain" />
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-center py-3 border-b border-timeback-primary border-opacity-20">
                <div className="font-semibold text-timeback-primary font-cal">Learning Speed</div>
                <div className="font-bold text-timeback-primary font-cal bg-timeback-bg px-3 py-1 rounded-full">10x faster</div>
                </div>
              <div className="flex justify-between items-center py-3 border-b border-timeback-primary border-opacity-20">
                <div className="font-semibold text-timeback-primary font-cal">Personalization</div>
                  <div>
                  <span className="inline-flex items-center gap-2 text-timeback-primary font-medium font-cal bg-timeback-bg px-3 py-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
                        <path d="M20 6 9 17l-5-5"></path>
                      </svg>
                      AI-Powered
                    </span>
                  </div>
                </div>
              <div className="flex justify-between items-center py-3 border-b border-timeback-primary border-opacity-20">
                <div className="font-semibold text-timeback-primary font-cal">Mastery Guarantee</div>
                  <div>
                  <span className="inline-flex items-center gap-2 text-timeback-primary font-medium font-cal bg-timeback-bg px-3 py-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
                        <path d="M20 6 9 17l-5-5"></path>
                      </svg>
                      100% Required
                    </span>
                  </div>
                </div>
              <div className="flex justify-between items-center py-3 border-b border-timeback-primary border-opacity-20">
                <div className="font-semibold text-timeback-primary font-cal">Daily Time</div>
                <div className="font-bold text-timeback-primary font-cal bg-timeback-bg px-3 py-1 rounded-full">2 hours</div>
                </div>
              <div className="flex justify-between items-center py-3">
                <div className="font-semibold text-timeback-primary font-cal">Success Rate</div>
                  <div>
                  <span className="inline-flex items-center gap-2 text-timeback-primary font-medium font-cal bg-timeback-bg px-3 py-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
                        <path d="M20 6 9 17l-5-5"></path>
                      </svg>
                      98th percentile
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
          
          <div className="text-center mt-8 p-6 bg-timeback-bg rounded-2xl">
            <p className="text-timeback-primary font-cal text-lg font-semibold mb-4">
              See full comparison details in the table above
            </p>
            <p className="text-timeback-primary font-cal">
              TimeBack's mastery-based approach delivers superior results compared to traditional learning platforms
            </p>
          </div>
        </div>
      </section>






      {/* Call to Action */}
      <div className="flex justify-center mt-12">
        <button 
          className="px-8 py-4 border-2 border-timeback-primary text-timeback-primary bg-transparent rounded-xl hover:bg-timeback-bg transition-all duration-300 transform hover:scale-105 font-cal font-semibold text-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-timeback-primary focus:ring-opacity-30" 
          aria-label="Get a personalized AI comparison tailored to your specific learning situation"
          onClick={() => onLearnMore('ai-comparison')}
        >
          Get AI comparison tailored to my situation
        </button>
      </div>
    </section>
  );
}