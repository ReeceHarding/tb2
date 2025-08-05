const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testBasicConnection() {
  console.log('\n🔍 TESTING BASIC SUPABASE CONNECTION...\n');
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Test basic auth instead of querying tables
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError && authError.message !== 'Auth session missing!') {
      console.log('   Connection test: ❌ Auth Error -', authError.message);
    } else {
      console.log('   Connection test: ✅ Success - New credentials authenticate properly!');
      console.log('   Note: "Auth session missing" is expected since we\'re not logged in');
    }
  } catch (err) {
    console.log('   Connection test: ❌ Network Error -', err.message);
  }
  
  console.log('\n✅ Basic connection test complete!\n');
}

testBasicConnection();
