#!/usr/bin/env npx tsx

/**
 * Verify Supabase Tables
 * 
 * This script checks if all required tables for the Progressive AI Content System
 * have been created in Supabase.
 * 
 * Usage: npx tsx scripts/verify-supabase-tables.ts
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const requiredTables = [
  'user_profiles',
  'section_data',
  'generated_content',
  'journeys'
];

async function verifyTables() {
  console.log('🔍 Verifying Supabase tables...\n');

  const results: { table: string; exists: boolean; error?: string }[] = [];

  for (const tableName of requiredTables) {
    try {
      // Try to query the table (limit 1 to be efficient)
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        // Check if error is because table doesn't exist
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          results.push({ table: tableName, exists: false });
        } else {
          results.push({ table: tableName, exists: true, error: error.message });
        }
      } else {
        results.push({ table: tableName, exists: true });
      }
    } catch (err) {
      results.push({ table: tableName, exists: false, error: String(err) });
    }
  }

  // Display results
  console.log('📊 Table Verification Results:\n');
  
  let allTablesExist = true;
  
  results.forEach(result => {
    if (result.exists && !result.error) {
      console.log(`✅ ${result.table} - EXISTS`);
    } else if (result.exists && result.error) {
      console.log(`⚠️  ${result.table} - EXISTS but query error: ${result.error}`);
    } else {
      console.log(`❌ ${result.table} - MISSING`);
      allTablesExist = false;
    }
  });

  console.log('\n' + '='.repeat(50) + '\n');

  if (allTablesExist) {
    console.log('✅ All required tables exist in Supabase!');
    console.log('\nThe Progressive AI Content System is ready to use.');
  } else {
    console.log('❌ Some tables are missing!');
    console.log('\nTo create the missing tables:');
    console.log('1. Copy the contents of scripts/create-supabase-tables.sql');
    console.log('2. Go to your Supabase dashboard');
    console.log('3. Navigate to SQL Editor');
    console.log('4. Paste and run the SQL script');
    console.log('\nAlternatively, you can run the script using Supabase CLI:');
    console.log('supabase db reset && supabase db push scripts/create-supabase-tables.sql');
  }

  // Test data operations if all tables exist
  if (allTablesExist) {
    console.log('\n📝 Testing data operations...\n');
    
    try {
      // Test user profile creation
      const testEmail = `test-${Date.now()}@example.com`;
      
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          email: testEmail,
          name: 'Test User',
          selected_grade: '3rd Grade'
        })
        .select()
        .single();

      if (profileError) {
        console.log(`❌ User profile creation failed: ${profileError.message}`);
      } else {
        console.log('✅ User profile creation successful');
        
        // Clean up test data
        const { error: deleteError } = await supabase
          .from('user_profiles')
          .delete()
          .eq('email', testEmail);
          
        if (!deleteError) {
          console.log('✅ Test data cleanup successful');
        }
      }
    } catch (err) {
      console.log(`❌ Data operation test failed: ${String(err)}`);
    }
  }
}

// Run verification
verifyTables().catch(console.error);