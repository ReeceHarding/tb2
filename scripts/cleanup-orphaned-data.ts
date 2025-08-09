#!/usr/bin/env tsx

/**
 * Cleanup Orphaned Data
 * Removes invalid journey entries with UUID email addresses
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupOrphanedData() {
  console.log('🧹 CLEANING UP ORPHANED DATA');
  console.log('═'.repeat(50));

  try {
    // First, check what orphaned data exists
    console.log('\n🔍 Checking for orphaned journeys...');
    const { data: allJourneys, error: fetchError } = await supabase
      .from('journeys')
      .select('*');

    if (fetchError) {
      console.log('❌ Error fetching journeys:', fetchError.message);
      return;
    }

    console.log(`📊 Total journeys found: ${allJourneys?.length || 0}`);

    // Identify journeys with UUID email addresses (invalid)
    const orphanedJourneys = allJourneys?.filter(journey => {
      // Check if user_email looks like a UUID (36 chars with dashes)
      const emailPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return emailPattern.test(journey.user_email);
    }) || [];

    console.log(`🚨 Orphaned journeys with UUID emails: ${orphanedJourneys.length}`);
    
    if (orphanedJourneys.length > 0) {
      orphanedJourneys.forEach(journey => {
        console.log(`   - ${journey.user_email} | ${journey.title} | ${new Date(journey.created_at).toLocaleDateString()}`);
      });

      // Delete orphaned journeys
      console.log('\n🗑️  Deleting orphaned journeys...');
      for (const journey of orphanedJourneys) {
        const { error: deleteError } = await supabase
          .from('journeys')
          .delete()
          .eq('id', journey.id);

        if (deleteError) {
          console.log(`❌ Error deleting journey ${journey.id}:`, deleteError.message);
        } else {
          console.log(`✅ Deleted orphaned journey: ${journey.user_email}`);
        }
      }
    }

    // Verify final state
    console.log('\n📊 Final verification...');
    const { data: finalJourneys } = await supabase.from('journeys').select('*');
    console.log(`✅ Remaining journeys: ${finalJourneys?.length || 0}`);

    if (finalJourneys && finalJourneys.length > 0) {
      console.log('Valid journeys:');
      finalJourneys.forEach(journey => {
        console.log(`   - ${journey.user_email} | ${journey.title}`);
      });
    }

    console.log('\n🎉 Cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

cleanupOrphanedData();