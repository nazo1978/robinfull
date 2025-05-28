'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiHeart, FiShare2, FiEye, FiClock, FiMapPin, FiUser, FiTag, FiMessageSquare, FiArrowLeft } from 'react-icons/fi';
import Image from 'next/image';
import { useAuth } from '@/shared/context/AuthContext';
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
    email: string;
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
  status: string;
}

const ExchangeProductDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [product, setProduct] = useState<ExchangeProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const getAuthToken = () => {
    const authTokenCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('authToken='));
    return authTokenCookie ? authTokenCookie.split('=')[1] : null;
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/exchange/products/${params.id}`);

      if (!response.ok) {
        throw new Error('Ürün bulunamadı');
      }

      const data = await response.json();

      if (data.success) {
        setProduct(data.product);
        // Kullanıcının bu ürünü beğenip beğenmediğini kontrol et
        // Bu bilgi backend'den gelecek
      } else {
        throw new Error(data.message || 'Bir hata oluştu');
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Ürün getirme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  // Like işlemi
  const handleLike = async () => {
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

      const response = await fetch(`/api/exchange/products/${params.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        // Ürünü yenile
        fetchProduct();
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
  const handleShare = async (platform: string) => {
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

      const response = await fetch(`/api/exchange/products/${params.id}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform }),
      });

      if (response.ok) {
        alert('Ürün paylaşıldı!');

        // Platform'a göre paylaşım URL'si oluştur
        const url = window.location.href;
        const text = `${product?.name} - Takas Merkezi`;

        switch (platform) {
          case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
            break;
          case 'twitter':
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
            break;
          case 'whatsapp':
            window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`);
            break;
          case 'copy_link':
            navigator.clipboard.writeText(url);
            alert('Link kopyalandı!');
            break;
        }
        // Ürünü yenile
        fetchProduct();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Paylaşım işlemi başarısız');
      }
    } catch (error) {
      console.error('Paylaşım hatası:', error);
      alert('Paylaşım işlemi sırasında bir hata oluştu');
    }
  };

  // Teklif verme modalını aç
  const handleMakeOffer = () => {
    if (!user) {
      alert('Teklif vermek için giriş yapmalısınız');
      router.push('/auth/login');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert('Teklif vermek için giriş yapmalısınız');
      router.push('/auth/login');
      return;
    }

    if (product?.owner._id === user.id) {
      alert('Kendi ürününüze teklif veremezsiniz');
      return;
    }

    setShowOfferModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Ürün yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Ürün bulunamadı'}</p>
          <button
            onClick={() => router.back()}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Geri Butonu */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-black mb-6 transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          Geri Dön
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sol Taraf - Resimler */}
          <div className="space-y-4">
            {/* Ana Resim */}
            <div className="aspect-square relative overflow-hidden rounded-lg bg-white shadow-sm">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Resim yok</span>
                </div>
              )}

              {/* Acil Badge */}
              {product.isUrgent && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <FiClock size={14} />
                  ACİL
                </div>
              )}

              {/* Durum Badge */}
              <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded-full text-sm">
                {product.conditionText}
              </div>
            </div>

            {/* Küçük Resimler */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square relative overflow-hidden rounded-lg border-2 ${
                      currentImageIndex === index ? 'border-black' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sağ Taraf - Ürün Bilgileri */}
          <div className="space-y-6">
            {/* Başlık ve Temel Bilgiler */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4 uppercase">{formatTitle(product.name)}</h1>

              <div className="flex items-center gap-4 mb-4">
                <span className="text-2xl font-bold text-green-600">
                  ₺{product.estimatedValue.toLocaleString()}
                </span>
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                  {product.category.name}
                </span>
              </div>

              <div className="flex items-center text-gray-600 mb-4">
                <FiMapPin className="mr-2" size={16} />
                {product.location.city}, {product.location.district}
              </div>

              <div className="flex items-center text-gray-600 mb-6">
                <FiUser className="mr-2" size={16} />
                {product.owner.name}
              </div>
            </div>

            {/* Sosyal Butonlar */}
            <div className="flex items-center gap-4 py-4 border-y border-gray-200">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isLiked
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FiHeart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                <span>{product.likesCount}</span>
              </button>

              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                  <FiShare2 size={18} />
                  <span>{product.sharesCount}</span>
                </button>

                {/* Paylaşım Dropdown */}
                <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                  >
                    Facebook
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                  >
                    Twitter
                  </button>
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => handleShare('copy_link')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                  >
                    Linki Kopyala
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <FiEye size={18} />
                <span>{product.views}</span>
              </div>
            </div>

            {/* Açıklama */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Ürün Açıklaması</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {formatDescription(product.description)}
              </p>
            </div>

            {/* Takas Tercihleri */}
            {product.exchangePreferences && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Takas Tercihleri</h3>

                {product.exchangePreferences.description && (
                  <p className="text-gray-700 mb-3">
                    {product.exchangePreferences.description}
                  </p>
                )}

                {(product.exchangePreferences.minValue || product.exchangePreferences.maxValue) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiTag size={14} />
                    <span>
                      Değer Aralığı:
                      {product.exchangePreferences.minValue && ` ₺${product.exchangePreferences.minValue.toLocaleString()}`}
                      {product.exchangePreferences.minValue && product.exchangePreferences.maxValue && ' - '}
                      {product.exchangePreferences.maxValue && ` ₺${product.exchangePreferences.maxValue.toLocaleString()}`}
                    </span>
                  </div>
                )}

                {product.exchangePreferences.categories && product.exchangePreferences.categories.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Tercih edilen kategoriler:</p>
                    <div className="flex flex-wrap gap-2">
                      {product.exchangePreferences.categories.map((category: any, index: number) => (
                        <span
                          key={index}
                          className="bg-white px-2 py-1 rounded text-xs text-gray-700 border"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Teklif Verme Butonu */}
            <div className="space-y-3">
              <button
                onClick={handleMakeOffer}
                className="w-full bg-black text-white py-4 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-lg font-medium"
              >
                <FiMessageSquare size={20} />
                Takas Teklifi Ver
              </button>

              <p className="text-sm text-gray-500 text-center">
                Tüm takas işlemleri güvenlik için admin kontrolünde gerçekleşir
              </p>
            </div>

            {/* Ürün Bilgileri */}
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Ürün Bilgileri</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Kategori:</span>
                  <span className="text-gray-900">{product.category.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Durum:</span>
                  <span className="text-gray-900">{product.conditionText}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tahmini Değer:</span>
                  <span className="text-gray-900">₺{product.estimatedValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Konum:</span>
                  <span className="text-gray-900">{product.location.city}, {product.location.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Yayın Tarihi:</span>
                  <span className="text-gray-900">
                    {new Date(product.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Teklif Verme Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Takas Teklifi Ver</h3>
            <p className="text-gray-600 mb-4">
              Bu özellik yakında aktif olacak. Şu anda takas teklifleri manuel olarak koordine edilmektedir.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowOfferModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  setShowOfferModal(false);
                  alert('Takas teklifi sistemi yakında aktif olacak!');
                }}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExchangeProductDetailPage;
