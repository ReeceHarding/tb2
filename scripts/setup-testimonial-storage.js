const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🗄️ Setting up Supabase Storage for Alpha Testimonials...\n');

async function setupTestimonialStorage() {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required Supabase environment variables');
    }

    console.log('🔧 Connecting to Supabase...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create testimonials bucket if it doesn't exist
    console.log('📁 Creating testimonials storage bucket...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`);
    }

    const testimonialsBucketExists = buckets.some(bucket => bucket.name === 'testimonials');

    if (!testimonialsBucketExists) {
      const { data: bucket, error: createError } = await supabase.storage.createBucket('testimonials', {
        public: true,
        allowedMimeTypes: ['video/mp4', 'video/webm', 'video/ogg', 'image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 1024 * 1024 * 100 // 100MB limit per file
      });

      if (createError) {
        throw new Error(`Failed to create testimonials bucket: ${createError.message}`);
      }

      console.log('✅ Created testimonials bucket successfully');
    } else {
      console.log('ℹ️  Testimonials bucket already exists');
    }

    // Create folder structure in the bucket
    console.log('🗂️  Setting up folder structure...');
    
    const folders = [
      'videos/',
      'thumbnails/',
      'temp/'
    ];

    for (const folder of folders) {
      // Create a placeholder file to establish the folder structure
      const placeholderContent = `# ${folder.replace('/', '')} folder\nThis folder contains ${folder.replace('/', '')} for testimonials.`;
      
      const { error: uploadError } = await supabase.storage
        .from('testimonials')
        .upload(`${folder}.gitkeep`, placeholderContent, {
          contentType: 'text/plain',
          upsert: true
        });

      if (uploadError) {
        console.warn(`⚠️  Could not create ${folder} folder: ${uploadError.message}`);
      } else {
        console.log(`✅ Created ${folder} folder`);
      }
    }

    // Set up storage policies for public access
    console.log('🔒 Setting up storage policies...');
    
    // Note: Storage policies need to be set up in the Supabase dashboard or via SQL
    console.log('ℹ️  Storage policies for public read access need to be configured in Supabase dashboard');
    console.log('   Navigate to: Storage > Policies > testimonials bucket');
    console.log('   Add policy: SELECT for public access');

    console.log('\n🎉 Testimonial storage setup complete!');
    console.log('📊 Summary:');
    console.log('   • Bucket: testimonials (public)');
    console.log('   • Folders: videos/, thumbnails/, temp/');
    console.log('   • Max file size: 100MB');
    console.log('   • Allowed types: video/mp4, video/webm, video/ogg, image/jpeg, image/png, image/webp');

    return { success: true };

  } catch (error) {
    console.error('❌ Storage setup failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  setupTestimonialStorage()
    .then(() => {
      console.log('\n✅ Storage setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Storage setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupTestimonialStorage };