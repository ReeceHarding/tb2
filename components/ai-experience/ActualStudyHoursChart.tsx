'use client';

import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Users } from 'lucide-react';

export default function ActualStudyHoursChart() {
  // Real data from the provided charts
  const hourlyData = [
    { student: 1, hours: 2.9 },
    { student: 50, hours: 2.7 },
    { student: 100, hours: 2.5 },
    { student: 150, hours: 2.3 },
    { student: 200, hours: 2.1 },
    { student: 250, hours: 1.9 },
    { student: 300, hours: 1.8 },
    { student: 350, hours: 1.7 },
    { student: 400, hours: 1.6 },
    { student: 450, hours: 1.4 },
    { student: 500, hours: 0.2 },
  ];

  const quarterlyData = [
    { quarter: 'Q3 2023', language: 2113, math: 2234, reading: 1324, science: 1006 },
    { quarter: 'Q4 2023', language: 3747, math: 4050, reading: 3078, science: 1848 },
    { quarter: 'Q1 2024', language: 4372, math: 4015, reading: 3548, science: 2270 },
    { quarter: 'Q2 2024', language: 3087, math: 2792, reading: 3109, science: 1262 },
  ];

  return (
    <div className="bg-white rounded-xl border border-timeback-primary p-6">
      {/* Real Data Badge */}
      <div className="bg-timeback-bg border border-timeback-primary rounded-xl p-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-timeback-primary rounded-full"></div>
          <p className="text-sm font-medium text-timeback-primary font-cal">
            Real Data: Alpha Students Daily Study Hours (2023-24 School Year)
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-timeback-primary font-cal" />
          <h3 className="text-lg font-semibold text-timeback-primary font-cal">
            Actual Hours Spent Learning Per Day
          </h3>
        </div>
        <p className="text-sm text-timeback-primary font-cal">
          Distribution of daily study hours across 500+ Alpha students
        </p>
      </div>

      {/* Line Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={hourlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="student" 
              label={{ value: 'Students (ordered by study time)', position: 'insideBottom', offset: -10 }}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis 
              label={{ value: 'Hours per School Day', angle: -90, position: 'insideLeft' }}
              domain={[0, 3.5]}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value: number) => [`${value} hours`, 'Study Time']}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="hours" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false}
            />
            {/* Average line */}
            <Line 
              type="monotone" 
              dataKey={() => 1.8} 
              stroke="#a855f7" 
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
              name="Average (1.8 hours)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-3 text-center border border-timeback-primary font-cal">
          <p className="text-xs text-timeback-primary font-cal">Highest</p>
          <p className="text-xl font-bold text-timeback-primary font-cal">2.9h</p>
          <p className="text-xs text-timeback-primary font-cal">per day</p>
        </div>
        <div className="bg-timeback-bg rounded-xl p-3 text-center border border-timeback-primary font-cal">
          <p className="text-xs text-timeback-primary font-cal">Average</p>
          <p className="text-xl font-bold text-timeback-primary font-cal">1.8h</p>
          <p className="text-xs text-timeback-primary font-cal">per day</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-timeback-primary font-cal">
          <p className="text-xs text-timeback-primary font-cal">Lowest</p>
          <p className="text-xl font-bold text-timeback-primary font-cal">0.2h</p>
          <p className="text-xs text-timeback-primary font-cal">per day</p>
        </div>
      </div>

      {/* Quarterly Sessions */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-timeback-primary mb-3 flex items-center gap-2 font-cal">
          <Users className="w-4 h-4 text-timeback-primary font-cal" />
          2-Hour Learning Sessions by Quarter
        </h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={quarterlyData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="quarter" 
                tick={{ fill: '#6b7280', fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 11 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="math" fill="#3b82f6" name="Math" />
              <Bar dataKey="language" fill="#60a5fa" name="Language" />
              <Bar dataKey="reading" fill="#93c5fd" name="Reading" />
              <Bar dataKey="science" fill="#dbeafe" name="Science" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 p-3 bg-timeback-bg rounded-xl">
        <p className="text-xs text-timeback-primary font-cal">
          <strong>Key Finding:</strong> Despite spending less than 2 hours per day on average, 
          Alpha students consistently achieve 99th percentile results. No student needs more 
          than 3 hours daily to master grade level content.
        </p>
      </div>
    </div>
  );
}