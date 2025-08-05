"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { animationVariants, createStaggerVariants } from "@/libs/animations";

const CTA = () => {
  const router = useRouter();
  
  // Animation variants for staggered content reveal
  const containerVariants = createStaggerVariants(0.2, 0.1);

  const handleClick = () => {
    console.log("[CTA] Button clicked - navigating to /quiz");
    router.push("/quiz");
  };
  return (
    <section className="bg-white py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div 
          className="flex flex-col items-center max-w-4xl mx-auto text-center"
          variants={containerVariants}
          whileInView="animate"
          initial="initial"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-timeback-primary rounded-xl text-sm font-medium mb-8 font-cal text-timeback-primary"
            variants={animationVariants.fadeInUp}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-timeback-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-timeback-primary"></span>
            </span>
            Interactive Experience Available
          </motion.div>
          
          <motion.h2 
            className="font-bold text-3xl md:text-5xl tracking-tight mb-8 md:mb-12 font-cal text-timeback-primary leading-tight"
            variants={animationVariants.fadeInUp}
          >
            Ready to See How AI Tutoring Can Help Your Child <br />
            Achieve 99th Percentile Results in Just 2 Hours?
          </motion.h2>
          
          <motion.p 
            className="text-lg mb-12 md:mb-16 max-w-2xl font-cal text-timeback-primary leading-relaxed"
            variants={animationVariants.fadeInUp}
          >
            Experience our AI-powered personalized learning platform firsthand. See exactly how our homeschool curriculum adapts to your child&apos;s needs and why Alpha School students consistently achieve 99th percentile MAP test scores with just 2 hours of daily study.
          </motion.p>

          <motion.div 
            className="w-full max-w-2xl"
            variants={animationVariants.fadeInUp}
          >
            <button 
              className="bg-timeback-primary text-white font-cal rounded-xl px-8 py-4 font-semibold shadow-2xl hover:shadow-2xl transition-all duration-200 hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-timeback-primary focus:ring-opacity-30 w-full max-w-md mx-auto lg:mx-0"
              onClick={handleClick}
            >
              <span className="inline-flex items-center gap-2">
                <span>See How TimeBack Works for Your Child</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  className="w-5 h-5"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </span>
            </button>
          </motion.div>
          
          <motion.p 
            className="text-sm mt-6 font-cal text-timeback-primary"
            variants={animationVariants.fadeInUp}
          >
            Get a personalized AI mockup. No signup required.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
