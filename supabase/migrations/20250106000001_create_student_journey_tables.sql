-- Migration to create tables for TimeBack student journey data
-- This stores all the data needed for the "Students Like Your Child" carousel feature

-- Students table - basic student information
CREATE TABLE students (
  id TEXT PRIMARY KEY, -- e.g., "Anon#450"
  campus TEXT NOT NULL,
  level TEXT NOT NULL, -- L1, L2, L3
  age_grade INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MAP test scores - standardized test results by term
CREATE TABLE map_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL, -- Reading, Math, Language, Science
  spring_prev_rit DECIMAL, -- Spring 23-24
  fall_rit DECIMAL,       -- Fall 24-25
  winter_rit DECIMAL,     -- Winter 24-25
  spring_rit DECIMAL,     -- Spring 24-25
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(student_id, subject)
);

-- Daily metrics - daily performance tracking
CREATE TABLE daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  subject TEXT NOT NULL,
  app TEXT, -- IXL, Khan Academy, Lalilo, etc.
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

-- Time commitments - how much time students spend per subject
CREATE TABLE time_commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  hours_worked DECIMAL,
  mins_per_weekday DECIMAL,
  daily_minutes_vs_target DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(student_id, subject)
);

-- Grade gaps - how far above/below grade level students work
CREATE TABLE grade_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  working_grade_gap INTEGER, -- positive = above grade level, negative = below
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(student_id, subject)
);

-- Individual lessons - detailed lesson-by-lesson performance
CREATE TABLE lesson_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  course TEXT,
  lesson_category TEXT,
  lesson_name TEXT,
  accuracy DECIMAL,
  mastery_percentage INTEGER,
  total_questions INTEGER,
  correct_questions INTEGER,
  time_spent_minutes DECIMAL,
  attempts INTEGER DEFAULT 1,
  mastered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accuracy by campus - campus-level performance averages
CREATE TABLE campus_accuracy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campus TEXT NOT NULL,
  level TEXT NOT NULL,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  average_accuracy DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(campus, level, student_id, subject)
);

-- Create indexes for performance
CREATE INDEX idx_students_age_grade ON students(age_grade);
CREATE INDEX idx_students_campus_level ON students(campus, level);
CREATE INDEX idx_map_scores_student_subject ON map_scores(student_id, subject);
CREATE INDEX idx_daily_metrics_student_date ON daily_metrics(student_id, date);
CREATE INDEX idx_daily_metrics_subject ON daily_metrics(subject);
CREATE INDEX idx_time_commitments_student ON time_commitments(student_id);
CREATE INDEX idx_grade_gaps_student ON grade_gaps(student_id);
CREATE INDEX idx_grade_gaps_gap ON grade_gaps(working_grade_gap);
CREATE INDEX idx_lesson_performance_student ON lesson_performance(student_id);
CREATE INDEX idx_campus_accuracy_campus_level ON campus_accuracy(campus, level);

-- Enable RLS (Row Level Security)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE campus_accuracy ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since this is anonymized educational data)
CREATE POLICY "Allow public read access to students" ON students
  FOR SELECT USING (true);
  
CREATE POLICY "Allow public read access to map_scores" ON map_scores
  FOR SELECT USING (true);
  
CREATE POLICY "Allow public read access to daily_metrics" ON daily_metrics
  FOR SELECT USING (true);
  
CREATE POLICY "Allow public read access to time_commitments" ON time_commitments
  FOR SELECT USING (true);
  
CREATE POLICY "Allow public read access to grade_gaps" ON grade_gaps
  FOR SELECT USING (true);
  
CREATE POLICY "Allow public read access to lesson_performance" ON lesson_performance
  FOR SELECT USING (true);
  
CREATE POLICY "Allow public read access to campus_accuracy" ON campus_accuracy
  FOR SELECT USING (true);

-- Add helpful comments
COMMENT ON TABLE students IS 'Anonymized TimeBack student profiles for journey showcase';
COMMENT ON TABLE map_scores IS 'MAP test scores showing academic growth over time';
COMMENT ON TABLE daily_metrics IS 'Daily learning performance and engagement metrics';
COMMENT ON TABLE time_commitments IS 'Time investment per subject for each student';
COMMENT ON TABLE grade_gaps IS 'How far above or below grade level students are working';
COMMENT ON TABLE lesson_performance IS 'Individual lesson mastery and performance data';
COMMENT ON TABLE campus_accuracy IS 'Campus-level performance averages by subject';