'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { GraduationCap, Users, BookOpen, TrendingUp, AlertTriangle } from 'lucide-react';

export default function KnowledgeDispersionChart() {
  // Generate histogram data for knowledge level distribution
  const generateHistogramData = () => {
    // Define the distribution based on specifications
    const gradeDistribution = [
      { grade: '1st', count: 1, color: '#64748b', belowExpected: true },
      { grade: '2nd', count: 1, color: '#475569', belowExpected: true },
      { grade: '3rd', count: 9, color: '#334155', belowExpected: true },
      { grade: '4th', count: 28, color: '#1e293b', belowExpected: true },
      { grade: '5th', count: 38, color: '#0f172a', belowExpected: true },
      { grade: '6th', count: 48, color: '#020617', belowExpected: true },
      { grade: '7th', count: 43, color: '#0f33bb', belowExpected: false }, // Expected level - timeback-primary
      { grade: '8th', count: 38, color: '#0d2a99', belowExpected: false },
      { grade: '9th', count: 28, color: '#0b2177', belowExpected: false },
      { grade: '10th', count: 18, color: '#091955', belowExpected: false },
      { grade: '11th', count: 0, color: '#071033', belowExpected: false },
      { grade: '12th', count: 1, color: '#050711', belowExpected: false }
    ];

    return gradeDistribution;
  };

  const histogramData = generateHistogramData();
  
  // Calculate key statistics
  const totalStudents = histogramData.reduce((sum, item) => sum + item.count, 0);
  const studentsAboveExpected = histogramData.slice(7).reduce((sum, item) => sum + item.count, 0);
  const studentsBelowExpected = histogramData.slice(0, 6).reduce((sum, item) => sum + item.count, 0);
  const studentsAtExpected = histogramData[6].count;
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border-2 border-timeback-primary rounded-xl shadow-2xl">
          <p className="text-sm font-bold text-timeback-primary font-cal mb-1">
            {data.grade} Grade Knowledge Level
          </p>
          <p className="text-lg font-bold text-timeback-primary font-cal">
            {data.count} students
          </p>
          <p className="text-xs text-timeback-primary font-cal">
            {data.belowExpected ? 'Below expected 7th grade level' : 'At or above expected level'}
          </p>
        </div>
      );
    }
    return null;
  };

  console.log(`[KnowledgeDispersionChart] Total students: ${totalStudents}, Below expected: ${studentsBelowExpected}, At expected: ${studentsAtExpected}, Above expected: ${studentsAboveExpected}`);

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          {/* Data Badge */}
          <div className="bg-timeback-bg border border-timeback-primary rounded-xl p-3 mb-8 inline-block">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-timeback-primary rounded-full animate-pulse"></div>
              <p className="text-sm font-medium text-timeback-primary font-cal">
                Real Data: Alpha School 7th Grade Students (Same Age, Different Abilities)
              </p>
            </div>
          </div>
          
          {/* Main Headline */}
          <h2 className="text-3xl lg:text-5xl font-bold text-timeback-primary mb-6 font-cal leading-tight">
            Why One-Size-Fits-All Education Fails
          </h2>
          
          {/* Supporting Text */}
          <div className="space-y-3 max-w-4xl mx-auto">
            <p className="text-xl text-timeback-primary font-cal">
              Same classroom. Same age. Vastly different knowledge levels.
            </p>
            <p className="text-lg text-timeback-primary font-cal opacity-90">
              How can a student with 12th grade knowledge learn alongside one with 2nd grade knowledge?
            </p>
          </div>
        </div>

        {/* Main Chart Container */}
        <div className="bg-white rounded-2xl border-2 border-timeback-primary shadow-xl p-8 mb-12">
          
          {/* Chart Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
                              <div className="bg-timeback-primary rounded-xl p-2">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-timeback-primary font-cal">
                Knowledge Level Distribution
              </h3>
            </div>
            <p className="text-timeback-primary font-cal">
              Each bar represents how many 7th grade students have that grade-level knowledge
            </p>
          </div>

          {/* Bar Chart */}
          <div className="h-80 mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={histogramData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1abeff" opacity={0.3} />
                <XAxis 
                  dataKey="grade"
                  tick={{ fill: '#0f33bb', fontSize: 12, fontWeight: 500 }}
                  axisLine={{ stroke: '#0f33bb' }}
                  tickLine={{ stroke: '#0f33bb' }}
                  label={{ 
                    value: 'Knowledge Level (Grade Equivalent)', 
                    position: 'insideBottom', 
                    offset: -40,
                    style: { textAnchor: 'middle', fill: '#0f33bb', fontSize: '14px', fontWeight: 'bold' }
                  }}
                />
                <YAxis 
                  tick={{ fill: '#0f33bb', fontSize: 12, fontWeight: 500 }}
                  axisLine={{ stroke: '#0f33bb' }}
                  tickLine={{ stroke: '#0f33bb' }}
                  label={{ 
                    value: 'Number of Students', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: '#0f33bb', fontSize: '14px', fontWeight: 'bold' }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Highlight expected grade level */}
                <ReferenceLine 
                  x="7th" 
                  stroke="#0f33bb" 
                  strokeWidth={3}
                  strokeDasharray="6 6"
                  label={{ 
                    value: "Expected Level for 7th Graders", 
                    position: "top",
                    style: { fill: '#0f33bb', fontSize: '12px', fontWeight: 'bold' }
                  }}
                />
                
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {histogramData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Key Insights Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Below Expected */}
            <div className="bg-timeback-bg border-2 border-timeback-primary rounded-xl p-6 text-center">
              <AlertTriangle className="w-8 h-8 text-timeback-primary mx-auto mb-3" />
              <h4 className="text-lg font-bold text-timeback-primary font-cal mb-2">Below Expected</h4>
              <p className="text-3xl font-bold text-timeback-primary font-cal mb-1">{studentsBelowExpected}</p>
              <p className="text-sm text-timeback-primary font-cal">
                students ({Math.round((studentsBelowExpected/totalStudents)*100)}%)
              </p>
              <p className="text-xs text-timeback-primary font-cal mt-2">
                Operating below 7th grade level
              </p>
            </div>

            {/* At Expected */}
            <div className="bg-timeback-bg border-2 border-timeback-primary rounded-xl p-6 text-center">
              <Users className="w-8 h-8 text-timeback-primary mx-auto mb-3" />
              <h4 className="text-lg font-bold text-timeback-primary font-cal mb-2">At Expected</h4>
              <p className="text-3xl font-bold text-timeback-primary font-cal mb-1">{studentsAtExpected}</p>
              <p className="text-sm text-timeback-primary font-cal">
                students ({Math.round((studentsAtExpected/totalStudents)*100)}%)
              </p>
              <p className="text-xs text-timeback-primary font-cal mt-2">
                Operating at 7th grade level
              </p>
            </div>

            {/* Above Expected */}
            <div className="bg-timeback-bg border-2 border-timeback-primary rounded-xl p-6 text-center">
              <TrendingUp className="w-8 h-8 text-timeback-primary mx-auto mb-3" />
              <h4 className="text-lg font-bold text-timeback-primary font-cal mb-2">Above Expected</h4>
              <p className="text-3xl font-bold text-timeback-primary font-cal mb-1">{studentsAboveExpected}</p>
              <p className="text-sm text-timeback-primary font-cal">
                students ({Math.round((studentsAboveExpected/totalStudents)*100)}%)
              </p>
              <p className="text-xs text-timeback-primary font-cal mt-2">
                Operating above 7th grade level
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-timeback-bg rounded-xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-timeback-primary font-cal opacity-80">Total Students</p>
                <p className="text-2xl font-bold text-timeback-primary font-cal">{totalStudents}</p>
              </div>
              <div>
                <p className="text-sm text-timeback-primary font-cal opacity-80">Grade Range</p>
                <p className="text-2xl font-bold text-timeback-primary font-cal">1st-12th</p>
              </div>
              <div>
                <p className="text-sm text-timeback-primary font-cal opacity-80">Chronological Age</p>
                <p className="text-2xl font-bold text-timeback-primary font-cal">7th Grade</p>
              </div>
              <div>
                <p className="text-sm text-timeback-primary font-cal opacity-80">At Grade Level</p>
                <p className="text-2xl font-bold text-timeback-primary font-cal">{Math.round((studentsAtExpected/totalStudents)*100)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Explanation Section */}
        <div className="bg-timeback-bg rounded-2xl p-8 mb-12">
          <div className="flex items-start gap-4">
                                <div className="bg-timeback-primary rounded-xl p-3 flex-shrink-0">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-timeback-primary mb-4 font-cal">
                The Fundamental Problem
              </h4>
              <div className="space-y-4">
                <p className="text-lg text-timeback-primary font-cal leading-relaxed">
                  Traditional education systems group students by age, forcing vastly different learners into the same curriculum. 
                  A student with 2nd grade math skills sits next to one ready for calculus—both receiving identical 7th grade instruction.
                </p>
                <div className="bg-white rounded-xl p-6 border-l-4 border-timeback-primary">
                  <p className="text-lg font-semibold text-timeback-primary font-cal mb-2">
                    The Solution: Personalized Learning
                  </p>
                  <p className="text-timeback-primary font-cal">
                    Meet each student exactly where they are academically, allowing them to progress at their optimal pace regardless of their chronological age.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-timeback-bg to-white rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-timeback-primary font-cal mb-4">
            Every Student Deserves Education That Fits
          </h3>
          <p className="text-lg text-timeback-primary font-cal mb-2">
            Not their birth year, but their knowledge level.
          </p>
          <p className="text-timeback-primary font-cal opacity-80">
            Personalized learning is not just better—it is essential for student success.
          </p>
        </div>
        
      </div>
    </section>
  );
}