'use client';

import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff, FiMove } from 'react-icons/fi';

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
  startDate: string;
  endDate?: string;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface BannerFormData {
  title: string;
  description: string;
  type: 'product' | 'giveaway' | 'exchange' | 'auction';
  image: string;
  buttonText: string;
  buttonLink: string;
  backgroundColor: string;
  textColor: string;
  order: number;
  endDate: string;
  selectedItemId: string;
}

interface BannerOption {
  id: string;
  name: string;
  image: string | null;
}

const initialFormData: BannerFormData = {
  title: '',
  description: '',
  type: 'product',
  image: '',
  buttonText: 'Keşfet',
  buttonLink: '/products',
  backgroundColor: '#f3f4f6',
  textColor: '#1f2937',
  order: 0,
  endDate: '',
  selectedItemId: ''
};

export default function BannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<BannerFormData>(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Banner seçenekleri
  const [bannerOptions, setBannerOptions] = useState<{
    products: BannerOption[];
    auctions: BannerOption[];
    lotteries: BannerOption[];
    exchanges: BannerOption[];
  }>({
    products: [],
    auctions: [],
    lotteries: [],
    exchanges: []
  });
  const [optionsLoading, setOptionsLoading] = useState(false);

  useEffect(() => {
    fetchBanners();
    fetchBannerOptions();
  }, []);

  const fetchBanners = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];

      const response = await fetch('http://localhost:5000/api/banners', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

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
      setIsLoading(false);
    }
  };

  const fetchBannerOptions = async () => {
    try {
      setOptionsLoading(true);
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];

      const response = await fetch('http://localhost:5000/api/banners/options', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBannerOptions(data.options || {
          products: [],
          auctions: [],
          lotteries: [],
          exchanges: []
        });
      }
    } catch (err) {
      console.error('Banner seçenekleri yükleme hatası:', err);
    } finally {
      setOptionsLoading(false);
    }
  };

  // Seçilen öğeye göre otomatik link oluştur
  const generateButtonLink = (type: string, itemId: string) => {
    if (!itemId) return '/';

    switch (type) {
      case 'product':
        return `/products/${itemId}`;
      case 'auction':
        return `/auctions/${itemId}`;
      case 'giveaway':
        return `/lotteries/${itemId}`;
      case 'exchange':
        return `/exchange/${itemId}`;
      default:
        return '/';
    }
  };

  // Seçilen öğeye göre otomatik resim URL'si oluştur
  const generateImageUrl = (type: string, itemId: string) => {
    if (!itemId) return '';

    const options = bannerOptions[type === 'giveaway' ? 'lotteries' : `${type}s` as keyof typeof bannerOptions];
    const selectedItem = options?.find(item => item.id === itemId);
    return selectedItem?.image || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];

      const url = isEditing
        ? `http://localhost:5000/api/banners/${editingId}`
        : 'http://localhost:5000/api/banners';

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(data.message);
        setShowForm(false);
        setFormData(initialFormData);
        setIsEditing(false);
        setEditingId(null);
        fetchBanners();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'İşlem başarısız');
      }
    } catch (err) {
      console.error('Banner kaydetme hatası:', err);
      setError('Banner kaydedilirken bir hata oluştu');
    }
  };

  const handleEdit = (banner: Banner) => {
    setFormData({
      title: banner.title,
      description: banner.description,
      type: banner.type,
      image: banner.image,
      buttonText: banner.buttonText,
      buttonLink: banner.buttonLink,
      backgroundColor: banner.backgroundColor,
      textColor: banner.textColor,
      order: banner.order,
      endDate: banner.endDate ? banner.endDate.split('T')[0] : '',
      selectedItemId: (banner as any).selectedItemId || ''
    });
    setIsEditing(true);
    setEditingId(banner._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu banner\'ı silmek istediğinizden emin misiniz?')) return;

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];

      const response = await fetch(`http://localhost:5000/api/banners/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSuccessMessage('Banner başarıyla silindi');
        fetchBanners();
      } else {
        setError('Banner silinemedi');
      }
    } catch (err) {
      console.error('Banner silme hatası:', err);
      setError('Banner silinirken bir hata oluştu');
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];

      const response = await fetch(`http://localhost:5000/api/banners/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(data.message);
        fetchBanners();
      } else {
        setError('Banner durumu değiştirilemedi');
      }
    } catch (err) {
      console.error('Banner durum değiştirme hatası:', err);
      setError('Banner durumu değiştirilirken bir hata oluştu');
    }
  };

  const typeOptions = [
    { value: 'product', label: 'Ürün' },
    { value: 'giveaway', label: 'Çekiliş' },
    { value: 'exchange', label: 'Takas' },
    { value: 'auction', label: 'Açık Artırma' }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // handleItemChange fonksiyonu kaldırıldı - artık inline onChange kullanılıyor

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Banner Yönetimi</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setIsEditing(false);
            setFormData(initialFormData);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FiPlus /> Yeni Banner
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      {/* Banner Listesi */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Banner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tip
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sıra
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {banners.map((banner) => (
              <tr key={banner._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-16 w-24">
                      <img
                        className="h-16 w-24 object-cover rounded"
                        src={banner.image}
                        alt={banner.title}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {banner.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {banner.description.substring(0, 50)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {typeOptions.find(opt => opt.value === banner.type)?.label}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    banner.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {banner.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {banner.order}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => toggleStatus(banner._id)}
                      className={banner.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                    >
                      {banner.isActive ? <FiEyeOff /> : <FiEye />}
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Banner Formu Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {isEditing ? 'Banner Düzenle' : 'Yeni Banner Ekle'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Başlık</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tip</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({
                        ...formData,
                        type: e.target.value as 'product' | 'giveaway' | 'exchange' | 'auction',
                        selectedItemId: '', // Tip değiştiğinde seçili öğeyi sıfırla
                        buttonLink: generateButtonLink(e.target.value, ''),
                        image: ''
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      {typeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sıra</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      min="0"
                    />
                  </div>
                </div>

                {/* Seçilen Tip İçin Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {formData.type === 'product' && 'Ürün Seçin'}
                    {formData.type === 'auction' && 'Açık Artırma Seçin'}
                    {formData.type === 'giveaway' && 'Çekiliş Seçin'}
                    {formData.type === 'exchange' && 'Takas Ürünü Seçin'}
                  </label>
                  <select
                    value={formData.selectedItemId}
                    onChange={(e) => {
                      const value = e.target.value;
                      const newButtonLink = generateButtonLink(formData.type, value);
                      const newImageUrl = generateImageUrl(formData.type, value);

                      setFormData({
                        ...formData,
                        selectedItemId: value,
                        buttonLink: newButtonLink,
                        image: newImageUrl || formData.image
                      });
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    disabled={optionsLoading}
                  >
                    <option value="">Seçiniz...</option>
                    {formData.type === 'product' && bannerOptions.products.map(item => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                    {formData.type === 'auction' && bannerOptions.auctions.map(item => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                    {formData.type === 'giveaway' && bannerOptions.lotteries.map(item => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                    {formData.type === 'exchange' && bannerOptions.exchanges.map(item => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                  {optionsLoading && (
                    <p className="text-sm text-gray-500 mt-1">Seçenekler yükleniyor...</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Resim URL</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Buton Metni</label>
                    <input
                      type="text"
                      value={formData.buttonText}
                      onChange={(e) => setFormData({...formData, buttonText: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Buton Linki</label>
                    <input
                      type="text"
                      value={formData.buttonLink}
                      onChange={(e) => setFormData({...formData, buttonLink: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Arkaplan Rengi</label>
                    <input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({...formData, backgroundColor: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 h-10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Metin Rengi</label>
                    <input
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => setFormData({...formData, textColor: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 h-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Bitiş Tarihi (Opsiyonel)</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {isEditing ? 'Güncelle' : 'Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}