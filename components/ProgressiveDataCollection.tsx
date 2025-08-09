'use client';

import React, { useState } from 'react';
import { getMissingData, getRequiredDataForSection, SECTION_SCHEMAS } from '@/libs/section-schemas';

interface ProgressiveDataCollectionProps {
  sectionId: string;
  currentData: Record<string, any>;
  onDataCollected: (data: Record<string, any>) => void;
  onCancel: () => void;
}

// Field type configurations
const FIELD_CONFIGS: Record<string, {
  type: 'text' | 'select' | 'multiselect' | 'number' | 'textarea';
  label: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: (value: any) => string | null;
}> = {
  studentGrade: {
    type: 'select',
    label: 'What grade is your child in?',
    options: [
      { value: 'K', label: 'Kindergarten' },
      { value: '1', label: '1st Grade' },
      { value: '2', label: '2nd Grade' },
      { value: '3', label: '3rd Grade' },
      { value: '4', label: '4th Grade' },
      { value: '5', label: '5th Grade' },
      { value: '6', label: '6th Grade' },
      { value: '7', label: '7th Grade' },
      { value: '8', label: '8th Grade' },
      { value: '9', label: '9th Grade' },
      { value: '10', label: '10th Grade' },
      { value: '11', label: '11th Grade' },
      { value: '12', label: '12th Grade' }
    ]
  },
  
  userLocation: {
    type: 'text',
    label: 'What is your ZIP code?',
    placeholder: 'Enter your ZIP code',
    validation: (value: string) => {
      if (!value) return 'ZIP code is required';
      if (!/^\d{5}(-\d{4})?$/.test(value)) return 'Please enter a valid ZIP code';
      return null;
    }
  },
  
  selectedSchools: {
    type: 'multiselect',
    label: 'Which TimeBack schools are you interested in?',
    options: [
      { value: 'austin', label: 'TimeBack Austin' },
      { value: 'houston', label: 'TimeBack Houston' },
      { value: 'dallas', label: 'TimeBack Dallas' },
      { value: 'miami', label: 'TimeBack Miami' },
      { value: 'nyc', label: 'TimeBack New York' },
      { value: 'chicago', label: 'TimeBack Chicago' },
      { value: 'sf', label: 'TimeBack San Francisco' },
      { value: 'la', label: 'TimeBack Los Angeles' }
    ]
  },
  
  academicGoals: {
    type: 'multiselect',
    label: 'What are your academic goals for your child?',
    options: [
      { value: 'excellence', label: 'Academic Excellence' },
      { value: 'accelerated', label: 'Accelerated Learning' },
      { value: 'catchup', label: 'Catch Up to Grade Level' },
      { value: 'enrichment', label: 'Enrichment & Exploration' },
      { value: 'test-prep', label: 'Test Preparation' },
      { value: 'college-ready', label: 'College Readiness' }
    ]
  },
  
  subjects: {
    type: 'multiselect',
    label: 'Which subjects are most important?',
    options: [
      { value: 'math', label: 'Mathematics' },
      { value: 'reading', label: 'Reading & Literature' },
      { value: 'science', label: 'Science' },
      { value: 'writing', label: 'Writing' },
      { value: 'history', label: 'History & Social Studies' },
      { value: 'languages', label: 'Foreign Languages' },
      { value: 'arts', label: 'Arts & Music' },
      { value: 'stem', label: 'STEM/Technology' }
    ]
  },
  
  timePreference: {
    type: 'select',
    label: 'What\'s your preferred learning time?',
    options: [
      { value: 'morning', label: 'Morning (8 AM - 12 PM)' },
      { value: 'afternoon', label: 'Afternoon (12 PM - 4 PM)' },
      { value: 'flexible', label: 'Flexible Schedule' },
      { value: 'split', label: 'Split Sessions' }
    ]
  },
  
  question: {
    type: 'text',
    label: 'What would you like to know?',
    placeholder: 'Ask any question about TimeBack education...'
  },
  
  userContext: {
    type: 'textarea',
    label: 'Tell us a bit about your situation',
    placeholder: 'Share any relevant context about your child or family...'
  },
  
  interests: {
    type: 'multiselect',
    label: 'What are your child\'s interests?',
    options: [
      { value: 'sports', label: 'Sports & Athletics' },
      { value: 'music', label: 'Music & Performance' },
      { value: 'art', label: 'Visual Arts' },
      { value: 'technology', label: 'Technology & Coding' },
      { value: 'science', label: 'Science & Research' },
      { value: 'reading', label: 'Reading & Writing' },
      { value: 'outdoors', label: 'Outdoor Activities' },
      { value: 'games', label: 'Games & Puzzles' }
    ]
  },
  
  familySize: {
    type: 'number',
    label: 'How many children do you have?',
    placeholder: 'Number of children'
  },
  
  currentEducationCost: {
    type: 'text',
    label: 'What\'s your current education spending?',
    placeholder: 'e.g., $500/month or $0'
  },
  
  parentSchedule: {
    type: 'select',
    label: 'What\'s your work schedule like?',
    options: [
      { value: 'full-time', label: 'Full-time (9-5)' },
      { value: 'part-time', label: 'Part-time' },
      { value: 'remote', label: 'Remote/Flexible' },
      { value: 'shift', label: 'Shift Work' },
      { value: 'home', label: 'Stay-at-home Parent' }
    ]
  },
  
  currentChallenges: {
    type: 'multiselect',
    label: 'What are your current challenges?',
    options: [
      { value: 'homework-battles', label: 'Daily Homework Battles' },
      { value: 'time-management', label: 'Time Management' },
      { value: 'academic-performance', label: 'Academic Performance' },
      { value: 'school-commute', label: 'School Commute' },
      { value: 'after-school', label: 'After-school Activities' },
      { value: 'work-balance', label: 'Work-Life Balance' },
      { value: 'multiple-kids', label: 'Managing Multiple Kids' }
    ]
  },
  
  subject: {
    type: 'select',
    label: 'Which subject would you like to focus on?',
    options: [
      { value: 'math', label: 'Mathematics' },
      { value: 'science', label: 'Science' },
      { value: 'english', label: 'English/Language Arts' },
      { value: 'history', label: 'History/Social Studies' },
      { value: 'foreign-language', label: 'Foreign Language' },
      { value: 'arts', label: 'Arts & Creative' },
      { value: 'technology', label: 'Technology/Computer Science' }
    ]
  },
  
  learningGoal: {
    type: 'text',
    label: 'What specific learning goal would you like to achieve?',
    placeholder: 'E.g., Master multiplication tables, improve reading comprehension, prepare for SATs...'
  },

};

export default function ProgressiveDataCollection({
  sectionId,
  currentData,
  onDataCollected,
  onCancel
}: ProgressiveDataCollectionProps) {
  const schema = SECTION_SCHEMAS[sectionId];
  const missingFields = getMissingData(sectionId, currentData);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  if (!schema || missingFields.length === 0) {
    return null;
  }
  
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    
    missingFields.forEach(field => {
      if (!formData[field] || (Array.isArray(formData[field]) && formData[field].length === 0)) {
        newErrors[field] = 'This field is required';
      }
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Combine with existing data and submit
    onDataCollected({
      ...currentData,
      ...formData
    });
  };
  
  const renderField = (fieldName: string) => {
    const config = FIELD_CONFIGS[fieldName] || {
      type: 'text',
      label: fieldName.replace(/([A-Z])/g, ' $1').trim()
    };
    
    switch (config.type) {
      case 'select':
        return (
          <div key={fieldName} className="mb-6">
            <label className="block text-lg font-bold text-timeback-primary mb-3 font-cal">
              {config.label}
            </label>
            <select
              value={formData[fieldName] || ''}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-timeback-primary rounded-xl text-timeback-primary font-cal focus:ring-2 focus:ring-timeback-primary focus:border-transparent outline-none"
            >
              <option value="">Select an option</option>
              {config.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors[fieldName] && (
              <p className="mt-2 text-red-600 text-sm font-cal">{errors[fieldName]}</p>
            )}
          </div>
        );
        
      case 'multiselect':
        return (
          <div key={fieldName} className="mb-6">
            <label className="block text-lg font-bold text-timeback-primary mb-3 font-cal">
              {config.label}
            </label>
            <div className="space-y-2">
              {config.options?.map(option => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={(formData[fieldName] || []).includes(option.value)}
                    onChange={(e) => {
                      const current = formData[fieldName] || [];
                      if (e.target.checked) {
                        handleFieldChange(fieldName, [...current, option.value]);
                      } else {
                        handleFieldChange(fieldName, current.filter((v: string) => v !== option.value));
                      }
                    }}
                    className="w-5 h-5 text-timeback-primary bg-white border-2 border-timeback-primary rounded focus:ring-timeback-primary"
                  />
                  <span className="text-timeback-primary font-cal">{option.label}</span>
                </label>
              ))}
            </div>
            {errors[fieldName] && (
              <p className="mt-2 text-red-600 text-sm font-cal">{errors[fieldName]}</p>
            )}
          </div>
        );
        
      case 'textarea':
        return (
          <div key={fieldName} className="mb-6">
            <label className="block text-lg font-bold text-timeback-primary mb-3 font-cal">
              {config.label}
            </label>
            <textarea
              value={formData[fieldName] || ''}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              placeholder={config.placeholder}
              rows={4}
              className="w-full px-4 py-3 bg-white border-2 border-timeback-primary rounded-xl text-timeback-primary placeholder-timeback-primary/50 font-cal focus:ring-2 focus:ring-timeback-primary focus:border-transparent outline-none resize-none"
            />
            {errors[fieldName] && (
              <p className="mt-2 text-red-600 text-sm font-cal">{errors[fieldName]}</p>
            )}
          </div>
        );
        
      case 'number':
        return (
          <div key={fieldName} className="mb-6">
            <label className="block text-lg font-bold text-timeback-primary mb-3 font-cal">
              {config.label}
            </label>
            <input
              type="number"
              value={formData[fieldName] || ''}
              onChange={(e) => handleFieldChange(fieldName, parseInt(e.target.value))}
              placeholder={config.placeholder}
              className="w-full px-4 py-3 bg-white border-2 border-timeback-primary rounded-xl text-timeback-primary placeholder-timeback-primary/50 font-cal focus:ring-2 focus:ring-timeback-primary focus:border-transparent outline-none"
            />
            {errors[fieldName] && (
              <p className="mt-2 text-red-600 text-sm font-cal">{errors[fieldName]}</p>
            )}
          </div>
        );
        
      default:
        return (
          <div key={fieldName} className="mb-6">
            <label className="block text-lg font-bold text-timeback-primary mb-3 font-cal">
              {config.label}
            </label>
            <input
              type="text"
              value={formData[fieldName] || ''}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              placeholder={config.placeholder}
              className="w-full px-4 py-3 bg-white border-2 border-timeback-primary rounded-xl text-timeback-primary placeholder-timeback-primary/50 font-cal focus:ring-2 focus:ring-timeback-primary focus:border-transparent outline-none"
            />
            {errors[fieldName] && (
              <p className="mt-2 text-red-600 text-sm font-cal">{errors[fieldName]}</p>
            )}
          </div>
        );
    }
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-timeback-primary">
      <h2 className="text-2xl font-bold text-timeback-primary mb-2 font-cal">
        {schema.name}
      </h2>
      <p className="text-lg text-timeback-primary mb-6 font-cal">
        We need a bit more information to personalize this section for you.
      </p>
      
      <form onSubmit={handleSubmit}>
        {missingFields.map(field => renderField(field))}
        
        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            className="flex-1 bg-timeback-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-timeback-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl font-cal"
          >
            Continue
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border-2 border-timeback-primary text-timeback-primary rounded-xl font-bold hover:bg-timeback-bg/20 transition-all duration-300 font-cal"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}