"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { animationVariants } from '@/libs/animations';
import { CpuChipIcon, TrophyIcon, AcademicCapIcon } from '@heroicons/react/24/outline';



const Step = ({ icon: Icon, title, description }: { icon: React.ComponentType<any>; title: string; description: string }) => {
  return (
    <motion.div 
      variants={animationVariants.fadeInUp}
      whileInView="animate"
      initial="initial"
      viewport={{ once: true, margin: "-50px" }}
      className="flex-1 max-w-sm mx-auto"
    >
      <div className="backdrop-blur-md bg-timeback-bg/80 rounded-2xl border-2 border-timeback-primary p-8 h-full shadow-2xl">
        <div className="flex flex-col items-center text-center space-y-6 font-cal">
          <div className="w-16 h-16 bg-timeback-bg rounded-full flex items-center justify-center border-2 border-timeback-primary">
            <Icon className="w-8 h-8 text-timeback-primary font-cal" />
          </div>
          <h3 className="font-bold text-lg leading-tight font-cal text-timeback-primary">{title}</h3>
          <p className="text-sm font-cal text-timeback-primary mt-2">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Problem Agitation: A crucial, yet overlooked, component for a landing page that sells.
// It goes under your Hero section, and above your Features section.
// Your Hero section makes a promise to the customer: "Our product will help you achieve XYZ".
// Your Problem section explains what happens to the customer if its problem isn't solved.
// The copy should NEVER mention your product. Instead, it should dig the emotional outcome of not fixing a problem.
// For instance:
// - Hero: "ShipFast helps developers launch startups fast"
// - Problem Agitation: "Developers spend too much time adding features, get overwhelmed, and quit." (not about ShipFast at all)
// - Features: "ShipFast has user auth, Stripe, emails all set up for you"
const Problem = () => {
  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Header Section */}
        <motion.div 
          variants={animationVariants.fadeInUp}
          whileInView="animate"
          initial="initial"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16 lg:mb-24 font-cal"
        >
          <h2 className="font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight mb-6 font-cal text-timeback-primary max-w-4xl mx-auto leading-tight">
            AI-Powered Homeschool Curriculum: What is TimeBack?
          </h2>
          <p className="max-w-3xl mx-auto text-xl sm:text-2xl leading-relaxed font-cal text-timeback-primary font-medium">
            TimeBack replaces traditional classroom teaching with personalized AI tutors. Your child finishes all their academics in just 2 hours a day while learning twice as fast as kids in regular schools—proven by real MAP test scores from Alpha School students.
          </p>
        </motion.div>

        {/* Steps Section */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          <Step 
            icon={CpuChipIcon} 
            title="Adaptive AI Tutoring System" 
            description="Our AI tutoring technology figures out exactly what your child knows and what they don't. Then it provides personalized learning at the perfect difficulty level - not too easy, not too hard." 
          />
          <Step 
            icon={TrophyIcon} 
            title="Proven 99th Percentile MAP Test Results" 
            description="Alpha School has used TimeBack for 10 years. Their students consistently score in the 99th percentile on MAP standardized tests and gain admission to top universities like Stanford and Vanderbilt." 
          />
          <Step 
            icon={AcademicCapIcon} 
            title="Complete K-12 Homeschool Curriculum" 
            description="All subjects from kindergarten through 12th grade included. AI-generated daily lesson plans, real-time progress tracking, and detailed parent reports - everything homeschool families need." 
          />
        </div>

        {/* Additional Value Proposition */}
        <div className="mt-16 lg:mt-24 text-center font-cal">
          <div className="bg-timeback-bg border-2 border-timeback-primary rounded-2xl p-8 lg:p-12 max-w-4xl mx-auto">
            <h3 className="text-2xl lg:text-3xl font-bold text-timeback-primary mb-4 font-cal">
              Why Choose AI-Powered Personalized Learning?
            </h3>
            <p className="text-lg lg:text-xl text-timeback-primary font-cal leading-relaxed">
              Your child finishes all their homeschool curriculum in just 2 hours instead of 8+ hours with traditional schooling. They learn more, faster, achieve higher test scores, and have time for family, sports, hobbies, and just being a kid.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Problem;
