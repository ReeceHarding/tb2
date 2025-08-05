'use client';

import React, { useState } from 'react';

// School Search Component
export function SchoolSearchCollector({ 
  onNext, 
  onPrev 
}: { 
  onNext: (schools: any[]) => void;
  onPrev: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const searchSchools = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/schools/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
      if (!response.ok) {
        throw new Error('Failed to search schools');
      }
      
      const data = await response.json();
      setSearchResults(data.schools || []);
    } catch (err) {
      console.error('School search error:', err);
      setError('Failed to search schools. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSchool = (school: any) => {
    setSelectedSchool(school);
    onNext([school]);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 backdrop-blur-md bg-white/10 rounded-xl shadow-lg border-2 border-timeback-primary">
      <h2 className="text-2xl font-bold text-timeback-primary mb-4 font-cal">
        Which school does your child attend?
      </h2>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                searchSchools();
              }
            }}
            placeholder="Search by school name or location..."
            className="flex-1 px-4 py-2 border-2 border-timeback-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-timeback-bg font-cal"
          />
          <button
            onClick={searchSchools}
            disabled={isSearching || !searchQuery.trim()}
            className="px-6 py-2 bg-timeback-primary text-white rounded-xl font-bold hover:bg-opacity-90 disabled:opacity-50 transition-all font-cal"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {error && (
          <p className="text-red-600 text-sm font-cal">{error}</p>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {searchResults.map((school) => (
              <button
                key={school.id}
                onClick={() => handleSelectSchool(school)}
                className="w-full text-left p-4 border-2 border-timeback-primary rounded-xl hover:bg-timeback-bg transition-all font-cal"
              >
                <div className="font-bold text-timeback-primary">{school.name}</div>
                <div className="text-sm text-timeback-primary opacity-75">
                  {school.city}, {school.state} • {school.level}
                </div>
              </button>
            ))}
          </div>
        )}

        {searchResults.length === 0 && searchQuery && !isSearching && (
          <p className="text-timeback-primary opacity-75 text-center py-4 font-cal">
            No schools found. Try a different search term.
          </p>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={onPrev}
          className="px-6 py-2 border-2 border-timeback-primary text-timeback-primary rounded-xl font-bold hover:bg-timeback-bg transition-all font-cal"
        >
          Back
        </button>
        
        <button
          onClick={() => onNext([])}
          className="px-6 py-2 text-timeback-primary underline font-cal"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

// Grade Selection Component
export function GradeCollector({ 
  onNext, 
  onPrev 
}: { 
  onNext: (grade: string) => void;
  onPrev: () => void;
}) {
  const [selectedGrade, setSelectedGrade] = useState<string>('');

  const grades = [
    { value: 'kindergarten', label: 'Kindergarten' },
    { value: 'elementary', label: 'Elementary (1-5)' },
    { value: 'middle', label: 'Middle School (6-8)' },
    { value: 'high', label: 'High School (9-12)' }
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 backdrop-blur-md bg-white/10 rounded-xl shadow-lg border-2 border-timeback-primary">
      <h2 className="text-2xl font-bold text-timeback-primary mb-4 font-cal">
        What grade is your child in?
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {grades.map((grade) => (
          <button
            key={grade.value}
            onClick={() => setSelectedGrade(grade.value)}
            className={`p-4 border-2 rounded-xl font-cal transition-all ${
              selectedGrade === grade.value
                ? 'border-timeback-primary bg-timeback-bg text-timeback-primary'
                : 'border-timeback-primary text-timeback-primary hover:bg-timeback-bg'
            }`}
          >
            {grade.label}
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="px-6 py-2 border-2 border-timeback-primary text-timeback-primary rounded-xl font-bold hover:bg-timeback-bg transition-all font-cal"
        >
          Back
        </button>
        
        <button
          onClick={() => selectedGrade && onNext(selectedGrade)}
          disabled={!selectedGrade}
          className="px-6 py-2 bg-timeback-primary text-white rounded-xl font-bold hover:bg-opacity-90 disabled:opacity-50 transition-all font-cal"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// Interests Selection Component
export function InterestsCollector({ 
  onNext, 
  onPrev 
}: { 
  onNext: (interests: string[]) => void;
  onPrev: () => void;
}) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const interestOptions = [
    'Sports', 'Music', 'Art', 'Science', 'Technology', 'Reading',
    'Gaming', 'Dance', 'Theater', 'Math', 'History', 'Languages',
    'Nature', 'Animals', 'Cooking', 'Building', 'Writing', 'Photography'
  ];

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6 backdrop-blur-md bg-white/10 rounded-xl shadow-lg border-2 border-timeback-primary">
      <h2 className="text-2xl font-bold text-timeback-primary mb-4 font-cal">
        What are your child&apos;s interests?
      </h2>
      <p className="text-timeback-primary opacity-75 mb-6 font-cal">
        Select all that apply. This helps us personalize examples.
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {interestOptions.map((interest) => (
          <button
            key={interest}
            onClick={() => toggleInterest(interest)}
            className={`p-3 border-2 rounded-xl font-cal transition-all ${
              selectedInterests.includes(interest)
                ? 'border-timeback-primary bg-timeback-bg text-timeback-primary'
                : 'border-timeback-primary text-timeback-primary hover:bg-timeback-bg'
            }`}
          >
            {interest}
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="px-6 py-2 border-2 border-timeback-primary text-timeback-primary rounded-xl font-bold hover:bg-timeback-bg transition-all font-cal"
        >
          Back
        </button>
        
        <button
          onClick={() => onNext(selectedInterests)}
          disabled={selectedInterests.length === 0}
          className="px-6 py-2 bg-timeback-primary text-white rounded-xl font-bold hover:bg-opacity-90 disabled:opacity-50 transition-all font-cal"
        >
          Continue ({selectedInterests.length} selected)
        </button>
      </div>
    </div>
  );
}