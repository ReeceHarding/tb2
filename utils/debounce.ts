/**
 * Debounce utility to prevent rapid-fire function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

/**
 * Request throttling to prevent multiple simultaneous requests to the same endpoint
 */
class RequestThrottler {
  private pendingRequests = new Map<string, Promise<any>>();
  
  async throttleRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
    timeout: number = 5000
  ): Promise<T> {
    // If there's already a pending request for this key, return it
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>;
    }
    
    // Create and store the new request
    const request = Promise.race([
      requestFn(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      )
    ]).finally(() => {
      // Clean up when request completes
      this.pendingRequests.delete(key);
    });
    
    this.pendingRequests.set(key, request);
    return request;
  }
  
  clearPending(key?: string) {
    if (key) {
      this.pendingRequests.delete(key);
    } else {
      this.pendingRequests.clear();
    }
  }
}

export const requestThrottler = new RequestThrottler();