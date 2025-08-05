#!/usr/bin/env node

/**
 * Add Address Columns to Marketing Images Table
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase config
// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addAddressColumns() {
  console.log('🔧 Adding Address Columns to Marketing Images Table');
  console.log('=================================================');

  try {
    // Add address columns using SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add address columns to marketing_images table
        ALTER TABLE marketing_images 
        ADD COLUMN IF NOT EXISTS school_address TEXT,
        ADD COLUMN IF NOT EXISTS school_city TEXT,
        ADD COLUMN IF NOT EXISTS school_state TEXT,
        ADD COLUMN IF NOT EXISTS school_zip TEXT,
        ADD COLUMN IF NOT EXISTS school_phone TEXT,
        ADD COLUMN IF NOT EXISTS school_email TEXT,
        ADD COLUMN IF NOT EXISTS school_website TEXT;

        -- Create index for address-based queries
        CREATE INDEX IF NOT EXISTS idx_marketing_images_location 
        ON marketing_images(school_city, school_state);

        -- Create index for state-based filtering
        CREATE INDEX IF NOT EXISTS idx_marketing_images_state 
        ON marketing_images(school_state);
      `
    });

    if (error) {
      console.error('❌ Error adding columns:', error);
      
      // Try alternative approach using individual queries
      console.log('🔄 Trying alternative approach...');
      
      const addColumnQueries = [
        'ALTER TABLE marketing_images ADD COLUMN IF NOT EXISTS school_address TEXT',
        'ALTER TABLE marketing_images ADD COLUMN IF NOT EXISTS school_city TEXT', 
        'ALTER TABLE marketing_images ADD COLUMN IF NOT EXISTS school_state TEXT',
        'ALTER TABLE marketing_images ADD COLUMN IF NOT EXISTS school_zip TEXT',
        'ALTER TABLE marketing_images ADD COLUMN IF NOT EXISTS school_phone TEXT',
        'ALTER TABLE marketing_images ADD COLUMN IF NOT EXISTS school_email TEXT',
        'ALTER TABLE marketing_images ADD COLUMN IF NOT EXISTS school_website TEXT'
      ];

      for (const query of addColumnQueries) {
        try {
          await supabase.rpc('exec_sql', { sql: query });
          console.log(`✅ Executed: ${query}`);
        } catch (err) {
          console.log(`⚠️ Skipped (likely exists): ${query}`);
        }
      }
    } else {
      console.log('✅ Successfully added address columns');
    }

    // Verify columns were added by querying the table structure
    console.log('\n🔍 Verifying column additions...');
    
    const { data: testData, error: testError } = await supabase
      .from('marketing_images')
      .select('school_id, school_name, school_address, school_city, school_state')
      .limit(1);

    if (testError) {
      console.error('❌ Error verifying columns:', testError);
    } else {
      console.log('✅ Address columns verified and accessible');
      console.log('📊 Sample row structure:', Object.keys(testData[0] || {}));
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the column addition
addAddressColumns().catch(console.error);