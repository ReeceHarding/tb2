// Comprehensive Geolocation Service with Google Maps Geocoding API
// This service handles user location detection, address geocoding, and distance calculations

interface Coordinates {
  lat: number;
  lng: number;
}

interface GeolocationResult {
  success: boolean;
  coordinates?: Coordinates;
  address?: string;
  error?: string;
}

interface DistanceResult {
  distance: number; // in miles
  duration?: number; // in minutes (if using directions API)
  formattedDistance: string;
  formattedDuration?: string;
}

interface GeocodingResult {
  success: boolean;
  coordinates?: Coordinates;
  formattedAddress?: string;
  error?: string;
}

interface IPGeolocationResult extends GeolocationResult {
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
}

export class GeolocationService {
  private static instance: GeolocationService;
  private googleMapsApiKey: string;
  private geocodeCache: Map<string, GeocodingResult> = new Map();
  private ipGeolocationCache: Map<string, IPGeolocationResult> = new Map();
  
  private constructor() {
    // Get API key from environment
    // Prefer server-side secret when available; fall back to NEXT_PUBLIC_* for local/client
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    if (!this.googleMapsApiKey) {
      console.warn('[GeolocationService] Google Maps API key not found in environment variables');
    }
  }

  static getInstance(): GeolocationService {
    if (!GeolocationService.instance) {
      GeolocationService.instance = new GeolocationService();
    }
    return GeolocationService.instance;
  }

  /**
   * Get user's current location using browser geolocation API
   */
  async getUserLocation(): Promise<GeolocationResult> {
    console.log('[GeolocationService] Getting user location...');
    
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.error('[GeolocationService] Geolocation not supported by browser');
        resolve({
          success: false,
          error: 'Geolocation is not supported by your browser'
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coordinates: Coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          console.log('[GeolocationService] User location obtained:', coordinates);
          
          // Try to get address from coordinates
          const addressResult = await this.reverseGeocode(coordinates);
          
          resolve({
            success: true,
            coordinates,
            address: addressResult.formattedAddress
          });
        },
        (error) => {
          console.error('[GeolocationService] Error getting location:', error);
          let errorMessage = 'Unable to get your location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          
          resolve({
            success: false,
            error: errorMessage
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    });
  }

  /**
   * Convert address to coordinates using Google Maps Geocoding API
   */
  async geocodeAddress(address: string): Promise<GeocodingResult> {
    console.log(`[GeolocationService] Geocoding address: ${address}`);
    
    // Check cache first
    const cachedResult = this.geocodeCache.get(address);
    if (cachedResult) {
      console.log('[GeolocationService] Returning cached geocoding result');
      return cachedResult;
    }

    if (!this.googleMapsApiKey) {
      return {
        success: false,
        error: 'Google Maps API key not configured'
      };
    }

    try {
      const encodedAddress = encodeURIComponent(address);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${this.googleMapsApiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const coordinates: Coordinates = {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng
        };
        
        const geocodingResult: GeocodingResult = {
          success: true,
          coordinates,
          formattedAddress: result.formatted_address
        };
        
        // Cache the result
        this.geocodeCache.set(address, geocodingResult);
        
        console.log('[GeolocationService] Geocoding successful:', geocodingResult);
        return geocodingResult;
      } else {
        console.error('[GeolocationService] Geocoding failed:', data.status);
        return {
          success: false,
          error: `Geocoding failed: ${data.status}`
        };
      }
    } catch (error) {
      console.error('[GeolocationService] Geocoding error:', error);
      return {
        success: false,
        error: 'Failed to geocode address'
      };
    }
  }

  /**
   * Convert coordinates to address using Google Maps Reverse Geocoding API
   */
  async reverseGeocode(coordinates: Coordinates): Promise<GeocodingResult> {
    console.log('[GeolocationService] Reverse geocoding coordinates:', coordinates);
    
    if (!this.googleMapsApiKey) {
      return {
        success: false,
        error: 'Google Maps API key not configured'
      };
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.lat},${coordinates.lng}&key=${this.googleMapsApiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        
        return {
          success: true,
          coordinates,
          formattedAddress: result.formatted_address
        };
      } else {
        console.error('[GeolocationService] Reverse geocoding failed:', data.status);
        return {
          success: false,
          error: `Reverse geocoding failed: ${data.status}`
        };
      }
    } catch (error) {
      console.error('[GeolocationService] Reverse geocoding error:', error);
      return {
        success: false,
        error: 'Failed to reverse geocode coordinates'
      };
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(from: Coordinates, to: Coordinates): DistanceResult {
    console.log(`[GeolocationService] Calculating distance from ${JSON.stringify(from)} to ${JSON.stringify(to)}`);
    
    const R = 3959; // Earth's radius in miles
    const lat1Rad = this.toRad(from.lat);
    const lat2Rad = this.toRad(to.lat);
    const deltaLat = this.toRad(to.lat - from.lat);
    const deltaLng = this.toRad(to.lng - from.lng);

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    const formattedDistance = distance < 1 
      ? `${Math.round(distance * 5280)} feet` 
      : `${distance.toFixed(1)} miles`;

    console.log(`[GeolocationService] Distance calculated: ${formattedDistance}`);

    return {
      distance,
      formattedDistance
    };
  }

  /**
   * Get distance and duration using Google Maps Distance Matrix API (optional)
   */
  async getDistanceWithDuration(from: Coordinates, to: Coordinates): Promise<DistanceResult> {
    console.log('[GeolocationService] Getting distance with duration from Google Maps');
    
    if (!this.googleMapsApiKey) {
      // Fall back to Haversine calculation
      return this.calculateDistance(from, to);
    }

    try {
      const origins = `${from.lat},${from.lng}`;
      const destinations = `${to.lat},${to.lng}`;
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&units=imperial&key=${this.googleMapsApiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
        const element = data.rows[0].elements[0];
        const distanceInMiles = element.distance.value / 1609.34; // Convert meters to miles
        const durationInMinutes = Math.round(element.duration.value / 60);
        
        return {
          distance: distanceInMiles,
          duration: durationInMinutes,
          formattedDistance: element.distance.text,
          formattedDuration: element.duration.text
        };
      } else {
        // Fall back to Haversine calculation
        console.warn('[GeolocationService] Distance Matrix API failed, using Haversine formula');
        return this.calculateDistance(from, to);
      }
    } catch (error) {
      console.error('[GeolocationService] Distance Matrix API error:', error);
      // Fall back to Haversine calculation
      return this.calculateDistance(from, to);
    }
  }

  /**
   * Sort locations by distance from a reference point
   */
  sortByDistance<T extends { lat?: number; lng?: number; address?: string }>(
    locations: T[],
    userCoordinates: Coordinates
  ): Array<T & { distance?: number; formattedDistance?: string }> {
    console.log(`[GeolocationService] Sorting ${locations.length} locations by distance`);
    
    return locations.map(location => {
      let distance: DistanceResult | null = null;
      
      if (location.lat && location.lng) {
        distance = this.calculateDistance(userCoordinates, {
          lat: location.lat,
          lng: location.lng
        });
      }
      
      return {
        ...location,
        distance: distance?.distance,
        formattedDistance: distance?.formattedDistance
      };
    }).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
  }

  /**
   * Batch geocode multiple addresses
   */
  async batchGeocode(addresses: string[]): Promise<Map<string, GeocodingResult>> {
    console.log(`[GeolocationService] Batch geocoding ${addresses.length} addresses`);
    
    const results = new Map<string, GeocodingResult>();
    
    // Process in batches to avoid rate limiting
    const batchSize = 10;
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize);
      const promises = batch.map(address => this.geocodeAddress(address));
      const batchResults = await Promise.all(promises);
      
      batch.forEach((address, index) => {
        results.set(address, batchResults[index]);
      });
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < addresses.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  /**
   * Check if coordinates are within a certain radius
   */
  isWithinRadius(center: Coordinates, point: Coordinates, radiusMiles: number): boolean {
    const distance = this.calculateDistance(center, point).distance;
    return distance <= radiusMiles;
  }

  /**
   * Format coordinates for display
   */
  formatCoordinates(coordinates: Coordinates): string {
    return `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`;
  }

  /**
   * Helper function to convert degrees to radians
   */
  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get user's location from IP address
   * Uses ip-api.com for free IP geolocation (no API key required)
   */
  async getUserLocationFromIP(ipAddress?: string): Promise<IPGeolocationResult> {
    console.log('[GeolocationService] Getting location from IP:', ipAddress || 'auto-detect');
    
    try {
      // Check cache first
      const cacheKey = ipAddress || 'auto';
      if (this.ipGeolocationCache.has(cacheKey)) {
        console.log('[GeolocationService] Returning cached IP geolocation result');
        return this.ipGeolocationCache.get(cacheKey)!;
      }
      
      // Use ip-api.com for free IP geolocation
      // If no IP provided, it will use the client's IP automatically
      const url = ipAddress 
        ? `http://ip-api.com/json/${ipAddress}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,query`
        : `http://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,query`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'success') {
        const result: IPGeolocationResult = {
          success: true,
          coordinates: {
            lat: data.lat,
            lng: data.lon
          },
          address: `${data.city}, ${data.regionName} ${data.zip}`,
          ip: data.query,
          city: data.city,
          region: data.regionName,
          country: data.country,
          postalCode: data.zip
        };
        
        // Cache the result
        this.ipGeolocationCache.set(cacheKey, result);
        
        console.log('[GeolocationService] IP geolocation successful:', {
          ip: result.ip,
          city: result.city,
          coordinates: result.coordinates
        });
        
        return result;
      } else {
        console.error('[GeolocationService] IP geolocation failed:', data.message);
        return {
          success: false,
          error: data.message || 'Failed to get location from IP'
        };
      }
    } catch (error) {
      console.error('[GeolocationService] IP geolocation error:', error);
      return {
        success: false,
        error: 'Failed to get location from IP address'
      };
    }
  }

  /**
   * Clear geocoding cache
   */
  clearCache(): void {
    this.geocodeCache.clear();
    this.ipGeolocationCache.clear();
    console.log('[GeolocationService] Geocoding and IP geolocation caches cleared');
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.geocodeCache.size;
  }
}

// Export singleton instance
export const geolocationService = GeolocationService.getInstance();
export type { Coordinates, GeolocationResult, DistanceResult, GeocodingResult, IPGeolocationResult };