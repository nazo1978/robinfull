'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight, FiClock, FiPackage, FiShield } from 'react-icons/fi';
import Countdown from '@/components/Countdown';
import LotteryHighlight from '@/components/LotteryHighlight';
import DynamicPricingBanner from '@/components/DynamicPricingBanner';
import DynamicBanners from '@/components/DynamicBanners';
import SafeImage from '@/components/SafeImage';
import categoryService, { Category } from '@/services/CategoryService';
import productService from '@/services/ProductService';

interface ProductImage {
  url: string;
  alt: string;
}

interface Product {
  id: string;
  _id?: string; // Backward compatibility
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  images?: ProductImage[];
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  categoryId?: string;
  categoryName?: string;
  stock?: number;
  stockQuantity?: number;
  featured?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdDate?: string;
  modifiedDate?: string;
}

interface Auction {
  _id: string;
  productId: {
    _id: string;
    name: string;
    images: (string | ProductImage)[];
    category: string;
  };
  startPrice: number;
  currentPrice: number;
  reservePrice: number;
  minIncrement: number;
  startTime: string;
  endTime: string;
  status: string;
  bids: any[];
  bidCount: number;
}

interface ExchangeProduct {
  _id: string;
  name: string;
  description: string;
  images: ProductImage[];
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  condition: string;
  estimatedValue: number;
  location: string | {
    city: string;
    district: string;
  };
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: {
    _id: string;
    name: string;
    username?: string;
  };
}

const benefits = [
  {
    title: "Güvenli Alışveriş",
    description: "En son güvenlik teknolojileriyle korunan ödeme sistemi.",
    icon: (props: any) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    )
  },
  {
    title: "Hızlı Teslimat",
    description: "Siparişleriniz en hızlı şekilde kapınıza teslim edilir.",
    icon: (props: any) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    )
  },
  {
    title: "7/24 Destek",
    description: "Müşteri hizmetlerimiz her zaman yanınızda.",
    icon: (props: any) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
      </svg>
    )
  }
];

export default function Home() {
  const [activeAuctions, setActiveAuctions] = useState<Auction[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [exchangeProducts, setExchangeProducts] = useState<ExchangeProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newProducts, setNewProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [isExchangeLoading, setIsExchangeLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isNewProductsLoading, setIsNewProductsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [newProductsError, setNewProductsError] = useState<string | null>(null);

  // Site ayarları
  const [sectionVisibility, setSectionVisibility] = useState({
    featuredProducts: true,
    dynamicBanners: true,
    dynamicPricing: true,
    lotterySection: true,
    exchangeSection: true,
    auctionSection: true,
    categories: true
  });
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    const fetchActiveAuctions = async () => {
      try {
        setIsLoading(true);
        // Açık artırmalar şimdilik devre dışı - MongoDB backend gerekli
        setActiveAuctions([]);
      } catch (err) {
        setError('Açık artırmalar yüklenirken bir hata oluştu');
        setActiveAuctions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchFeaturedProducts = async () => {
      try {
        setIsProductsLoading(true);
        // Önce yeni backend'i dene
        const response = await fetch('http://localhost:5128/api/products');

        if (!response.ok) {
          throw new Error('Öne çıkan ürünler yüklenirken bir hata oluştu');
        }

        const data = await response.json();
        console.log('Featured products API response:', data);

        // Backend direkt array dönüyor
        if (Array.isArray(data)) {
          // Sadece aktif ürünleri al ve ilk 8'ini göster
          const activeProducts = data.filter(product => product.isActive !== false).slice(0, 8);
          setFeaturedProducts(activeProducts);
        } else if (data.success && data.products) {
          setFeaturedProducts(data.products);
        } else {
          setFeaturedProducts([]);
        }
      } catch (err) {
        setProductsError('Öne çıkan ürünler yüklenirken bir hata oluştu');
        setFeaturedProducts([]);
      } finally {
        setIsProductsLoading(false);
      }
    };

    const fetchExchangeProducts = async () => {
      try {
        setIsExchangeLoading(true);
        // Takas ürünleri şimdilik devre dışı - MongoDB backend gerekli
        setExchangeProducts([]);
      } catch (err) {
        setExchangeError('Takas ürünleri yüklenirken bir hata oluştu');
        setExchangeProducts([]);
      } finally {
        setIsExchangeLoading(false);
      }
    };

    const fetchSectionVisibility = async () => {
      try {
        // Site ayarları şimdilik varsayılan değerlerle
        setSectionVisibility({
          featuredProducts: true,
          dynamicBanners: false, // Şimdilik kapalı
          dynamicPricing: false, // Şimdilik kapalı
          lotterySection: false, // Şimdilik kapalı
          exchangeSection: false, // Şimdilik kapalı
          auctionSection: false, // Şimdilik kapalı
          categories: true
        });
      } catch (err) {
        // Site ayarları yüklenirken hata
      } finally {
        setSettingsLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        setIsCategoriesLoading(true);
        const response = await categoryService.getCategories();

        if (response.success && response.data) {
          setCategories(response.data);
        } else {
          setCategoriesError('Kategoriler yüklenirken bir hata oluştu');
        }
      } catch (err) {
        setCategoriesError('Kategoriler yüklenirken bir hata oluştu');
        setCategories([]);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    const fetchNewProducts = async () => {
      try {
        setIsNewProductsLoading(true);
        const response = await productService.getAllProducts({ limit: 8 });

        if (response.success && response.data) {
          // Backend'ten gelen data yapısına göre ayarla
          const products = response.data.products || response.data || [];
          setNewProducts(products);
        } else {
          setNewProductsError('Yeni ürünler yüklenirken bir hata oluştu');
        }
      } catch (err) {
        setNewProductsError('Yeni ürünler yüklenirken bir hata oluştu');
        setNewProducts([]);
      } finally {
        setIsNewProductsLoading(false);
      }
    };

    fetchActiveAuctions();
    fetchFeaturedProducts();
    fetchExchangeProducts();
    fetchSectionVisibility();
    fetchCategories();
    fetchNewProducts();

    // Her 30 saniyede bir güncelle
    const interval = setInterval(() => {
      fetchActiveAuctions();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            RobinHood ile Alışveriş Deneyiminizi Keşfedin
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-3xl text-gray-600 dark:text-gray-300">
            Güvenli ödeme seçenekleri, hızlı teslimat ve benzersiz açık artırma fırsatlarıyla alışverişin yeni adresi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/products" className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Alışverişe Başla
            </Link>
            {sectionVisibility.lotterySection && (
              <Link href="/lotteries" className="px-8 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                Çekilişlere Katıl
              </Link>
            )}
            {sectionVisibility.auctionSection && (
              <Link href="/auctions" className="px-8 py-3 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                Açık Artırmaları Keşfet
              </Link>
            )}
            {sectionVisibility.exchangeSection && (
              <Link href="/exchange" className="px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                Takas Ürünlerini İncele
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Dynamic Banners */}
      {sectionVisibility.dynamicBanners && <DynamicBanners />}

      {/* Featured Products */}
      {sectionVisibility.featuredProducts && (
      <section className="py-12">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">Öne Çıkan Ürünler</h2>

        {isProductsLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : productsError ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400 mb-4">{productsError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300 mb-4">Öne çıkan ürün bulunmuyor.</p>
            <Link
              href="/products"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Tüm Ürünleri Görüntüle
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => {
              const productId = product.id || product._id;
              const stockQuantity = product.stockQuantity || product.stock || 0;
              const categoryName = product.categoryName || (typeof product.category === 'object' ? product.category?.name : product.category) || 'Kategori Yok';

              return (
                <div key={productId} className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full">
                  <div className="relative h-56 overflow-hidden flex-shrink-0 bg-gray-50 dark:bg-gray-700">
                    <SafeImage
                      src={product.imageUrl ? [{ url: product.imageUrl, alt: product.imageAlt || product.name }] : (product.images || [])}
                      alt={product.imageAlt || product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-contain group-hover:scale-105 transition-transform duration-300 p-2"
                      fallbackText="Resim yok"
                    />
                    {product.discountPercentage && product.discountPercentage > 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
                        %{product.discountPercentage} İndirim
                      </div>
                    )}
                    {stockQuantity <= 5 && stockQuantity > 0 && (
                      <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
                        Son {stockQuantity} Adet
                      </div>
                    )}
                    {stockQuantity === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-semibold">Stokta Yok</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="mb-2">
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide">
                        {categoryName}
                      </span>
                    </div>

                    <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white line-clamp-2">
                      {product.name}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          {product.discountPercentage && product.discountPercentage > 0 && product.originalPrice ? (
                            <>
                              <span className="text-lg font-bold text-gray-900 dark:text-white">
                                {product.price?.toLocaleString('tr-TR')} ₺
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                {product.originalPrice.toLocaleString('tr-TR')} ₺
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {product.price?.toLocaleString('tr-TR')} ₺
                            </span>
                          )}
                        </div>
                      </div>

                      <Link
                        href={`/products/${productId}`}
                        className={`w-full py-2 px-4 rounded-md text-center font-medium transition-colors ${
                          stockQuantity > 0
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {stockQuantity > 0 ? 'Detayları Gör' : 'Stokta Yok'}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {featuredProducts.length > 0 && (
          <div className="text-center mt-8">
            <Link
              href="/products"
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              Tüm Ürünleri Görüntüle
              <FiArrowRight />
            </Link>
          </div>
        )}
      </section>
      )}

      {/* Lottery Highlight */}
      {sectionVisibility.lotterySection && <LotteryHighlight />}

      {/* Active Auctions */}
      {sectionVisibility.auctionSection && (
      <section className="py-12 bg-gray-50 dark:bg-gray-800 -mx-4 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">Aktif Açık Artırmalar</h2>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          ) : activeAuctions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300 mb-4">Şu anda aktif açık artırma bulunmuyor.</p>
              <Link
                href="/auctions"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Tüm Açık Artırmaları Görüntüle
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeAuctions.map((auction) => (
                <div key={auction._id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative h-48 md:w-1/3 mb-4 md:mb-0 overflow-hidden rounded-md bg-gray-50 dark:bg-gray-700">
                      <SafeImage
                        src={auction.productId?.images}
                        alt={auction.productId?.name || 'Ürün'}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-contain p-2"
                        fallbackText="Resim yok"
                      />
                    </div>
                    <div className="md:w-2/3">
                      <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">
                        {auction.productId?.name || 'İsimsiz Ürün'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">Bu özel ürün için açık artırmaya katılın.</p>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Başlangıç Fiyatı:</span>
                          <span className="text-gray-900 dark:text-white">{auction.startPrice.toLocaleString()} ₺</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Mevcut Teklif:</span>
                          <span className="font-bold text-gray-900 dark:text-white">{auction.currentPrice.toLocaleString()} ₺</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Teklif Sayısı:</span>
                          <span className="text-gray-900 dark:text-white">{auction.bidCount || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Kalan Süre:</span>
                          <span className="font-medium text-red-600 dark:text-red-400">
                            <Countdown targetDate={new Date(auction.endTime)} />
                          </span>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Link
                            href={`/auctions/${auction._id}`}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
                          >
                            Detayları Gör
                          </Link>
                          <Link
                            href={`/auctions/${auction._id}`}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            Teklif Ver
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeAuctions.length > 0 && (
            <div className="text-center mt-8">
              <Link
                href="/auctions"
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                Tüm Açık Artırmaları Görüntüle
                <FiArrowRight />
              </Link>
            </div>
          )}
        </div>
      </section>
      )}

      {/* Exchange Products */}
      {sectionVisibility.exchangeSection && (
      <section className="py-12 bg-green-50 dark:bg-green-900/10 -mx-4 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">Takas Ürünleri</h2>

          {isExchangeLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            </div>
          ) : exchangeError ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400 mb-4">{exchangeError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          ) : exchangeProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300 mb-4">Şu anda takas için ürün bulunmuyor.</p>
              <Link
                href="/exchange"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Tüm Takas Ürünlerini Görüntüle
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {exchangeProducts.map((product) => (
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
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
                      Takas
                    </div>
                    <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
                      {product.condition}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mb-2">
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium uppercase tracking-wide">
                        {typeof product.category === 'object' ? product.category.name : product.category}
                      </span>
                    </div>

                    <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white line-clamp-2">
                      {product.name}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            ~{product.estimatedValue.toLocaleString('tr-TR')} ₺
                          </span>
                          <span className="text-sm text-gray-500">
                            Tahmini Değer
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {typeof product.location === 'object' && product.location !== null
                              ? `${(product.location as any).city || ''}, ${(product.location as any).district || ''}`.replace(/^,\s*|,\s*$/g, '') || 'Konum belirtilmemiş'
                              : product.location || 'Konum belirtilmemiş'
                            }
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/exchange/${product._id}`}
                        className="w-full py-2 px-4 rounded-md text-center font-medium transition-colors bg-green-600 text-white hover:bg-green-700"
                      >
                        Detayları Gör
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {exchangeProducts.length > 0 && (
            <div className="text-center mt-8">
              <Link
                href="/exchange"
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors inline-flex items-center gap-2"
              >
                Tüm Takas Ürünlerini Görüntüle
                <FiArrowRight />
              </Link>
            </div>
          )}
        </div>
      </section>
      )}

      {/* Categories Section */}
      {sectionVisibility.categories && (
      <section className="py-12">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">Kategoriler</h2>

        {isCategoriesLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : categoriesError ? (
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 mb-4">{categoriesError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-300">Kategori bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.id}`}
                className="group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                  <FiPackage className="text-blue-600 dark:text-blue-300 text-2xl" />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
      )}

      {/* New Products Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800 -mx-4 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">Yeni Ürünler</h2>

          {isNewProductsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : newProductsError ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400 mb-4">{newProductsError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          ) : newProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300 mb-4">Yeni ürün bulunmuyor.</p>
              <Link
                href="/products"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Tüm Ürünleri Görüntüle
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newProducts.map((product) => (
                <div key={product.id} className="bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full">
                  <div className="relative h-56 overflow-hidden flex-shrink-0 bg-gray-50 dark:bg-gray-600">
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FiPackage className="text-4xl" />
                    </div>
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
                      Yeni
                    </div>
                    {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                      <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
                        Son {product.stockQuantity} Adet
                      </div>
                    )}
                    {product.stockQuantity === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-semibold">Stokta Yok</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white line-clamp-2">
                      {product.name}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-1">
                      {product.description}
                    </p>

                    <div className="flex flex-col gap-3 mt-auto">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {product.price?.toLocaleString('tr-TR')} ₺
                        </span>
                      </div>

                      <Link
                        href={`/products/${product.id}`}
                        className={`w-full py-2 px-4 rounded-md text-center font-medium transition-colors ${
                          product.stockQuantity > 0
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {product.stockQuantity > 0 ? 'Detayları Gör' : 'Stokta Yok'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {newProducts.length > 0 && (
            <div className="text-center mt-8">
              <Link
                href="/products"
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                Tüm Ürünleri Görüntüle
                <FiArrowRight />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Dynamic Pricing Banner */}
      {sectionVisibility.dynamicPricing && <DynamicPricingBanner />}
      {/* Features */}
      <section className="py-12">
        <h2 className="text-3xl font-bold mb-12 text-center text-gray-800 dark:text-white">Neden RobinHoot?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                <benefit.icon className="text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{benefit.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>


    </div>
  );
}
