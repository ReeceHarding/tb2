#!/usr/bin/env ts-node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import csv from 'csv-parser';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper to parse CSV file
const parseCSV = (filePath: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => results.push(row))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

const main = async () => {
  console.log('🚀 Fixing student data upload...');
  
  try {
    // Step 1: Parse and upload students first
    console.log('\n👥 Processing students...');
    const mapData = await parseCSV('public/data/raw_data/Spring 2024-2025  MAP Snapshot - ModelSpring2425.csv');
    
    const studentsMap = new Map();
    mapData.forEach(row => {
      if (!row.Student || row.Student === 'Student') return;
      
      studentsMap.set(row.Student, {
        id: row.Student,
        campus: row.Campus || 'Unknown',
        level: row.Level || 'L1',
        age_grade: parseInt(row['Age Grade']) || 0
      });
    });
    
    const students = Array.from(studentsMap.values());
    console.log(`📥 Uploading ${students.length} unique students...`);
    
    // Upload students with upsert to handle duplicates
    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .upsert(students, { onConflict: 'id' })
      .select();
    
    if (studentsError) {
      console.error('❌ Students error:', studentsError);
      return;
    }
    
    console.log(`✅ Uploaded ${studentsData?.length || 0} students`);
    
    // Wait a moment for students to be committed
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 2: Upload MAP scores (without foreign key constraints for now)
    console.log('\n📊 Processing MAP scores...');
    const mapScores: any[] = [];
    
    mapData.forEach(row => {
      if (!row.Student || row.Student === 'Student') return;
      
      mapScores.push({
        student_id: row.Student,
        subject: row.Subject,
        spring_prev_rit: parseFloat(row['Spring 23-24 RIT Score']) || null,
        fall_rit: parseFloat(row['Fall 24-25 RIT Score']) || null,
        winter_rit: parseFloat(row['Winter 24-25 RIT Score']) || null,
        spring_rit: parseFloat(row['Spring 2425 RIT Score [max if multiple available]']) || null
      });
    });
    
    console.log(`📥 Uploading ${mapScores.length} MAP scores...`);
    
    // Delete existing MAP scores first to avoid duplicates
    const { error: deleteError } = await supabase
      .from('map_scores')
      .delete()
      .gte('created_at', '1900-01-01');
    
    if (deleteError) {
      console.log('⚠️ Delete error (may be empty):', deleteError.message);
    }
    
    // Upload in chunks to avoid size limits
    const chunkSize = 100;
    let uploaded = 0;
    
    for (let i = 0; i < mapScores.length; i += chunkSize) {
      const chunk = mapScores.slice(i, i + chunkSize);
      
      const { data: chunkData, error: chunkError } = await supabase
        .from('map_scores')
        .insert(chunk)
        .select();
      
      if (chunkError) {
        console.error(`❌ Chunk ${i / chunkSize + 1} error:`, chunkError);
        // Continue with next chunk
      } else {
        uploaded += chunkData?.length || 0;
        console.log(`✅ Uploaded chunk ${i / chunkSize + 1}/${Math.ceil(mapScores.length / chunkSize)} (${uploaded} total)`);
      }
    }
    
    console.log(`\n🎉 Upload complete! Total MAP scores: ${uploaded}`);
    
    // Step 3: Verify data
    console.log('\n🔍 Verifying data...');
    
    const { count: studentCount } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });
    
    const { count: mapCount } = await supabase
      .from('map_scores')
      .select('*', { count: 'exact', head: true });
    
    const { data: sampleData } = await supabase
      .from('map_scores')
      .select('student_id, subject, fall_rit, spring_rit')
      .not('fall_rit', 'is', null)
      .not('spring_rit', 'is', null)
      .limit(5);
    
    console.log(`📊 Summary:`);
    console.log(`   Students: ${studentCount}`);
    console.log(`   MAP Scores: ${mapCount}`);
    console.log(`   Sample with growth data:`, sampleData);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

if (require.main === module) {
  main();
}