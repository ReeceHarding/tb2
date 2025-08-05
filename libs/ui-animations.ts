// Enhanced UI/UX animations and utilities for the personalized page

// Smooth scroll with easing function
export const smoothScrollTo = (element: HTMLElement | null, options?: {
  offset?: number;
  duration?: number;
  onComplete?: () => void;
}) => {
  if (!element) return;

  const offset = options?.offset || 80;
  const duration = options?.duration || 800;
  const onComplete = options?.onComplete;

  const startPosition = window.pageYOffset;
  const targetPosition = element.offsetTop - offset;
  const distance = targetPosition - startPosition;
  const startTime = performance.now();

  // Easing function for smooth acceleration/deceleration
  const easeInOutQuart = (t: number): number => {
    return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
  };

  const animateScroll = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = easeInOutQuart(progress);
    
    window.scrollTo(0, startPosition + distance * easeProgress);

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    } else {
      onComplete?.();
    }
  };

  requestAnimationFrame(animateScroll);
};

// Instant content reveal with stagger effect
export const instantReveal = (elements: NodeListOf<HTMLElement> | HTMLElement[], options?: {
  staggerDelay?: number;
  duration?: number;
  from?: 'top' | 'bottom' | 'left' | 'right';
}) => {
  const staggerDelay = options?.staggerDelay || 50;
  const duration = options?.duration || 300;
  const from = options?.from || 'top';

  const transforms = {
    top: 'translateY(-20px)',
    bottom: 'translateY(20px)',
    left: 'translateX(-20px)',
    right: 'translateX(20px)',
  };

  Array.from(elements).forEach((element, index) => {
    // Set initial state
    element.style.opacity = '0';
    element.style.transform = transforms[from];
    element.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;

    // Trigger animation after stagger delay
    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = 'translate(0)';
    }, index * staggerDelay);
  });
};

// Highlight animation for personalized data
export const highlightData = (element: HTMLElement, options?: {
  color?: string;
  duration?: number;
  intensity?: 'light' | 'medium' | 'strong';
}) => {
  const color = options?.color || '#1abeff'; // timeback-bg color
  const duration = options?.duration || 1000;
  const intensity = options?.intensity || 'medium';

  const intensityMap = {
    light: 0.2,
    medium: 0.4,
    strong: 0.6,
  };

  const highlightKeyframes = [
    { backgroundColor: 'transparent' },
    { backgroundColor: `${color}${Math.round(intensityMap[intensity] * 255).toString(16)}` },
    { backgroundColor: 'transparent' },
  ];

  element.animate(highlightKeyframes, {
    duration,
    easing: 'ease-in-out',
    iterations: 1,
  });
};

// Pulse animation for call-to-action buttons
export const pulseAnimation = (element: HTMLElement, options?: {
  scale?: number;
  duration?: number;
  iterations?: number;
}) => {
  const scale = options?.scale || 1.05;
  const duration = options?.duration || 1000;
  const iterations = options?.iterations || 3;

  const pulseKeyframes = [
    { transform: 'scale(1)' },
    { transform: `scale(${scale})` },
    { transform: 'scale(1)' },
  ];

  element.animate(pulseKeyframes, {
    duration,
    easing: 'ease-in-out',
    iterations,
  });
};

// Progress indicator for content generation
export const showLoadingProgress = (container: HTMLElement, options?: {
  text?: string;
  showPercentage?: boolean;
}) => {
  const text = options?.text || 'Generating personalized content';
  const showPercentage = options?.showPercentage !== false;

  // Create progress UI
  const progressHTML = `
    <div class="loading-progress-container" style="
      position: relative;
      width: 100%;
      padding: 20px;
      text-align: center;
    ">
      <p class="font-cal text-timeback-primary text-lg mb-4">${text}</p>
      <div class="progress-bar-container" style="
        width: 100%;
        height: 8px;
        background-color: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;
        position: relative;
      ">
        <div class="progress-bar" style="
          width: 0%;
          height: 100%;
          background: linear-gradient(90deg, #1abeff 0%, #0f33bb 100%);
          transition: width 300ms ease-out;
          position: absolute;
          left: 0;
          top: 0;
        "></div>
      </div>
      ${showPercentage ? '<p class="font-cal text-timeback-primary text-sm mt-2 progress-percentage">0%</p>' : ''}
    </div>
  `;

  container.innerHTML = progressHTML;
  const progressBar = container.querySelector('.progress-bar') as HTMLElement;
  const percentageText = container.querySelector('.progress-percentage') as HTMLElement;

  return {
    update: (percentage: number) => {
      if (progressBar) {
        progressBar.style.width = `${percentage}%`;
      }
      if (percentageText) {
        percentageText.textContent = `${Math.round(percentage)}%`;
      }
    },
    complete: () => {
      if (progressBar) {
        progressBar.style.width = '100%';
      }
      if (percentageText) {
        percentageText.textContent = '100%';
      }
      setTimeout(() => {
        container.style.opacity = '0';
        container.style.transition = 'opacity 300ms ease-out';
        setTimeout(() => {
          container.remove();
        }, 300);
      }, 500);
    },
  };
};

// Instant content switch with no loading state
export const instantContentSwitch = (
  oldContent: HTMLElement,
  newContent: HTMLElement,
  options?: {
    direction?: 'left' | 'right' | 'up' | 'down';
    duration?: number;
  }
) => {
  const direction = options?.direction || 'up';
  const duration = options?.duration || 300;

  const transforms = {
    left: { out: 'translateX(-100%)', in: 'translateX(100%)' },
    right: { out: 'translateX(100%)', in: 'translateX(-100%)' },
    up: { out: 'translateY(-100%)', in: 'translateY(100%)' },
    down: { out: 'translateY(100%)', in: 'translateY(-100%)' },
  };

  // Prepare new content
  newContent.style.opacity = '0';
  newContent.style.transform = transforms[direction].in;
  newContent.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;
  newContent.style.display = 'block';

  // Animate out old content
  oldContent.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;
  oldContent.style.opacity = '0';
  oldContent.style.transform = transforms[direction].out;

  // Animate in new content
  setTimeout(() => {
    newContent.style.opacity = '1';
    newContent.style.transform = 'translate(0)';
  }, 50);

  // Clean up after animation
  setTimeout(() => {
    oldContent.style.display = 'none';
  }, duration);
};

// Export all utilities
export const uiAnimations = {
  smoothScrollTo,
  instantReveal,
  highlightData,
  pulseAnimation,
  showLoadingProgress,
  instantContentSwitch,
};