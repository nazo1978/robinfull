'use client';

import React, { useState, useEffect } from 'react';
import { FiSave, FiRefreshCw, FiEye, FiEyeOff } from 'react-icons/fi';

interface SectionVisibility {
  featuredProducts: boolean;
  dynamicBanners: boolean;
  dynamicPricing: boolean;
  lotterySection: boolean;
  exchangeSection: boolean;
  auctionSection: boolean;
  categories: boolean;
}

export default function SiteSettingsManagement() {
  const [sections, setSections] = useState<SectionVisibility>({
    featuredProducts: true,
    dynamicBanners: true,
    dynamicPricing: true,
    lotterySection: true,
    exchangeSection: true,
    auctionSection: true,
    categories: true
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const sectionLabels = {
    featuredProducts: 'Öne Çıkan Ürünler',
    dynamicBanners: 'Dinamik Bannerlar',
    dynamicPricing: 'Dinamik Fiyatlandırma',
    lotterySection: 'Çekiliş Bölümü',
    exchangeSection: 'Takas Bölümü',
    auctionSection: 'Açık Artırma Bölümü',
    categories: 'Kategoriler'
  };

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      setIsLoading(true);
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];

      const response = await fetch('http://localhost:5128/api/sitesettings/sections', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.sections) {
          setSections(data.sections);
        }
      }
    } catch (err) {
      console.error('Site ayarları yükleme hatası:', err);
      setError('Site ayarları yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionToggle = (sectionKey: keyof SectionVisibility) => {
    setSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];

      const response = await fetch('http://localhost:5128/api/sitesettings/sections', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sections }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(data.message || 'Site ayarları başarıyla güncellendi');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Site ayarları güncellenemedi');
      }
    } catch (err) {
      console.error('Site ayarları kaydetme hatası:', err);
      setError('Site ayarları kaydedilirken bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Site Ayarları</h2>
        <div className="flex gap-2">
          <button
            onClick={fetchSiteSettings}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2"
          >
            <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
            Yenile
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <FiSave />
            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
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

      {/* Ana Sayfa Bölüm Görünürlükleri */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Ana Sayfa Bölüm Görünürlükleri</h3>
        <p className="text-gray-600 mb-6">
          Ana sayfada hangi bölümlerin görünür olacağını kontrol edin.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(sections).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${value ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  {value ? <FiEye size={20} /> : <FiEyeOff size={20} />}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {sectionLabels[key as keyof SectionVisibility]}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {value ? 'Görünür' : 'Gizli'}
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => handleSectionToggle(key as keyof SectionVisibility)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Bilgi</h4>
          <p className="text-sm text-blue-700">
            Bu ayarlar ana sayfada hangi bölümlerin görüntüleneceğini kontrol eder.
            Değişiklikler kaydedildikten sonra ana sayfada hemen etkili olur.
          </p>
        </div>
      </div>
    </div>
  );
}
