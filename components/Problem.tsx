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
            TimeBack is an AI tutor we've developed that customizes the questions to your kid's ability. The result is that we boil the school day down from six hours to two hours, and our kids accomplish two times the amount of material as a kid in normal school. Additionally, our kids score in the 99th percentile on standardized tests.
          </p>
        </motion.div>

        {/* Steps Section */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          <Step 
            icon={ClockIcon} 
            title="The Gift of Time" 
            description="Complete all academics in just 2 hours, leaving 4 hours daily for life skills, sports, arts, and passions. Traditional schools require 6 hours for the same learning. We give your child their childhood back." 
          />
          <Step 
            icon={BoltIcon} 
            title="Proven 2x Learning" 
            description="MAP test data proves it: students average 99th percentile scores. The average student learns at least 6x faster, with top performers reaching nearly 12x. Seven boys who were 2 years behind caught up in just 6 months, advancing 13.8x faster than traditional school." 
          />
          <Step 
            icon={SparklesIcon} 
            title="True Personalized Mastery" 
            description="Each child gets their own AI tutor ensuring 100% mastery before advancing. No more teaching to the middle while some fall behind and others are bored. Every concept becomes a solid foundation for exponential growth." 
          />
        </div>
      </div>
    </section>
  );
};

export default Problem;
