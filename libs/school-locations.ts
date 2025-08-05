// School location service using SchoolDigger API for real school data

import { SchoolData } from '@/app/ai-experience/lib/schooldigger';

export interface SchoolLocation {
  id: string;
  name: string;
  address: {
    street?: string;
    city: string;
    state: string;
    zipCode?: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  grades: string;
  phone?: string;
  website?: string;
  description?: string;
  features?: string[];
  level: 'Elementary' | 'Middle' | 'High' | 'K-12';
  rating: number;
  rank?: number;
  rankTotal?: number;
  enrollment?: number;
  isCharter: boolean;
  isPrivate: boolean;
  isMagnet: boolean;
}

// Convert SchoolDigger API response to our SchoolLocation format
function convertSchoolDataToLocation(school: any, distance?: number): SchoolLocation & { distance: number } {
  return {
    id: school.schoolid || school.id,
    name: school.schoolName || school.name,
    address: {
      street: school.address?.street,
      city: school.address?.city || school.city,
      state: school.address?.state || school.state,
      zipCode: school.address?.zip || school.zip
    },
    coordinates: {
      latitude: school.address?.latLong?.latitude || school.latitude || 0,
      longitude: school.address?.latLong?.longitude || school.longitude || 0
    },
    grades: school.lowGrade && school.highGrade ? `${school.lowGrade}-${school.highGrade}` : 'K-12',
    phone: school.phone,
    website: school.url,
    level: normalizeSchoolLevel(school.schoolLevel || school.level),
    rating: school.rankStars || school.rating || 0,
    rank: school.rank,
    rankTotal: school.rankOf || school.rankTotal,
    enrollment: school.enrollment || school.schoolYearlyDetails?.[0]?.numberOfStudents,
    isCharter: school.isCharterSchool === 'Yes' || school.isCharter || false,
    isPrivate: school.isPrivate || false,
    isMagnet: school.isMagnetSchool === 'Yes' || school.isMagnet || false,
    distance: distance || 0,
    description: `${school.schoolLevel || school.level} school in ${school.address?.city || school.city}, ${school.address?.state || school.state}`,
    features: buildSchoolFeatures(school)
  };
}

// Normalize school level to our standard format
function normalizeSchoolLevel(level: string): 'Elementary' | 'Middle' | 'High' | 'K-12' {
  if (!level) return 'K-12';
  const normalized = level.toLowerCase();
  if (normalized.includes('elementary') || normalized.includes('primary')) return 'Elementary';
  if (normalized.includes('middle') || normalized.includes('junior')) return 'Middle';
  if (normalized.includes('high') || normalized.includes('secondary')) return 'High';
  return 'K-12';
}

// Build features array based on school characteristics
function buildSchoolFeatures(school: any): string[] {
  const features: string[] = [];
  
  if (school.isCharterSchool === 'Yes' || school.isCharter) {
    features.push('Charter School');
  }
  if (school.isMagnetSchool === 'Yes' || school.isMagnet) {
    features.push('Magnet School');
  }
  if (school.isPrivate) {
    features.push('Private School');
  }
  if (school.isTitleISchool === 'Yes') {
    features.push('Title I School');
  }
  if (school.isVirtualSchool === 'Yes') {
    features.push('Virtual School');
  }
  
  // Add rating-based features
  const rating = school.rankStars || school.rating || 0;
  if (rating >= 8) {
    features.push('Highly Rated');
  } else if (rating >= 6) {
    features.push('Well Rated');
  }
  
  return features;
}

// Haversine formula to calculate distance between two points
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in miles
}

// Get coordinates for a city/state (simplified lookup for common locations)
export async function getCoordinatesForLocation(city: string, state: string): Promise<{latitude: number, longitude: number} | null> {
  // This is a simplified implementation. For production, you'd use a geocoding service
  const locationMap: Record<string, {latitude: number, longitude: number}> = {
    // Major cities in Texas
    'austin,tx': { latitude: 30.2672, longitude: -97.7431 },
    'houston,tx': { latitude: 29.7604, longitude: -95.3698 },
    'dallas,tx': { latitude: 32.7767, longitude: -96.7970 },
    'san antonio,tx': { latitude: 29.4241, longitude: -98.4936 },
    'fort worth,tx': { latitude: 32.7555, longitude: -97.3308 },
    'plano,tx': { latitude: 33.0198, longitude: -96.6989 },
    'arlington,tx': { latitude: 32.7357, longitude: -97.1081 },
    'corpus christi,tx': { latitude: 27.8006, longitude: -97.3964 },
    'garland,tx': { latitude: 32.9126, longitude: -96.6389 },
    'irving,tx': { latitude: 32.8140, longitude: -96.9489 },
    'waller,tx': { latitude: 30.0669, longitude: -95.9252 },
    'cypress,tx': { latitude: 29.9699, longitude: -95.6972 },
    'katy,tx': { latitude: 29.7858, longitude: -95.8244 },
    'sugar land,tx': { latitude: 29.6197, longitude: -95.6349 },
    'the woodlands,tx': { latitude: 30.1588, longitude: -95.4613 },
    'pearland,tx': { latitude: 29.5638, longitude: -95.2863 },
    'league city,tx': { latitude: 29.5075, longitude: -95.0949 },
    'eagan,mn': { latitude: 44.8041, longitude: -93.1668 },
    
    // Other major cities
    'phoenix,az': { latitude: 33.4484, longitude: -112.0740 },
    'los angeles,ca': { latitude: 34.0522, longitude: -118.2437 },
    'chicago,il': { latitude: 41.8781, longitude: -87.6298 },
    'new york,ny': { latitude: 40.7128, longitude: -74.0060 },
    'miami,fl': { latitude: 25.7617, longitude: -80.1918 },
    'atlanta,ga': { latitude: 33.7490, longitude: -84.3880 },
    'denver,co': { latitude: 39.7392, longitude: -104.9903 },
    'seattle,wa': { latitude: 47.6062, longitude: -122.3321 },
  };

  const key = `${city.toLowerCase()},${state.toLowerCase()}`;
  return locationMap[key] || null;
}

// Search for schools near a location using server-side API
async function searchSchoolsByLocation(
  latitude: number,
  longitude: number,
  distanceMiles: number = 25,
  maxResults: number = 10
): Promise<any[]> {
  try {
    // Use server-side API endpoint instead of direct SchoolDigger call
    const response = await fetch(`/api/schools/search?q=*&limit=${maxResults}&nearLatitude=${latitude}&nearLongitude=${longitude}&distanceMiles=${distanceMiles}&sortBy=distance`);
    
    if (!response.ok) {
      throw new Error(`School search API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`[SchoolLocationService] Found ${data.schoolMatches?.length || 0} schools near location via server API`);
    
    return data.schoolMatches || [];
  } catch (error) {
    console.error('[SchoolLocationService] Error searching schools by location:', error);
    return [];
  }
}

// Find closest schools to a given location using real SchoolDigger API data
export async function findClosestSchools(
  userCity: string,
  userState: string,
  maxResults: number = 3
): Promise<(SchoolLocation & { distance: number })[]> {
  console.log(`[SchoolLocationService] Finding closest schools to ${userCity}, ${userState}`);
  
  // Get coordinates for the user's location
  const userCoordinates = await getCoordinatesForLocation(userCity, userState);
  
  if (!userCoordinates) {
    console.log(`[SchoolLocationService] No coordinates found for ${userCity}, ${userState}`);
    // Fallback: try to search by city and state in SchoolDigger
    try {
      console.log(`[SchoolLocationService] Attempting fallback city search for ${userCity}, ${userState}`);
      
      // Check if SchoolDigger credentials are available
      const appId = process.env.SCHOOLDIGGER_APP_ID;
      const appKey = process.env.SCHOOLDIGGER_API_KEY;
      
      if (!appId || !appKey) {
        console.error('[SchoolLocationService] SchoolDigger credentials not configured, skipping fallback search');
        return [];
      }
      
      const params = new URLSearchParams({
        st: userState.toUpperCase(),
        city: userCity,
        perPage: maxResults.toString(),
        sortBy: 'rank',
        appID: appId,
        appKey: appKey,
      });

      console.log(`[SchoolLocationService] Making API call to SchoolDigger for city: ${userCity}, state: ${userState}`);
      const response = await fetch(`https://api.schooldigger.com/v2.3/schools?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        const schools = data.schoolList || [];
        console.log(`[SchoolLocationService] Found ${schools.length} schools in ${userCity}, ${userState} via city search`);
        
        return schools.slice(0, maxResults).map((school: any) => 
          convertSchoolDataToLocation(school, 0)
        );
      } else {
        console.error(`[SchoolLocationService] SchoolDigger API returned ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('[SchoolLocationService] Error in fallback city search:', error);
    }
    
    return [];
  }

  try {
    // Search for schools near the coordinates
    const nearbySchools = await searchSchoolsByLocation(
      userCoordinates.latitude,
      userCoordinates.longitude,
      50, // Search within 50 miles
      maxResults * 2 // Get more results to ensure we have good options
    );

    if (nearbySchools.length === 0) {
      console.log('[SchoolLocationService] No schools found near coordinates, trying broader search');
      return [];
    }

    // Convert to our format and calculate distances
    const schoolsWithDistance = nearbySchools.map((school: any) => {
      const schoolLat = school.address?.latLong?.latitude || school.latitude || 0;
      const schoolLon = school.address?.latLong?.longitude || school.longitude || 0;
      
      const distance = calculateDistance(
        userCoordinates.latitude,
        userCoordinates.longitude,
        schoolLat,
        schoolLon
      );

      return convertSchoolDataToLocation(school, distance);
    });

    // Sort by distance and return top results
    const sortedSchools = schoolsWithDistance
      .filter(school => school.distance > 0) // Filter out schools without valid coordinates
      .sort((a, b) => a.distance - b.distance)
      .slice(0, maxResults);

    console.log(`[SchoolLocationService] Returning ${sortedSchools.length} closest schools`);
    
    return sortedSchools;
    
  } catch (error) {
    console.error('[SchoolLocationService] Error finding closest schools:', error);
    return [];
  }
}

// Get display name for school (simplified since we're now using real schools)
export function getSchoolDisplayName(school: SchoolLocation): string {
  return school.name;
}

// Get school level badge color
export function getSchoolLevelColor(level: string): string {
  switch (level) {
    case 'Elementary':
      return 'bg-timeback-bg text-timeback-primary';
    case 'Middle':
      return 'bg-timeback-bg text-timeback-primary';
    case 'High':
      return 'bg-timeback-bg text-timeback-primary';
    case 'K-12':
      return 'bg-timeback-bg text-timeback-primary';
    default:
      return 'bg-timeback-bg text-timeback-primary';
  }
}