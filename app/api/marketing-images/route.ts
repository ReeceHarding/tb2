// Marketing Images API - Serves brand-safe school marketing content
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../libs/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Query parameters
  const schoolId = searchParams.get('schoolId');
  const schoolType = searchParams.get('schoolType'); // 'alpha', 'other', 'special'
  const category = searchParams.get('category'); // 'Brand Assets', 'Event Flyers', etc.
  const contentType = searchParams.get('contentType'); // Specific content type
  const featured = searchParams.get('featured'); // 'true' for featured images only
  const limit = parseInt(searchParams.get('limit') || '50');
  const page = parseInt(searchParams.get('page') || '1');
  
  try {
    let query = supabase
      .from('marketing_images')
      .select(`
        id,
        title,
        description,
        image_url,
        thumbnail_url,
        original_filename,
        school_id,
        school_name,
        school_type,
        school_address,
        school_city,
        school_state,
        school_zip,
        school_phone,
        school_email,
        school_website,
        category,
        content_type,
        tags,
        file_size,
        width,
        height,
        view_count,
        is_featured,
        created_at
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (schoolId) {
      query = query.eq('school_id', schoolId);
    }
    
    if (schoolType) {
      query = query.eq('school_type', schoolType);
    }
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (contentType) {
      query = query.eq('content_type', contentType);
    }
    
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: images, error } = await query;

    if (error) {
      console.error('Marketing images query error:', error);
      return NextResponse.json({ error: 'Failed to fetch marketing images' }, { status: 500 });
    }

    // Get total count for pagination (only if needed)
    let totalCount = null;
    if (page === 1) {
      let countQuery = supabase
        .from('marketing_images')
        .select('id', { count: 'exact', head: true });
        
      // Apply same filters for count
      if (schoolId) countQuery = countQuery.eq('school_id', schoolId);
      if (schoolType) countQuery = countQuery.eq('school_type', schoolType);
      if (category) countQuery = countQuery.eq('category', category);
      if (contentType) countQuery = countQuery.eq('content_type', contentType);
      if (featured === 'true') countQuery = countQuery.eq('is_featured', true);
      
      const { count } = await countQuery;
      totalCount = count;
    }

    // Transform data for API response
    const transformedImages = images?.map(image => ({
      id: image.id,
      title: image.title,
      description: image.description,
      imageUrl: image.image_url,
      thumbnailUrl: image.thumbnail_url,
      filename: image.original_filename,
      school: {
        id: image.school_id,
        name: image.school_name,
        type: image.school_type,
        address: image.school_address,
        city: image.school_city,
        state: image.school_state,
        zipCode: image.school_zip,
        phone: image.school_phone,
        email: image.school_email,
        website: image.school_website,
        fullAddress: image.school_address && image.school_city ? 
          `${image.school_address}, ${image.school_city}${image.school_state ? `, ${image.school_state}` : ''}${image.school_zip ? ` ${image.school_zip}` : ''}` 
          : null
      },
      category: image.category,
      contentType: image.content_type,
      tags: image.tags,
      fileSize: image.file_size,
      dimensions: {
        width: image.width,
        height: image.height
      },
      viewCount: image.view_count,
      isFeatured: image.is_featured,
      createdAt: image.created_at
    })) || [];

    const response = {
      images: transformedImages,
      pagination: {
        page,
        limit,
        total: totalCount,
        hasMore: transformedImages.length === limit
      },
      filters: {
        schoolId,
        schoolType,
        category,
        contentType,
        featured: featured === 'true'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Marketing images API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Increment view count when image is viewed
export async function POST(request: NextRequest) {
  try {
    const { imageId } = await request.json();
    
    if (!imageId) {
      return NextResponse.json({ error: 'Image ID required' }, { status: 400 });
    }

    const { error } = await supabase.rpc('increment_marketing_image_view_count', {
      image_id: imageId
    });

    if (error) {
      console.error('Error incrementing view count:', error);
      return NextResponse.json({ error: 'Failed to update view count' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Marketing images POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}