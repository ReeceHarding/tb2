const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

console.log('🔗 Connecting to Supabase...');
console.log('⏰ Timestamp:', new Date().toISOString());

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeTestimonials() {
  console.log('\n🔍 Analyzing existing testimonials...');
  
  try {
    const { data: testimonials, error } = await supabase
      .from('testimonials')
      .select('id, title, student_name, video_url')
      .order('title');
    
    if (error) {
      console.error('❌ Error fetching testimonials:', error.message);
      return [];
    }
    
    console.log(`📊 Found ${testimonials.length} testimonials in database:`);
    testimonials.forEach((testimonial, index) => {
      console.log(`${index + 1}. ${testimonial.title} (${testimonial.student_name || 'Unknown'}) - ${testimonial.video_url.split('/').pop()}`);
    });
    
    // Group by video URL to find duplicates
    const groupedByVideo = {};
    testimonials.forEach(testimonial => {
      const videoFile = testimonial.video_url.split('/').pop();
      if (!groupedByVideo[videoFile]) {
        groupedByVideo[videoFile] = [];
      }
      groupedByVideo[videoFile].push(testimonial);
    });
    
    console.log('\n🔍 Duplicate analysis:');
    const duplicates = [];
    for (const [videoFile, testimonialList] of Object.entries(groupedByVideo)) {
      if (testimonialList.length > 1) {
        console.log(`🚨 DUPLICATE: ${videoFile} has ${testimonialList.length} entries:`);
        testimonialList.forEach((t, idx) => {
          console.log(`   ${idx + 1}. ${t.title} (ID: ${t.id})`);
        });
        duplicates.push({ videoFile, testimonials: testimonialList });
      }
    }
    
    return duplicates;
    
  } catch (error) {
    console.error('❌ Error analyzing testimonials:', error.message);
    return [];
  }
}

async function removeDuplicates(duplicates) {
  console.log('\n🧹 Removing duplicate testimonials...');
  
  const toDelete = [];
  
  for (const duplicate of duplicates) {
    const { videoFile, testimonials } = duplicate;
    console.log(`\n📹 Processing duplicates for ${videoFile}:`);
    
    // Sort testimonials to keep the better ones
    testimonials.sort((a, b) => {
      // Prefer titles with student names and more descriptive content
      const scoreA = (a.title.includes(':') ? 2 : 0) + (a.title.length > 20 ? 1 : 0);
      const scoreB = (b.title.includes(':') ? 2 : 0) + (b.title.length > 20 ? 1 : 0);
      return scoreB - scoreA; // Higher score first
    });
    
    console.log(`✅ KEEPING: ${testimonials[0].title} (ID: ${testimonials[0].id})`);
    
    // Mark the rest for deletion
    for (let i = 1; i < testimonials.length; i++) {
      console.log(`❌ DELETING: ${testimonials[i].title} (ID: ${testimonials[i].id})`);
      toDelete.push(testimonials[i].id);
    }
  }
  
  if (toDelete.length === 0) {
    console.log('✅ No duplicates found to delete');
    return;
  }
  
  console.log(`\n🗑️ Deleting ${toDelete.length} duplicate testimonials...`);
  
  try {
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .in('id', toDelete);
    
    if (error) {
      console.error('❌ Error deleting duplicates:', error.message);
      return false;
    }
    
    console.log(`✅ Successfully deleted ${toDelete.length} duplicate testimonials`);
    return true;
    
  } catch (error) {
    console.error('❌ Error during deletion:', error.message);
    return false;
  }
}

async function verifyCleanup() {
  console.log('\n✅ Verifying cleanup...');
  
  const duplicates = await analyzeTestimonials();
  
  if (duplicates.length === 0) {
    console.log('🎉 SUCCESS: No more duplicates found!');
  } else {
    console.log('⚠️ WARNING: Still found duplicates after cleanup');
  }
}

async function main() {
  console.log('🚀 Starting duplicate testimonials cleanup script...');
  
  // Step 1: Analyze current testimonials
  const duplicates = await analyzeTestimonials();
  
  if (duplicates.length === 0) {
    console.log('\n✅ No duplicates found. Database is clean!');
    return;
  }
  
  // Step 2: Remove duplicates
  const success = await removeDuplicates(duplicates);
  
  if (success) {
    // Step 3: Verify cleanup
    await verifyCleanup();
  }
  
  console.log('\n🎯 Script completed!');
}

main().catch(console.error);