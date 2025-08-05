'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface QuizProgressProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export default function QuizProgress({ currentStep, totalSteps, className = '' }: QuizProgressProps) {
  // Calculate progress percentage (excluding intro step) - ensure it never exceeds 100%
  const progressPercentage = currentStep === 0 ? 0 : Math.min(Math.round((currentStep / totalSteps) * 100), 100);
  
  console.log('[QuizProgress] Rendering progress:', currentStep, '/', totalSteps, '=', progressPercentage + '%');

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Bar Container */}
      <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-timeback-primary">
        {/* Animated Progress Bar */}
        <motion.div
          className="h-full bg-timeback-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ 
            duration: 0.3, 
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Percentage Display */}
      {currentStep > 0 && (
        <div className="text-center mt-2 font-cal">
          <span className="text-xs text-timeback-primary font-cal">
            {progressPercentage}% Complete
          </span>
        </div>
      )}
    </div>
  );
}