'use client'

import { useState, useEffect } from 'react'
import { FiEdit, FiEye, FiSearch, FiRefreshCw, FiPlus, FiTrash2 } from 'react-icons/fi'
import Link from 'next/link'
import Image from 'next/image'
import SafeImage from '@/components/SafeImage'
import AuctionFormModal from './AuctionFormModal'
import DeleteConfirmModal from './DeleteConfirmModal'

interface ProductImage {
  url: string
  alt: string
}

interface Auction {
  _id: string
  productId: {
    _id: string
    name: string
    images: (string | ProductImage)[]
  }
  startPrice: number
  currentPrice: number
  reservePrice: number
  minIncrement: number
  startTime: string
  endTime: string
  status: string
  bidCount: number
  highestBidder?: {
    name: string
    email: string
  }
}

export default function AuctionManagement() {
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Tarayıcıya özgü kod
    }
  }, [])

  useEffect(() => {
    fetchAuctions()
  }, [])

  const fetchAuctions = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Admin bilgilerini localStorage'dan al
      let token = '';
      if (typeof window !== 'undefined') {
        const adminData = localStorage.getItem('admin');
        if (adminData) {
          const admin = JSON.parse(adminData);
          token = admin.token;
        }
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBaseUrl}/api/auctions`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Açık artırmalar getirilemedi')
      const data = await response.json()
      setAuctions(data.auctions || [])
    } catch (error) {
      console.error('Açık artırmaları getirme hatası:', error)
      setError('Açık artırmalar yüklenirken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAuction = async (auctionData: any) => {
    try {
      // Token'ı cookie'den al
      let token = '';

      // Önce authToken cookie'sinden dene
      const authTokenCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='));

      if (authTokenCookie) {
        token = authTokenCookie.split('=')[1];
      } else {
        // authToken yoksa adminToken'dan dene
        const adminTokenCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('adminToken='));

        if (adminTokenCookie) {
          token = adminTokenCookie.split('=')[1];
        } else {
          // Cookie'ler yoksa localStorage'dan kontrol et (fallback)
          if (typeof window !== 'undefined') {
            const adminData = localStorage.getItem('admin');
            if (adminData) {
              const admin = JSON.parse(adminData);
              token = admin.token;
            }
          }
        }
      }

      console.log('Kullanılacak token:', token ? `${token.substring(0, 20)}...` : 'Token yok');

      // Tarih formatını düzelt
      const formattedData = {
        ...auctionData,
        startTime: new Date(auctionData.startTime).toISOString(),
        endTime: new Date(auctionData.endTime).toISOString(),
      };

      console.log('Açık artırma oluşturma verileri:', formattedData);

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBaseUrl}/api/auctions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formattedData),
      });

      const data = await response.json();
      console.log('Açık artırma oluşturma yanıtı:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Açık artırma oluşturulurken bir hata oluştu');
      }

      if (!data.success) {
        throw new Error(data.message || 'Açık artırma oluşturulurken bir hata oluştu');
      }

      setSuccess('Açık artırma başarıyla oluşturuldu')
      setShowCreateModal(false)
      fetchAuctions()

      // 3 saniye sonra başarı mesajını temizle
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Açık artırma oluşturma hatası:', err)
      setError(err.message || 'Açık artırma oluşturulurken bir hata oluştu')
    }
  }

  const handleEditAuction = async (auctionData: any) => {
    if (!selectedAuction) return

    try {
      // Token'ı cookie'den al
      let token = '';

      const authTokenCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='));

      if (authTokenCookie) {
        token = authTokenCookie.split('=')[1];
      } else {
        const adminTokenCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('adminToken='));

        if (adminTokenCookie) {
          token = adminTokenCookie.split('=')[1];
        }
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBaseUrl}/api/auctions/${selectedAuction._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(auctionData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Açık artırma güncellenirken bir hata oluştu')
      }

      setSuccess('Açık artırma başarıyla güncellendi')
      setShowEditModal(false)
      fetchAuctions()

      // 3 saniye sonra başarı mesajını temizle
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Açık artırma güncelleme hatası:', err)
      setError(err.message || 'Açık artırma güncellenirken bir hata oluştu')
    }
  }

  const handleDeleteAuction = async () => {
    if (!selectedAuction) return

    try {
      // Token'ı cookie'den al
      let token = '';

      const authTokenCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='));

      if (authTokenCookie) {
        token = authTokenCookie.split('=')[1];
      } else {
        const adminTokenCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('adminToken='));

        if (adminTokenCookie) {
          token = adminTokenCookie.split('=')[1];
        }
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBaseUrl}/api/auctions/${selectedAuction._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Açık artırma silinirken bir hata oluştu')
      }

      setSuccess('Açık artırma başarıyla silindi')
      setShowDeleteModal(false)
      fetchAuctions()

      // 3 saniye sonra başarı mesajını temizle
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Açık artırma silme hatası:', err)
      setError(err.message || 'Açık artırma silinirken bir hata oluştu')
    }
  }

  const openEditModal = (auction: Auction) => {
    setSelectedAuction(auction)
    setShowEditModal(true)
  }

  const openDeleteModal = (auction: Auction) => {
    setSelectedAuction(auction)
    setShowDeleteModal(true)
  }

  const filteredAuctions = auctions.filter(auction => {
    // Ürün adı kontrolü
    const matchesSearch = auction.productId && auction.productId.name
      ? auction.productId.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true // Ürün adı yoksa filtreleme yapma

    // Durum kontrolü
    const matchesStatus = statusFilter === 'all' || auction.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'ended': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeLeft = (endTime: string) => {
    const end = new Date(endTime).getTime()
    const now = new Date().getTime()
    const diff = end - now

    if (diff <= 0) return 'Sona erdi'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days} gün ${hours} saat`
    if (hours > 0) return `${hours} saat ${minutes} dk`
    return `${minutes} dakika`
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Açık Artırma Yönetimi</h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Ürün ara..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          <select
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="pending">Beklemede</option>
            <option value="ended">Tamamlandı</option>
            <option value="cancelled">İptal Edildi</option>
          </select>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200"
          >
            <FiPlus className="mr-2" />
            Yeni Açık Artırma
          </button>

          <button
            onClick={fetchAuctions}
            className="flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <FiRefreshCw className="mr-2" />
            Yenile
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg">
          {success}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
        </div>
      ) : filteredAuctions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || statusFilter !== 'all'
              ? 'Arama kriterlerine uygun açık artırma bulunamadı.'
              : 'Henüz açık artırma bulunmuyor.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ürün
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fiyat Bilgisi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Zaman
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Teklifler
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAuctions.map((auction) => (
                <tr key={auction._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 relative">
                        <SafeImage
                          src={auction.productId?.images}
                          alt={auction.productId?.name || 'Ürün'}
                          fill
                          className="object-cover rounded-md"
                          fallbackText=""
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {auction.productId && auction.productId.name ? auction.productId.name : 'İsimsiz Ürün'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {auction._id && typeof auction._id === 'string' ? auction._id.substring(0, 8) : 'N/A'}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div>Başlangıç: {auction.startPrice.toLocaleString('tr-TR')} ₺</div>
                      <div>Güncel: <span className="font-bold">{auction.currentPrice.toLocaleString('tr-TR')} ₺</span></div>
                      {auction.reservePrice > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Rezerv: {auction.reservePrice.toLocaleString('tr-TR')} ₺
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div>Başlangıç: {formatDate(auction.startTime)}</div>
                      <div>Bitiş: {formatDate(auction.endTime)}</div>
                      {auction.status === 'active' && (
                        <div className="text-xs font-medium text-green-600 dark:text-green-400">
                          {getTimeLeft(auction.endTime)} kaldı
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(auction.status)}`}>
                      {auction.status === 'active' ? 'Aktif' :
                       auction.status === 'pending' ? 'Beklemede' :
                       auction.status === 'ended' ? 'Tamamlandı' :
                       auction.status === 'cancelled' ? 'İptal Edildi' : auction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div>{auction.bidCount || 0} teklif</div>
                      {auction.highestBidder && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          En yüksek: {auction.highestBidder.name}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        href={`/auctions/${auction._id}`}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        target="_blank"
                      >
                        <FiEye size={18} />
                      </Link>
                      <button
                        onClick={() => openEditModal(auction)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(auction)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Açık Artırma Oluşturma Modal */}
      <AuctionFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateAuction}
      />

      {/* Açık Artırma Düzenleme Modal */}
      {selectedAuction && (
        <AuctionFormModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditAuction}
          initialData={selectedAuction}
          isEditing={true}
        />
      )}

      {/* Açık Artırma Silme Modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAuction}
          title="Açık Artırmayı Sil"
          message={`"${selectedAuction?.productId && selectedAuction?.productId.name ? selectedAuction.productId.name : 'Seçili ürün'}" ürününe ait açık artırmayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        />
      )}
    </div>
  )
}