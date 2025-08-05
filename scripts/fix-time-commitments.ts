#!/usr/bin/env ts-node

/**
 * Fix Time Commitments Upload
 * 
 * Quick script to upload just the time commitment data since it's missing from the database
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import csv from 'csv-parser';

// Initialize Supabase client using the same keys as the API
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('🔍 Checking environment variables...');
console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseServiceKey ? 'Found' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TimeCommitment {
  student_id: string;
  subject: string;
  hours_worked: number | null;
  mins_per_weekday: number | null;
  daily_minutes_vs_target: number | null;
}

const parseCSV = (filePath: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

async function uploadTimeCommitments() {
  console.log('⏰ Processing time commitments...');
  
  try {
    const timeData = await parseCSV('public/data/raw_data/Time_Commitment_1753464042725.csv');
    console.log(`📄 Parsed ${timeData.length} rows from CSV`);
    
    const timeCommitments: TimeCommitment[] = [];
    
    timeData.forEach(row => {
      if (!row.Student || row.Student === 'Student' || row.Student.includes('Student')) return;
      
      const studentId = row.Student.replace(/"/g, '').trim(); // Clean student ID
      
      if (!studentId || !row.Subject) return;
      
      timeCommitments.push({
        student_id: studentId,
        subject: row.Subject,
        hours_worked: parseFloat(row['Hours Worked']) || null,
        mins_per_weekday: parseFloat(row['Mins / weekday']) || null,
        daily_minutes_vs_target: parseFloat(row['Daily minutes vs. target']) || null
      });
    });
    
    console.log(`✅ Processed ${timeCommitments.length} time commitment records`);
    console.log('📋 Sample records:', timeCommitments.slice(0, 3));
    
    if (timeCommitments.length === 0) {
      console.log('❌ No time commitments to upload');
      return;
    }
    
    // Upload in batches
    const batchSize = 100;
    for (let i = 0; i < timeCommitments.length; i += batchSize) {
      const batch = timeCommitments.slice(i, i + batchSize);
      console.log(`📥 Uploading batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(timeCommitments.length/batchSize)} (${batch.length} records)...`);
      
      const { error } = await supabase
        .from('time_commitments')
        .upsert(batch);
      
      if (error) {
        console.error('❌ Error uploading batch:', error);
        return;
      }
    }
    
    console.log('✅ Successfully uploaded all time commitments!');
    
    // Verify upload
    const { data: verification, error: verifyError } = await supabase
      .from('time_commitments')
      .select('count(*)', { count: 'exact' });
    
    if (verifyError) {
      console.error('❌ Error verifying upload:', verifyError);
    } else {
      console.log(`🎉 Verification: ${(verification as any)?.[0]?.count || 0} records in database`);
    }
    
  } catch (error) {
    console.error('❌ Error processing time commitments:', error);
  }
}

// Run the upload
uploadTimeCommitments();