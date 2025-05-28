'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiChevronLeft, FiChevronRight, FiGift, FiShoppingBag, FiRefreshCw, FiTrendingUp } from 'react-icons/fi';

interface Banner {
  _id: string;
  title: string;
  description: string;
  type: 'product' | 'giveaway' | 'exchange' | 'auction';
  image: string;
  buttonText: string;
  buttonLink: string;
  backgroundColor: string;
  textColor: string;
  isActive: boolean;
  order: number;
}

const typeIcons = {
  product: FiShoppingBag,
  giveaway: FiGift,
  exchange: FiRefreshCw,
  auction: FiTrendingUp
};

const typeColors = {
  product: 'bg-blue-500',
  giveaway: 'bg-green-500',
  exchange: 'bg-purple-500',
  auction: 'bg-red-500'
};

export default function DynamicBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  // 5 saniyede bir otomatik geçiş
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/banners');
      if (response.ok) {
        const data = await response.json();
        setBanners(data.banners || []);
      } else {
        setError('Bannerlar yüklenemedi');
      }
    } catch (err) {
      console.error('Banner yükleme hatası:', err);
      setError('Bannerlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? banners.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === banners.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
        </div>
      </section>
    );
  }

  if (error || banners.length === 0) {
    return null; // Hata varsa veya banner yoksa hiçbir şey gösterme
  }

  const currentBanner = banners[currentIndex];
  const IconComponent = typeIcons[currentBanner.type];

  return (
    <section className="py-12">
      <div className="max-w-full mx-auto">
        <div className="relative overflow-hidden shadow-2xl">
          {/* Banner İçeriği */}
          <div
            className="relative h-80 md:h-96 lg:h-[500px] flex items-center justify-between px-8 md:px-16 lg:px-24 transition-all duration-500"
            style={{
              backgroundColor: currentBanner.backgroundColor,
              color: currentBanner.textColor
            }}
          >
            {/* Sol Taraf - Metin İçeriği */}
            <div className="flex-1 z-10 max-w-2xl">
              <div className="flex items-center mb-6">
                <div className={`p-3 rounded-full ${typeColors[currentBanner.type]} text-white mr-4`}>
                  <IconComponent size={28} />
                </div>
                <span className="text-base md:text-lg font-medium opacity-90 uppercase tracking-wide">
                  {currentBanner.type === 'product' && 'Ürün'}
                  {currentBanner.type === 'giveaway' && 'Çekiliş'}
                  {currentBanner.type === 'exchange' && 'Takas'}
                  {currentBanner.type === 'auction' && 'Açık Artırma'}
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {currentBanner.title}
              </h2>

              <p className="text-xl md:text-2xl lg:text-3xl mb-8 opacity-90 max-w-2xl leading-relaxed">
                {currentBanner.description}
              </p>

              <Link
                href={currentBanner.buttonLink}
                className="inline-flex items-center px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {currentBanner.buttonText}
                <svg className="ml-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Sağ Taraf - Görsel */}
            <div className="hidden lg:block flex-1 relative">
              <div className="relative w-full h-80 ml-12">
                <Image
                  src={currentBanner.image}
                  alt={currentBanner.title}
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>

            {/* Navigasyon Okları */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-6 top-1/2 transform -translate-y-1/2 p-4 rounded-full bg-black bg-opacity-20 hover:bg-opacity-40 text-white transition-all z-20 backdrop-blur-sm"
                  aria-label="Önceki banner"
                >
                  <FiChevronLeft size={32} />
                </button>

                <button
                  onClick={goToNext}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 p-4 rounded-full bg-black bg-opacity-20 hover:bg-opacity-40 text-white transition-all z-20 backdrop-blur-sm"
                  aria-label="Sonraki banner"
                >
                  <FiChevronRight size={32} />
                </button>
              </>
            )}
          </div>

          {/* Nokta İndikatörleri */}
          {banners.length > 1 && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-white scale-125'
                      : 'bg-white bg-opacity-50 hover:bg-opacity-75 hover:scale-110'
                  }`}
                  aria-label={`Banner ${index + 1}'e git`}
                />
              ))}
            </div>
          )}

          {/* Mobil Görsel */}
          <div className="lg:hidden relative h-48 bg-black bg-opacity-10">
            <Image
              src={currentBanner.image}
              alt={currentBanner.title}
              fill
              className="object-cover opacity-40"
            />
          </div>
        </div>

        {/* Banner Sayısı Göstergesi */}
        {banners.length > 1 && (
          <div className="text-center mt-6 px-4">
            <span className="text-base text-gray-600 bg-white bg-opacity-80 px-4 py-2 rounded-full shadow-sm">
              {currentIndex + 1} / {banners.length}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
