'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  XMarkIcon, 
  MapPinIcon, 
  AcademicCapIcon, 
  PhotoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BuildingOffice2Icon,
  UsersIcon
} from '@heroicons/react/24/outline';

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

interface MarketingImage {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  category: string;
  contentType: string;
  school: {
    id: string;
    name: string;
    type: string;
  };
}

interface SchoolPreviewProps {
  school: School;
  onClose: () => void;
  onBack: () => void;
}

export default function SchoolPreview({ school, onClose, onBack }: SchoolPreviewProps) {
  const [marketingImages, setMarketingImages] = useState<MarketingImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Load marketing images for this school
  useEffect(() => {
    const loadMarketingImages = async () => {
      setIsLoadingImages(true);
      setImageError(false);
      
      try {
        const response = await fetch(`/api/marketing-images?schoolId=${school.id}&limit=20`);
        const data = await response.json();
        
        if (data.images && data.images.length > 0) {
          setMarketingImages(data.images);
        } else {
          // Fallback to showing all images from this school type if no specific school images
          const fallbackResponse = await fetch(`/api/marketing-images?schoolType=${school.type}&limit=10`);
          const fallbackData = await fallbackResponse.json();
          setMarketingImages(fallbackData.images || []);
        }
      } catch (error) {
        console.error('Error loading marketing images:', error);
        setImageError(true);
      } finally {
        setIsLoadingImages(false);
      }
    };

    loadMarketingImages();
  }, [school.id, school.type]);

  const getSchoolTypeDescription = (type: string, name: string) => {
    if (name.includes('Alpha')) {
      return {
        title: "AI Powered Personalized Learning",
        description: "Alpha Schools use cutting edge AI technology to create personalized learning experiences that adapt to each student's unique pace, learning style, and interests. Students typically complete traditional coursework 2-3x faster while developing critical thinking and problem-solving skills.",
        features: [
          "AI driven personalized curriculum",
          "2-3x faster learning pace",
          "Real world project based learning",
          "Small class sizes (10-15 students)",
          "Focus on critical thinking and creativity"
        ]
      };
    } else if (name.includes('GT')) {
      return {
        title: "Gifted and Talented Excellence",
        description: "GT School specializes in accelerated learning programs designed for gifted and talented students. Our rigorous curriculum challenges high-achieving students while providing the support they need to reach their full potential.",
        features: [
          "Accelerated academic programs",
          "Advanced STEM curriculum",
          "Gifted education specialists",
          "College preparation focus",
          "Research and innovation projects"
        ]
      };
    } else if (name.includes('NextGen')) {
      return {
        title: "Future-Ready STEM Education",
        description: "NextGen Academy prepares students for tomorrow's challenges with innovative STEM-focused education, entrepreneurship programs, and cutting edge technology integration.",
        features: [
          "STEM-focused curriculum",
          "Entrepreneurship training",
          "Technology integration",
          "Industry partnerships",
          "Innovation labs and makerspaces"
        ]
      };
    }
    
    return {
      title: "Innovative Educational Excellence",
      description: "A forward-thinking educational institution committed to student success through innovative teaching methods, personalized attention, and comprehensive student support.",
      features: [
        "Innovative teaching methods",
        "Personalized student attention",
        "Comprehensive support services",
        "Modern learning environment",
        "College and career preparation"
      ]
    };
  };

  const schoolInfo = getSchoolTypeDescription(school.type, school.name);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'alpha': return 'bg-timeback-primary text-white';
      case 'other': return 'bg-timeback-primary text-white';
      case 'special': return 'bg-timeback-primary text-white';
      default: return 'bg-timeback-primary text-white';
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

  const nextImage = () => {
    if (marketingImages.length > 0) {
      setSelectedImageIndex((prev) => (prev + 1) % marketingImages.length);
    }
  };

  const prevImage = () => {
    if (marketingImages.length > 0) {
      setSelectedImageIndex((prev) => (prev - 1 + marketingImages.length) % marketingImages.length);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl border border-timeback-primary overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-timeback-primary to-timeback-primary text-white p-6 font-cal">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center text-white hover:text-white/80 transition-colors font-cal"
            >
              <ChevronLeftIcon className="w-5 h-5 mr-1" />
              Back to School List
            </button>
            <button
              onClick={onClose}
              className="text-white hover:text-white/80 transition-colors font-cal"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 font-cal">{school.name}</h2>
              <div className="space-y-2 text-white font-cal">
                <div className="flex items-center">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  <span>
                    {school.fullAddress || `${school.city}${school.state ? `, ${school.state}` : ''}`}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm font-cal">
                  {school.phone && (
                    <span className="flex items-center">
                  <svg className="w-4 h-4 text-timeback-primary mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {school.phone}
                </span>
                  )}
                  {school.website && (
                    <a 
                      href={school.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:underline"
                    >
                      <svg className="w-4 h-4 text-timeback-primary inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                      </svg>
                      Visit Website
                    </a>
                  )}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(school.type)}`}>
                    {getTypeLabel(school.type)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 p-6">
          {/* School Information */}
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-timeback-primary mb-3 flex items-center font-cal">
                <AcademicCapIcon className="w-6 h-6 text-timeback-primary mr-2 font-cal" />
                {schoolInfo.title}
              </h3>
              <p className="text-timeback-primary leading-relaxed font-cal">
                {schoolInfo.description}
              </p>
            </div>

            {/* Key Features */}
            <div className="mb-6">
              <h4 className="font-semibold text-timeback-primary mb-3 flex items-center font-cal">
                <BuildingOffice2Icon className="w-5 h-5 text-timeback-primary mr-2 font-cal" />
                Key Features
              </h4>
              <ul className="space-y-2">
                {schoolInfo.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-timeback-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-timeback-primary font-cal">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* School Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-timeback-bg p-4 rounded-xl border border-timeback-primary">
                <div className="flex items-center mb-2">
                  <PhotoIcon className="w-5 h-5 text-timeback-primary mr-2 font-cal" />
                  <span className="font-semibold text-timeback-primary font-cal">Marketing Assets</span>
                </div>
                <p className="text-2xl font-bold text-timeback-primary font-cal">{school.images}</p>
                <p className="text-sm text-timeback-primary font-cal">Brand-safe images</p>
              </div>
              
              <div className="bg-timeback-bg p-4 rounded-xl border border-timeback-primary">
                <div className="flex items-center mb-2">
                  <UsersIcon className="w-5 h-5 text-timeback-primary mr-2 font-cal" />
                  <span className="font-semibold text-timeback-primary font-cal">Total Resources</span>
                </div>
                <p className="text-2xl font-bold text-timeback-primary font-cal">{school.totalAssets}</p>
                <p className="text-sm text-timeback-primary font-cal">Available assets</p>
              </div>
            </div>

            {/* Contact Information Placeholder */}
            <div className="bg-timeback-bg p-4 rounded-xl border border-timeback-primary">
              <h4 className="font-semibold text-timeback-primary mb-2 font-cal">Interested in Learning More?</h4>
              <p className="text-sm text-timeback-primary mb-3 font-cal">
                Contact this school directly to learn about enrollment, programs, and availability.
              </p>
              <button className="w-full bg-timeback-primary text-white py-2 px-4 rounded-xl hover:bg-timeback-primary transition-colors font-medium font-cal">
                Get School Contact Information
              </button>
            </div>
          </div>

          {/* Marketing Images Gallery */}
          <div>
            <h4 className="font-semibold text-timeback-primary mb-4 flex items-center font-cal">
              <PhotoIcon className="w-5 h-5 text-timeback-primary mr-2 font-cal" />
              School Photos & Marketing Materials
            </h4>

            {isLoadingImages ? (
              <div className="bg-timeback-bg rounded-xl aspect-video flex items-center justify-center">
                <div className="animate-pulse text-timeback-primary font-cal">Loading images...</div>
              </div>
            ) : imageError || marketingImages.length === 0 ? (
              <div className="bg-gradient-to-br from-timeback-bg to-white rounded-xl aspect-video flex flex-col items-center justify-center border border-timeback-primary">
                <div className="bg-timeback-bg p-4 rounded-full mb-4">
                  <PhotoIcon className="w-8 h-8 text-timeback-primary font-cal" />
                </div>
                <h4 className="text-lg font-semibold text-timeback-primary mb-2 font-cal">Coming Soon</h4>
                <p className="text-timeback-primary text-center max-w-sm px-4 font-cal">
                  {imageError ? 
                    'We\'re working on loading marketing materials for this school. Please check back soon!' : 
                    'Marketing photos and materials for this school are being prepared. Contact the school directly for more information.'}
                </p>
                <div className="mt-4 px-4 py-2 bg-timeback-bg text-timeback-primary rounded-xl text-sm font-cal">
                  <svg className="w-4 h-4 text-timeback-primary inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Contact school for current photos and information
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Main Image Display */}
                <div className="relative bg-timeback-bg rounded-xl overflow-hidden aspect-video">
                  <Image
                    src={marketingImages[selectedImageIndex]?.imageUrl || ''}
                    alt={marketingImages[selectedImageIndex]?.title || 'School image'}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src = marketingImages[selectedImageIndex]?.thumbnailUrl || '';
                    }}
                  />
                  
                  {/* Navigation Arrows */}
                  {marketingImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity font-cal"
                      >
                        <ChevronLeftIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity font-cal"
                      >
                        <ChevronRightIcon className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  {marketingImages.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm font-cal">
                      {selectedImageIndex + 1} / {marketingImages.length}
                    </div>
                  )}
                </div>

                {/* Image Info */}
                {marketingImages[selectedImageIndex] && (
                  <div className="bg-timeback-bg p-3 rounded-xl border border-timeback-primary">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-timeback-primary font-cal">
                        {marketingImages[selectedImageIndex].title}
                      </span>
                      <span className="text-xs bg-timeback-bg text-timeback-primary px-2 py-1 rounded-full font-cal">
                        {marketingImages[selectedImageIndex].category}
                      </span>
                    </div>
                    <p className="text-sm text-timeback-primary font-cal">
                      {marketingImages[selectedImageIndex].description}
                    </p>
                  </div>
                )}

                {/* Thumbnail Strip */}
                {marketingImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {marketingImages.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                          index === selectedImageIndex 
                            ? 'border-timeback-primary ring-2 ring-timeback-bg' 
                            : 'border-timeback-primary hover:border-timeback-primary'
                        }`}
                      >
                        <Image
                          src={image.thumbnailUrl || ''}
                          alt={image.title || 'School thumbnail'}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}