'use client';

import Image from 'next/image';
import { useState } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  fallbackSrc?: string;
  showErrorMessage?: boolean;
  onError?: () => void;
}

export default function SafeImage({
  src,
  alt,
  fill,
  width,
  height,
  className = '',
  sizes,
  priority = false,
  placeholder,
  fallbackSrc = '/images/image-placeholder.jpg',
  showErrorMessage = false,
  onError,
  ...props
}: SafeImageProps) {
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  console.log(`[SafeImage] Rendering image with src: ${currentSrc}`);
  console.log(`[SafeImage] Error state: ${imageError}`);

  const handleError = () => {
    console.warn(`[SafeImage] Image failed to load: ${currentSrc}`);
    console.log(`[SafeImage] Attempting fallback to: ${fallbackSrc}`);
    
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      console.log(`[SafeImage] Switched to fallback image`);
    } else {
      console.error(`[SafeImage] Fallback image also failed to load`);
      setImageError(true);
    }
    
    if (onError) {
      onError();
    }
  };

  // If both original and fallback failed, show error state
  if (imageError) {
    console.log(`[SafeImage] Rendering error state for alt: ${alt}`);
    
    return (
      <div 
        className={`bg-timeback-bg flex items-center justify-center ${className}`}
        style={fill ? {} : { width, height }}
      >
        {showErrorMessage ? (
          <div className="text-center p-4">
            <div className="text-timeback-primary mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-timeback-primary text-sm font-cal">Image unavailable</p>
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-timeback-bg to-white flex items-center justify-center">
            <svg className="w-12 h-12 text-timeback-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
    );
  }

  console.log(`[SafeImage] Rendering Next.js Image component`);
  
  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={className}
      sizes={sizes}
      priority={priority}
      placeholder={placeholder}
      onError={handleError}
      {...props}
    />
  );
}