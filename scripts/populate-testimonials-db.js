const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

console.log('🔗 Connecting to Supabase...');
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTablesExist() {
  console.log('\n📋 Checking existing database tables...');
  
  try {
    // Check if testimonials table exists
    const { data: testimonialsTest, error: testimonialsError } = await supabase
      .from('testimonials')
      .select('*')
      .limit(1);
    
    if (testimonialsError) {
      console.log('❌ Testimonials table does not exist:', testimonialsError.message);
      return false;
    } else {
      console.log('✅ Testimonials table exists');
      return true;
    }
  } catch (error) {
    console.log('❌ Error checking tables:', error.message);
    return false;
  }
}

async function createTestimonialsTable() {
  console.log('\n🛠️ Creating testimonials table...');
  
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS testimonials (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      student_name TEXT,
      student_age INTEGER,
      student_grade TEXT,
      video_url TEXT NOT NULL,
      thumbnail_url TEXT,
      local_video_path TEXT,
      transcription TEXT NOT NULL,
      marketing_copy JSONB,
      duration_seconds INTEGER,
      file_size_bytes BIGINT,
      video_width INTEGER,
      video_height INTEGER,
      tags TEXT[] DEFAULT '{}',
      featured BOOLEAN DEFAULT false,
      display_order INTEGER DEFAULT 0,
      view_count INTEGER DEFAULT 0,
      last_viewed_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add indexes for faster querying
    CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(featured);
    CREATE INDEX IF NOT EXISTS idx_testimonials_display_order ON testimonials(display_order);
    CREATE INDEX IF NOT EXISTS idx_testimonials_view_count ON testimonials(view_count DESC);
    
    -- Enable Row Level Security (RLS)
    ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
    
    -- Create policies for testimonials table
    DROP POLICY IF EXISTS "Public can view testimonials" ON testimonials;
    CREATE POLICY "Public can view testimonials" ON testimonials
      FOR SELECT USING (true);
  `;
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: createTableSQL 
    });
    
    if (error) {
      console.log('❌ Error creating table via RPC:', error.message);
      // Try alternative approach - this might work depending on permissions
      return false;
    } else {
      console.log('✅ Testimonials table created successfully');
      return true;
    }
  } catch (error) {
    console.log('❌ Error creating testimonials table:', error.message);
    return false;
  }
}

async function loadTestimonialData() {
  console.log('\n📂 Loading testimonial data from files...');
  
  const consolidatedPath = path.join(process.cwd(), 'data/testimonial-copy/_consolidated_testimonials.json');
  
  if (!fs.existsSync(consolidatedPath)) {
    console.log('❌ Consolidated testimonials file not found');
    return [];
  }
  
  try {
    const rawData = fs.readFileSync(consolidatedPath, 'utf8');
    const testimonialData = JSON.parse(rawData);
    console.log(`📄 Loaded ${Object.keys(testimonialData).length} testimonial entries`);
    return testimonialData;
  } catch (error) {
    console.log('❌ Error loading testimonial data:', error.message);
    return {};
  }
}

async function getUploadedVideoUrls() {
  console.log('\n🎥 Fetching uploaded video URLs from Supabase Storage...');
  
  try {
    const { data: files, error } = await supabase.storage
      .from('testimonials')
      .list('videos');
      
    if (error) {
      console.log('❌ Error fetching video files:', error.message);
      return {};
    }
    
    const videoUrls = {};
    for (const file of files) {
      if (file.name.endsWith('.mp4')) {
        const { data: urlData } = supabase.storage
          .from('testimonials')
          .getPublicUrl(`videos/${file.name}`);
        videoUrls[file.name] = urlData.publicUrl;
      }
    }
    
    console.log(`📹 Found ${Object.keys(videoUrls).length} uploaded videos`);
    return videoUrls;
  } catch (error) {
    console.log('❌ Error getting video URLs:', error.message);
    return {};
  }
}

async function populateTestimonials() {
  console.log('\n💾 Populating testimonials table...');
  
  const testimonialData = await loadTestimonialData();
  const videoUrls = await getUploadedVideoUrls();
  
  if (Object.keys(testimonialData).length === 0) {
    console.log('❌ No testimonial data to populate');
    return;
  }
  
  const testimonialsToInsert = [];
  let displayOrder = 1;
  
  for (const [filename, data] of Object.entries(testimonialData)) {
    const videoFileName = filename.replace(/\.[^/.]+$/, '') + '.mp4';
    const videoUrl = videoUrls[videoFileName];
    
    if (!videoUrl) {
      console.log(`⚠️ No video URL found for ${filename}, skipping...`);
      continue;
    }
    
    const testimonial = {
      title: data.title || `Student Testimonial - ${data.student_name || 'Anonymous'}`,
      description: data.description || data.summary || '',
      student_name: data.student_name || null,
      student_age: data.student_age || null,
      student_grade: data.student_grade || null,
      video_url: videoUrl,
      thumbnail_url: null, // Will be generated later
      local_video_path: `public/videos/testimonials/${videoFileName}`,
      transcription: data.transcription || data.transcript || '',
      marketing_copy: data.marketing_copy || null,
      duration_seconds: data.duration_seconds || null,
      file_size_bytes: data.file_size_bytes || null,
      video_width: data.video_width || null,
      video_height: data.video_height || null,
      tags: data.tags || [],
      featured: displayOrder <= 3, // First 3 are featured
      display_order: displayOrder,
      view_count: 0
    };
    
    testimonialsToInsert.push(testimonial);
    displayOrder++;
  }
  
  console.log(`📝 Prepared ${testimonialsToInsert.length} testimonials for insertion`);
  
  if (testimonialsToInsert.length === 0) {
    console.log('❌ No valid testimonials to insert');
    return;
  }
  
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .insert(testimonialsToInsert);
    
    if (error) {
      console.log('❌ Error inserting testimonials:', error.message);
      console.log('Error details:', error);
    } else {
      console.log(`✅ Successfully inserted ${testimonialsToInsert.length} testimonials`);
    }
  } catch (error) {
    console.log('❌ Error inserting testimonials:', error.message);
  }
}

async function queryExistingTestimonials() {
  console.log('\n🔍 Querying existing testimonials...');
  
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('display_order');
    
    if (error) {
      console.log('❌ Error querying testimonials:', error.message);
      return;
    }
    
    console.log(`📊 Found ${data.length} existing testimonials in database:`);
    data.forEach((testimonial, index) => {
      console.log(`${index + 1}. ${testimonial.title} (${testimonial.student_name || 'Anonymous'}) - Featured: ${testimonial.featured}`);
    });
    
    return data;
  } catch (error) {
    console.log('❌ Error querying testimonials:', error.message);
    return [];
  }
}

async function main() {
  console.log('🚀 Starting testimonials database population script...');
  console.log('⏰ Timestamp:', new Date().toISOString());
  
  // Check if tables exist
  const tablesExist = await checkTablesExist();
  
  if (!tablesExist) {
    console.log('\n⚠️ Testimonials table does not exist. This is expected if it hasn\'t been created yet.');
    console.log('📋 The table will be created when we deploy the migration to production.');
  }
  
  // Query existing testimonials regardless
  const existing = await queryExistingTestimonials();
  
  if (existing && existing.length > 0) {
    console.log('\n✅ Testimonials already exist in database. Skipping population.');
  } else {
    console.log('\n📝 No existing testimonials found. Would populate if table exists.');
    // Only populate if table exists and is empty
    if (tablesExist) {
      await populateTestimonials();
    }
  }
  
  console.log('\n🎯 Script completed successfully!');
}

main().catch(console.error);