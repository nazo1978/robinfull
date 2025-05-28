import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiEye, FiSearch, FiFilter, FiEdit, FiTrash2 } from 'react-icons/fi';

interface Company {
  _id: string;
  companyName: string;
  commercialTitle: string;
  tradeRegistryNumber: string;
  email: string;
  phoneNumber: string;
  taxNumber: string;
  companyType: string;
  productCategory: string;
  address: {
    city: string;
    district: string;
    fullAddress: string;
  };
  referenceCode?: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: {
    _id: string;
    name: string;
    email: string;
  };
}

const CompanyManagement: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editFormData, setEditFormData] = useState({
    companyName: '',
    commercialTitle: '',
    tradeRegistryNumber: '',
    email: '',
    phoneNumber: '',
    taxNumber: '',
    companyType: '',
    productCategory: '',
    address: {
      city: '',
      district: '',
      fullAddress: ''
    },
    referenceCode: '',
    isActive: true
  });

  // Şirketleri getir
  const fetchCompanies = async () => {
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
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/admin/companies?${params}`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Şirketler getirilemedi');
      }

      const data = await response.json();
      setCompanies(data.companies || []);
      setTotalPages(data.pages || 1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Şirket onaylama/reddetme
  const handleApproval = async (companyId: string, isApproved: boolean) => {
    try {
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

      const response = await fetch(`/api/admin/companies/${companyId}/approve`, {
        method: 'PUT',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isApproved }),
      });

      if (!response.ok) {
        throw new Error('İşlem başarısız');
      }

      // Listeyi yenile
      fetchCompanies();

      // Başarı mesajı göster
      alert(`Şirket ${isApproved ? 'onaylandı' : 'reddedildi'}`);
    } catch (err: any) {
      alert(`Hata: ${err.message}`);
    }
  };

  // Şirket detaylarını göster
  const showCompanyDetails = (company: Company) => {
    setSelectedCompany(company);
    setShowDetails(true);
  };

  // Şirket düzenleme modalını aç
  const openEditModal = (company: Company) => {
    setEditingCompany(company);
    setEditFormData({
      companyName: company.companyName,
      commercialTitle: company.commercialTitle,
      tradeRegistryNumber: company.tradeRegistryNumber,
      email: company.email,
      phoneNumber: company.phoneNumber,
      taxNumber: company.taxNumber,
      companyType: company.companyType,
      productCategory: company.productCategory,
      address: company.address,
      referenceCode: company.referenceCode || '',
      isActive: company.isActive
    });
    setShowEditModal(true);
  };

  // Şirket düzenleme
  const handleEditCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;

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

      const response = await fetch(`/api/admin/companies/${editingCompany._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });

      if (!response.ok) {
        throw new Error('Şirket güncelleme başarısız');
      }

      // Listeyi yenile
      fetchCompanies();
      setShowEditModal(false);
      setEditingCompany(null);

      // Başarı mesajı göster
      alert('Şirket bilgileri başarıyla güncellendi');
    } catch (err: any) {
      alert(`Hata: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Şirket silme
  const handleDeleteCompany = async (companyId: string, companyName: string) => {
    if (!confirm(`"${companyName}" şirketini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

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

      const response = await fetch(`/api/admin/companies/${companyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Şirket silme başarısız');
      }

      // Listeyi yenile
      fetchCompanies();

      // Başarı mesajı göster
      alert('Şirket başarıyla silindi');
    } catch (err: any) {
      alert(`Hata: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Form input değişikliklerini handle et
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setEditFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, statusFilter]);

  // Arama işlemi
  const handleSearch = () => {
    setCurrentPage(1);
    fetchCompanies();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Şirket Yönetimi</h2>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Arama ve Filtreleme */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Şirket adı, email veya vergi numarası ile ara..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">Tüm Durumlar</option>
              <option value="approved">Onaylı</option>
              <option value="pending">Beklemede</option>
            </select>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
            >
              <FiSearch />
              Ara
            </button>
          </div>
        </div>
      </div>

      {/* Şirket Listesi */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Şirket Bilgileri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İletişim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kayıt Tarihi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.map((company) => (
                <tr key={company._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {company.companyName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {company.commercialTitle}
                      </div>
                      <div className="text-sm text-gray-500">
                        VKN: {company.taxNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        TSN: {company.tradeRegistryNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {company.companyType}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{company.email}</div>
                    <div className="text-sm text-gray-500">{company.phoneNumber}</div>
                    <div className="text-sm text-gray-500">
                      {company.address.city} / {company.address.district}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{company.productCategory}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        company.isApproved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {company.isApproved ? 'Onaylı' : 'Beklemede'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(company.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => showCompanyDetails(company)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="Detayları Görüntüle"
                    >
                      <FiEye />
                    </button>
                    <button
                      onClick={() => openEditModal(company)}
                      className="text-yellow-600 hover:text-yellow-900 p-1"
                      title="Düzenle"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteCompany(company._id, company.companyName)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Sil"
                    >
                      <FiTrash2 />
                    </button>
                    {!company.isApproved && (
                      <button
                        onClick={() => handleApproval(company._id, true)}
                        className="text-green-600 hover:text-green-900 p-1"
                        title="Onayla"
                      >
                        <FiCheck />
                      </button>
                    )}
                    {company.isApproved && (
                      <button
                        onClick={() => handleApproval(company._id, false)}
                        className="text-orange-600 hover:text-orange-900 p-1"
                        title="Onayı Kaldır"
                      >
                        <FiX />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {companies.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Şirket bulunamadı
          </div>
        )}
      </div>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Önceki
          </button>
          <span className="px-3 py-2">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sonraki
          </button>
        </div>
      )}

      {/* Şirket Detay Modal */}
      {showDetails && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Şirket Detayları</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Şirket Adı</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCompany.companyName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ticari Ünvan</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCompany.commercialTitle}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">E-posta</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCompany.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefon</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCompany.phoneNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vergi Kimlik No</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCompany.taxNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ticaret Sicil No</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCompany.tradeRegistryNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Şirket Türü</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCompany.companyType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ürün Kategorisi</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCompany.productCategory}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Şehir</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCompany.address.city}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">İlçe</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCompany.address.district}</p>
                </div>
              </div>

              {selectedCompany.address.fullAddress && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tam Adres</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCompany.address.fullAddress}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCompany.referenceCode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Referans Kodu</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedCompany.referenceCode}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kayıt Tarihi</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedCompany.createdAt).toLocaleString('tr-TR')}
                  </p>
                </div>
                {selectedCompany.approvedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Onay Tarihi</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedCompany.approvedAt).toLocaleString('tr-TR')}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                {!selectedCompany.isApproved ? (
                  <button
                    onClick={() => {
                      handleApproval(selectedCompany._id, true);
                      setShowDetails(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Onayla
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleApproval(selectedCompany._id, false);
                      setShowDetails(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Onayı Kaldır
                  </button>
                )}
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Şirket Düzenleme Modal */}
      {showEditModal && editingCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Şirket Düzenle</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleEditCompany} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Şirket Adı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şirket Adı
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={editFormData.companyName}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Ticari Ünvan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ticari Ünvan
                  </label>
                  <input
                    type="text"
                    name="commercialTitle"
                    value={editFormData.commercialTitle}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* E-posta */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Telefon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={editFormData.phoneNumber}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Vergi Kimlik No */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vergi Kimlik No
                  </label>
                  <input
                    type="text"
                    name="taxNumber"
                    value={editFormData.taxNumber}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Ticaret Sicil No */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ticaret Sicil No
                  </label>
                  <input
                    type="text"
                    name="tradeRegistryNumber"
                    value={editFormData.tradeRegistryNumber}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Şirket Türü */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şirket Türü
                  </label>
                  <select
                    name="companyType"
                    value={editFormData.companyType}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seçiniz</option>
                    <option value="Anonim Sirket">Anonim Şirket</option>
                    <option value="Limited Sirket">Limited Şirket</option>
                    <option value="Kollektif Sirket">Kollektif Şirket</option>
                    <option value="Komandit Sirket">Komandit Şirket</option>
                    <option value="Kooperatif">Kooperatif</option>
                    <option value="Sahis Sirketi">Şahıs Şirketi</option>
                    <option value="Diger">Diğer</option>
                  </select>
                </div>

                {/* Ürün Kategorisi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ürün Kategorisi
                  </label>
                  <select
                    name="productCategory"
                    value={editFormData.productCategory}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seçiniz</option>
                    <option value="Elektronik">Elektronik</option>
                    <option value="Giyim">Giyim</option>
                    <option value="Ev & Yasam">Ev & Yaşam</option>
                    <option value="Spor & Outdoor">Spor & Outdoor</option>
                    <option value="Kitap & Muzik">Kitap & Müzik</option>
                    <option value="Oyuncak">Oyuncak</option>
                    <option value="Kozmetik">Kozmetik</option>
                    <option value="Otomotiv">Otomotiv</option>
                    <option value="Bahce & Yapi Market">Bahçe & Yapı Market</option>
                    <option value="Diger">Diğer</option>
                  </select>
                </div>

                {/* Şehir */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şehir
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={editFormData.address.city}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* İlçe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İlçe
                  </label>
                  <input
                    type="text"
                    name="address.district"
                    value={editFormData.address.district}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Referans Kodu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referans Kodu
                  </label>
                  <input
                    type="text"
                    name="referenceCode"
                    value={editFormData.referenceCode}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Tam Adres */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tam Adres
                </label>
                <textarea
                  name="address.fullAddress"
                  value={editFormData.address.fullAddress}
                  onChange={handleEditFormChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Aktif Durumu */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={editFormData.isActive}
                  onChange={handleEditFormChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Şirket Aktif
                </label>
              </div>

              {/* Butonlar */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Güncelleniyor...' : 'Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyManagement;
