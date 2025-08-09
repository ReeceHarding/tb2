#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

async function runSQL(sqlFile) {
  try {
    console.log('Reading SQL file:', sqlFile);
    const sql = await fs.readFile(sqlFile, 'utf8');
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`\nExecuting statement ${i + 1}/${statements.length}:`);
      console.log(statement.substring(0, 100) + '...');
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement
        });
        
        if (error) {
          // Try direct execution if RPC fails
          console.log('RPC failed, trying direct execution...');
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({ sql_query: statement })
          });
          
          if (!response.ok) {
            // If RPC doesn't exist, we'll need to use a different approach
            console.log('Direct SQL execution not available via API');
            console.log('Please run the following SQL manually in Supabase SQL editor:');
            console.log('---');
            console.log(statement);
            console.log('---');
          } else {
            console.log('✓ Statement executed successfully');
          }
        } else {
          console.log('✓ Statement executed successfully');
        }
      } catch (err) {
        console.error(`Error executing statement ${i + 1}:`, err.message);
        console.log('Please run this statement manually in Supabase SQL editor:');
        console.log('---');
        console.log(statement);
        console.log('---');
      }
    }
    
    console.log('\nSQL execution completed!');
    console.log('\nIMPORTANT: If you see messages about running SQL manually,');
    console.log('please go to your Supabase dashboard -> SQL Editor and run those statements.');
    console.log('Dashboard URL:', supabaseUrl);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Get SQL file from command line argument
const sqlFile = process.argv[2];
if (!sqlFile) {
  console.error('Usage: node scripts/run-supabase-sql.js <sql-file>');
  process.exit(1);
}

runSQL(sqlFile);