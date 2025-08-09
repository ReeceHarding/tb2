import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import { supabaseService } from '@/libs/supabase-service';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { journeyId } = await req.json();
    
    if (!journeyId) {
      return NextResponse.json({ error: 'Journey ID required' }, { status: 400 });
    }
    
    // Get user
    const user = await supabaseService.getUserByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get journey
    const journey = await supabaseService.getJourneyById(journeyId);
    if (!journey || journey.userId !== user.id) {
      return NextResponse.json({ error: 'Journey not found' }, { status: 404 });
    }
    
    // Generate unique share URL if not already exists
    let sharedUrl = journey.sharedUrl;
    if (!sharedUrl) {
      sharedUrl = crypto.randomBytes(16).toString('hex');
      
      // Update journey with share URL
      const updated = await supabaseService.updateJourney(journeyId, {
        sharedUrl,
        isPublic: true
      });
      
      if (!updated) {
        return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 });
      }
    }
    
    // Build full URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.headers.get('origin') || 'http://localhost:3000';
    const fullUrl = `${baseUrl}/journey/${sharedUrl}`;
    
    return NextResponse.json({
      success: true,
      shareUrl: fullUrl,
      sharedUrl
    });
    
  } catch (error) {
    console.error('[journey/share] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}