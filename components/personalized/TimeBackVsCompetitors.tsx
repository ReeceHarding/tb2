'use client';

import React from 'react';
import Image from 'next/image';

interface TimeBackVsCompetitorsProps {
  onLearnMore: (section: string) => void;
}





export default function TimeBackVsCompetitors({ onLearnMore }: TimeBackVsCompetitorsProps) {
  console.log('[TimeBackVsCompetitors] Rendering comparison section');

  return (
    <section className="max-w-7xl mx-auto bg-gradient-to-br from-timeback-bg to-white py-20 lg:py-32 px-6 lg:px-12">
      {/* Header */}
      <div className="text-center mb-16 font-cal">
        <div className="inline-flex items-center gap-2 bg-white border border-timeback-primary rounded-full px-6 py-3 mb-8">
          <div className="w-3 h-3 bg-timeback-primary rounded-full animate-pulse"></div>
          <span className="text-timeback-primary font-bold text-sm font-cal">SOLUTION COMPARISON</span>
        </div>
        <h2 className="text-4xl lg:text-6xl font-bold text-timeback-primary mb-8 font-cal">
          Why TimeBack vs. Other Solutions
        </h2>
        <p className="text-2xl text-timeback-primary max-w-5xl mx-auto font-cal leading-relaxed">
          See how our structured, mastery-based approach compares to ChatGPT, Khan Academy, and traditional tutoring.
        </p>
      </div>



      {/* Competitor Comparison Table */}
      <div className="mb-12">


        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-timeback-primary">
            <thead className="bg-timeback-bg">
              <tr>
                <th className="text-left p-6 font-semibold text-timeback-primary border-b border-timeback-primary border-opacity-30 font-cal"></th>
                <th className="text-center p-6 font-semibold text-timeback-primary border-b border-timeback-primary border-opacity-30 bg-timeback-primary bg-opacity-10 font-cal">
                  <div className="flex justify-center">
                    <Image alt="Timeback" src="https://igwtslivaqqgiswawdep.supabase.co/storage/v1/object/public/logos/competitors/timeback-logo.png" width={120} height={32} className="h-8 w-auto object-contain" />
                  </div>
                </th>
                <th className="text-center p-6 font-semibold text-timeback-primary border-b border-timeback-primary border-opacity-30 font-cal">
                  <div className="flex justify-center">
                    <Image alt="Khan Academy" src="https://igwtslivaqqgiswawdep.supabase.co/storage/v1/object/public/logos/competitors/khan-academy-logo.png" width={120} height={32} className="h-8 w-auto object-contain" />
                  </div>
                </th>
                <th className="text-center p-6 font-semibold text-timeback-primary border-b border-timeback-primary border-opacity-30 font-cal">
                  <div className="text-sm font-medium font-cal">Traditional School</div>
                </th>
                <th className="text-center p-6 font-semibold text-timeback-primary border-b border-timeback-primary border-opacity-30 font-cal">
                  <div className="flex items-center justify-center gap-2">
                    <Image alt="ChatGPT" src="https://igwtslivaqqgiswawdep.supabase.co/storage/v1/object/public/logos/competitors/chatgpt-logo.png" width={120} height={32} className="h-8 w-auto object-contain" />
                    <span className="text-sm font-cal">ChatGPT</span>
                  </div>
                </th>
                <th className="text-center p-6 font-semibold text-timeback-primary border-b border-timeback-primary border-opacity-30 font-cal">
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
                    One-size-fits-all
                  </span>
                </td>
                <td className="p-6 text-center font-cal">
                  <span className="inline-flex items-center gap-1 text-timeback-primary font-cal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                    One-size-fits-all
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
        <div className="lg:hidden space-y-6">
          <div className="bg-white rounded-2xl border-2 border-timeback-primary shadow-2xl p-6 flex flex-col h-full">
            <div className="flex items-center justify-center mb-6">
              <Image alt="Timeback" src="https://igwtslivaqqgiswawdep.supabase.co/storage/v1/object/public/logos/competitors/timeback-logo.png" width={120} height={32} className="h-8 w-auto object-contain" />
            </div>
            <div className="flex-grow">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="font-medium text-timeback-primary font-cal">Learning Speed</div>
                  <div className="font-bold text-timeback-primary font-cal">10x faster</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium text-timeback-primary font-cal">Personalization</div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-timeback-primary font-medium font-cal">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
                        <path d="M20 6 9 17l-5-5"></path>
                      </svg>
                      AI-Powered
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium text-timeback-primary font-cal">Mastery Guarantee</div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-timeback-primary font-medium font-cal">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
                        <path d="M20 6 9 17l-5-5"></path>
                      </svg>
                      100% Required
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium text-timeback-primary font-cal">Daily Time</div>
                  <div className="font-bold text-timeback-primary font-cal">2 hours</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium text-timeback-primary font-cal">Success Rate</div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-timeback-primary font-medium font-cal">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
                        <path d="M20 6 9 17l-5-5"></path>
                      </svg>
                      98th percentile
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Adaptive learning paths badge - now sticks to bottom */}
            <div className="flex justify-center mt-auto pt-4">
              <div className="bg-timeback-primary text-white px-6 py-3 rounded-full text-lg font-bold shadow-2xl group-hover:scale-105 font-cal transition-transform duration-200" role="status" aria-label="Achievement: Adaptive learning paths">
                Adaptive learning paths
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-timeback-primary border-opacity-30 shadow-2xl p-6 flex flex-col h-full">
            <div className="flex items-center justify-center mb-6">
              <Image alt="Khan Academy" src="https://igwtslivaqqgiswawdep.supabase.co/storage/v1/object/public/logos/competitors/khan-academy-logo.png" width={120} height={32} className="h-8 w-auto object-contain" />
            </div>
            <div className="flex-grow">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="font-medium text-timeback-primary font-cal">Learning Speed</div>
                  <div className="text-timeback-primary font-cal">Standard pace</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium text-timeback-primary font-cal">Personalization</div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-timeback-primary font-cal">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                      </svg>
                      One-size-fits-all
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium text-timeback-primary font-cal">Mastery Guarantee</div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-timeback-primary font-cal">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                      </svg>
                      Optional
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium text-timeback-primary font-cal">Daily Time</div>
                  <div className="text-timeback-primary font-cal">4-6 hours</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium text-timeback-primary font-cal">Success Rate</div>
                  <div>
                    <span className="text-timeback-primary font-medium font-cal">No data</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Adaptive learning paths badge - now sticks to bottom */}
            <div className="flex justify-center mt-auto pt-4">
              <div className="bg-timeback-primary text-white px-6 py-3 rounded-full text-lg font-bold shadow-2xl group-hover:scale-105 font-cal transition-transform duration-200" role="status" aria-label="Achievement: Adaptive learning paths">
                Adaptive learning paths
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-timeback-primary border-opacity-30 shadow-2xl p-6 flex flex-col h-full">
            <div className="flex items-center justify-center mb-6">
                                  <Image alt="IXL" src="https://igwtslivaqqgiswawdep.supabase.co/storage/v1/object/public/logos/competitors/ixl-logo.svg" width={120} height={32} className="h-8 w-auto object-contain" />
            </div>
            <div className="flex-grow">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="font-medium text-timeback-primary font-cal">Learning Speed</div>
                  <div className="text-timeback-primary font-cal">Standard pace</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium text-timeback-primary font-cal">Personalization</div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-timeback-primary font-cal">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                      </svg>
                      One-size-fits-all
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium text-timeback-primary font-cal">Mastery Guarantee</div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-timeback-primary font-cal">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                      </svg>
                      Points-based
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium text-timeback-primary font-cal">Daily Time</div>
                  <div className="text-timeback-primary font-cal">3-5 hours</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium text-timeback-primary font-cal">Success Rate</div>
                  <div>
                    <span className="text-timeback-primary font-medium font-cal">No data</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Adaptive learning paths badge - now sticks to bottom */}
            <div className="flex justify-center mt-auto pt-4">
              <div className="bg-timeback-primary text-white px-6 py-3 rounded-full text-lg font-bold shadow-2xl group-hover:scale-105 font-cal transition-transform duration-200" role="status" aria-label="Achievement: Adaptive learning paths">
                Adaptive learning paths
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-timeback-primary border-opacity-30 shadow-2xl p-6 flex flex-col h-full">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-2">
                <Image alt="ChatGPT" src="https://igwtslivaqqgiswawdep.supabase.co/storage/v1/object/public/logos/competitors/chatgpt-logo.png" width={120} height={32} className="h-8 w-auto object-contain" />
                <span className="font-medium text-timeback-primary font-cal">ChatGPT</span>
              </div>
            </div>
            <div className="flex-grow">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="font-medium text-timeback-primary font-cal">Learning Speed</div>
                  <div className="text-timeback-primary font-cal">Unstructured</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium text-timeback-primary font-cal">Personalization</div>
                  <div>
                    <span className="text-timeback-primary font-medium font-cal">Conversational</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium text-timeback-primary font-cal">Mastery Guarantee</div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-timeback-primary font-cal">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                      </svg>
                      None
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium text-timeback-primary font-cal">Daily Time</div>
                  <div className="text-timeback-primary font-cal">Unlimited</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium text-timeback-primary font-cal">Success Rate</div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-timeback-primary font-cal">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                      </svg>
                      Harmful
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Adaptive learning paths badge - now sticks to bottom */}
            <div className="flex justify-center mt-auto pt-4">
              <div className="bg-timeback-primary text-white px-6 py-3 rounded-full text-lg font-bold shadow-2xl group-hover:scale-105 font-cal transition-transform duration-200" role="status" aria-label="Achievement: Adaptive learning paths">
                Adaptive learning paths
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-timeback-primary border-opacity-30 shadow-2xl p-6 flex flex-col h-full">
            <div className="flex items-center justify-center mb-6">
              <div className="font-medium text-timeback-primary font-cal">Private Tutor</div>
            </div>
            <div className="flex-grow">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="font-medium text-timeback-primary font-cal">Learning Speed</div>
                  <div className="text-timeback-primary font-cal">2x faster</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium text-timeback-primary font-cal">Personalization</div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-timeback-primary font-medium font-cal">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
                        <path d="M20 6 9 17l-5-5"></path>
                      </svg>
                      Human-limited
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium text-timeback-primary font-cal">Mastery Guarantee</div>
                  <div>
                    <span className="text-timeback-primary font-medium font-cal">Varies by tutor</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium text-timeback-primary font-cal">Daily Time</div>
                  <div className="text-timeback-primary font-cal">1-2 hours</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium text-timeback-primary font-cal">Success Rate</div>
                  <div>
                    <span className="text-timeback-primary font-medium font-cal">Variable</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Adaptive learning paths badge - now sticks to bottom */}
            <div className="flex justify-center mt-auto pt-4">
              <div className="bg-timeback-primary text-white px-6 py-3 rounded-full text-lg font-bold shadow-2xl group-hover:scale-105 font-cal transition-transform duration-200" role="status" aria-label="Achievement: Adaptive learning paths">
                Adaptive learning paths
              </div>
            </div>
          </div>
        </div>
        
      </div>





      {/* Learn More button */}
      <div className="flex justify-center mt-8">
        <button 
          onClick={() => onLearnMore('timeback-vs-competitors')}
          className="px-6 py-3 border-2 border-timeback-primary text-timeback-primary bg-transparent rounded-xl hover:bg-timeback-bg transition-all duration-200 transform hover:scale-105 font-cal"
        >
          Get AI comparison tailored to my situation
        </button>
      </div>
    </section>
  );
}