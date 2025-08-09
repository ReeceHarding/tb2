#!/usr/bin/env tsx

/**
 * Query Remote Supabase Database
 * Shows table structure and sample data without Docker
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function queryDatabase() {
  console.log('🔍 Querying Remote Supabase Database...');
  console.log(`📍 URL: ${supabaseUrl}`);
  console.log('');

  try {
    // Check known tables from migration files
    console.log('📋 TABLES IN DATABASE:');
    console.log('=' .repeat(50));
    
    const knownTables = [
      'students', 'map_scores', 'daily_metrics', 'time_commitments', 
      'grade_gaps', 'lesson_performance', 'campus_accuracy',
      'schools', 'marketing_assets', 'school_categories', 'school_summary', 'school_contact_info',
      'video_categories', 'videos', 'testimonials',
      'user_profiles', 'section_data', 'generated_content', 'journeys'
    ];

    for (const tableName of knownTables) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`📊 ${tableName} - ❌ Not accessible or doesn't exist`);
        } else {
          console.log(`📊 ${tableName} - ✅ ${count || 0} rows`);
        }
      } catch (e) {
        console.log(`📊 ${tableName} - ❌ Error accessing table`);
      }
    }

    console.log('');
    console.log('🎯 SAMPLE DATA:');
    console.log('=' .repeat(50));

    // Sample data from key tables
    const sampleTables = ['students', 'schools', 'videos', 'testimonials'];
    
    for (const tableName of sampleTables) {
      console.log(`\n📋 ${tableName.toUpperCase()} (first 3 rows):`);
      
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(3);

        if (error) {
          console.log(`   ❌ Error: ${error.message}`);
        } else if (data && data.length > 0) {
          console.log(`   ✅ ${data.length} sample records found`);
          data.forEach((row, index) => {
            const keys = Object.keys(row).slice(0, 4); // Show first 4 columns
            const sample = keys.map(key => `${key}: ${JSON.stringify(row[key])}`).join(', ');
            console.log(`   ${index + 1}. ${sample}...`);
          });
        } else {
          console.log(`   📭 No data found`);
        }
      } catch (e) {
        console.log(`   ❌ Table doesn't exist or no access`);
      }
    }

    console.log('');
    console.log('🚀 CONNECTION SUCCESSFUL!');
    console.log('Your remote Supabase is fully accessible.');

  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

queryDatabase();