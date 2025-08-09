'use client';

import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, MapPinIcon, AcademicCapIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface School {
  id: string;
  name: string;
  type: 'alpha' | 'other' | 'special';
  city: string;
  state: string;
  images: number;
  totalAssets: number;
  description?: string;
  address?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  fullAddress?: string;
}

interface SchoolFinderProps {
  onSchoolSelect: (school: School) => void;
  selectedSchool?: School | null;
}

export default function SchoolFinder({ onSchoolSelect }: SchoolFinderProps) {
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  // Load schools from the marketing index and enrich with address data
  useEffect(() => {
    const loadSchools = async () => {
      try {
        // Load basic school data from marketing index
        const response = await fetch('/schools/brand-safe-marketing-index.json');
        const data = await response.json();
        
        // Load address data from marketing images API
        const addressResponse = await fetch('/api/marketing-images?limit=200');
        const addressData = await addressResponse.json();
        
        // Create a map of school address data
        const addressMap = new Map();
        addressData.images?.forEach((image: any) => {
          if (image.school && !addressMap.has(image.school.id)) {
            addressMap.set(image.school.id, {
              address: image.school.address,
              city: image.school.city,
              state: image.school.state,
              zipCode: image.school.zipCode,
              phone: image.school.phone,
              email: image.school.email,
              website: image.school.website,
              fullAddress: image.school.fullAddress
            });
          }
        });
        
        // Transform and merge the school data
        const transformedSchools: School[] = data.schools.map((school: any) => {
          const addressInfo = addressMap.get(school.id);
          return {
            id: school.id,
            name: school.name,
            type: school.type,
            city: addressInfo?.city || (school.city === 'Unknown' ? 'Location TBD' : school.city),
            state: addressInfo?.state || (school.state === 'Unknown' ? '' : school.state),
            images: school.images,
            totalAssets: school.totalAssets,
            description: getSchoolDescription(school.name, school.type),
            address: addressInfo?.address,
            zipCode: addressInfo?.zipCode,
            phone: addressInfo?.phone,
            email: addressInfo?.email,
            website: addressInfo?.website,
            fullAddress: addressInfo?.fullAddress
          };
        });

        setSchools(transformedSchools);
        setFilteredSchools(transformedSchools);
      } catch (error) {
        console.error('Error loading schools:', error);
        // Use fallback data if API fails
        const fallbackData = getFallbackSchools();
        setSchools(fallbackData);
        setFilteredSchools(fallbackData);
        console.log('Using fallback school data due to load error');
      } finally {
        setIsLoading(false);
      }
    };

    loadSchools();
  }, []);

  // Filter schools based on search and filters
  useEffect(() => {
    let filtered = schools;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(school => 
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.state.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(school => school.type === selectedType);
    }

    // Apply state filter
    if (selectedState !== 'all') {
      filtered = filtered.filter(school => school.state === selectedState);
    }

    setFilteredSchools(filtered);
  }, [searchTerm, selectedType, selectedState, schools]);

  // Get unique states for filter
  const availableStates = Array.from(new Set(schools.map(school => school.state).filter(Boolean))).sort();

  const getSchoolDescription = (name: string, _type: string): string => {
    if (name.includes('Alpha')) {
      return "Alpha Schools provide AI-powered, personalized education that adapts to each student's learning pace and style.";
    } else if (name.includes('GT')) {
      return "GT School focuses on gifted and talented students with accelerated learning programs.";
    } else if (name.includes('NextGen')) {
      return "NextGen Academy offers innovative STEM-focused education for future leaders.";
    }
    return "A forward-thinking educational institution committed to student success and innovation.";
  };

  const getFallbackSchools = (): School[] => [
    {
      id: 'alpha-austin',
      name: 'Alpha School | Austin',
      type: 'alpha',
      city: 'Austin',
      state: 'TX',
      images: 79,
      totalAssets: 98,
      description: "Alpha Schools provide AI-powered, personalized education that adapts to each student's learning pace and style.",
      address: '1201 Spyglass Drive',
      zipCode: '78746',
      phone: '(512) 555-0101',
      email: 'admissions.austin@alpha.school',
      website: 'https://alpha.school/austin/',
      fullAddress: '1201 Spyglass Drive, Austin, TX 78746'
    },
    {
      id: 'alpha-high-austin',
      name: 'Alpha High School | Austin',
      type: 'alpha',
      city: 'Austin',
      state: 'TX',
      images: 2,
      totalAssets: 6,
      description: "Alpha High School offers advanced AI-powered education for high school students.",
      address: '201 Colorado Street',
      zipCode: '78701',
      phone: '(512) 555-0102',
      email: 'admissions.austin@alpha.school',
      website: 'https://go.alpha.school/high-school',
      fullAddress: '201 Colorado Street, Austin, TX 78701'
    },
    {
      id: 'gt-school',
      name: 'GT School',
      type: 'other',
      city: 'Texas',
      state: 'TX',
      images: 10,
      totalAssets: 12,
      description: "GT School focuses on gifted and talented students with accelerated learning programs.",
      address: 'Multiple Locations',
      zipCode: '75000',
      phone: '(972) 555-0300',
      email: 'info@gtschool.org',
      website: 'https://gtschool.org/',
      fullAddress: 'Multiple Locations, Texas, TX 75000'
    },

    {
      id: 'nextgen-academy-austin',
      name: 'NextGen Academy | Austin',
      type: 'special',
      city: 'Austin',
      state: 'TX',
      images: 0,
      totalAssets: 0,
      description: "Unlocking potential through gamification and 2-hour AI learning model for 3rd-8th grade students.",
      address: '13915 US-183',
      zipCode: '78717',
      phone: '(512) 222-4065',
      email: 'info@nextgenacademy.school',
      website: 'https://nextgenacademy.school/',
      fullAddress: '13915 US-183, Austin, TX 78717'
    },
    {
      id: 'texas-sports-academy',
      name: 'Texas Sports Academy',
      type: 'special',
      city: 'Texas',
      state: 'TX',
      images: 1,
      totalAssets: 3,
      description: "Combining athletic excellence with academic achievement through innovative sports-focused education.",
      address: 'To Be Determined',
      zipCode: '75000',
      phone: '(214) 555-0500',
      email: 'info@texassportsacademy.org',
      website: 'https://texassportsacademy.org/',
      fullAddress: 'To Be Determined, Texas, TX 75000'
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
          case 'alpha': return 'bg-timeback-bg text-timeback-primary';
    case 'other': return 'bg-timeback-bg text-timeback-primary';
    case 'special': return 'bg-timeback-bg text-timeback-primary';
    default: return 'bg-timeback-bg text-timeback-primary';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'alpha': return 'Alpha School';
      case 'other': return 'Partner School';
      case 'special': return 'Special Program';
      default: return 'School';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border border-timeback-primary p-8">
          <div className="animate-pulse">
            <div className="h-6 bg-timeback-bg rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-timeback-bg rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-timeback-bg rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl border border-timeback-primary p-6">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-timeback-primary mb-2 flex items-center font-cal">
            <AcademicCapIcon className="w-6 h-6 text-timeback-primary mr-2 font-cal" />
            Find a TimeBack School Near You
          </h3>
          <p className="text-timeback-primary font-cal">
            Discover innovative schools in your area that use TimeBack methodology to accelerate learning.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-timeback-primary w-5 h-5 font-cal" />
            <input
              type="text"
              placeholder="Search by school name, city, or state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-timeback-primary rounded-xl focus:ring-2 focus:ring-timeback-primary focus:border-timeback-primary transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-timeback-primary rounded-xl focus:ring-2 focus:ring-timeback-primary focus:border-timeback-primary transition-colors"
            >
              <option value="all">All School Types</option>
              <option value="alpha">Alpha Schools</option>
              <option value="other">Partner Schools</option>
              <option value="special">Special Programs</option>
            </select>

            {availableStates.length > 0 && (
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="px-4 py-2 border border-timeback-primary rounded-xl focus:ring-2 focus:ring-timeback-primary focus:border-timeback-primary transition-colors"
              >
                <option value="all">All States</option>
                {availableStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-timeback-primary font-cal">
            Found {filteredSchools.length} school{filteredSchools.length !== 1 ? 's' : ''}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* School List */}
        <div className="space-y-3">
          {filteredSchools.length === 0 ? (
            <div className="text-center py-8 font-cal">
                              <AcademicCapIcon className="w-12 h-12 text-timeback-primary mx-auto mb-4 font-cal" />
              <p className="text-timeback-primary mb-2 font-cal">No schools found matching your criteria</p>
              <p className="text-sm text-timeback-primary font-cal">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredSchools.map((school) => (
              <button
                key={school.id}
                onClick={() => {
                  setSelectedSchool(school);
                  onSchoolSelect(school);
                }}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-2xl ${
                  selectedSchool?.id === school.id
                    ? 'border-timeback-primary bg-timeback-bg shadow-2xl'
                    : 'border-timeback-primary bg-white hover:border-timeback-primary hover:bg-timeback-bg'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-timeback-primary font-cal">{school.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(school.type)}`}>
                        {getTypeLabel(school.type)}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-timeback-primary mb-2 font-cal">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      <span>
                        {school.fullAddress || `${school.city}${school.state ? `, ${school.state}` : ''}`}
                      </span>
                    </div>
                    
                    {school.phone && (
                      <div className="text-xs text-timeback-primary mb-1 font-cal">
                        <svg className="w-4 h-4 text-timeback-primary inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {school.phone}
                      </div>
                    )}
                    
                    {school.website && (
                      <div className="text-xs text-timeback-primary mb-2 font-cal">
                        <svg className="w-4 h-4 text-timeback-primary inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                        </svg>
                        <a href={school.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          Visit Website
                        </a>
                      </div>
                    )}
                    
                    <p className="text-sm text-timeback-primary mb-2 font-cal">{school.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-timeback-primary font-cal">
                      <span>{school.images} marketing images</span>
                      <span>{school.totalAssets} total assets</span>
                    </div>
                  </div>
                  
                  <ChevronRightIcon className="w-5 h-5 text-timeback-primary font-cal" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Call to Action */}
        {filteredSchools.length > 0 && (
          <div className="mt-6 p-4 bg-timeback-bg rounded-xl border border-timeback-primary">
            <p className="text-sm text-timeback-primary font-cal">
              <strong>Note:</strong> Select a school above to view detailed information, see photos, and learn about their programs.
              {!selectedSchool && " Click on any school to get started!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}