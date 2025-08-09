import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import { findSchoolsNearCoordinates, findTimeBackSchoolsNearCoordinates } from '@/libs/school-locations';
import { geolocationService, Coordinates } from '@/libs/geolocation-service';

export async function POST(req: NextRequest) {
  console.log('[find-nearby] Processing request to find schools near location');
  
  try {
    // Check authentication (optional - can work without auth)
    const session = await getServerSession(authOptions);
    console.log('[find-nearby] User authenticated:', !!session);
    
    const body = await req.json();
    const { coordinates, address, includeTimeBack = true, includePublic = true, maxResults = 10 } = body;
    
    let searchCoordinates: Coordinates | null = null;
    
    // Get coordinates from provided data or geocode address
    if (coordinates && coordinates.lat && coordinates.lng) {
      searchCoordinates = coordinates;
      console.log('[find-nearby] Using provided coordinates:', searchCoordinates);
    } else if (address) {
      console.log('[find-nearby] Geocoding address:', address);
      const geocodeResult = await geolocationService.geocodeAddress(address);
      
      if (geocodeResult.success && geocodeResult.coordinates) {
        searchCoordinates = geocodeResult.coordinates;
        console.log('[find-nearby] Geocoded to:', searchCoordinates);
      } else {
        return NextResponse.json(
          { error: 'Unable to geocode address', details: geocodeResult.error },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Either coordinates or address must be provided' },
        { status: 400 }
      );
    }
    
    // Find schools near the coordinates
    const results = {
      timebackSchools: [] as any[],
      publicSchools: [] as any[],
      userLocation: {
        coordinates: searchCoordinates,
        address: address || null
      }
    };
    
    // Get TimeBack schools
    if (includeTimeBack) {
      console.log('[find-nearby] Searching for TimeBack schools...');
      const timebackSchools = await findTimeBackSchoolsNearCoordinates(searchCoordinates, maxResults);
      results.timebackSchools = timebackSchools.map(school => ({
        ...school,
        formattedDistance: school.distance < 1 
          ? `${Math.round(school.distance * 5280)} feet` 
          : `${school.distance.toFixed(1)} miles`
      }));
      console.log(`[find-nearby] Found ${results.timebackSchools.length} TimeBack schools`);
    }
    
    // Get public/other schools
    if (includePublic) {
      console.log('[find-nearby] Searching for public schools...');
      const publicSchools = await findSchoolsNearCoordinates(searchCoordinates, maxResults);
      results.publicSchools = publicSchools.map(school => ({
        ...school,
        formattedDistance: school.distance < 1 
          ? `${Math.round(school.distance * 5280)} feet` 
          : `${school.distance.toFixed(1)} miles`
      }));
      console.log(`[find-nearby] Found ${results.publicSchools.length} public schools`);
    }
    
    // Log summary
    console.log('[find-nearby] Search complete:', {
      totalSchools: results.timebackSchools.length + results.publicSchools.length,
      timebackCount: results.timebackSchools.length,
      publicCount: results.publicSchools.length
    });
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('[find-nearby] Error:', error);
    return NextResponse.json(
      { error: 'Failed to find nearby schools', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Also support GET for simple queries
export async function GET(req: NextRequest) {
  console.log('[find-nearby] GET request - converting to POST');
  
  const searchParams = req.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const address = searchParams.get('address');
  const includeTimeBack = searchParams.get('includeTimeBack') !== 'false';
  const includePublic = searchParams.get('includePublic') !== 'false';
  const maxResults = parseInt(searchParams.get('maxResults') || '10');
  
  const body: any = {
    includeTimeBack,
    includePublic,
    maxResults
  };
  
  if (lat && lng) {
    body.coordinates = { lat: parseFloat(lat), lng: parseFloat(lng) };
  }
  
  if (address) {
    body.address = address;
  }
  
  // Create a new request with the body
  const newReq = new NextRequest(req.url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  return POST(newReq);
}