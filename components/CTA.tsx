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
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div 
          className="flex flex-col items-center max-w-4xl mx-auto text-center"
          variants={containerVariants}
          whileInView="animate"
          initial="initial"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-6 py-3 backdrop-blur-md bg-timeback-bg/80 border-2 border-timeback-primary rounded-xl text-sm font-medium mb-8 font-cal text-timeback-primary"
            variants={animationVariants.fadeInUp}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-timeback-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-timeback-primary"></span>
            </span>
            Interactive Experience Available
          </motion.div>
          
          <motion.h2 
            className="font-extrabold text-3xl md:text-5xl tracking-tight mb-6 bg-gradient-to-r from-timeback-primary via-timeback-primary to-timeback-primary bg-clip-text text-transparent font-cal"
            variants={animationVariants.fadeInUp}
          >
            Give Your Child the Gift of Time - and a 99th Percentile Education
          </motion.h2>
          
          <motion.p 
            className="text-lg md:text-xl text-timeback-primary max-w-2xl mx-auto leading-relaxed font-cal mb-12 md:mb-16"
            variants={animationVariants.fadeInUp}
          >
            Your child has unlimited potential. Traditional schools waste it. See exactly how TimeBack transforms average students into top performers in just 2 hours daily - leaving 4 hours for life, passions, and actually being a kid.
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
                <span>Start Your Child&apos;s TimeBack Journey</span>
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
            Get a personalized AI mockup. No payment required.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
