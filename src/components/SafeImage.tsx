'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FiImage } from 'react-icons/fi';

interface ProductImage {
  url: string;
  alt: string;
}

interface SafeImageProps {
  src?: string | ProductImage | (string | ProductImage)[];
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onError?: () => void;
  fallbackText?: string;
  showPlaceholder?: boolean;
}

const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  sizes,
  priority = false,
  placeholder,
  blurDataURL,
  onError,
  fallbackText = 'Resim yok',
  showPlaceholder = true,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Resim URL'ini çıkar
  const getImageUrl = (): string | null => {
    if (!src) return null;

    // Array ise ilk elemanı al
    if (Array.isArray(src)) {
      if (src.length === 0) return null;
      const firstImage = src[0];
      if (typeof firstImage === 'string') {
        return firstImage.trim() !== '' ? firstImage : null;
      }
      if (firstImage && typeof firstImage === 'object' && firstImage.url) {
        return firstImage.url.trim() !== '' ? firstImage.url : null;
      }
      return null;
    }

    // String ise direkt döndür
    if (typeof src === 'string') {
      return src.trim() !== '' ? src : null;
    }

    // Object ise url'ini al
    if (src && typeof src === 'object' && 'url' in src) {
      return src.url && src.url.trim() !== '' ? src.url : null;
    }

    return null;
  };

  const imageUrl = getImageUrl();
  const hasValidImage = imageUrl && !imageError;

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
    if (onError) {
      onError();
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // Resim yoksa placeholder göster
  if (!hasValidImage) {
    if (!showPlaceholder) return null;

    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 dark:bg-gray-700 ${className}`}
        style={fill ? undefined : { width, height }}
      >
        <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
          <FiImage size={fill ? 24 : Math.min((width || 40) / 2, 24)} className="mb-1" />
          <span className="text-xs text-center">{fallbackText}</span>
        </div>
      </div>
    );
  }

  // Resim varsa Next.js Image component'ini kullan
  const imageProps = {
    src: imageUrl,
    alt,
    className: `${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    onError: handleImageError,
    onLoad: handleImageLoad,
    priority,
    sizes,
    placeholder,
    blurDataURL,
    ...props
  };

  if (fill) {
    return <Image {...imageProps} fill />;
  }

  return <Image {...imageProps} width={width} height={height} />;
};

export default SafeImage;
