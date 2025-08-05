'use client';

/**
 * Test Page for Student Journey Carousel
 * Allows testing the component with different grade selections
 */

import React, { useState } from 'react';
import StudentJourneyCarousel from '@/components/personalized/StudentJourneyCarousel';
import { Grade } from '@/types/quiz';

const AVAILABLE_GRADES: Grade[] = [
  'K', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'
];

export default function TestStudentJourneysPage() {
  const [selectedGrade, setSelectedGrade] = useState<Grade>('5th');
  const [showComponent, setShowComponent] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-timeback-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-cal font-bold text-timeback-primary mb-4">
            Student Journey Carousel Test Page
          </h1>
          <p className="text-lg font-cal text-timeback-primary opacity-80">
            Select a grade to test the carousel component with real student data
          </p>
        </div>

        {/* Grade Selection Controls */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-timeback-primary p-6 mb-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-cal font-bold text-timeback-primary mb-4">
            Test Controls
          </h2>
          
          <div className="space-y-4">
            {/* Grade Selector */}
            <div>
              <label htmlFor="grade-select" className="block text-lg font-cal font-semibold text-timeback-primary mb-2">
                Select Grade:
              </label>
              <select
                id="grade-select"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value as Grade)}
                className="w-full px-4 py-3 border-2 border-timeback-primary rounded-xl font-cal text-timeback-primary focus:outline-none focus:ring-2 focus:ring-timeback-primary focus:border-transparent"
              >
                {AVAILABLE_GRADES.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade === 'K' ? 'Kindergarten' : `${grade} Grade`}
                  </option>
                ))}
              </select>
            </div>

            {/* Test Button */}
            <button
              onClick={() => setShowComponent(true)}
              className="w-full bg-timeback-primary text-white px-6 py-3 rounded-xl font-cal font-semibold hover:bg-timeback-primary/90 transition-colors duration-200"
            >
              Load Student Journeys for {selectedGrade === 'K' ? 'Kindergarten' : `${selectedGrade} Grade`}
            </button>

            {/* Reset Button */}
            {showComponent && (
              <button
                onClick={() => setShowComponent(false)}
                className="w-full bg-timeback-primary text-white px-6 py-3 rounded-xl font-cal font-semibold hover:bg-timeback-primary/80 transition-colors duration-200"
              >
                Reset Component
              </button>
            )}
          </div>
        </div>

        {/* API Info */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-timeback-primary p-6 mb-8 max-w-4xl mx-auto">
          <h3 className="text-xl font-cal font-bold text-timeback-primary mb-3">
            API Endpoint Info
          </h3>
          <div className="bg-timeback-bg rounded-xl p-4 font-mono text-sm">
            <div className="text-timeback-primary">
              <strong>Endpoint:</strong> /api/student-journeys?grade={selectedGrade === 'K' ? '0' : selectedGrade.replace(/\D/g, '')}&limit=8
            </div>
            <div className="text-timeback-primary mt-2">
              <strong>Logic:</strong> 
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>First tries exact grade match</li>
                <li>If &lt;4 students, expands to ±1 grade</li>
                <li>If still &lt;4 students, expands to ±2 grades</li>
                <li>Returns up to 8 students with growth data</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Component Display Area */}
        {showComponent && (
          <div className="bg-white rounded-xl shadow-lg border-2 border-timeback-primary p-6 max-w-6xl mx-auto">
            <h3 className="text-2xl font-cal font-bold text-timeback-primary mb-6 text-center">
              Live Component Test - {selectedGrade === 'K' ? 'Kindergarten' : `${selectedGrade} Grade`}
            </h3>
            
            {/* The actual component */}
            <StudentJourneyCarousel 
              grade={selectedGrade}
              schoolName="Test School"
            />
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-timeback-primary p-6 mt-8 max-w-4xl mx-auto">
          <h3 className="text-xl font-cal font-bold text-timeback-primary mb-3">
            Testing Instructions
          </h3>
          <div className="space-y-2 font-cal text-timeback-primary">
            <p>• <strong>Grade Selection:</strong> Choose any grade from Kindergarten to 12th</p>
            <p>• <strong>Data Source:</strong> Real anonymized student data from Supabase</p>
            <p>• <strong>Carousel:</strong> Scroll horizontally to see all student cards</p>
            <p>• <strong>Details:</strong> Click &ldquo;View Full Journey&rdquo; to see detailed modal</p>
            <p>• <strong>Responsive:</strong> Test on different screen sizes</p>
            <p>• <strong>Loading:</strong> Watch for smooth loading animations</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center mt-8">
          <a
            href="/personalized"
            className="inline-block bg-timeback-bg text-timeback-primary px-6 py-3 rounded-xl font-cal font-semibold hover:bg-timeback-bg/80 transition-colors duration-200"
          >
            ← Back to Personalized Page
          </a>
        </div>
      </div>
    </div>
  );
}