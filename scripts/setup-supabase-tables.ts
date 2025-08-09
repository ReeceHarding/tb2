#!/usr/bin/env npx tsx

/**
 * Automated Supabase Tables Setup
 * 
 * This script automatically creates all required tables for the Progressive AI Content System
 * using the Supabase Admin API.
 * 
 * Usage: npx tsx scripts/setup-supabase-tables.ts
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupTables() {
  console.log('🚀 Setting up Supabase tables for Progressive AI Content System...\n');

  try {
    // Read the SQL script
    const sqlPath = path.join(process.cwd(), 'scripts/create-supabase-tables.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');

    // Split the script into individual statements
    // This is a simple split - for production, use a proper SQL parser
    const statements = sqlScript
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    // Execute each statement
    for (const statement of statements) {
      // Skip verification query at the end
      if (statement.includes('SELECT table_name')) {
        continue;
      }

      try {
        console.log(`📝 Executing: ${statement.substring(0, 50)}...`);
        
        // Use raw SQL execution via PostgREST
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        }).single();

        if (error) {
          // If the RPC doesn't exist, try a different approach
          if (error.message.includes('exec_sql')) {
            console.log('⚠️  Direct SQL execution not available via API');
            console.log('   Please run the SQL script manually in Supabase dashboard');
            errorCount++;
          } else {
            console.error(`❌ Error: ${error.message}`);
            errorCount++;
          }
        } else {
          console.log('✅ Success');
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Error: ${String(err)}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50) + '\n');
    console.log(`📊 Results: ${successCount} successful, ${errorCount} errors\n`);

    // Since direct SQL execution might not be available, provide alternative instructions
    if (errorCount > 0) {
      console.log('⚠️  Some operations failed. This is likely because direct SQL execution');
      console.log('   is not available through the Supabase client library.\n');
      console.log('📋 Please follow these steps to complete the setup:\n');
      console.log('1. Go to your Supabase dashboard: https://app.supabase.com');
      console.log('2. Select your project');
      console.log('3. Navigate to SQL Editor');
      console.log('4. Copy the contents of scripts/create-supabase-tables.sql');
      console.log('5. Paste and run the script\n');
      console.log('Alternatively, check if tables were partially created by running:');
      console.log('npx tsx scripts/verify-supabase-tables.ts');
    } else {
      console.log('✅ All tables created successfully!');
      console.log('\nRun the verification script to confirm:');
      console.log('npx tsx scripts/verify-supabase-tables.ts');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Alternative approach: Create tables using Supabase client
async function createTablesViaClient() {
  console.log('\n🔄 Attempting alternative setup method...\n');

  try {
    // This approach won't work for creating tables, but we can test if tables exist
    // and provide better guidance
    
    const tables = ['user_profiles', 'section_data', 'generated_content', 'journeys'];
    const missingTables = [];

    for (const table of tables) {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (error && error.message.includes('does not exist')) {
        missingTables.push(table);
      }
    }

    if (missingTables.length > 0) {
      console.log('📋 The following tables need to be created:');
      missingTables.forEach(table => console.log(`   - ${table}`));
      console.log('\n📝 Manual Setup Instructions:\n');
      console.log('1. Copy this command:');
      console.log('   cat scripts/create-supabase-tables.sql | pbcopy\n');
      console.log('2. Go to: https://app.supabase.com');
      console.log('3. Select your project');
      console.log('4. Go to SQL Editor');
      console.log('5. Paste (Cmd+V) and click "Run"\n');
      console.log('The tables will be created immediately.');
    } else {
      console.log('✅ All required tables already exist!');
    }

  } catch (error) {
    console.error('❌ Error checking tables:', error);
  }
}

// Run setup
setupTables()
  .then(() => createTablesViaClient())
  .catch(console.error);