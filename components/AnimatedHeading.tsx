'use client';

import { useState, useEffect } from 'react';

// Fast AnimatedHeading configurations - all animations complete in under 2 seconds
const defaultAnimationConfig = {
  typingSpeed: 15,
  deletingSpeed: 10,
  pauseDuration: 300
};

// Reusable typewriter text component with custom messages
interface TypewriterTextProps {
  messages?: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  oneTime?: boolean; // New prop for one-time animation
}

const TypewriterText = ({ 
  messages = [],
  typingSpeed = defaultAnimationConfig.typingSpeed,
  deletingSpeed = defaultAnimationConfig.deletingSpeed,
  pauseDuration = defaultAnimationConfig.pauseDuration,
  oneTime = false // Default to looping behavior for backward compatibility
}: TypewriterTextProps) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(oneTime ? 0 : (messages[0]?.length || 0)); // Start empty for one-time, full for looping
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(oneTime ? false : true); // Start typing immediately for one-time
  const [isComplete, setIsComplete] = useState(false); // Track completion for one-time mode

  useEffect(() => {
    if (!messages.length || (oneTime && isComplete)) return;
    
    const currentMessage = messages[messageIndex];
    
    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        if (!oneTime) {
          setIsDeleting(true);
        }
      }, pauseDuration);
      return () => clearTimeout(pauseTimer);
    }

    const speed = isDeleting ? deletingSpeed : typingSpeed;

    const timer = setTimeout(() => {
      if (isDeleting && !oneTime) {
        if (charIndex > 0) {
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setMessageIndex((messageIndex + 1) % messages.length);
        }
      } else {
        if (charIndex < currentMessage.length) {
          setCharIndex(charIndex + 1);
        } else {
          if (oneTime) {
            // For one-time mode, mark as complete and don't loop
            setIsComplete(true);
          } else {
            setIsPaused(true);
          }
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, messageIndex, isPaused, messages, typingSpeed, deletingSpeed, pauseDuration, oneTime, isComplete]);

  const currentText = messages[messageIndex]?.substring(0, charIndex) || '';

  return (
    <span className="font-cal text-timeback-primary">
      {currentText}
      {/* Only show cursor if not in one-time mode or if animation is not complete */}
      {(!oneTime || !isComplete) && <span className="animate-pulse">|</span>}
    </span>
  );
};

/**
 * Reusable animated heading component that replicates the exact structure:
 * 
 * <div class="space-y-4" style="opacity: 1; transform: none;">
 *   <h1 class="font-extrabold tracking-tight leading-tight font-cal text-timeback-primary text-3xl sm:text-4xl lg:text-5xl">
 *     <span class="block mb-2">What if your child could</span>
 *     <span class="block h-[2.4em] overflow-hidden">
 *       <span class="font-cal text-timeback-primary">score in the 99th percentile on MAP tests?<span class="animate-pulse">|</span></span>
 *     </span>
 *   </h1>
 * </div>
 * 
 * EXAMPLE USAGE:
 * 
 * Basic usage:
 * <AnimatedHeading 
 *   staticText="What if your child could"
 *   animatedMessages={["learn faster?", "achieve more?", "succeed?"]}
 * />
 * 
 * Custom styling:
 * <AnimatedHeading 
 *   staticText="Discover how students can"
 *   animatedMessages={["master advanced concepts", "excel in all subjects", "build lifelong skills"]}
 *   className="mb-8"
 *   typingSpeed={60}
 *   pauseDuration={3000}
 * />
 * 
 * With custom classes:
 * <AnimatedHeading 
 *   staticText="Imagine if learning could"
 *   animatedMessages={["be this engaging", "happen this fast", "feel this natural"]}
 *   staticTextClassName="text-blue-600"
 *   animatedTextClassName="text-green-600"
 * />
 */
interface AnimatedHeadingProps {
  staticText: string;
  animatedMessages?: string[];
  className?: string;
  staticTextClassName?: string;
  animatedTextClassName?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  oneTime?: boolean; // New prop to enable one-time animation mode
}

export const AnimatedHeading = ({
  staticText,
  animatedMessages = [],
  className = "",
  staticTextClassName = "",
  animatedTextClassName = "",
  typingSpeed = defaultAnimationConfig.typingSpeed,
  deletingSpeed = defaultAnimationConfig.deletingSpeed,
  pauseDuration = defaultAnimationConfig.pauseDuration,
  oneTime = false
}: AnimatedHeadingProps) => {
  return (
    <div className={`space-y-4 ${className}`} style={{ opacity: 1, transform: 'none' }}>
      <h1 className="font-extrabold tracking-tight leading-tight font-cal text-timeback-primary text-3xl sm:text-4xl lg:text-5xl">
        <span className={`block mb-2 ${staticTextClassName}`}>
          {staticText}
        </span>
        <span className={`block h-[2.4em] overflow-hidden ${animatedTextClassName}`}>
          <TypewriterText 
            messages={animatedMessages}
            typingSpeed={typingSpeed}
            deletingSpeed={deletingSpeed}
            pauseDuration={pauseDuration}
            oneTime={oneTime}
          />
        </span>
      </h1>
    </div>
  );
};

// Simple one-time typewriter component for basic text elements
interface OneTimeTextProps {
  text: string;
  className?: string;
  typingSpeed?: number;
  startDelay?: number;
}

export const OneTimeText = ({ 
  text, 
  className = "", 
  typingSpeed = 25,
  startDelay = 0 
}: OneTimeTextProps) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (startDelay > 0) {
      const delayTimer = setTimeout(() => {
        let charIndex = 0;
        const typeTimer = setInterval(() => {
          if (charIndex < text.length) {
            setDisplayText(text.substring(0, charIndex + 1));
            charIndex++;
          } else {
            clearInterval(typeTimer);
            setIsComplete(true);
          }
        }, typingSpeed);
        
        return () => clearInterval(typeTimer);
      }, startDelay);
      
      return () => clearTimeout(delayTimer);
    } else {
      let charIndex = 0;
      const typeTimer = setInterval(() => {
        if (charIndex < text.length) {
          setDisplayText(text.substring(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typeTimer);
          setIsComplete(true);
        }
      }, typingSpeed);
      
      return () => clearInterval(typeTimer);
    }
  }, [text, typingSpeed, startDelay]);

  return (
    <span className={`font-cal ${className}`}>
      {displayText}
      {!isComplete && <span className="animate-pulse">|</span>}
    </span>
  );
};

export default AnimatedHeading;