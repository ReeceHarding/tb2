import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Smooth scroll utility function with enhanced behavior and retry logic
 * @param elementId - The ID of the element to scroll to
 * @param offset - Optional offset from the top (default: 80px for header clearance)
 * @param behavior - Scroll behavior (default: 'smooth')
 * @param onComplete - Optional callback to run after scroll completes
 * @param maxRetries - Maximum number of retry attempts (default: 5)
 */
export function smoothScrollToElement(
  elementId: string, 
  offset: number = 80, 
  behavior: 'auto' | 'smooth' | 'instant' = 'smooth',
  onComplete?: () => void,
  maxRetries: number = 5
): void {
  console.log(`[smoothScrollToElement] Attempting to scroll to element: ${elementId}`);
  
  const attemptScroll = (retryCount: number = 0) => {
    const element = document.getElementById(elementId);
    
    if (!element) {
      if (retryCount < maxRetries) {
        console.log(`[smoothScrollToElement] Element "${elementId}" not found, retry ${retryCount + 1}/${maxRetries} in 200ms`);
        setTimeout(() => attemptScroll(retryCount + 1), 200);
        return;
      } else {
        console.warn(`[smoothScrollToElement] Element with ID "${elementId}" not found after ${maxRetries} retries`);
        return;
      }
    }
    
    console.log(`[smoothScrollToElement] Found element after ${retryCount} retries, scrolling to: ${elementId}`);
    
    // Calculate the target position
    const elementRect = element.getBoundingClientRect();
    const targetY = window.pageYOffset + elementRect.top - offset;
    
    // Perform the scroll
    window.scrollTo({
      top: targetY,
      behavior: behavior
    });
    
    // Execute callback after scroll animation completes (approximate timing)
    if (onComplete) {
      setTimeout(onComplete, 800); // Smooth scroll typically takes ~800ms
    }
  };
  
  // Start with a small delay to ensure DOM updates have begun
  setTimeout(() => attemptScroll(), 100);
}