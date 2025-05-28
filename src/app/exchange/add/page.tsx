'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiUpload, FiX, FiPlus, FiAlertCircle } from 'react-icons/fi';
import Image from 'next/image';

interface Category {
  _id: string;
  name: string;
}

const AddExchangeProductPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    condition: '',
    estimatedValue: '',
    isUrgent: false,
    location: {
      city: '',
      district: ''
    },
    exchangePreferences: {
      categories: [] as string[],
      description: '',
      minValue: '',
      maxValue: ''
    }
  });

  const conditions = [
    { value: 'new', label: 'Sıfır' },
    { value: 'like_new', label: 'Sıfır Gibi' },
    { value: 'good', label: 'İyi' },
    { value: 'fair', label: 'Orta' },
    { value: 'poor', label: 'Kötü' }
  ];

  const cities = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep',
    'Mersin', 'Diyarbakır', 'Kayseri', 'Eskişehir', 'Urfa', 'Malatya', 'Erzurum',
    'Van', 'Batman', 'Elazığ', 'İçel', 'Sivas', 'Manisa', 'Tokat', 'Trabzon'
  ];

  // Kategorileri getir
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Kategoriler getirilemedi:', error);
    }
  };

  // Form input değişikliklerini handle et
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else if (name.startsWith('exchangePreferences.')) {
      const prefField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        exchangePreferences: {
          ...prev.exchangePreferences,
          [prefField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  // Takas tercihi kategorilerini handle et
  const handleExchangeCategoryChange = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      exchangePreferences: {
        ...prev.exchangePreferences,
        categories: prev.exchangePreferences.categories.includes(categoryId)
          ? prev.exchangePreferences.categories.filter(id => id !== categoryId)
          : [...prev.exchangePreferences.categories, categoryId]
      }
    }));
  };

  // Resim yükleme
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImages(prev => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Resim silme
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Form gönderme
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length === 0) {
      alert('En az bir resim eklemelisiniz');
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem('token');
      if (!token) {
        alert('Giriş yapmalısınız');
        router.push('/auth/login');
        return;
      }

      const submitData = {
        ...formData,
        images,
        estimatedValue: Number(formData.estimatedValue),
        exchangePreferences: {
          ...formData.exchangePreferences,
          minValue: formData.exchangePreferences.minValue ? Number(formData.exchangePreferences.minValue) : undefined,
          maxValue: formData.exchangePreferences.maxValue ? Number(formData.exchangePreferences.maxValue) : undefined
        }
      };

      const response = await fetch('/api/exchange/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Takas ürününüz başarıyla eklendi! Admin onayı bekleniyor.');
        router.push('/exchange');
      } else {
        const errorData = await response.json();
        alert(`Hata: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Ürün ekleme hatası:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Takas Ürünü Ekle</h1>
          <p className="text-gray-600">
            Takas etmek istediğiniz ürününüzü ekleyin. Admin onayından sonra diğer kullanıcılar görebilecek.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Temel Bilgiler */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Temel Bilgiler</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ürün Adı */}
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Ürün Adı *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Ürün adını girin"
                />
              </div>

              {/* Kategori */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">Kategori seçin</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Durum */}
              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                  Ürün Durumu *
                </label>
                <select
                  id="condition"
                  name="condition"
                  required
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">Durum seçin</option>
                  {conditions.map(condition => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tahmini Değer */}
              <div>
                <label htmlFor="estimatedValue" className="block text-sm font-medium text-gray-700 mb-2">
                  Tahmini Değer (₺) *
                </label>
                <input
                  type="number"
                  id="estimatedValue"
                  name="estimatedValue"
                  required
                  min="0"
                  value={formData.estimatedValue}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="0"
                />
              </div>

              {/* Acil Durumu */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isUrgent"
                  name="isUrgent"
                  checked={formData.isUrgent}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label htmlFor="isUrgent" className="ml-2 text-sm text-gray-700">
                  Acil takas gerekiyor
                </label>
              </div>
            </div>

            {/* Açıklama */}
            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Ürün Açıklaması *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Ürününüzü detaylı olarak açıklayın..."
              />
            </div>
          </div>

          {/* Konum Bilgileri */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Konum Bilgileri</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Şehir */}
              <div>
                <label htmlFor="location.city" className="block text-sm font-medium text-gray-700 mb-2">
                  Şehir *
                </label>
                <select
                  id="location.city"
                  name="location.city"
                  required
                  value={formData.location.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">Şehir seçin</option>
                  {cities.map(city => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* İlçe */}
              <div>
                <label htmlFor="location.district" className="block text-sm font-medium text-gray-700 mb-2">
                  İlçe *
                </label>
                <input
                  type="text"
                  id="location.district"
                  name="location.district"
                  required
                  value={formData.location.district}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="İlçe adını girin"
                />
              </div>
            </div>
          </div>

          {/* Ürün Resimleri */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Ürün Resimleri</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resim Yükle * (En az 1, en fazla 5 resim)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Yüklenen Resimler */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-square relative overflow-hidden rounded-lg border">
                      <Image
                        src={image}
                        alt={`Ürün resmi ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Takas Tercihleri */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Takas Tercihleri</h2>
            
            <div className="space-y-6">
              {/* Tercih Edilen Kategoriler */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hangi kategorilerden ürün kabul edersiniz?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map(category => (
                    <label key={category._id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.exchangePreferences.categories.includes(category._id)}
                        onChange={() => handleExchangeCategoryChange(category._id)}
                        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Değer Aralığı */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="exchangePreferences.minValue" className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Değer (₺)
                  </label>
                  <input
                    type="number"
                    id="exchangePreferences.minValue"
                    name="exchangePreferences.minValue"
                    min="0"
                    value={formData.exchangePreferences.minValue}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label htmlFor="exchangePreferences.maxValue" className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Değer (₺)
                  </label>
                  <input
                    type="number"
                    id="exchangePreferences.maxValue"
                    name="exchangePreferences.maxValue"
                    min="0"
                    value={formData.exchangePreferences.maxValue}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Takas Açıklaması */}
              <div>
                <label htmlFor="exchangePreferences.description" className="block text-sm font-medium text-gray-700 mb-2">
                  Takas Tercihi Açıklaması
                </label>
                <textarea
                  id="exchangePreferences.description"
                  name="exchangePreferences.description"
                  rows={3}
                  value={formData.exchangePreferences.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Hangi tür ürünlerle takas yapmak istediğinizi açıklayın..."
                />
              </div>
            </div>
          </div>

          {/* Uyarı */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <FiAlertCircle className="text-yellow-400 mt-0.5 mr-3" size={20} />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Önemli Bilgiler:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Ürününüz admin onayından sonra yayınlanacaktır</li>
                  <li>Takas işlemleri güvenlik için admin kontrolünde gerçekleşir</li>
                  <li>Kullanıcılar birbirleriyle direkt iletişim kuramaz</li>
                  <li>Tüm takas süreçleri şirketimiz aracılığıyla koordine edilir</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Butonları */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Ekleniyor...' : 'Ürün Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExchangeProductPage;
