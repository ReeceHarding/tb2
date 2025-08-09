import { NextRequest, NextResponse } from 'next/server';
import { geolocationService } from '@/libs/geolocation-service';

export async function GET(req: NextRequest) {
  console.log('[api/geolocation/ip] Getting user location from IP');
  
  try {
    // Get client IP address from request headers
    // In production, the IP might be in different headers depending on your deployment
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfConnectingIp = req.headers.get('cf-connecting-ip'); // For Cloudflare
    
    // Priority: CF-Connecting-IP > X-Forwarded-For > X-Real-IP
    let clientIp: string | undefined;
    
    if (cfConnectingIp) {
      clientIp = cfConnectingIp;
    } else if (forwardedFor) {
      // X-Forwarded-For can contain multiple IPs, take the first one
      clientIp = forwardedFor.split(',')[0].trim();
    } else if (realIp) {
      clientIp = realIp;
    }
    
    console.log('[api/geolocation/ip] Detected IP:', clientIp || 'none (will use service auto-detection)');
    
    // Get location from IP using our geolocation service
    const result = await geolocationService.getUserLocationFromIP(clientIp);
    
    if (result.success) {
      console.log('[api/geolocation/ip] Successfully got location:', {
        city: result.city,
        region: result.region,
        coordinates: result.coordinates
      });
      
      return NextResponse.json({
        success: true,
        location: {
          coordinates: result.coordinates,
          address: result.address,
          city: result.city,
          region: result.region,
          country: result.country,
          postalCode: result.postalCode
        },
        ip: result.ip
      });
    } else {
      console.error('[api/geolocation/ip] Failed to get location:', result.error);
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to get location from IP' 
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[api/geolocation/ip] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}