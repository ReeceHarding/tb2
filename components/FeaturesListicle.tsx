"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { animationVariants } from "@/libs/animations";
import type { JSX } from "react";

// Learning science-based features following research from Bloom, Vygotsky, and mastery learning
const features: {
  name: string;
  title: string;
  content: {
    paragraphs: string[];
  };
  bullets: string[];
  result: string;
  researchLink?: {
    text: string;
    url: string;
  };
  svg: JSX.Element;
}[] = [
  {
    name: "1-on-1 Personalized Tutoring",
    title: "Bloom's 2 Sigma Problem: The Power of Individual Tutoring",
    content: {
      paragraphs: [
        "Benjamin Bloom's landmark research published over four decades ago found that students receiving 1-on-1 tutoring performed two standard deviations better than classroom students. This moves average students to the 98th percentile.",
        "TimeBack provides each child with personalized instruction that delivers the individualized learning Bloom identified as transformational. Unlike classroom teachers managing 30+ students, adaptive software gives 100% focus to your child's unique learning needs.",
        "Alpha School data confirms Bloom's findings: the average student learns at least 6x faster with top performers reaching nearly 12x acceleration through personalized tutoring."
      ]
    },
    bullets: [
      "Proven by 40+ years of research",
      "Moves average students to 98th percentile", 
      "1:1 attention impossible in classrooms",
      "Software provides infinite patience"
    ],
    result: "6x faster learning",
    researchLink: {
      text: "Read Bloom's original 2 Sigma research",
      url: "http://www.ascd.org/ASCD/pdf/journals/ed_lead/el_198405_bloom.pdf"
    },
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 7v14m0-14l-4 4m4-4l4 4"
        />
      </svg>
    ),
  },
  {
    name: "100% Mastery Learning", 
    title: "Mastery Learning Theory: Building Unshakeable Foundations",
    content: {
      paragraphs: [
        "Mastery learning principles show that when students master prerequisite knowledge before advancing, they can learn subsequent material much faster and with greater retention.",
        "Traditional schools move all students forward regardless of understanding, creating cumulative knowledge gaps. TimeBack requires 100% mastery before progression, ensuring every concept becomes a solid foundation for future learning.",
        "Alpha School data shows this approach prevents the learning decay where average high school seniors perform at the same level as top 3rd graders on standardized tests."
      ]
    },
    bullets: [
      "100% mastery required before advancing",
      "Prevents cumulative knowledge gaps", 
      "Builds exponential learning growth",
      "Research-proven for 50+ years"
    ],
    result: "Rock-solid foundations",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
        />
        <circle cx="9" cy="7" r="4" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        />
      </svg>
    ),
  },
  {
    name: "Perfect Challenge Level",
    title: "Optimal Learning Zone: Perfect Difficulty Calibration", 
    content: {
      paragraphs: [
        "Learning accelerates when content is challenging enough to engage students but not so difficult as to overwhelm them.",
        "TimeBack's adaptive software continuously monitors student performance and adjusts difficulty in real time. If accuracy drops below 80%, material becomes easier. If above 95%, it increases challenge to maintain optimal learning velocity.",
        "This dynamic difficulty adjustment keeps students in their peak learning zone, maximizing engagement and knowledge acquisition speed."
      ]
    },
    bullets: [
      "Real-time difficulty adjustment",
      "Maintains 80-90% accuracy sweet spot",
      "Prevents boredom and frustration", 
      "Maximizes learning velocity"
    ],
    result: "Peak performance",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.563.563 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5z"
        />
      </svg>
    ),
  },
  {
    name: "Automatic Support",
    title: "Struggle Detection: Immediate Intervention System",
    content: {
      paragraphs: [
        "TimeBack's software continuously monitors student behavior patterns to detect learning struggles before they become barriers. The system tracks response time, error patterns, and engagement metrics.",
        "When struggles are detected, the software immediately provides targeted interventions: simpler explanations, additional practice problems, or prerequisite concept review to address the root cause.",
        "This prevents the cascade effect where small knowledge gaps compound into major learning deficits, ensuring every student maintains forward momentum."
      ]
    },
    bullets: [
      "Real-time struggle detection",
      "Immediate targeted interventions",
      "Prevents knowledge gaps from compounding",
      "Maintains continuous learning momentum"
    ],
    result: "No student left behind",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    ),
  },
  {
    name: "Spaced Repetition",
    title: "Long-Term Memory Formation",
    content: {
      paragraphs: [
        "Research shows that without reinforcement, students forget much of what they learn within days or weeks.",
        "TimeBack implements optimized review patterns, reinforcing concepts at strategic intervals to move knowledge from short-term to long-term memory.",
        "This ensures superior retention compared to traditional schools where students often forget material immediately after tests."
      ]
    },
    bullets: [
      "Strategic review intervals", 
      "Superior retention rates",
      "Prevents knowledge decay",
      "Builds permanent knowledge base"
    ],
    result: "Permanent learning",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
        />
      </svg>
    ),
  },
  {
    name: "Active Learning",
    title: "Active Learning Theory: Engagement Through Interaction",
    content: {
      paragraphs: [
        "Educational research consistently shows that active learning - where students engage with material through problem solving, discussion, and application - produces significantly better outcomes than passive listening.",
        "TimeBack eliminates passive learning entirely. Students must actively respond to questions, solve problems, and demonstrate understanding before progressing, creating constant engagement.",
        "The 25-minute focused sessions combined with active learning principles maximize concentration and knowledge retention while preventing cognitive overload."
      ]
    },
    bullets: [
      "100% active engagement required",
      "Eliminates passive learning", 
      "25-minute focused sessions",
      "Prevents cognitive overload"
    ],
    result: "Deep engagement",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
        />
      </svg>
    ),
  },
];

// Interactive features component with split layout design
const FeaturesListicle = () => {
  const [featureSelected, setFeatureSelected] = useState(0);
  
  const selectedFeature = features[featureSelected];

  const FeatureButton = ({ feature, index, isActive }: { 
    feature: typeof features[0]; 
    index: number; 
    isActive: boolean; 
  }) => (
    <button
      onClick={() => setFeatureSelected(index)}
              className={`w-full flex items-center justify-between p-4 md:p-6 rounded-xl border transition-all duration-300 text-left transform hover:scale-[1.02] ${
        isActive 
                          ? "bg-timeback-primary text-white border-timeback-primary shadow-2xl shadow-timeback-primary/25"
                          : "bg-white text-timeback-primary border-timeback-primary hover:border-timeback-primary hover:shadow-2xl hover:bg-timeback-bg/50"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-xl transition-colors duration-300 ${isActive ? "bg-white/20" : "bg-timeback-bg"}`}>
          <div className={`transition-colors duration-300 ${isActive ? "text-white" : "text-timeback-primary"}`}>
            {feature.svg}
          </div>
        </div>
        <span className="font-semibold text-base md:text-lg font-cal">
          {feature.name}
        </span>
      </div>
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
        className={`transition-transform duration-300 ${isActive ? "rotate-90" : ""}`}
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>
  );

  return (
    <section className="bg-white relative">
      <div className="max-w-7xl mx-auto px-8 py-16 md:py-32 relative">
        {/* Header */}
        <motion.div 
          variants={animationVariants.fadeInUp}
          whileInView="animate"
          initial="initial"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12 md:mb-20 font-cal"
        >
          <h2 className="font-extrabold text-3xl md:text-5xl tracking-tight mb-6 bg-gradient-to-r from-timeback-primary via-timeback-primary to-timeback-primary bg-clip-text text-transparent font-cal">
            Why TimeBack Works: The Learning Science Behind 2x Results
          </h2>
          <p className="text-lg md:text-xl text-timeback-primary max-w-2xl mx-auto leading-relaxed font-cal">
            For 40+ years, research has proven these methods deliver 2x learning. Traditional classrooms can&apos;t implement them. Adaptive software finally can.
          </p>
        </motion.div>

        {/* Main Content Area */}
        <motion.div 
          variants={animationVariants.fadeInUp}
          whileInView="animate"
          initial="initial"
          viewport={{ once: true, margin: "-50px" }}
          className="flex flex-col lg:flex-row gap-8 md:gap-12"
        >
          {/* Content Panel - Desktop: Left side, Mobile: Top */}
          <div className="lg:w-3/5 order-2 lg:order-1">
            <div className="bg-white rounded-xl border border-timeback-primary shadow-2xl shadow-timeback-primary/10 p-8 md:p-12 min-h-[500px] lg:min-h-[600px] backdrop-blur-sm">
              <div className="h-full flex flex-col">
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-bold text-timeback-primary mb-6 font-cal">
                    {selectedFeature.title}
                  </h3>
                  
                  <div className="space-y-4 mb-8">
                    {selectedFeature.content.paragraphs.map((paragraph, index) => (
                      <p key={index} className="text-base md:text-lg text-timeback-primary leading-relaxed font-cal">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                {selectedFeature.researchLink && (
                  <div className="border-t border-timeback-primary pt-6">
                    <a
                      href={selectedFeature.researchLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-timeback-primary font-semibold hover:text-timeback-primary transition-colors font-cal"
                    >
                      {selectedFeature.researchLink.text}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M15 3h6v6" />
                        <path d="M10 14 21 3" />
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Feature Navigation - Desktop: Right side, Mobile: Bottom */}
          <div className="lg:w-2/5 order-1 lg:order-2">
            {/* Desktop Layout */}
            <div className="hidden lg:block space-y-4">
              {features.map((feature, index) => (
                <FeatureButton
                  key={index}
                  feature={feature}
                  index={index}
                  isActive={featureSelected === index}
                />
              ))}
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <FeatureButton
                    key={index}
                    feature={feature}
                    index={index}
                    isActive={featureSelected === index}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesListicle;