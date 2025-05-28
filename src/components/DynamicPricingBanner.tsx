'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiTrendingDown, FiUsers, FiArrowRight, FiShoppingCart } from 'react-icons/fi';
import SafeImage from './SafeImage';

interface DynamicProduct {
  _id: string;
  name: string;
  price: number;
  originalPrice: number;
  images: string[];
  dynamicPricing: {
    initialStock: number;
    currentStock: number;
    maxDiscountPercentage: number;
    isActive: boolean;
    soldCount: number;
  };
}

export default function DynamicPricingBanner() {
  const [dynamicProducts, setDynamicProducts] = useState<DynamicProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDynamicProducts();
  }, []);

  const fetchDynamicProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/products?hasDynamicPricing=true&limit=4');
      if (response.ok) {
        const data = await response.json();
        setDynamicProducts(data.products || []);
      }
    } catch (error) {
      console.error('Dinamik fiyatlı ürünler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCurrentPrice = (product: DynamicProduct) => {
    if (!product.dynamicPricing.isActive) {
      return product.originalPrice || product.price;
    }

    const { initialStock, currentStock, maxDiscountPercentage } = product.dynamicPricing;
    const basePrice = product.originalPrice || product.price;

    if (initialStock <= 0 || currentStock <= 0) {
      return basePrice;
    }

    const stockRatio = currentStock / initialStock;
    const discountRatio = 1 - stockRatio;
    const currentDiscount = discountRatio * maxDiscountPercentage;

    const discountedPrice = basePrice * (1 - currentDiscount / 100);
    return Math.max(discountedPrice, basePrice * 0.1);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (dynamicProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">🔥 Dinamik Fiyatlama</h2>
            <p className="text-gray-600 dark:text-gray-300">Stok azaldıkça fiyat düşer! Hemen kaçırma!</p>
          </div>
          <Link
            href="/products"
            className="mt-4 md:mt-0 flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Tüm Ürünleri Gör <FiArrowRight className="ml-2" />
          </Link>
        </div>

        {/* Dinamik Fiyatlı Ürünler */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dynamicProducts.map((product) => {
            const currentPrice = calculateCurrentPrice(product);
            const originalPrice = product.originalPrice || product.price;
            const discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
            const stockPercentage = (product.dynamicPricing.currentStock / product.dynamicPricing.initialStock) * 100;

            return (
              <div key={product._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="relative h-56 overflow-hidden bg-gray-50 dark:bg-gray-700">
                  <SafeImage
                    src={product.images}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-contain group-hover:scale-105 transition-transform duration-300 p-2"
                    fallbackText="Resim yok"
                  />

                  {/* İndirim Badge */}
                  {discountPercentage > 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      %{discountPercentage} İNDİRİM
                    </div>
                  )}

                  {/* Stok Durumu */}
                  <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                    {product.dynamicPricing.currentStock} adet kaldı
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Stok Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Stok Durumu</span>
                      <span>%{Math.round(stockPercentage)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          stockPercentage > 50 ? 'bg-green-500' :
                          stockPercentage > 20 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${stockPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Fiyat */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {currentPrice.toLocaleString('tr-TR')} ₺
                      </span>
                      {discountPercentage > 0 && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          {originalPrice.toLocaleString('tr-TR')} ₺
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/products/${product._id}`}
                    className="w-full py-2 px-4 rounded-md text-center font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <FiShoppingCart size={16} />
                    Detayları Gör
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-black rounded-full p-3 mr-4">
              <FiTrendingDown className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Nasıl Çalışır?</h3>
              <p className="text-gray-600">Dinamik fiyatlandırma sistemi, talebe ve stok durumuna göre fiyatları otomatik olarak günceller.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-md shadow-sm">
              <div className="flex items-center mb-2">
                <FiUsers className="mr-2 text-blue-600" />
                <h4 className="font-medium">Talep Analizi</h4>
              </div>
              <p className="text-sm text-gray-600">Ürünlere olan talep sürekli analiz edilir ve fiyatlar buna göre güncellenir.</p>
            </div>

            <div className="bg-white p-4 rounded-md shadow-sm">
              <div className="flex items-center mb-2">
                <FiTrendingDown className="mr-2 text-green-600" />
                <h4 className="font-medium">Toplu Alım İndirimi</h4>
              </div>
              <p className="text-sm text-gray-600">Daha fazla ürün satın alarak daha yüksek indirim oranlarından faydalanın.</p>
            </div>

            <div className="bg-white p-4 rounded-md shadow-sm">
              <div className="flex items-center mb-2">
                <FiArrowRight className="mr-2 text-purple-600" />
                <h4 className="font-medium">Fiyat Geçmişi</h4>
              </div>
              <p className="text-sm text-gray-600">Ürünlerin fiyat geçmişini görüntüleyerek en uygun zamanda alışveriş yapın.</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4">Dinamik Fiyatlandırma Nasıl Çalışır?</h3>
          <p className="text-gray-600 mb-6 max-w-3xl mx-auto">
            Dinamik fiyatlandırma sistemi sayesinde ürün fiyatları talebe, stok durumuna ve satın alma miktarına göre otomatik olarak güncellenir.
            Daha fazla ürün satın alarak daha yüksek indirimlerden faydalanabilirsiniz.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrendingDown className="text-blue-600" size={24} />
              </div>
              <h4 className="font-semibold mb-2">Akıllı Fiyatlandırma</h4>
              <p className="text-sm text-gray-600">Talep ve stok durumuna göre fiyatlar otomatik olarak güncellenir</p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="text-green-600" size={24} />
              </div>
              <h4 className="font-semibold mb-2">Toplu Alım İndirimi</h4>
              <p className="text-sm text-gray-600">Daha fazla ürün alarak daha yüksek indirim oranlarından faydalanın</p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiArrowRight className="text-purple-600" size={24} />
              </div>
              <h4 className="font-semibold mb-2">Gerçek Zamanlı</h4>
              <p className="text-sm text-gray-600">Fiyat değişiklikleri anında ürün sayfalarında görüntülenir</p>
            </div>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Dinamik Fiyatlı Ürünleri Keşfet <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}