"use client";

import { Variants } from "framer-motion";

// Core animation timing and easing - Optimized for industry best practices
export const ANIMATION_CONFIG = {
  duration: {
    fast: 0.15,    // 150ms - snappy interactions
    medium: 0.25,  // 250ms - standard entrance animations
    slow: 0.3,     // 300ms - maximum for complex animations
  },
  easing: {
    smooth: [0.23, 1, 0.32, 1], // Custom cubic-bezier for smooth, natural motion
    bounce: [0.68, -0.55, 0.265, 1.55],
    ease: "easeOut",
    // Modern easing functions for different use cases
    easeOutCubic: [0.33, 1, 0.68, 1],
    easeOutQuart: [0.25, 1, 0.5, 1],
  },
  delays: {
    none: 0,
    short: 0.05,   // 50ms - minimal stagger
    medium: 0.1,   // 100ms - standard stagger
    long: 0.15,    // 150ms - maximum stagger for accessibility
  },
} as const;

// Common animation variants
export const animationVariants = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  } as Variants,

  fadeInUp: {
    initial: { 
      opacity: 0, 
      y: 20  // Reduced distance for snappier animation
    },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: ANIMATION_CONFIG.duration.medium,  // Now 250ms optimized
        ease: ANIMATION_CONFIG.easing.smooth,
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: {
        duration: ANIMATION_CONFIG.duration.fast,    // Now 150ms optimized
      }
    },
  } as Variants,

  fadeInDown: {
    initial: { 
      opacity: 0, 
      y: -30 
    },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: ANIMATION_CONFIG.duration.medium,
        ease: ANIMATION_CONFIG.easing.smooth,
      }
    },
    exit: { 
      opacity: 0, 
      y: -30,
      transition: {
        duration: ANIMATION_CONFIG.duration.fast,
      }
    },
  } as Variants,

  fadeInLeft: {
    initial: { 
      opacity: 0, 
      x: -30  // Reduced distance for snappier animation
    },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: ANIMATION_CONFIG.duration.medium,  // Now 250ms optimized
        ease: ANIMATION_CONFIG.easing.smooth,
      }
    },
    exit: { 
      opacity: 0, 
      x: -30,
      transition: {
        duration: ANIMATION_CONFIG.duration.fast,    // Now 150ms optimized
      }
    },
  } as Variants,

  fadeInRight: {
    initial: { 
      opacity: 0, 
      x: 30  // Reduced distance for snappier animation
    },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: ANIMATION_CONFIG.duration.medium,  // Now 250ms instead of 800ms
        ease: ANIMATION_CONFIG.easing.smooth,
        delay: ANIMATION_CONFIG.delays.short,        // Now 50ms instead of 200ms
      }
    },
    exit: { 
      opacity: 0, 
      x: 30,
      transition: {
        duration: ANIMATION_CONFIG.duration.fast,    // Now 150ms
      }
    },
  } as Variants,

  // Scale animations
  scaleIn: {
    initial: { 
      scale: 0.8, 
      opacity: 0 
    },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: ANIMATION_CONFIG.duration.medium,
        ease: ANIMATION_CONFIG.easing.smooth,
      }
    },
    exit: { 
      scale: 0.8, 
      opacity: 0,
      transition: {
        duration: ANIMATION_CONFIG.duration.fast,
      }
    },
  } as Variants,

  // Navigation specific
  navigationSlideDown: {
    initial: { 
      y: -100, 
      opacity: 0 
    },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: ANIMATION_CONFIG.duration.medium,
        ease: ANIMATION_CONFIG.easing.smooth,
      }
    },
    exit: { 
      y: -100, 
      opacity: 0,
      transition: {
        duration: ANIMATION_CONFIG.duration.fast,
      }
    },
  } as Variants,

  // Stagger container
  staggerContainer: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: ANIMATION_CONFIG.delays.medium,
        delayChildren: ANIMATION_CONFIG.delays.short,
      }
    },
    exit: {
      transition: {
        staggerChildren: ANIMATION_CONFIG.delays.short,
        staggerDirection: -1,
      }
    },
  } as Variants,

  // Hover effects
  hoverLift: {
    rest: { 
      y: 0, 
      scale: 1,
      transition: {
        duration: ANIMATION_CONFIG.duration.fast,
        ease: ANIMATION_CONFIG.easing.smooth,
      }
    },
    hover: { 
      y: -4, 
      scale: 1.02,
      transition: {
        duration: ANIMATION_CONFIG.duration.fast,
        ease: ANIMATION_CONFIG.easing.smooth,
      }
    },
  } as Variants,

  // Button hover effects
  buttonHover: {
    rest: { 
      scale: 1,
      transition: {
        duration: ANIMATION_CONFIG.duration.fast,
        ease: ANIMATION_CONFIG.easing.smooth,
      }
    },
    hover: { 
      scale: 1.05,
      transition: {
        duration: ANIMATION_CONFIG.duration.fast,
        ease: ANIMATION_CONFIG.easing.smooth,
      }
    },
    tap: { 
      scale: 0.95,
      transition: {
        duration: 0.1,
        ease: ANIMATION_CONFIG.easing.smooth,
      }
    },
  } as Variants,
};

// Helper function to create custom staggered children animations
export const createStaggerVariants = (
  staggerDelay: number = ANIMATION_CONFIG.delays.medium,
  delayChildren: number = ANIMATION_CONFIG.delays.short
) => ({
  initial: {},
  animate: {
    transition: shouldReduceMotion() ? {
      staggerChildren: 0.01,
      delayChildren: 0,
    } : {
      staggerChildren: staggerDelay,
      delayChildren,
    }
  },
  exit: {
    transition: shouldReduceMotion() ? {
      staggerChildren: 0.01,
      staggerDirection: -1,
    } : {
      staggerChildren: ANIMATION_CONFIG.delays.short,
      staggerDirection: -1,
    }
  },
} as Variants);

// Helper function to respect reduced motion preferences
export const shouldReduceMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Helper function to get duration based on reduced motion preference
export const getAnimationDuration = (normalDuration: number): number => {
  return shouldReduceMotion() ? 0.01 : normalDuration;
};

// Helper function to get reduced motion safe transition
export const getReducedMotionTransition = (transition: any) => {
  if (shouldReduceMotion()) {
    return {
      ...transition,
      duration: 0.01,
      delay: 0,
    };
  }
  return transition;
};

// Export commonly used animation props
export const commonAnimationProps = {
  initial: "initial",
  animate: "animate",
  exit: "exit",
  variants: animationVariants.fadeInUp,
  transition: {
    duration: ANIMATION_CONFIG.duration.medium,
    ease: ANIMATION_CONFIG.easing.smooth,
  }
} as const;