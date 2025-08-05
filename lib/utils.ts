import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Smooth scroll utility function with enhanced behavior
 * @param elementId - The ID of the element to scroll to
 * @param offset - Optional offset from the top (default: 80px for header clearance)
 * @param behavior - Scroll behavior (default: 'smooth')
 * @param onComplete - Optional callback to run after scroll completes
 */
export function smoothScrollToElement(
  elementId: string, 
  offset: number = 80, 
  behavior: 'auto' | 'smooth' | 'instant' = 'smooth',
  onComplete?: () => void
): void {
  console.log(`[smoothScrollToElement] Attempting to scroll to element: ${elementId}`);
  
  // Small delay to ensure DOM is updated
  setTimeout(() => {
    const element = document.getElementById(elementId);
    
    if (!element) {
      console.warn(`[smoothScrollToElement] Element with ID "${elementId}" not found`);
      return;
    }
    
    console.log(`[smoothScrollToElement] Found element, scrolling to: ${elementId}`);
    
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
  }, 100); // 100ms delay to ensure state updates have rendered
}