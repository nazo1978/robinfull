'use client';

import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiSave, FiX, FiTrendingUp, FiDollarSign, FiSearch, FiCalendar, FiPercent, FiPackage } from 'react-icons/fi';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string | { _id: string; name: string; slug: string };
  stock: number;
  isActive: boolean;
}

interface DynamicPricingRule {
  _id: string;
  productId: string;
  productName: string;
  basePrice: number;
  currentPrice: number;
  priceIncrement: number;
  maxPrice: number;
  purchaseCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Yeni alanlar
  quantityThresholds?: Array<{
    quantity: number;
    discountPercentage: number;
  }>;
  monthlyDeal?: {
    isMonthlyDeal: boolean;
    startDate?: string;
    endDate?: string;
    specialDiscountPercentage?: number;
  };
}

interface NewRuleForm {
  productId: string;
  priceIncrement: number;
  maxPrice: number;
  quantityThresholds: Array<{
    quantity: number;
    discountPercentage: number;
  }>;
  monthlyDeal: {
    isMonthlyDeal: boolean;
    startDate: string;
    endDate: string;
    specialDiscountPercentage: number;
  };
}

const DynamicPricingManagement: React.FC = () => {
  const [rules, setRules] = useState<DynamicPricingRule[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<DynamicPricingRule>>({});
  const [showNewRuleForm, setShowNewRuleForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newRuleForm, setNewRuleForm] = useState<NewRuleForm>({
    productId: '',
    priceIncrement: 0,
    maxPrice: 0,
    quantityThresholds: [
      { quantity: 2, discountPercentage: 5 },
      { quantity: 5, discountPercentage: 10 },
      { quantity: 10, discountPercentage: 15 }
    ],
    monthlyDeal: {
      isMonthlyDeal: false,
      startDate: '',
      endDate: '',
      specialDiscountPercentage: 0
    }
  });

  // Kategori adını güvenli şekilde al
  const getCategoryName = (category: string | { _id: string; name: string; slug: string }): string => {
    if (typeof category === 'string') {
      return category;
    }
    if (typeof category === 'object' && category !== null) {
      return category.name || category.slug || 'Bilinmeyen';
    }
    return 'Bilinmeyen';
  };

  // Dinamik fiyatlandırma kurallarını getir
  const fetchRules = async () => {
    try {
      const authTokenCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='));

      const token = authTokenCookie ? authTokenCookie.split('=')[1] : '';

      const response = await fetch('http://localhost:5000/api/admin/dynamic-pricing', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRules(data.rules || []);
        }
      }
    } catch (error) {
      console.error('Dinamik fiyatlandırma kuralları getirilirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ürünleri getir
  const fetchProducts = async () => {
    try {
      const authTokenCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='));

      const token = authTokenCookie ? authTokenCookie.split('=')[1] : '';

      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProducts(data.products || []);
        }
      }
    } catch (error) {
      console.error('Ürünler getirilirken hata:', error);
    }
  };

  useEffect(() => {
    fetchRules();
    fetchProducts();
  }, []);

  // Kural güncelle
  const updateRule = async (ruleId: string, updates: Partial<DynamicPricingRule>) => {
    try {
      const authTokenCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='));

      const token = authTokenCookie ? authTokenCookie.split('=')[1] : '';

      const response = await fetch(`http://localhost:5000/api/admin/dynamic-pricing/${ruleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRules(prev => prev.map(rule =>
            rule._id === ruleId ? { ...rule, ...updates } : rule
          ));
          setEditingRule(null);
          setEditForm({});
          alert('Kural başarıyla güncellendi!');
        }
      } else {
        alert('Kural güncellenirken hata oluştu!');
      }
    } catch (error) {
      console.error('Kural güncelleme hatası:', error);
      alert('Kural güncellenirken hata oluştu!');
    }
  };

  // Satın alma sayısını sıfırla
  const resetPurchaseCount = async (ruleId: string) => {
    if (!confirm('Bu ürünün satın alma sayısını sıfırlamak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const authTokenCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='));

      const token = authTokenCookie ? authTokenCookie.split('=')[1] : '';

      const response = await fetch(`http://localhost:5000/api/admin/dynamic-pricing/${ruleId}/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          fetchRules(); // Verileri yenile
          alert('Satın alma sayısı sıfırlandı!');
        }
      } else {
        alert('İşlem sırasında hata oluştu!');
      }
    } catch (error) {
      console.error('Reset hatası:', error);
      alert('İşlem sırasında hata oluştu!');
    }
  };

  // Düzenleme başlat
  const startEdit = (rule: DynamicPricingRule) => {
    setEditingRule(rule._id);
    setEditForm({
      priceIncrement: rule.priceIncrement,
      maxPrice: rule.maxPrice,
      isActive: rule.isActive
    });
  };

  // Düzenleme iptal
  const cancelEdit = () => {
    setEditingRule(null);
    setEditForm({});
  };

  // Düzenleme kaydet
  const saveEdit = () => {
    if (editingRule) {
      updateRule(editingRule, editForm);
    }
  };

  // Yeni kural oluştur
  const createNewRule = async () => {
    try {
      if (!selectedProduct) {
        alert('Lütfen bir ürün seçin');
        return;
      }

      console.log('Yeni kural oluşturuluyor:', {
        selectedProduct,
        newRuleForm
      });

      const authTokenCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='));

      const token = authTokenCookie ? authTokenCookie.split('=')[1] : '';
      console.log('Auth token:', token ? 'Mevcut' : 'Yok');

      const ruleData = {
        productId: selectedProduct._id,
        priceIncrement: newRuleForm.priceIncrement,
        maxPrice: newRuleForm.maxPrice || selectedProduct.price * 2,
        quantityThresholds: newRuleForm.quantityThresholds,
        monthlyDeal: newRuleForm.monthlyDeal.isMonthlyDeal ? newRuleForm.monthlyDeal : null
      };

      console.log('Gönderilecek veri:', ruleData);

      const response = await fetch('http://localhost:5000/api/admin/dynamic-pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ruleData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        if (data.success) {
          console.log('Kural başarıyla oluşturuldu, kuralları yenileniyor...');
          await fetchRules(); // Kuralları yenile
          setShowNewRuleForm(false);
          setSelectedProduct(null);
          // Form'u sıfırla
          setNewRuleForm({
            productId: '',
            priceIncrement: 0,
            maxPrice: 0,
            quantityThresholds: [
              { quantity: 2, discountPercentage: 5 },
              { quantity: 5, discountPercentage: 10 },
              { quantity: 10, discountPercentage: 15 }
            ],
            monthlyDeal: {
              isMonthlyDeal: false,
              startDate: '',
              endDate: '',
              specialDiscountPercentage: 0
            }
          });
          alert('Dinamik fiyatlandırma kuralı başarıyla oluşturuldu!');
        } else {
          console.error('Backend success false:', data.message);
          alert(`Hata: ${data.message}`);
        }
      } else {
        console.error('HTTP error:', response.status, data);
        alert(`Kural oluşturulurken hata oluştu: ${data.message || 'Bilinmeyen hata'}`);
      }
    } catch (error) {
      console.error('Kural oluşturma hatası:', error);
      alert(`Kural oluşturulurken hata oluştu: ${error.message}`);
    }
  };

  // Miktar eşiği ekle
  const addQuantityThreshold = () => {
    setNewRuleForm(prev => ({
      ...prev,
      quantityThresholds: [
        ...prev.quantityThresholds,
        { quantity: 0, discountPercentage: 0 }
      ]
    }));
  };

  // Miktar eşiği kaldır
  const removeQuantityThreshold = (index: number) => {
    setNewRuleForm(prev => ({
      ...prev,
      quantityThresholds: prev.quantityThresholds.filter((_, i) => i !== index)
    }));
  };

  // Kural sil
  const deleteRule = async (ruleId: string) => {
    if (!confirm('Bu dinamik fiyatlandırma kuralını silmek istediğinizden emin misiniz? Ürün fiyatı orijinal değere döndürülecektir.')) {
      return;
    }

    try {
      const authTokenCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='));

      const token = authTokenCookie ? authTokenCookie.split('=')[1] : '';

      const response = await fetch(`http://localhost:5000/api/admin/dynamic-pricing/${ruleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          fetchRules(); // Kuralları yenile
          alert('Dinamik fiyatlandırma kuralı başarıyla silindi!');
        }
      } else {
        alert('Kural silinirken hata oluştu!');
      }
    } catch (error) {
      console.error('Kural silme hatası:', error);
      alert('Kural silinirken hata oluştu!');
    }
  };

  // Filtrelenmiş ürünler
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !rules.some(rule => rule.productId === product._id) // Zaten kuralı olan ürünleri hariç tut
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dinamik Fiyatlandırma Yönetimi
        </h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Toplam {rules.length} kural
          </div>
          <button
            onClick={() => setShowNewRuleForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FiPlus size={16} />
            <span>Yeni Kural Ekle</span>
          </button>
        </div>
      </div>

      {/* Yeni Kural Ekleme Formu */}
      {showNewRuleForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Yeni Dinamik Fiyatlandırma Kuralı
            </h3>
            <button
              onClick={() => {
                setShowNewRuleForm(false);
                setSelectedProduct(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Ürün Seçimi */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ürün Seçimi
            </label>
            <div className="relative mb-4">
              <FiSearch className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Ürün ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {selectedProduct ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-blue-900">{selectedProduct.name}</h4>
                    <p className="text-sm text-blue-700">
                      Fiyat: ₺{selectedProduct.price.toLocaleString('tr-TR')} |
                      Stok: {selectedProduct.stock} |
                      Kategori: {getCategoryName(selectedProduct.category)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <div
                      key={product._id}
                      onClick={() => setSelectedProduct(product)}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-200 last:border-b-0"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-600">
                            ₺{product.price.toLocaleString('tr-TR')} | {getCategoryName(product.category)}
                          </p>
                        </div>
                        <FiPackage className="text-gray-400" size={16} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    {searchTerm ? 'Arama kriterine uygun ürün bulunamadı' : 'Tüm ürünler zaten dinamik fiyatlandırma kuralına sahip'}
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedProduct && (
            <>
              {/* Temel Ayarlar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fiyat Artışı (₺)
                    <span className="block text-xs text-gray-500 font-normal mt-1">
                      Her satın alma işleminde fiyatın ne kadar artacağını belirler
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newRuleForm.priceIncrement}
                    onChange={(e) => setNewRuleForm(prev => ({
                      ...prev,
                      priceIncrement: parseFloat(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Her satışta fiyat artışı"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Maksimum Fiyat (₺)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newRuleForm.maxPrice}
                    onChange={(e) => setNewRuleForm(prev => ({
                      ...prev,
                      maxPrice: parseFloat(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Önerilen: ₺${(selectedProduct.price * 2).toLocaleString('tr-TR')}`}
                  />
                </div>
              </div>

              {/* Miktar İndirimleri */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Miktar İndirimleri
                  </label>
                  <button
                    onClick={addQuantityThreshold}
                    className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <FiPlus size={14} />
                    <span>Ekle</span>
                  </button>
                </div>
                <div className="space-y-3">
                  {newRuleForm.quantityThresholds.map((threshold, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-1">
                        <input
                          type="number"
                          placeholder="Miktar"
                          value={threshold.quantity}
                          onChange={(e) => {
                            const newThresholds = [...newRuleForm.quantityThresholds];
                            newThresholds[index].quantity = parseInt(e.target.value) || 0;
                            setNewRuleForm(prev => ({ ...prev, quantityThresholds: newThresholds }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="number"
                          placeholder="İndirim %"
                          value={threshold.discountPercentage}
                          onChange={(e) => {
                            const newThresholds = [...newRuleForm.quantityThresholds];
                            newThresholds[index].discountPercentage = parseInt(e.target.value) || 0;
                            setNewRuleForm(prev => ({ ...prev, quantityThresholds: newThresholds }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <button
                        onClick={() => removeQuantityThreshold(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ayın Ürünü */}
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    id="monthlyDeal"
                    checked={newRuleForm.monthlyDeal.isMonthlyDeal}
                    onChange={(e) => setNewRuleForm(prev => ({
                      ...prev,
                      monthlyDeal: { ...prev.monthlyDeal, isMonthlyDeal: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="monthlyDeal" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ayın Ürünü Olarak İşaretle
                  </label>
                </div>

                {newRuleForm.monthlyDeal.isMonthlyDeal && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-7">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Başlangıç Tarihi
                      </label>
                      <input
                        type="date"
                        value={newRuleForm.monthlyDeal.startDate}
                        onChange={(e) => setNewRuleForm(prev => ({
                          ...prev,
                          monthlyDeal: { ...prev.monthlyDeal, startDate: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bitiş Tarihi
                      </label>
                      <input
                        type="date"
                        value={newRuleForm.monthlyDeal.endDate}
                        onChange={(e) => setNewRuleForm(prev => ({
                          ...prev,
                          monthlyDeal: { ...prev.monthlyDeal, endDate: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Özel İndirim (%)
                      </label>
                      <input
                        type="number"
                        value={newRuleForm.monthlyDeal.specialDiscountPercentage}
                        onChange={(e) => setNewRuleForm(prev => ({
                          ...prev,
                          monthlyDeal: { ...prev.monthlyDeal, specialDiscountPercentage: parseInt(e.target.value) || 0 }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ek indirim yüzdesi"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Kaydet Butonu */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowNewRuleForm(false);
                    setSelectedProduct(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  onClick={createNewRule}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2"
                >
                  <FiSave size={16} />
                  <span>Kuralı Kaydet</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {rules.length === 0 ? (
        <div className="text-center py-12">
          <FiTrendingUp className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Dinamik fiyatlandırma kuralı bulunamadı
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Henüz hiçbir ürün için dinamik fiyatlandırma kuralı oluşturulmamış.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {rules.map((rule) => (
              <li key={rule._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {rule.productName}
                        </h3>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>Base: ₺{rule.basePrice.toLocaleString('tr-TR')}</span>
                          <span>Current: ₺{rule.currentPrice.toLocaleString('tr-TR')}</span>
                          <span>Max: ₺{rule.maxPrice.toLocaleString('tr-TR')}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {rule.purchaseCount} satış
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            +₺{rule.priceIncrement} / satış
                          </div>
                        </div>
                        <div className={`px-2 py-1 text-xs rounded-full ${
                          rule.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {rule.isActive ? 'Aktif' : 'Pasif'}
                        </div>
                      </div>
                    </div>

                    {/* Kural Detayları */}
                    <div className="mt-4 space-y-3">
                      {/* Miktar İndirimleri */}
                      {rule.quantityThresholds && rule.quantityThresholds.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Miktar İndirimleri:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {rule.quantityThresholds.map((threshold, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {threshold.quantity}+ adet: %{threshold.discountPercentage} indirim
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Ayın Ürünü */}
                      {rule.monthlyDeal && rule.monthlyDeal.isMonthlyDeal && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Ayın Ürünü:
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              <FiCalendar className="inline mr-1" size={12} />
                              {rule.monthlyDeal.startDate ? new Date(rule.monthlyDeal.startDate).toLocaleDateString('tr-TR') : 'Başlangıç'} - {rule.monthlyDeal.endDate ? new Date(rule.monthlyDeal.endDate).toLocaleDateString('tr-TR') : 'Bitiş'}
                            </span>
                            {rule.monthlyDeal.specialDiscountPercentage > 0 && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                <FiPercent className="inline mr-1" size={12} />
                                %{rule.monthlyDeal.specialDiscountPercentage} özel indirim
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {editingRule === rule._id ? (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Fiyat Artışı (₺)
                            <span className="block text-xs text-gray-500 font-normal mt-1">
                              Her satın alma işleminde fiyatın ne kadar artacağını belirler
                            </span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={editForm.priceIncrement || ''}
                            onChange={(e) => setEditForm(prev => ({
                              ...prev,
                              priceIncrement: parseFloat(e.target.value) || 0
                            }))}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Maksimum Fiyat (₺)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={editForm.maxPrice || ''}
                            onChange={(e) => setEditForm(prev => ({
                              ...prev,
                              maxPrice: parseFloat(e.target.value) || 0
                            }))}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Durum
                          </label>
                          <select
                            value={editForm.isActive ? 'true' : 'false'}
                            onChange={(e) => setEditForm(prev => ({
                              ...prev,
                              isActive: e.target.value === 'true'
                            }))}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          >
                            <option value="true">Aktif</option>
                            <option value="false">Pasif</option>
                          </select>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="ml-4 flex items-center space-x-2">
                    {editingRule === rule._id ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="p-2 text-green-600 hover:text-green-800"
                          title="Kaydet"
                        >
                          <FiSave size={18} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-2 text-gray-600 hover:text-gray-800"
                          title="İptal"
                        >
                          <FiX size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(rule)}
                          className="p-2 text-blue-600 hover:text-blue-800"
                          title="Düzenle"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => resetPurchaseCount(rule._id)}
                          className="p-2 text-orange-600 hover:text-orange-800"
                          title="Satış Sayısını Sıfırla"
                        >
                          <FiTrendingUp size={18} />
                        </button>
                        <button
                          onClick={() => deleteRule(rule._id)}
                          className="p-2 text-red-600 hover:text-red-800"
                          title="Kuralı Sil"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DynamicPricingManagement;
