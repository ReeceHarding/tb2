// School location service using SchoolDigger API for real school data

import { SchoolData } from '@/app/ai-experience/lib/schooldigger';
import { createClient } from '@supabase/supabase-js';
import { geolocationService, Coordinates } from './geolocation-service';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Supabase client for TimeBack schools
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Interface for school location data
export interface SchoolLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  website?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  type?: string;
  level?: 'Elementary' | 'Middle' | 'High' | 'K-12';
  rating?: number;
  enrollment?: number;
  isCharter?: boolean;
  isPrivate?: boolean;
  isMagnet?: boolean;
}

// In-memory cache for SchoolDigger API results
const schoolCache = new Map<string, { schools: SchoolLocation[], timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Calculate distance between two points using Haversine formula
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in miles
}

// Find schools near coordinates (public/charter schools via SchoolDigger)
export async function findSchoolsNearCoordinates(
  coordinates: Coordinates,
  maxResults: number = 5
): Promise<(SchoolLocation & { distance: number })[]> {
  console.log(`[SchoolLocations] Finding schools near coordinates: ${coordinates.lat}, ${coordinates.lng}`);
  
  try {
    // Use SchoolDigger API to find schools
    // Prefer server-side secrets; fall back to NEXT_PUBLIC_* if present for local dev
    const apiKey = process.env.SCHOOLDIGGER_API_KEY || process.env.NEXT_PUBLIC_SCHOOLDIGGER_API_KEY;
    const appId = process.env.SCHOOLDIGGER_APP_ID || process.env.NEXT_PUBLIC_SCHOOLDIGGER_APP_ID;
    
    if (!apiKey || !appId) {
      console.error('[SchoolLocations] SchoolDigger API credentials not configured');
      return [];
    }
    
    // Use v2.0 API which doesn't require state parameter for location searches
    // Search within ~25 mile radius (increased from 10 to capture more schools)
    const radius = 25;
    const url = `https://api.schooldigger.com/v2.0/schools?`;
    const params = new URLSearchParams({
      appID: appId,
      appKey: apiKey,
      nearLatitude: coordinates.lat.toString(),
      nearLongitude: coordinates.lng.toString(),
      radius: radius.toString(),
      perPage: '50',
      sortBy: 'distance'
    });
    
    const response = await fetch(url + params.toString());
    
    if (!response.ok) {
      console.error('[SchoolLocations] SchoolDigger API error:', response.statusText);
      return [];
    }
    
    const data: any = await response.json();
    const schools = data.schoolList || [];
    
    console.log(`[SchoolLocations] Found ${schools.length} schools from SchoolDigger`);
    
    // Transform and calculate distances
    const schoolsWithDistance = schools.map((school: any) => {
      const distance = calculateDistance(
        coordinates.lat,
        coordinates.lng,
        school.latitude,
        school.longitude
      );
      
      return {
        id: school.schoolid,
        name: school.schoolName,
        address: school.address?.street || '',
        city: school.address?.city || '',
        state: school.address?.state || '',
        zipCode: school.address?.zip || '',
        phone: school.phone || '',
        website: school.url || '',
        coordinates: {
          lat: school.latitude,
          lng: school.longitude
        },
        type: school.isCharterSchool ? 'Charter' : 'Public',
        level: school.levelName || 'K-12',
        rating: school.rankStars || 0,
        enrollment: school.enrollment || 0,
        isCharter: school.isCharterSchool || false,
        isPrivate: school.isPrivateSchool || false,
        isMagnet: school.isMagnetSchool || false,
        distance
      };
    });
    
    // Sort by distance and return top results
    return schoolsWithDistance
      .sort((a: any, b: any) => a.distance - b.distance)
      .slice(0, maxResults);
    
  } catch (error) {
    console.error('[SchoolLocations] Error finding schools:', error);
    return [];
  }
}

// Find TimeBack schools near GPS coordinates
export async function findTimeBackSchoolsNearCoordinates(
  coordinates: Coordinates,
  maxResults: number = 3
): Promise<(SchoolLocation & { distance: number })[]> {
  console.log(`[TimeBackSchools] Finding TimeBack schools near coordinates: ${coordinates.lat}, ${coordinates.lng}`);
  
  try {
    // Load geocoded schools from local file
    const filePath = path.join(process.cwd(), 'public/data/geocoded-schools.json');
    let schools: any[] = [];
    
    try {
      const schoolsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      schools = schoolsData.filter((school: any) => school.lat && school.lng);
      console.log(`[TimeBackSchools] Loaded ${schools.length} geocoded schools from file`);
    } catch (fileError) {
      console.error('[TimeBackSchools] Error loading geocoded schools file:', fileError);
      return [];
    }

    if (!schools || schools.length === 0) {
      console.log('[TimeBackSchools] No TimeBack schools found');
      return [];
    }

    console.log(`[TimeBackSchools] Found ${schools.length} TimeBack schools`);
    
    // Transform schools and calculate distances
    const timeBackSchools: (SchoolLocation & { distance: number })[] = [];
    
    for (const school of schools) {
      const distance = calculateDistance(
        coordinates.lat,
        coordinates.lng,
        school.lat,
        school.lng
      );
      
      // Determine school level based on name
      let level: 'Elementary' | 'Middle' | 'High' | 'K-12' = 'K-12';
      const name = school.name.toLowerCase();
      if (name.includes('high')) level = 'High';
      else if (name.includes('elementary')) level = 'Elementary';
      else if (name.includes('middle')) level = 'Middle';
      
      const transformedSchool: SchoolLocation & { distance: number } = {
        id: school.id,
        name: school.name,
        address: school.fullAddress || school.address || '',
        city: school.city || '',
        state: school.state || '',
        zipCode: school.zipCode || '',
        phone: school.phone || '',
        website: school.website || '',
        coordinates: {
          lat: school.lat,
          lng: school.lng
        },
        type: school.type || 'TimeBack',
        level,
        rating: 9, // TimeBack schools are highly rated
        enrollment: 150, // Average enrollment
        isCharter: false,
        isPrivate: true,
        isMagnet: false,
        distance
      };
      
      timeBackSchools.push(transformedSchool);
    }
    
    // Sort by distance
    timeBackSchools.sort((a, b) => a.distance - b.distance);
    
    // Return top results
    return timeBackSchools.slice(0, maxResults);
    
  } catch (error) {
    console.error('[TimeBackSchools] Error in findTimeBackSchoolsNearCoordinates:', error);
    return [];
  }
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