// Serverless-compatible school data API helpers for Vercel deployment
// Uses Supabase database instead of local file system operations

import { ExtractedSchoolData, ExtractedMediaFile, SchoolId } from '../types/school-data';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// Use environment variables for all Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration. Required environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database interfaces
interface DatabaseSchool {
  id: string;
  name: string;
  city: string;
  state: string | null;
  type: string;
  extraction_date: string | null;
  has_marketing_folder: boolean;
  marketing_folder_id: string | null;
  total_assets: number;
  image_count: number;
  video_count: number;
  document_count: number;
  total_asset_count: number;
  address: string | null;
  zip_code: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  full_address: string | null;
  description: string | null;
}

interface DatabaseMarketingAsset {
  id: string;
  school_id: string;
  original_name: string;
  organized_name: string | null;
  local_path: string | null;
  file_type: 'image' | 'video' | 'document';
  mime_type: string | null;
  file_size: number | null;
  google_drive_id: string | null;
  download_url: string | null;
  web_view_link: string | null;
  thumbnail_link: string | null;
  category: string | null;
}

/**
 * Load all school data from Supabase database
 * Serverless-compatible - no file system operations
 */
export async function getAllSchools(): Promise<ExtractedSchoolData[]> {
  try {
    console.log('🔍 Loading schools from Supabase database...');
    
    // Query schools with assets using the view
    const { data: schoolsData, error } = await supabase
      .from('schools_with_assets')
      .select('*')
      .order('name');

    if (error) {
      console.error('❌ Error loading schools from database:', error);
      return [];
    }

    if (!schoolsData || schoolsData.length === 0) {
      console.warn('⚠️ No schools found in database');
      return [];
    }

    console.log(`✅ Loaded ${schoolsData.length} schools from database`);

    // Transform database records to API format
    const schools: ExtractedSchoolData[] = await Promise.all(
      schoolsData.map(async (school: DatabaseSchool) => {
        const assets = await getSchoolAssets(school.id);
        return transformDatabaseSchoolToAPI(school, assets);
      })
    );

    const totalAssets = schools.reduce((sum, school) => sum + school.totalFiles, 0);
    console.log(`✅ Successfully loaded ${schools.length} schools with ${totalAssets} total assets`);
    
    return schools;
  } catch (error) {
    console.error('❌ Error loading all schools:', error);
    return [];
  }
}

/**
 * Load specific school data from Supabase database
 * Serverless-compatible - no file system operations
 */
export async function getSchoolData(schoolId: SchoolId): Promise<ExtractedSchoolData | null> {
  try {
    const schoolIdStr = String(schoolId);
    console.log(`🔍 Loading school data for: ${schoolIdStr}`);
    
    // Query school with assets using the view
    const { data: schoolData, error } = await supabase
      .from('schools_with_assets')
      .select('*')
      .eq('id', schoolIdStr)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn(`⚠️ School not found: ${schoolIdStr}`);
        return null;
      }
      console.error(`❌ Error loading school ${schoolIdStr}:`, error);
      return null;
    }

    if (!schoolData) {
      console.warn(`⚠️ School not found: ${schoolIdStr}`);
      return null;
    }

    // Get marketing assets for this school
    const assets = await getSchoolAssets(schoolIdStr);
    
    // Transform to API format
    const transformedData = transformDatabaseSchoolToAPI(schoolData as DatabaseSchool, assets);
    
    console.log(`✅ Loaded school data for ${schoolData.name} with ${transformedData.totalFiles} assets`);
    return transformedData;
  } catch (error) {
    console.error(`❌ Failed to load school data for ${schoolId}:`, error);
    return null;
  }
}

/**
 * Get all videos from all schools using database query
 * More efficient than loading all schools and filtering
 */
export async function getAllVideos(): Promise<ExtractedMediaFile[]> {
  try {
    console.log('🎥 Loading all videos from database...');
    
    const { data: videos, error } = await supabase
      .from('marketing_assets')
      .select('*')
      .eq('file_type', 'video')
      .order('original_name');

    if (error) {
      console.error('❌ Error loading videos:', error);
      return [];
    }

    const transformedVideos = (videos || []).map(transformDatabaseAssetToAPI);
    console.log(`✅ Loaded ${transformedVideos.length} videos`);
    
    return transformedVideos;
  } catch (error) {
    console.error('❌ Error getting all videos:', error);
    return [];
  }
}

/**
 * Get all images from all schools using database query
 * More efficient than loading all schools and filtering
 */
export async function getAllImages(): Promise<ExtractedMediaFile[]> {
  try {
    console.log('🖼️ Loading all images from database...');
    
    const { data: images, error } = await supabase
      .from('marketing_assets')
      .select('*')
      .eq('file_type', 'image')
      .order('original_name');

    if (error) {
      console.error('❌ Error loading images:', error);
      return [];
    }

    const transformedImages = (images || []).map(transformDatabaseAssetToAPI);
    console.log(`✅ Loaded ${transformedImages.length} images`);
    
    return transformedImages;
  } catch (error) {
    console.error('❌ Error getting all images:', error);
    return [];
  }
}

/**
 * Get videos for specific school using database query
 */
export async function getSchoolVideos(schoolId: SchoolId): Promise<ExtractedMediaFile[]> {
  try {
    const schoolIdStr = String(schoolId);
    
    const { data: videos, error } = await supabase
      .from('marketing_assets')
      .select('*')
      .eq('school_id', schoolIdStr)
      .eq('file_type', 'video')
      .order('original_name');

    if (error) {
      console.error(`❌ Error loading videos for school ${schoolIdStr}:`, error);
      return [];
    }

    return (videos || []).map(transformDatabaseAssetToAPI);
  } catch (error) {
    console.error(`❌ Error getting videos for school ${schoolId}:`, error);
    return [];
  }
}

/**
 * Get images for specific school using database query
 */
export async function getSchoolImages(schoolId: SchoolId): Promise<ExtractedMediaFile[]> {
  try {
    const schoolIdStr = String(schoolId);
    
    const { data: images, error } = await supabase
      .from('marketing_assets')
      .select('*')
      .eq('school_id', schoolIdStr)
      .eq('file_type', 'image')
      .order('original_name');

    if (error) {
      console.error(`❌ Error loading images for school ${schoolIdStr}:`, error);
      return [];
    }

    return (images || []).map(transformDatabaseAssetToAPI);
  } catch (error) {
    console.error(`❌ Error getting images for school ${schoolId}:`, error);
    return [];
  }
}

/**
 * Search schools by city or name using database query
 * More efficient than loading all schools and filtering in memory
 */
export async function searchSchools(query: string): Promise<ExtractedSchoolData[]> {
  try {
    const lowerQuery = query.toLowerCase();
    console.log(`🔍 Searching schools for: "${query}"`);
    
    // Use database text search for better performance
    const { data: schoolsData, error } = await supabase
      .from('schools_with_assets')
      .select('*')
      .or(`name.ilike.%${lowerQuery}%,city.ilike.%${lowerQuery}%,state.ilike.%${lowerQuery}%`)
      .order('name');

    if (error) {
      console.error('❌ Error searching schools:', error);
      return [];
    }

    if (!schoolsData || schoolsData.length === 0) {
      console.log(`ℹ️ No schools found matching "${query}"`);
      return [];
    }

    // Transform database records to API format
    const schools: ExtractedSchoolData[] = await Promise.all(
      schoolsData.map(async (school: DatabaseSchool) => {
        const assets = await getSchoolAssets(school.id);
        return transformDatabaseSchoolToAPI(school, assets);
      })
    );

    console.log(`✅ Found ${schools.length} schools matching "${query}"`);
    return schools;
  } catch (error) {
    console.error('❌ Error searching schools:', error);
    return [];
  }
}

/**
 * Helper function to get marketing assets for a school
 */
async function getSchoolAssets(schoolId: string): Promise<DatabaseMarketingAsset[]> {
  try {
    const { data: assets, error } = await supabase
      .from('marketing_assets')
      .select('*')
      .eq('school_id', schoolId)
      .order('original_name');

    if (error) {
      console.error(`❌ Error loading assets for school ${schoolId}:`, error);
      return [];
    }

    return assets || [];
  } catch (error) {
    console.error(`❌ Error getting assets for school ${schoolId}:`, error);
    return [];
  }
}

/**
 * Transform database school record to API format
 */
function transformDatabaseSchoolToAPI(
  school: DatabaseSchool, 
  assets: DatabaseMarketingAsset[]
): ExtractedSchoolData {
  // Separate assets by type
  const videos = assets.filter(asset => asset.file_type === 'video').map(transformDatabaseAssetToAPI);
  const images = assets.filter(asset => asset.file_type === 'image').map(transformDatabaseAssetToAPI);
  const documents = assets.filter(asset => asset.file_type === 'document').map(transformDatabaseAssetToAPI);

  return {
    id: school.id,
    name: school.name,
    city: school.city,
    state: school.state || '',
    type: school.type as 'alpha-school' | 'other-school',
    videos,
    images,
    documents,
    totalFiles: assets.length
  };
}

/**
 * Transform database marketing asset to API format
 */
function transformDatabaseAssetToAPI(asset: DatabaseMarketingAsset): ExtractedMediaFile {
  return {
    filename: asset.organized_name || asset.original_name,
    url: asset.local_path || asset.web_view_link || asset.download_url || '',
    fileType: asset.file_type as 'video' | 'image' | 'document',
    mimeType: asset.mime_type || '',
    fileSize: asset.file_size || undefined,
    // Note: dimensions, duration, title, description, tags not stored in database
    // Could be added to schema if needed for full compatibility
  };
}
