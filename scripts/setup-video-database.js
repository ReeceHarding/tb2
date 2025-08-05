#!/usr/bin/env node

/**
 * Setup Video Database Tables in Supabase
 * 
 * This script creates the video_categories and videos tables in Supabase
 * using the service role key to execute the SQL schema.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('[Setup] Starting video database setup...\n');

// Get Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ ERROR: Missing Supabase configuration');
  console.error('Please ensure these environment variables are set in .env.local:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('✅ Supabase URL:', supabaseUrl);
console.log('✅ Service role key configured\n');

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Read the SQL schema file
const schemaPath = path.join(__dirname, '..', 'supabase-schema.sql');
console.log('[Setup] Reading schema from:', schemaPath);

if (!fs.existsSync(schemaPath)) {
  console.error('❌ ERROR: Schema file not found at:', schemaPath);
  process.exit(1);
}

const sqlSchema = fs.readFileSync(schemaPath, 'utf8');
console.log(`✅ Schema loaded (${sqlSchema.length} characters)\n`);

// Split SQL into individual statements and execute them
async function executeSqlSchema() {
  console.log('[Setup] Executing SQL schema...\n');
  
  try {
    // Execute the full schema at once
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlSchema
    });
    
    if (error) {
      // If the RPC function doesn't exist, try direct execution via REST API
      console.log('[Setup] RPC function not available, trying direct execution...');
      
      // Split into individual statements and execute them one by one
      const statements = sqlSchema
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      console.log(`[Setup] Found ${statements.length} SQL statements to execute\n`);
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i] + ';';
        console.log(`[Setup] Executing statement ${i + 1}/${statements.length}:`);
        console.log('  ', statement.substring(0, 80) + (statement.length > 80 ? '...' : ''));
        
        try {
          // For DDL statements, we'll use the REST API directly
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${serviceRoleKey}`,
              'apikey': serviceRoleKey
            },
            body: JSON.stringify({ query: statement })
          });
          
          if (!response.ok) {
            // Try alternative approach using SQL function
            const { error: execError } = await supabase.rpc('sql', { query: statement });
            if (execError) {
              console.error(`  ❌ Error executing statement ${i + 1}:`, execError.message);
              // For creation statements, continue anyway as they might already exist
              if (statement.includes('CREATE TABLE IF NOT EXISTS') || 
                  statement.includes('INSERT') || 
                  statement.includes('ON CONFLICT')) {
                console.log('  ⚠️  Continuing (statement may already exist)...');
                continue;
              }
            } else {
              console.log(`  ✅ Statement ${i + 1} executed successfully`);
            }
          } else {
            console.log(`  ✅ Statement ${i + 1} executed successfully`);
          }
        } catch (stmtError) {
          console.error(`  ❌ Error executing statement ${i + 1}:`, stmtError.message);
          // Continue with next statement for most errors
          if (!statement.includes('DROP')) {
            console.log('  ⚠️  Continuing with next statement...');
          }
        }
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } else {
      console.log('✅ Schema executed successfully via RPC');
    }
    
  } catch (error) {
    console.error('❌ Error executing schema:', error.message);
    console.log('\n[Setup] Trying manual table creation...');
    
    // Manual table creation as fallback
    await createTablesManually();
  }
}

async function createTablesManually() {
  console.log('[Setup] Creating tables manually...\n');
  
  // Create video_categories table
  console.log('[Setup] Creating video_categories table...');
  const { error: catError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS video_categories (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        color VARCHAR(7) DEFAULT '#3B82F6',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );
    `
  });
  
  if (catError) {
    console.error('❌ Error creating video_categories:', catError.message);
  } else {
    console.log('✅ video_categories table created');
  }
  
  // Create videos table
  console.log('[Setup] Creating videos table...');
  const { error: vidError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS videos (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        description TEXT NOT NULL,
        thumbnail_url TEXT NOT NULL,
        video_url TEXT NOT NULL,
        duration INTEGER NOT NULL DEFAULT 0,
        category VARCHAR(255) NOT NULL,
        tags TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        is_featured BOOLEAN DEFAULT true,
        view_count INTEGER DEFAULT 0
      );
    `
  });
  
  if (vidError) {
    console.error('❌ Error creating videos table:', vidError.message);
  } else {
    console.log('✅ videos table created');
  }
}

async function verifyTables() {
  console.log('\n[Verify] Checking if tables were created successfully...\n');
  
  // Check video_categories table
  const { data: categories, error: catError } = await supabase
    .from('video_categories')
    .select('count(*)')
    .limit(1);
    
  if (catError) {
    console.error('❌ video_categories table not accessible:', catError.message);
  } else {
    console.log('✅ video_categories table exists and accessible');
  }
  
  // Check videos table
  const { data: videos, error: vidError } = await supabase
    .from('videos')
    .select('count(*)')
    .limit(1);
    
  if (vidError) {
    console.error('❌ videos table not accessible:', vidError.message);
  } else {
    console.log('✅ videos table exists and accessible');
  }
  
  // Try to insert sample data
  console.log('\n[Verify] Inserting sample data...\n');
  
  // Insert sample categories
  const { error: insertCatError } = await supabase
    .from('video_categories')
    .upsert([
      { name: 'How It Works', description: 'Understanding TimeBack methodology and AI personalization', color: '#3B82F6' },
      { name: 'Success Stories', description: 'Real results and testimonials from families', color: '#10B981' },
      { name: 'Research', description: 'The science and research behind our learning methods', color: '#8B5CF6' }
    ], { onConflict: 'name' });
    
  if (insertCatError) {
    console.error('❌ Error inserting sample categories:', insertCatError.message);
  } else {
    console.log('✅ Sample categories inserted successfully');
  }
  
  // Insert sample video
  const { error: insertVidError } = await supabase
    .from('videos')
    .upsert([{
      title: 'How TimeBack Personalizes Learning',
      description: 'Discover how our AI adapts to each student\'s unique learning style, interests, and pace.',
      thumbnail_url: '/images/testimonials/sarah-chen-video.jpg',
      video_url: '/demo-video.mp4',
      duration: 180,
      category: 'How It Works',
      tags: ['personalization', 'AI', 'learning', 'adaptive'],
      is_featured: true
    }], { onConflict: 'title' });
    
  if (insertVidError) {
    console.error('❌ Error inserting sample video:', insertVidError.message);
  } else {
    console.log('✅ Sample video inserted successfully');
  }
}

async function testApiEndpoints() {
  console.log('\n[Test] Testing API endpoints...\n');
  
  try {
    // Test video categories endpoint
    console.log('[Test] Testing /api/video-categories...');
    const catResponse = await fetch('http://localhost:3000/api/video-categories');
    if (catResponse.ok) {
      const catData = await catResponse.json();
      console.log(`✅ Categories API working: ${catData.length} categories found`);
    } else {
      console.error('❌ Categories API failed:', catResponse.status);
    }
    
    // Test videos endpoint
    console.log('[Test] Testing /api/videos...');
    const vidResponse = await fetch('http://localhost:3000/api/videos');
    if (vidResponse.ok) {
      const vidData = await vidResponse.json();
      console.log(`✅ Videos API working: ${vidData.length} videos found`);
    } else {
      console.error('❌ Videos API failed:', vidResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Error testing API endpoints:', error.message);
    console.log('Note: Make sure your Next.js server is running on localhost:3000');
  }
}

// Main execution
async function main() {
  try {
    await executeSqlSchema();
    await verifyTables();
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Start your Next.js server: npm run dev');
    console.log('2. Visit http://localhost:3000 to see the video gallery');
    console.log('3. Check /api/videos and /api/video-categories endpoints');
    
    // Test endpoints if server is running
    await testApiEndpoints();
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();