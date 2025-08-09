"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { animationVariants } from '@/libs/animations';
import { ClockIcon, BoltIcon, SparklesIcon } from '@heroicons/react/24/outline';



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
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Header Section */}
        <motion.div 
          variants={animationVariants.fadeInUp}
          whileInView="animate"
          initial="initial"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16 lg:mb-24 font-cal"
        >
          <h2 className="font-extrabold text-3xl md:text-5xl tracking-tight mb-6 bg-gradient-to-r from-timeback-primary via-timeback-primary to-timeback-primary bg-clip-text text-transparent font-cal">
            What is TimeBack?
          </h2>
          <p className="text-lg md:text-xl text-timeback-primary max-w-2xl mx-auto leading-relaxed font-cal">
            TimeBack is personalized education software that adapts to each student's exact knowledge level. Using adaptive technology pioneered at Alpha School, students complete their daily academics in just 2 hours while learning 2x the material. Students consistently achieve 99th percentile scores on MAP standardized tests.
          </p>
        </motion.div>

        {/* Steps Section */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          <Step 
            icon={ClockIcon} 
            title="2 Hours Daily = 2x Learning" 
            description="Students complete all academics in just 2 hours daily while learning 2x the material compared to traditional 6-hour school days. This gives children 4 hours for life skills, sports, arts, and passions." 
          />
          <Step 
            icon={BoltIcon} 
            title="99th Percentile Results" 
            description="Spring 2024 MAP test data shows students average 99th percentile scores across all subjects. The average student learns 6x faster, with top performers reaching 12x speed. Even students 2 years behind caught up in 6 months." 
          />
          <Step 
            icon={SparklesIcon} 
            title="100% Mastery Learning" 
            description="Each student receives personalized instruction ensuring complete mastery before advancing. Unlike classrooms teaching to the middle, every child works at their exact level. No gaps, no boredom, just continuous progress." 
          />
        </div>
      </div>
    </section>
  );
};

export default Problem;
