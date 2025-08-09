#!/usr/bin/env tsx

/**
 * Check Existing Table Schemas
 * Inspect the actual column names and structure of existing tables
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableSchemas() {
  console.log('🔍 CHECKING EXISTING TABLE SCHEMAS');
  console.log('═'.repeat(80));

  const tablesToCheck = ['user_profiles', 'section_data', 'generated_content', 'journeys'];

  for (const tableName of tablesToCheck) {
    console.log(`\n📋 TABLE: ${tableName.toUpperCase()}`);
    console.log('-'.repeat(50));

    try {
      // Try to describe the table structure by querying information_schema
      const { data, error } = await supabase.rpc('get_table_info', {
        table_name: tableName,
        schema_name: 'public'
      });

      if (error) {
        // If RPC doesn't exist, try a different approach
        console.log('   Trying alternative method...');
        
        // Get a sample row to see the actual column structure
        const { data: sampleData, error: sampleError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (sampleError) {
          console.log(`   ❌ Error accessing table: ${sampleError.message}`);
        } else {
          if (sampleData && sampleData.length > 0) {
            console.log('   ✅ Actual columns in table:');
            Object.keys(sampleData[0]).forEach(column => {
              console.log(`      - ${column}: ${typeof sampleData[0][column]}`);
            });
          } else {
            console.log('   📭 Table exists but is empty - trying to insert test data to see schema...');
            
            // Try a simple select to see what columns exist
            const { error: selectError } = await supabase
              .from(tableName)
              .select('*')
              .limit(0);
              
            if (selectError) {
              console.log(`   ❌ Select error: ${selectError.message}`);
            } else {
              console.log('   ✅ Table exists and is accessible (but empty)');
            }
          }
        }
      } else {
        console.log('   ✅ Table info retrieved:', data);
      }

    } catch (err) {
      console.log(`   ❌ Error checking table: ${err}`);
    }
  }

  // Also check what columns are actually being used in the code vs what exists
  console.log('\n🔧 EXPECTED vs ACTUAL COLUMN MAPPING:');
  console.log('-'.repeat(50));
  console.log('The code expects these column mappings:');
  console.log('  Interface → Database Column');
  console.log('  userId → user_email');
  console.log('  sectionType → sectionId');
  console.log('  createdAt → created_at');
  console.log('  updatedAt → updated_at');
  console.log('  firstName → first_name');
  console.log('  lastName → last_name');
  console.log('  sharedUrl → shareId');
  console.log('  isPublic → metadata.isPublic');
}

checkTableSchemas();