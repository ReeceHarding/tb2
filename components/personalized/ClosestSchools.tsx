'use client';

import React, { useState, useEffect } from 'react';
import { findClosestSchools, getSchoolLevelColor, SchoolLocation } from '@/libs/school-locations';

interface QuizData {
  userType: string;
  parentSubType?: string;
  selectedSchools: Array<{
    id: string;
    name: string;
    city: string;
    state: string;
    level: string;
  }>;
  // learningGoals: string[]; - removed
  kidsInterests: string[];
  numberOfKids: number;
}

interface ClosestSchoolsProps {
  quizData: QuizData;
}

interface SchoolWithDistance extends SchoolLocation {
  distance: number;
}

export default function ClosestSchools({ quizData }: ClosestSchoolsProps) {
  const [closestSchools, setClosestSchools] = useState<SchoolWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Only show this section if user has selected schools (indicating they went through school search)
  const hasSelectedSchools = quizData.selectedSchools && quizData.selectedSchools.length > 0;
  
  // Get the first selected school for location reference
  const primarySchool = hasSelectedSchools ? quizData.selectedSchools[0] : null;

  useEffect(() => {
    const fetchClosestSchools = async () => {
      if (!hasSelectedSchools || !primarySchool) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const schools = await findClosestSchools(primarySchool.city, primarySchool.state, 3);
        setClosestSchools(schools);
      } catch (err) {
        console.error('Error finding closest schools:', err);
        setError('Unable to find nearby schools at this time.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClosestSchools();
  }, [hasSelectedSchools, primarySchool]);

  // Don't render if user didn't select schools or if there are no schools to show
  if (!hasSelectedSchools || (!isLoading && closestSchools.length === 0)) {
    return null;
  }

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="text-center font-cal">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-timeback-primary mx-auto"></div>
          <p className="mt-4 text-timeback-primary font-cal">Finding schools near you...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-7xl mx-auto py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="text-center font-cal">
          <p className="text-timeback-primary font-cal">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-timeback-bg">
      <div className="text-center mb-12 font-cal">
        <h2 className="text-3xl lg:text-5xl font-bold text-timeback-primary mb-6 font-cal">
          Schools Near You
        </h2>
        <p className="text-xl text-timeback-primary max-w-3xl mx-auto font-cal">
          {`Based on your location near ${primarySchool?.city}, ${primarySchool?.state}, here are the closest schools in your area. Compare their performance with what TimeBack students achieve.`}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {closestSchools.map((school, index) => (
          <div
            key={school.id}
            className="bg-white rounded-xl shadow-2xl overflow-hidden hover:shadow-2xl transition-shadow duration-300"
          >
            {/* School header with level and distance */}
            <div className="bg-timeback-primary text-white p-4 font-cal">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium px-2 py-1 rounded ${getSchoolLevelColor(school.level)} text-timeback-primary bg-white`}>
                  {school.level} School
                </span>
                {school.distance > 0 && (
                  <span className="text-sm bg-timeback-primary px-2 py-1 rounded font-cal">
                    {Math.round(school.distance)} miles away
                  </span>
                )}
              </div>
            </div>

            {/* School details */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-timeback-primary mb-2 font-cal">
                {school.name}
              </h3>
              
              {/* Rating and rank info */}
              <div className="flex items-center gap-4 mb-4">
                {school.rating > 0 && (
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1 font-cal">★</span>
                    <span className="text-sm font-medium font-cal">{school.rating}/10</span>
                  </div>
                )}
                {school.rank && school.rankTotal && (
                  <div className="text-sm text-timeback-primary font-cal">
                    #{school.rank} of {school.rankTotal.toLocaleString()}
                  </div>
                )}
              </div>
              
              <div className="space-y-3 mb-4">
                {/* Address */}
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-timeback-primary mt-0.5 flex-shrink-0 font-cal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="text-timeback-primary text-sm font-cal">
                    {school.address.street && <div>{school.address.street}</div>}
                    <div>{`${school.address.city}, ${school.address.state}${school.address.zipCode ? ' ' + school.address.zipCode : ''}`}</div>
                  </div>
                </div>

                {/* Grades */}
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-timeback-primary flex-shrink-0 font-cal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-timeback-primary text-sm font-cal">Grades {school.grades}</span>
                </div>

                {/* Enrollment */}
                {school.enrollment && (
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-timeback-primary flex-shrink-0 font-cal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-timeback-primary text-sm font-cal">{school.enrollment.toLocaleString()} students</span>
                  </div>
                )}

                {/* Phone */}
                {school.phone && (
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-timeback-primary flex-shrink-0 font-cal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-timeback-primary text-sm font-cal">{school.phone}</span>
                  </div>
                )}
              </div>

              {/* School features */}
              {school.features && school.features.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {school.features.slice(0, 3).map((feature, featureIndex) => (
                      <span
                        key={featureIndex}
                        className="inline-block bg-timeback-bg text-timeback-primary text-xs px-2 py-1 rounded font-cal"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex space-x-3">
                {school.website && (
                  <a
                    href={school.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-timeback-primary text-white text-center py-2 px-4 rounded-xl hover:bg-timeback-primary transition-colors duration-200 text-sm font-medium font-cal"
                  >
                    View Details
                  </a>
                )}
                {school.phone && (
                  <a
                    href={`tel:${school.phone}`}
                    className="flex-1 border border-timeback-primary text-timeback-primary text-center py-2 px-4 rounded-xl hover:bg-timeback-bg transition-colors duration-200 text-sm font-medium font-cal"
                  >
                    Call School
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to action */}
      <div className="mt-12 text-center font-cal">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-timeback-primary mb-4 font-cal">
            See How TimeBack Compares
          </h3>
          <p className="text-timeback-primary mb-6 font-cal">
            {`These schools represent the current educational landscape near you. See how TimeBack's AI-powered approach can help your child achieve 99th percentile results while mastering ${quizData.kidsInterests.slice(0, 2).join(' and ')}.`}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-timeback-primary text-white px-8 py-3 rounded-xl hover:bg-timeback-primary transition-colors duration-200 font-medium font-cal">
              Compare with TimeBack
            </button>
            <button className="border border-timeback-primary text-timeback-primary px-8 py-3 rounded-xl hover:bg-timeback-bg transition-colors duration-200 font-medium font-cal">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
