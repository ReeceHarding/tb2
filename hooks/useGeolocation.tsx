import { useState, useEffect, useCallback } from 'react';
import { geolocationService, GeolocationResult, Coordinates, DistanceResult } from '@/libs/geolocation-service';

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  autoDetect?: boolean;
}

interface UseGeolocationReturn {
  location: GeolocationResult | null;
  isLoading: boolean;
  error: string | null;
  getUserLocation: () => Promise<void>;
  calculateDistanceTo: (destination: Coordinates) => DistanceResult | null;
  geocodeAddress: (address: string) => Promise<Coordinates | null>;
  clearError: () => void;
}

export function useGeolocation(options: UseGeolocationOptions = {}): UseGeolocationReturn {
  const { autoDetect = false } = options;
  
  const [location, setLocation] = useState<GeolocationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user location
  const getUserLocation = useCallback(async () => {
    console.log('[useGeolocation] Getting user location...');
    setIsLoading(true);
    setError(null);

    try {
      const result = await geolocationService.getUserLocation();
      
      if (result.success) {
        setLocation(result);
        console.log('[useGeolocation] Location obtained:', result);
      } else {
        setError(result.error || 'Failed to get location');
        console.error('[useGeolocation] Location error:', result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('[useGeolocation] Exception:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate distance to a destination
  const calculateDistanceTo = useCallback((destination: Coordinates): DistanceResult | null => {
    if (!location?.coordinates) {
      console.warn('[useGeolocation] No user location available for distance calculation');
      return null;
    }

    return geolocationService.calculateDistance(location.coordinates, destination);
  }, [location]);

  // Geocode an address
  const geocodeAddress = useCallback(async (address: string): Promise<Coordinates | null> => {
    console.log('[useGeolocation] Geocoding address:', address);
    
    try {
      const result = await geolocationService.geocodeAddress(address);
      
      if (result.success && result.coordinates) {
        return result.coordinates;
      } else {
        console.error('[useGeolocation] Geocoding failed:', result.error);
        return null;
      }
    } catch (err) {
      console.error('[useGeolocation] Geocoding exception:', err);
      return null;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-detect location on mount if enabled
  useEffect(() => {
    if (autoDetect) {
      getUserLocation();
    }
  }, [autoDetect, getUserLocation]);

  return {
    location,
    isLoading,
    error,
    getUserLocation,
    calculateDistanceTo,
    geocodeAddress,
    clearError
  };
}

// Hook for managing location permissions
export function useLocationPermission() {
  const [permission, setPermission] = useState<PermissionState | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        if ('permissions' in navigator) {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          setPermission(result.state);
          
          // Listen for permission changes
          result.addEventListener('change', () => {
            setPermission(result.state);
          });
        }
      } catch (error) {
        console.error('[useLocationPermission] Error checking permission:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkPermission();
  }, []);

  return { permission, isChecking };
}