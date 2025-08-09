#!/usr/bin/env tsx

/**
 * Debug Personalized Page Data
 * Pulls all relevant data from remote Supabase for debugging /personalized page issues
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugPersonalizedPageData() {
  console.log('🔍 DEBUGGING PERSONALIZED PAGE DATA');
  console.log('═'.repeat(80));
  console.log(`📍 Remote Database: ${supabaseUrl}`);
  console.log('');

  try {
    // 1. Check User Profiles Table
    console.log('👤 USER PROFILES:');
    console.log('-'.repeat(50));
    
    const { data: userProfiles, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (userError) {
      console.log(`   ❌ Error: ${userError.message}`);
    } else {
      console.log(`   ✅ Found ${userProfiles?.length || 0} user profiles`);
      userProfiles?.forEach((user, index) => {
        console.log(`   ${index + 1}. Email: ${user.email}`);
        console.log(`       Name: ${user.first_name || 'N/A'} ${user.last_name || 'N/A'}`);
        console.log(`       ID: ${user.id}`);
        console.log(`       Created: ${new Date(user.created_at).toLocaleString()}`);
        console.log(`       Metadata: ${JSON.stringify(user.metadata || {}, null, 2)}`);
        console.log('');
      });
    }

    // 2. Check Section Data Table
    console.log('📋 SECTION DATA (Quiz Responses):');
    console.log('-'.repeat(50));
    
    const { data: sectionData, error: sectionError } = await supabase
      .from('section_data')
      .select('*')
      .order('updated_at', { ascending: false });

    if (sectionError) {
      console.log(`   ❌ Error: ${sectionError.message}`);
    } else {
      console.log(`   ✅ Found ${sectionData?.length || 0} section data entries`);
      sectionData?.forEach((section, index) => {
        console.log(`   ${index + 1}. User: ${section.user_email}`);
        console.log(`       Section: ${section.sectionId}`);
        console.log(`       Data: ${JSON.stringify(section.data, null, 2)}`);
        console.log(`       Updated: ${new Date(section.updated_at).toLocaleString()}`);
        console.log('');
      });
    }

    // 3. Check Generated Content Table
    console.log('🤖 GENERATED CONTENT (AI Responses):');
    console.log('-'.repeat(50));
    
    const { data: generatedContent, error: contentError } = await supabase
      .from('generated_content')
      .select('*')
      .order('created_at', { ascending: false });

    if (contentError) {
      console.log(`   ❌ Error: ${contentError.message}`);
    } else {
      console.log(`   ✅ Found ${generatedContent?.length || 0} generated content entries`);
      generatedContent?.forEach((content, index) => {
        console.log(`   ${index + 1}. User: ${content.user_email}`);
        console.log(`       Section: ${content.sectionId}`);
        console.log(`       Content Preview: ${JSON.stringify(content.content).substring(0, 200)}...`);
        console.log(`       Metadata: ${JSON.stringify(content.metadata || {}, null, 2)}`);
        console.log(`       Created: ${new Date(content.created_at).toLocaleString()}`);
        console.log('');
      });
    }

    // 4. Check Journeys Table
    console.log('🗺️  USER JOURNEYS:');
    console.log('-'.repeat(50));
    
    const { data: journeys, error: journeyError } = await supabase
      .from('journeys')
      .select('*')
      .order('created_at', { ascending: false });

    if (journeyError) {
      console.log(`   ❌ Error: ${journeyError.message}`);
    } else {
      console.log(`   ✅ Found ${journeys?.length || 0} user journeys`);
      journeys?.forEach((journey, index) => {
        console.log(`   ${index + 1}. User: ${journey.user_email}`);
        console.log(`       Title: ${journey.title}`);
        console.log(`       Sections: ${JSON.stringify(journey.sections || [])}`);
        console.log(`       Share ID: ${journey.shareId || 'N/A'}`);
        console.log(`       Public: ${journey.metadata?.isPublic || false}`);
        console.log(`       Created: ${new Date(journey.created_at).toLocaleString()}`);
        console.log('');
      });
    }

    // 5. Cross-Reference Data by User
    console.log('🔗 USER DATA RELATIONSHIPS:');
    console.log('-'.repeat(50));
    
    if (userProfiles && userProfiles.length > 0) {
      for (const user of userProfiles) {
        console.log(`\n👤 User: ${user.email} (ID: ${user.id})`);
        
        // Find their section data
        const userSections = sectionData?.filter(s => s.user_email === user.email) || [];
        console.log(`   📋 Section Data: ${userSections.length} entries`);
        userSections.forEach(section => {
          console.log(`      - ${section.sectionId}: ${Object.keys(section.data || {}).join(', ')}`);
        });
        
        // Find their generated content
        const userContent = generatedContent?.filter(c => c.user_email === user.email) || [];
        console.log(`   🤖 Generated Content: ${userContent.length} entries`);
        userContent.forEach(content => {
          console.log(`      - ${content.sectionId} (${new Date(content.created_at).toLocaleDateString()})`);
        });
        
        // Find their journeys
        const userJourneys = journeys?.filter(j => j.user_email === user.email) || [];
        console.log(`   🗺️  Journeys: ${userJourneys.length} entries`);
        userJourneys.forEach(journey => {
          console.log(`      - "${journey.title}" (${journey.sections?.length || 0} sections)`);
        });
      }
    }

    // 6. Check table schemas for debugging
    console.log('\n🔧 DEBUGGING INFO:');
    console.log('-'.repeat(50));
    
    console.log('Expected table structure for /personalized page:');
    console.log('  user_profiles: email, first_name, last_name, metadata');
    console.log('  section_data: user_email, sectionId, data');
    console.log('  generated_content: user_email, sectionId, content, metadata');
    console.log('  journeys: user_email, title, sections, shareId, metadata');
    
    // 7. Identify potential issues
    console.log('\n🚨 POTENTIAL ISSUES:');
    console.log('-'.repeat(50));
    
    const issues = [];
    
    if (!userProfiles || userProfiles.length === 0) {
      issues.push('No user profiles found - users may not be getting created properly');
    }
    
    if (userProfiles && userProfiles.length > 0 && (!sectionData || sectionData.length === 0)) {
      issues.push('Users exist but no section data - quiz data may not be saving');
    }
    
    if (userProfiles && sectionData && sectionData.length > 0 && (!generatedContent || generatedContent.length === 0)) {
      issues.push('Section data exists but no generated content - AI generation may be failing');
    }
    
    if (userProfiles && userProfiles.length > 0 && (!journeys || journeys.length === 0)) {
      issues.push('Users exist but no journeys - journey creation may be failing');
    }
    
    if (issues.length === 0) {
      console.log('   ✅ No obvious data issues detected');
    } else {
      issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ⚠️  ${issue}`);
      });
    }

    console.log('\n🚀 DEBUG COMPLETE!');
    console.log('Check the data above to identify issues with the /personalized page.');

  } catch (error) {
    console.error('❌ Error during debugging:', error);
  }
}

debugPersonalizedPageData();