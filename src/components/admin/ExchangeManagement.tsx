import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiEye, FiSearch, FiFilter, FiClock, FiMapPin, FiUser } from 'react-icons/fi';
import Image from 'next/image';

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
  seller?: {
    _id: string;
    companyName: string;
  };
  location: {
    city: string;
    district: string;
  };
  status: string;
  adminNotes?: string;
  createdAt: string;
  views: number;
  likesCount: number;
  sharesCount: number;
}

const ExchangeManagement = () => {
  const [products, setProducts] = useState<ExchangeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<ExchangeProduct | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');

  // Takas ürünlerini getir
  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Token'ı farklı yerlerden almaya çalış
      let token = localStorage.getItem('token') ||
                  localStorage.getItem('authToken') ||
                  localStorage.getItem('adminToken');

      // Cookie'den de kontrol et
      if (!token) {
        const authTokenCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('authToken='));
        if (authTokenCookie) {
          token = authTokenCookie.split('=')[1];
        }
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        type: 'products'
      });

      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/exchange/admin/pending?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Takas ürünleri getirilemedi');
      }

      const data = await response.json();
      
      if (data.success) {
        setProducts(data.items || []);
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
  }, [currentPage, statusFilter]);

  // Ürün onaylama/reddetme
  const handleApproval = async (productId: string, isApproved: boolean) => {
    try {
      setLoading(true);

      let token = localStorage.getItem('token') ||
                  localStorage.getItem('authToken') ||
                  localStorage.getItem('adminToken');

      if (!token) {
        const authTokenCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('authToken='));
        if (authTokenCookie) {
          token = authTokenCookie.split('=')[1];
        }
      }

      const response = await fetch(`/api/exchange/admin/products/${productId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isApproved,
          notes: approvalNotes
        }),
      });

      if (!response.ok) {
        throw new Error('Onaylama işlemi başarısız');
      }

      // Listeyi yenile
      fetchProducts();
      setApprovalNotes('');
      setShowDetails(false);

      // Başarı mesajı göster
      alert(`Ürün ${isApproved ? 'onaylandı' : 'reddedildi'}`);
    } catch (err: any) {
      alert(`Hata: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Ürün detaylarını göster
  const showProductDetails = (product: ExchangeProduct) => {
    setSelectedProduct(product);
    setShowDetails(true);
  };

  // Arama işlemi
  const handleSearch = () => {
    setCurrentPage(1);
    fetchProducts();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Bekliyor', color: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Onaylandı', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Reddedildi', color: 'bg-red-100 text-red-800' },
      exchanged: { label: 'Takas Edildi', color: 'bg-blue-100 text-blue-800' },
      removed: { label: 'Kaldırıldı', color: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Takas Yönetimi</h2>
          <p className="text-gray-600 dark:text-gray-400">Takas ürünlerini yönetin ve onaylayın</p>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Arama */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Durum Filtresi */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:bg-gray-700 dark:text-white"
            >
              <option value="">Tüm Durumlar</option>
              <option value="pending">Bekliyor</option>
              <option value="approved">Onaylandı</option>
              <option value="rejected">Reddedildi</option>
              <option value="exchanged">Takas Edildi</option>
            </select>
          </div>

          {/* Arama Butonu */}
          <div>
            <button
              onClick={handleSearch}
              className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <FiSearch />
              Ara
            </button>
          </div>
        </div>
      </div>

      {/* Hata Mesajı */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Ürün Listesi */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ürün
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Sahip
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Değer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {product.images && product.images.length > 0 ? (
                          <div className="relative h-12 w-12 rounded-lg overflow-hidden">
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">Resim yok</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.name}
                          {product.isUrgent && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              <FiClock size={10} className="mr-1" />
                              ACİL
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {product.conditionText}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiUser className="mr-2 text-gray-400" size={16} />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.owner.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {product.owner.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {product.category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ₺{product.estimatedValue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(product.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(product.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => showProductDetails(product)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="Detayları Görüntüle"
                    >
                      <FiEye />
                    </button>
                    {product.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproval(product._id, true)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Onayla"
                        >
                          <FiCheck />
                        </button>
                        <button
                          onClick={() => handleApproval(product._id, false)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Reddet"
                        >
                          <FiX />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sayfalama */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Önceki
              </button>
              
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Sayfa {currentPage} / {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ürün Detay Modal */}
      {showDetails && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ürün Detayları</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sol Taraf - Resimler */}
              <div>
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  <div className="space-y-2">
                    <div className="aspect-square relative overflow-hidden rounded-lg">
                      <Image
                        src={selectedProduct.images[0]}
                        alt={selectedProduct.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {selectedProduct.images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {selectedProduct.images.slice(1, 5).map((image, index) => (
                          <div key={index} className="aspect-square relative overflow-hidden rounded">
                            <Image
                              src={image}
                              alt={`${selectedProduct.name} ${index + 2}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">Resim yok</span>
                  </div>
                )}
              </div>

              {/* Sağ Taraf - Bilgiler */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedProduct.name}
                  </h4>
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(selectedProduct.status)}
                    {selectedProduct.isUrgent && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <FiClock size={12} className="mr-1" />
                        ACİL
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Kategori:</span>
                    <span className="text-gray-900 dark:text-white">{selectedProduct.category.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Durum:</span>
                    <span className="text-gray-900 dark:text-white">{selectedProduct.conditionText}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tahmini Değer:</span>
                    <span className="text-green-600 font-medium">₺{selectedProduct.estimatedValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Konum:</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedProduct.location.city}, {selectedProduct.location.district}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Sahip:</span>
                    <span className="text-gray-900 dark:text-white">{selectedProduct.owner.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">E-posta:</span>
                    <span className="text-gray-900 dark:text-white">{selectedProduct.owner.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Görüntülenme:</span>
                    <span className="text-gray-900 dark:text-white">{selectedProduct.views}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Beğeni:</span>
                    <span className="text-gray-900 dark:text-white">{selectedProduct.likesCount}</span>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Açıklama:</h5>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                {selectedProduct.status === 'pending' && (
                  <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Admin Notları
                      </label>
                      <textarea
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:bg-gray-700 dark:text-white"
                        placeholder="Onay/red sebebi..."
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => handleApproval(selectedProduct._id, false)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Reddet
                      </button>
                      <button
                        onClick={() => handleApproval(selectedProduct._id, true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Onayla
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExchangeManagement;
