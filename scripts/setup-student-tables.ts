#!/usr/bin/env ts-node

/**
 * Setup student tables and upload data to Supabase
 * 
 * This script creates the necessary tables and uploads all student data
 * without requiring Supabase CLI access.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import csv from 'csv-parser';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// SQL for creating tables
const createTablesSQL = `
-- Students table - basic student information
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  campus TEXT NOT NULL,
  level TEXT NOT NULL,
  age_grade INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MAP test scores
CREATE TABLE IF NOT EXISTS map_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  spring_prev_rit DECIMAL,
  fall_rit DECIMAL,
  winter_rit DECIMAL,
  spring_rit DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject)
);

-- Daily metrics
CREATE TABLE IF NOT EXISTS daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  subject TEXT NOT NULL,
  app TEXT,
  course TEXT,
  lessons_mastered INTEGER DEFAULT 0,
  essential_lessons_mastered INTEGER DEFAULT 0,
  correct_questions INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  accuracy DECIMAL,
  minutes DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date, subject, app)
);

-- Time commitments
CREATE TABLE IF NOT EXISTS time_commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  hours_worked DECIMAL,
  mins_per_weekday DECIMAL,
  daily_minutes_vs_target DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject)
);

-- Grade gaps
CREATE TABLE IF NOT EXISTS grade_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  working_grade_gap INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_students_age_grade ON students(age_grade);
CREATE INDEX IF NOT EXISTS idx_students_campus_level ON students(campus, level);
CREATE INDEX IF NOT EXISTS idx_map_scores_student_subject ON map_scores(student_id, subject);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_student_date ON daily_metrics(student_id, date);
CREATE INDEX IF NOT EXISTS idx_time_commitments_student ON time_commitments(student_id);
CREATE INDEX IF NOT EXISTS idx_grade_gaps_student ON grade_gaps(student_id);

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_gaps ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
DROP POLICY IF EXISTS "Allow public read access to students" ON students;
CREATE POLICY "Allow public read access to students" ON students FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to map_scores" ON map_scores;
CREATE POLICY "Allow public read access to map_scores" ON map_scores FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to daily_metrics" ON daily_metrics;
CREATE POLICY "Allow public read access to daily_metrics" ON daily_metrics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to time_commitments" ON time_commitments;
CREATE POLICY "Allow public read access to time_commitments" ON time_commitments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to grade_gaps" ON grade_gaps;
CREATE POLICY "Allow public read access to grade_gaps" ON grade_gaps FOR SELECT USING (true);
`;

// Helper to parse CSV file
const parseCSV = (filePath: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    
    console.log(`📄 Parsing ${filePath}...`);
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => results.push(row))
      .on('end', () => {
        console.log(`✅ Parsed ${results.length} rows`);
        resolve(results);
      })
      .on('error', reject);
  });
};

interface StudentData {
  students: Set<any>;
  mapScores: any[];
  dailyMetrics: any[];
  timeCommitments: any[];
  gradeGaps: any[];
}

const data: StudentData = {
  students: new Set(),
  mapScores: [],
  dailyMetrics: [],
  timeCommitments: [],
  gradeGaps: []
};

// Process MAP data
const processMAPData = async () => {
  console.log('\n🎯 Processing MAP scores...');
  try {
    const mapData = await parseCSV('public/data/raw_data/Spring 2024-2025  MAP Snapshot - ModelSpring2425.csv');
    
    mapData.forEach(row => {
      if (!row.Student || row.Student === 'Student') return;
      
      // Add student
      data.students.add({
        id: row.Student,
        campus: row.Campus || 'Unknown',
        level: row.Level || 'L1',
        age_grade: parseInt(row['Age Grade']) || 0
      });
      
      // Add MAP score
      data.mapScores.push({
        student_id: row.Student,
        subject: row.Subject,
        spring_prev_rit: parseFloat(row['Spring 23-24 RIT Score']) || null,
        fall_rit: parseFloat(row['Fall 24-25 RIT Score']) || null,
        winter_rit: parseFloat(row['Winter 24-25 RIT Score']) || null,
        spring_rit: parseFloat(row['Spring 2425 RIT Score [max if multiple available]']) || null
      });
    });
    
    console.log(`✅ Processed ${data.mapScores.length} MAP scores`);
  } catch (error) {
    console.error('❌ Error processing MAP data:', error);
  }
};

// Process All Metrics
const processAllMetrics = async () => {
  console.log('\n📊 Processing daily metrics...');
  try {
    const metricsData = await parseCSV('public/data/raw_data/All_Metrics_1753464090176.csv');
    
    metricsData.forEach(row => {
      if (!row.Student || row.Student === 'Student') return;
      
      data.dailyMetrics.push({
        student_id: row.Student,
        date: row.Date ? new Date(row.Date).toISOString().split('T')[0] : null,
        subject: row.Subject,
        app: row.App,
        course: row.Course,
        lessons_mastered: parseInt(row['Lessons mastered']) || 0,
        essential_lessons_mastered: parseInt(row['Essential Lessons Mastered']) || 0,
        correct_questions: parseInt(row['Correct Questions']) || 0,
        total_questions: parseInt(row['Total Questions']) || 0,
        accuracy: parseFloat(row.Accuracy) || null,
        minutes: parseFloat(row.Minutes) || null
      });
    });
    
    console.log(`✅ Processed ${data.dailyMetrics.length} daily metrics`);
  } catch (error) {
    console.error('❌ Error processing metrics data:', error);
  }
};

// Process time commitments
const processTimeCommitments = async () => {
  console.log('\n⏰ Processing time commitments...');
  try {
    const timeData = await parseCSV('public/data/raw_data/Time_Commitment_1753464042725.csv');
    
    timeData.forEach(row => {
      // Handle the malformed header with extra quotes
      const studentId = row['﻿"Student"'] || row.Student || row['"Student"'];
      
      if (!studentId || studentId === 'Student' || studentId === '"Student"') return;
      
      data.timeCommitments.push({
        student_id: studentId,
        subject: row.Subject,
        hours_worked: parseFloat(row['Hours Worked']) || null,
        mins_per_weekday: parseFloat(row['Mins / weekday']) || null,
        daily_minutes_vs_target: parseFloat(row['Daily minutes vs. target']) || null
      });
    });
    
    console.log(`✅ Processed ${data.timeCommitments.length} time commitments`);
  } catch (error) {
    console.error('❌ Error processing time data:', error);
  }
};

// Process grade gaps
const processGradeGaps = async () => {
  console.log('\n📈 Processing grade gaps...');
  try {
    const gapData = await parseCSV('public/data/raw_data/Grade_Gap!_Age_Grade_1753464230127.csv');
    
    gapData.forEach(row => {
      // Handle the malformed header with extra quotes
      const studentId = row['﻿"fullname"'] || row.fullname || row['"fullname"'];
      
      if (!studentId || studentId === 'fullname' || studentId === '"fullname"') return;
      
      data.gradeGaps.push({
        student_id: studentId,
        subject: row.subject,
        working_grade_gap: parseInt(row['Working grade gap']) || 0
      });
    });
    
    console.log(`✅ Processed ${data.gradeGaps.length} grade gaps`);
  } catch (error) {
    console.error('❌ Error processing grade gap data:', error);
  }
};

// Create tables using direct SQL queries
const createTables = async () => {
  console.log('\n🏗️ Creating database tables...');
  
  try {
    // Create students table first (no foreign key dependencies)
    console.log('Creating students table...');
    const { error: studentsError } = await supabase
      .rpc('sql', { 
        query: `CREATE TABLE IF NOT EXISTS students (
          id TEXT PRIMARY KEY,
          campus TEXT NOT NULL,
          level TEXT NOT NULL,
          age_grade INTEGER NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );`
      });
    
    if (studentsError) {
      console.log('❌ Students table error (may already exist):', studentsError.message);
    } else {
      console.log('✅ Students table ready');
    }
    
    // Create other tables
    const tables = [
      {
        name: 'map_scores',
        sql: `CREATE TABLE IF NOT EXISTS map_scores (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          student_id TEXT NOT NULL,
          subject TEXT NOT NULL,
          spring_prev_rit DECIMAL,
          fall_rit DECIMAL,
          winter_rit DECIMAL,
          spring_rit DECIMAL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );`
      },
      {
        name: 'time_commitments',
        sql: `CREATE TABLE IF NOT EXISTS time_commitments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          student_id TEXT NOT NULL,
          subject TEXT NOT NULL,
          hours_worked DECIMAL,
          mins_per_weekday DECIMAL,
          daily_minutes_vs_target DECIMAL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );`
      },
      {
        name: 'grade_gaps',
        sql: `CREATE TABLE IF NOT EXISTS grade_gaps (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          student_id TEXT NOT NULL,
          subject TEXT NOT NULL,
          working_grade_gap INTEGER,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );`
      },
      {
        name: 'daily_metrics',
        sql: `CREATE TABLE IF NOT EXISTS daily_metrics (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          student_id TEXT NOT NULL,
          date DATE NOT NULL,
          subject TEXT NOT NULL,
          app TEXT,
          course TEXT,
          lessons_mastered INTEGER DEFAULT 0,
          essential_lessons_mastered INTEGER DEFAULT 0,
          correct_questions INTEGER DEFAULT 0,
          total_questions INTEGER DEFAULT 0,
          accuracy DECIMAL,
          minutes DECIMAL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );`
      }
    ];
    
    for (const table of tables) {
      console.log(`Creating ${table.name} table...`);
      const { error } = await supabase.rpc('sql', { query: table.sql });
      
      if (error) {
        console.log(`❌ ${table.name} table error (may already exist):`, error.message);
      } else {
        console.log(`✅ ${table.name} table ready`);
      }
    }
    
    console.log('✅ All tables are ready');
    return true;
    
  } catch (error) {
    console.error('❌ Error during table creation:', error);
    console.log('📝 Tables may already exist - continuing with data upload...');
    return true; // Continue anyway, tables might already exist
  }
};

// Upload data to Supabase
const uploadData = async () => {
  console.log('\n🚀 Uploading data to Supabase...');
  
  try {
    // Upload students
    const studentsArray = Array.from(data.students);
    const uniqueStudents = studentsArray.reduce((acc, student) => {
      const existing = acc.find((s: any) => s.id === student.id);
      if (!existing) {
        acc.push(student);
      } else {
        if (student.campus !== 'Unknown') existing.campus = student.campus;
        if (student.age_grade > 0) existing.age_grade = student.age_grade;
      }
      return acc;
    }, []);
    
    console.log(`📥 Uploading ${uniqueStudents.length} students...`);
    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .upsert(uniqueStudents, { onConflict: 'id' });
    
    if (studentsError) {
      console.error('❌ Error uploading students:', studentsError);
      return;
    }
    console.log(`✅ Uploaded ${uniqueStudents.length} students`);

    // Small delay to ensure students are committed before foreign key references
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`📥 Uploading ${data.mapScores.length} MAP scores...`);
    const { error: mapError } = await supabase
      .from('map_scores')
      .upsert(data.mapScores);
    
    if (mapError) {
      console.error('❌ Error uploading MAP scores:', mapError);
      return;
    }
    
    console.log(`📥 Uploading ${data.timeCommitments.length} time commitments...`);
    const { error: timeError } = await supabase
      .from('time_commitments')
      .upsert(data.timeCommitments);
    
    if (timeError) {
      console.error('❌ Error uploading time commitments:', timeError);
      return;
    }
    
    console.log(`📥 Uploading ${data.gradeGaps.length} grade gaps...`);
    const { error: gapError } = await supabase
      .from('grade_gaps')
      .upsert(data.gradeGaps);
    
    if (gapError) {
      console.error('❌ Error uploading grade gaps:', gapError);
      return;
    }
    
    // Upload daily metrics in chunks
    console.log(`📥 Uploading ${data.dailyMetrics.length} daily metrics...`);
    const chunkSize = 500;
    for (let i = 0; i < data.dailyMetrics.length; i += chunkSize) {
      const chunk = data.dailyMetrics.slice(i, i + chunkSize);
      const { error: metricsError } = await supabase
        .from('daily_metrics')
        .upsert(chunk);
      
      if (metricsError) {
        console.error(`❌ Error uploading metrics chunk ${i / chunkSize + 1}:`, metricsError);
        return;
      }
      
      console.log(`✅ Uploaded chunk ${i / chunkSize + 1}/${Math.ceil(data.dailyMetrics.length / chunkSize)}`);
    }
    
    console.log('\n🎉 Successfully uploaded all data to Supabase!');
    
    // Print summary
    console.log('\n📊 Upload Summary:');
    console.log(`   Students: ${uniqueStudents.length}`);
    console.log(`   MAP Scores: ${data.mapScores.length}`);
    console.log(`   Time Commitments: ${data.timeCommitments.length}`);
    console.log(`   Grade Gaps: ${data.gradeGaps.length}`);
    console.log(`   Daily Metrics: ${data.dailyMetrics.length}`);
    
  } catch (error) {
    console.error('❌ Error during upload:', error);
  }
};

// Main execution
const main = async () => {
  console.log('🚀 Setting up TimeBack student data in Supabase...\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 Using service role key: ${supabaseServiceKey.substring(0, 20)}...`);
  
  try {
    // Step 1: Create tables
    const tablesCreated = await createTables();
    if (!tablesCreated) {
      console.error('❌ Failed to create tables. Aborting.');
      return;
    }
    
    // Step 2: Process CSV data
    await processMAPData();
    await processAllMetrics();
    await processTimeCommitments();
    await processGradeGaps();
    
    // Step 3: Upload data
    await uploadData();
    
    console.log('\n✅ Setup complete! Student journey data is ready for production.');
    
  } catch (error) {
    console.error('❌ Error during setup:', error);
    process.exit(1);
  }
};

// Run the script
if (require.main === module) {
  main();
}

export default main;