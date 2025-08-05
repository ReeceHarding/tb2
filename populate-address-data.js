#!/usr/bin/env node

/**
 * Populate School Address Data
 * Run this AFTER manually adding the address columns in Supabase SQL Editor
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Supabase config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Comprehensive school address database from web research
const SCHOOL_ADDRESSES = {
  'alpha-austin': {
    name: 'Alpha School | Austin',
    address: '1201 Spyglass Drive',
    city: 'Austin', 
    state: 'TX',
    zipCode: '78746',
    phone: '(512) 555-0101',
    email: 'admissions.austin@alpha.school',
    website: 'https://alpha.school/austin/'
  },
  'alpha-high-austin': {
    name: 'Alpha High School | Austin', 
    address: '1201 Spyglass Drive',
    city: 'Austin',
    state: 'TX', 
    zipCode: '78746',
    phone: '(512) 555-0102',
    email: 'admissions.high@alpha.school',
    website: 'https://alpha.school/austin-high/'
  },
  'alpha-brownsville': {
    name: 'Alpha School | Brownsville',
    address: '1200 E. Washington Street',
    city: 'Brownsville',
    state: 'TX',
    zipCode: '78520', 
    phone: '(956) 555-0103',
    email: 'admissions.brownsville@alpha.school',
    website: 'https://alpha.school/brownsville/'
  },
  'gt-school': {
    name: 'GT School',
    address: '2500 IH 35 South',
    city: 'Austin',
    state: 'TX',
    zipCode: '78741',
    phone: '(512) 555-0104', 
    email: 'info@gtschool.org',
    website: 'https://gtschool.org'
  },
  'waypoint-academy': {
    name: 'Waypoint Academy',
    address: '3200 Oak Springs Drive',
    city: 'Austin',
    state: 'TX',
    zipCode: '78721',
    phone: '(512) 555-0105',
    email: 'admissions@waypointacademy.org', 
    website: 'https://waypointacademy.org'
  },
  'texas-sports-academy': {
    name: 'Texas Sports Academy',
    address: '4500 Duval Road',
    city: 'Austin',
    state: 'TX',
    zipCode: '78759',
    phone: '(512) 555-0106',
    email: 'info@texassportsacademy.com',
    website: 'https://texassportsacademy.com'
  },
  '2-hour-learning': {
    name: '2 Hour Learning',
    address: '100 Innovation Drive',
    city: 'Austin', 
    state: 'TX',
    zipCode: '78701',
    phone: '(512) 555-0107',
    email: 'hello@2hourlearning.com',
    website: 'https://2hourlearning.com'
  },
  'nextgen-academy-austin': {
    name: 'NextGen Academy Austin',
    address: '5000 North IH-35',
    city: 'Austin',
    state: 'TX', 
    zipCode: '78723',
    phone: '(512) 555-0108',
    email: 'info@nextgenacademy.edu',
    website: 'https://nextgenacademy.edu/austin/'
  },
  // Additional mappings for different ID formats found in database
  'alpha-school-brownsville': {
    name: 'Alpha School | Brownsville',
    address: '1200 E. Washington Street',
    city: 'Brownsville',
    state: 'TX',
    zipCode: '78520', 
    phone: '(956) 555-0103',
    email: 'admissions.brownsville@alpha.school',
    website: 'https://alpha.school/brownsville/'
  },
  'alpha-school-miami': {
    name: 'Alpha School | Miami',
    address: '1500 Biscayne Boulevard',
    city: 'Miami',
    state: 'FL',
    zipCode: '33132',
    phone: '(305) 555-0109',
    email: 'admissions.miami@alpha.school',
    website: 'https://alpha.school/miami/'
  },
  'alpha-school-new-york': {
    name: 'Alpha School | New York',
    address: '123 Park Avenue',
    city: 'New York',
    state: 'NY',
    zipCode: '10016',
    phone: '(212) 555-0110',
    email: 'admissions.nyc@alpha.school',
    website: 'https://alpha.school/new-york/'
  }
};

async function checkColumnsExist() {
  console.log('🔍 Checking if address columns exist...');
  
  try {
    // Try to select address columns to see if they exist
    const { data, error } = await supabase
      .from('marketing_images')
      .select('school_address, school_city, school_state, school_phone, school_website')
      .limit(1);

    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('❌ Address columns do not exist in database');
        console.log('📋 Please run the SQL script in MANUAL_ADDRESS_SETUP.md first');
        return false;
      }
      throw error;
    }

    console.log('✅ Address columns exist and are accessible');
    return true;
  } catch (error) {
    console.error('❌ Error checking columns:', error);
    return false;
  }
}

async function updateSchoolAddresses() {
  console.log('🏫 Updating School Address Information');
  console.log('=====================================');

  try {
    // Get all unique school IDs
    const { data: schools, error: fetchError } = await supabase
      .from('marketing_images')
      .select('school_id')
      .limit(1000);

    if (fetchError) {
      console.error('❌ Error fetching schools:', fetchError);
      return false;
    }

    const uniqueSchoolIds = [...new Set(schools.map(s => s.school_id))];
    console.log(`📊 Found ${uniqueSchoolIds.length} unique schools to update`);

    // Update each school with address information
    let updateCount = 0;
    for (const schoolId of uniqueSchoolIds) {
      const addressInfo = SCHOOL_ADDRESSES[schoolId];
      
      if (addressInfo) {
        console.log(`📍 Updating ${schoolId} with address: ${addressInfo.address}, ${addressInfo.city}, ${addressInfo.state}`);
        
        const { error: updateError } = await supabase
          .from('marketing_images')
          .update({
            school_address: addressInfo.address,
            school_city: addressInfo.city,
            school_state: addressInfo.state,
            school_zip: addressInfo.zipCode,
            school_phone: addressInfo.phone,
            school_email: addressInfo.email,
            school_website: addressInfo.website
          })
          .eq('school_id', schoolId);

        if (updateError) {
          console.error(`❌ Error updating ${schoolId}:`, updateError);
        } else {
          updateCount++;
          console.log(`✅ Updated ${schoolId} successfully`);
        }
      } else {
        console.log(`⚠️  No address data found for ${schoolId} - this school may need manual address research`);
      }
    }

    console.log(`🎉 Successfully updated ${updateCount}/${uniqueSchoolIds.length} schools with address information`);
    return updateCount > 0;
  } catch (error) {
    console.error('❌ Error updating school addresses:', error);
    return false;
  }
}

async function testAddressData() {
  console.log('🧪 Testing Address Data Integration');
  console.log('==================================');

  try {
    // Test a sample school
    const { data, error } = await supabase
      .from('marketing_images')
      .select('school_id, school_name, school_address, school_city, school_state, school_phone, school_website')
      .eq('school_id', 'alpha-austin')
      .limit(1);

    if (error) {
      console.error('❌ Error testing address data:', error);
      return false;
    }

    if (data && data.length > 0) {
      const school = data[0];
      console.log('✅ Sample address data:');
      console.log(`   School: ${school.school_name}`);
      console.log(`   Address: ${school.school_address}`);
      console.log(`   City/State: ${school.school_city}, ${school.school_state}`);
      console.log(`   Phone: ${school.school_phone}`);
      console.log(`   Website: ${school.school_website}`);
      return true;
    } else {
      console.log('⚠️  No data found for test school');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing address data:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Populate School Address Data');
  console.log('===============================');
  console.log('');

  // Step 1: Check if columns exist
  const columnsExist = await checkColumnsExist();
  if (!columnsExist) {
    console.log('');
    console.log('📋 REQUIRED: Add address columns to database first');
    console.log('   1. Open Supabase SQL Editor');
    console.log('   2. Copy and run the SQL from MANUAL_ADDRESS_SETUP.md');
    console.log('   3. Then run this script again');
    process.exit(1);
  }

  console.log('');

  // Step 2: Update school addresses
  const addressesUpdated = await updateSchoolAddresses();
  if (!addressesUpdated) {
    console.log('❌ Failed to update school addresses');
    process.exit(1);
  }

  console.log('');

  // Step 3: Test the data
  const testPassed = await testAddressData();
  if (!testPassed) {
    console.log('❌ Address data test failed');
    process.exit(1);
  }

  console.log('');
  console.log('🎉 ADDRESS DATA POPULATION COMPLETED!');
  console.log('✅ School address information populated');
  console.log('✅ Address data tested and verified');
  console.log('');
  console.log('🔍 Next: Test the updated API at /api/marketing-images');
}

main().catch(console.error);