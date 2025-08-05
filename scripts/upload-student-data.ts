#!/usr/bin/env ts-node

/**
 * Upload TimeBack student data from CSV files to Supabase
 * 
 * This script parses all the CSV files in public/data/raw_data/ and uploads
 * the data to Supabase tables for the student journey carousel feature.
 * 
 * Usage: npm run upload-student-data
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface StudentData {
  students: Set<any>;
  mapScores: any[];
  dailyMetrics: any[];
  timeCommitments: any[];
  gradeGaps: any[];
  lessonPerformance: any[];
  campusAccuracy: any[];
}

const data: StudentData = {
  students: new Set(),
  mapScores: [],
  dailyMetrics: [],
  timeCommitments: [],
  gradeGaps: [],
  lessonPerformance: [],
  campusAccuracy: []
};

// Helper to parse CSV file
const parseCSV = (filePath: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    
    console.log(`📄 Parsing ${path.basename(filePath)}...`);
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => results.push(row))
      .on('end', () => {
        console.log(`✅ Parsed ${results.length} rows from ${path.basename(filePath)}`);
        resolve(results);
      })
      .on('error', reject);
  });
};

// Parse MAP scores
const processMAPData = async () => {
  console.log('\n🎯 Processing MAP scores...');
  const mapData = await parseCSV('public/data/raw_data/Spring 2024-2025  MAP Snapshot - ModelSpring2425.csv');
  
  mapData.forEach(row => {
    if (!row.Student || row.Student === 'Student') return;
    
    // Add student to set
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
};

// Parse All Metrics (daily performance)
const processAllMetrics = async () => {
  console.log('\n📊 Processing daily metrics...');
  const metricsData = await parseCSV('public/data/raw_data/All_Metrics_1753464090176.csv');
  
  metricsData.forEach(row => {
    if (!row.Student || row.Student === 'Student') return;
    
    // Add student to set
    data.students.add({
      id: row.Student,
      campus: 'Unknown', // Will be updated from MAP data
      level: row.Level || 'L1',
      age_grade: 0 // Will be updated from MAP data
    });
    
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
};

// Parse time commitments
const processTimeCommitments = async () => {
  console.log('\n⏰ Processing time commitments...');
  const timeData = await parseCSV('public/data/raw_data/Time_Commitment_1753464042725.csv');
  
  timeData.forEach(row => {
    if (!row.Student || row.Student === 'Student') return;
    
    data.timeCommitments.push({
      student_id: row.Student,
      subject: row.Subject,
      hours_worked: parseFloat(row['Hours Worked']) || null,
      mins_per_weekday: parseFloat(row['Mins / weekday']) || null,
      daily_minutes_vs_target: parseFloat(row['Daily minutes vs. target']) || null
    });
  });
};

// Parse grade gaps
const processGradeGaps = async () => {
  console.log('\n📈 Processing grade gaps...');
  const gapData = await parseCSV('public/data/raw_data/Grade_Gap!_Age_Grade_1753464230127.csv');
  
  gapData.forEach(row => {
    if (!row.fullname || row.fullname === 'fullname') return;
    
    data.gradeGaps.push({
      student_id: row.fullname,
      subject: row.subject,
      working_grade_gap: parseInt(row['Working grade gap']) || 0
    });
  });
};

// Parse lesson performance
const processLessonPerformance = async () => {
  console.log('\n📚 Processing lesson performance...');
  const lessonData = await parseCSV('public/data/raw_data/Lessons_1753464080260.csv');
  
  lessonData.forEach(row => {
    if (!row.Student || row.Student === 'Student') return;
    
    data.lessonPerformance.push({
      student_id: row.Student,
      subject: row.Subject,
      course: row.Course,
      lesson_category: row['Lesson Category'],
      lesson_name: row['Lesson Name'],
      accuracy: parseFloat(row.Accuracy) || null,
      mastery_percentage: parseInt(row['Mastery %']) || null,
      total_questions: parseInt(row['Total Questions']) || 0,
      correct_questions: parseInt(row['Correct Questions']) || 0,
      time_spent_minutes: parseFloat(row['Time Spent (Minutes)']) || null,
      attempts: parseInt(row.Attempts) || 1,
      mastered: row.Mastered === '1' || row.Mastered === 'true'
    });
  });
};

// Parse campus accuracy
const processCampusAccuracy = async () => {
  console.log('\n🏫 Processing campus accuracy...');
  const accuracyData = await parseCSV('public/data/raw_data/Accuracy_by_Campus,__1753464206375.csv');
  
  accuracyData.forEach(row => {
    if (!row.Student || row.Student === 'Student') return;
    
    data.campusAccuracy.push({
      campus: row.Campus,
      level: row.Level,
      student_id: row.Student,
      subject: row.Subject,
      average_accuracy: parseFloat(row.Accuracy) || null
    });
  });
};

// Upload data to Supabase
const uploadToSupabase = async () => {
  console.log('\n🚀 Uploading data to Supabase...');
  
  try {
    // Upload students (convert Set to Array and deduplicate)
    const studentsArray = Array.from(data.students);
    const uniqueStudents = studentsArray.reduce((acc: any[], student) => {
      const existing = acc.find((s: any) => s.id === student.id);
      if (!existing) {
        acc.push(student);
      } else {
        // Update with non-null values
        if (student.campus !== 'Unknown') existing.campus = student.campus;
        if (student.age_grade > 0) existing.age_grade = student.age_grade;
      }
      return acc;
    }, []);
    
    console.log(`📥 Uploading ${uniqueStudents.length} students...`);
    const { error: studentsError } = await supabase
      .from('students')
      .upsert(uniqueStudents);
    
    if (studentsError) {
      console.error('❌ Error uploading students:', studentsError);
      return;
    }
    
    // Upload MAP scores
    console.log(`📥 Uploading ${data.mapScores.length} MAP scores...`);
    const { error: mapError } = await supabase
      .from('map_scores')
      .upsert(data.mapScores);
    
    if (mapError) {
      console.error('❌ Error uploading MAP scores:', mapError);
      return;
    }
    
    // Upload daily metrics (in chunks to avoid timeout)
    console.log(`📥 Uploading ${data.dailyMetrics.length} daily metrics...`);
    const chunkSize = 1000;
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
    
    // Upload time commitments
    console.log(`📥 Uploading ${data.timeCommitments.length} time commitments...`);
    const { error: timeError } = await supabase
      .from('time_commitments')
      .upsert(data.timeCommitments);
    
    if (timeError) {
      console.error('❌ Error uploading time commitments:', timeError);
      return;
    }
    
    // Upload grade gaps
    console.log(`📥 Uploading ${data.gradeGaps.length} grade gaps...`);
    const { error: gapError } = await supabase
      .from('grade_gaps')
      .upsert(data.gradeGaps);
    
    if (gapError) {
      console.error('❌ Error uploading grade gaps:', gapError);
      return;
    }
    
    // Upload lesson performance (in chunks)
    console.log(`📥 Uploading ${data.lessonPerformance.length} lesson performances...`);
    for (let i = 0; i < data.lessonPerformance.length; i += chunkSize) {
      const chunk = data.lessonPerformance.slice(i, i + chunkSize);
      const { error: lessonError } = await supabase
        .from('lesson_performance')
        .upsert(chunk);
      
      if (lessonError) {
        console.error(`❌ Error uploading lesson chunk ${i / chunkSize + 1}:`, lessonError);
        return;
      }
      
      console.log(`✅ Uploaded lesson chunk ${i / chunkSize + 1}/${Math.ceil(data.lessonPerformance.length / chunkSize)}`);
    }
    
    // Upload campus accuracy
    console.log(`📥 Uploading ${data.campusAccuracy.length} campus accuracy records...`);
    const { error: campusError } = await supabase
      .from('campus_accuracy')
      .upsert(data.campusAccuracy);
    
    if (campusError) {
      console.error('❌ Error uploading campus accuracy:', campusError);
      return;
    }
    
    console.log('\n🎉 Successfully uploaded all student data to Supabase!');
    
    // Print summary
    console.log('\n📊 Upload Summary:');
    console.log(`   Students: ${uniqueStudents.length}`);
    console.log(`   MAP Scores: ${data.mapScores.length}`);
    console.log(`   Daily Metrics: ${data.dailyMetrics.length}`);
    console.log(`   Time Commitments: ${data.timeCommitments.length}`);
    console.log(`   Grade Gaps: ${data.gradeGaps.length}`);
    console.log(`   Lesson Performance: ${data.lessonPerformance.length}`);
    console.log(`   Campus Accuracy: ${data.campusAccuracy.length}`);
    
  } catch (error) {
    console.error('❌ Unexpected error during upload:', error);
  }
};

// Main execution
const main = async () => {
  console.log('🚀 Starting TimeBack student data upload...\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 Using service role key: ${supabaseServiceKey.substring(0, 20)}...`);
  
  try {
    // Process all CSV files
    await processMAPData();
    await processAllMetrics();
    await processTimeCommitments();
    await processGradeGaps();
    await processLessonPerformance();
    await processCampusAccuracy();
    
    // Upload to Supabase
    await uploadToSupabase();
    
  } catch (error) {
    console.error('❌ Error during data processing:', error);
    process.exit(1);
  }
};

// Run the script
if (require.main === module) {
  main();
}

export default main;