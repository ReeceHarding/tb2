'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SafeImage from './SafeImage';

interface MarketingImage {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  filename: string;
  school: {
    id: string;
    name: string;
    type: string;
  };
  category: string;
  contentType: string;
  tags: string[];
  fileSize: number;
  dimensions: {
    width?: number;
    height?: number;
  };
  viewCount: number;
  isFeatured: boolean;
  createdAt: string;
}

interface MarketingImageGalleryProps {
  schoolId?: string;
  schoolType?: 'alpha' | 'other' | 'special';
  category?: string;
  maxImages?: number;
  showFilters?: boolean;
  className?: string;
}

interface ImageModalProps {
  image: MarketingImage | null;
  isOpen: boolean;
  onClose: () => void;
}

// Beautiful image modal component (similar to VideoModal pattern)
const ImageModal: React.FC<ImageModalProps> = ({ image, isOpen, onClose }) => {
  const handleViewCount = useCallback(async () => {
    if (!image) return;
    try {
      await fetch('/api/marketing-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId: image.id })
      });
    } catch (error) {
      console.error('Failed to increment view count:', error);
    }
  }, [image]);

  useEffect(() => {
    if (isOpen && image) {
      handleViewCount();
    }
  }, [isOpen, image, handleViewCount]);

  if (!isOpen || !image) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
      <div className="relative max-w-6xl max-h-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all duration-200 font-cal"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Image */}
        <div className="relative">
          <SafeImage
            src={image.imageUrl}
            alt={image.title}
            width={image.dimensions.width || 800}
            height={image.dimensions.height || 600}
            className="max-w-full max-h-[80vh] object-contain"
            fallbackSrc="/images/image-placeholder.jpg"
            onError={() => {
              console.error('[ImageModal] Error loading image:', image.imageUrl);
            }}
          />
        </div>

        {/* Image info */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-timeback-primary mb-2 font-cal">{image.title}</h3>
          <p className="text-timeback-primary mb-4 font-cal">{image.description}</p>
          
          <div className="flex flex-wrap gap-4 text-sm text-timeback-primary font-cal">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-timeback-primary rounded-full mr-2"></span>
              {image.school.name}
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-timeback-primary rounded-full mr-2"></span>
              {image.category}
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-timeback-primary rounded-full mr-2"></span>
              {image.contentType}
            </span>
            {image.fileSize > 0 && (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-timeback-primary rounded-full mr-2"></span>
                {(image.fileSize / 1024).toFixed(1)}KB
              </span>
            )}
          </div>

          {/* Tags */}
          {image.tags.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {image.tags.slice(0, 8).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-timeback-bg text-timeback-primary text-xs rounded-full font-cal"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Download button */}
          <div className="mt-6">
            <a
              href={image.imageUrl}
              download={image.filename}
              className="inline-flex items-center px-4 py-2 bg-timeback-primary hover:bg-timeback-primary text-white rounded-xl transition-colors duration-200 font-cal"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Image
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main gallery component
export default function MarketingImageGallery({
  schoolId,
  schoolType,
  category,
  maxImages = 12,
  showFilters = true,
  className = ''
}: MarketingImageGalleryProps) {
  const [images, setImages] = useState<MarketingImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<MarketingImage | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(category || '');
  const [categories, setCategories] = useState<string[]>([]);

  // Load marketing images
  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query parameters
        const params = new URLSearchParams();
        if (schoolId) params.append('schoolId', schoolId);
        if (schoolType) params.append('schoolType', schoolType);
        if (selectedCategory) params.append('category', selectedCategory);
        params.append('limit', maxImages.toString());

        const response = await fetch(`/api/marketing-images?${params}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        setImages(data.images || []);

        // Extract unique categories for filter
        if (showFilters && data.images) {
          const uniqueCategories = Array.from(new Set(data.images.map((img: MarketingImage) => img.category))) as string[];
          setCategories(uniqueCategories.sort());
        }

      } catch (err: any) {
        console.error('Error loading marketing images:', err);
        setError('Failed to load marketing images. Please try again later.');
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [schoolId, schoolType, selectedCategory, maxImages, showFilters]);

  if (loading) {
    return (
      <div className={`${className} p-8`}>
        <div className="animate-pulse">
          <div className="h-8 bg-timeback-bg rounded w-64 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-timeback-bg rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} p-8`}>
        <div className="text-center font-cal">
          <div className="w-16 h-16 mx-auto mb-4 text-timeback-primary font-cal">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-timeback-primary mb-2 font-cal">Unable to load images</h3>
          <p className="text-timeback-primary font-cal">{error}</p>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className={`${className} p-8`}>
        <div className="text-center font-cal">
          <div className="w-16 h-16 mx-auto mb-4 text-timeback-primary font-cal">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-timeback-primary mb-2 font-cal">No marketing images found</h3>
          <p className="text-timeback-primary font-cal">No images match your current filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header and Filters */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-timeback-primary mb-4 font-cal">
          Brand-Safe Marketing Materials
        </h2>
        <p className="text-timeback-primary mb-4 font-cal">
          Professional marketing images from our school network. All content is brand-safe and ready for use.
        </p>

        {/* Category filter */}
        {showFilters && categories.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-xl text-sm font-medium font-cal transition-colors duration-200 ${
                selectedCategory === ''
                  ? 'bg-timeback-primary text-white'
                  : 'bg-timeback-bg text-timeback-primary hover:bg-timeback-bg'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium font-cal transition-colors duration-200 ${
                  selectedCategory === cat
                    ? 'bg-timeback-primary text-white'
                    : 'bg-timeback-bg text-timeback-primary hover:bg-timeback-bg'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((image) => (
          <div
            key={image.id}
            onClick={() => setSelectedImage(image)}
            className="group cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden"
          >
            <div className="relative aspect-square">
              <SafeImage
                src={image.thumbnailUrl}
                alt={image.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                fallbackSrc="/images/image-placeholder.jpg"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-12 h-12 text-white font-cal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>

              {/* Featured badge */}
              {image.isFeatured && (
                <div className="absolute top-2 left-2">
                  <span className="bg-timeback-primary text-white text-xs px-2 py-1 rounded-full font-cal">
                    Featured
                  </span>
                </div>
              )}
            </div>

            {/* Image info */}
            <div className="p-4">
              <h3 className="font-semibold text-timeback-primary text-sm mb-1 line-clamp-1 font-cal">
                {image.title}
              </h3>
              <p className="text-xs text-timeback-primary mb-2 line-clamp-1 font-cal">
                {image.school.name}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-timeback-bg text-timeback-primary px-2 py-1 rounded font-cal">
                  {image.category}
                </span>
                {image.viewCount > 0 && (
                  <span className="text-xs text-timeback-primary font-cal">
                    {image.viewCount} views
                  </span>
                )}
              </div>
              
              {/* Adaptive learning paths badge */}
              <div className="flex justify-center mt-4">
                <div className="bg-timeback-primary text-white px-6 py-3 rounded-full text-lg font-bold shadow-2xl group-hover:scale-105 font-cal transition-transform duration-200" role="status" aria-label="Achievement: Adaptive learning paths">
                  Adaptive learning paths
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load more indicator */}
      {images.length >= maxImages && (
        <div className="text-center mt-8 font-cal">
          <p className="text-timeback-primary text-sm font-cal">
            Showing {images.length} images. Use filters to refine results.
          </p>
        </div>
      )}

      {/* Image Modal */}
      <ImageModal
        image={selectedImage}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
}