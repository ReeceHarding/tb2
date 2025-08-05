'use client';

import SafeImage from "./SafeImage";
import { motion } from "framer-motion";
import { animationVariants } from "@/libs/animations";

// Comparison table component showing Timeback vs competitors
const WithWithout = () => {
  const CheckIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );

  const XIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );

  return (
    <section className="bg-white">
      <motion.div 
        variants={animationVariants.fadeInUp}
        whileInView="animate"
        initial="initial"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-7xl mx-auto px-8 py-16 md:py-32"
      >
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-xl shadow-2xl overflow-hidden">
            <thead className="bg-timeback-bg">
              <tr>
                <th className="text-left p-6 font-semibold text-timeback-primary border-b border-timeback-primary font-cal"></th>
                <th className="text-center p-6 font-semibold text-timeback-primary border-b border-timeback-primary bg-timeback-bg font-cal">
                  <SafeImage alt="Timeback" src="https://igwtslivaqqgiswawdep.supabase.co/storage/v1/object/public/logos/competitors/timeback-logo.png" width={120} height={32} className="h-8 w-auto object-contain mx-auto" />
                </th>
                <th className="text-center p-6 font-semibold text-timeback-primary border-b border-timeback-primary font-cal">
                  <SafeImage alt="Khan Academy" src="https://igwtslivaqqgiswawdep.supabase.co/storage/v1/object/public/logos/competitors/khan-academy-logo.png" width={120} height={32} className="h-8 w-auto object-contain mx-auto" />
                </th>
                <th className="text-center p-6 font-semibold text-timeback-primary border-b border-timeback-primary font-cal">
                  <SafeImage alt="IXL" src="https://igwtslivaqqgiswawdep.supabase.co/storage/v1/object/public/logos/competitors/ixl-logo.svg" width={120} height={32} className="h-8 w-auto object-contain mx-auto" />
                </th>
                <th className="text-center p-6 font-semibold text-timeback-primary border-b border-timeback-primary font-cal">
                  <div className="flex items-center justify-center gap-2">
                    <SafeImage alt="ChatGPT" src="https://igwtslivaqqgiswawdep.supabase.co/storage/v1/object/public/logos/competitors/chatgpt-logo.png" width={120} height={32} className="h-8 w-auto object-contain" />
                    <span className="text-sm font-cal">ChatGPT</span>
                  </div>
                </th>
                <th className="text-center p-6 font-semibold text-timeback-primary border-b border-timeback-primary font-cal">
                  <div className="text-sm font-medium font-cal">Private Tutor</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-timeback-primary">
                <td className="p-6 font-medium text-timeback-primary font-cal">Learning Speed</td>
                <td className="p-6 text-center font-bold text-timeback-primary bg-timeback-bg font-cal">10x faster</td>
                <td className="p-6 text-center text-timeback-primary font-cal">Standard pace</td>
                <td className="p-6 text-center text-timeback-primary font-cal">Standard pace</td>
                <td className="p-6 text-center text-timeback-primary font-cal">Unstructured</td>
                <td className="p-6 text-center text-timeback-primary font-cal">2x faster</td>
              </tr>
              <tr className="border-b border-timeback-primary">
                <td className="p-6 font-medium text-timeback-primary font-cal">Personalization</td>
                <td className="p-6 text-center bg-timeback-bg font-cal">
                  <span className="inline-flex items-center gap-1 text-timeback-primary font-medium font-cal">
                    <CheckIcon /> AI-Powered
                  </span>
                </td>
                <td className="p-6 text-center font-cal">
                  <span className="inline-flex items-center gap-1 text-timeback-primary font-cal">
                    <XIcon /> One-size-fits-all
                  </span>
                </td>
                <td className="p-6 text-center font-cal">
                  <span className="inline-flex items-center gap-1 text-timeback-primary font-cal">
                    <XIcon /> One-size-fits-all
                  </span>
                </td>
                <td className="p-6 text-center font-cal">
                  <span className="text-timeback-primary font-medium font-cal">Conversational</span>
                </td>
                <td className="p-6 text-center font-cal">
                  <span className="inline-flex items-center gap-1 text-timeback-primary font-medium font-cal">
                    <CheckIcon /> Human-limited
                  </span>
                </td>
              </tr>
              <tr className="border-b border-timeback-primary">
                <td className="p-6 font-medium text-timeback-primary font-cal">Mastery Guarantee</td>
                <td className="p-6 text-center bg-timeback-bg font-cal">
                  <span className="inline-flex items-center gap-1 text-timeback-primary font-medium font-cal">
                    <CheckIcon /> 100% Required
                  </span>
                </td>
                <td className="p-6 text-center font-cal">
                  <span className="inline-flex items-center gap-1 text-timeback-primary font-cal">
                    <XIcon /> Optional
                  </span>
                </td>
                <td className="p-6 text-center font-cal">
                  <span className="inline-flex items-center gap-1 text-timeback-primary font-cal">
                    <XIcon /> Points-based
                  </span>
                </td>
                <td className="p-6 text-center font-cal">
                  <span className="inline-flex items-center gap-1 text-timeback-primary font-cal">
                    <XIcon /> None
                  </span>
                </td>
                <td className="p-6 text-center font-cal">
                  <span className="text-timeback-primary font-medium font-cal">Varies by tutor</span>
                </td>
              </tr>
              <tr className="border-b border-timeback-primary">
                <td className="p-6 font-medium text-timeback-primary font-cal">Daily Time</td>
                <td className="p-6 text-center font-bold text-timeback-primary bg-timeback-bg font-cal">2 hours</td>
                <td className="p-6 text-center text-timeback-primary font-cal">4-6 hours</td>
                <td className="p-6 text-center text-timeback-primary font-cal">3-5 hours</td>
                <td className="p-6 text-center text-timeback-primary font-cal">Unlimited</td>
                <td className="p-6 text-center text-timeback-primary font-cal">1-2 hours</td>
              </tr>
              <tr>
                <td className="p-6 font-medium text-timeback-primary font-cal">Success Rate</td>
                <td className="p-6 text-center bg-timeback-bg font-cal">
                  <span className="inline-flex items-center gap-1 text-timeback-primary font-medium font-cal">
                    <CheckIcon /> 98th percentile
                  </span>
                </td>
                <td className="p-6 text-center font-cal">
                  <span className="text-timeback-primary font-medium font-cal">No data</span>
                </td>
                <td className="p-6 text-center font-cal">
                  <span className="text-timeback-primary font-medium font-cal">No data</span>
                </td>
                <td className="p-6 text-center font-cal">
                  <span className="inline-flex items-center gap-1 text-timeback-primary font-cal">
                    <XIcon /> Harmful
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
          {/* Timeback Card */}
          <div className="bg-white rounded-xl border-2 border-timeback-primary shadow-2xl p-6 flex flex-col h-full">
            <div className="flex items-center justify-center mb-6">
              <SafeImage alt="Timeback" src="https://igwtslivaqqgiswawdep.supabase.co/storage/v1/object/public/logos/competitors/timeback-logo.png" width={120} height={32} className="h-8 w-auto object-contain" />
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
                      <CheckIcon /> AI-Powered
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium text-timeback-primary font-cal">Mastery Guarantee</div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-timeback-primary font-medium font-cal">
                      <CheckIcon /> 100% Required
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
                      <CheckIcon /> 98th percentile
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

          {/* Khan Academy Card */}
          <div className="bg-white rounded-xl border border-timeback-primary shadow-2xl p-6 flex flex-col h-full">
            <div className="flex items-center justify-center mb-6">
              <SafeImage alt="Khan Academy" src="https://igwtslivaqqgiswawdep.supabase.co/storage/v1/object/public/logos/competitors/khan-academy-logo.png" width={120} height={32} className="h-8 w-auto object-contain" />
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
                      <XIcon /> One-size-fits-all
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium text-timeback-primary font-cal">Mastery Guarantee</div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-timeback-primary font-cal">
                      <XIcon /> Optional
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

          {/* IXL Card */}
          <div className="bg-white rounded-xl border border-timeback-primary shadow-2xl p-6 flex flex-col h-full">
            <div className="flex items-center justify-center mb-6">
              <SafeImage alt="IXL" src="https://igwtslivaqqgiswawdep.supabase.co/storage/v1/object/public/logos/competitors/ixl-logo.svg" width={120} height={32} className="h-8 w-auto object-contain" />
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
                      <XIcon /> One-size-fits-all
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium text-timeback-primary font-cal">Mastery Guarantee</div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-timeback-primary font-cal">
                      <XIcon /> Points-based
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

          {/* ChatGPT Card */}
          <div className="bg-white rounded-xl border border-timeback-primary shadow-2xl p-6 flex flex-col h-full">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-2">
                <SafeImage alt="ChatGPT" src="https://igwtslivaqqgiswawdep.supabase.co/storage/v1/object/public/logos/competitors/chatgpt-logo.png" width={120} height={32} className="h-8 w-auto object-contain" />
                <span className="font-medium font-cal">ChatGPT</span>
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
                      <XIcon /> None
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
                      <XIcon /> Harmful
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

          {/* Private Tutor Card */}
          <div className="bg-white rounded-xl border border-timeback-primary shadow-2xl p-6 flex flex-col h-full">
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
                      <CheckIcon /> Human-limited
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
      </motion.div>
    </section>
  );
};

export default WithWithout;
