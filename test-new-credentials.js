const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testCredentials() {
  console.log('\n🔍 TESTING NEW SUPABASE CREDENTIALS...\n');
  
  // Test environment variables are loaded
  console.log('1. Environment Variables:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Found' : '❌ Missing');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Found' : '❌ Missing');
  console.log('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Found' : '❌ Missing');
  
  // Test basic connection
  console.log('\n2. Testing Supabase Connection:');
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Simple query to test connection
    const { data, error } = await supabase
      .from('videos')
      .select('count')
      .limit(1);
      
    if (error) {
      console.log('   Connection test: ❌ Failed -', error.message);
    } else {
      console.log('   Connection test: ✅ Success - New credentials work!');
    }
  } catch (err) {
    console.log('   Connection test: ❌ Error -', err.message);
  }
  
  console.log('\n✅ Credential test complete!\n');
}

testCredentials();
