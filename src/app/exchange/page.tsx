'use client';

import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiHeart, FiShare2, FiEye, FiClock, FiMapPin, FiPlus } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/shared/context/AuthContext';
import { useRouter } from 'next/navigation';
import { formatTitle, formatDescription } from '@/utils/textFormatting';

interface ExchangeProduct {
  _id: string;
  name: string;
  description: string;
  images: string[];
  category: {
    _id: string;
    name: string;
  };
  condition: string;
  conditionText: string;
  estimatedValue: number;
  isUrgent: boolean;
  owner: {
    _id: string;
    name: string;
  };
  location: {
    city: string;
    district: string;
  };
  likes: any[];
  likesCount: number;
  shares: any[];
  sharesCount: number;
  views: number;
  createdAt: string;
  exchangePreferences: {
    categories: any[];
    description: string;
    minValue?: number;
    maxValue?: number;
  };
}

const ExchangePage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<ExchangeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Kategoriler (gerçek API'den gelecek)
  const categories = [
    { _id: '1', name: 'Elektronik' },
    { _id: '2', name: 'Giyim' },
    { _id: '3', name: 'Ev & Yaşam' },
    { _id: '4', name: 'Spor & Outdoor' },
    { _id: '5', name: 'Kitap & Müzik' },
    { _id: '6', name: 'Oyuncak' },
    { _id: '7', name: 'Kozmetik' },
    { _id: '8', name: 'Otomotiv' }
  ];

  const conditions = [
    { value: 'new', label: 'Sıfır' },
    { value: 'like_new', label: 'Sıfır Gibi' },
    { value: 'good', label: 'İyi' },
    { value: 'fair', label: 'Orta' },
    { value: 'poor', label: 'Kötü' }
  ];

  const getAuthToken = () => {
    const authTokenCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('authToken='));
    return authTokenCookie ? authTokenCookie.split('=')[1] : null;
  };

  // Takas ürünlerini getir
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        sortBy,
        sortOrder: 'desc'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedCondition) params.append('condition', selectedCondition);
      if (minValue) params.append('minValue', minValue);
      if (maxValue) params.append('maxValue', maxValue);
      if (showUrgentOnly) params.append('isUrgent', 'true');

      console.log('Exchange Page - Fetching products with params:', params.toString());

      const response = await fetch(`/api/exchange/products?${params}`);

      console.log('Exchange Page - Response status:', response.status);

      if (!response.ok) {
        throw new Error('Takas ürünleri getirilemedi');
      }

      const data = await response.json();
      console.log('Exchange Page - Response data:', data);

      if (data.success) {
        // Backend'den gelen response'da 'products' alanı var, 'items' değil
        setProducts(data.products || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        throw new Error(data.message || 'Bir hata oluştu');
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Takas ürünleri getirme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, sortBy, selectedCategory, selectedCondition, showUrgentOnly]);

  // Arama işlemi
  const handleSearch = () => {
    setCurrentPage(1);
    fetchProducts();
  };

  // Filtreleri temizle
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedCondition('');
    setMinValue('');
    setMaxValue('');
    setShowUrgentOnly(false);
    setCurrentPage(1);
    fetchProducts();
  };

  // Like işlemi
  const handleLike = async (productId: string) => {
    try {
      if (!user) {
        alert('Beğenmek için giriş yapmalısınız');
        router.push('/auth/login');
        return;
      }

      const token = getAuthToken();
      if (!token) {
        alert('Beğenmek için giriş yapmalısınız');
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/exchange/products/${productId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Ürünleri yenile
        fetchProducts();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Beğeni işlemi başarısız');
      }
    } catch (error) {
      console.error('Beğeni hatası:', error);
      alert('Beğeni işlemi sırasında bir hata oluştu');
    }
  };

  // Paylaşım işlemi
  const handleShare = async (productId: string, platform: string) => {
    try {
      if (!user) {
        alert('Paylaşmak için giriş yapmalısınız');
        router.push('/auth/login');
        return;
      }

      const token = getAuthToken();
      if (!token) {
        alert('Paylaşmak için giriş yapmalısınız');
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/exchange/products/${productId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform }),
      });

      if (response.ok) {
        alert('Ürün paylaşıldı!');
        // Ürünleri yenile
        fetchProducts();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Paylaşım işlemi başarısız');
      }
    } catch (error) {
      console.error('Paylaşım hatası:', error);
      alert('Paylaşım işlemi sırasında bir hata oluştu');
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Takas ürünleri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Takas Merkezi</h1>
              <p className="text-gray-600 mt-1">Güvenli ve kolay ürün takası - Sadece onaylı satıcılar ürün ekleyebilir</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Ürün eklemek için</p>
              <p className="text-sm font-medium text-gray-700">Satıcı hesabınızdan giriş yapın</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtreler */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Arama */}
            <div className="lg:col-span-2">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ürün ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>

            {/* Kategori */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Durum */}
            <div>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="">Tüm Durumlar</option>
                {conditions.map(condition => (
                  <option key={condition.value} value={condition.value}>
                    {condition.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Minimum Değer */}
            <div>
              <input
                type="number"
                placeholder="Min. Değer (₺)"
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Maximum Değer */}
            <div>
              <input
                type="number"
                placeholder="Max. Değer (₺)"
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Sıralama */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="createdAt">En Yeni</option>
                <option value="estimatedValue">Değer (Düşük-Yüksek)</option>
                <option value="-estimatedValue">Değer (Yüksek-Düşük)</option>
                <option value="views">En Çok Görüntülenen</option>
              </select>
            </div>

            {/* Acil Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="urgent"
                checked={showUrgentOnly}
                onChange={(e) => setShowUrgentOnly(e.target.checked)}
                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
              />
              <label htmlFor="urgent" className="ml-2 text-sm text-gray-700">
                Sadece Acil
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSearch}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <FiSearch />
              Ara
            </button>
            <button
              onClick={clearFilters}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
            >
              <FiFilter />
              Temizle
            </button>
          </div>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Ürün Listesi */}
        {products.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Henüz takas ürünü bulunmuyor.</p>
            <p className="text-gray-400 mt-2">Onaylı satıcılar dashboard'larından ürün ekleyebilir.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                {/* Ürün Resmi */}
                <div className="relative">
                  <Link href={`/exchange/${product._id}`}>
                    <div className="aspect-square relative overflow-hidden rounded-t-lg">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">Resim yok</span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Acil Badge */}
                  {product.isUrgent && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <FiClock size={12} />
                      ACİL
                    </div>
                  )}

                  {/* Durum Badge */}
                  <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 rounded-full text-xs">
                    {product.conditionText}
                  </div>
                </div>

                {/* Ürün Bilgileri */}
                <div className="p-4">
                  <Link href={`/exchange/${product._id}`}>
                    <h3 className="font-bold text-gray-900 mb-2 hover:text-gray-700 line-clamp-2 uppercase">
                      {formatTitle(product.name)}
                    </h3>
                  </Link>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {formatDescription(product.description)}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-green-600">
                      ₺{product.estimatedValue.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {product.category?.name}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <FiMapPin size={14} className="mr-1" />
                    {product.location.city}, {product.location.district}
                  </div>

                  {/* Takas Tercihleri */}
                  {product.exchangePreferences?.description && (
                    <div className="bg-gray-50 p-2 rounded text-xs text-gray-600 mb-3">
                      <strong>Takas Tercihi:</strong> {product.exchangePreferences.description}
                    </div>
                  )}

                  {/* Sosyal Butonlar */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLike(product._id)}
                        className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <FiHeart size={16} />
                        <span className="text-sm">{product.likesCount}</span>
                      </button>

                      <button
                        onClick={() => handleShare(product._id, 'copy_link')}
                        className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors"
                      >
                        <FiShare2 size={16} />
                        <span className="text-sm">{product.sharesCount}</span>
                      </button>

                      <div className="flex items-center gap-1 text-gray-500">
                        <FiEye size={16} />
                        <span className="text-sm">{product.views}</span>
                      </div>
                    </div>

                    <Link
                      href={`/exchange/${product._id}`}
                      className="bg-black text-white px-3 py-1 rounded text-sm hover:bg-gray-800 transition-colors"
                    >
                      Detay
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sayfalama */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Önceki
              </button>

              <span className="px-4 py-2 bg-black text-white rounded-lg">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExchangePage;
